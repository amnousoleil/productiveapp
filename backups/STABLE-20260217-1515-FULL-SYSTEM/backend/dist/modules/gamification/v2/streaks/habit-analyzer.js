"use strict";
/**
 * Habit Analyzer - Analyse des patterns d'activité
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeHabits = analyzeHabits;
exports.aggregateByDay = aggregateByDay;
exports.generateWeeklyHeatmap = generateWeeklyHeatmap;
exports.predictBestTime = predictBestTime;
exports.generateInsights = generateInsights;
const DAYS_FR = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
/**
 * Analyse les activités des 30 derniers jours
 */
function analyzeHabits(activities) {
    if (activities.length === 0) {
        return {
            peakHours: [],
            bestDays: [],
            avgActionsPerDay: 0,
            avgXPPerDay: 0,
            productivityScore: 0,
            consistencyScore: 0,
            streakHealth: 'broken',
        };
    }
    // Grouper par heure
    const hourCounts = {};
    for (let h = 0; h < 24; h++)
        hourCounts[h] = 0;
    for (const a of activities)
        hourCounts[a.hour]++;
    // Trouver les heures de pic (top 3)
    const peakHours = Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([h]) => parseInt(h));
    // Grouper par jour de la semaine
    const dayCounts = {};
    for (let d = 0; d < 7; d++)
        dayCounts[d] = 0;
    for (const a of activities) {
        const dayOfWeek = new Date(a.date).getDay();
        dayCounts[dayOfWeek]++;
    }
    // Trouver les meilleurs jours (top 3)
    const bestDays = Object.entries(dayCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([d]) => DAYS_FR[parseInt(d)]);
    // Stats par jour
    const dailyStats = aggregateByDay(activities);
    const activeDays = dailyStats.filter(d => d.isActive).length;
    const totalDays = Math.max(30, dailyStats.length);
    // Moyennes
    const totalActions = activities.length;
    const totalXP = activities.reduce((sum, a) => sum + a.xpGained, 0);
    const avgActionsPerDay = Math.round((totalActions / Math.max(1, activeDays)) * 10) / 10;
    const avgXPPerDay = Math.round(totalXP / Math.max(1, activeDays));
    // Scores
    const consistencyScore = Math.min(100, Math.round((activeDays / totalDays) * 100));
    const productivityScore = calculateProductivityScore(dailyStats);
    const streakHealth = determineStreakHealth(dailyStats);
    return {
        peakHours,
        bestDays,
        avgActionsPerDay,
        avgXPPerDay,
        productivityScore,
        consistencyScore,
        streakHealth,
    };
}
/**
 * Agrège les activités par jour
 */
function aggregateByDay(activities) {
    const byDay = {};
    for (const a of activities) {
        if (!byDay[a.date]) {
            byDay[a.date] = { count: 0, xp: 0, hours: [] };
        }
        byDay[a.date].count++;
        byDay[a.date].xp += a.xpGained;
        byDay[a.date].hours.push(a.hour);
    }
    return Object.entries(byDay).map(([date, data]) => ({
        date,
        actionCount: data.count,
        xpGained: data.xp,
        peakHour: mode(data.hours),
        isActive: data.count > 0,
    })).sort((a, b) => a.date.localeCompare(b.date));
}
/**
 * Génère un heatmap des 7 derniers jours par heure
 */
function generateWeeklyHeatmap(activities) {
    // 7 jours x 24 heures
    const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    for (const a of activities) {
        const actDate = new Date(a.date);
        if (actDate >= weekAgo) {
            const dayIndex = actDate.getDay();
            heatmap[dayIndex][a.hour] += a.xpGained;
        }
    }
    return heatmap;
}
/**
 * Prédit le meilleur moment pour être productif
 */
function predictBestTime(pattern) {
    const bestHour = pattern.peakHours[0] ?? 9;
    const bestDay = pattern.bestDays[0] ?? 'lun';
    let reason = 'Basé sur vos habitudes';
    if (pattern.consistencyScore > 70) {
        reason = 'Vous êtes régulièrement productif à ce moment';
    }
    else if (pattern.peakHours.length > 0) {
        reason = 'Votre pic d\'activité habituel';
    }
    return { hour: bestHour, day: bestDay, reason };
}
/**
 * Génère des insights basés sur les patterns
 */
function generateInsights(pattern) {
    const insights = [];
    if (pattern.consistencyScore >= 80) {
        insights.push('Excellente régularité! Vous êtes un modèle de constance.');
    }
    else if (pattern.consistencyScore >= 50) {
        insights.push('Bonne régularité. Quelques jours de plus par semaine vous feraient passer au niveau supérieur.');
    }
    else {
        insights.push('Votre régularité peut être améliorée. Essayez de vous connecter plus souvent.');
    }
    if (pattern.peakHours.some(h => h >= 22 || h < 6)) {
        insights.push('Vous êtes un Night Owl! N\'oubliez pas le bonus nocturne.');
    }
    if (pattern.peakHours.some(h => h >= 5 && h < 9)) {
        insights.push('Lève-tôt productif! Le matin est votre moment fort.');
    }
    if (pattern.streakHealth === 'at_risk') {
        insights.push('Attention: votre streak est en danger. Connectez-vous aujourd\'hui!');
    }
    if (pattern.avgXPPerDay > 500) {
        insights.push('Productivité impressionnante! Vous gagnez beaucoup d\'XP par jour actif.');
    }
    return insights;
}
// Utilitaires
function mode(arr) {
    if (arr.length === 0)
        return 0;
    const counts = {};
    for (const n of arr)
        counts[n] = (counts[n] ?? 0) + 1;
    return parseInt(Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0]);
}
function calculateProductivityScore(dailyStats) {
    if (dailyStats.length === 0)
        return 0;
    const activeDays = dailyStats.filter(d => d.isActive);
    if (activeDays.length === 0)
        return 0;
    const avgXP = activeDays.reduce((sum, d) => sum + d.xpGained, 0) / activeDays.length;
    // Score basé sur XP moyen: 100 XP = 20 points, 500 XP = 100 points
    return Math.min(100, Math.round(avgXP / 5));
}
function determineStreakHealth(dailyStats) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const last3 = dailyStats.slice(-3);
    if (last3.some(d => d.date === today && d.isActive))
        return 'healthy';
    if (last3.some(d => d.date === yesterday && d.isActive))
        return 'at_risk';
    if (last3.filter(d => d.isActive).length >= 2)
        return 'recovering';
    return 'broken';
}
//# sourceMappingURL=habit-analyzer.js.map