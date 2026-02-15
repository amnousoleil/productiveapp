/**
 * =============================================
 * EXCALIDRAW COLLAB - Collaboration Temps Réel
 * =============================================
 *
 * WebSocket collaboration pour Excalidraw Miro
 * Curseurs en temps réel, sync éléments, présence utilisateurs
 */

export class ExcalidrawCollab {
  constructor(excalidrawCore, roomId) {
    this.core = excalidrawCore;
    this.roomId = roomId || this.generateRoomId();
    this.ws = null;
    this.cursors = new Map(); // userId → cursor data
    this.users = new Map(); // userId → user data
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  /**
   * Connecte au serveur WebSocket
   */
  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:${window.location.port}/ws/excalidraw/${this.roomId}`;

    console.log(`🔌 [ExcalidrawCollab] Connecting to ${wsUrl}...`);

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => this.handleOpen();
    this.ws.onmessage = (event) => this.handleMessage(event);
    this.ws.onerror = (error) => this.handleError(error);
    this.ws.onclose = () => this.handleClose();
  }

  /**
   * Connexion établie
   */
  handleOpen() {
    console.log('✅ [ExcalidrawCollab] Connected');

    this.isConnected = true;
    this.reconnectAttempts = 0;

    // Envoyer message de join
    this.sendJoin();

    // Afficher notification
    this.showToast('✅ Collaboration active', 'success');
  }

  /**
   * Message reçu
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'user-joined':
          this.handleUserJoined(data);
          break;

        case 'user-left':
          this.handleUserLeft(data);
          break;

        case 'elements-update':
          this.handleElementsUpdate(data);
          break;

        case 'cursor-update':
          this.handleCursorUpdate(data);
          break;

        case 'room-state':
          this.handleRoomState(data);
          break;

        default:
          console.log('[ExcalidrawCollab] Unknown message:', data.type);
      }
    } catch (error) {
      console.error('❌ [ExcalidrawCollab] Message parse error:', error);
    }
  }

  /**
   * Erreur WebSocket
   */
  handleError(error) {
    console.error('❌ [ExcalidrawCollab] WebSocket error:', error);
    this.showToast('⚠️ Erreur de connexion', 'error');
  }

  /**
   * Connexion fermée
   */
  handleClose() {
    console.log('🔌 [ExcalidrawCollab] Disconnected');

    this.isConnected = false;

    // Nettoyer les curseurs
    this.cursors.clear();
    this.renderCursors();

    // Tentative de reconnexion
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      console.log(`🔄 [ExcalidrawCollab] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);

      setTimeout(() => this.connect(), delay);
    } else {
      this.showToast('❌ Collaboration désactivée (max retries)', 'error');
    }
  }

  /**
   * Envoie message de join
   */
  sendJoin() {
    this.send({
      type: 'join',
      roomId: this.roomId,
      userId: this.getUserId(),
      userName: this.getUserName(),
      userColor: this.getUserColor()
    });
  }

  /**
   * Utilisateur rejoint
   */
  handleUserJoined(data) {
    console.log(`👋 [ExcalidrawCollab] User joined: ${data.userName}`);

    this.users.set(data.userId, {
      id: data.userId,
      name: data.userName,
      color: data.userColor || this.generateUserColor()
    });

    this.showToast(`👋 ${data.userName} a rejoint`, 'info');
    this.updateUsersList();
  }

  /**
   * Utilisateur quitte
   */
  handleUserLeft(data) {
    console.log(`👋 [ExcalidrawCollab] User left: ${data.userName}`);

    this.users.delete(data.userId);
    this.cursors.delete(data.userId);

    this.showToast(`👋 ${data.userName} a quitté`, 'info');
    this.renderCursors();
    this.updateUsersList();
  }

  /**
   * Mise à jour des éléments
   */
  handleElementsUpdate(data) {
    // Mettre à jour Excalidraw
    this.core.updateScene({
      elements: data.elements
    });
  }

  /**
   * Mise à jour du curseur
   */
  handleCursorUpdate(data) {
    const user = this.users.get(data.userId);
    if (!user) return;

    this.cursors.set(data.userId, {
      x: data.x,
      y: data.y,
      userName: user.name,
      userColor: user.color
    });

    this.renderCursors();
  }

  /**
   * État initial de la room
   */
  handleRoomState(data) {
    console.log(`📥 [ExcalidrawCollab] Room state: ${data.users?.length || 0} users`);

    // Charger les utilisateurs
    if (data.users) {
      data.users.forEach(user => {
        this.users.set(user.id, user);
      });
      this.updateUsersList();
    }

    // Charger les éléments
    if (data.elements) {
      this.core.updateScene({
        elements: data.elements
      });
    }
  }

  /**
   * Envoie un message
   */
  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ [ExcalidrawCollab] WebSocket not ready');
      return;
    }

    try {
      this.ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('❌ [ExcalidrawCollab] Send error:', error);
    }
  }

  /**
   * Broadcast éléments modifiés
   */
  broadcastElements(elements) {
    this.send({
      type: 'elements-update',
      elements,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast position curseur
   */
  broadcastPointer(cursor) {
    // Throttle pour éviter spam
    if (!this.lastCursorBroadcast || Date.now() - this.lastCursorBroadcast > 50) {
      this.send({
        type: 'cursor-update',
        x: cursor.x,
        y: cursor.y,
        userId: this.getUserId()
      });
      this.lastCursorBroadcast = Date.now();
    }
  }

  /**
   * Rend les curseurs des autres utilisateurs
   */
  renderCursors() {
    // Supprimer les curseurs existants
    document.querySelectorAll('.collab-cursor').forEach(el => el.remove());

    // Créer les curseurs
    this.cursors.forEach((cursor, userId) => {
      if (userId === this.getUserId()) return; // Pas notre propre curseur

      const cursorEl = document.createElement('div');
      cursorEl.className = 'collab-cursor';
      cursorEl.style.cssText = `
        position: fixed;
        left: ${cursor.x}px;
        top: ${cursor.y}px;
        pointer-events: none;
        z-index: 10001;
        transition: all 0.1s ease-out;
      `;

      cursorEl.innerHTML = `
        <svg class="cursor-pointer" width="24" height="24" viewBox="0 0 24 24" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <path d="M5 3l14 9-6 2-2 6z" fill="${cursor.userColor}" stroke="white" stroke-width="1.5"/>
        </svg>
        <span class="cursor-name" style="
          position: absolute;
          left: 24px;
          top: 0;
          background: ${cursor.userColor};
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        ">${cursor.userName}</span>
      `;

      document.body.appendChild(cursorEl);
    });
  }

  /**
   * Met à jour la liste des utilisateurs
   */
  updateUsersList() {
    const usersCount = this.users.size;
    console.log(`👥 [ExcalidrawCollab] ${usersCount} user(s) in room`);

    // Afficher badge avec nombre d'utilisateurs
    let badge = document.getElementById('collab-users-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'collab-users-badge';
      badge.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(225, 228, 232, 0.8);
        border-radius: 12px;
        padding: 10px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #050038;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        z-index: 9997;
        cursor: pointer;
        transition: all 0.2s;
      `;

      badge.addEventListener('click', () => this.showUsersModal());
      document.body.appendChild(badge);
    }

    badge.innerHTML = `
      <span style="font-size: 18px;">👥</span>
      <span>${usersCount}</span>
    `;
  }

  /**
   * Affiche le modal des utilisateurs
   */
  showUsersModal() {
    const modal = document.createElement('div');
    modal.className = 'miro-modal-overlay';

    const usersList = Array.from(this.users.values())
      .map(user => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #F6F8FA; border-radius: 8px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${user.color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
            ${user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-weight: 600; color: #050038;">${user.name}</div>
            <div style="font-size: 12px; color: #6B7280;">Online</div>
          </div>
        </div>
      `).join('');

    modal.innerHTML = `
      <div class="miro-modal">
        <h3>👥 Utilisateurs (${this.users.size})</h3>
        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto;">
          ${usersList}
        </div>
        <button class="miro-modal-close">Fermer</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.miro-modal-close').onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  }

  /**
   * Affiche un toast
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#7CE38B' : type === 'error' ? '#FF6F59' : '#60A5FA'};
      color: white;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10002;
      animation: slideDown 0.3s ease, fadeOut 0.3s ease 2.7s;
    `;
    toast.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      @keyframes fadeOut {
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  /**
   * Génère un ID de room aléatoire
   */
  generateRoomId() {
    return `excalidraw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Récupère l'ID utilisateur
   */
  getUserId() {
    let userId = localStorage.getItem('excalidraw_collab_user_id');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('excalidraw_collab_user_id', userId);
    }
    return userId;
  }

  /**
   * Récupère le nom utilisateur
   */
  getUserName() {
    return localStorage.getItem('user_name') || 'Anonyme';
  }

  /**
   * Génère une couleur utilisateur
   */
  getUserColor() {
    const colors = ['#FF6F59', '#7CE38B', '#A78BFA', '#60A5FA', '#FFD02F', '#FF8C94', '#7EB5FF'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Génère une couleur aléatoire
   */
  generateUserColor() {
    const colors = ['#FF6F59', '#7CE38B', '#A78BFA', '#60A5FA', '#FFD02F', '#FF8C94', '#7EB5FF'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Déconnexion
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.cursors.clear();
    this.users.clear();
    this.renderCursors();

    document.getElementById('collab-users-badge')?.remove();
    document.querySelectorAll('.collab-cursor').forEach(el => el.remove());

    console.log('🔌 [ExcalidrawCollab] Disconnected');
  }

  /**
   * Destroy
   */
  destroy() {
    this.disconnect();
    console.log('🗑️ [ExcalidrawCollab] Destroyed');
  }
}

// Exposer globalement
window.ExcalidrawCollab = ExcalidrawCollab;
