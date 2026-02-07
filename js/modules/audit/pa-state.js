/**
 * PSYCHO-AUDIT STATE - State management with PaScoring delegation
 * ProductiveApp v5.0
 */

const PaState = (function() {
    'use strict';

    const STORAGE_KEY = 'psycho_audits';

    var AXES = typeof QUESTION_BANK !== 'undefined' ? QUESTION_BANK.AXES : [];
    var QUESTIONS = [];
    var currentQuestions = [];

    let state = {
        answers: {},
        textResponses: {},
        showResults: false,
        currentAudit: null,
        history: []
    };

    function initQuestions() {
        if (typeof PaScoring !== 'undefined') {
            currentQuestions = PaScoring.selectQuestionsForAudit(state.history);
            QUESTIONS = currentQuestions;
        } else if (typeof QUESTION_BANK !== 'undefined') {
            AXES.forEach(function(axis) {
                var axisQuestions = QUESTION_BANK.QUESTIONS[axis.id] || [];
                if (axisQuestions.length > 0) {
                    QUESTIONS.push({ id: axisQuestions[0].id, axis: axis.id, text: axisQuestions[0].text, positive: axisQuestions[0].positive });
                }
            });
            currentQuestions = QUESTIONS;
        }
    }

    function selectNewQuestions() {
        if (typeof PaScoring !== 'undefined') {
            currentQuestions = PaScoring.selectQuestionsForAudit(state.history);
            QUESTIONS = currentQuestions;
        }
        return currentQuestions;
    }

    function getState() { return state; }
    function setAnswers(answers) { state.answers = answers; }
    function setAnswer(qId, value) { state.answers[qId] = value; }
    function getAnswers() { return state.answers; }
    function setTextAnswer(qId, text) { state.textResponses[qId] = text; }
    function getTextResponses() { return state.textResponses; }
    function setShowResults(show) { state.showResults = show; }
    function setCurrentAudit(audit) { state.currentAudit = audit; }
    function setHistory(history) { state.history = history; }
    function getHistory() { return state.history; }

    function reset() {
        state.answers = {};
        state.textResponses = {};
        state.showResults = false;
        state.currentAudit = null;
        selectNewQuestions();
    }

    function calculateAxisScores() {
        if (typeof PaScoring !== 'undefined') {
            var answers = Object.keys(state.answers).map(function(qId) {
                return { questionId: qId, value: state.answers[qId] };
            });
            var result = PaScoring.calculateDetailedScore(answers, currentQuestions);
            return result.axes;
        }
        var axisScores = {};
        AXES.forEach(function(axis) {
            var questions = QUESTIONS.filter(function(q) { return q.axis === axis.id; });
            var total = 0, count = 0;
            questions.forEach(function(q) {
                if (state.answers[q.id]) { total += state.answers[q.id]; count++; }
            });
            axisScores[axis.id] = count > 0 ? Math.round((total / count) * 20) : 0;
        });
        return axisScores;
    }

    function calculateScore() {
        if (typeof PaScoring !== 'undefined') {
            var answers = Object.keys(state.answers).map(function(qId) {
                return { questionId: qId, value: state.answers[qId] };
            });
            var result = PaScoring.calculateDetailedScore(answers, currentQuestions);
            return result.global;
        }
        var axisScores = calculateAxisScores();
        var total = 0, count = 0;
        Object.keys(axisScores).forEach(function(key) { total += axisScores[key].score || axisScores[key]; count++; });
        return count > 0 ? Math.round(total / count) : 0;
    }

    function getScoreColor(score) {
        if (score >= 75) return '#22c55e';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    }

    function getScoreLabel(score) {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Solide';
        if (score >= 40) return 'En progression';
        return 'À développer';
    }

    function getRecommendations() {
        var axisScores = calculateAxisScores();
        if (typeof PaScoring !== 'undefined') {
            return PaScoring.getDetailedRecommendations(axisScores);
        }
        var RECOMMENDATIONS = typeof QUESTION_BANK !== 'undefined' ? QUESTION_BANK.RECOMMENDATIONS : {};
        var recs = [];
        var sortedAxes = AXES.map(function(axis) {
            var s = axisScores[axis.id];
            return { id: axis.id, label: axis.label, icon: axis.icon, score: typeof s === 'number' ? s : s.score };
        }).sort(function(a, b) { return a.score - b.score; });

        sortedAxes.slice(0, 3).forEach(function(axis) {
            if (axis.score < 80 && RECOMMENDATIONS[axis.id]) {
                var axisRecs = RECOMMENDATIONS[axis.id];
                recs.push({ area: axis.id, label: axis.label, icon: axis.icon, score: axis.score, recommendation: axisRecs[Math.floor(Math.random() * axisRecs.length)] });
            }
        });
        if (recs.length === 0) recs.push({ area: 'general', label: 'Excellence', icon: '🌟', score: 100, recommendation: 'Vos scores sont excellents !' });
        return recs;
    }

    function getAnswersForRadar() {
        var axisScores = calculateAxisScores();
        var radarAnswers = {};
        AXES.forEach(function(axis) {
            var s = axisScores[axis.id];
            var score = typeof s === 'number' ? s : (s ? s.score : 0);
            radarAnswers[axis.id] = Math.round(score / 20);
        });
        return radarAnswers;
    }

    initQuestions();

    return {
        STORAGE_KEY: STORAGE_KEY,
        AXES: AXES,
        get QUESTIONS() { return currentQuestions.length > 0 ? currentQuestions : QUESTIONS; },
        getState: getState,
        getAnswers: getAnswers,
        setAnswer: setAnswer,
        setAnswers: setAnswers,
        setTextAnswer: setTextAnswer,
        getTextResponses: getTextResponses,
        setShowResults: setShowResults,
        setCurrentAudit: setCurrentAudit,
        setHistory: setHistory,
        getHistory: getHistory,
        reset: reset,
        selectNewQuestions: selectNewQuestions,
        calculateScore: calculateScore,
        calculateAxisScores: calculateAxisScores,
        getScoreColor: getScoreColor,
        getScoreLabel: getScoreLabel,
        getRecommendations: getRecommendations,
        getAnswersForRadar: getAnswersForRadar
    };
})();

if (typeof window !== 'undefined') { window.PaState = PaState; }
