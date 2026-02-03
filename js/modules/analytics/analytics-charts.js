/**
 * Analytics Charts Module
 * Renders activity charts using native Canvas
 */

const AnalyticsCharts = (function() {
    'use strict';

    let chartData = null;
    let currentPeriod = 7;
    let canvas = null;
    let ctx = null;

    /**
     * Initialize charts
     */
    async function init() {
        canvas = document.getElementById('analytics-chart-canvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        await load(7);
        attachPeriodListeners();
    }

    /**
     * Load chart data
     * @param {number} days
     */
    async function load(days = 7) {
        currentPeriod = days;

        try {
            chartData = await AnalyticsAPI.getActivityChart(days);
            render();
        } catch (error) {
            console.error('❌ Failed to load chart:', error);
        }
    }

    /**
     * Render the chart
     */
    function render() {
        if (!ctx || !chartData) return;

        // Clear canvas
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);

        const width = rect.width;
        const height = rect.height;
        const padding = { top: 20, right: 20, bottom: 40, left: 50 };

        ctx.clearRect(0, 0, width, height);

        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Get max value for scale
        const allValues = [
            ...chartData.datasets.notes,
            ...chartData.datasets.tasks,
            ...chartData.datasets.messages
        ];
        const maxValue = Math.max(...allValues, 10);

        // Draw grid lines
        drawGrid(padding, chartWidth, chartHeight, maxValue);

        // Draw bars
        drawBars(padding, chartWidth, chartHeight, maxValue);

        // Draw labels
        drawLabels(padding, chartWidth, chartHeight);

        // Draw legend
        drawLegend(width, padding);
    }

    /**
     * Draw grid lines
     */
    function drawGrid(padding, chartWidth, chartHeight, maxValue) {
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border') || '#2a2a3a';
        ctx.lineWidth = 0.5;

        const steps = 5;
        for (let i = 0; i <= steps; i++) {
            const y = padding.top + (chartHeight / steps) * i;

            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();

            // Value label
            const value = Math.round(maxValue - (maxValue / steps) * i);
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted') || '#71717a';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(value.toString(), padding.left - 10, y + 4);
        }
    }

    /**
     * Draw bars
     */
    function drawBars(padding, chartWidth, chartHeight, maxValue) {
        const labels = chartData.labels;
        const datasets = chartData.datasets;
        const barGroupWidth = chartWidth / labels.length;
        const barWidth = barGroupWidth * 0.2;
        const gap = barWidth * 0.3;

        const colors = {
            notes: getAccentColor(),
            tasks: '#22c55e',
            messages: '#8b5cf6'
        };

        labels.forEach((label, i) => {
            const groupX = padding.left + barGroupWidth * i + barGroupWidth * 0.15;

            // Notes bar
            drawBar(
                groupX,
                padding.top,
                barWidth,
                chartHeight,
                datasets.notes[i],
                maxValue,
                colors.notes
            );

            // Tasks bar
            drawBar(
                groupX + barWidth + gap,
                padding.top,
                barWidth,
                chartHeight,
                datasets.tasks[i],
                maxValue,
                colors.tasks
            );

            // Messages bar
            drawBar(
                groupX + (barWidth + gap) * 2,
                padding.top,
                barWidth,
                chartHeight,
                datasets.messages[i],
                maxValue,
                colors.messages
            );
        });
    }

    /**
     * Draw single bar
     */
    function drawBar(x, top, width, chartHeight, value, maxValue, color) {
        const barHeight = (value / maxValue) * chartHeight;
        const y = top + chartHeight - barHeight;

        // Bar with rounded top
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, width, barHeight, [4, 4, 0, 0]);
        ctx.fill();
    }

    /**
     * Draw x-axis labels
     */
    function drawLabels(padding, chartWidth, chartHeight) {
        const labels = chartData.labels;
        const barGroupWidth = chartWidth / labels.length;

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted') || '#71717a';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';

        labels.forEach((label, i) => {
            const x = padding.left + barGroupWidth * i + barGroupWidth / 2;
            const y = padding.top + chartHeight + 25;
            ctx.fillText(label, x, y);
        });
    }

    /**
     * Draw legend
     */
    function drawLegend(width, padding) {
        const legends = [
            { label: 'Notes', color: getAccentColor() },
            { label: 'Tâches', color: '#22c55e' },
            { label: 'Messages', color: '#8b5cf6' }
        ];

        const legendX = width - padding.right - 180;
        const legendY = padding.top - 5;

        legends.forEach((item, i) => {
            const x = legendX + i * 70;

            // Color dot
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.arc(x, legendY, 5, 0, Math.PI * 2);
            ctx.fill();

            // Label
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted') || '#71717a';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, x + 10, legendY + 4);
        });
    }

    /**
     * Attach period button listeners
     */
    function attachPeriodListeners() {
        document.querySelectorAll('.analytics-period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const days = parseInt(btn.dataset.days);

                // Update active state
                document.querySelectorAll('.analytics-period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Reload chart
                load(days);
            });
        });
    }

    /**
     * Get accent color from theme
     */
    function getAccentColor() {
        return getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#6366f1';
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        if (chartData) {
            render();
        }
    }

    /**
     * Get current data
     */
    function getData() {
        return chartData;
    }

    // Listen for resize
    window.addEventListener('resize', debounce(handleResize, 250));

    function debounce(fn, ms) {
        let timer;
        return function() {
            clearTimeout(timer);
            timer = setTimeout(fn, ms);
        };
    }

    return {
        init,
        load,
        render,
        getData
    };
})();

if (typeof window !== 'undefined') {
    window.AnalyticsCharts = AnalyticsCharts;
}
