/**
 * REPORTS VIEW - ProductiveApp v4.0
 * Orchestrateur principal du module Rapports
 * Sous-modules: ReportsApi, ReportsCards, ReportsList, ReportsDetail, ReportsStyles
 */

const ReportsView = (function() {
    'use strict';

    var icons = {
        file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
        percent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
        star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
        chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>',
        chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>',
        calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
        target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>'
    };

    var MONTHS_FR = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

    var state = {
        periodType: 'week',
        currentDate: new Date(),
        summary: null,
        reports: [],
        selectedReport: null,
        loading: false
    };

    function getPeriodLabel() {
        var date = state.currentDate;
        switch (state.periodType) {
            case 'week':
                var weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                var weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                return weekStart.getDate() + ' - ' + weekEnd.getDate() + ' ' + MONTHS_FR[weekEnd.getMonth()] + ' ' + weekEnd.getFullYear();
            case 'month':
                return MONTHS_FR[date.getMonth()] + ' ' + date.getFullYear();
            case 'year':
                return '' + date.getFullYear();
            default:
                return '';
        }
    }

    async function render() {
        var container = document.getElementById('view-reports');
        if (!container) return;

        container.innerHTML = `
            <div class="reports-page">
                <div class="view-header">
                    <h1 class="view-title"><span class="view-title-icon">${icons.chart}</span> Rapports</h1>
                    <div class="view-actions">
                        <button class="btn btn-primary" id="generate-report-btn">${icons.plus} Generer le rapport</button>
                    </div>
                </div>
                <div class="reports-filters">
                    <div class="period-selector">
                        <button class="period-btn ${state.periodType === 'week' ? 'active' : ''}" data-period="week">Semaine</button>
                        <button class="period-btn ${state.periodType === 'month' ? 'active' : ''}" data-period="month">Mois</button>
                        <button class="period-btn ${state.periodType === 'year' ? 'active' : ''}" data-period="year">Annee</button>
                    </div>
                    <div class="period-navigation">
                        <button class="nav-btn" id="prev-period">${icons.chevronLeft}</button>
                        <span class="period-label" id="period-label">${getPeriodLabel()}</span>
                        <button class="nav-btn" id="next-period">${icons.chevronRight}</button>
                    </div>
                </div>
                <div class="reports-summary" id="reports-summary"><div class="summary-loading">Chargement...</div></div>
                <div class="reports-section">
                    <h2 class="section-title">${icons.calendar} Historique des rapports</h2>
                    <div class="reports-list" id="reports-list"><div class="reports-loading">Chargement...</div></div>
                </div>
                <div class="report-detail-modal" id="report-detail-modal" style="display: none;">
                    <div class="modal-backdrop"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <button class="btn-back" id="close-detail">${icons.arrowLeft} Retour</button>
                            <h2>Detail du rapport</h2>
                        </div>
                        <div class="modal-body" id="report-detail-content"></div>
                    </div>
                </div>
            </div>
        `;

        ReportsStyles.inject();
        bindEvents();
        await loadData();
    }

    function bindEvents() {
        document.querySelectorAll('.period-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { setPeriod(btn.dataset.period); });
        });
        document.getElementById('prev-period')?.addEventListener('click', function() { navigatePeriod(-1); });
        document.getElementById('next-period')?.addEventListener('click', function() { navigatePeriod(1); });
        document.getElementById('generate-report-btn')?.addEventListener('click', generateReport);
        document.getElementById('close-detail')?.addEventListener('click', closeDetail);
        document.querySelector('.modal-backdrop')?.addEventListener('click', closeDetail);
    }

    async function setPeriod(period) {
        state.periodType = period;
        state.currentDate = new Date();
        document.querySelectorAll('.period-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.period === period);
        });
        document.getElementById('period-label').textContent = getPeriodLabel();
        await loadData();
    }

    async function navigatePeriod(direction) {
        var date = state.currentDate;
        switch (state.periodType) {
            case 'week': date.setDate(date.getDate() + (direction * 7)); break;
            case 'month': date.setMonth(date.getMonth() + direction); break;
            case 'year': date.setFullYear(date.getFullYear() + direction); break;
        }
        document.getElementById('period-label').textContent = getPeriodLabel();
        await loadData();
    }

    async function loadData() {
        state.loading = true;
        await Promise.all([loadSummary(), loadReports()]);
        state.loading = false;
    }

    async function loadSummary() {
        var response = await ReportsApi.fetchSummary(state.periodType);
        if (response.success && response.data?.summary) {
            state.summary = response.data.summary;
        } else {
            state.summary = { tasks_completed: 0, completion_rate: 0, score: 0, streak: 0 };
        }
        ReportsCards.renderTo('reports-summary', state.summary, icons);
    }

    async function loadReports() {
        var response = await ReportsApi.fetchReports(state.periodType, 20);
        state.reports = (response.success && Array.isArray(response.data)) ? response.data : [];
        ReportsList.renderTo('reports-list', state.reports, icons, showDetail);
    }

    async function generateReport() {
        var btn = document.getElementById('generate-report-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = 'Generation...'; }

        var response = await ReportsApi.generateReport(state.periodType);

        if (response.success) {
            if (typeof Utils !== 'undefined' && Utils.showToast) Utils.showToast('Rapport genere avec succes', 'success');
            await loadData();
            if (response.data?.report) showDetail(response.data.report);
        } else {
            if (typeof Utils !== 'undefined' && Utils.showToast) Utils.showToast('Erreur lors de la generation', 'error');
        }

        if (btn) { btn.disabled = false; btn.innerHTML = icons.plus + ' Generer le rapport'; }
    }

    function showDetail(report) {
        state.selectedReport = report;
        ReportsDetail.show(report, icons);
    }

    function closeDetail() {
        ReportsDetail.close();
        state.selectedReport = null;
    }

    async function refresh() {
        await render();
    }

    return { render: render, refresh: refresh, setPeriod: setPeriod, generateReport: generateReport };
})();

if (typeof window !== 'undefined') {
    window.ReportsView = ReportsView;
}

console.log('📦 reports/reports-view.js loaded');
