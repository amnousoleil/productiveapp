// =============================================
// MAIL CAMPAIGNS v2.0 - Campagnes d'emailing fonctionnelles
// =============================================

const MailCampaigns = {
  campaigns: [],
  currentCampaign: null,

  async load() {
    const container = document.getElementById('mail-campaigns-content');
    if (!container) return;

    // Charger l'historique
    this.loadHistory();

    container.innerHTML = `
      <div class="mail-section-header">
        <h3>📊 Campagnes d'emailing (${this.campaigns.length})</h3>
        <button class="btn btn-accent" data-action="create-campaign">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          Nouvelle campagne
        </button>
      </div>

      ${this.campaigns.length === 0 ? this.renderEmpty() : this.renderList()}
    `;

    this.attachEvents();
  },

  renderEmpty() {
    return `
      <div class="mail-empty">
        <div class="mail-empty-icon">📨</div>
        <h3>Campagnes d'emailing massives</h3>
        <p>Envoyez des emails à plusieurs destinataires en même temps</p>
        <ul style="text-align: left; max-width: 500px; margin: 1.5rem auto; color: var(--text-secondary); line-height: 1.8;">
          <li>✅ Import liste de destinataires (texte ou CSV)</li>
          <li>✅ Composer message avec éditeur riche</li>
          <li>✅ Envoi en masse avec progression</li>
          <li>✅ Statistiques d'ouverture</li>
        </ul>
        <button class="btn btn-accent" data-action="create-campaign" style="margin-top: 1.5rem;">
          Créer ma première campagne
        </button>
      </div>
    `;
  },

  renderList() {
    return `
      <div class="mail-cards-grid">
        ${this.campaigns.map(c => this.renderCampaignCard(c)).join('')}
      </div>
    `;
  },

  renderCampaignCard(campaign) {
    const statusClass = campaign.status === 'sent' ? 'opened' : 'sent';
    const statusLabel = campaign.status === 'sent' ? '✓ Envoyée' : '⏳ En cours';
    const deliveryRate = campaign.total > 0 ? Math.round((campaign.sent / campaign.total) * 100) : 0;

    return `
      <div class="mail-card campaign-card" data-campaign-id="${campaign.id}">
        <div class="mail-card-header">
          <div class="mail-card-to">
            <strong>📊 Campagne :</strong> ${campaign.name || 'Sans nom'}
          </div>
          <span class="mail-card-status ${statusClass}">${statusLabel}</span>
        </div>

        <div class="mail-card-subject">${campaign.subject}</div>
        <div class="mail-card-preview">
          ${campaign.total} destinataires • ${campaign.sent} envoyés • ${deliveryRate}% taux de livraison
        </div>

        <div class="mail-card-footer">
          <span class="mail-card-date">📅 ${this.formatDate(campaign.created_at)}</span>
          <span style="color: var(--accent-primary); font-weight: 600;">${campaign.opened || 0} ouverts</span>
        </div>
      </div>
    `;
  },

  attachEvents() {
    document.querySelectorAll('[data-action="create-campaign"]').forEach(btn => {
      btn.addEventListener('click', () => this.openWizard());
    });

    document.querySelectorAll('.campaign-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.campaignId;
        this.viewDetails(id);
      });
    });
  },

  // =========================================
  // WIZARD 3 ÉTAPES
  // =========================================

  openWizard() {
    this.currentCampaign = {
      id: 'camp_' + Date.now(),
      name: '',
      subject: '',
      recipients: [],
      body: '',
      isHtml: true,
      status: 'draft',
      created_at: new Date().toISOString(),
      total: 0,
      sent: 0,
      opened: 0
    };

    this.showStep1();
  },

  showStep1() {
    const modal = document.createElement('div');
    modal.className = 'mail-modal-overlay';
    modal.id = 'campaign-wizard';
    modal.innerHTML = `
      <div class="mail-modal mail-modal-large">
        <div class="mail-modal-header">
          <h3>📊 Nouvelle campagne - Étape 1/3</h3>
          <button class="mail-modal-close">×</button>
        </div>

        <div class="mail-modal-body">
          <div class="mail-form-group">
            <label>Nom de la campagne</label>
            <input type="text" class="mail-input" id="campaign-name" placeholder="Ex: Newsletter Janvier 2026" />
            <small>Pour votre référence interne</small>
          </div>

          <div class="mail-form-group">
            <label>Objet de l'email</label>
            <input type="text" class="mail-input" id="campaign-subject" placeholder="Ex: Découvrez nos nouveautés !" required />
            <small>Visible par les destinataires</small>
          </div>
        </div>

        <div class="mail-modal-footer">
          <button class="btn btn-outline mail-modal-close">Annuler</button>
          <button class="btn btn-primary" id="campaign-step1-next">
            Suivant : Destinataires →
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Events
    modal.querySelectorAll('.mail-modal-close').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });

    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('mail-modal-overlay')) {
        if (confirm('Annuler la campagne ?')) modal.remove();
      }
    });

    document.getElementById('campaign-step1-next').addEventListener('click', () => {
      const name = document.getElementById('campaign-name').value.trim();
      const subject = document.getElementById('campaign-subject').value.trim();

      if (!subject) {
        Toast.error('L\'objet est obligatoire');
        return;
      }

      this.currentCampaign.name = name || 'Campagne ' + new Date().toLocaleDateString('fr-FR');
      this.currentCampaign.subject = subject;

      modal.remove();
      this.showStep2();
    });
  },

  showStep2() {
    const modal = document.createElement('div');
    modal.className = 'mail-modal-overlay';
    modal.id = 'campaign-wizard';
    modal.innerHTML = `
      <div class="mail-modal mail-modal-large">
        <div class="mail-modal-header">
          <h3>📊 Nouvelle campagne - Étape 2/3</h3>
          <button class="mail-modal-close">×</button>
        </div>

        <div class="mail-modal-body">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <label style="margin: 0;">Liste de destinataires (un email par ligne)</label>
            <button class="btn btn-outline btn-sm" id="import-contacts-btn" style="font-size: 0.875rem;">
              📋 Importer depuis contacts
            </button>
          </div>

          <div class="mail-form-group">
            <textarea class="mail-textarea" id="campaign-recipients" rows="10"
                      placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                      style="font-family: monospace; color: #fff !important; background: rgba(0,0,0,0.4) !important; border: 1px solid rgba(212,175,55,0.3);"></textarea>
            <small>Vous pouvez coller une liste depuis Excel/CSV ou importer depuis vos contacts. Seules les adresses valides seront conservées.</small>
          </div>

          <div id="recipients-preview" style="margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 12px; display: none;">
            <p style="margin: 0; color: var(--text-secondary);"><strong>Destinataires valides :</strong> <span id="valid-count">0</span></p>
          </div>
        </div>

        <div class="mail-modal-footer">
          <button class="btn btn-outline" id="campaign-step2-back">← Retour</button>
          <button class="btn btn-primary" id="campaign-step2-next">
            Suivant : Message →
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const textarea = document.getElementById('campaign-recipients');
    const preview = document.getElementById('recipients-preview');
    const validCount = document.getElementById('valid-count');

    // Bouton import contacts
    document.getElementById('import-contacts-btn').addEventListener('click', async () => {
      await this.importFromContacts(textarea);
    });

    // Validation en temps réel
    textarea.addEventListener('input', () => {
      const emails = this.parseRecipients(textarea.value);
      if (emails.length > 0) {
        preview.style.display = 'block';
        validCount.textContent = emails.length;
      } else {
        preview.style.display = 'none';
      }
    });

    // Events
    modal.querySelectorAll('.mail-modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Annuler la campagne ?')) modal.remove();
      });
    });

    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('mail-modal-overlay')) {
        if (confirm('Annuler la campagne ?')) modal.remove();
      }
    });

    document.getElementById('campaign-step2-back').addEventListener('click', () => {
      modal.remove();
      this.showStep1();
    });

    document.getElementById('campaign-step2-next').addEventListener('click', () => {
      const emails = this.parseRecipients(textarea.value);

      if (emails.length === 0) {
        Toast.error('Ajoutez au moins un destinataire valide');
        return;
      }

      this.currentCampaign.recipients = emails;
      this.currentCampaign.total = emails.length;

      modal.remove();
      this.showStep3();
    });
  },

  showStep3() {
    const modal = document.createElement('div');
    modal.className = 'mail-modal-overlay';
    modal.id = 'campaign-wizard';
    modal.innerHTML = `
      <div class="mail-modal mail-modal-large">
        <div class="mail-modal-header">
          <h3>📊 Nouvelle campagne - Étape 3/3</h3>
          <button class="mail-modal-close">×</button>
        </div>

        <div class="mail-modal-body" style="max-height: 60vh; overflow-y: auto;">
          <div style="background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem;">
            <p style="margin: 0; color: var(--text-primary);"><strong>📊 ${this.currentCampaign.name}</strong></p>
            <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary); font-size: 0.875rem;">
              Objet : ${this.currentCampaign.subject} • ${this.currentCampaign.total} destinataires
            </p>
          </div>

          <div class="mail-form-group">
            <label>Message de la campagne</label>
            <div class="mail-editor-toolbar">
              <button class="mail-toolbar-btn" data-cmd="bold"><strong>B</strong></button>
              <button class="mail-toolbar-btn" data-cmd="italic"><em>I</em></button>
              <button class="mail-toolbar-btn" data-cmd="underline"><u>U</u></button>
            </div>
            <div class="mail-editor" id="campaign-body" contenteditable="true" data-placeholder="Tapez votre message ici..."></div>
          </div>
        </div>

        <div class="mail-modal-footer">
          <button class="btn btn-outline" id="campaign-step3-back">← Retour</button>
          <button class="btn btn-accent" id="campaign-send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            Envoyer la campagne
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Toolbar actions
    document.querySelectorAll('.mail-toolbar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = e.currentTarget.dataset.cmd;
        document.execCommand(cmd, false, null);
      });
    });

    // Events
    modal.querySelectorAll('.mail-modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Annuler la campagne ?')) modal.remove();
      });
    });

    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('mail-modal-overlay')) {
        if (confirm('Annuler la campagne ?')) modal.remove();
      }
    });

    document.getElementById('campaign-step3-back').addEventListener('click', () => {
      modal.remove();
      this.showStep2();
    });

    document.getElementById('campaign-send').addEventListener('click', async () => {
      const body = document.getElementById('campaign-body').innerHTML.trim();

      if (!body || body === '<br>') {
        Toast.error('Le message est vide');
        return;
      }

      this.currentCampaign.body = body;

      modal.remove();
      await this.sendCampaign();
    });
  },

  // =========================================
  // ENVOI CAMPAGNE
  // =========================================

  async sendCampaign() {
    const campaign = this.currentCampaign;

    // Modal de progression
    const modal = document.createElement('div');
    modal.className = 'mail-modal-overlay';
    modal.innerHTML = `
      <div class="mail-modal">
        <div class="mail-modal-header">
          <h3>📨 Envoi en cours...</h3>
        </div>

        <div class="mail-modal-body">
          <p style="text-align: center; color: var(--text-secondary); margin-bottom: 1.5rem;">
            Envoi de ${campaign.total} emails
          </p>

          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; height: 40px; overflow: hidden; margin-bottom: 1rem;">
            <div id="campaign-progress-bar" style="height: 100%; background: linear-gradient(90deg, #d4af37, #f4d03f); width: 0%; transition: width 0.3s ease; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #000;">
              0%
            </div>
          </div>

          <p id="campaign-progress-text" style="text-align: center; color: var(--text-tertiary); font-size: 0.875rem;">
            Préparation...
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const progressBar = document.getElementById('campaign-progress-bar');
    const progressText = document.getElementById('campaign-progress-text');

    let sent = 0;
    let failed = 0;

    for (const email of campaign.recipients) {
      try {
        await MailAPI.send({
          to: [email],
          subject: campaign.subject,
          body: campaign.body,
          is_html: true
        });

        sent++;
      } catch (error) {
        console.error(`Failed to send to ${email}:`, error);
        failed++;
      }

      // Update progress
      const total = campaign.recipients.length;
      const progress = Math.round((sent + failed) / total * 100);
      progressBar.style.width = progress + '%';
      progressBar.textContent = progress + '%';
      progressText.textContent = `${sent} envoyés, ${failed} échecs sur ${total}`;

      // Petit délai pour éviter rate limiting (ajustable)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Finaliser la campagne
    campaign.sent = sent;
    campaign.failed = failed;
    campaign.status = 'sent';

    this.campaigns.unshift(campaign);
    this.saveHistory();

    modal.remove();

    Toast.success(`✅ Campagne envoyée ! ${sent} réussites, ${failed} échecs`);
    this.load(); // Recharger la liste
  },

  // =========================================
  // UTILITAIRES
  // =========================================

  parseRecipients(text) {
    // Extraire tous les emails valides (supporte CSV, ligne par ligne, séparés par virgule/point-virgule)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];
    return [...new Set(matches)]; // Dédupliquer
  },

  async importFromContacts(targetTextarea) {
    try {
      // Récupérer les contacts depuis l'API Accounting
      const response = await Api.get('/accounting/contacts');
      const contacts = response.contacts || [];

      if (contacts.length === 0) {
        Toast.info('Aucun contact trouvé. Ajoutez des contacts dans la section Comptabilité.');
        return;
      }

      // Filtrer ceux qui ont un email
      const contactsWithEmail = contacts.filter(c => c.email && c.email.trim());

      if (contactsWithEmail.length === 0) {
        Toast.warning('Aucun contact n\'a d\'adresse email.');
        return;
      }

      // Modal de sélection
      const selectModal = document.createElement('div');
      selectModal.className = 'mail-modal-overlay';
      selectModal.innerHTML = `
        <div class="mail-modal mail-modal-large">
          <div class="mail-modal-header">
            <h3>📋 Importer depuis contacts (${contactsWithEmail.length})</h3>
            <button class="mail-modal-close">×</button>
          </div>

          <div class="mail-modal-body" style="max-height: 60vh; overflow-y: auto;">
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(212,175,55,0.1); border-radius: 12px; border: 1px solid rgba(212,175,55,0.3);">
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin: 0;">
                <input type="checkbox" id="select-all-contacts" style="width: 18px; height: 18px; cursor: pointer;">
                <strong>Tout sélectionner (${contactsWithEmail.length})</strong>
              </label>
            </div>

            <div id="contacts-list" style="display: grid; gap: 0.75rem;">
              ${contactsWithEmail.map((c, idx) => `
                <label class="contact-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; cursor: pointer; transition: all 0.2s;" data-email="${c.email}">
                  <input type="checkbox" class="contact-checkbox" value="${c.email}" style="width: 18px; height: 18px; cursor: pointer;">
                  <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text); margin-bottom: 0.25rem;">
                      ${c.company || c.name || 'Contact sans nom'}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">
                      ${c.email}
                    </div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="mail-modal-footer">
            <button class="btn btn-outline mail-modal-close">Annuler</button>
            <button class="btn btn-primary" id="confirm-import">
              Importer <span id="selected-count">(0)</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(selectModal);

      // Event: Select All
      const selectAllCheckbox = document.getElementById('select-all-contacts');
      const checkboxes = selectModal.querySelectorAll('.contact-checkbox');
      const selectedCountSpan = document.getElementById('selected-count');

      const updateCount = () => {
        const checked = selectModal.querySelectorAll('.contact-checkbox:checked').length;
        selectedCountSpan.textContent = `(${checked})`;
      };

      selectAllCheckbox.addEventListener('change', (e) => {
        checkboxes.forEach(cb => cb.checked = e.target.checked);
        updateCount();
      });

      checkboxes.forEach(cb => {
        cb.addEventListener('change', updateCount);
      });

      // Hover effect on labels
      selectModal.querySelectorAll('.contact-item').forEach(label => {
        label.addEventListener('mouseenter', () => {
          label.style.background = 'rgba(212,175,55,0.1)';
          label.style.borderColor = 'rgba(212,175,55,0.3)';
        });
        label.addEventListener('mouseleave', () => {
          label.style.background = 'rgba(255,255,255,0.03)';
          label.style.borderColor = 'rgba(255,255,255,0.1)';
        });
      });

      // Close handlers
      selectModal.querySelectorAll('.mail-modal-close').forEach(btn => {
        btn.addEventListener('click', () => selectModal.remove());
      });

      selectModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('mail-modal-overlay')) {
          selectModal.remove();
        }
      });

      // Confirm import
      document.getElementById('confirm-import').addEventListener('click', () => {
        const selectedEmails = Array.from(selectModal.querySelectorAll('.contact-checkbox:checked'))
          .map(cb => cb.value);

        if (selectedEmails.length === 0) {
          Toast.warning('Sélectionnez au moins un contact');
          return;
        }

        // Ajouter au textarea (append ou replace selon contenu actuel)
        const currentValue = targetTextarea.value.trim();
        const newValue = currentValue
          ? currentValue + '\n' + selectedEmails.join('\n')
          : selectedEmails.join('\n');

        targetTextarea.value = newValue;

        // Trigger input event pour mettre à jour le preview
        targetTextarea.dispatchEvent(new Event('input'));

        selectModal.remove();
        Toast.success(`✅ ${selectedEmails.length} contact${selectedEmails.length > 1 ? 's importés' : ' importé'}`);
      });
    } catch (error) {
      console.error('[MailCampaigns] importFromContacts error:', error);
      Toast.error('Erreur lors du chargement des contacts');
    }
  },

  loadHistory() {
    try {
      const saved = localStorage.getItem('productiveapp_mail_campaigns');
      if (saved) {
        this.campaigns = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[MailCampaigns] Failed to load history');
    }
  },

  saveHistory() {
    try {
      localStorage.setItem('productiveapp_mail_campaigns', JSON.stringify(this.campaigns));
    } catch (e) {
      console.warn('[MailCampaigns] Failed to save history');
    }
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  viewDetails(campaignId) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const modal = document.createElement('div');
    modal.className = 'mail-modal-overlay';
    modal.innerHTML = `
      <div class="mail-modal mail-modal-large">
        <div class="mail-modal-header">
          <h3>📊 ${campaign.name}</h3>
          <button class="mail-modal-close">×</button>
        </div>

        <div class="mail-modal-body">
          <div class="mail-detail-meta">
            <p><strong>Objet :</strong> ${campaign.subject}</p>
            <p><strong>Créée le :</strong> ${this.formatDate(campaign.created_at)}</p>
            <p><strong>Destinataires :</strong> ${campaign.total}</p>
            <p><strong>Envoyés :</strong> ${campaign.sent} (${Math.round((campaign.sent / campaign.total) * 100)}%)</p>
            <p><strong>Ouverts :</strong> ${campaign.opened || 0}</p>
          </div>

          <div style="margin-top: 1.5rem;">
            <h4 style="margin-bottom: 0.75rem;">Message :</h4>
            <div style="background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              ${campaign.body}
            </div>
          </div>
        </div>

        <div class="mail-modal-footer">
          <button class="btn btn-outline mail-modal-close">Fermer</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('.mail-modal-close').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });

    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('mail-modal-overlay')) {
        modal.remove();
      }
    });
  }
};

window.MailCampaigns = MailCampaigns;
