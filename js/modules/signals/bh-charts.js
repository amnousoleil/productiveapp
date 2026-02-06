/**
 * Behavioral Charts - SVG animated visualizations
 * ProductiveApp v4.0
 */
const BehavioralCharts = (function() {
    'use strict';

    function activityClock(hourlyData, size = 200) {
        const cx = size / 2, cy = size / 2, r = size * 0.4;
        const max = Math.max(...hourlyData, 1);

        let paths = '';
        hourlyData.forEach((val, hour) => {
            const intensity = val / max;
            const angle1 = (hour - 6) * 15 * Math.PI / 180;
            const angle2 = (hour - 5) * 15 * Math.PI / 180;
            const innerR = r * 0.5;
            const outerR = r * (0.5 + intensity * 0.5);

            const x1 = cx + Math.cos(angle1) * innerR, y1 = cy + Math.sin(angle1) * innerR;
            const x2 = cx + Math.cos(angle1) * outerR, y2 = cy + Math.sin(angle1) * outerR;
            const x3 = cx + Math.cos(angle2) * outerR, y3 = cy + Math.sin(angle2) * outerR;
            const x4 = cx + Math.cos(angle2) * innerR, y4 = cy + Math.sin(angle2) * innerR;

            const opacity = 0.2 + intensity * 0.8;
            paths += `<path d="M${x1},${y1} L${x2},${y2} A${outerR},${outerR} 0 0,1 ${x3},${y3} L${x4},${y4} A${innerR},${innerR} 0 0,0 ${x1},${y1}" fill="var(--primary)" fill-opacity="${opacity}" class="bh-clock-segment" style="animation-delay:${hour*30}ms"/>`;
        });

        const hours = [0, 6, 12, 18].map(h => {
            const a = (h - 6) * 15 * Math.PI / 180;
            const x = cx + Math.cos(a) * (r + 15), y = cy + Math.sin(a) * (r + 15);
            return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="bh-clock-label">${h}h</text>`;
        }).join('');

        return `<svg viewBox="0 0 ${size} ${size}" class="bh-chart-clock">${paths}<circle cx="${cx}" cy="${cy}" r="${r*0.48}" fill="var(--surface)" stroke="var(--border)" stroke-width="1"/>${hours}</svg>`;
    }

    function weeklyHeatmap(data, width = 280, height = 180) {
        const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
        const cellW = (width - 30) / 7, cellH = (height - 20) / 24;
        let cells = '';

        const flatMax = Math.max(...data.flat(), 1);
        data.forEach((dayData, d) => {
            dayData.forEach((val, h) => {
                const intensity = val / flatMax;
                const x = 25 + d * cellW, y = h * cellH;
                const color = intensity > 0.7 ? 'var(--primary)' : intensity > 0.3 ? 'var(--accent)' : 'var(--surface-hover)';
                cells += `<rect x="${x}" y="${y}" width="${cellW-1}" height="${cellH-1}" rx="2" fill="${color}" fill-opacity="${0.3 + intensity * 0.7}" class="bh-heatmap-cell" style="animation-delay:${(d*24+h)*5}ms"/>`;
            });
        });

        const dayLabels = days.map((d, i) => `<text x="${30 + i * cellW + cellW/2}" y="${height - 5}" text-anchor="middle" class="bh-heatmap-label">${d}</text>`).join('');
        const hourLabels = [0, 6, 12, 18].map(h => `<text x="20" y="${h * cellH + cellH/2}" text-anchor="end" dominant-baseline="middle" class="bh-heatmap-label">${h}h</text>`).join('');

        return `<svg viewBox="0 0 ${width} ${height}" class="bh-chart-heatmap">${cells}${dayLabels}${hourLabels}</svg>`;
    }

    function evolutionCurve(scores, width = 320, height = 120) {
        if (!scores.length) return '<svg></svg>';

        const padding = { top: 10, right: 10, bottom: 25, left: 35 };
        const w = width - padding.left - padding.right;
        const h = height - padding.top - padding.bottom;

        const vals = scores.map(s => s.score);
        const min = Math.min(...vals) - 5, max = Math.max(...vals) + 5;

        const points = scores.map((s, i) => {
            const x = padding.left + (i / (scores.length - 1)) * w;
            const y = padding.top + h - ((s.score - min) / (max - min)) * h;
            return `${x},${y}`;
        });

        const pathD = `M${points.join(' L')}`;
        const areaD = `M${padding.left},${padding.top + h} L${points.join(' L')} L${padding.left + w},${padding.top + h} Z`;

        const gridLines = [0, 0.5, 1].map(p => {
            const y = padding.top + h * (1 - p);
            const val = Math.round(min + (max - min) * p);
            return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="var(--border)" stroke-dasharray="3,3"/><text x="${padding.left - 5}" y="${y}" text-anchor="end" dominant-baseline="middle" class="bh-curve-label">${val}</text>`;
        }).join('');

        return `<svg viewBox="0 0 ${width} ${height}" class="bh-chart-curve">
            ${gridLines}
            <path d="${areaD}" fill="var(--primary)" fill-opacity="0.1"/>
            <path d="${pathD}" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" class="bh-curve-line"/>
            <circle cx="${points[points.length-1].split(',')[0]}" cy="${points[points.length-1].split(',')[1]}" r="4" fill="var(--primary)" class="bh-curve-dot"/>
        </svg>`;
    }

    function projectBars(projects, width = 300, barHeight = 28) {
        const height = projects.length * (barHeight + 8) + 10;
        const maxScore = Math.max(...projects.map(p => p.score), 100);

        const bars = projects.map((p, i) => {
            const y = 5 + i * (barHeight + 8);
            const barW = (p.score / maxScore) * (width - 100);
            const color = p.score > 70 ? 'var(--success)' : p.score > 40 ? 'var(--warning)' : 'var(--danger)';

            return `<g class="bh-bar-group" style="animation-delay:${i * 100}ms">
                <text x="5" y="${y + barHeight/2 + 4}" class="bh-bar-label">${p.name}</text>
                <rect x="90" y="${y}" width="${barW}" height="${barHeight}" rx="4" fill="${color}" fill-opacity="0.8" class="bh-bar-fill"/>
                <text x="${95 + barW}" y="${y + barHeight/2 + 4}" class="bh-bar-value">${p.score}%</text>
            </g>`;
        }).join('');

        return `<svg viewBox="0 0 ${width} ${height}" class="bh-chart-bars">${bars}</svg>`;
    }

    return { activityClock, weeklyHeatmap, evolutionCurve, projectBars };
})();

if (typeof window !== 'undefined') window.BehavioralCharts = BehavioralCharts;
