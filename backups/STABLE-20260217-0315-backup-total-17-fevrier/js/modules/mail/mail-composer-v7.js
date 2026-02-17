/**
 * MAIL COMPOSER v7.0 - Premium & Spacieux
 * Modal luxueux avec validation améliorée
 */

const MailComposer = {
  isOpen: false,
  attachments: [],

  /**
   * Ouvre le modal composer
   */
  open(prefill = {}) {
    if (this.isOpen) return;
    this.isOpen = true;
    this.attachments = [];

    const overlay = document.createElement('div');
    overlay.className = 'mail-modal-overlay';
    overlay.innerHTML = `
      <div class="mail-modal" id="mail-composer-modal">
        <div class="mail-modal-header">
          <h3>✉️ Composer un email</h3>
          <button class="mail-modal-close" data-action="close" title="Fermer (Esc)">×</button>
        </div>

        <div class="mail-modal-body">
          <div class="mail-form-group">
            <label for="composer-to">
              Destinataires *
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </label>
            <input type="text" id="composer-to" class="mail-input"
                   placeholder="destinataire@example.com (séparez par des virgules ou espaces)"
                   value="${this.escapeHtml(prefill.to || '')}"
                   autocomplete="email">
            <small id="composer-to-error" style="color: var(--mail-error); display: none;"></small>
            <small id="composer-to-count" style="color: var(--text-secondary);"></small>
          </div>

          <div class="mail-form-group">
            <label for="composer-from-name">
              Nom d'expéditeur
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </label>
            <input type="text" id="composer-from-name" class="mail-input"
                   placeholder="Ex: Maha Giri, Mon Entreprise... (optionnel, sinon 'ProductiveApp')"
                   value="${this.escapeHtml(prefill.fromName || this.getDefaultFromName())}"
                   autocomplete="name">
            <small style="color: var(--text-secondary);">Le nom qui apparaîtra dans la boîte de réception des destinataires</small>
          </div>

          <div class="mail-form-group" style="display: flex; gap: 16px;">
            <div style="flex: 1;">
              <label for="composer-cc">CC (Copie)</label>
              <input type="text" id="composer-cc" class="mail-input"
                     placeholder="copie@example.com (optionnel)"
                     autocomplete="email">
            </div>
            <div style="flex: 1;">
              <label for="composer-bcc">BCC (Copie cachée)</label>
              <input type="text" id="composer-bcc" class="mail-input"
                     placeholder="cachee@example.com (optionnel)"
                     autocomplete="email">
            </div>
          </div>

          <div class="mail-form-group">
            <label for="composer-subject">
              Sujet *
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="4" y1="9" x2="20" y2="9"/>
                <line x1="4" y1="15" x2="20" y2="15"/>
                <line x1="10" y1="3" x2="8" y2="21"/>
                <line x1="16" y1="3" x2="14" y2="21"/>
              </svg>
            </label>
            <input type="text" id="composer-subject" class="mail-input"
                   placeholder="Objet de l'email"
                   value="${this.escapeHtml(prefill.subject || '')}"
                   autocomplete="off">
            <small id="composer-subject-count" style="color: var(--text-secondary);"></small>
          </div>

          <div class="mail-form-group mail-editor-container">
            <label>
              Message *
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </label>
            <div class="mail-editor-toolbar">
              <button class="mail-toolbar-btn" data-format="bold" title="Gras (Ctrl+B)"><b>B</b></button>
              <button class="mail-toolbar-btn" data-format="italic" title="Italique (Ctrl+I)"><i>I</i></button>
              <button class="mail-toolbar-btn" data-format="underline" title="Souligné (Ctrl+U)"><u>U</u></button>
              <button class="mail-toolbar-btn" data-format="insertUnorderedList" title="Liste à puces">•</button>
              <button class="mail-toolbar-btn" data-format="insertOrderedList" title="Liste numérotée">1.</button>
              <button class="mail-toolbar-btn" data-format="createLink" title="Insérer lien">🔗</button>
              <button class="mail-toolbar-btn" data-format="removeFormat" title="Supprimer formatage">⌫</button>
              <div style="flex: 1"></div>
              <button class="mail-toolbar-btn" data-action="insert-signature" title="Insérer signature">✒️</button>
            </div>
            <div id="composer-editor" class="mail-editor" contenteditable="true"
                 data-placeholder="Rédigez votre message ici... Vous pouvez utiliser le formatage riche."
                 spellcheck="true">${prefill.body || ''}</div>
            <small id="composer-body-count" style="color: var(--text-secondary);"></small>
          </div>

          <div id="composer-attachments-container" style="display: none;" class="mail-form-group">
            <label>Pièces jointes</label>
            <div class="mail-attachments" id="composer-attachments"></div>
          </div>
        </div>

        <div class="mail-modal-footer">
          <div class="mail-modal-footer-left">
            <button class="btn btn-outline" data-action="save-draft" title="Enregistrer brouillon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Brouillon
            </button>
            <label class="btn btn-outline" title="Ajouter pièce jointe">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              Joindre
              <input type="file" id="composer-attach" style="display: none;" multiple>
            </label>
          </div>
          <div class="mail-modal-footer-right">
            <button class="btn btn-outline" data-action="close">Annuler</button>
            <button class="btn btn-lg btn-primary" data-action="send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              Envoyer
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.attachEvents();

    // Focus sur le champ "À"
    setTimeout(() => {
      const toInput = document.getElementById('composer-to');
      if (toInput) {
        toInput.focus();
        this.validateEmail(toInput);
      }
    }, 100);
  },

  /**
   * Ferme le modal
   */
  close() {
    const overlay = document.querySelector('.mail-modal-overlay');
    if (overlay) overlay.remove();
    this.isOpen = false;
    this.attachments = [];
  },

  /**
   * Attache les événements
   */
  attachEvents() {
    // Close buttons
    document.querySelectorAll('[data-action="close"]').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Overlay click
    document.querySelector('.mail-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('mail-modal-overlay')) {
        if (confirm('Fermer sans envoyer ? Votre message sera perdu.')) {
          this.close();
        }
      }
    });

    // ESC key
    document.addEventListener('keydown', this.handleKeydown.bind(this));

    // Toolbar formatting
    document.querySelectorAll('.mail-toolbar-btn[data-format]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const format = e.currentTarget.dataset.format;
        if (format === 'createLink') {
          const url = prompt('URL du lien:');
          if (url) document.execCommand(format, false, url);
        } else {
          document.execCommand(format, false, null);
        }
        document.getElementById('composer-editor')?.focus();
      });
    });

    // Insert signature
    document.querySelector('[data-action="insert-signature"]')?.addEventListener('click', () => {
      const editor = document.getElementById('composer-editor');
      if (editor) {
        const signature = `<br><br>--<br><strong>ProductiveApp</strong><br>contact@mahagiri.fr`;
        editor.innerHTML += signature;
        editor.focus();
      }
    });

    // Send button
    document.querySelector('[data-action="send"]')?.addEventListener('click', () => this.send());

    // Save draft
    document.querySelector('[data-action="save-draft"]')?.addEventListener('click', () => this.saveDraft());

    // Attach files
    const attachInput = document.getElementById('composer-attach');
    if (attachInput) {
      attachInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    // Real-time validation
    const toInput = document.getElementById('composer-to');
    const ccInput = document.getElementById('composer-cc');
    const bccInput = document.getElementById('composer-bcc');
    const subjectInput = document.getElementById('composer-subject');
    const editor = document.getElementById('composer-editor');

    if (toInput) {
      toInput.addEventListener('input', () => this.validateEmail(toInput));
      toInput.addEventListener('blur', () => this.validateEmail(toInput));
    }

    if (ccInput) ccInput.addEventListener('input', () => this.validateEmail(ccInput, true));
    if (bccInput) bccInput.addEventListener('input', () => this.validateEmail(bccInput, true));

    if (subjectInput) {
      subjectInput.addEventListener('input', () => this.updateCharCount(subjectInput, 'composer-subject-count', 200));
    }

    if (editor) {
      editor.addEventListener('input', () => {
        const text = editor.innerText || '';
        this.updateCharCount({ value: text }, 'composer-body-count');
      });
    }
  },

  /**
   * Validation email améliorée
   */
  validateEmail(input, isOptional = false) {
    const value = input.value.trim();
    const errorEl = document.getElementById(input.id + '-error');
    const countEl = document.getElementById(input.id + '-count');

    if (!value) {
      if (isOptional) {
        if (errorEl) errorEl.style.display = 'none';
        if (countEl) countEl.textContent = '';
        return true;
      }
      if (errorEl) {
        errorEl.textContent = '⚠️ Au moins un destinataire requis';
        errorEl.style.display = 'block';
      }
      input.style.borderColor = 'var(--mail-error)';
      return false;
    }

    // Parse emails
    const emails = value.split(/[,;\s]+/).filter(e => e.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emails.filter(e => emailRegex.test(e));
    const invalidEmails = emails.filter(e => !emailRegex.test(e));

    if (invalidEmails.length > 0) {
      if (errorEl) {
        errorEl.textContent = `❌ Adresses invalides: ${invalidEmails.join(', ')}`;
        errorEl.style.display = 'block';
      }
      input.style.borderColor = 'var(--mail-error)';
      return false;
    }

    // Success
    if (errorEl) errorEl.style.display = 'none';
    input.style.borderColor = 'var(--mail-success)';
    if (countEl) {
      countEl.textContent = `✓ ${validEmails.length} destinataire${validEmails.length > 1 ? 's' : ''} valide${validEmails.length > 1 ? 's' : ''}`;
      countEl.style.color = 'var(--mail-success)';
    }
    return true;
  },

  /**
   * Update character count
   */
  updateCharCount(input, countElId, max = null) {
    const countEl = document.getElementById(countElId);
    if (!countEl) return;

    const length = (input.value || '').length;
    if (max) {
      countEl.textContent = `${length} / ${max} caractères`;
      countEl.style.color = length > max ? 'var(--mail-error)' : 'var(--text-secondary)';
    } else {
      countEl.textContent = `${length} caractères`;
    }
  },

  /**
   * Handle file selection
   */
  handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const container = document.getElementById('composer-attachments-container');
    const attachmentsDiv = document.getElementById('composer-attachments');
    if (!container || !attachmentsDiv) return;

    container.style.display = 'block';

    files.forEach(file => {
      // Check size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        Toast.error(`Fichier trop volumineux: ${file.name} (max 10MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const attachment = {
          filename: file.name,
          content: e.target.result.split(',')[1], // base64
          contentType: file.type || 'application/octet-stream'
        };

        this.attachments.push(attachment);

        // Add to UI
        const attachEl = document.createElement('div');
        attachEl.className = 'mail-attachment';
        attachEl.innerHTML = `
          <span>📎 ${file.name} (${this.formatFileSize(file.size)})</span>
          <button class="mail-attachment-remove" data-filename="${file.name}">×</button>
        `;
        attachmentsDiv.appendChild(attachEl);

        // Remove button
        attachEl.querySelector('.mail-attachment-remove')?.addEventListener('click', () => {
          this.attachments = this.attachments.filter(a => a.filename !== file.name);
          attachEl.remove();
          if (this.attachments.length === 0) {
            container.style.display = 'none';
          }
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  },

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },

  /**
   * Handle keyboard shortcuts
   */
  handleKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (confirm('Fermer sans envoyer ?')) {
        this.close();
      }
    }

    // Ctrl+Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      this.send();
    }
  },

  /**
   * Save draft
   */
  async saveDraft() {
    try {
      const toInput = document.getElementById('composer-to').value.trim();
      const subject = document.getElementById('composer-subject').value.trim();
      const editor = document.getElementById('composer-editor');
      const body = editor.innerHTML.trim();

      const to = toInput ? toInput.split(/[,;\s]+/).filter(e => e && e.includes('@')) : [];

      await MailAPI.saveDraft({
        to: to.length > 0 ? to : undefined,
        subject: subject || undefined,
        body: body || undefined,
        isHtml: true
      });

      Toast.success('✓ Brouillon enregistré');
    } catch (error) {
      console.error('[MailComposer] saveDraft error:', error);
      Toast.error(error.message || 'Erreur lors de l\'enregistrement');
    }
  },

  /**
   * Send email
   */
  async send() {
    const toInput = document.getElementById('composer-to').value.trim();
    const fromName = document.getElementById('composer-from-name').value.trim();
    const ccInput = document.getElementById('composer-cc').value.trim();
    const bccInput = document.getElementById('composer-bcc').value.trim();
    const subject = document.getElementById('composer-subject').value.trim();
    const editor = document.getElementById('composer-editor');
    const body = editor.innerHTML.trim();

    // Validation
    if (!toInput) {
      Toast.error('⚠️ Veuillez entrer au moins un destinataire');
      document.getElementById('composer-to').focus();
      return;
    }

    if (!subject) {
      Toast.error('⚠️ Veuillez entrer un sujet');
      document.getElementById('composer-subject').focus();
      return;
    }

    if (!body || body === '<br>') {
      Toast.error('⚠️ Veuillez rédiger un message');
      editor.focus();
      return;
    }

    // Parse emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const to = toInput.split(/[,;\s]+/).filter(e => e.trim() && emailRegex.test(e.trim()));
    const cc = ccInput ? ccInput.split(/[,;\s]+/).filter(e => e.trim() && emailRegex.test(e.trim())) : [];
    const bcc = bccInput ? bccInput.split(/[,;\s]+/).filter(e => e.trim() && emailRegex.test(e.trim())) : [];

    if (to.length === 0) {
      Toast.error('❌ Aucune adresse email valide trouvée dans "À"');
      document.getElementById('composer-to').focus();
      return;
    }

    if (subject.length > 200) {
      Toast.error('❌ Le sujet est trop long (max 200 caractères)');
      document.getElementById('composer-subject').focus();
      return;
    }

    // Send
    const sendBtn = document.querySelector('[data-action="send"]');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<div class="spinner"></div> Envoi en cours...';

    try {
      const payload = {
        to,
        subject,
        body,
        isHtml: true
      };

      if (fromName) payload.fromName = fromName;
      if (cc.length > 0) payload.cc = cc;
      if (bcc.length > 0) payload.bcc = bcc;
      if (this.attachments.length > 0) payload.attachments = this.attachments;

      await MailAPI.send(payload);

      // Sauvegarder le nom d'expéditeur pour la prochaine fois
      if (fromName) {
        try {
          localStorage.setItem('productiveapp_mail_from_name', fromName);
        } catch (e) {
          console.warn('[MailComposer] Failed to save fromName');
        }
      }

      Toast.success(`✅ Email envoyé à ${to.length} destinataire${to.length > 1 ? 's' : ''}`);
      this.close();

      // Refresh stats and inbox
      if (typeof MailView !== 'undefined' && MailView.refresh) {
        MailView.refresh();
      }
      if (typeof MailInbox !== 'undefined' && MailInbox.load) {
        MailInbox.load();
      }
    } catch (error) {
      console.error('[MailComposer] send error:', error);

      let errorMsg = 'Erreur lors de l\'envoi';
      if (error.message) {
        errorMsg = error.message;
      } else if (error.details && Array.isArray(error.details)) {
        errorMsg = error.details.map(d => d.message).join(', ');
      }

      Toast.error(`❌ ${errorMsg}`);

      sendBtn.disabled = false;
      sendBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        Envoyer
      `;
    }
  },

  /**
   * Get default FROM name (from localStorage or current user)
   */
  getDefaultFromName() {
    // 1. Essayer localStorage
    try {
      const saved = localStorage.getItem('productiveapp_mail_from_name');
      if (saved) return saved;
    } catch (e) {
      console.warn('[MailComposer] Failed to load fromName from localStorage');
    }

    // 2. Utiliser le nom de l'utilisateur connecté
    if (typeof AppState !== 'undefined' && AppState.currentUser && AppState.currentUser.name) {
      return AppState.currentUser.name;
    }

    // 3. Fallback vide (le backend utilisera "ProductiveApp")
    return '';
  },

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

window.MailComposer = MailComposer;
