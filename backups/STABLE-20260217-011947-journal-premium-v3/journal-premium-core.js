/**
 * JOURNAL PREMIUM CORE v3.0
 * Logique, état, IA, statistiques
 */

const JournalPremiumCore = (function() {
    'use strict';

    // État global du module
    const state = {
        entries: [],          // Entrées du jour
        weekData: [],         // Données 7 derniers jours
        activeTab: 'all',     // 'all' | 'morning' | 'evening'
        selectedCategory: 'task',
        selectedEnergy: 2,
        isLoading: false,
        streak: 0,
        todayCount: 0
    };

    // Citations pour les esprits brillants
    const QUOTES = [
        { text: "La créativité, c'est l'intelligence qui s'amuse.", author: "Albert Einstein" },
        { text: "Le secret du changement, c'est de concentrer son énergie non pas à lutter contre l'ancien, mais à construire le nouveau.", author: "Socrate" },
        { text: "Ce que nous faisons de temps libre détermine ce que nous deviendrons.", author: "Carl Sandburg" },
        { text: "Écrire, c'est une façon de clarifier sa pensée.", author: "William Zinsser" },
        { text: "La réflexion quotidienne est le fondement de la sagesse.", author: "Marcus Aurelius" },
        { text: "Chaque matin nous naissons à nouveau. Ce que nous faisons aujourd'hui est ce qui compte le plus.", author: "Bouddha" },
        { text: "Les notes sont les semences d'idées futures.", author: "Linus Pauling" },
        { text: "Trackez votre progrès. Vous ne pouvez pas améliorer ce que vous ne mesurez pas.", author: "Peter Drucker" },
        { text: "La discipline est le pont entre les objectifs et les accomplissements.", author: "Jim Rohn" },
        { text: "Un journal n'est pas un luxe, c'est une nécessité.", author: "Virginia Woolf" }
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
            // Charger les entrées pour chaque jour
            const allEntries = await ApiJournal.getEntries({
                startDate: days[0].date,
                endDate: days[6].date
            });
            // Agréger par date
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
     * Calculer le streak (jours consécutifs)
     */
    async function calculateStreak() {
        const week = state.weekData.length ? state.weekData : await loadWeekData();
        let streak = 0;
        // Compter depuis aujourd'hui en remontant
        for (let i = week.length - 1; i >= 0; i--) {
            if (week[i].count > 0) streak++;
            else if (i < week.length - 1) break; // Cassure du streak
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
        const hour = new Date().getHours();
        // Filtre par contexte ou par heure si contexte non défini
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
            blockers: entries.filter(e => e.category === 'blocker').length
        };
    }

    /**
     * Générer des insights IA sur le journal
     */
    async function generateAiInsight() {
        if (!ApiAi?.generate) return null;
        const entries = state.entries.slice(0, 5);
        if (entries.length < 2) return null;

        const summary = entries.map(e =>
            `[${e.category}] "${e.text.slice(0, 80)}" (énergie: ${e.energy})`
        ).join('\n');

        const prompt = `Voici mes entrées de journal du jour :\n${summary}\n\nEn 2 phrases max, donne-moi un insight percutant sur ma journée et une recommandation actionnable.`;
        const system = `Tu es un coach de productivité de haut niveau. Sois direct, concis, inspirant. Réponds en français.`;

        return await ApiAi.generate(prompt, system);
    }

    return {
        state,
        loadTodayEntries,
        loadWeekData,
        calculateStreak,
        addEntry,
        deleteEntry,
        getFilteredEntries,
        getDailyQuote,
        getTodayStats,
        generateAiInsight
    };
})();

if (typeof window !== 'undefined') window.JournalPremiumCore = JournalPremiumCore;
