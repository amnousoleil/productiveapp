/**
 * DASH INSIGHTS - ProductiveApp v4.0
 * Widget IA pour insights personnalisés
 */
const DashInsights = (function() {
    'use strict';

    let styleInjected = false;

    function injectStyles() {
        if (styleInjected) return;
        const style = document.createElement('style');
        style.textContent = `
            .dash-insights{background:linear-gradient(135deg,rgba(139,92,246,0.12) 0%,rgba(59,130,246,0.08) 100%);border:1px solid rgba(139,92,246,0.25);border-radius:16px;padding:20px 24px;margin-bottom:24px;position:relative;overflow:hidden}
            .dash-insights::before{content:'';position:absolute;top:-50%;right:-50%;width:100%;height:100%;background:radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%);pointer-events:none}
            .dash-insights-header{display:flex;align-items:center;gap:10px;margin-bottom:14px}
            .dash-insights-icon{font-size:24px;filter:drop-shadow(0 0 8px rgba(139,92,246,0.5))}
            .dash-insights-title{font-size:16px;font-weight:600;color:var(--text,#fafafa);letter-spacing:-0.02em}
            .dash-insights-content{font-size:14px;line-height:1.7;color:var(--text-secondary,#a1a1aa);position:relative;z-index:1}
            .dash-insights-content strong{color:var(--primary,#8b5cf6);font-weight:600}
            .dash-insights-content .highlight{color:var(--text,#fafafa);font-weight:500}
            .dash-insights-loading{display:flex;align-items:center;gap:8px;color:var(--text-tertiary,#71717a);font-size:13px}
            .dash-insights-loading::after{content:'';width:16px;height:16px;border:2px solid var(--primary,#8b5cf6);border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite}
            @keyframes spin{to{transform:rotate(360deg)}}
        `;
        document.head.appendChild(style);
        styleInjected = true;
    }

    function analyzeData() {
        const tasks = typeof AppState !== 'undefined' ? AppState.tasks || [] : [];
        const projects = typeof AppState !== 'undefined' ? AppState.projects || [] : [];
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Tâches urgentes en attente
        const urgentPending = tasks.filter(t =>
            t.status === 'todo' && (t.priority === 'urgent' || t.priority === 1 || t.priority === '1')
        ).length;

        // Tâches complétées cette semaine vs semaine dernière
        const completedThisWeek = tasks.filter(t =>
            t.status === 'done' && t.updated_at && new Date(t.updated_at) >= weekAgo
        ).length;
        const completedLastWeek = tasks.filter(t =>
            t.status === 'done' && t.updated_at &&
            new Date(t.updated_at) >= twoWeeksAgo && new Date(t.updated_at) < weekAgo
        ).length;

        // Taux de progression
        let progressRate = 0;
        if (completedLastWeek > 0) {
            progressRate = Math.round(((completedThisWeek - completedLastWeek) / completedLastWeek) * 100);
        } else if (completedThisWeek > 0) {
            progressRate = 100;
        }

        // Projet avec le plus de tâches en attente
        const projectTaskCount = {};
        tasks.filter(t => t.status === 'todo').forEach(t => {
            const projId = t.project_id || 'sans-projet';
            projectTaskCount[projId] = (projectTaskCount[projId] || 0) + 1;
        });
        let topProjectId = null;
        let topProjectCount = 0;
        Object.entries(projectTaskCount).forEach(([id, count]) => {
            if (count > topProjectCount) {
                topProjectId = id;
                topProjectCount = count;
            }
        });
        const topProject = projects.find(p => p.id === topProjectId);
        const topProjectName = topProject?.name || 'Sans projet';

        // Streak (jours consécutifs avec tâche complétée)
        const completedDates = new Set();
        tasks.filter(t => t.status === 'done' && t.updated_at).forEach(t => {
            const d = new Date(t.updated_at);
            completedDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
        });
        let streak = 0;
        const checkDate = new Date(now);
        while (true) {
            const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
            if (completedDates.has(key)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (streak === 0) {
                checkDate.setDate(checkDate.getDate() - 1);
                const yesterdayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
                if (!completedDates.has(yesterdayKey)) break;
            } else {
                break;
            }
            if (streak > 365) break;
        }

        return { urgentPending, completedThisWeek, progressRate, topProjectName, topProjectCount, streak };
    }

    function generateInsightText(data) {
        // TODO: remplacer par appel POST /api/v1/ai/generate
        const parts = [];

        if (data.urgentPending > 0) {
            parts.push(`<strong>${data.urgentPending} tâche${data.urgentPending > 1 ? 's' : ''} urgente${data.urgentPending > 1 ? 's' : ''}</strong> ${data.urgentPending > 1 ? 'attendent' : 'attend'} ton attention.`);
        }

        if (data.topProjectCount > 0) {
            parts.push(`Le projet <span class="highlight">${data.topProjectName}</span> concentre ${data.topProjectCount} tâche${data.topProjectCount > 1 ? 's' : ''} en attente.`);
        }

        if (data.progressRate !== 0) {
            if (data.progressRate > 0) {
                parts.push(`Ta productivité est <strong>en hausse de ${data.progressRate}%</strong> cette semaine.`);
            } else {
                parts.push(`Ta productivité est en baisse de ${Math.abs(data.progressRate)}% cette semaine.`);
            }
        } else if (data.completedThisWeek > 0) {
            parts.push(`Tu as complété <strong>${data.completedThisWeek} tâche${data.completedThisWeek > 1 ? 's' : ''}</strong> cette semaine.`);
        }

        if (data.streak >= 3) {
            parts.push(`Bravo pour ta série de <strong>${data.streak} jours</strong> consécutifs !`);
        }

        if (parts.length === 0) {
            return "Bienvenue ! Crée ta première tâche pour commencer à suivre ta productivité.";
        }

        return parts.join(' ');
    }

    function render() {
        injectStyles();
        const data = analyzeData();
        const text = generateInsightText(data);

        return `
            <div class="dash-insights">
                <div class="dash-insights-header">
                    <span class="dash-insights-icon">✨</span>
                    <span class="dash-insights-title">Insights</span>
                </div>
                <div class="dash-insights-content">${text}</div>
            </div>
        `;
    }

    function init() {
        console.log('✨ DashInsights: Initialized');
    }

    return { init, render, analyzeData };
})();

if (typeof window !== 'undefined') {
    window.DashInsights = DashInsights;
}
