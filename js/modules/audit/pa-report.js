/**
 * PSYCHO-AUDIT REPORT - AI-generated deep analysis
 * ProductiveApp v5.0
 *
 * Generates a premium psycho-productivity audit report
 * via OpenAI through the backend /api/v1/ai/generate endpoint.
 */
const PaReport = (function() {
    'use strict';

    let isGenerating = false;
    let lastReport = null;

    var SYSTEM_PROMPT = [
        'Tu es un expert mondial en developpement humain, psychologie positive, neurosciences et performance.',
        'Tu combines les meilleures approches de :',
        '- Psychologie positive (Seligman, Csikszentmihalyi)',
        '- Neurosciences du bien-etre (Andrew Huberman)',
        '- Intelligence emotionnelle (Daniel Goleman)',
        '- Developpement personnel profond (Carl Jung, Viktor Frankl)',
        '- Science de la motivation (Deci & Ryan, Self-Determination Theory)',
        '- Haute performance (Jim Loehr, Peak Performance)',
        '',
        'MISSION : Generer un rapport d\'audit psycho-productivite PREMIUM, profond et transformateur.',
        'Le rapport doit aider la personne a SE RETROUVER, a CONNECTER avec ses plus grands potentiels,',
        'et a activer les mecanismes internes d\'harmonie et de developpement fonctionnel.',
        '',
        'FORMAT DU RAPPORT (en markdown) :',
        '',
        '## Diagnostic Global',
        'Score + interpretation profonde (pas superficielle). Qu\'est-ce que ce score REVELE sur l\'etat interieur ?',
        '',
        '## Carte de vos Forces Vives',
        'Identifier les 2-3 axes les plus forts. Expliquer POURQUOI ce sont des leviers puissants.',
        'Montrer comment ces forces peuvent devenir des catalyseurs pour les axes plus faibles.',
        '',
        '## Zones de Croissance',
        'Les axes les plus bas. Analyser les causes profondes potentielles (pas juste les symptomes).',
        'Proposer des pistes de travail basees sur la science.',
        '',
        '## Dynamique d\'Evolution',
        'Si historique disponible : analyser la trajectoire. Tendance, inflexions, patterns.',
        'Si premier audit : expliquer l\'importance du suivi longitudinal.',
        '',
        '## Plan d\'Action Transformateur (7 jours)',
        'Un tableau jour par jour avec des actions CONCRETES, REALISABLES et PROGRESSIVES.',
        'Chaque action doit etre liee a un axe specifique et avoir un objectif clair.',
        'Format: | Jour | Action | Axe cible | Pourquoi |',
        '',
        '## Cle de Voute',
        'UN insight profond et personnel. La chose la plus importante a retenir.',
        'Une phrase qui peut changer la perspective de la personne.',
        '',
        'REGLES :',
        '- Ecris en francais',
        '- Sois profond mais accessible, jamais condescendant',
        '- Utilise un ton bienveillant mais sans complaisance',
        '- Chaque recommandation doit etre basee sur un principe scientifique ou philosophique solide',
        '- Maximum 800 mots',
        '- Pas de blabla generique : chaque phrase doit etre SPECIFIQUE aux resultats de la personne'
    ].join('\n');

    async function generateReport() {
        if (isGenerating) return null;
        isGenerating = true;
        try {
            var score = PaState.calculateScore();
            var answers = PaState.getAnswers();
            var recommendations = PaState.getRecommendations();
            var history = await PaApi.loadHistory();
            var context = buildContext(score, answers, recommendations, history);

            var report = await callAI(context);
            lastReport = report;
            return report;
        } catch (error) {
            console.error('PaReport: Generation failed', error);
            return '## Erreur\n\nImpossible de generer le rapport. Veuillez reessayer.';
        } finally {
            isGenerating = false;
        }
    }

    function buildContext(score, answers, recommendations, history) {
        var QUESTIONS = PaState.QUESTIONS;
        var AXES = PaState.AXES;

        // Build detailed axis scores
        var axisScores = {};
        AXES.forEach(function(axis) {
            var axisQuestions = QUESTIONS.filter(function(q) { return q.axis === axis.id; });
            var total = 0;
            var count = 0;
            axisQuestions.forEach(function(q) {
                var val = answers[q.id];
                if (val) { total += val; count++; }
            });
            axisScores[axis.id] = {
                label: axis.label,
                icon: axis.icon,
                score: count > 0 ? Math.round((total / count) * 20) : 0,
                raw: count > 0 ? Math.round((total / count) * 10) / 10 : 0
            };
        });

        // Build answers detail
        var answersDetail = QUESTIONS.map(function(q) {
            var axis = AXES.find(function(a) { return a.id === q.axis; });
            return (axis ? axis.icon + ' ' : '') + q.text + ' → ' + (answers[q.id] || 0) + '/5';
        }).join('\n');

        // Build axis summary
        var axisSummary = AXES.map(function(axis) {
            var s = axisScores[axis.id];
            return axis.icon + ' ' + axis.label + ': ' + s.score + '/100 (' + s.raw + '/5)';
        }).join('\n');

        // Build history
        var historyText = 'Premier audit';
        if (history && history.length > 0) {
            historyText = history.slice(0, 10).map(function(a) {
                return new Date(a.date).toLocaleDateString('fr-FR') + ': ' + a.score + '/100';
            }).join('\n');
        }

        // Recommendations text
        var recsText = recommendations.map(function(r) {
            return '- ' + r.label + ': ' + r.recommendation;
        }).join('\n');

        // Trend
        var trend = calculateTrend(history);

        return {
            score: score,
            axisSummary: axisSummary,
            answersDetail: answersDetail,
            historyText: historyText,
            recsText: recsText,
            trend: trend
        };
    }

    function calculateTrend(history) {
        if (!history || history.length < 2) return 'premier audit';
        var recent = history.slice(0, 3);
        var avg = recent.reduce(function(s, a) { return s + a.score; }, 0) / recent.length;
        var older = history.slice(3, 6);
        if (older.length === 0) return 'donnees insuffisantes';
        var oldAvg = older.reduce(function(s, a) { return s + a.score; }, 0) / older.length;
        if (avg > oldAvg + 5) return 'ascendante (+' + Math.round(avg - oldAvg) + ' pts)';
        if (avg < oldAvg - 5) return 'descendante (' + Math.round(avg - oldAvg) + ' pts)';
        return 'stable';
    }

    /**
     * Real AI call via backend POST /api/v1/ai/generate
     */
    async function callAI(context) {
        var userPrompt = [
            'Voici les resultats de mon audit psycho-productivite :',
            '',
            'SCORE GLOBAL : ' + context.score + '/100',
            'TENDANCE : ' + context.trend,
            '',
            'SCORES PAR AXE :',
            context.axisSummary,
            '',
            'DETAIL DES REPONSES :',
            context.answersDetail,
            '',
            'RECOMMANDATIONS SYSTEME :',
            context.recsText,
            '',
            'HISTORIQUE :',
            context.historyText,
            '',
            'Genere mon rapport d\'audit premium.'
        ].join('\n');

        var response = await Api.post('/ai/generate', {
            prompt: userPrompt,
            system: SYSTEM_PROMPT,
            max_tokens: 2000
        });

        if (response && response.success && response.data && response.data.content) {
            return response.data.content;
        }

        throw new Error('AI response invalid');
    }

    function renderReport(markdown) {
        if (!markdown) return '<div class="pa-report-empty">Aucun rapport disponible</div>';
        var html = markdown
            .replace(/^#### (.+)$/gm, '<h5>$1</h5>')
            .replace(/^### (.+)$/gm, '<h4>$1</h4>')
            .replace(/^## (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/```[\s\S]*?```/g, '')
            .replace(/\|(.+)\|/g, function(m) {
                if (m.match(/^\|[\s-]+\|$/)) return '';
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
            '<span>Analyse profonde en cours... (15-30 sec)</span></div>';
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
