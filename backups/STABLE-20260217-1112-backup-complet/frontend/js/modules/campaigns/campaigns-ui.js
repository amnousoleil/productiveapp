/**
 * Campaigns UI Module
 * Handles rendering for email campaigns views
 */

const CampaignsUI = (function() {
    'use strict';

    // ==================== CONTACTS ====================

    function renderContactsList(contacts) {
        if (!contacts || contacts.length === 0) {
            return `
                <div class="campaigns-empty">
                    <div class="campaigns-empty-icon">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            <line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>
                        </svg>
                    </div>
                    <h3>Aucun contact</h3>
                    <p>Ajoutez des contacts pour commencer vos campagnes</p>
                    <button class="btn-campaign btn-campaign-primary" onclick="CampaignsContacts.showAddModal()">
                        Ajouter un contact
                    </button>
                </div>
            `;
        }

        return contacts.map(contact => renderContactItem(contact)).join('');
    }

    function renderContactItem(contact) {
        const initial = (contact.name || contact.email)[0].toUpperCase();
        const tagsHtml = (contact.tags || []).map(tag =>
            `<span class="contact-tag">${escapeHtml(tag)}</span>`
        ).join('');

        return `
            <div class="contact-item" data-contact-id="${contact.id}" onclick="CampaignsContacts.selectContact('${contact.id}')">
                <div class="contact-avatar">${initial}</div>
                <div class="contact-info">
                    <div class="contact-name">${escapeHtml(contact.name || 'Sans nom')}</div>
                    <div class="contact-email">${escapeHtml(contact.email)}</div>
                    ${tagsHtml ? `<div class="contact-tags">${tagsHtml}</div>` : ''}
                </div>
            </div>
        `;
    }

    function renderContactDetail(contact) {
        if (!contact) {
            return `
                <div class="campaigns-empty">
                    <div class="campaigns-empty-icon">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <h3>Aucun contact selectionne</h3>
                    <p>Selectionnez un contact dans la liste</p>
                </div>
            `;
        }

        const initial = (contact.name || contact.email)[0].toUpperCase();
        const tagsHtml = (contact.tags || []).map(tag =>
            `<span class="contact-tag">${escapeHtml(tag)}</span>`
        ).join('') || '<span style="color: rgba(255,255,255,0.4)">Aucun tag</span>';

        return `
            <div class="contact-detail-header">
                <div class="contact-detail-info">
                    <div class="contact-detail-avatar">${initial}</div>
                    <div class="contact-detail-text">
                        <h2>${escapeHtml(contact.name || 'Sans nom')}</h2>
                        <p>${escapeHtml(contact.email)}</p>
                    </div>
                </div>
                <div class="contact-detail-actions">
                    <button class="btn-campaign btn-campaign-secondary" onclick="CampaignsContacts.showEditModal('${contact.id}')">
                        Modifier
                    </button>
                    <button class="btn-campaign btn-campaign-danger" onclick="CampaignsContacts.confirmDelete('${contact.id}')">
                        Supprimer
                    </button>
                </div>
            </div>
            <div class="contact-detail-body">
                <div class="contact-field">
                    <label>Tags</label>
                    <div class="contact-field-value">${tagsHtml}</div>
                </div>
                <div class="contact-field">
                    <label>Notes</label>
                    <div class="contact-field-value">${escapeHtml(contact.notes) || '<span style="color: rgba(255,255,255,0.4)">Aucune note</span>'}</div>
                </div>
                <div class="contact-field">
                    <label>Ajouté le</label>
                    <div class="contact-field-value">${formatDate(contact.created_at)}</div>
                </div>
            </div>
        `;
    }

    // ==================== TEMPLATES ====================

    function renderTemplatesGrid(templates) {
        const newCardHtml = `
            <div class="template-card template-card-new" onclick="CampaignsTemplates.showCreateModal()">
                <span>+</span>
                <p>Créer un template</p>
            </div>
        `;

        if (!templates || templates.length === 0) {
            return `
                <div class="templates-grid">
                    ${newCardHtml}
                </div>
            `;
        }

        const templatesHtml = templates.map(template => renderTemplateCard(template)).join('');
        return `
            <div class="templates-grid">
                ${newCardHtml}
                ${templatesHtml}
            </div>
        `;
    }

    function renderTemplateCard(template) {
        return `
            <div class="template-card" onclick="CampaignsTemplates.selectTemplate('${template.id}')">
                <div class="template-preview">&#9993;</div>
                <div class="template-info">
                    <div class="template-name">${escapeHtml(template.name)}</div>
                    <div class="template-subject">${escapeHtml(template.subject)}</div>
                </div>
            </div>
        `;
    }

    // ==================== CAMPAIGNS ====================

    function renderCampaignsList(campaigns, stats) {
        const statsHtml = renderCampaignStats(stats);
        const tableHtml = renderCampaignsTable(campaigns);

        return `
            <div class="campaigns-list-header">
                <button class="btn-campaign btn-campaign-primary" onclick="CampaignsComposer.showComposer()">
                    Nouvelle campagne
                </button>
            </div>
            ${statsHtml}
            ${tableHtml}
        `;
    }

    function renderCampaignStats(stats) {
        const totalSent = stats?.total_sent || 0;
        const totalOpened = stats?.total_opened || 0;
        const totalClicked = stats?.total_clicked || 0;
        const avgOpenRate = stats?.avg_open_rate || 0;

        return `
            <div class="campaign-stats-row">
                <div class="campaign-stat-card">
                    <div class="stat-value">${totalSent}</div>
                    <div class="stat-label">Emails envoyés</div>
                </div>
                <div class="campaign-stat-card">
                    <div class="stat-value">${totalOpened}</div>
                    <div class="stat-label">Ouvertures</div>
                </div>
                <div class="campaign-stat-card">
                    <div class="stat-value">${totalClicked}</div>
                    <div class="stat-label">Clics</div>
                </div>
                <div class="campaign-stat-card">
                    <div class="stat-value">${avgOpenRate}%</div>
                    <div class="stat-label">Taux d'ouverture</div>
                </div>
            </div>
        `;
    }

    function renderCampaignsTable(campaigns) {
        if (!campaigns || campaigns.length === 0) {
            return `
                <div class="campaigns-table-container">
                    <div class="campaigns-empty">
                        <div class="campaigns-empty-icon">
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                            </svg>
                        </div>
                        <h3>Aucune campagne</h3>
                        <p>Creez votre premiere campagne email</p>
                    </div>
                </div>
            `;
        }

        const rowsHtml = campaigns.map(campaign => `
            <tr onclick="CampaignsCampaigns.viewCampaign('${campaign.id}')">
                <td>
                    <strong>${escapeHtml(campaign.name)}</strong>
                    <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">${escapeHtml(campaign.subject)}</div>
                </td>
                <td><span class="campaign-status ${campaign.status}">${getStatusLabel(campaign.status)}</span></td>
                <td>${campaign.total_recipients || 0}</td>
                <td>
                    <div class="campaign-metrics">
                        <div class="campaign-metric">
                            <div class="campaign-metric-value">${campaign.sent_count || 0}</div>
                            <div class="campaign-metric-label">Envoyés</div>
                        </div>
                        <div class="campaign-metric">
                            <div class="campaign-metric-value">${campaign.opened_count || 0}</div>
                            <div class="campaign-metric-label">Ouverts</div>
                        </div>
                        <div class="campaign-metric">
                            <div class="campaign-metric-value">${campaign.clicked_count || 0}</div>
                            <div class="campaign-metric-label">Clics</div>
                        </div>
                    </div>
                </td>
                <td>${campaign.sent_at ? formatDate(campaign.sent_at) : '-'}</td>
            </tr>
        `).join('');

        return `
            <div class="campaigns-table-container">
                <table class="campaigns-table">
                    <thead>
                        <tr>
                            <th>Campagne</th>
                            <th>Statut</th>
                            <th>Destinataires</th>
                            <th>Performance</th>
                            <th>Envoyé le</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    }

    // ==================== COMPOSER ====================

    function renderComposer(contacts, templates, tags) {
        const contactsCount = contacts?.length || 0;

        const tagsOptions = (tags || []).map(tag => `
            <div class="recipient-option">
                <input type="checkbox" id="tag-${tag}" name="tags" value="${escapeHtml(tag)}">
                <label for="tag-${tag}">${escapeHtml(tag)}</label>
            </div>
        `).join('');

        return `
            <div class="composer-sidebar">
                <div class="composer-section">
                    <h3>Destinataires</h3>
                    <div class="composer-recipients">
                        <div class="recipient-option selected">
                            <input type="radio" id="recipients-all" name="recipient-type" value="all" checked>
                            <label for="recipients-all">Tous les contacts</label>
                            <span class="recipient-count">${contactsCount}</span>
                        </div>
                        <div class="recipient-option">
                            <input type="radio" id="recipients-tags" name="recipient-type" value="tags">
                            <label for="recipients-tags">Par tags</label>
                        </div>
                        <div class="recipient-option">
                            <input type="radio" id="recipients-select" name="recipient-type" value="select">
                            <label for="recipients-select">Sélection manuelle</label>
                        </div>
                    </div>
                </div>

                <div class="composer-section" id="composer-tags-section" style="display: none;">
                    <h3>Filtrer par tags</h3>
                    <div class="composer-recipients">
                        ${tagsOptions || '<p style="color: rgba(255,255,255,0.5);">Aucun tag disponible</p>'}
                    </div>
                </div>

                <div class="composer-section">
                    <h3>Template</h3>
                    <select class="campaigns-form-group" id="composer-template" onchange="CampaignsComposer.loadTemplate(this.value)">
                        <option value="">-- Email vide --</option>
                        ${(templates || []).map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="composer-main">
                <div class="composer-header">
                    <div class="composer-field">
                        <label>Nom de la campagne</label>
                        <input type="text" id="composer-name" placeholder="Ma campagne">
                    </div>
                    <div class="composer-field">
                        <label>Objet de l'email</label>
                        <input type="text" id="composer-subject" placeholder="Sujet de l'email">
                    </div>
                </div>

                <div class="composer-editor">
                    <textarea id="composer-content" placeholder="Contenu HTML de l'email...

Variables disponibles:
{{name}} - Nom du contact
{{email}} - Email du contact"></textarea>
                </div>

                <div class="composer-footer">
                    <button class="btn-campaign btn-campaign-secondary" onclick="CampaignsComposer.saveDraft()">
                        Enregistrer brouillon
                    </button>
                    <div>
                        <button class="btn-campaign btn-campaign-secondary" onclick="CampaignsComposer.preview()">
                            Prévisualiser
                        </button>
                        <button class="btn-campaign btn-campaign-primary" onclick="CampaignsComposer.send()">
                            Envoyer la campagne
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== MODALS ====================

    function renderAddContactModal() {
        return `
            <div class="campaigns-modal-header">
                <h2>Ajouter un contact</h2>
                <button class="campaigns-modal-close" onclick="CampaignsContacts.closeModal()">&times;</button>
            </div>
            <div class="campaigns-modal-body">
                <div class="campaigns-form-group">
                    <label>Email *</label>
                    <input type="email" id="contact-email" placeholder="email@example.com" required>
                </div>
                <div class="campaigns-form-group">
                    <label>Nom</label>
                    <input type="text" id="contact-name" placeholder="John Doe">
                </div>
                <div class="campaigns-form-group">
                    <label>Tags (séparés par des virgules)</label>
                    <input type="text" id="contact-tags" placeholder="client, vip">
                </div>
                <div class="campaigns-form-group">
                    <label>Notes</label>
                    <textarea id="contact-notes" placeholder="Notes sur ce contact..."></textarea>
                </div>
            </div>
            <div class="campaigns-modal-footer">
                <button class="btn-campaign btn-campaign-secondary" onclick="CampaignsContacts.closeModal()">Annuler</button>
                <button class="btn-campaign btn-campaign-primary" onclick="CampaignsContacts.saveContact()">Ajouter</button>
            </div>
        `;
    }

    function renderEditContactModal(contact) {
        const tagsStr = (contact.tags || []).join(', ');
        return `
            <div class="campaigns-modal-header">
                <h2>Modifier le contact</h2>
                <button class="campaigns-modal-close" onclick="CampaignsContacts.closeModal()">&times;</button>
            </div>
            <div class="campaigns-modal-body">
                <input type="hidden" id="contact-id" value="${contact.id}">
                <div class="campaigns-form-group">
                    <label>Email *</label>
                    <input type="email" id="contact-email" value="${escapeHtml(contact.email)}" required>
                </div>
                <div class="campaigns-form-group">
                    <label>Nom</label>
                    <input type="text" id="contact-name" value="${escapeHtml(contact.name || '')}">
                </div>
                <div class="campaigns-form-group">
                    <label>Tags (séparés par des virgules)</label>
                    <input type="text" id="contact-tags" value="${escapeHtml(tagsStr)}">
                </div>
                <div class="campaigns-form-group">
                    <label>Notes</label>
                    <textarea id="contact-notes">${escapeHtml(contact.notes || '')}</textarea>
                </div>
            </div>
            <div class="campaigns-modal-footer">
                <button class="btn-campaign btn-campaign-secondary" onclick="CampaignsContacts.closeModal()">Annuler</button>
                <button class="btn-campaign btn-campaign-primary" onclick="CampaignsContacts.updateContact()">Enregistrer</button>
            </div>
        `;
    }

    function renderImportModal() {
        return `
            <div class="campaigns-modal-header">
                <h2>Importer des contacts</h2>
                <button class="campaigns-modal-close" onclick="CampaignsContacts.closeModal()">&times;</button>
            </div>
            <div class="campaigns-modal-body">
                <div class="csv-import-zone" onclick="document.getElementById('csv-file').click()">
                    <input type="file" id="csv-file" accept=".csv" onchange="CampaignsContacts.handleCSVFile(this)">
                    <div class="csv-import-icon">&#128196;</div>
                    <div class="csv-import-text">
                        <strong>Cliquez</strong> ou déposez un fichier CSV<br>
                        <small>Format: email, nom, tags (optionnel)</small>
                    </div>
                </div>
                <div id="csv-preview"></div>
            </div>
            <div class="campaigns-modal-footer">
                <button class="btn-campaign btn-campaign-secondary" onclick="CampaignsContacts.closeModal()">Annuler</button>
                <button class="btn-campaign btn-campaign-primary" id="btn-import-csv" disabled onclick="CampaignsContacts.importCSV()">
                    Importer
                </button>
            </div>
        `;
    }

    function renderTemplateModal(template = null) {
        const isEdit = !!template;
        return `
            <div class="campaigns-modal-header">
                <h2>${isEdit ? 'Modifier le template' : 'Créer un template'}</h2>
                <button class="campaigns-modal-close" onclick="CampaignsTemplates.closeModal()">&times;</button>
            </div>
            <div class="campaigns-modal-body">
                ${isEdit ? `<input type="hidden" id="template-id" value="${template.id}">` : ''}
                <div class="campaigns-form-group">
                    <label>Nom du template *</label>
                    <input type="text" id="template-name" value="${escapeHtml(template?.name || '')}" placeholder="Newsletter mensuelle">
                </div>
                <div class="campaigns-form-group">
                    <label>Objet de l'email *</label>
                    <input type="text" id="template-subject" value="${escapeHtml(template?.subject || '')}" placeholder="Sujet par défaut">
                </div>
                <div class="campaigns-form-group">
                    <label>Contenu HTML *</label>
                    <textarea id="template-content" style="min-height: 200px;">${escapeHtml(template?.html_content || '')}</textarea>
                </div>
            </div>
            <div class="campaigns-modal-footer">
                <button class="btn-campaign btn-campaign-secondary" onclick="CampaignsTemplates.closeModal()">Annuler</button>
                <button class="btn-campaign btn-campaign-primary" onclick="CampaignsTemplates.saveTemplate()">
                    ${isEdit ? 'Enregistrer' : 'Créer'}
                </button>
            </div>
        `;
    }

    // ==================== HELPERS ====================

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getStatusLabel(status) {
        const labels = {
            draft: 'Brouillon',
            sending: 'Envoi en cours',
            sent: 'Envoyé',
            scheduled: 'Programmé'
        };
        return labels[status] || status;
    }

    function renderLoading() {
        return `
            <div class="campaigns-loading">
                <div class="campaigns-spinner"></div>
            </div>
        `;
    }

    return {
        // Contacts
        renderContactsList,
        renderContactItem,
        renderContactDetail,
        renderAddContactModal,
        renderEditContactModal,
        renderImportModal,
        // Templates
        renderTemplatesGrid,
        renderTemplateCard,
        renderTemplateModal,
        // Campaigns
        renderCampaignsList,
        renderCampaignsTable,
        renderCampaignStats,
        // Composer
        renderComposer,
        // Utils
        renderLoading,
        escapeHtml,
        formatDate
    };
})();

if (typeof window !== 'undefined') {
    window.CampaignsUI = CampaignsUI;
}
