// =============================================
// MAIL CONTACTS - Gestion contacts (simplifié)
// =============================================

const MailContacts = {
  contacts: [],

  async load() {
    const container = document.getElementById('mail-contacts-content');
    if (!container) return;

    container.innerHTML = `
      <div class="mail-section-header">
        <h3>👥 Carnet de contacts</h3>
        <div class="mail-section-actions">
          <button class="btn btn-outline" data-action="import-csv">
            📤 Importer CSV
          </button>
          <button class="btn btn-primary" data-action="add-contact">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            Ajouter contact
          </button>
        </div>
      </div>

      <div class="mail-empty">
        <div class="mail-empty-icon">👥</div>
        <h3>Gérez vos contacts</h3>
        <p>Créez et organisez votre carnet d'adresses</p>
        <p style="margin-top: 1rem; color: var(--text-tertiary);">
          Fonctionnalité en cours de développement
        </p>
        <button class="btn btn-primary" data-action="add-contact" style="margin-top: 1.5rem;">
          Ajouter un contact
        </button>
      </div>
    `;

    this.attachEvents();
  },

  attachEvents() {
    document.querySelectorAll('[data-action="add-contact"]').forEach(btn => {
      btn.addEventListener('click', () => {
        Toast.info('🚧 Gestion de contacts en cours de développement');
      });
    });

    document.querySelector('[data-action="import-csv"]')?.addEventListener('click', () => {
      Toast.info('🚧 Import CSV en cours de développement');
    });
  }
};

window.MailContacts = MailContacts;
