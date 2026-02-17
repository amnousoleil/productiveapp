// =============================================
// MAIL DETAIL - Affichage détaillé d'un email
// Modal avec preview complet
// =============================================

const MailDetail = {
  /**
   * Ouvre le détail d'un email en modal
   */
  async open(mailId) {
    try {
      const result = await MailAPI.getMailById(mailId);
      const mail = result.mail;

      this.renderModal(mail);
    } catch (error) {
      console.error('[MailDetail] open error:', error);
      Toast.error('Erreur lors du chargement');
    }
  },

  /**
   * Render modal with email detail
   */
  renderModal(mail) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'mail-modal-overlay';
    modal.innerHTML = `
      <div class="mail-modal mail-modal-large">
        <div class="mail-modal-header">
          <h3>📧 ${MailUtils.escapeHtml(mail.subject || '(sans objet)')}</h3>
          <button class="mail-modal-close">×</button>
        </div>

        <div class="mail-modal-body">
          <div class="mail-detail-meta">
            <div class="mail-detail-meta-row">
              <span class="mail-detail-meta-label">À :</span>
              <span class="mail-detail-meta-value">${mail.to_addresses.join(', ')}</span>
            </div>

            ${mail.cc_addresses?.length > 0 ? `
              <div class="mail-detail-meta-row">
                <span class="mail-detail-meta-label">CC :</span>
                <span class="mail-detail-meta-value">${mail.cc_addresses.join(', ')}</span>
              </div>
            ` : ''}

            <div class="mail-detail-meta-row">
              <span class="mail-detail-meta-label">Envoyé :</span>
              <span class="mail-detail-meta-value">${MailUtils.formatDateDetailed(mail.sent_at)}</span>
            </div>

            ${mail.opened_at ? `
              <div class="mail-detail-meta-row">
                <span class="mail-detail-meta-label">Ouvert :</span>
                <span class="mail-detail-meta-value">
                  ${MailUtils.formatDateDetailed(mail.opened_at)}
                  <span class="mail-detail-status-badge opened">✓ Lu</span>
                </span>
              </div>
            ` : ''}

            <div class="mail-detail-meta-row">
              <span class="mail-detail-meta-label">Statut :</span>
              <span class="mail-detail-meta-value">
                ${this.renderStatusBadge(mail.status)}
              </span>
            </div>
          </div>

          <div class="mail-detail-body">
            ${this.renderBody(mail)}
          </div>
        </div>

        <div class="mail-modal-footer">
          <button class="btn btn-outline" data-action="resend">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Renvoyer
          </button>
          <button class="btn btn-secondary mail-modal-close">✕ Fermer</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Attach events
    this.attachModalEvents(modal, mail);
  },

  /**
   * Render status badge
   */
  renderStatusBadge(status) {
    const badges = {
      'sent': '<span class="mail-status-badge sent">✓ Envoyé</span>',
      'failed': '<span class="mail-status-badge failed">✗ Échec</span>',
      'pending': '<span class="mail-status-badge pending">⏳ En attente</span>'
    };
    return badges[status] || badges['sent'];
  },

  /**
   * Render email body (HTML ou plain text)
   */
  renderBody(mail) {
    if (mail.is_html) {
      // Afficher HTML dans iframe sécurisé
      return `
        <div class="mail-detail-html-wrapper">
          <iframe
            class="mail-detail-html-iframe"
            sandbox="allow-same-origin"
            srcdoc="${MailUtils.escapeHtml(mail.body)}"
          ></iframe>
        </div>
      `;
    } else {
      // Afficher texte plain avec sauts de ligne propres
      const cleanBody = (mail.body || '')
        .replace(/\\n/g, '\n')   // Fix littéraux \n stockés en DB
        .replace(/\r\n/g, '\n'); // Normalise Windows CRLF
      const htmlBody = MailUtils.escapeHtml(cleanBody).replace(/\n/g, '<br>');
      return `<div class="mail-detail-text-clean">${htmlBody}</div>`;
    }
  },

  /**
   * Attach modal events
   */
  attachModalEvents(modal, mail) {
    // Close buttons
    modal.querySelectorAll('.mail-modal-close').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('mail-modal-overlay')) {
        modal.remove();
      }
    });

    // Resend button
    const resendBtn = modal.querySelector('[data-action="resend"]');
    if (resendBtn) {
      resendBtn.addEventListener('click', () => {
        this.resendMail(mail);
        modal.remove();
      });
    }

    // ESC to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  },

  /**
   * Ouvre le détail d'un email reçu (inbox)
   */
  async openInbound(emailId) {
    try {
      const result = await MailAPI.getInboxEmail(emailId);
      const email = result.email;
      this.renderInboundModal(email);
    } catch (error) {
      console.error('[MailDetail] openInbound error:', error);
      if (typeof Toast !== 'undefined') Toast.error('Erreur lors du chargement');
    }
  },

  /**
   * Modal pour email reçu
   */
  renderInboundModal(email) {
    const toAddresses = Array.isArray(email.to_addresses)
      ? email.to_addresses.join(', ')
      : email.to_addresses || '';

    const modal = document.createElement('div');
    modal.className = 'mail-modal-overlay';
    modal.innerHTML = `
      <div class="mail-modal mail-modal-large">
        <div class="mail-modal-header">
          <h3>📩 ${MailUtils.escapeHtml(email.subject || '(sans objet)')}</h3>
          <button class="mail-modal-close">×</button>
        </div>
        <div class="mail-modal-body">
          <div class="mail-detail-meta">
            <div class="mail-detail-meta-row">
              <span class="mail-detail-meta-label">De :</span>
              <span class="mail-detail-meta-value">
                ${email.from_name ? MailUtils.escapeHtml(email.from_name) + ' &lt;' : ''}
                ${MailUtils.escapeHtml(email.from_address || '')}
                ${email.from_name ? '&gt;' : ''}
              </span>
            </div>
            <div class="mail-detail-meta-row">
              <span class="mail-detail-meta-label">À :</span>
              <span class="mail-detail-meta-value">${MailUtils.escapeHtml(toAddresses)}</span>
            </div>
            <div class="mail-detail-meta-row">
              <span class="mail-detail-meta-label">Reçu :</span>
              <span class="mail-detail-meta-value">${MailUtils.formatDateDetailed(email.received_at || email.created_at)}</span>
            </div>
          </div>
          <div class="mail-detail-body">
            ${email.body_html
              ? `<div class="mail-detail-html-wrapper">
                  <iframe class="mail-detail-html-iframe" sandbox="allow-same-origin"
                    srcdoc="${MailUtils.escapeHtml(email.body_html)}"></iframe>
                </div>`
              : (() => {
                  const cleanText = (email.body_text || '(email vide)')
                    .replace(/\\n/g, '\n')
                    .replace(/\r\n/g, '\n');
                  const htmlText = MailUtils.escapeHtml(cleanText).replace(/\n/g, '<br>');
                  return `<div class="mail-detail-text-clean">${htmlText}</div>`;
                })()
            }
          </div>
        </div>
        <div class="mail-modal-footer">
          <button class="btn btn-primary" data-action="reply">↩ Répondre</button>
          <button class="btn btn-secondary mail-modal-close">✕ Fermer</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('.mail-modal-close').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });
    modal.addEventListener('click', e => {
      if (e.target.classList.contains('mail-modal-overlay')) modal.remove();
    });

    const replyBtn = modal.querySelector('[data-action="reply"]');
    if (replyBtn) {
      replyBtn.addEventListener('click', () => {
        modal.remove();
        if (typeof MailComposer !== 'undefined') {
          MailComposer.open({
            to: [email.from_address],
            subject: `Re: ${email.subject || ''}`,
            body: '',
            isHtml: false
          });
        }
      });
    }

    const escHandler = e => {
      if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);
  },

  /**
   * Resend an email (open composer with pre-filled data)
   */
  resendMail(mail) {
    if (typeof MailComposer !== 'undefined') {
      MailComposer.open({
        to: mail.to_addresses,
        cc: mail.cc_addresses,
        subject: mail.subject,
        body: mail.body,
        isHtml: mail.is_html
      });
    } else {
      Toast.error('Module compositeur non chargé');
    }
  }
};

window.MailDetail = MailDetail;

// =============================================
// CLEANUP AUTOMATIQUE - Ferme tous les modaux
// mail quand on quitte la page mail
// =============================================
document.addEventListener('viewchange', (e) => {
  if (e.detail && e.detail.previous === 'mail' && e.detail.view !== 'mail') {
    // On quitte la page mail → nettoyer tous les overlays
    document.querySelectorAll('.mail-modal-overlay').forEach(el => el.remove());
  }
});
