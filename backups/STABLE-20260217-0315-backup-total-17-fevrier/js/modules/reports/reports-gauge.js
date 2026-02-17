/**
 * REPORTS GAUGE - ProductiveApp Premium
 * Jauge speedometre SVG animee (0-100)
 */

const ReportsGauge = (function() {
    'use strict';

    /**
     * Render the speedometer gauge
     * @param {string} containerId
     * @param {number} score (0-100)
     * @param {Object} options - { size, label }
     */
    function render(containerId, score, options) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var opts = options || {};
        var size = opts.size || 260;
        var label = opts.label || 'Score Global';
        score = Math.max(0, Math.min(100, score || 0));

        var cx = size / 2;
        var cy = size / 2 + 10;
        var radius = size / 2 - 28;
        var startAngleDeg = 225; // bottom-left
        var endAngleDeg = -45;   // bottom-right (going clockwise)
        var sweepDeg = 270;       // total arc degrees

        // Score color
        var scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
        var scoreColorGlow = score >= 70 ? 'rgba(16,185,129,0.4)' : score >= 40 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)';

        // Arc calculations using SVG path
        function polarToCartesian(cx, cy, r, angleDeg) {
            var rad = (angleDeg - 90) * Math.PI / 180;
            return {
                x: cx + r * Math.cos(rad),
                y: cy + r * Math.sin(rad)
            };
        }

        function describeArc(cx, cy, r, startAngle, endAngle) {
            var start = polarToCartesian(cx, cy, r, endAngle);
            var end = polarToCartesian(cx, cy, r, startAngle);
            var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
            return 'M ' + start.x + ' ' + start.y + ' A ' + r + ' ' + r + ' 0 ' + largeArcFlag + ' 0 ' + end.x + ' ' + end.y;
        }

        // Background arc (full 270deg)
        var bgArc = describeArc(cx, cy, radius, -225, 45);

        // Score arc (proportional)
        var scoreAngle = (score / 100) * sweepDeg;
        var scoreArc = score > 0 ? describeArc(cx, cy, radius, -225, -225 + scoreAngle) : '';

        // Tick marks
        var ticks = '';
        for (var i = 0; i <= 100; i += 5) {
            var angle = -225 + (i / 100) * sweepDeg;
            var rad = (angle - 90) * Math.PI / 180;
            var isMajor = (i % 20 === 0);
            var isMinor = (i % 10 === 0) && !isMajor;
            var innerR = radius - (isMajor ? 14 : isMinor ? 10 : 6);
            var outerR = radius - 2;

            var x1 = cx + innerR * Math.cos(rad);
            var y1 = cy + innerR * Math.sin(rad);
            var x2 = cx + outerR * Math.cos(rad);
            var y2 = cy + outerR * Math.sin(rad);

            var tickWidth = isMajor ? 2 : 1;
            var tickOpacity = isMajor ? 0.5 : isMinor ? 0.3 : 0.15;
            ticks += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="var(--text-muted, #64748b)" stroke-width="' + tickWidth + '" opacity="' + tickOpacity + '"/>';

            // Number labels at major ticks
            if (isMajor) {
                var labelR = radius - 22;
                var lx = cx + labelR * Math.cos(rad);
                var ly = cy + labelR * Math.sin(rad);
                ticks += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 1).toFixed(1) + '" fill="var(--text-muted, #64748b)" font-size="10" font-weight="500" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" opacity="0.6">' + i + '</text>';
            }
        }

        // Needle position
        var needleAngle = -225 + (score / 100) * sweepDeg;
        var needleRad = (needleAngle - 90) * Math.PI / 180;
        var needleLen = radius - 18;
        var nx = cx + needleLen * Math.cos(needleRad);
        var ny = cy + needleLen * Math.sin(needleRad);

        // Small triangle base for needle
        var baseRad1 = (needleAngle - 90 + 90) * Math.PI / 180;
        var baseRad2 = (needleAngle - 90 - 90) * Math.PI / 180;
        var bx1 = cx + 5 * Math.cos(baseRad1);
        var by1 = cy + 5 * Math.sin(baseRad1);
        var bx2 = cx + 5 * Math.cos(baseRad2);
        var by2 = cy + 5 * Math.sin(baseRad2);

        var svgHeight = size / 2 + 70;

        container.innerHTML =
            '<div class="gauge-container" style="text-align:center;">' +
            '<svg width="' + size + '" height="' + svgHeight + '" viewBox="0 0 ' + size + ' ' + svgHeight + '" style="max-width:100%;">' +
            '<defs>' +
                '<filter id="gauge-glow-f"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>' +
                '<filter id="needle-shadow"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="' + scoreColor + '" flood-opacity="0.5"/></filter>' +
            '</defs>' +

            // Background arc
            '<path d="' + bgArc + '" fill="none" stroke="var(--bg-tertiary, rgba(255,255,255,0.06))" stroke-width="14" stroke-linecap="round"/>' +

            // Color zones (subtle)
            describeColorZones(cx, cy, radius) +

            // Score arc
            (score > 0 ? '<path class="gauge-score-path" d="' + scoreArc + '" fill="none" stroke="' + scoreColor + '" stroke-width="14" stroke-linecap="round" filter="url(#gauge-glow-f)"/>' : '') +

            // Ticks
            ticks +

            // Needle triangle
            '<polygon class="gauge-needle-anim" points="' + nx.toFixed(1) + ',' + ny.toFixed(1) + ' ' + bx1.toFixed(1) + ',' + by1.toFixed(1) + ' ' + bx2.toFixed(1) + ',' + by2.toFixed(1) + '" fill="' + scoreColor + '" filter="url(#needle-shadow)"/>' +

            // Center hub
            '<circle cx="' + cx + '" cy="' + cy + '" r="8" fill="' + scoreColor + '"/>' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="var(--bg-primary, #0f0f23)"/>' +

            // Score value text
            '<text x="' + cx + '" y="' + (cy + 38) + '" fill="var(--text, #fff)" font-size="38" font-weight="800" text-anchor="middle" font-family="system-ui, sans-serif" letter-spacing="-1">' + score + '</text>' +
            '<text x="' + cx + '" y="' + (cy + 56) + '" fill="var(--text-muted, #64748b)" font-size="11" text-anchor="middle" font-family="system-ui, sans-serif" text-transform="uppercase" letter-spacing="2" opacity="0.7">' + label + '</text>' +

            '</svg>' +
            '</div>';
    }

    function describeColorZones(cx, cy, radius) {
        // Subtle color zones on the outer edge
        function polarToCartesian(cx, cy, r, angleDeg) {
            var rad = (angleDeg - 90) * Math.PI / 180;
            return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
        }

        function arc(startPct, endPct, color) {
            var r = radius + 2;
            var startAngle = -225 + (startPct / 100) * 270;
            var endAngle = -225 + (endPct / 100) * 270;
            var start = polarToCartesian(cx, cy, r, endAngle);
            var end = polarToCartesian(cx, cy, r, startAngle);
            var largeArc = endAngle - startAngle <= 180 ? '0' : '1';
            var d = 'M ' + start.x + ' ' + start.y + ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 0 ' + end.x + ' ' + end.y;
            return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="3" stroke-linecap="round" opacity="0.15"/>';
        }

        return arc(0, 40, '#ef4444') + arc(40, 70, '#f59e0b') + arc(70, 100, '#10b981');
    }

    return { render: render };
})();

if (typeof window !== 'undefined') {
    window.ReportsGauge = ReportsGauge;
}
