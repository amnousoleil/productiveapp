// =============================================
// MAIL COMPOSER - Modal d'envoi simple
// =============================================

const MailComposer = {
  isOpen: false,

  open(prefill = {}) {
    if (this.isOpen) return;
    this.isOpen = true;

    const overlay = document.createElement('div');
    overlay.className = 'mail-modal-overlay';
    overlay.innerHTML = `
      <div class="mail-modal" id="mail-composer-modal">
        <div class="mail-modal-header">
          <h3>✉️ Envoyer un email</h3>
          <button class="mail-modal-close" data-action="close">×</button>
        </div>

        <div class="mail-modal-body">
          <div class="mail-form-group">
            <label>À</label>
            <input type="text" id="composer-to" class="mail-input"
                   placeholder="destinataire@example.com"
                   value="${prefill.to || ''}">
            <small>Séparez plusieurs emails par des virgules</small>
          </div>

          <div class="mail-form-group">
            <label>Sujet</label>
            <input type="text" id="composer-subject" class="mail-input"
                   placeholder="Sujet de l'email"
                   value="${prefill.subject || ''}">
          </div>

          <div class="mail-form-group">
            <label>Message</label>
            <div class="mail-editor-toolbar">
              <button class="mail-toolbar-btn" data-format="bold" title="Gras"><b>B</b></button>
              <button class="mail-toolbar-btn" data-format="italic" title="Italique"><i>I</i></button>
              <button class="mail-toolbar-btn" data-format="underline" title="Souligné"><u>U</u></button>
              <button class="mail-toolbar-btn" data-format="insertUnorderedList" title="Liste">•</button>
              <button class="mail-toolbar-btn" data-format="createLink" title="Lien">🔗</button>
            </div>
            <div id="composer-editor" class="mail-editor" contenteditable="true"
                 data-placeholder="Rédigez votre message...">${prefill.body || ''}</div>
          </div>
        </div>

        <div class="mail-modal-footer">
          <button class="btn btn-outline" data-action="close">Annuler</button>
          <button class="btn btn-primary" data-action="send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            Envoyer
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.attachEvents();

    // Focus sur le champ "À"
    setTimeout(() => {
      document.getElementById('composer-to')?.focus();
    }, 100);
  },

  close() {
    const overlay = document.querySelector('.mail-modal-overlay');
    if (overlay) overlay.remove();
    this.isOpen = false;
  },

  attachEvents() {
    // Close buttons
    document.querySelectorAll('[data-action="close"]').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Overlay click
    document.querySelector('.mail-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('mail-modal-overlay')) {
        this.close();
      }
    });

    // Toolbar formatting
    document.querySelectorAll('.mail-toolbar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const format = e.currentTarget.dataset.format;
        if (format === 'createLink') {
          const url = prompt('URL du lien:');
          if (url) document.execCommand(format, false, url);
        } else {
          document.execCommand(format, false, null);
        }
      });
    });

    // Send button
    document.querySelector('[data-action="send"]')?.addEventListener('click', () => {
      this.send();
    });
  },

  async send() {
    const toInput = document.getElementById('composer-to').value.trim();
    const subject = document.getElementById('composer-subject').value.trim();
    const editor = document.getElementById('composer-editor');
    const body = editor.innerHTML.trim();

    // Validation
    if (!toInput) {
      Toast.error('Veuillez entrer au moins un destinataire');
      return;
    }

    if (!subject) {
      Toast.error('Veuillez entrer un sujet');
      return;
    }

    if (!body || body === '<br>') {
      Toast.error('Veuillez rédiger un message');
      return;
    }

    // Parse emails
    const to = toInput.split(/[,;\s]+/).filter(e => e && e.includes('@'));

    if (to.length === 0) {
      Toast.error('Aucune adresse email valide trouvée');
      return;
    }

    // Send
    const sendBtn = document.querySelector('[data-action="send"]');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<div class="spinner"></div> Envoi...';

    try {
      await MailAPI.send({
        to,
        subject,
        body,
        isHtml: true
      });

      Toast.success(`✓ Email envoyé à ${to.join(', ')}`);
      this.close();

      // Refresh stats and inbox
      if (typeof MailView !== 'undefined') {
        MailView.refresh();
      }
      if (typeof MailInbox !== 'undefined') {
        MailInbox.load();
      }
    } catch (error) {
      console.error('[MailComposer] send error:', error);
      Toast.error(error.message || 'Erreur lors de l\'envoi');

      sendBtn.disabled = false;
      sendBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        Envoyer
      `;
    }
  }
};

window.MailComposer = MailComposer;
