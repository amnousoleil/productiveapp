/**
 * PSYCHO-AUDIT REPORT - AI-generated analysis
 * ProductiveApp v5.0
 */
const PaReport = (function() {
    'use strict';

    let isGenerating = false;
    let lastReport = null;

    async function generateReport() {
        if (isGenerating) return null;
        isGenerating = true;
        try {
            var score = PaState.calculateScore();
            var answers = PaState.getAnswers();
            var recommendations = PaState.getRecommendations();
            var history = await PaApi.loadHistory();
            var context = buildContext(score, answers, recommendations, history);
            // TODO: remplacer mock par appel API proxy
            // var report = await callClaudeAPI(context);
            var report = await mockGenerateReport(context);
            lastReport = report;
            return report;
        } catch (error) {
            console.error('PaReport: Generation failed', error);
            return '## Erreur\n\nImpossible de generer le rapport.';
        } finally {
            isGenerating = false;
        }
    }

    function buildContext(score, answers, recommendations, history) {
        var QUESTIONS = PaState.QUESTIONS;
        var answersText = QUESTIONS.map(function(q) {
            return q.label + ': ' + (answers[q.id] || 0) + '/5';
        }).join('\n');
        var historyText = history.slice(0, 7).map(function(a) {
            return new Date(a.date).toLocaleDateString('fr-FR') + ': ' + a.score + '/100';
        }).join('\n');
        var recsText = recommendations.map(function(r) {
            return '- ' + r.label + ': ' + r.recommendation;
        }).join('\n');
        return { score: score, answersText: answersText, historyText: historyText || 'Premier audit', recsText: recsText, trend: calculateTrend(history) };
    }

    function calculateTrend(history) {
        if (!history || history.length < 2) return 'stable';
        var recent = history.slice(0, 3);
        var avg = recent.reduce(function(s, a) { return s + a.score; }, 0) / recent.length;
        var older = history.slice(3, 6);
        if (older.length === 0) return 'stable';
        var oldAvg = older.reduce(function(s, a) { return s + a.score; }, 0) / older.length;
        return avg > oldAvg + 5 ? 'ascending' : avg < oldAvg - 5 ? 'descending' : 'stable';
    }

    // TODO: Real API call via backend proxy POST /api/v1/ai/psycho-report
    async function callClaudeAPI(context) {
        throw new Error('Not implemented - use mock');
    }

    async function mockGenerateReport(context) {
        await new Promise(function(r) { setTimeout(r, 1500); });
        var trendE = context.trend === 'ascending' ? '📈' : context.trend === 'descending' ? '📉' : '➡️';
        var scoreE = context.score >= 75 ? '🌟' : context.score >= 50 ? '👍' : '💪';
        return '## Analyse de votre audit ' + scoreE + '\n\n' +
            '### Score global : ' + context.score + '/100\n\n' +
            'Votre score reflete un equilibre ' + (context.score >= 70 ? 'positif' : 'a ameliorer') +
            ' entre vos differentes dimensions de bien-etre. ' + trendE + '\n\n' +
            '### Points forts\n\n' +
            '- **Conscience de soi** : Vous prenez le temps d\'evaluer votre etat\n' +
            '- **Regularite** : Les audits quotidiens renforcent votre connaissance de vous-meme\n\n' +
            '### Points a ameliorer\n\n' + context.recsText + '\n\n' +
            '### Plan d\'action 7 jours\n\n' +
            '| Jour | Action | Objectif |\n|------|--------|----------|\n' +
            '| Lun | Meditation 10 min | Recentrage |\n' +
            '| Mar | Marche 30 min | Energie physique |\n' +
            '| Mer | Journaling | Clarification mentale |\n' +
            '| Jeu | Pause numerique 2h | Detox digitale |\n' +
            '| Ven | Activite creative | Expression |\n' +
            '| Sam | Temps social | Connexion |\n' +
            '| Dim | Bilan semaine | Reflexion |\n\n' +
            '### Evolution recente\n\n' +
            (context.historyText === 'Premier audit' ?
                '*C\'est votre premier audit ! Revenez demain pour suivre votre evolution.*' :
                '```\n' + context.historyText + '\n```\n') +
            '\n---\n*Rapport genere le ' + new Date().toLocaleDateString('fr-FR') + '*';
    }

    function renderReport(markdown) {
        if (!markdown) return '<div class="pa-report-empty">Aucun rapport disponible</div>';
        var html = markdown
            .replace(/^### (.+)$/gm, '<h4>$1</h4>')
            .replace(/^## (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/```\n([\s\S]*?)\n```/g, '<pre>$1</pre>')
            .replace(/\|(.+)\|/g, function(m) {
                var cells = m.split('|').filter(function(c) { return c.trim(); });
                return '<tr>' + cells.map(function(c) { return '<td>' + c.trim() + '</td>'; }).join('') + '</tr>';
            })
            .replace(/^---$/gm, '<hr>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        html = html.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
        html = html.replace(/(<tr>.*?<\/tr>)+/g, '<table class="pa-report-table">$&</table>');
        return '<div class="pa-report-content"><p>' + html + '</p></div>';
    }

    function renderButton() {
        return '<button class="pa-report-btn" onclick="PaReport.handleGenerate()">' +
            '<span class="btn-icon">🤖</span><span class="btn-text">Generer le rapport IA</span></button>';
    }

    async function handleGenerate() {
        var container = document.querySelector('.pa-report-container');
        if (!container) return;
        container.innerHTML = '<div class="pa-report-loading"><div class="loading-spinner"></div>' +
            '<span>Generation du rapport en cours...</span></div>';
        var report = await generateReport();
        container.innerHTML = renderReport(report);
    }

    function getLastReport() { return lastReport; }

    return {
        generateReport: generateReport,
        renderReport: renderReport,
        renderButton: renderButton,
        handleGenerate: handleGenerate,
        getLastReport: getLastReport
    };
})();

if (typeof window !== 'undefined') {
    window.PaReport = PaReport;
}
