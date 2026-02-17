/**
 * AccState - Gestion centralisee de l'etat du module Comptabilite
 * Pattern: IIFE avec pub/sub pour notifications de changements
 */
const AccState = (function() {
    'use strict';

    let state = {
        currentTab: 'dashboard',
        dashboard: null,
        invoices: { data: [], pagination: null },
        categories: [],
        contacts: { data: [], pagination: null },
        departments: [],
        expenses: { data: [], pagination: null },
        alerts: { items: [], counts: { info: 0, warning: 0, critical: 0 } },
        bankTransactions: { data: [], pagination: null },
        budgets: { overview: null, variance: [] },
        companySettings: null,
        tva: null,
        financials: { balanceSheet: null, profitLoss: null, cashFlow: null },
        filters: {
            invoices: { status: '', type: '', dateFrom: '', dateTo: '', search: '' },
            expenses: { status: '', department: '', dateFrom: '', dateTo: '', search: '' },
            bank: { reconciled: '', dateFrom: '', dateTo: '', search: '' },
            contacts: { type: '', search: '' }
        },
        loading: {},
        selectedInvoice: null,
        selectedExpense: null,
        selectedContact: null,
        currentYear: new Date().getFullYear(),
        currentQuarter: Math.ceil((new Date().getMonth() + 1) / 3)
    };

    let listeners = [];

    function getState() {
        return state;
    }

    function get(key) {
        return state[key];
    }

    function setState(key, value) {
        if (state[key] !== value) {
            state[key] = value;
            notify(key);
        }
    }

    function mergeState(key, partial) {
        if (typeof state[key] === 'object' && state[key] !== null && !Array.isArray(state[key])) {
            state[key] = Object.assign({}, state[key], partial);
        } else {
            state[key] = partial;
        }
        notify(key);
    }

    function setFilter(section, filterKey, value) {
        if (state.filters[section]) {
            state.filters[section][filterKey] = value;
            notify('filters');
        }
    }

    function resetFilters(section) {
        if (state.filters[section]) {
            Object.keys(state.filters[section]).forEach(function(k) {
                state.filters[section][k] = '';
            });
            notify('filters');
        }
    }

    function subscribe(fn) {
        listeners.push(fn);
        return function unsubscribe() {
            listeners = listeners.filter(function(l) { return l !== fn; });
        };
    }

    function notify(key) {
        listeners.forEach(function(fn) {
            try {
                fn(key, state);
            } catch (e) {
                console.error('[AccState] Erreur listener:', e);
            }
        });
    }

    function setLoading(key, val) {
        state.loading[key] = !!val;
        notify('loading');
    }

    function isLoading(key) {
        return !!state.loading[key];
    }

    function isAnyLoading() {
        return Object.values(state.loading).some(function(v) { return v; });
    }

    function reset() {
        state.dashboard = null;
        state.invoices = { data: [], pagination: null };
        state.categories = [];
        state.contacts = { data: [], pagination: null };
        state.departments = [];
        state.expenses = { data: [], pagination: null };
        state.alerts = { items: [], counts: { info: 0, warning: 0, critical: 0 } };
        state.bankTransactions = { data: [], pagination: null };
        state.budgets = { overview: null, variance: [] };
        state.companySettings = null;
        state.tva = null;
        state.financials = { balanceSheet: null, profitLoss: null, cashFlow: null };
        state.selectedInvoice = null;
        state.selectedExpense = null;
        state.selectedContact = null;
        state.loading = {};
        notify('reset');
    }

    function destroy() {
        listeners = [];
    }

    return {
        getState: getState,
        get: get,
        setState: setState,
        mergeState: mergeState,
        setFilter: setFilter,
        resetFilters: resetFilters,
        subscribe: subscribe,
        setLoading: setLoading,
        isLoading: isLoading,
        isAnyLoading: isAnyLoading,
        reset: reset,
        destroy: destroy
    };
})();
