/**
 * GoalsApi - API Objectifs Financiers
 */
const GoalsApi = (function() {
  'use strict';
  function wid() { return (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) ? ApiTokens.getWorkspaceId() : localStorage.getItem('workspace_id') || ''; }
  function url(p) { return '/goals/workspace/' + wid() + p; }

  async function dashboard() { return Api.get(url('/dashboard')); }
  async function list(filters) { var q = ''; if (filters) { var parts = []; if (filters.type) parts.push('type=' + filters.type); if (filters.status) parts.push('status=' + filters.status); if (parts.length) q = '?' + parts.join('&'); } return Api.get(url('/') + q); }
  async function get(id) { return Api.get(url('/' + id)); }
  async function create(data) { return Api.post(url('/'), data); }
  async function update(id, data) { return Api.put(url('/' + id), data); }
  async function remove(id) { return Api.del(url('/' + id)); }
  async function refresh(id) { return Api.post(url('/' + id + '/refresh')); }

  return { dashboard: dashboard, list: list, get: get, create: create, update: update, remove: remove, refresh: refresh };
})();
if (typeof window !== 'undefined') window.GoalsApi = GoalsApi;
