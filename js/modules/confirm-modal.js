// =============================================
// PRODUCTIVEAPP - CONFIRM MODAL
// Modal de confirmation premium
// =============================================

const ConfirmModal = (function() {
    'use strict';

    let modalEl = null;
    let resolveCallback = null;

    /**
     * Create modal HTML if not exists
     */
    function ensureModal() {
        if (modalEl) return;

        modalEl = document.createElement('div');
        modalEl.id = 'confirm-modal';
        modalEl.className = 'confirm-modal-overlay';
        modalEl.innerHTML = `
            <div class="confirm-modal">
                <div class="confirm-modal-icon" id="confirm-modal-icon">
                    ⚠️
                </div>
                <h3 class="confirm-modal-title" id="confirm-modal-title">Confirmation</h3>
                <p class="confirm-modal-message" id="confirm-modal-message">Êtes-vous sûr ?</p>
                <div class="confirm-modal-actions">
                    <button class="confirm-modal-btn cancel" id="confirm-modal-cancel">Annuler</button>
                    <button class="confirm-modal-btn confirm" id="confirm-modal-confirm">Confirmer</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalEl);

        // Event listeners
        document.getElementById('confirm-modal-cancel').addEventListener('click', () => close(false));
        document.getElementById('confirm-modal-confirm').addEventListener('click', () => close(true));

        // Close on overlay click
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) close(false);
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalEl.classList.contains('active')) {
                close(false);
            }
        });
    }

    /**
     * Show confirm modal
     * @param {Object} options - { title, message, icon, confirmText, cancelText, danger }
     * @returns {Promise<boolean>}
     */
    function show(options = {}) {
        ensureModal();

        const {
            title = 'Confirmation',
            message = 'Êtes-vous sûr de vouloir continuer ?',
            icon = '⚠️',
            confirmText = 'Confirmer',
            cancelText = 'Annuler',
            danger = false
        } = options;

        document.getElementById('confirm-modal-icon').textContent = icon;
        document.getElementById('confirm-modal-title').textContent = title;
        document.getElementById('confirm-modal-message').textContent = message;
        document.getElementById('confirm-modal-cancel').textContent = cancelText;

        const confirmBtn = document.getElementById('confirm-modal-confirm');
        confirmBtn.textContent = confirmText;
        confirmBtn.classList.toggle('danger', danger);

        modalEl.classList.add('active');

        return new Promise((resolve) => {
            resolveCallback = resolve;
        });
    }

    /**
     * Close modal
     */
    function close(result) {
        if (modalEl) {
            modalEl.classList.remove('active');
        }
        if (resolveCallback) {
            resolveCallback(result);
            resolveCallback = null;
        }
    }

    /**
     * Shortcut for delete confirmation
     */
    function confirmDelete(itemName = 'cet élément') {
        return show({
            title: 'Supprimer ?',
            message: `Voulez-vous vraiment supprimer ${itemName} ?`,
            icon: '🗑️',
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            danger: true
        });
    }

    return {
        show,
        close,
        confirmDelete
    };
})();

// Expose globally
window.ConfirmModal = ConfirmModal;

// Override native confirm for easy migration
window.confirmAsync = ConfirmModal.show;
