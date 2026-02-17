/**
 * Behavioral API v2.0 — Data fetching avec données enrichies
 * ProductiveApp v5.0
 */
const BehavioralApi = (function() {
    'use strict';

    function getUserId() {
        return (typeof ApiTokens !== 'undefined' && ApiTokens.getStoredUser?.())?.id
            || (typeof AppState !== 'undefined' && AppState.currentUser?.id)
            || null;
    }

    function getWorkspaceId() {
        return (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId?.())
            || (typeof AppState !== 'undefined' && AppState.currentWorkspace?.id)
            || null;
    }

    async function getProfile() {
        const userId = getUserId();
        if (!userId) return getMockProfile();

        const workspaceId = getWorkspaceId();

        try {
            // Essayer d'abord le profil comportemental complet (night_owl, burst_vs_steady, etc.)
            if (workspaceId) {
                const profileRes = await ApiFetch.fetchWithAuth(
                    `/signals/user/${userId}/profile?workspaceId=${workspaceId}`
                );
                if (profileRes.success && profileRes.data) {
                    // Enrichir avec données graphiques via stats
                    const statsRes = await ApiFetch.fetchWithAuth(
                        `/signals/user/${userId}/stats`
                    ).catch(() => null);

                    return mergeData(profileRes.data, statsRes?.data);
                }
            }

            // Fallback : stats simples
            const statsRes = await ApiFetch.fetchWithAuth(`/signals/user/${userId}/stats`);
            if (statsRes.success) return buildFromStats(statsRes.data);

            return getMockProfile();
        } catch (e) {
            console.warn('BH API fallback to mock:', e.message);
            return getMockProfile();
        }
    }

    function mergeData(profile, stats) {
        // profile = {peak_activity_hours, completion_rate, overdue_rate, night_owl_index,
        //            burst_vs_steady_index, signals_count_7d, signals_count_30d, project_engagement}
        // stats = {total_signals, signals_by_type, signals_by_source, recent_activity}

        const result = { ...profile };

        // Construire hourlyActivity depuis les données disponibles
        // (si le backend ne le fournit pas, on simule à partir de peak_activity_hours)
        if (!result.hourlyActivity && profile.peak_activity_hours) {
            result.hourlyActivity = buildHourlyFromPeaks(profile.peak_activity_hours);
        }
        if (!result.hourlyActivity) {
            result.hourlyActivity = Array(24).fill(0);
        }

        // Complétion rate normalisée
        result.completionRate = profile.completion_rate ?? 0;
        result.overdueRate = profile.overdue_rate ?? 0;
        result.nightOwlIndex = profile.night_owl_index ?? 0;
        result.burstVsSteadyIndex = profile.burst_vs_steady_index ?? 1.5;
        result.signalsCount7d = profile.signals_count_7d ?? 0;
        result.signalsCount30d = profile.signals_count_30d ?? 0;

        // Project engagement en format tableau
        if (profile.project_engagement && !Array.isArray(profile.project_engagement)) {
            const maxVal = Math.max(...Object.values(profile.project_engagement), 1);
            result.projectEngagement = Object.entries(profile.project_engagement).map(([name, count]) => ({
                id: name.toLowerCase().replace(/\s+/g, '-'),
                name,
                score: Math.round((count / maxVal) * 100),
                lastActive: 'récemment'
            }));
        }

        return result;
    }

    function buildFromStats(statsData) {
        // statsData = {total_signals, signals_by_type, signals_by_source, recent_activity}
        const mock = getMockProfile();
        mock.signalsCount7d = statsData?.total_signals ?? 0;
        return mock;
    }

    function buildHourlyFromPeaks(peakHours) {
        // Construire une courbe réaliste autour des heures de pic
        const arr = Array(24).fill(0);
        (peakHours || []).forEach((h, rank) => {
            const intensity = 10 - rank * 2;
            for (let d = -2; d <= 2; d++) {
                const idx = (h + d + 24) % 24;
                const decay = Math.max(0, intensity - Math.abs(d) * 2);
                arr[idx] = Math.max(arr[idx], decay + Math.random() * 2);
            }
        });
        return arr;
    }

    async function getSignals(filters = {}) {
        const userId = getUserId();
        if (!userId) return [];

        try {
            const params = new URLSearchParams();
            if (filters.type) params.set('type', filters.type);
            if (filters.from) params.set('from', filters.from);
            if (filters.limit) params.set('limit', filters.limit);
            const query = params.toString();
            const url = `/signals/user/${userId}${query ? '?' + query : ''}`;
            const response = await ApiFetch.fetchWithAuth(url);
            return response.success ? response.data : [];
        } catch (e) {
            return [];
        }
    }

    function getMockProfile() {
        // Mock enrichi avec TOUTES les données nécessaires pour les insights
        const hourlyActivity = [0,0,0,0,0,1,3,8,15,18,14,10,8,12,15,13,10,8,5,3,2,1,0,0];
        return {
            userId: 'mock',
            // Données comportementales riches (format backend)
            night_owl_index: 8,
            burst_vs_steady_index: 3.8,
            completion_rate: 72,
            overdue_rate: 18,
            signals_count_7d: 47,
            signals_count_30d: 162,
            peak_activity_hours: [9, 10, 14],
            low_activity_hours: [3, 4, 2],
            // Données graphiques
            hourlyActivity,
            weeklyHeatmap: Array.from({ length: 7 }, (_, d) =>
                Array.from({ length: 24 }, (_, h) => {
                    // Plus d'activité en semaine, moins le weekend
                    const weekdayBoost = d < 5 ? 1 : 0.4;
                    return h >= 8 && h <= 18
                        ? weekdayBoost * (hourlyActivity[h] || 0) * (0.7 + Math.random() * 0.6)
                        : Math.random() * 1.5;
                })
            ),
            auditScores: Array.from({ length: 14 }, (_, i) => ({
                date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
                score: 60 + Math.sin(i * 0.5) * 18 + Math.random() * 10
            })),
            projectEngagement: [
                { id: 'academie', name: 'Académie Giri', score: 88, lastActive: '2 jours' },
                { id: 'bible', name: 'Bible & Sens', score: 65, lastActive: '5 jours' },
                { id: 'digital', name: 'Digital Giri', score: 48, lastActive: '1 jour' },
                { id: 'retraites', name: 'Retraites', score: 28, lastActive: '12 jours' }
            ],
            peakHours: { start: 9, end: 11 },
            avgTasksPerDay: 4.2,
            completionRate: 72,
            overdueRate: 18,
            nightOwlIndex: 8,
            burstVsSteadyIndex: 3.8,
            signalsCount7d: 47,
            signalsCount30d: 162
        };
    }

    return { getProfile, getSignals, getMockProfile };
})();

if (typeof window !== 'undefined') window.BehavioralApi = BehavioralApi;
