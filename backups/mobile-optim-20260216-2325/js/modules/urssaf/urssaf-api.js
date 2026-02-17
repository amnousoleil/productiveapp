/**
 * URSSAFApi - API URSSAF Cotisations
 */
const URSSAFApi = (function() {
  'use strict';
  function wid() { return (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) ? ApiTokens.getWorkspaceId() : localStorage.getItem('workspace_id') || ''; }
  function url(p) { return '/urssaf/workspace/' + wid() + p; }

  async function simulate(data) { return Api.post(url('/simulate'), data); }
  async function listDeclarations() { return Api.get(url('/declarations')); }
  async function createDeclaration(data) { return Api.post(url('/declarations'), data); }
  async function updateDeclaration(id, data) { return Api.put(url('/declarations/' + id), data); }
  async function annualSummary(year) { return Api.get(url('/annual') + (year ? '?year=' + year : '')); }
  async function autoCalculate(quarter, year) { return Api.post(url('/auto-calculate'), { quarter: quarter, year: year }); }

  return { simulate: simulate, listDeclarations: listDeclarations, createDeclaration: createDeclaration, updateDeclaration: updateDeclaration, annualSummary: annualSummary, autoCalculate: autoCalculate };
})();
if (typeof window !== 'undefined') window.URSSAFApi = URSSAFApi;
