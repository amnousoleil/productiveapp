/**
 * REPORTS HEATMAP - ProductiveApp Premium
 * Heatmap de contributions style GitHub (365 jours)
 */

const ReportsHeatmap = (function() {
    'use strict';

    var MONTHS_FR = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    var DAYS_FR = ['', 'Lun', '', 'Mer', '', 'Ven', ''];

    /**
     * Render the contribution heatmap
     * @param {string} containerId
     * @param {Array} data - [{date:'YYYY-MM-DD', count:N}, ...]
     */
    function render(containerId, data) {
        var container = document.getElementById(containerId);
        if (!container) return;

        if (!data || !data.length) {
            data = generateEmptyYear();
        }

        var cellSize = 11;
        var cellGap = 3;
        var cellStep = cellSize + cellGap;
        var weeks = Math.ceil(data.length / 7);
        var leftMargin = 28;
        var topMargin = 20;
        var width = leftMargin + weeks * cellStep + 10;
        var height = topMargin + 7 * cellStep + 10;

        var maxCount = 1;
        for (var i = 0; i < data.length; i++) {
            if (data[i].count > maxCount) maxCount = data[i].count;
        }

        // Month labels
        var monthLabels = buildMonthLabels(data, leftMargin, cellStep, topMargin);

        // Day labels (Lun, Mer, Ven)
        var dayLabelsSvg = '';
        for (var d = 0; d < 7; d++) {
            if (DAYS_FR[d]) {
                var y = topMargin + d * cellStep + cellSize - 1;
                dayLabelsSvg += '<text x="0" y="' + y + '" fill="var(--text-muted, #64748b)" font-size="9" font-family="system-ui, sans-serif" opacity="0.7">' + DAYS_FR[d] + '</text>';
            }
        }

        // Cells
        var cells = '';
        for (var idx = 0; idx < data.length; idx++) {
            var week = Math.floor(idx / 7);
            var dayOfWeek = idx % 7;
            var x = leftMargin + week * cellStep;
            var cy = topMargin + dayOfWeek * cellStep;
            var intensity = data[idx].count / maxCount;
            var color = getIntensityColor(intensity);
            var tooltipText = formatDateFr(data[idx].date) + ' : ' + data[idx].count + ' tache' + (data[idx].count !== 1 ? 's' : '');

            cells += '<rect x="' + x + '" y="' + cy + '" width="' + cellSize + '" height="' + cellSize + '" ' +
                'fill="' + color + '" rx="2" ry="2" class="hm-cell" data-date="' + data[idx].date + '" data-count="' + data[idx].count + '">' +
                '<title>' + tooltipText + '</title>' +
                '</rect>';
        }

        var svg = '<svg class="contribution-heatmap-svg" viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="xMinYMid meet" style="width:100%;height:auto;max-height:140px;">' +
            dayLabelsSvg + monthLabels + cells +
            '</svg>';

        container.innerHTML =
            '<div class="heatmap-wrapper" style="overflow-x:auto;padding:4px 0;">' + svg + '</div>' +
            '<div class="heatmap-legend">' +
                '<span class="heatmap-legend-label">Moins</span>' +
                '<div class="heatmap-legend-cells">' +
                    '<div class="hm-legend-cell" style="background:var(--bg-tertiary, #1e1e3a)"></div>' +
                    '<div class="hm-legend-cell" style="background:rgba(224,120,64,0.2)"></div>' +
                    '<div class="hm-legend-cell" style="background:rgba(224,120,64,0.4)"></div>' +
                    '<div class="hm-legend-cell" style="background:rgba(224,120,64,0.7)"></div>' +
                    '<div class="hm-legend-cell" style="background:var(--accent, #e07840)"></div>' +
                '</div>' +
                '<span class="heatmap-legend-label">Plus</span>' +
            '</div>';
    }

    function getIntensityColor(intensity) {
        if (intensity <= 0) return 'var(--bg-tertiary, #1e1e3a)';
        if (intensity < 0.25) return 'rgba(224,120,64,0.2)';
        if (intensity < 0.5) return 'rgba(224,120,64,0.4)';
        if (intensity < 0.75) return 'rgba(224,120,64,0.7)';
        return 'var(--accent, #e07840)';
    }

    function buildMonthLabels(data, leftMargin, cellStep, topMargin) {
        var labels = '';
        var lastMonth = -1;
        for (var i = 0; i < data.length; i += 7) {
            var d = new Date(data[i].date + 'T00:00:00');
            var month = d.getMonth();
            if (month !== lastMonth) {
                lastMonth = month;
                var week = Math.floor(i / 7);
                var x = leftMargin + week * cellStep;
                labels += '<text x="' + x + '" y="' + (topMargin - 6) + '" fill="var(--text-muted, #64748b)" font-size="9" font-family="system-ui, sans-serif" opacity="0.7">' + MONTHS_FR[month] + '</text>';
            }
        }
        return labels;
    }

    function generateEmptyYear() {
        var data = [];
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var start = new Date(today);
        start.setDate(start.getDate() - 364);
        start.setDate(start.getDate() - start.getDay()); // align to Sunday

        var current = new Date(start);
        while (current <= today) {
            var key = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0') + '-' + String(current.getDate()).padStart(2, '0');
            data.push({ date: key, count: 0 });
            current.setDate(current.getDate() + 1);
        }
        return data;
    }

    function formatDateFr(dateStr) {
        var parts = dateStr.split('-');
        var day = parseInt(parts[2]);
        var month = MONTHS_FR[parseInt(parts[1]) - 1];
        return day + ' ' + month + ' ' + parts[0];
    }

    return { render: render };
})();

if (typeof window !== 'undefined') {
    window.ReportsHeatmap = ReportsHeatmap;
}
