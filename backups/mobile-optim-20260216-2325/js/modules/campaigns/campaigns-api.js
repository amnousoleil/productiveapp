/**
 * Campaigns API Module
 * Handles all API calls for email campaigns
 */

const CampaignsAPI = (function() {
    'use strict';

    const BASE_PATH = '/campaigns';

    function getWorkspaceId() {
        return ApiTokens.getWorkspaceId();
    }

    // ==================== CONTACTS ====================

    async function listContacts(params = {}) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) throw new Error('No workspace ID');

        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.q) queryParams.append('q', params.q);
        if (params.tags) queryParams.append('tags', params.tags.join(','));

        const url = `${BASE_PATH}/workspace/${workspaceId}/contacts?${queryParams}`;
        return ApiFetch.fetchWithAuth(url);
    }

    async function getContact(contactId) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/contacts/${contactId}`);
    }

    async function createContact(data) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) throw new Error('No workspace ID');

        return ApiFetch.fetchWithAuth(`${BASE_PATH}/workspace/${workspaceId}/contacts`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async function updateContact(contactId, data) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/contacts/${contactId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async function deleteContact(contactId) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/contacts/${contactId}`, {
            method: 'DELETE'
        });
    }

    async function importContacts(contacts) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) throw new Error('No workspace ID');

        return ApiFetch.fetchWithAuth(`${BASE_PATH}/workspace/${workspaceId}/contacts/import`, {
            method: 'POST',
            body: JSON.stringify({ contacts })
        });
    }

    async function getTags() {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) return { data: { tags: [] } };

        return ApiFetch.fetchWithAuth(`${BASE_PATH}/workspace/${workspaceId}/tags`);
    }

    // ==================== TEMPLATES ====================

    async function listTemplates() {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) throw new Error('No workspace ID');

        return ApiFetch.fetchWithAuth(`${BASE_PATH}/workspace/${workspaceId}/templates`);
    }

    async function getTemplate(templateId) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/templates/${templateId}`);
    }

    async function createTemplate(data) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) throw new Error('No workspace ID');

        return ApiFetch.fetchWithAuth(`${BASE_PATH}/workspace/${workspaceId}/templates`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async function updateTemplate(templateId, data) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/templates/${templateId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async function deleteTemplate(templateId) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/templates/${templateId}`, {
            method: 'DELETE'
        });
    }

    // ==================== CAMPAIGNS ====================

    async function listCampaigns(params = {}) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) throw new Error('No workspace ID');

        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.status) queryParams.append('status', params.status);

        const url = `${BASE_PATH}/workspace/${workspaceId}?${queryParams}`;
        return ApiFetch.fetchWithAuth(url);
    }

    async function getCampaign(campaignId) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/${campaignId}`);
    }

    async function createCampaign(data) {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) throw new Error('No workspace ID');

        return ApiFetch.fetchWithAuth(`${BASE_PATH}/workspace/${workspaceId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async function updateCampaign(campaignId, data) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/${campaignId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async function deleteCampaign(campaignId) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/${campaignId}`, {
            method: 'DELETE'
        });
    }

    async function sendCampaign(campaignId, recipients) {
        return ApiFetch.fetchWithAuth(`${BASE_PATH}/${campaignId}/send`, {
            method: 'POST',
            body: JSON.stringify(recipients)
        });
    }

    return {
        // Contacts
        listContacts,
        getContact,
        createContact,
        updateContact,
        deleteContact,
        importContacts,
        getTags,
        // Templates
        listTemplates,
        getTemplate,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        // Campaigns
        listCampaigns,
        getCampaign,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        sendCampaign
    };
})();

if (typeof window !== 'undefined') {
    window.CampaignsAPI = CampaignsAPI;
}
