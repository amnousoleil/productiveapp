/**
 * PSYCHO-AUDIT VIEW - Orchestrator v6.0 Premium
 * ProductiveApp v6.0
 *
 * Routes to PaPremiumUI for the full multi-tab experience
 * while maintaining backward compatibility with existing modules.
 */

const PsychoAuditView = (function() {
    'use strict';

    let hasInitialized = false;
    let renderScheduled = false;

    function render() {
        if (renderScheduled) return;
        renderScheduled = true;

        requestAnimationFrame(function() {
            renderScheduled = false;
            doRender();
        });
    }

    function doRender() {
        var container = document.getElementById('view-psycho-audit');
        if (!container) {
            console.warn('PsychoAuditView: Container not found');
            return;
        }

        PaStyles.inject();

        // Use Premium UI if available, fallback to classic
        if (typeof PaPremiumUI !== 'undefined') {
            PaPremiumUI.renderPremiumView();
        } else {
            var state = PaState.getState();
            container.innerHTML = PaRender.renderLayout(state.showResults);
        }
    }

    function setAnswer(questionId, value) {
        PaState.setAnswer(questionId, value);
        render();
    }

    function setTextAnswer(questionId, text) {
        PaState.setTextAnswer(questionId, text);
        // Do NOT re-render here - it would reset cursor position in textarea
    }

    async function analyze() {
        var score = PaState.calculateScore();
        var audit = {
            date: new Date().toISOString(),
            score: score,
            answers: Object.assign({}, PaState.getAnswers()),
            textResponses: Object.assign({}, PaState.getTextResponses())
        };

        // Save to API (includes XP reward)
        await PaApi.saveAudit(audit);

        // Reload history
        var history = await PaApi.loadHistory();
        PaState.setHistory(history);

        PaState.setCurrentAudit(audit);
        PaState.setShowResults(true);
        render();
    }

    function reset() {
        PaState.reset();
        render();
    }

    function refresh() {
        render();
    }

    async function init() {
        if (hasInitialized) return;
        hasInitialized = true;

        console.log('🧠 PsychoAuditView v6.0 Premium: Initializing...');

        // Load history from API
        var history = await PaApi.loadHistory();
        PaState.setHistory(history);

        render();
    }

    return {
        init: init,
        refresh: refresh,
        render: render,
        setAnswer: setAnswer,
        setTextAnswer: setTextAnswer,
        analyze: analyze,
        reset: reset
    };
})();

if (typeof window !== 'undefined') {
    window.PsychoAuditView = PsychoAuditView;
}
