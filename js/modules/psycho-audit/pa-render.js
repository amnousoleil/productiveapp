/**
 * PSYCHO-AUDIT RENDER - UI rendering functions
 * ProductiveApp v5.0
 */

const PaRender = (function() {
    'use strict';

    function renderStars(questionId, currentValue) {
        var stars = '';
        for (var i = 1; i <= 5; i++) {
            var filled = i <= currentValue;
            stars += '<button class="star-btn ' + (filled ? 'filled' : '') + '" data-question="' + questionId + '" data-value="' + i + '" onclick="PsychoAuditView.setAnswer(\'' + questionId + '\', ' + i + ')">' +
                '<svg viewBox="0 0 24 24" width="28" height="28"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" ' +
                'fill="' + (filled ? 'var(--accent, #f59e0b)' : 'transparent') + '" stroke="' + (filled ? 'var(--accent, #f59e0b)' : 'var(--text-secondary, #666)') + '" stroke-width="2"/></svg>' +
                '</button>';
        }
        return '<div class="stars-container">' + stars + '</div>';
    }

    function renderQuestionnaire() {
        var answers = PaState.getAnswers();
        var QUESTIONS = PaState.QUESTIONS;
        var AXES = PaState.AXES;

        var html = '<div class="questionnaire">';
        html += '<h2>Auto-evaluation hebdomadaire</h2>';
        html += '<p class="questionnaire-intro">Repondez honnetement de 1 (pas du tout) a 5 (totalement)</p>';

        AXES.forEach(function(axis) {
            var axisQuestions = QUESTIONS.filter(function(q) { return q.axis === axis.id; });
            html += '<div class="axis-group">' +
                '<div class="axis-header">' +
                '<span class="axis-icon">' + axis.icon + '</span>' +
                '<span class="axis-label">' + axis.label + '</span>' +
                '</div>';

            axisQuestions.forEach(function(q) {
                var value = answers[q.id] || 0;
                html += '<div class="question-item">' +
                    '<div class="question-text">' + q.text + '</div>' +
                    renderStars(q.id, value) +
                    '</div>';
            });
            html += '</div>';
        });

        var allAnswered = QUESTIONS.every(function(q) { return answers[q.id] > 0; });

        html += '<button class="btn-analyze" onclick="PsychoAuditView.analyze()" ' + (allAnswered ? '' : 'disabled') + '>' +
            '<span class="btn-icon">📊</span> Analyser mon audit' +
            '</button>';

        if (!allAnswered) {
            html += '<p class="hint">Repondez aux 10 questions pour continuer</p>';
        }

        html += '</div>';
        return html;
    }

    function renderResults() {
        var score = PaState.calculateScore();
        var color = PaState.getScoreColor(score);
        var label = PaState.getScoreLabel(score);
        var recs = PaState.getRecommendations();
        var audits = PaState.getHistory();

        var html = '<div class="results">';

        // Score badge
        html += '<div class="score-section">' +
            '<div class="score-badge" style="background: ' + color + '20; border-color: ' + color + '">' +
            '<span class="score-value" style="color: ' + color + '">' + score + '</span>' +
            '<span class="score-max">/100</span>' +
            '</div>' +
            '<div class="score-label" style="color: ' + color + '">' + label + '</div>' +
            '<div class="score-date">' + new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + '</div>' +
            '<div class="xp-badge">+20 XP</div>' +
            '</div>';

        // Radar chart (using axis scores)
        var radarAnswers = PaState.getAnswersForRadar();
        html += '<div class="radar-section">' +
            '<h3>Vos 5 axes de developpement</h3>' +
            '<div class="radar-container">' + PaCharts.generateRadarChart(radarAnswers) + '</div>' +
            '</div>';

        // Recommendations
        html += '<div class="recommendations-section">' +
            '<h3>Recommandations personnalisees</h3>' +
            '<div class="recommendations-list">';

        var icons = ['💡', '🎯', '✨'];
        recs.forEach(function(rec, i) {
            html += '<div class="recommendation-item">' +
                '<span class="rec-icon">' + icons[i] + '</span>' +
                '<div class="rec-content">' +
                '<div class="rec-area">' + rec.label + '</div>' +
                '<div class="rec-text">' + rec.recommendation + '</div>' +
                '</div>' +
                '</div>';
        });
        html += '</div></div>';

        // Trends
        html += '<div class="trends-section">' +
            '<h3>Evolution sur 30 jours</h3>' +
            '<div class="trends-chart">' + PaCharts.generate30DayChart(audits) + '</div>';

        if (audits.length > 1) {
            var diff = score - audits[1].score;
            var diffText = diff > 0 ? '+' + diff : diff.toString();
            var diffColor = diff >= 0 ? '#22c55e' : '#ef4444';
            html += '<div class="trends-comparison">' +
                '<span>Par rapport au dernier audit: </span>' +
                '<span class="trends-diff" style="color: ' + diffColor + '">' + diffText + ' points</span>' +
                '</div>';
        }
        html += '</div>';

        // History
        if (audits.length > 0) {
            html += '<div class="history-section">' +
                '<h3>Historique recent</h3>' +
                '<div class="history-list">';

            audits.slice(0, 5).forEach(function(audit) {
                var date = new Date(audit.date);
                html += '<div class="history-item">' +
                    '<span class="history-date">' + date.toLocaleDateString('fr-FR') + '</span>' +
                    '<div class="history-bar"><div class="history-fill" style="width: ' + audit.score + '%; background: ' + PaState.getScoreColor(audit.score) + '"></div></div>' +
                    '<span class="history-score" style="color: ' + PaState.getScoreColor(audit.score) + '">' + audit.score + '</span>' +
                    '</div>';
            });
            html += '</div></div>';
        }

        // AI Report section
        html += '<div class="ai-report-section">' +
            '<h3>Rapport IA personnalise</h3>' +
            (typeof PaReport !== 'undefined' ? PaReport.renderButton() : '') +
            '<div class="pa-report-container"></div>' +
            '</div>';

        // New audit button
        html += '<button class="btn-new-audit" onclick="PsychoAuditView.reset()">' +
            '<span class="btn-icon">🔄</span> Nouvel audit' +
            '</button>';

        html += '</div>';
        return html;
    }

    function renderLayout(showResults) {
        var html = '<div class="psycho-audit-view">' +
            '<header class="audit-header">' +
            '<h1>Audit Psycho-Productivite</h1>' +
            '<p class="subtitle">Evaluez votre bien-etre au travail et recevez des recommandations personnalisees</p>' +
            '</header>';

        html += showResults ? renderResults() : renderQuestionnaire();
        html += '</div>';
        return html;
    }

    return {
        renderLayout: renderLayout,
        renderQuestionnaire: renderQuestionnaire,
        renderResults: renderResults
    };
})();

if (typeof window !== 'undefined') {
    window.PaRender = PaRender;
}
