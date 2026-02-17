/**
 * Giri Vision - Connection Manager v1.0
 * Reconnexion automatique avec backoff exponentiel
 * @author Architecte Divin
 */

class GiriConnectionManager {
  constructor(meetApi) {
    this.meetApi = meetApi;
    this.isOnline = navigator.onLine;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.baseDelay = 1000; // 1s
    this.reconnectTimer = null;
    this.isReconnecting = false;

    this.init();
  }

  init() {
    // Listen to browser online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Listen to Meet API connection events
    if (this.meetApi) {
      this.meetApi.addEventListener('connectionFailed', () => this.handleConnectionLost());
      this.meetApi.addEventListener('connectionEstablished', () => this.handleConnectionRestored());
    }
  }

  handleOffline() {
    console.warn('🔴 Réseau perdu (offline event)');
    this.isOnline = false;
    this.showToast('⚠️ Connexion perdue... tentative de reconnexion', 'warning', 0);
  }

  handleOnline() {
    console.log('🟢 Réseau rétabli (online event)');
    this.isOnline = true;
    if (this.isReconnecting) {
      this.attemptReconnect();
    }
  }

  handleConnectionLost() {
    if (this.isReconnecting) return; // Already reconnecting

    console.warn('🔴 Connexion vidéo perdue');
    this.isReconnecting = true;
    this.showToast('⚠️ Connexion perdue... reconnexion en cours', 'warning', 0);
    this.attemptReconnect();
  }

  handleConnectionRestored() {
    console.log('✅ Connexion vidéo rétablie');
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.clearReconnectTimer();
    this.showToast('✅ Reconnecté avec succès !', 'success', 3000);
  }

  async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.showReconnectFailedModal();
      return;
    }

    this.reconnectAttempts++;
    const delay = this.baseDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    const nextAttemptSeconds = Math.ceil(delay / 1000);

    console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${nextAttemptSeconds}s...`);

    this.showToast(
      `🔄 Reconnexion... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) — ${nextAttemptSeconds}s`,
      'info',
      delay
    );

    this.reconnectTimer = setTimeout(async () => {
      try {
        // Check network first
        if (!navigator.onLine) {
          console.warn('⚠️ Toujours offline, retry...');
          this.attemptReconnect();
          return;
        }

        // Ping test
        const pingOk = await this.testConnection();
        if (!pingOk) {
          console.warn('⚠️ Ping failed, retry...');
          this.attemptReconnect();
          return;
        }

        // Reconnect API
        console.log('🔄 Reconnecting Meet API...');
        // API gère la reconnexion auto, on attend juste l'event
        // Si pas d'event après 5s, on retry
        setTimeout(() => {
          if (this.isReconnecting) {
            console.warn('⚠️ Reconnexion timeout, retry...');
            this.attemptReconnect();
          }
        }, 5000);

      } catch (error) {
        console.error('❌ Reconnection error:', error);
        this.attemptReconnect();
      }
    }, delay);
  }

  async testConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('https://meet.jit.si/favicon.ico', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store'
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  showReconnectFailedModal() {
    this.clearReconnectTimer();
    this.isReconnecting = false;

    const modal = document.createElement('div');
    modal.className = 'giri-reconnect-modal';
    modal.innerHTML = `
      <div class="giri-permission-overlay"></div>
      <div class="giri-permission-content">
        <div style="font-size: 64px; text-align: center; margin-bottom: 16px;">⚠️</div>
        <h2>Impossible de se reconnecter</h2>
        <div class="giri-permission-message">
          La connexion à la réunion a été perdue et nous n'avons pas pu la rétablir automatiquement.
          <br><br>
          <strong>Vérifiez votre connexion Internet</strong> et réessayez.
        </div>
        <div class="giri-permission-actions">
          <button class="gv-btn gv-btn-primary" onclick="location.reload()">
            🔄 Réessayer maintenant
          </button>
          <button class="gv-btn gv-btn-secondary" onclick="window.location.href='/'">
            🏠 Retour à l'accueil
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  showToast(message, type = 'info', duration = 3000) {
    // Utilise le système Toast de ProductiveApp si disponible
    if (window.Toast) {
      if (type === 'success') window.Toast.success(message, duration);
      else if (type === 'warning') window.Toast.warning(message, duration);
      else if (type === 'error') window.Toast.error(message, duration);
      else window.Toast.info(message, duration);
    } else {
      console.log(`[Toast ${type}]`, message);
    }
  }

  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  cleanup() {
    this.clearReconnectTimer();
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

// Export global
window.GiriConnectionManager = GiriConnectionManager;
