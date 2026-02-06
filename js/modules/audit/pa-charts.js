/**
 * PSYCHO-AUDIT CHARTS - SVG chart generation
 * ProductiveApp v5.0
 */

const PaCharts = (function() {
    'use strict';

    /**
     * Generate radar chart for 5 axes
     */
    function generateRadarChart(answers) {
        var AXES = PaState.AXES;
        var size = 250;
        var cx = size / 2;
        var cy = size / 2;
        var r = size / 2 - 45;
        var angleStep = (2 * Math.PI) / 5;

        // Pentagon levels
        var levels = '';
        [0.2, 0.4, 0.6, 0.8, 1].forEach(function(level) {
            var points = AXES.map(function(_, i) {
                var angle = -Math.PI / 2 + i * angleStep;
                return (cx + r * level * Math.cos(angle)) + ',' + (cy + r * level * Math.sin(angle));
            }).join(' ');
            levels += '<polygon points="' + points + '" fill="none" stroke="var(--border, rgba(139,92,246,0.2))" stroke-width="1"/>';
        });

        // Axes lines
        var axesLines = '';
        AXES.forEach(function(_, i) {
            var angle = -Math.PI / 2 + i * angleStep;
            axesLines += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + r * Math.cos(angle)) + '" y2="' + (cy + r * Math.sin(angle)) + '" stroke="var(--border, rgba(139,92,246,0.3))" stroke-width="1"/>';
        });

        // Data polygon (answers = {axisId: score 1-5})
        var dataPoints = AXES.map(function(axis, i) {
            var val = (answers[axis.id] || 0) / 5;
            var angle = -Math.PI / 2 + i * angleStep;
            return (cx + r * val * Math.cos(angle)) + ',' + (cy + r * val * Math.sin(angle));
        }).join(' ');

        // Labels
        var labels = '';
        AXES.forEach(function(axis, i) {
            var angle = -Math.PI / 2 + i * angleStep;
            var lx = cx + (r + 30) * Math.cos(angle);
            var ly = cy + (r + 30) * Math.sin(angle);
            var score = answers[axis.id] || 0;
            labels += '<text x="' + lx + '" y="' + ly + '" text-anchor="middle" dominant-baseline="middle" fill="var(--text-secondary, #888)" font-size="10">' + axis.shortLabel + '</text>';
            labels += '<text x="' + lx + '" y="' + (ly + 14) + '" text-anchor="middle" fill="' + PaState.getScoreColor(score * 20) + '" font-size="12" font-weight="700">' + score + '/5</text>';
        });

        // Data points
        var dots = '';
        AXES.forEach(function(axis, i) {
            var val = (answers[axis.id] || 0) / 5;
            var angle = -Math.PI / 2 + i * angleStep;
            var dx = cx + r * val * Math.cos(angle);
            var dy = cy + r * val * Math.sin(angle);
            dots += '<circle cx="' + dx + '" cy="' + dy + '" r="5" fill="var(--primary, #8b5cf6)" stroke="#fff" stroke-width="2"/>';
        });

        return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '">' +
            levels + axesLines +
            '<polygon points="' + dataPoints + '" fill="rgba(139,92,246,0.3)" stroke="var(--primary, #8b5cf6)" stroke-width="2"/>' +
            dots + labels +
            '</svg>';
    }

    /**
     * Generate trends line chart (last 7 audits)
     */
    function generateTrendsChart(audits) {
        if (!audits || audits.length < 2) {
            return '<div class="trends-empty">Completez au moins 2 audits pour voir les tendances.</div>';
        }

        var data = audits.slice(0, 7).reverse();
        var width = 100;
        var height = 60;
        var maxScore = 100;
        var padding = 5;
        var step = (width - padding * 2) / (data.length - 1);

        // Line path
        var pathPoints = data.map(function(audit, i) {
            var x = padding + i * step;
            var y = height - padding - ((audit.score / maxScore) * (height - padding * 2));
            return (i === 0 ? 'M' : 'L') + x + ',' + y;
        }).join(' ');

        // Dots
        var dots = data.map(function(audit, i) {
            var x = padding + i * step;
            var y = height - padding - ((audit.score / maxScore) * (height - padding * 2));
            return '<circle cx="' + x + '" cy="' + y + '" r="3" fill="' + PaState.getScoreColor(audit.score) + '"/>';
        }).join('');

        // Area fill
        var areaPoints = 'M' + padding + ',' + (height - padding);
        data.forEach(function(audit, i) {
            var x = padding + i * step;
            var y = height - padding - ((audit.score / maxScore) * (height - padding * 2));
            areaPoints += ' L' + x + ',' + y;
        });
        areaPoints += ' L' + (padding + (data.length - 1) * step) + ',' + (height - padding) + ' Z';

        return '<svg viewBox="0 0 ' + width + ' ' + height + '" class="trends-svg" preserveAspectRatio="none">' +
            '<defs><linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">' +
            '<stop offset="0%" style="stop-color:var(--primary, #8b5cf6);stop-opacity:0.4"/>' +
            '<stop offset="100%" style="stop-color:var(--primary, #8b5cf6);stop-opacity:0.05"/>' +
            '</linearGradient></defs>' +
            '<path d="' + areaPoints + '" fill="url(#trendGrad)"/>' +
            '<path d="' + pathPoints + '" fill="none" stroke="var(--primary, #8b5cf6)" stroke-width="2" stroke-linecap="round"/>' +
            dots +
            '</svg>';
    }

    /**
     * Generate 30-day evolution chart
     */
    function generate30DayChart(audits) {
        if (!audits || audits.length < 2) {
            return '<div class="chart-empty">Pas assez de donnees pour afficher l\'evolution.</div>';
        }

        var width = 300;
        var height = 80;
        var padding = 10;
        var data = audits.slice(0, 30).reverse();
        var step = (width - padding * 2) / Math.max(data.length - 1, 1);

        var pathPoints = data.map(function(a, i) {
            var x = padding + i * step;
            var y = height - padding - ((a.score / 100) * (height - padding * 2));
            return (i === 0 ? 'M' : 'L') + x + ',' + y;
        }).join(' ');

        return '<svg viewBox="0 0 ' + width + ' ' + height + '" class="evolution-svg">' +
            '<path d="' + pathPoints + '" fill="none" stroke="var(--primary, #8b5cf6)" stroke-width="2"/>' +
            '</svg>';
    }

    return {
        generateRadarChart: generateRadarChart,
        generateTrendsChart: generateTrendsChart,
        generate30DayChart: generate30DayChart
    };
})();

if (typeof window !== 'undefined') {
    window.PaCharts = PaCharts;
}
