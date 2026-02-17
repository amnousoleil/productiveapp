/**
 * Dashboard Charts Module - Chart.js Integration
 * ProductiveApp v4.0
 */

const DashCharts = (function() {
    'use strict';

    let weeklyChart = null;
    let donutChart = null;
    let trendChart = null;

    const colors = {
        primary: '#8b5cf6',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        muted: '#71717a',
        surface: '#1a1a2e',
        gradient1: 'rgba(139, 92, 246, 0.8)',
        gradient2: 'rgba(99, 102, 241, 0.3)'
    };

    /**
     * Destroy existing chart to prevent memory leaks
     */
    function destroyChart(chartInstance) {
        if (chartInstance) {
            chartInstance.destroy();
        }
        return null;
    }

    /**
     * Render weekly productivity chart
     */
    function renderWeeklyChart(containerId, dailyStats) {
        const canvas = document.getElementById(containerId);
        if (!canvas || !dailyStats?.length) return;

        weeklyChart = destroyChart(weeklyChart);

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, colors.gradient1);
        gradient.addColorStop(1, colors.gradient2);

        const labels = dailyStats.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('fr-FR', { weekday: 'short' });
        });

        const data = dailyStats.map(d => d.completion_rate || d.tasks_completed || 0);

        weeklyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Productivit\u00e9',
                    data,
                    backgroundColor: gradient,
                    borderColor: colors.primary,
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a1a2e',
                        titleColor: '#fafafa',
                        bodyColor: '#a1a1aa',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        callbacks: {
                            label: ctx => `${ctx.parsed.y}%`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: colors.muted, font: { size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: colors.muted, font: { size: 10 } },
                        beginAtZero: true,
                        max: 100
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    /**
     * Render tasks donut chart
     */
    function renderDonutChart(containerId, stats) {
        const canvas = document.getElementById(containerId);
        if (!canvas) return;

        donutChart = destroyChart(donutChart);

        const ctx = canvas.getContext('2d');

        donutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Termin\u00e9', 'En cours', '\u00c0 faire'],
                datasets: [{
                    data: [stats.done || 0, stats.inProgress || 0, stats.todo || 0],
                    backgroundColor: [colors.success, colors.warning, '#3f3f46'],
                    borderColor: colors.surface,
                    borderWidth: 3,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: colors.muted,
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1a1a2e',
                        titleColor: '#fafafa',
                        bodyColor: '#a1a1aa',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                }
            }
        });
    }

    /**
     * Render trend line chart
     */
    function renderTrendChart(containerId, dailyStats) {
        const canvas = document.getElementById(containerId);
        if (!canvas || !dailyStats?.length) return;

        trendChart = destroyChart(trendChart);

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 150);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

        const labels = dailyStats.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        });

        const data = dailyStats.map(d => d.tasks_completed || 0);

        trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'T\u00e2ches compl\u00e9t\u00e9es',
                    data,
                    borderColor: colors.primary,
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: colors.primary,
                    pointBorderColor: '#1a1a2e',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a1a2e',
                        titleColor: '#fafafa',
                        bodyColor: '#a1a1aa',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: colors.muted, font: { size: 10 }, maxRotation: 45 }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: colors.muted, font: { size: 10 }, stepSize: 1 },
                        beginAtZero: true
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    /**
     * Render all charts container HTML
     */
    function renderChartsSection() {
        return `
            <div class="dash-charts-section">
                <div class="dash-charts-grid">
                    <div class="dash-chart-card">
                        <div class="dash-chart-header">
                            <h3>Productivit\u00e9 Hebdomadaire</h3>
                            <span class="dash-chart-badge">7 jours</span>
                        </div>
                        <div class="dash-chart-body">
                            <canvas id="dash-weekly-chart" height="180"></canvas>
                        </div>
                    </div>
                    <div class="dash-chart-card">
                        <div class="dash-chart-header">
                            <h3>R\u00e9partition des T\u00e2ches</h3>
                        </div>
                        <div class="dash-chart-body">
                            <canvas id="dash-donut-chart" height="180"></canvas>
                        </div>
                    </div>
                    <div class="dash-chart-card dash-chart-wide">
                        <div class="dash-chart-header">
                            <h3>Tendance 30 jours</h3>
                            <span class="dash-chart-badge">T\u00e2ches compl\u00e9t\u00e9es</span>
                        </div>
                        <div class="dash-chart-body">
                            <canvas id="dash-trend-chart" height="150"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize charts with data
     */
    async function init() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            return;
        }

        // Get stats for donut chart
        const stats = typeof Dashboard !== 'undefined' ? Dashboard.getStats() : { done: 0, inProgress: 0, todo: 0 };

        // Fetch analytics data
        let dailyStats7 = [];
        let dailyStats30 = [];

        if (typeof AnalyticsAPI !== 'undefined') {
            try {
                dailyStats7 = await AnalyticsAPI.getDailyStats(7) || [];
                dailyStats30 = await AnalyticsAPI.getDailyStats(30) || [];
            } catch (e) {
                console.warn('Failed to fetch analytics:', e);
            }
        }

        // Render charts
        setTimeout(() => {
            renderWeeklyChart('dash-weekly-chart', dailyStats7);
            renderDonutChart('dash-donut-chart', stats);
            renderTrendChart('dash-trend-chart', dailyStats30);
        }, 100);
    }

    /**
     * Cleanup charts on page change
     */
    function destroy() {
        weeklyChart = destroyChart(weeklyChart);
        donutChart = destroyChart(donutChart);
        trendChart = destroyChart(trendChart);
    }

    return {
        renderChartsSection,
        init,
        destroy,
        renderWeeklyChart,
        renderDonutChart,
        renderTrendChart
    };
})();

if (typeof window !== 'undefined') {
    window.DashCharts = DashCharts;
}
