/**
 * CalendarApi - API du module Calendrier
 */
const CalendarApi = (function() {
  'use strict';
  function wid() { return (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) ? ApiTokens.getWorkspaceId() : localStorage.getItem('workspace_id') || ''; }
  function url(p) { return '/calendar/workspace/' + wid() + p; }

  async function listEvents(startDate, endDate, opts) {
    var q = '?start_date=' + encodeURIComponent(startDate) + '&end_date=' + encodeURIComponent(endDate);
    if (opts && opts.memberId) q += '&member_id=' + encodeURIComponent(opts.memberId);
    if (opts && opts.eventType) q += '&event_type=' + encodeURIComponent(opts.eventType);
    return Api.get(url('/events') + q);
  }
  async function getUpcoming(days) { return Api.get(url('/events/upcoming') + '?days=' + (days || 7)); }
  async function createEvent(data) { return Api.post(url('/events'), data); }
  async function updateEvent(id, data) { return Api.put(url('/events/' + id), data); }
  async function deleteEvent(id) { return Api.del(url('/events/' + id)); }
  async function syncTasks() { return Api.post(url('/sync/tasks')); }
  async function syncInvoices() { return Api.post(url('/sync/invoices')); }

  return { listEvents: listEvents, getUpcoming: getUpcoming, createEvent: createEvent, updateEvent: updateEvent, deleteEvent: deleteEvent, syncTasks: syncTasks, syncInvoices: syncInvoices };
})();
if (typeof window !== 'undefined') window.CalendarApi = CalendarApi;
