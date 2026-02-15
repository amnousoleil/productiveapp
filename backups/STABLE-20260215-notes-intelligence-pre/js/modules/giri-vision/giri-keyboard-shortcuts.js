/**
 * Giri Vision - Keyboard Shortcuts v1.0
 * Raccourcis clavier accessibles pour contrôler la réunion
 * @author Architecte Divin
 */

// Initialisation des raccourcis clavier
document.addEventListener('keydown', (e) => {
  // Ne déclenche que si en réunion
  if (!window.GiriVisionView || !window.GiriVisionView._meetApi) return;

  // Ignore si focus dans un input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  // M = Toggle mute
  if (e.key === 'm' || e.key === 'M') {
    e.preventDefault();
    window.GiriVisionView._meetApi.executeCommand('toggleAudio');
    announceToScreenReader('Micro activé/désactivé');
    console.log('⌨️ Micro toggled');
  }

  // V = Toggle video
  if (e.key === 'v' || e.key === 'V') {
    e.preventDefault();
    window.GiriVisionView._meetApi.executeCommand('toggleVideo');
    announceToScreenReader('Caméra activée/désactivée');
    console.log('⌨️ Vidéo toggled');
  }

  // D = Toggle screen share
  if (e.key === 'd' || e.key === 'D') {
    e.preventDefault();
    window.GiriVisionView._meetApi.executeCommand('toggleShareScreen');
    announceToScreenReader('Partage d\'écran activé/désactivé');
    console.log('⌨️ Partage écran toggled');
  }

  // H = Hang up
  if (e.key === 'h' || e.key === 'H') {
    e.preventDefault();
    if (confirm('Quitter la réunion ?')) {
      window.GiriVisionView._meetApi.executeCommand('hangup');
    }
  }

  // ? = Show shortcuts
  if (e.key === '?') {
    e.preventDefault();
    showKeyboardShortcutsModal();
  }
});

function showKeyboardShortcutsModal() {
  const modal = document.createElement('div');
  modal.className = 'giri-shortcuts-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-labelledby', 'shortcuts-title');
  modal.innerHTML = `
    <div class="giri-permission-overlay"></div>
    <div class="giri-permission-content">
      <h2 id="shortcuts-title">⌨️ Raccourcis clavier</h2>
      <table class="shortcuts-table">
        <tr><td><kbd>M</kbd></td><td>Couper/activer le micro</td></tr>
        <tr><td><kbd>V</kbd></td><td>Couper/activer la vidéo</td></tr>
        <tr><td><kbd>D</kbd></td><td>Partager l'écran</td></tr>
        <tr><td><kbd>H</kbd></td><td>Raccrocher</td></tr>
        <tr><td><kbd>?</kbd></td><td>Afficher ces raccourcis</td></tr>
      </table>
      <button class="gv-btn gv-btn-primary" onclick="this.closest('.giri-shortcuts-modal').remove()">
        Fermer
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  // Focus trap
  const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (firstElement) firstElement.focus();

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.remove();
    }

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });
}

function announceToScreenReader(message) {
  let announcer = document.getElementById('giri-announcements');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'giri-announcements';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);
  }

  announcer.textContent = message;
  setTimeout(() => { announcer.textContent = ''; }, 5000);
}

console.log('✅ Giri Vision Keyboard Shortcuts loaded');
