/**
 * AccountingApi - API complète du module Comptabilité
 * 35+ méthodes couvrant factures, dépenses, TVA, banque, budgets, contacts, alertes, exports, IA
 */
const AccountingApi = (function() {
    'use strict';

    function getWorkspaceId() {
        if (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) {
            return ApiTokens.getWorkspaceId();
        }
        return localStorage.getItem('workspace_id') || '';
    }

    function buildUrl(path) {
        return '/accounting/workspace/' + getWorkspaceId() + path;
    }

    function buildQuery(params) {
        if (!params) return '';
        var parts = [];
        Object.keys(params).forEach(function(key) {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
        });
        return parts.length > 0 ? '?' + parts.join('&') : '';
    }

    // =====================================================
    // TABLEAU DE BORD
    // =====================================================

    async function getDashboard(year) {
        var y = year || new Date().getFullYear();
        return Api.get(buildUrl('/dashboard') + buildQuery({ year: y }));
    }

    async function getMonthlyAnalytics(month, year) {
        var m = month || (new Date().getMonth() + 1);
        var y = year || new Date().getFullYear();
        return Api.get(buildUrl('/analytics/monthly') + buildQuery({ month: m, year: y }));
    }

    // =====================================================
    // TVA
    // =====================================================

    async function getTVASummary(year, quarter) {
        var y = year || new Date().getFullYear();
        var params = { year: y };
        if (quarter) params.quarter = quarter;
        return Api.get(buildUrl('/tva/summary') + buildQuery(params));
    }

    // =====================================================
    // CATEGORIES
    // =====================================================

    async function getCategories() {
        return Api.get(buildUrl('/categories'));
    }

    async function createCategory(data) {
        return Api.post(buildUrl('/categories'), data);
    }

    async function updateCategory(id, data) {
        return Api.put(buildUrl('/categories/' + id), data);
    }

    async function deleteCategory(id) {
        return Api.del(buildUrl('/categories/' + id));
    }

    // =====================================================
    // FACTURES
    // =====================================================

    async function getInvoices(filters) {
        var params = {};
        if (filters) {
            if (filters.status) params.status = filters.status;
            if (filters.type) params.type = filters.type;
            if (filters.dateFrom) params.date_from = filters.dateFrom;
            if (filters.dateTo) params.date_to = filters.dateTo;
            if (filters.search) params.search = filters.search;
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
            if (filters.contactId) params.contact_id = filters.contactId;
        }
        return Api.get(buildUrl('/invoices') + buildQuery(params));
    }

    async function getInvoice(id) {
        return Api.get(buildUrl('/invoices/' + id));
    }

    async function createInvoice(data) {
        return Api.post(buildUrl('/invoices'), data);
    }

    async function updateInvoice(id, data) {
        return Api.put(buildUrl('/invoices/' + id), data);
    }

    async function deleteInvoice(id) {
        return Api.del(buildUrl('/invoices/' + id));
    }

    async function validateInvoice(id) {
        return Api.post(buildUrl('/invoices/' + id + '/validate'));
    }

    async function markInvoicePaid(id, data) {
        var payload = data || {};
        return Api.post(buildUrl('/invoices/' + id + '/mark-paid'), payload);
    }

    async function sendInvoice(id) {
        return Api.post(buildUrl('/invoices/' + id + '/send'));
    }

    async function sendReminder(id) {
        return Api.post(buildUrl('/invoices/' + id + '/remind'));
    }

    async function getOverdueInvoices() {
        return Api.get(buildUrl('/invoices/overdue'));
    }

    async function duplicateInvoice(id) {
        return Api.post(buildUrl('/invoices/' + id + '/duplicate'));
    }

    // =====================================================
    // SCAN / OCR
    // =====================================================

    async function scanInvoice(formData) {
        return Api.upload(buildUrl('/invoices/scan'), formData);
    }

    async function batchScanInvoices(formData) {
        return Api.upload(buildUrl('/invoices/batch-scan'), formData);
    }

    // =====================================================
    // PARAMETRES SOCIETE
    // =====================================================

    async function getCompanySettings() {
        return Api.get(buildUrl('/company'));
    }

    async function updateCompanySettings(data) {
        return Api.put(buildUrl('/company'), data);
    }

    async function uploadLogo(formData) {
        return Api.upload(buildUrl('/company/logo'), formData);
    }

    // =====================================================
    // CONTACTS
    // =====================================================

    async function getContacts(filters) {
        var params = {};
        if (filters) {
            if (filters.type) params.type = filters.type;
            if (filters.search) params.search = filters.search;
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
        }
        return Api.get(buildUrl('/contacts') + buildQuery(params));
    }

    async function getContact(id) {
        return Api.get(buildUrl('/contacts/' + id));
    }

    async function createContact(data) {
        return Api.post(buildUrl('/contacts'), data);
    }

    async function updateContact(id, data) {
        return Api.put(buildUrl('/contacts/' + id), data);
    }

    async function deleteContact(id) {
        return Api.del(buildUrl('/contacts/' + id));
    }

    async function getContactInvoices(id) {
        return Api.get(buildUrl('/contacts/' + id + '/invoices'));
    }

    async function getContactStats(id) {
        return Api.get(buildUrl('/contacts/' + id + '/stats'));
    }

    // =====================================================
    // DOCUMENTS (Devis, Avoirs)
    // =====================================================

    async function createQuote(data) {
        return Api.post(buildUrl('/quotes'), data);
    }

    async function getQuotes(filters) {
        var params = {};
        if (filters) {
            if (filters.status) params.status = filters.status;
            if (filters.search) params.search = filters.search;
            if (filters.page) params.page = filters.page;
        }
        return Api.get(buildUrl('/quotes') + buildQuery(params));
    }

    async function convertQuoteToInvoice(quoteId) {
        return Api.post(buildUrl('/quotes/' + quoteId + '/convert'));
    }

    async function createCreditNote(data) {
        return Api.post(buildUrl('/credit-notes'), data);
    }

    async function getDocumentPDF(id) {
        return Api.get(buildUrl('/documents/' + id + '/pdf'));
    }

    // =====================================================
    // NOTES DE FRAIS
    // =====================================================

    async function getExpenseReports(filters) {
        var params = {};
        if (filters) {
            if (filters.status) params.status = filters.status;
            if (filters.department) params.department_id = filters.department;
            if (filters.dateFrom) params.date_from = filters.dateFrom;
            if (filters.dateTo) params.date_to = filters.dateTo;
            if (filters.search) params.search = filters.search;
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
        }
        return Api.get(buildUrl('/expense-reports') + buildQuery(params));
    }

    async function getExpenseReport(id) {
        return Api.get(buildUrl('/expense-reports/' + id));
    }

    async function createExpenseReport(data) {
        return Api.post(buildUrl('/expense-reports'), data);
    }

    async function updateExpenseReport(id, data) {
        return Api.put(buildUrl('/expense-reports/' + id), data);
    }

    async function deleteExpenseReport(id) {
        return Api.del(buildUrl('/expense-reports/' + id));
    }

    async function submitExpenseReport(id) {
        return Api.post(buildUrl('/expense-reports/' + id + '/submit'));
    }

    async function approveExpenseReport(id, data) {
        var payload = data || {};
        return Api.post(buildUrl('/expense-reports/' + id + '/approve'), payload);
    }

    async function rejectExpenseReport(id, data) {
        var payload = data || {};
        return Api.post(buildUrl('/expense-reports/' + id + '/reject'), payload);
    }

    async function addExpenseItem(reportId, data) {
        return Api.post(buildUrl('/expense-reports/' + reportId + '/items'), data);
    }

    async function updateExpenseItem(reportId, itemId, data) {
        return Api.put(buildUrl('/expense-reports/' + reportId + '/items/' + itemId), data);
    }

    async function deleteExpenseItem(reportId, itemId) {
        return Api.del(buildUrl('/expense-reports/' + reportId + '/items/' + itemId));
    }

    async function scanExpenseReceipt(reportId, itemId, formData) {
        return Api.upload(buildUrl('/expense-reports/' + reportId + '/items/' + itemId + '/scan'), formData);
    }

    // =====================================================
    // DEPARTEMENTS
    // =====================================================

    async function getDepartments() {
        return Api.get(buildUrl('/departments'));
    }

    async function createDepartment(data) {
        return Api.post(buildUrl('/departments'), data);
    }

    async function updateDepartment(id, data) {
        return Api.put(buildUrl('/departments/' + id), data);
    }

    async function deleteDepartment(id) {
        return Api.del(buildUrl('/departments/' + id));
    }

    // =====================================================
    // BUDGETS
    // =====================================================

    async function getBudgets(year) {
        var y = year || new Date().getFullYear();
        return Api.get(buildUrl('/budgets') + buildQuery({ year: y }));
    }

    async function getBudget(id) {
        return Api.get(buildUrl('/budgets/' + id));
    }

    async function setBudget(data) {
        return Api.post(buildUrl('/budgets'), data);
    }

    async function updateBudget(id, data) {
        return Api.put(buildUrl('/budgets/' + id), data);
    }

    async function deleteBudget(id) {
        return Api.del(buildUrl('/budgets/' + id));
    }

    async function getBudgetVariance(year, deptId) {
        var y = year || new Date().getFullYear();
        var params = { year: y };
        if (deptId) params.department_id = deptId;
        return Api.get(buildUrl('/budgets/variance') + buildQuery(params));
    }

    // =====================================================
    // BANQUE - RAPPROCHEMENT
    // =====================================================

    async function importBankTransactions(formData) {
        return Api.upload(buildUrl('/bank/import'), formData);
    }

    async function getBankTransactions(filters) {
        var params = {};
        if (filters) {
            if (filters.reconciled !== undefined && filters.reconciled !== '') params.reconciled = filters.reconciled;
            if (filters.dateFrom) params.date_from = filters.dateFrom;
            if (filters.dateTo) params.date_to = filters.dateTo;
            if (filters.search) params.search = filters.search;
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
        }
        return Api.get(buildUrl('/bank/transactions') + buildQuery(params));
    }

    async function matchBankTransaction(txId, invoiceId) {
        return Api.post(buildUrl('/bank/transactions/' + txId + '/match'), { invoice_id: invoiceId });
    }

    async function unmatchBankTransaction(txId) {
        return Api.post(buildUrl('/bank/transactions/' + txId + '/unmatch'));
    }

    async function autoMatchBankTransactions() {
        return Api.post(buildUrl('/bank/auto-match'));
    }

    async function getUnreconciledTransactions() {
        return Api.get(buildUrl('/bank/transactions/unreconciled'));
    }

    // =====================================================
    // ALERTES
    // =====================================================

    async function getAlerts(unreadOnly) {
        var params = {};
        if (unreadOnly) params.unread = true;
        return Api.get(buildUrl('/alerts') + buildQuery(params));
    }

    async function markAlertRead(id) {
        return Api.post(buildUrl('/alerts/' + id + '/read'));
    }

    async function dismissAlert(id) {
        return Api.del(buildUrl('/alerts/' + id));
    }

    async function generateAlerts() {
        return Api.post(buildUrl('/alerts/generate'));
    }

    // =====================================================
    // ETATS FINANCIERS
    // =====================================================

    async function getBalanceSheet(year) {
        var y = year || new Date().getFullYear();
        return Api.get(buildUrl('/financial-statements/balance-sheet') + buildQuery({ year: y }));
    }

    async function getProfitLoss(year) {
        var y = year || new Date().getFullYear();
        return Api.get(buildUrl('/financial-statements/profit-loss') + buildQuery({ year: y }));
    }

    async function getCashFlow(year) {
        var y = year || new Date().getFullYear();
        return Api.get(buildUrl('/financial-statements/cash-flow') + buildQuery({ year: y }));
    }

    // =====================================================
    // INTELLIGENCE ARTIFICIELLE
    // =====================================================

    async function predictCashFlow(months) {
        var m = months || 6;
        return Api.get(buildUrl('/ai/predict-cashflow') + buildQuery({ months: m }));
    }

    async function aiCategorize(data) {
        return Api.post(buildUrl('/ai/categorize'), data);
    }

    async function detectAnomalies() {
        return Api.get(buildUrl('/ai/anomalies'));
    }

    async function aiAnalyze(data) {
        return Api.post(buildUrl('/ai/analyze'), data);
    }

    // =====================================================
    // EXPORTS
    // =====================================================

    async function exportFEC(year) {
        var y = year || new Date().getFullYear();
        return Api.get(buildUrl('/exports/fec') + buildQuery({ year: y }));
    }

    async function exportTVADeclaration(year, quarter) {
        var y = year || new Date().getFullYear();
        return Api.get(buildUrl('/exports/tva-declaration') + buildQuery({ year: y, quarter: quarter }));
    }

    async function exportBalanceSheet(year) {
        var y = year || new Date().getFullYear();
        return Api.get(buildUrl('/exports/balance-sheet') + buildQuery({ year: y }));
    }

    async function exportGeneric(type, format, filters) {
        var params = { type: type, format: format || 'csv' };
        if (filters) {
            Object.keys(filters).forEach(function(k) {
                if (filters[k]) params[k] = filters[k];
            });
        }
        return Api.get(buildUrl('/exports') + buildQuery(params));
    }

    async function exportInvoicePDF(id) {
        return Api.get(buildUrl('/invoices/' + id + '/pdf'));
    }

    // =====================================================
    // PAIEMENTS STRIPE
    // =====================================================

    async function createCheckoutSession(invoiceId, successUrl, cancelUrl) {
        return Api.post(buildUrl('/payments/checkout'), {
            invoice_id: invoiceId,
            success_url: successUrl || window.location.href + '?payment=success',
            cancel_url: cancelUrl || window.location.href + '?payment=cancel'
        });
    }

    async function getPaymentTransactions(filters) {
        var params = {};
        if (filters) {
            if (filters.status) params.status = filters.status;
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
        }
        return Api.get(buildUrl('/payments/transactions') + buildQuery(params));
    }

    async function getInvoicePayments(invoiceId) {
        return Api.get(buildUrl('/payments/invoices/' + invoiceId));
    }

    async function createRefund(transactionId, amount, reason) {
        return Api.post(buildUrl('/payments/refund'), {
            transaction_id: transactionId,
            amount: amount || undefined,
            reason: reason || undefined
        });
    }

    async function getStripeStatus() {
        return Api.get(buildUrl('/payments/status'));
    }

    // =====================================================
    // FACTURES RECURRENTES
    // =====================================================

    async function getRecurringInvoices(filters) {
        var params = {};
        if (filters) {
            if (filters.status) params.status = filters.status;
            if (filters.frequency) params.frequency = filters.frequency;
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
        }
        return Api.get(buildUrl('/recurring') + buildQuery(params));
    }

    async function getRecurringInvoice(id) {
        return Api.get(buildUrl('/recurring/' + id));
    }

    async function createRecurringInvoice(data) {
        return Api.post(buildUrl('/recurring'), data);
    }

    async function updateRecurringInvoice(id, data) {
        return Api.put(buildUrl('/recurring/' + id), data);
    }

    async function deleteRecurringInvoice(id) {
        return Api.del(buildUrl('/recurring/' + id));
    }

    async function pauseRecurringInvoice(id) {
        return Api.post(buildUrl('/recurring/' + id + '/pause'));
    }

    async function resumeRecurringInvoice(id) {
        return Api.post(buildUrl('/recurring/' + id + '/resume'));
    }

    async function processRecurringInvoices() {
        return Api.post(buildUrl('/recurring/process'));
    }

    // =====================================================
    // INITIALISATION
    // =====================================================

    async function initWorkspace() {
        return Api.post(buildUrl('/init'));
    }

    // =====================================================
    // RETOUR PUBLIC
    // =====================================================

    return {
        // Dashboard
        getDashboard: getDashboard,
        getMonthlyAnalytics: getMonthlyAnalytics,

        // TVA
        getTVASummary: getTVASummary,

        // Categories
        getCategories: getCategories,
        createCategory: createCategory,
        updateCategory: updateCategory,
        deleteCategory: deleteCategory,

        // Factures
        getInvoices: getInvoices,
        getInvoice: getInvoice,
        createInvoice: createInvoice,
        updateInvoice: updateInvoice,
        deleteInvoice: deleteInvoice,
        validateInvoice: validateInvoice,
        markInvoicePaid: markInvoicePaid,
        sendInvoice: sendInvoice,
        sendReminder: sendReminder,
        getOverdueInvoices: getOverdueInvoices,
        duplicateInvoice: duplicateInvoice,

        // Scan
        scanInvoice: scanInvoice,
        batchScanInvoices: batchScanInvoices,

        // Societe
        getCompanySettings: getCompanySettings,
        updateCompanySettings: updateCompanySettings,
        uploadLogo: uploadLogo,

        // Contacts
        getContacts: getContacts,
        getContact: getContact,
        createContact: createContact,
        updateContact: updateContact,
        deleteContact: deleteContact,
        getContactInvoices: getContactInvoices,
        getContactStats: getContactStats,

        // Documents
        createQuote: createQuote,
        getQuotes: getQuotes,
        convertQuoteToInvoice: convertQuoteToInvoice,
        createCreditNote: createCreditNote,
        getDocumentPDF: getDocumentPDF,

        // Notes de frais
        getExpenseReports: getExpenseReports,
        getExpenseReport: getExpenseReport,
        createExpenseReport: createExpenseReport,
        updateExpenseReport: updateExpenseReport,
        deleteExpenseReport: deleteExpenseReport,
        submitExpenseReport: submitExpenseReport,
        approveExpenseReport: approveExpenseReport,
        rejectExpenseReport: rejectExpenseReport,
        addExpenseItem: addExpenseItem,
        updateExpenseItem: updateExpenseItem,
        deleteExpenseItem: deleteExpenseItem,
        scanExpenseReceipt: scanExpenseReceipt,

        // Departements
        getDepartments: getDepartments,
        createDepartment: createDepartment,
        updateDepartment: updateDepartment,
        deleteDepartment: deleteDepartment,

        // Budgets
        getBudgets: getBudgets,
        getBudget: getBudget,
        setBudget: setBudget,
        updateBudget: updateBudget,
        deleteBudget: deleteBudget,
        getBudgetVariance: getBudgetVariance,

        // Banque
        importBankTransactions: importBankTransactions,
        getBankTransactions: getBankTransactions,
        matchBankTransaction: matchBankTransaction,
        unmatchBankTransaction: unmatchBankTransaction,
        autoMatchBankTransactions: autoMatchBankTransactions,
        getUnreconciledTransactions: getUnreconciledTransactions,

        // Alertes
        getAlerts: getAlerts,
        markAlertRead: markAlertRead,
        dismissAlert: dismissAlert,
        generateAlerts: generateAlerts,

        // Etats financiers
        getBalanceSheet: getBalanceSheet,
        getProfitLoss: getProfitLoss,
        getCashFlow: getCashFlow,

        // IA
        predictCashFlow: predictCashFlow,
        aiCategorize: aiCategorize,
        detectAnomalies: detectAnomalies,
        aiAnalyze: aiAnalyze,

        // Exports
        exportFEC: exportFEC,
        exportTVADeclaration: exportTVADeclaration,
        exportBalanceSheet: exportBalanceSheet,
        exportGeneric: exportGeneric,
        exportInvoicePDF: exportInvoicePDF,

        // Paiements Stripe
        createCheckoutSession: createCheckoutSession,
        getPaymentTransactions: getPaymentTransactions,
        getInvoicePayments: getInvoicePayments,
        createRefund: createRefund,
        getStripeStatus: getStripeStatus,

        // Factures recurrentes
        getRecurringInvoices: getRecurringInvoices,
        getRecurringInvoice: getRecurringInvoice,
        createRecurringInvoice: createRecurringInvoice,
        updateRecurringInvoice: updateRecurringInvoice,
        deleteRecurringInvoice: deleteRecurringInvoice,
        pauseRecurringInvoice: pauseRecurringInvoice,
        resumeRecurringInvoice: resumeRecurringInvoice,
        processRecurringInvoices: processRecurringInvoices,

        // Init
        initWorkspace: initWorkspace
    };
})();

if (typeof window !== 'undefined') {
    window.AccountingApi = AccountingApi;
}
