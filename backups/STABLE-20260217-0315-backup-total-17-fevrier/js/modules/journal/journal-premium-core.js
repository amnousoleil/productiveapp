/**
 * JOURNAL PREMIUM CORE v4.0
 * Logique, état, IA, statistiques
 * Citations Maha Giri + Analyse complète Forces/Faiblesses + PsychoAudit
 */

const JournalPremiumCore = (function() {
    'use strict';

    // État global du module
    const state = {
        entries: [],          // Entrées du jour
        weekData: [],         // Données 7 derniers jours
        extendedHistory: [],  // Historique 30 jours
        activeTab: 'all',     // 'all' | 'morning' | 'evening'
        selectedCategory: 'task',
        selectedEnergy: 2,
        isLoading: false,
        streak: 0,
        todayCount: 0
    };

    // Citations Maha Giri — simples, directes, puissantes
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

    /**
     * Charger les entrées du jour
     */
    async function loadTodayEntries() {
        state.isLoading = true;
        try {
            if (!ApiJournal || !ApiJournal.isAvailable()) return [];
            const entries = await ApiJournal.getTodayEntries();
            state.entries = entries || [];
            state.todayCount = state.entries.length;
            return state.entries;
        } catch (e) {
            console.error('❌ JournalPremiumCore.load:', e);
            return [];
        } finally {
            state.isLoading = false;
        }
    }

    /**
     * Charger les données de la semaine (heatmap + énergie)
     */
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

    /**
     * Charger l'historique étendu (30 jours) pour l'analyse IA
     */
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

    /**
     * Calculer le streak (jours consécutifs)
     */
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

    /**
     * Ajouter une nouvelle entrée
     */
    async function addEntry(text, category, energy, tab) {
        if (!text?.trim()) throw new Error('Texte requis');
        const entry = {
            text: text.trim(),
            category: category || state.selectedCategory,
            energy: energy || state.selectedEnergy,
            date: new Date().toISOString().split('T')[0],
            context: tab === 'morning' ? 'morning_intention' :
                     tab === 'evening' ? 'evening_reflection' : 'general'
        };
        const result = await ApiJournal.upsertEntry(entry);
        if (result) {
            await loadTodayEntries();
        }
        return result;
    }

    /**
     * Supprimer une entrée
     */
    async function deleteEntry(id) {
        await ApiJournal.deleteEntry(id);
        state.entries = state.entries.filter(e => e.id !== id);
    }

    /**
     * Obtenir les entrées filtrées par tab
     */
    function getFilteredEntries(tab = 'all') {
        if (tab === 'all') return state.entries;
        const ctx = tab === 'morning' ? 'morning_intention' : 'evening_reflection';
        return state.entries.filter(e => {
            if (e.context) return e.context === ctx;
            const entryHour = new Date(e.created_at || Date.now()).getHours();
            return tab === 'morning' ? entryHour < 14 : entryHour >= 14;
        });
    }

    /**
     * Citation aléatoire du jour (déterministe selon la date)
     */
    function getDailyQuote() {
        const day = new Date().getDate() + new Date().getMonth() * 31;
        return QUOTES[day % QUOTES.length];
    }

    /**
     * Obtenir les stats du jour
     */
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

    /**
     * Générer un insight IA rapide sur le journal du jour
     */
    async function generateAiInsight() {
        if (!ApiAi?.generate) return null;
        const entries = state.entries.slice(0, 5);
        if (entries.length < 2) return null;

        const summary = entries.map(e =>
            `[${e.category}] "${e.text.slice(0, 80)}" (énergie: ${e.energy})`
        ).join('\n');

        const prompt = `Voici mes entrées de journal du jour :\n${summary}\n\nEn 2 phrases max, donne-moi un insight percutant sur ma journée et une recommandation actionnable.`;
        const system = `Tu es Maha Giri, coach de haut niveau. Tu es direct, concis, sans fioritures. Tu parles vrai. Réponds en français.`;

        return await ApiAi.generate(prompt, system);
    }

    /**
     * Générer une analyse IA complète (Forces / Faiblesses / Patterns / Connexion PsychoAudit)
     */
    async function generateFullAnalysis() {
        if (!ApiAi?.generate) return null;

        // Charger l'historique étendu si pas encore fait
        if (!state.extendedHistory.length) {
            await loadExtendedHistory(30);
        }

        const entries = state.extendedHistory;
        if (entries.length < 3) return null;

        // Stats agrégées sur 30 jours
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

        // Données PsychoAudit si disponibles
        let auditContext = '';
        try {
            const paState = typeof PaState !== 'undefined' ? PaState : null;
            if (paState && paState.scores && Object.keys(paState.scores).length > 0) {
                const topAxes = Object.entries(paState.scores)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([ax, sc]) => `${ax}: ${sc}/5`);
                const lowAxes = Object.entries(paState.scores)
                    .sort((a, b) => a[1] - b[1])
                    .slice(0, 3)
                    .map(([ax, sc]) => `${ax}: ${sc}/5`);
                auditContext = `\n\nDonnées Psycho-Audit disponibles:\n- Points forts: ${topAxes.join(', ')}\n- Points fragiles: ${lowAxes.join(', ')}`;
            }
        } catch(e) {}

        const sampleEntries = entries.slice(0, 15).map(e =>
            `[${e.category}] "${e.text.slice(0, 80)}"`
        ).join('\n');

        const prompt = `Analyse de journal personnel sur ${totalEntries} entrées des 30 derniers jours.

STATISTIQUES:
- Victoires notées: ${catCount.win}
- Idées notées: ${catCount.idea}
- Blocages identifiés: ${catCount.blocker}
- Tâches: ${catCount.task}
- Réflexions: ${catCount.reflection}
- Énergie moyenne: ${avgEnergy}/3
${auditContext}

ÉCHANTILLON D'ENTRÉES:
${sampleEntries}

Génère une analyse structurée avec exactement ce format JSON:
{
  "forces": ["force 1 (max 10 mots)", "force 2", "force 3"],
  "faiblesses": ["faiblesse 1 (max 10 mots)", "faiblesse 2", "faiblesse 3"],
  "patterns": ["pattern 1 (une observation comportementale concrète)", "pattern 2"],
  "recommandations": ["recommandation 1 actionnable", "recommandation 2", "recommandation 3"],
  "score_energie": ${avgEnergy},
  "message_coach": "Message court et percutant (max 2 phrases) comme Maha Giri: direct, vrai, aidant.",
  "lien_psychoaudit": "Si données psychoaudit disponibles, connexion en 1 phrase. Sinon: null."
}

Réponds UNIQUEMENT avec le JSON valide, rien d'autre.`;

        const system = `Tu es Maha Giri, coach expert en développement humain et productivité. Tu analyses avec précision, tu parles sans détour, tu aides vraiment. Réponds toujours en JSON valide.`;

        try {
            const response = await ApiAi.generate(prompt, system);
            // Extraire le JSON de la réponse
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return null;
        } catch(e) {
            console.error('❌ generateFullAnalysis parse error:', e);
            return null;
        }
    }

    return {
        state,
        loadTodayEntries,
        loadWeekData,
        loadExtendedHistory,
        calculateStreak,
        addEntry,
        deleteEntry,
        getFilteredEntries,
        getDailyQuote,
        getTodayStats,
        generateAiInsight,
        generateFullAnalysis
    };
})();

if (typeof window !== 'undefined') window.JournalPremiumCore = JournalPremiumCore;
