/**
 * PSYCHO-AUDIT SCORING - Advanced scoring for 10 axes / 80 questions
 * ProductiveApp v5.0
 */

const PaScoring = (function() {
    'use strict';

    var TOTAL_QUESTIONS = 20;
    var QUESTIONS_PER_AXIS_DEFAULT = 2;

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function selectQuestionsForAudit(history) {
        if (typeof QUESTION_BANK === 'undefined') return [];
        var AXES = QUESTION_BANK.AXES;
        var QUESTIONS = QUESTION_BANK.QUESTIONS;
        var selected = [];
        var lastQuestionIds = (history && history.length > 0 && history[0].questions)
            ? history[0].questions.map(function(q) { return q.id; }) : [];

        if (!history || history.length < 3) {
            AXES.forEach(function(axis) {
                var pool = shuffle(QUESTIONS[axis.id] || []);
                var count = 0;
                for (var i = 0; i < pool.length && count < QUESTIONS_PER_AXIS_DEFAULT; i++) {
                    if (lastQuestionIds.indexOf(pool[i].id) === -1 || pool.length <= QUESTIONS_PER_AXIS_DEFAULT) {
                        selected.push({ id: pool[i].id, text: pool[i].text, positive: pool[i].positive, axisId: axis.id, axisLabel: axis.label });
                        count++;
                    }
                }
                while (count < QUESTIONS_PER_AXIS_DEFAULT && pool.length > 0) {
                    var q = pool[count % pool.length];
                    selected.push({ id: q.id, text: q.text, positive: q.positive, axisId: axis.id, axisLabel: axis.label });
                    count++;
                }
            });
        } else {
            var axisScores = {};
            AXES.forEach(function(a) { axisScores[a.id] = []; });
            history.slice(0, 5).forEach(function(audit) {
                if (audit.axes) {
                    Object.keys(audit.axes).forEach(function(axId) {
                        if (axisScores[axId]) axisScores[axId].push(audit.axes[axId].score || audit.axes[axId]);
                    });
                }
            });
            var avgScores = AXES.map(function(a) {
                var scores = axisScores[a.id];
                var avg = scores.length > 0 ? scores.reduce(function(s,v){return s+v;},0) / scores.length : 50;
                return { id: a.id, label: a.label, avg: avg };
            });
            avgScores.sort(function(a,b) { return a.avg - b.avg; });
            var weakest3 = avgScores.slice(0, 3).map(function(a) { return a.id; });

            AXES.forEach(function(axis) {
                var pool = shuffle(QUESTIONS[axis.id] || []);
                var qCount = weakest3.indexOf(axis.id) !== -1 ? 3 : 1;
                var count = 0;
                for (var i = 0; i < pool.length && count < qCount; i++) {
                    if (lastQuestionIds.indexOf(pool[i].id) === -1 || pool.length <= qCount) {
                        selected.push({ id: pool[i].id, text: pool[i].text, positive: pool[i].positive, axisId: axis.id, axisLabel: axis.label });
                        count++;
                    }
                }
                while (count < qCount) {
                    var q = pool[count % pool.length];
                    selected.push({ id: q.id, text: q.text, positive: q.positive, axisId: axis.id, axisLabel: axis.label });
                    count++;
                }
            });
            while (selected.length < TOTAL_QUESTIONS) {
                var randomAxis = AXES[Math.floor(Math.random() * AXES.length)];
                var pool = shuffle(QUESTIONS[randomAxis.id] || []);
                if (pool.length > 0) {
                    var q = pool[0];
                    if (!selected.find(function(s) { return s.id === q.id; })) {
                        selected.push({ id: q.id, text: q.text, positive: q.positive, axisId: randomAxis.id, axisLabel: randomAxis.label });
                    }
                }
            }
        }
        return shuffle(selected).slice(0, TOTAL_QUESTIONS);
    }

    function calculateDetailedScore(answers, questions) {
        if (typeof QUESTION_BANK === 'undefined') return { global: 0, axes: {}, weakest: null, strongest: null, trend: null };
        var AXES = QUESTION_BANK.AXES;
        var axisData = {};
        AXES.forEach(function(a) { axisData[a.id] = { sum: 0, count: 0, label: a.label }; });

        answers.forEach(function(ans) {
            var q = questions.find(function(qst) { return qst.id === ans.questionId; });
            if (q && axisData[q.axisId]) {
                var val = q.positive === false ? (6 - ans.value) : ans.value;
                axisData[q.axisId].sum += val;
                axisData[q.axisId].count++;
            }
        });

        var axes = {};
        var scores = [];
        AXES.forEach(function(a) {
            var d = axisData[a.id];
            var score = d.count > 0 ? Math.round((d.sum / d.count) * 20) : 0;
            axes[a.id] = { score: score, label: d.label, count: d.count };
            if (d.count > 0) scores.push({ id: a.id, score: score });
        });

        scores.sort(function(a,b) { return a.score - b.score; });
        var global = scores.length > 0 ? Math.round(scores.reduce(function(s,v){return s+v.score;},0) / scores.length) : 0;

        return {
            global: global,
            axes: axes,
            weakest: scores.length > 0 ? scores[0].id : null,
            strongest: scores.length > 0 ? scores[scores.length - 1].id : null,
            trend: null
        };
    }

    var RECS_LOW = {
        clarity: "Commence chaque journée par écrire 3 intentions claires avant d'ouvrir un écran.",
        alignment: "Chaque soir, compare ce que tu as fait avec ce que tu avais prévu. Note l'écart.",
        energy: "Tracke tes niveaux d'énergie 3 fois par jour pendant une semaine pour identifier tes patterns.",
        lucidity: "Demande à 2 personnes de confiance un feedback honnête sur un point précis cette semaine.",
        discipline: "Installe une seule micro-habitude de 2 minutes et tiens-la 21 jours sans exception.",
        decision: "Règle des 2 minutes : toute décision réversible doit être prise en moins de 2 minutes.",
        relationships: "Planifie un moment de connexion authentique (pas transactionnel) avec quelqu'un cette semaine.",
        resilience: "Après chaque échec, écris : Ce que j'ai appris + Ce que je fais différemment.",
        growth: "Bloque 30 min par semaine pour apprendre quelque chose de nouveau, sans exception.",
        impact: "Identifie une action concrète qui bénéficie à quelqu'un d'autre que toi cette semaine.",
        emotional_reg: "Pratique le protocole TIPP (Temperature, Exercice intense, Respiration, Relaxation musculaire) lors de la prochaine vague émotionnelle.",
        somatic: "Fais un body scan de 10 min chaque soir : parcours ton corps de la tête aux pieds en observant chaque sensation.",
        shadow: "Identifie un trait qui t'agace chez quelqu'un cette semaine. Cherche honnêtement sa version cachée en toi.",
        spiritual: "10 minutes de silence complet par jour. Pas de méditation guidée. Juste toi et le silence. Observe ce qui émerge.",
        inner_child: "Écris une lettre bienveillante à toi-même enfant. Dis-lui ce que tu aurais aimé entendre à l'époque.",
        presence: "Pratique l'espace de respiration 3 minutes (MBCT) : 3 fois par jour, entre deux activités. Conscience → Respiration → Expansion."
    };

    var RECS_HIGH = {
        clarity: "Challenge : peux-tu résumer ta mission de vie en une phrase de 10 mots ?",
        alignment: "Élimine une activité récurrente qui ne sert plus tes objectifs actuels.",
        energy: "Expérimente un protocole de récupération avancé : sauna, bain froid, ou méditation longue.",
        lucidity: "Tiens un journal de décisions avec les raisons et résultats pour affiner ton jugement.",
        discipline: "Ajoute une contrainte volontaire à ta routine pour renforcer ta résistance mentale.",
        decision: "Pratique la prise de décision sous pression : limite-toi à 5 minutes pour les choix moyens.",
        relationships: "Identifie une relation à approfondir et propose une collaboration ou projet commun.",
        resilience: "Expose-toi volontairement à un inconfort contrôlé pour élargir ta zone de confort.",
        growth: "Enseigne ce que tu sais à quelqu'un d'autre - c'est le meilleur test de maîtrise.",
        impact: "Mesure ton impact réel : combien de personnes as-tu aidées ce mois-ci et comment ?",
        emotional_reg: "Pratique l'action opposée (DBT) : quand l'émotion est injustifiée, fais l'inverse de ce qu'elle te pousse à faire.",
        somatic: "Expérimente la pendulation somatique (Levine) : alterne entre zone agréable et zone de tension dans le corps.",
        shadow: "Initie un dialogue intérieur avec ta partie la plus rejetée. Demande-lui : 'Quel cadeau portes-tu ?'",
        spiritual: "Pratique Vipassana 20 min : balayage corporel avec équanimité totale. Observe l'impermanence de TOUTE sensation.",
        inner_child: "Tu as déjà intégré ton enfant intérieur. Maintenant, deviens le mentor que tu aurais aimé avoir.",
        presence: "Expérimente une journée en pleine conscience continue : chaque geste, chaque pas, chaque parole - avec conscience totale."
    };

    function getDetailedRecommendations(axeScores) {
        if (typeof QUESTION_BANK === 'undefined') return [];
        var AXES = QUESTION_BANK.AXES;
        var sorted = AXES.map(function(a) {
            var data = axeScores[a.id] || { score: 50 };
            return { id: a.id, label: a.label, score: typeof data === 'number' ? data : data.score };
        }).sort(function(a,b) { return a.score - b.score; });

        var recs = [];
        sorted.slice(0, 3).forEach(function(axis) {
            var rec = axis.score < 70 ? RECS_LOW[axis.id] : RECS_HIGH[axis.id];
            if (rec) {
                recs.push({ axisId: axis.id, axisLabel: axis.label, score: axis.score, recommendation: rec });
            }
        });
        return recs;
    }

    return { selectQuestionsForAudit: selectQuestionsForAudit, calculateDetailedScore: calculateDetailedScore, getDetailedRecommendations: getDetailedRecommendations };
})();

if (typeof window !== 'undefined') { window.PaScoring = PaScoring; }
