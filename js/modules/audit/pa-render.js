/**
 * PSYCHO-AUDIT RENDER v7.0 - Wizard UI
 * ProductiveApp 2026 — Step-by-step questionnaire + premium results
 */

const PaRender = (function() {
    'use strict';

    var currentStep = 0;

    /* ── Helpers ── */
    function getSteps() {
        var AXES = PaState.AXES;
        var QUESTIONS = PaState.QUESTIONS;
        return AXES.map(function(axis) {
            return {
                axis: axis,
                questions: QUESTIONS.filter(function(q) { return q.axis === axis.id; })
            };
        }).filter(function(s) { return s.questions.length > 0; });
    }

    function goToStep(index) {
        var steps = getSteps();
        currentStep = Math.max(0, Math.min(index, steps.length - 1));
        PsychoAuditView.render();
    }

    function resetStep() { currentStep = 0; }

    /* ── Rating buttons (1–5 with labels) ── */
    function renderRating(questionId, value) {
        var labels = ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Toujours'];
        var html = '<div class="pa-rating-row">';
        for (var i = 1; i <= 5; i++) {
            html += '<button class="pa-rbtn' + (value === i ? ' active' : '') + '" ' +
                'onclick="PsychoAuditView.setAnswer(\'' + questionId + '\', ' + i + ')">' +
                '<span class="pa-rbtn-num">' + i + '</span>' +
                '<span class="pa-rbtn-lbl">' + labels[i - 1] + '</span>' +
                '</button>';
        }
        html += '</div>';
        return html;
    }

    /* ── QUESTIONNAIRE WIZARD ── */
    function renderQuestionnaire() {
        var steps = getSteps();

        if (steps.length === 0) {
            return '<div class="pa-therapy-empty"><span class="pa-empty-icon">⏳</span>' +
                '<h3>Chargement des questions...</h3>' +
                '<p>Merci de patienter.</p></div>';
        }

        var answers = PaState.getAnswers();

        // Auto-reset step when audit is fresh (no answers at all)
        var hasAny = Object.keys(answers).some(function(k) { return answers[k] > 0; });
        if (!hasAny) currentStep = 0;

        currentStep = Math.min(currentStep, steps.length - 1);
        var step = steps[currentStep];

        var QUESTIONS = PaState.QUESTIONS;
        var totalQ = QUESTIONS.length;
        var answeredQ = Object.keys(answers).filter(function(k) { return answers[k] > 0; }).length;
        var progress = totalQ > 0 ? (answeredQ / totalQ * 100).toFixed(0) : 0;
        var stepDone = step.questions.every(function(q) { return answers[q.id] > 0; });
        var allDone = QUESTIONS.every(function(q) { return answers[q.id] > 0; });
        var isLast = currentStep === steps.length - 1;

        var html = '<div class="pa-wizard">';

        /* Progress header */
        html += '<div class="pa-prog-header">';
        html += '<div class="pa-prog-dots">';
        steps.forEach(function(s, i) {
            var done = s.questions.every(function(q) { return answers[q.id] > 0; });
            var cls = done ? 'done' : (i === currentStep ? 'active' : '');
            html += '<button class="pa-dot ' + cls + '" title="' + s.axis.label + '" ' +
                'onclick="PaRender.goToStep(' + i + ')">' +
                (done ? '✓' : s.axis.icon) + '</button>';
        });
        html += '</div>';
        html += '<div class="pa-prog-bar"><div class="pa-prog-fill" style="width:' + progress + '%"></div></div>';
        html += '<div class="pa-prog-count">' + answeredQ + '/' + totalQ + '</div>';
        html += '</div>';

        /* Axis step card */
        html += '<div class="pa-step-card">';
        html += '<div class="pa-axis-badge">' +
            '<span class="pa-axis-emoji">' + step.axis.icon + '</span>' +
            '<div>' +
            '<div class="pa-axis-step-num">Étape ' + (currentStep + 1) + ' / ' + steps.length + '</div>' +
            '<div class="pa-axis-step-name">' + step.axis.label + '</div>' +
            '</div></div>';

        /* Questions */
        step.questions.forEach(function(q, qi) {
            var val = answers[q.id] || 0;
            html += '<div class="pa-qcard' + (val > 0 ? ' pa-qcard--done' : '') + '">';
            html += '<div class="pa-q-num">Q' + (qi + 1) + '</div>';
            html += '<div class="pa-q-text">' + q.text + '</div>';
            html += renderRating(q.id, val);
            html += '</div>';
        });

        /* Navigation */
        html += '<div class="pa-step-nav">';
        if (currentStep > 0) {
            html += '<button class="pa-nav-prev" onclick="PaRender.goToStep(' + (currentStep - 1) + ')">← Retour</button>';
        } else {
            html += '<div></div>';
        }

        if (isLast) {
            html += '<button class="pa-btn-analyze' + (allDone ? '' : ' pa-btn-analyze--disabled') + '" ' +
                (allDone ? 'onclick="PsychoAuditView.analyze()"' : '') + '>' +
                '<span>📊</span> Analyser mon profil</button>';
        } else {
            html += '<button class="pa-nav-next' + (!stepDone ? ' pa-nav-next--hint' : '') + '" ' +
                'onclick="PaRender.goToStep(' + (currentStep + 1) + ')">Suivant →</button>';
        }
        html += '</div>';

        if (isLast && !allDone) {
            html += '<p class="pa-hint-text">Il reste ' + (totalQ - answeredQ) + ' question(s) sans réponse</p>';
        }

        html += '</div>'; /* step-card */
        html += '</div>'; /* wizard */
        return html;
    }

    /* ── RESULTS PAGE ── */
    function renderResults() {
        var score = PaState.calculateScore();
        var color = PaState.getScoreColor(score);
        var label = PaState.getScoreLabel(score);
        var recs = PaState.getRecommendations();
        var audits = PaState.getHistory();

        var html = '<div class="pa-results">';

        /* Score hero with SVG ring */
        var dash = (score / 100) * 314;
        html += '<div class="pa-score-hero">';
        html += '<div class="pa-score-ring">';
        html += '<svg viewBox="0 0 120 120" width="120" height="120" style="filter:drop-shadow(0 0 14px ' + color + '88)">';
        html += '<circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>';
        html += '<circle cx="60" cy="60" r="50" fill="none" stroke="' + color + '" stroke-width="10" ' +
            'stroke-linecap="round" stroke-dasharray="' + dash.toFixed(1) + ' 314" stroke-dashoffset="78.5" ' +
            'transform="rotate(-90 60 60)" style="transition:stroke-dasharray 1s ease"/>';
        html += '<text x="60" y="55" text-anchor="middle" fill="' + color + '" font-size="28" font-weight="800">' + score + '</text>';
        html += '<text x="60" y="73" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="12">/100</text>';
        html += '</svg></div>';
        html += '<div class="pa-score-info">';
        html += '<div class="pa-score-label" style="color:' + color + '">' + label + '</div>';
        html += '<div class="pa-score-date">' + new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + '</div>';
        html += '<div class="pa-score-xp">+20 XP gagné ✨</div>';
        html += '</div></div>';

        /* Axes grid */
        var axisScores = PaState.calculateAxisScores();
        html += '<div class="pa-axes-grid">';
        PaState.AXES.forEach(function(axis) {
            var s = axisScores[axis.id];
            var sc = typeof s === 'number' ? s : (s ? (s.score || 0) : 0);
            var c = PaState.getScoreColor(sc);
            html += '<div class="pa-axis-bar-item">';
            html += '<div class="pa-axis-bar-header"><span>' + axis.icon + ' ' + (axis.shortLabel || axis.label) + '</span>' +
                '<span style="color:' + c + ';font-weight:700">' + sc + '%</span></div>';
            html += '<div class="pa-axis-bar-track"><div class="pa-axis-bar-fill" style="width:' + sc + '%;background:' + c + '"></div></div>';
            html += '</div>';
        });
        html += '</div>';

        /* Radar */
        if (typeof PaCharts !== 'undefined') {
            var radarData = PaState.getAnswersForRadar();
            html += '<div class="pa-radar-wrap"><h3>Carte psycho-productive</h3>' + PaCharts.generateRadarChart(radarData) + '</div>';
        }

        /* Recommendations */
        var icons = ['💡', '🎯', '✨', '🌱', '🔥'];
        html += '<div class="pa-recs"><h3>Recommandations personnalisées</h3><div class="pa-recs-grid">';
        recs.forEach(function(rec, i) {
            html += '<div class="pa-rec-card"><div class="pa-rec-icon">' + icons[i % icons.length] + '</div>' +
                '<div><div class="pa-rec-area">' + rec.label + '</div>' +
                '<div class="pa-rec-text">' + rec.recommendation + '</div></div></div>';
        });
        html += '</div></div>';

        /* History trend */
        if (audits.length > 1) {
            html += '<div class="pa-trend"><h3>Évolution sur 30 jours</h3>';
            if (typeof PaCharts !== 'undefined') html += PaCharts.generate30DayChart(audits);
            var diff = score - audits[1].score;
            html += '<div class="pa-trend-diff">Vs audit précédent : ' +
                '<span style="color:' + (diff >= 0 ? '#22c55e' : '#ef4444') + ';font-weight:700">' +
                (diff >= 0 ? '+' : '') + diff + ' pts</span></div></div>';
        }

        /* History list */
        if (audits.length > 0) {
            html += '<div class="pa-history-section"><h3>Historique récent</h3><div class="pa-history-list">';
            audits.slice(0, 5).forEach(function(a) {
                var c = PaState.getScoreColor(a.score);
                html += '<div class="pa-history-item">' +
                    '<span class="pa-history-date">' + new Date(a.date).toLocaleDateString('fr-FR') + '</span>' +
                    '<div class="pa-history-bar"><div class="pa-history-fill" style="width:' + a.score + '%;background:' + c + '"></div></div>' +
                    '<span class="pa-history-score" style="color:' + c + '">' + a.score + '</span></div>';
            });
            html += '</div></div>';
        }

        /* Actions */
        html += '<div class="pa-actions-row">';
        if (typeof PaReport !== 'undefined') html += PaReport.renderButton();
        html += '<button class="pa-btn-reset" onclick="PsychoAuditView.reset()">🔄 Nouvel audit</button>';
        html += '</div>';
        html += '<div class="pa-report-container"></div>';

        html += '</div>'; /* results */
        return html;
    }

    function renderLayout(showResults) {
        return showResults ? renderResults() : renderQuestionnaire();
    }

    return {
        renderQuestionnaire: renderQuestionnaire,
        renderResults: renderResults,
        renderLayout: renderLayout,
        goToStep: goToStep,
        resetStep: resetStep
    };
})();

if (typeof window !== 'undefined') { window.PaRender = PaRender; }
