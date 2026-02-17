/**
 * Giri Vision - Permissions Manager v1.0
 * Gestion des permissions micro/caméra avec messages d'erreur clairs
 * @author Architecte Divin
 */

class GiriPermissionsManager {
  constructor() {
    this.hasAudio = false;
    this.hasVideo = false;
    this.permissionStatus = {
      microphone: 'prompt', // prompt | granted | denied
      camera: 'prompt'
    };
  }

  /**
   * Demande les permissions AVANT de lancer la réunion
   * @returns {Promise<{audio: boolean, video: boolean, errors: Array}>}
   */
  async requestPermissions() {
    const results = {
      audio: false,
      video: false,
      errors: []
    };

    try {
      // Test micro
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      results.audio = true;
      this.hasAudio = true;
      audioStream.getTracks().forEach(track => track.stop()); // Release
      console.log('✅ Micro autorisé');
    } catch (error) {
      results.errors.push(this._handlePermissionError(error, 'microphone'));
    }

    try {
      // Test caméra
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      results.video = true;
      this.hasVideo = true;
      videoStream.getTracks().forEach(track => track.stop());
      console.log('✅ Caméra autorisée');
    } catch (error) {
      results.errors.push(this._handlePermissionError(error, 'camera'));
    }

    return results;
  }

  _handlePermissionError(error, device) {
    const deviceName = device === 'microphone' ? 'micro' : 'caméra';
    const deviceEmoji = device === 'microphone' ? '🎤' : '📷';

    if (error.name === 'NotAllowedError') {
      return {
        type: 'blocked',
        device,
        title: `${deviceEmoji} ${deviceName.charAt(0).toUpperCase() + deviceName.slice(1)} bloqué`,
        message: `Vous avez refusé l'accès au ${deviceName}. Pour activer :<br><br>
          <strong>Chrome/Edge :</strong> Cliquez sur le cadenas 🔒 dans la barre d'adresse → Autorisations<br>
          <strong>Firefox :</strong> Cliquez sur l'icône de caméra barrée → Autoriser<br>
          <strong>Safari :</strong> Safari > Préférences > Sites Web > Caméra/Micro`,
        actions: [
          { label: 'Réessayer', action: 'retry' },
          { label: 'Rejoindre sans ' + deviceName, action: 'skipDevice' }
        ]
      };
    }

    if (error.name === 'NotFoundError') {
      return {
        type: 'not_found',
        device,
        title: `${deviceEmoji} Aucun ${deviceName} détecté`,
        message: `Aucun ${deviceName} n'a été trouvé sur cet appareil.<br><br>
          Vérifiez que votre ${deviceName} est bien branché et reconnu par le système.`,
        actions: [
          { label: 'Réessayer', action: 'retry' },
          { label: 'Continuer sans ' + deviceName, action: 'skipDevice' }
        ]
      };
    }

    if (error.name === 'NotReadableError') {
      return {
        type: 'hardware_error',
        device,
        title: `${deviceEmoji} ${deviceName.charAt(0).toUpperCase() + deviceName.slice(1)} occupé`,
        message: `Votre ${deviceName} est peut-être utilisé par une autre application.<br><br>
          Fermez toute autre application utilisant le ${deviceName} et réessayez.`,
        actions: [
          { label: 'Réessayer', action: 'retry' }
        ]
      };
    }

    // Erreur générique
    return {
      type: 'unknown',
      device,
      title: `❌ Erreur d'accès au ${deviceName}`,
      message: `Une erreur inattendue est survenue : ${error.message}`,
      actions: [
        { label: 'Réessayer', action: 'retry' },
        { label: 'Annuler', action: 'cancel' }
      ]
    };
  }

  /**
   * Affiche modal d'erreur permissions
   */
  showPermissionModal(error) {
    const modal = document.createElement('div');
    modal.className = 'giri-permission-modal';
    modal.innerHTML = `
      <div class="giri-permission-overlay"></div>
      <div class="giri-permission-content">
        <h2>${error.title}</h2>
        <div class="giri-permission-message">${error.message}</div>
        <div class="giri-permission-actions">
          ${error.actions.map(action => `
            <button class="gv-btn ${action.action === 'retry' ? 'gv-btn-primary' : 'gv-btn-secondary'}"
                    data-action="${action.action}">
              ${action.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Bind actions
    modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.action;

        if (action === 'retry') {
          modal.remove();
          const results = await this.requestPermissions();
          if (results.errors.length > 0) {
            this.showPermissionModal(results.errors[0]);
          } else {
            // Permissions OK, lancer réunion
            if (window.GiriVisionView && window.GiriVisionView.startMeeting) {
              window.GiriVisionView.startMeeting();
            }
          }
        } else if (action === 'skipDevice') {
          modal.remove();
          // Lancer réunion sans ce device
          if (window.GiriVisionView && window.GiriVisionView.startMeeting) {
            window.GiriVisionView.startMeeting({ skipDevice: error.device });
          }
        } else {
          modal.remove();
        }
      });
    });
  }

  /**
   * Check si API mediaDevices disponible
   */
  isSupported() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        supported: false,
        error: {
          title: '🚫 Navigateur non compatible',
          message: `Votre navigateur ne supporte pas la visioconférence.<br><br>
            Utilisez une version récente de Chrome, Firefox, Edge ou Safari.`,
          actions: [
            { label: 'Retour', action: 'cancel' }
          ]
        }
      };
    }

    return { supported: true };
  }
}

// Export global
window.GiriPermissionsManager = new GiriPermissionsManager();
