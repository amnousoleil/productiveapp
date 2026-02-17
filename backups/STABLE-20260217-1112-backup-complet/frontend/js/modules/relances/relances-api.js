/**
 * RelancesApi - API Relances automatiques
 */
const RelancesApi = (function() {
  'use strict';
  function wid() { return (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) ? ApiTokens.getWorkspaceId() : localStorage.getItem('workspace_id') || ''; }
  function url(p) { return '/relances/workspace/' + wid() + p; }

  async function getSettings() { return Api.get(url('/settings')); }
  async function updateSettings(data) { return Api.put(url('/settings'), data); }
  async function schedule() { return Api.post(url('/schedule')); }
  async function process() { return Api.post(url('/process')); }
  async function listReminders() { return Api.get(url('/reminders')); }
  async function cancelReminder(id) { return Api.post(url('/reminders/' + id + '/cancel')); }
  async function getOverdueReport() { return Api.get(url('/overdue')); }

  return { getSettings: getSettings, updateSettings: updateSettings, schedule: schedule, process: process, listReminders: listReminders, cancelReminder: cancelReminder, getOverdueReport: getOverdueReport };
})();
if (typeof window !== 'undefined') window.RelancesApi = RelancesApi;
