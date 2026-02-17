/**
 * ContractsApi - API Contrats et Signatures v5.0
 */
const ContractsApi = (function() {
  'use strict';
  function wid() { return (typeof ApiTokens !== 'undefined' && ApiTokens.getWorkspaceId) ? ApiTokens.getWorkspaceId() : localStorage.getItem('workspace_id') || ''; }
  function url(p) { return '/contracts/workspace/' + wid() + p; }

  async function listTemplates() { return Api.get(url('/templates')); }
  async function createTemplate(data) { return Api.post(url('/templates'), data); }
  async function updateTemplate(id, data) { return Api.put(url('/templates/' + id), data); }
  async function deleteTemplate(id) { return Api.del(url('/templates/' + id)); }
  async function listContracts(filters) { var q = ''; if (filters) { var p = []; if (filters.status) p.push('status=' + filters.status); if (filters.page) p.push('page=' + filters.page); if (p.length) q = '?' + p.join('&'); } return Api.get(url('/') + q); }
  async function getContract(id) { return Api.get(url('/' + id)); }
  async function createContract(data) { return Api.post(url('/'), data); }
  async function updateContract(id, data) { return Api.put(url('/' + id), data); }
  async function deleteContract(id) { return Api.del(url('/' + id)); }
  async function sendForSignature(id, data) { return Api.post(url('/' + id + '/send-signature'), data); }

  return { listTemplates: listTemplates, createTemplate: createTemplate, updateTemplate: updateTemplate, deleteTemplate: deleteTemplate, listContracts: listContracts, getContract: getContract, createContract: createContract, updateContract: updateContract, deleteContract: deleteContract, sendForSignature: sendForSignature };
})();
if (typeof window !== 'undefined') window.ContractsApi = ContractsApi;
