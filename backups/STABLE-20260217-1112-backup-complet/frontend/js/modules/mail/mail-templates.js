// =============================================
// MAIL TEMPLATES - Galerie de templates
// =============================================

const MailTemplates = {
  templates: [],

  async load() {
    const container = document.getElementById('mail-templates-content');
    if (!container) return;

    container.innerHTML = '<div class="mail-loading"><div class="spinner"></div> Chargement...</div>';

    try {
      const result = await MailAPI.getTemplates();
      this.templates = result.templates || [];
      this.render();
    } catch (error) {
      console.error('[MailTemplates] load error:', error);
      container.innerHTML = '<div class="mail-error">Erreur lors du chargement</div>';
    }
  },

  render() {
    const container = document.getElementById('mail-templates-content');
    if (!container) return;

    container.innerHTML = `
      <div class="mail-section-header">
        <h3>📋 Templates (${this.templates.length})</h3>
        <button class="btn btn-primary" data-action="create-template">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          Nouveau template
        </button>
      </div>

      ${this.templates.length === 0
        ? `<div class="mail-empty">
             <p>Aucun template</p>
             <button class="btn btn-accent" data-action="create-template">Créer mon premier template</button>
           </div>`
        : `<div class="mail-templates-grid">
             ${this.templates.map(tpl => this.renderTemplateCard(tpl)).join('')}
           </div>`
      }
    `;

    this.attachEvents();
  },

  renderTemplateCard(tpl) {
    return `
      <div class="mail-template-card">
        <div class="mail-template-preview">
          <div class="mail-template-preview-content">
            ${tpl.body.substring(0, 200)}...
          </div>
        </div>
        <div class="mail-template-info">
          <h4>${this.escapeHtml(tpl.name)}</h4>
          <p class="mail-template-subject">${this.escapeHtml(tpl.subject)}</p>
          <div class="mail-template-meta">
            <span>📊 Utilisé ${tpl.usage_count || 0} fois</span>
          </div>
        </div>
        <div class="mail-template-actions">
          <button class="btn btn-sm btn-primary" data-action="use-template" data-template-id="${tpl.id}">
            Utiliser
          </button>
          <button class="btn btn-sm btn-outline" data-action="edit-template" data-template-id="${tpl.id}">
            Modifier
          </button>
          <button class="btn btn-sm btn-danger" data-action="delete-template" data-template-id="${tpl.id}">
            ×
          </button>
        </div>
      </div>
    `;
  },

  attachEvents() {
    // Create template button
    document.querySelectorAll('[data-action="create-template"]').forEach(btn => {
      btn.addEventListener('click', () => this.openCreateModal());
    });

    // Use template
    document.querySelectorAll('[data-action="use-template"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const templateId = e.currentTarget.dataset.templateId;
        await this.useTemplate(templateId);
      });
    });

    // Edit template
    document.querySelectorAll('[data-action="edit-template"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const templateId = e.currentTarget.dataset.templateId;
        await this.editTemplate(templateId);
      });
    });

    // Delete template
    document.querySelectorAll('[data-action="delete-template"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const templateId = e.currentTarget.dataset.templateId;
        if (confirm('Supprimer ce template ?')) {
          await this.deleteTemplate(templateId);
        }
      });
    });
  },

  async useTemplate(templateId) {
    try {
      const result = await MailAPI.getTemplateById(templateId);
      const tpl = result.template;

      // Increment usage
      await MailAPI.send({ /* mock to increment */ }).catch(() => {});

      // Open composer with template
      MailComposer.open({
        subject: tpl.subject,
        body: tpl.body
      });
    } catch (error) {
      console.error('[MailTemplates] useTemplate error:', error);
      Toast.error('Erreur lors du chargement');
    }
  },

  openCreateModal() {
    const modal = document.createElement('div');
    modal.className = 'mail-modal-overlay';
    modal.innerHTML = `
      <div class="mail-modal">
        <div class="mail-modal-header">
          <h3>📋 Créer un template</h3>
          <button class="mail-modal-close">×</button>
        </div>

        <div class="mail-modal-body">
          <div class="mail-form-group">
            <label>Nom du template</label>
            <input type="text" id="template-name" class="mail-input" placeholder="Ex: Email de bienvenue">
          </div>

          <div class="mail-form-group">
            <label>Sujet</label>
            <input type="text" id="template-subject" class="mail-input" placeholder="Sujet de l'email">
          </div>

          <div class="mail-form-group">
            <label>Contenu</label>
            <textarea id="template-body" class="mail-textarea" rows="8" placeholder="Contenu du template..."></textarea>
          </div>
        </div>

        <div class="mail-modal-footer">
          <button class="btn btn-outline mail-modal-close">Annuler</button>
          <button class="btn btn-primary" data-action="save-template">Créer</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    modal.querySelectorAll('.mail-modal-close').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });

    // Save handler
    modal.querySelector('[data-action="save-template"]').addEventListener('click', async () => {
      await this.saveTemplate(modal);
    });
  },

  async saveTemplate(modal) {
    const name = modal.querySelector('#template-name').value.trim();
    const subject = modal.querySelector('#template-subject').value.trim();
    const body = modal.querySelector('#template-body').value.trim();

    if (!name || !subject || !body) {
      Toast.error('Tous les champs sont requis');
      return;
    }

    try {
      await MailAPI.createTemplate({ name, subject, body, isHtml: false });
      Toast.success('✓ Template créé');
      modal.remove();
      this.load();
    } catch (error) {
      console.error('[MailTemplates] saveTemplate error:', error);
      Toast.error('Erreur lors de la création');
    }
  },

  async deleteTemplate(templateId) {
    try {
      await MailAPI.deleteTemplate(templateId);
      Toast.success('✓ Template supprimé');
      this.load();
    } catch (error) {
      console.error('[MailTemplates] deleteTemplate error:', error);
      Toast.error('Erreur lors de la suppression');
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }
};

window.MailTemplates = MailTemplates;
