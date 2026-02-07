/**
 * Campaigns Module - Main Orchestrator
 * Email Campaigns Management System
 */

const CampaignsModule = (function() {
    'use strict';

    // State
    let currentTab = 'contacts';
    let contacts = [];
    let templates = [];
    let campaigns = [];
    let tags = [];
    let selectedContactId = null;
    let modalOverlay = null;

    // ==================== INITIALIZATION ====================

    function init() {
        console.log('CampaignsModule: Initializing...');
        createModalOverlay();
        bindEvents();
    }

    function createModalOverlay() {
        if (document.getElementById('campaigns-modal-overlay')) return;

        modalOverlay = document.createElement('div');
        modalOverlay.id = 'campaigns-modal-overlay';
        modalOverlay.className = 'campaigns-modal-overlay';
        modalOverlay.innerHTML = '<div class="campaigns-modal" id="campaigns-modal"></div>';
        document.body.appendChild(modalOverlay);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    function bindEvents() {
        // Tab switching
        document.addEventListener('click', (e) => {
            const tab = e.target.closest('.campaigns-tab');
            if (tab) {
                const tabName = tab.dataset.tab;
                if (tabName) switchTab(tabName);
            }
        });

        // Recipient type switching in composer
        document.addEventListener('change', (e) => {
            if (e.target.name === 'recipient-type') {
                const tagsSection = document.getElementById('composer-tags-section');
                if (tagsSection) {
                    tagsSection.style.display = e.target.value === 'tags' ? 'block' : 'none';
                }
            }
        });
    }

    // ==================== VIEW MANAGEMENT ====================

    async function show() {
        const view = document.getElementById('view-campaigns');
        if (!view) {
            console.error('CampaignsModule: view-campaigns not found');
            return;
        }

        // Router already manages view visibility - just ensure active
        if (!view.classList.contains('active')) {
            view.classList.add('active');
        }

        // Initialize view if empty
        if (!view.querySelector('.campaigns-header')) {
            renderMainStructure(view);
        }

        // Load data
        await loadData();
        switchTab(currentTab);
    }

    function renderMainStructure(container) {
        container.innerHTML = `
            <div class="campaigns-header">
                <div class="campaigns-header-left">
                    <div class="campaigns-header-icon">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                    </div>
                    <div>
                        <h1>Campagnes Email</h1>
                        <p class="campaigns-subtitle">Contacts, templates et envoi de campagnes</p>
                    </div>
                </div>
                <button class="btn-campaign btn-campaign-primary" onclick="CampaignsComposer.showComposer()">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Nouvelle campagne
                </button>
            </div>
            <div class="campaigns-tabs">
                <button class="campaigns-tab active" data-tab="contacts">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    Contacts <span class="tab-count" id="contacts-count">0</span>
                </button>
                <button class="campaigns-tab" data-tab="templates">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Templates <span class="tab-count" id="templates-count">0</span>
                </button>
                <button class="campaigns-tab" data-tab="campaigns">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    Campagnes <span class="tab-count" id="campaigns-count">0</span>
                </button>
                <button class="campaigns-tab" data-tab="composer">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Composer
                </button>
            </div>
            <div class="campaigns-content">
                <div class="campaigns-panel contacts-panel" id="panel-contacts" data-panel="contacts"></div>
                <div class="campaigns-panel templates-panel" id="panel-templates" data-panel="templates"></div>
                <div class="campaigns-panel campaigns-list-panel" id="panel-campaigns" data-panel="campaigns"></div>
                <div class="campaigns-panel composer-panel" id="panel-composer" data-panel="composer"></div>
            </div>
        `;
    }

    async function loadData() {
        try {
            // Load all data in parallel
            const [contactsRes, templatesRes, campaignsRes, tagsRes] = await Promise.all([
                CampaignsAPI.listContacts({ limit: 100 }),
                CampaignsAPI.listTemplates(),
                CampaignsAPI.listCampaigns({ limit: 50 }),
                CampaignsAPI.getTags()
            ]);

            contacts = contactsRes.data || [];
            templates = templatesRes.data?.templates || [];
            campaigns = campaignsRes.data || [];
            tags = tagsRes.data?.tags || [];

            // Update counts
            updateCounts();
        } catch (error) {
            console.error('CampaignsModule: Error loading data', error);
        }
    }

    function updateCounts() {
        const contactsCount = document.getElementById('contacts-count');
        const templatesCount = document.getElementById('templates-count');
        const campaignsCount = document.getElementById('campaigns-count');

        if (contactsCount) contactsCount.textContent = contacts.length;
        if (templatesCount) templatesCount.textContent = templates.length;
        if (campaignsCount) campaignsCount.textContent = campaigns.length;
    }

    function switchTab(tabName) {
        currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.campaigns-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update panels
        document.querySelectorAll('.campaigns-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === tabName);
        });

        // Render content
        switch (tabName) {
            case 'contacts':
                renderContactsPanel();
                break;
            case 'templates':
                renderTemplatesPanel();
                break;
            case 'campaigns':
                renderCampaignsPanel();
                break;
            case 'composer':
                renderComposerPanel();
                break;
        }
    }

    // ==================== CONTACTS PANEL ====================

    function renderContactsPanel() {
        const panel = document.getElementById('panel-contacts');
        if (!panel) return;

        panel.innerHTML = `
            <div class="contacts-sidebar">
                <div class="contacts-search">
                    <input type="text" placeholder="Rechercher..." id="contacts-search-input" oninput="CampaignsContacts.search(this.value)">
                </div>
                <div class="contacts-actions">
                    <button class="btn-campaign btn-campaign-primary btn-campaign-small" onclick="CampaignsContacts.showAddModal()">
                        + Ajouter
                    </button>
                    <button class="btn-campaign btn-campaign-secondary btn-campaign-small" onclick="CampaignsContacts.showImportModal()">
                        Importer CSV
                    </button>
                </div>
                <div class="contacts-list" id="contacts-list">
                    ${CampaignsUI.renderContactsList(contacts)}
                </div>
            </div>
            <div class="contacts-detail" id="contacts-detail">
                ${CampaignsUI.renderContactDetail(null)}
            </div>
        `;
    }

    // ==================== TEMPLATES PANEL ====================

    function renderTemplatesPanel() {
        const panel = document.getElementById('panel-templates');
        if (!panel) return;

        panel.innerHTML = CampaignsUI.renderTemplatesGrid(templates);
    }

    // ==================== CAMPAIGNS PANEL ====================

    function renderCampaignsPanel() {
        const panel = document.getElementById('panel-campaigns');
        if (!panel) return;

        // Calculate aggregate stats
        const stats = {
            total_sent: campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0),
            total_opened: campaigns.reduce((sum, c) => sum + (c.opened_count || 0), 0),
            total_clicked: campaigns.reduce((sum, c) => sum + (c.clicked_count || 0), 0),
            avg_open_rate: 0
        };

        if (stats.total_sent > 0) {
            stats.avg_open_rate = Math.round((stats.total_opened / stats.total_sent) * 100);
        }

        panel.innerHTML = CampaignsUI.renderCampaignsList(campaigns, stats);
    }

    // ==================== COMPOSER PANEL ====================

    function renderComposerPanel() {
        const panel = document.getElementById('panel-composer');
        if (!panel) return;

        panel.innerHTML = CampaignsUI.renderComposer(contacts, templates, tags);
    }

    // ==================== MODAL MANAGEMENT ====================

    function showModal(content) {
        const modal = document.getElementById('campaigns-modal');
        if (modal) modal.innerHTML = content;
        if (modalOverlay) modalOverlay.classList.add('active');
    }

    function closeModal() {
        if (modalOverlay) modalOverlay.classList.remove('active');
    }

    // ==================== GETTERS ====================

    function getContacts() { return contacts; }
    function getTemplates() { return templates; }
    function getCampaigns() { return campaigns; }
    function getTags() { return tags; }
    function getSelectedContactId() { return selectedContactId; }

    function setSelectedContactId(id) { selectedContactId = id; }
    function setContacts(c) { contacts = c; updateCounts(); }
    function setTemplates(t) { templates = t; updateCounts(); }
    function setCampaigns(c) { campaigns = c; updateCounts(); }

    return {
        init,
        show,
        switchTab,
        renderContactsPanel,
        renderTemplatesPanel,
        renderCampaignsPanel,
        renderComposerPanel,
        showModal,
        closeModal,
        loadData,
        // Getters/Setters
        getContacts,
        getTemplates,
        getCampaigns,
        getTags,
        getSelectedContactId,
        setSelectedContactId,
        setContacts,
        setTemplates,
        setCampaigns
    };
})();

// ==================== CONTACTS SUB-MODULE ====================

const CampaignsContacts = (function() {
    'use strict';

    let searchQuery = '';
    let csvData = null;

    function search(query) {
        searchQuery = query.toLowerCase();
        const contacts = CampaignsModule.getContacts();
        const filtered = contacts.filter(c =>
            c.email.toLowerCase().includes(searchQuery) ||
            (c.name && c.name.toLowerCase().includes(searchQuery))
        );

        const list = document.getElementById('contacts-list');
        if (list) list.innerHTML = CampaignsUI.renderContactsList(filtered);
    }

    function selectContact(contactId) {
        CampaignsModule.setSelectedContactId(contactId);

        // Update selection
        document.querySelectorAll('.contact-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.contactId === contactId);
        });

        // Render detail
        const contact = CampaignsModule.getContacts().find(c => c.id === contactId);
        const detail = document.getElementById('contacts-detail');
        if (detail) detail.innerHTML = CampaignsUI.renderContactDetail(contact);
    }

    function showAddModal() {
        CampaignsModule.showModal(CampaignsUI.renderAddContactModal());
    }

    async function showEditModal(contactId) {
        const contact = CampaignsModule.getContacts().find(c => c.id === contactId);
        if (contact) {
            CampaignsModule.showModal(CampaignsUI.renderEditContactModal(contact));
        }
    }

    function showImportModal() {
        csvData = null;
        CampaignsModule.showModal(CampaignsUI.renderImportModal());
    }

    async function saveContact() {
        const email = document.getElementById('contact-email')?.value;
        const name = document.getElementById('contact-name')?.value;
        const tagsStr = document.getElementById('contact-tags')?.value || '';
        const notes = document.getElementById('contact-notes')?.value;

        if (!email) {
            alert('Email requis');
            return;
        }

        const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);

        try {
            await CampaignsAPI.createContact({ email, name, tags, notes });
            closeModal();
            await CampaignsModule.loadData();
            CampaignsModule.renderContactsPanel();
        } catch (error) {
            console.error('Error creating contact:', error);
            alert('Erreur lors de la création du contact');
        }
    }

    async function updateContact() {
        const id = document.getElementById('contact-id')?.value;
        const email = document.getElementById('contact-email')?.value;
        const name = document.getElementById('contact-name')?.value;
        const tagsStr = document.getElementById('contact-tags')?.value || '';
        const notes = document.getElementById('contact-notes')?.value;

        if (!id || !email) return;

        const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);

        try {
            await CampaignsAPI.updateContact(id, { email, name, tags, notes });
            closeModal();
            await CampaignsModule.loadData();
            CampaignsModule.renderContactsPanel();
            selectContact(id);
        } catch (error) {
            console.error('Error updating contact:', error);
            alert('Erreur lors de la mise à jour');
        }
    }

    async function confirmDelete(contactId) {
        if (!confirm('Supprimer ce contact ?')) return;

        try {
            await CampaignsAPI.deleteContact(contactId);
            CampaignsModule.setSelectedContactId(null);
            await CampaignsModule.loadData();
            CampaignsModule.renderContactsPanel();
        } catch (error) {
            console.error('Error deleting contact:', error);
            alert('Erreur lors de la suppression');
        }
    }

    function handleCSVFile(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            parseCSV(text);
        };
        reader.readAsText(file);
    }

    function parseCSV(text) {
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
            alert('Fichier CSV vide ou invalide');
            return;
        }

        // Parse header
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        const emailIdx = header.findIndex(h => h.includes('email'));
        const nameIdx = header.findIndex(h => h.includes('nom') || h.includes('name'));
        const tagsIdx = header.findIndex(h => h.includes('tag'));

        if (emailIdx === -1) {
            alert('Colonne email non trouvée');
            return;
        }

        // Parse data
        csvData = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim());
            const email = cols[emailIdx];
            if (!email || !email.includes('@')) continue;

            csvData.push({
                email,
                name: nameIdx >= 0 ? cols[nameIdx] : null,
                tags: tagsIdx >= 0 ? cols[tagsIdx]?.split(';').map(t => t.trim()).filter(t => t) : []
            });
        }

        // Show preview
        const preview = document.getElementById('csv-preview');
        if (preview && csvData.length > 0) {
            const previewRows = csvData.slice(0, 5).map(c => `
                <tr>
                    <td>${CampaignsUI.escapeHtml(c.email)}</td>
                    <td>${CampaignsUI.escapeHtml(c.name || '-')}</td>
                    <td>${(c.tags || []).join(', ') || '-'}</td>
                </tr>
            `).join('');

            preview.innerHTML = `
                <p style="margin: 16px 0 8px; color: #fff;">${csvData.length} contacts trouvés</p>
                <table class="csv-preview-table">
                    <thead><tr><th>Email</th><th>Nom</th><th>Tags</th></tr></thead>
                    <tbody>${previewRows}</tbody>
                </table>
                ${csvData.length > 5 ? `<p style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">... et ${csvData.length - 5} autres</p>` : ''}
            `;

            document.getElementById('btn-import-csv').disabled = false;
        }
    }

    async function importCSV() {
        if (!csvData || csvData.length === 0) return;

        try {
            const result = await CampaignsAPI.importContacts(csvData);
            alert(`Import terminé: ${result.data?.result?.imported || 0} importés, ${result.data?.result?.skipped || 0} ignorés`);
            closeModal();
            await CampaignsModule.loadData();
            CampaignsModule.renderContactsPanel();
        } catch (error) {
            console.error('Error importing contacts:', error);
            alert('Erreur lors de l\'import');
        }
    }

    function closeModal() {
        CampaignsModule.closeModal();
    }

    return {
        search,
        selectContact,
        showAddModal,
        showEditModal,
        showImportModal,
        saveContact,
        updateContact,
        confirmDelete,
        handleCSVFile,
        importCSV,
        closeModal
    };
})();

// ==================== TEMPLATES SUB-MODULE ====================

const CampaignsTemplates = (function() {
    'use strict';

    let selectedTemplateId = null;

    function selectTemplate(templateId) {
        selectedTemplateId = templateId;
        showEditModal(templateId);
    }

    function showCreateModal() {
        CampaignsModule.showModal(CampaignsUI.renderTemplateModal(null));
    }

    async function showEditModal(templateId) {
        const template = CampaignsModule.getTemplates().find(t => t.id === templateId);
        if (template) {
            CampaignsModule.showModal(CampaignsUI.renderTemplateModal(template));
        }
    }

    async function saveTemplate() {
        const id = document.getElementById('template-id')?.value;
        const name = document.getElementById('template-name')?.value;
        const subject = document.getElementById('template-subject')?.value;
        const html_content = document.getElementById('template-content')?.value;

        if (!name || !subject || !html_content) {
            alert('Tous les champs sont requis');
            return;
        }

        try {
            if (id) {
                await CampaignsAPI.updateTemplate(id, { name, subject, html_content });
            } else {
                await CampaignsAPI.createTemplate({ name, subject, html_content });
            }
            closeModal();
            await CampaignsModule.loadData();
            CampaignsModule.renderTemplatesPanel();
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Erreur lors de la sauvegarde');
        }
    }

    async function deleteTemplate(templateId) {
        if (!confirm('Supprimer ce template ?')) return;

        try {
            await CampaignsAPI.deleteTemplate(templateId);
            await CampaignsModule.loadData();
            CampaignsModule.renderTemplatesPanel();
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Erreur lors de la suppression');
        }
    }

    function closeModal() {
        CampaignsModule.closeModal();
    }

    return {
        selectTemplate,
        showCreateModal,
        showEditModal,
        saveTemplate,
        deleteTemplate,
        closeModal
    };
})();

// ==================== CAMPAIGNS SUB-MODULE ====================

const CampaignsCampaigns = (function() {
    'use strict';

    async function viewCampaign(campaignId) {
        try {
            const response = await CampaignsAPI.getCampaign(campaignId);
            const campaign = response.data?.campaign;
            if (campaign) {
                // TODO: Show campaign detail modal
                console.log('Campaign:', campaign);
            }
        } catch (error) {
            console.error('Error loading campaign:', error);
        }
    }

    return {
        viewCampaign
    };
})();

// ==================== COMPOSER SUB-MODULE ====================

const CampaignsComposer = (function() {
    'use strict';

    let currentCampaignId = null;

    function showComposer() {
        CampaignsModule.switchTab('composer');
    }

    async function loadTemplate(templateId) {
        if (!templateId) {
            document.getElementById('composer-subject').value = '';
            document.getElementById('composer-content').value = '';
            return;
        }

        const template = CampaignsModule.getTemplates().find(t => t.id === templateId);
        if (template) {
            document.getElementById('composer-subject').value = template.subject;
            document.getElementById('composer-content').value = template.html_content;
        }
    }

    function getRecipients() {
        const type = document.querySelector('input[name="recipient-type"]:checked')?.value;

        if (type === 'all') {
            return { send_to_all: true };
        } else if (type === 'tags') {
            const selectedTags = Array.from(document.querySelectorAll('input[name="tags"]:checked'))
                .map(cb => cb.value);
            return { tags: selectedTags };
        } else {
            // Manual selection - for now, send to all
            return { send_to_all: true };
        }
    }

    async function saveDraft() {
        const name = document.getElementById('composer-name')?.value;
        const subject = document.getElementById('composer-subject')?.value;
        const html_content = document.getElementById('composer-content')?.value;

        if (!name || !subject || !html_content) {
            alert('Remplissez tous les champs');
            return;
        }

        try {
            if (currentCampaignId) {
                await CampaignsAPI.updateCampaign(currentCampaignId, { name, subject, html_content });
            } else {
                const response = await CampaignsAPI.createCampaign({ name, subject, html_content });
                currentCampaignId = response.data?.campaign?.id;
            }
            alert('Brouillon enregistré');
            await CampaignsModule.loadData();
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Erreur lors de la sauvegarde');
        }
    }

    function preview() {
        const html_content = document.getElementById('composer-content')?.value || '';
        const previewWindow = window.open('', '_blank', 'width=600,height=800');
        previewWindow.document.write(html_content);
        previewWindow.document.close();
    }

    async function send() {
        const name = document.getElementById('composer-name')?.value;
        const subject = document.getElementById('composer-subject')?.value;
        const html_content = document.getElementById('composer-content')?.value;

        if (!name || !subject || !html_content) {
            alert('Remplissez tous les champs');
            return;
        }

        const recipients = getRecipients();
        const contactCount = recipients.send_to_all
            ? CampaignsModule.getContacts().length
            : (recipients.contact_ids?.length || 'plusieurs');

        if (!confirm(`Envoyer cette campagne à ${contactCount} contacts ?`)) {
            return;
        }

        try {
            // Create or update campaign
            let campaignId = currentCampaignId;
            if (!campaignId) {
                const response = await CampaignsAPI.createCampaign({ name, subject, html_content });
                campaignId = response.data?.campaign?.id;
            } else {
                await CampaignsAPI.updateCampaign(campaignId, { name, subject, html_content });
            }

            // Send
            const result = await CampaignsAPI.sendCampaign(campaignId, recipients);
            alert(`Campagne envoyée: ${result.data?.result?.sent || 0} emails envoyés, ${result.data?.result?.failed || 0} échecs`);

            // Reset and refresh
            currentCampaignId = null;
            await CampaignsModule.loadData();
            CampaignsModule.switchTab('campaigns');
        } catch (error) {
            console.error('Error sending campaign:', error);
            alert('Erreur lors de l\'envoi: ' + (error.message || 'Erreur inconnue'));
        }
    }

    return {
        showComposer,
        loadTemplate,
        saveDraft,
        preview,
        send
    };
})();

// Initialize on load
if (typeof window !== 'undefined') {
    window.CampaignsModule = CampaignsModule;
    window.CampaignsContacts = CampaignsContacts;
    window.CampaignsTemplates = CampaignsTemplates;
    window.CampaignsCampaigns = CampaignsCampaigns;
    window.CampaignsComposer = CampaignsComposer;

    document.addEventListener('DOMContentLoaded', () => {
        CampaignsModule.init();
    });
}
