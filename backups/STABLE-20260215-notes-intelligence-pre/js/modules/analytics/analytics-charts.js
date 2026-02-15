/**
 * Analytics Charts Module
 * Renders SVG bar chart and heatmap
 */

var AnalyticsCharts = (function() {
    'use strict';

    /**
     * Render productivity bar chart (SVG)
     * @param {string} containerId
     * @param {Array} dailyStats - Array of {date, completion_rate, tasks_completed}
     */
    function renderBarChart(containerId, dailyStats) {
        var container = document.getElementById(containerId);
        if (!container || !dailyStats || !dailyStats.length) return;

        var width = 100;
        var height = 120;
        var barWidth = Math.floor(80 / dailyStats.length);
        var maxValue = Math.max.apply(null, dailyStats.map(function(d) { return d.completion_rate || 0; }));
        if (maxValue < 10) maxValue = 100;

        var bars = dailyStats.map(function(stat, i) {
            var barHeight = (stat.completion_rate / maxValue) * 80;
            var x = 10 + i * (barWidth + 2);
            var y = 90 - barHeight;
            var dayLabel = new Date(stat.date).toLocaleDateString('fr-FR', { weekday: 'short' }).substring(0, 2);

            return '<g>' +
                '<rect x="' + x + '" y="' + y + '" width="' + (barWidth - 1) + '" height="' + barHeight + '" ' +
                    'fill="var(--primary, #8b5cf6)" rx="2" opacity="0.8">' +
                    '<title>' + stat.date + ': ' + stat.completion_rate + '%</title>' +
                '</rect>' +
                '<text x="' + (x + barWidth/2 - 1) + '" y="98" fill="var(--text-muted)" font-size="6" text-anchor="middle">' + dayLabel + '</text>' +
            '</g>';
        }).join('');

        var svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="xMidYMid meet">' +
            '<line x1="10" y1="90" x2="95" y2="90" stroke="var(--border, #333)" stroke-width="0.5"/>' +
            bars +
        '</svg>';

        container.innerHTML = svg;
    }

    /**
     * Render GitHub-style heatmap
     * @param {string} containerId
     * @param {Array} heatmapData - Array of {date, count}
     */
    function renderHeatmap(containerId, heatmapData) {
        var container = document.getElementById(containerId);
        if (!container) return;

        if (!heatmapData || !heatmapData.length) {
            heatmapData = generateEmptyHeatmap(90);
        }

        var cellSize = 10;
        var cellGap = 2;
        var weeks = Math.ceil(heatmapData.length / 7);
        var width = weeks * (cellSize + cellGap) + 30;
        var height = 7 * (cellSize + cellGap) + 20;

        var maxCount = Math.max.apply(null, heatmapData.map(function(d) { return d.count || 0; }));
        if (maxCount < 1) maxCount = 1;

        var cells = heatmapData.map(function(day, i) {
            var week = Math.floor(i / 7);
            var dayOfWeek = i % 7;
            var x = 25 + week * (cellSize + cellGap);
            var y = 15 + dayOfWeek * (cellSize + cellGap);
            var intensity = day.count / maxCount;
            var color = getHeatmapColor(intensity);

            return '<rect x="' + x + '" y="' + y + '" width="' + cellSize + '" height="' + cellSize + '" ' +
                'fill="' + color + '" rx="2">' +
                '<title>' + day.date + ': ' + day.count + ' actions</title>' +
            '</rect>';
        }).join('');

        var dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
        var labels = dayLabels.map(function(d, i) {
            if (i % 2 === 0) {
                return '<text x="8" y="' + (22 + i * (cellSize + cellGap)) + '" fill="var(--text-muted)" font-size="8">' + d + '</text>';
            }
            return '';
        }).join('');

        var svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="xMidYMid meet">' +
            labels + cells +
            '<g transform="translate(' + (width - 80) + ', 5)">' +
                '<text x="0" y="8" fill="var(--text-muted)" font-size="7">Moins</text>' +
                '<rect x="25" y="2" width="8" height="8" fill="var(--surface, #1a1a2e)" rx="1"/>' +
                '<rect x="35" y="2" width="8" height="8" fill="rgba(139,92,246,0.25)" rx="1"/>' +
                '<rect x="45" y="2" width="8" height="8" fill="rgba(139,92,246,0.5)" rx="1"/>' +
                '<rect x="55" y="2" width="8" height="8" fill="rgba(139,92,246,0.75)" rx="1"/>' +
                '<rect x="65" y="2" width="8" height="8" fill="var(--primary, #8b5cf6)" rx="1"/>' +
                '<text x="75" y="8" fill="var(--text-muted)" font-size="7">Plus</text>' +
            '</g>' +
        '</svg>';

        container.innerHTML = svg;
    }

    function getHeatmapColor(intensity) {
        if (intensity <= 0) return 'var(--surface, #1a1a2e)';
        if (intensity < 0.25) return 'rgba(139,92,246,0.25)';
        if (intensity < 0.5) return 'rgba(139,92,246,0.5)';
        if (intensity < 0.75) return 'rgba(139,92,246,0.75)';
        return 'var(--primary, #8b5cf6)';
    }

    function generateEmptyHeatmap(days) {
        var heatmap = [];
        var now = new Date();
        for (var i = days - 1; i >= 0; i--) {
            var date = new Date(now);
            date.setDate(date.getDate() - i);
            heatmap.push({
                date: date.toISOString().split('T')[0],
                count: 0
            });
        }
        return heatmap;
    }

    /**
     * Render trend indicator
     * @param {string} containerId
     * @param {number} value - Current value
     * @param {string} trend - 'up', 'down', or 'neutral'
     * @param {number} percent - Change percentage
     */
    function renderTrendIndicator(containerId, value, trend, percent) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var color = trend === 'up' ? '#22c55e' : (trend === 'down' ? '#ef4444' : 'var(--text-muted)');
        var arrow = trend === 'up' ? 'M12 19V5M5 12l7-7 7 7' : (trend === 'down' ? 'M12 5v14M5 12l7 7 7-7' : 'M5 12h14');
        var sign = percent > 0 ? '+' : '';

        var svg = '<svg viewBox="0 0 60 24" style="width:60px;height:24px">' +
            '<path d="' + arrow + '" stroke="' + color + '" stroke-width="2" fill="none" transform="scale(0.6) translate(2,4)"/>' +
            '<text x="20" y="17" fill="' + color + '" font-size="12" font-weight="600">' + sign + percent + '%</text>' +
        '</svg>';

        container.innerHTML = svg;
    }

    return {
        renderBarChart: renderBarChart,
        renderHeatmap: renderHeatmap,
        renderTrendIndicator: renderTrendIndicator
    };
})();

if (typeof window !== 'undefined') {
    window.AnalyticsCharts = AnalyticsCharts;
}
