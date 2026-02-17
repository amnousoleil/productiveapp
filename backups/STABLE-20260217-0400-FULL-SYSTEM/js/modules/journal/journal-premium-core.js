/**
 * JOURNAL PREMIUM CORE v5.0
 * Moteur complet : Navigation temporelle, IA contextuelle, Patterns, Analytics
 * Résolution de problèmes profonds via l'écriture + intelligence artificielle
 */

const JournalPremiumCore = (function() {
    'use strict';

    // ─── ÉTAT GLOBAL ──────────────────────────────────────────────────────────
    const state = {
        entries: [],          // Entrées du jour courant
        currentDate: new Date().toISOString().split('T')[0], // Date affichée
        weekData: [],         // Données 7 derniers jours
        extendedHistory: [],  // Historique 30 jours
        activeTab: 'all',
        selectedCategory: 'task',
        selectedEnergy: 2,
        isLoading: false,
        streak: 0,
        todayCount: 0,
        victories: [],        // Toutes les victoires
        patterns: null        // Patterns détectés par IA
    };

    // ─── CITATIONS MAHA GIRI ─────────────────────────────────────────────────
    const QUOTES = [
        { text: "Commence. Le reste vient après.", author: "Maha Giri" },
        { text: "Un mot noté vaut mieux que dix oubliés.", author: "Maha Giri" },
        { text: "La clarté ne se donne pas. Elle se construit, ligne après ligne.", author: "Maha Giri" },
        { text: "Ce que tu observes en toi, tu peux le transformer.", author: "Maha Giri" },
        { text: "Agis. Note. Apprends. Recommence.", author: "Maha Giri" },
        { text: "Ton énergie est une ressource. Utilise-la avec intention.", author: "Maha Giri" },
        { text: "La fatigue dit 'arrête'. La sagesse dit 'ajuste'.", author: "Maha Giri" },
        { text: "Chaque blocage est une information. Écoute-la.", author: "Maha Giri" },
        { text: "Une journée bien observée est une journée mieux vécue.", author: "Maha Giri" },
        { text: "Ce que tu ne mesures pas, tu ne peux pas l'améliorer.", author: "Maha Giri" },
        { text: "Ton présent d'aujourd'hui façonne ta réalité de demain.", author: "Maha Giri" },
        { text: "Petit progrès quotidien. Grand changement certain.", author: "Maha Giri" },
        { text: "La discipline n'est pas une contrainte. C'est une liberté.", author: "Maha Giri" },
        { text: "Note tes victoires. Elles te montrent qui tu deviens.", author: "Maha Giri" },
        { text: "Moins de plans. Plus d'action. Plus de notes.", author: "Maha Giri" }
    ];

    // ─── NAVIGATION TEMPORELLE ────────────────────────────────────────────────

    function todayStr() {
        return new Date().toISOString().split('T')[0];
    }

    function isToday() {
        return state.currentDate === todayStr();
    }

    function formatDateLabel(dateStr) {
        const d = new Date(dateStr + 'T12:00:00');
        const today = todayStr();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];
        if (dateStr === today) return "Aujourd'hui";
        if (dateStr === yStr) return 'Hier';
        return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    function navigateDay(delta) {
        const d = new Date(state.currentDate + 'T12:00:00');
        d.setDate(d.getDate() + delta);
        const newDate = d.toISOString().split('T')[0];
        // Ne pas aller dans le futur
        if (newDate > todayStr()) return false;
        state.currentDate = newDate;
        return true;
    }

    function setDate(dateStr) {
        if (dateStr > todayStr()) return false;
        state.currentDate = dateStr;
        return true;
    }

    // ─── CHARGEMENT DONNÉES ───────────────────────────────────────────────────

    async function loadEntriesForDate(dateStr) {
        state.isLoading = true;
        try {
            if (!ApiJournal || !ApiJournal.isAvailable()) return [];
            const entries = await ApiJournal.getEntriesForDate(dateStr);
            state.entries = entries || [];
            if (dateStr === todayStr()) {
                state.todayCount = state.entries.length;
            }
            return state.entries;
        } catch (e) {
            console.error('❌ JournalPremiumCore.loadEntriesForDate:', e);
            return [];
        } finally {
            state.isLoading = false;
        }
    }

    async function loadTodayEntries() {
        return loadEntriesForDate(state.currentDate);
    }

    async function loadWeekData() {
        try {
            if (!ApiJournal || !ApiJournal.isAvailable()) return [];
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                days.push({
                    date: d.toISOString().split('T')[0],
                    label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 2),
                    isToday: i === 0,
                    isSelected: d.toISOString().split('T')[0] === state.currentDate,
                    count: 0,
                    avgEnergy: 0
                });
            }
            const allEntries = await ApiJournal.getEntries({
                startDate: days[0].date,
                endDate: days[6].date
            });
            (allEntries || []).forEach(e => {
                const dayStr = (e.date || e.created_at || '').split('T')[0];
                const day = days.find(d => d.date === dayStr);
                if (day) {
                    day.count++;
                    day.avgEnergy = (day.avgEnergy * (day.count - 1) + (e.energy || 2)) / day.count;
                }
            });
            state.weekData = days;
            return days;
        } catch (e) {
            console.error('❌ JournalPremiumCore.loadWeek:', e);
            return [];
        }
    }

    async function loadExtendedHistory(days = 30) {
        try {
            if (!ApiJournal || !ApiJournal.isAvailable()) return [];
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - days);
            const entries = await ApiJournal.getEntries({
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0]
            });
            state.extendedHistory = entries || [];
            return state.extendedHistory;
        } catch (e) {
            console.error('❌ JournalPremiumCore.loadExtended:', e);
            return [];
        }
    }

    async function calculateStreak() {
        const week = state.weekData.length ? state.weekData : await loadWeekData();
        let streak = 0;
        for (let i = week.length - 1; i >= 0; i--) {
            if (week[i].count > 0) streak++;
            else if (i < week.length - 1) break;
        }
        state.streak = streak;
        return streak;
    }

    // ─── VICTORIES VAULT ─────────────────────────────────────────────────────

    async function loadVictories(days = 30) {
        const history = state.extendedHistory.length ? state.extendedHistory : await loadExtendedHistory(days);
        state.victories = history.filter(e => e.category === 'win');
        return state.victories;
    }

    // ─── ACTIONS CRUD ─────────────────────────────────────────────────────────

    async function addEntry(text, category, energy, tab) {
        if (!text?.trim()) throw new Error('Texte requis');
        const entry = {
            text: text.trim(),
            category: category || state.selectedCategory,
            energy: energy || state.selectedEnergy,
            date: state.currentDate,
            context: tab === 'morning' ? 'morning_intention' :
                     tab === 'evening' ? 'evening_reflection' : 'general'
        };
        const result = await ApiJournal.upsertEntry(entry);
        if (result) {
            await loadEntriesForDate(state.currentDate);
        }
        return result;
    }

    async function deleteEntry(id) {
        await ApiJournal.deleteEntry(id, state.currentDate);
        state.entries = state.entries.filter(e => e.id !== id);
    }

    // ─── FILTRES ──────────────────────────────────────────────────────────────

    function getFilteredEntries(tab = 'all') {
        if (tab === 'all') return state.entries;
        const ctx = tab === 'morning' ? 'morning_intention' : 'evening_reflection';
        return state.entries.filter(e => {
            if (e.context) return e.context === ctx;
            const entryHour = new Date(e.created_at || Date.now()).getHours();
            return tab === 'morning' ? entryHour < 14 : entryHour >= 14;
        });
    }

    // ─── STATS ────────────────────────────────────────────────────────────────

    function getDailyQuote() {
        const day = new Date().getDate() + new Date().getMonth() * 31;
        return QUOTES[day % QUOTES.length];
    }

    function getTodayStats() {
        const entries = state.entries;
        return {
            total: entries.length,
            wins: entries.filter(e => e.category === 'win').length,
            ideas: entries.filter(e => e.category === 'idea').length,
            blockers: entries.filter(e => e.category === 'blocker').length,
            tasks: entries.filter(e => e.category === 'task').length,
            reflections: entries.filter(e => e.category === 'reflection').length
        };
    }

    // ─── IA : RÉPONSE PAR ENTRÉE ──────────────────────────────────────────────
    /**
     * Maha Giri répond à UNE entrée spécifique — réponse immédiate, contextuelle, courte
     */
    async function getAiResponse(entry) {
        if (!ApiAi?.generate) return null;

        const catLabels = {
            task: 'tâche', idea: 'idée', win: 'victoire',
            blocker: 'blocage', reflection: 'réflexion'
        };
        const energyLabels = { 1: 'basse', 2: 'normale', 3: 'haute' };

        const prompt = `L'utilisateur vient d'écrire cette entrée de journal :
Catégorie : ${catLabels[entry.category] || entry.category}
Énergie : ${energyLabels[entry.energy] || entry.energy}/3
Texte : "${entry.text}"

Réponds en 1-2 phrases max. Sois direct, percutant, aidant. Pas de platitude.`;

        const system = `Tu es Maha Giri, coach de haut niveau. Direct. Vrai. Sans fioritures.
Règle : jamais de "je comprends", jamais de "bien sûr", jamais de validation creuse.
Si c'est une victoire : fais-en un levier pour aller plus loin.
Si c'est un blocage : nomme ce qui se passe vraiment et propose une action concrète.
Si c'est une idée : challenge-la ou amplifie-la.
Réponds en français. Max 2 phrases.`;

        try {
            return await ApiAi.generate(prompt, system);
        } catch (e) {
            return null;
        }
    }

    // ─── IA : INSIGHT RAPIDE DU JOUR ──────────────────────────────────────────
    async function generateAiInsight() {
        if (!ApiAi?.generate) return null;
        const entries = state.entries.slice(0, 5);
        if (entries.length < 2) return null;

        const summary = entries.map(e =>
            `[${e.category}] "${e.text.slice(0, 80)}" (énergie: ${e.energy})`
        ).join('\n');

        const prompt = `Mes entrées journal d'aujourd'hui :\n${summary}\n\nEn 2 phrases max : un insight percutant sur ma journée + une recommandation actionnable.`;
        const system = `Tu es Maha Giri. Direct, concis, sans fioritures. Réponds en français.`;

        return await ApiAi.generate(prompt, system);
    }

    // ─── IA : DÉTECTION DE PATTERNS ───────────────────────────────────────────
    /**
     * Analyse 7-30 jours et détecte les schémas récurrents (blocages, pics d'énergie, etc.)
     */
    async function detectPatterns() {
        if (!ApiAi?.generate) return null;

        if (!state.extendedHistory.length) {
            await loadExtendedHistory(30);
        }

        const entries = state.extendedHistory;
        if (entries.length < 5) return null;

        // Grouper par jour de la semaine
        const byWeekday = [[], [], [], [], [], [], []];
        const byHour = {};
        let blockerTexts = [];
        let winTexts = [];

        entries.forEach(e => {
            const d = new Date(e.created_at || e.date + 'T12:00:00');
            const wd = d.getDay();
            byWeekday[wd].push(e.energy || 2);

            const h = d.getHours();
            if (!byHour[h]) byHour[h] = { count: 0, energy: 0 };
            byHour[h].count++;
            byHour[h].energy += (e.energy || 2);

            if (e.category === 'blocker') blockerTexts.push(e.text.slice(0, 60));
            if (e.category === 'win') winTexts.push(e.text.slice(0, 60));
        });

        const weekdayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const energyByDay = byWeekday.map((energies, i) => ({
            day: weekdayNames[i],
            avg: energies.length ? (energies.reduce((a, b) => a + b, 0) / energies.length).toFixed(1) : null,
            count: energies.length
        })).filter(d => d.count > 0);

        const prompt = `Analyse mes données journal sur ${entries.length} entrées :

ÉNERGIE PAR JOUR DE SEMAINE :
${energyByDay.map(d => `${d.day}: ${d.avg}/3 (${d.count} entrées)`).join(', ')}

BLOCAGES RÉCENTS : ${blockerTexts.slice(0, 5).join(' | ') || 'aucun'}
VICTOIRES RÉCENTES : ${winTexts.slice(0, 5).join(' | ') || 'aucune'}

Génère EXACTEMENT ce JSON (rien d'autre) :
{
  "patterns": [
    {"icon": "⚡", "titre": "titre court", "description": "observation concrète en 1 phrase"},
    {"icon": "🔁", "titre": "titre court", "description": "observation concrète en 1 phrase"},
    {"icon": "🎯", "titre": "titre court", "description": "observation concrète en 1 phrase"}
  ],
  "alerte": "Si tu détectes un schéma problématique urgent, écris-le en 1 phrase. Sinon null.",
  "force_cachee": "Un point fort que l'utilisateur ne voit peut-être pas, en 1 phrase."
}`;

        const system = `Tu es un analyste comportemental expert. Tu détectes des patterns réels dans les données. JSON valide uniquement.`;

        try {
            const response = await ApiAi.generate(prompt, system);
            const match = response.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
            return null;
        } catch (e) {
            console.error('❌ detectPatterns parse error:', e);
            return null;
        }
    }

    // ─── IA : ANALYSE COMPLÈTE 30J ────────────────────────────────────────────
    async function generateFullAnalysis() {
        if (!ApiAi?.generate) return null;

        if (!state.extendedHistory.length) {
            await loadExtendedHistory(30);
        }

        const entries = state.extendedHistory;
        if (entries.length < 3) return null;

        const catCount = { task: 0, idea: 0, win: 0, blocker: 0, reflection: 0 };
        let totalEnergy = 0;
        const themes = [];

        entries.forEach(e => {
            if (catCount[e.category] !== undefined) catCount[e.category]++;
            totalEnergy += (e.energy || 2);
            themes.push(e.text.slice(0, 60));
        });

        const avgEnergy = (totalEnergy / entries.length).toFixed(1);
        const totalEntries = entries.length;

        let auditContext = '';
        try {
            const paState = typeof PaState !== 'undefined' ? PaState : null;
            if (paState && paState.scores && Object.keys(paState.scores).length > 0) {
                const topAxes = Object.entries(paState.scores)
                    .sort((a, b) => b[1] - a[1]).slice(0, 3)
                    .map(([ax, sc]) => `${ax}: ${sc}/5`);
                const lowAxes = Object.entries(paState.scores)
                    .sort((a, b) => a[1] - b[1]).slice(0, 3)
                    .map(([ax, sc]) => `${ax}: ${sc}/5`);
                auditContext = `\n\nDonnées Psycho-Audit :\n- Points forts: ${topAxes.join(', ')}\n- Points fragiles: ${lowAxes.join(', ')}`;
            }
        } catch(e) {}

        const sampleEntries = entries.slice(0, 15).map(e =>
            `[${e.category}] "${e.text.slice(0, 80)}"`
        ).join('\n');

        const prompt = `Analyse de journal personnel sur ${totalEntries} entrées des 30 derniers jours.

STATISTIQUES:
- Victoires: ${catCount.win} | Idées: ${catCount.idea} | Blocages: ${catCount.blocker}
- Tâches: ${catCount.task} | Réflexions: ${catCount.reflection}
- Énergie moyenne: ${avgEnergy}/3
${auditContext}

ÉCHANTILLON:
${sampleEntries}

JSON UNIQUEMENT :
{
  "forces": ["force 1 (max 10 mots)", "force 2", "force 3"],
  "faiblesses": ["faiblesse 1", "faiblesse 2", "faiblesse 3"],
  "patterns": ["pattern comportemental 1", "pattern 2"],
  "recommandations": ["action 1 concrète", "action 2", "action 3"],
  "score_energie": ${avgEnergy},
  "message_coach": "Message Maha Giri : direct, vrai, aidant. Max 2 phrases.",
  "lien_psychoaudit": "Connexion PsychoAudit si données dispo, sinon null."
}`;

        const system = `Tu es Maha Giri, coach expert. Analyse précise, parole sans détour. JSON valide uniquement.`;

        try {
            const response = await ApiAi.generate(prompt, system);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            return null;
        } catch(e) {
            console.error('❌ generateFullAnalysis:', e);
            return null;
        }
    }

    // ─── PUBLIC API ───────────────────────────────────────────────────────────
    return {
        state,
        loadEntriesForDate,
        loadTodayEntries,
        loadWeekData,
        loadExtendedHistory,
        calculateStreak,
        loadVictories,
        addEntry,
        deleteEntry,
        getFilteredEntries,
        getDailyQuote,
        getTodayStats,
        getAiResponse,
        generateAiInsight,
        detectPatterns,
        generateFullAnalysis,
        navigateDay,
        setDate,
        isToday,
        formatDateLabel,
        todayStr
    };
})();

if (typeof window !== 'undefined') window.JournalPremiumCore = JournalPremiumCore;
