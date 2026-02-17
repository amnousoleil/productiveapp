/**
 * =============================================
 * EXCALIDRAW CORE - Wrapper Miro-Style
 * =============================================
 *
 * Wrapper autour d'Excalidraw avec transformations Miro
 * Communication via iframe + postMessage
 */

export class ExcalidrawCore {
  constructor(containerElement) {
    this.container = containerElement;
    this.iframe = null;
    this.elements = [];
    this.appState = {
      viewBackgroundColor: '#FFFFFF',
      currentItemStrokeColor: '#050038',
      currentItemBackgroundColor: 'transparent',
      currentItemFillStyle: 'solid',
      gridSize: null, // Pas de grille (Miro-like)
      theme: 'light',
      zoom: { value: 1 }
    };
    this.isReady = false;
    this.messageQueue = [];
  }

  /**
   * Initialise Excalidraw dans un iframe
   */
  async init() {
    console.log('🎨 [ExcalidrawCore] Initializing...');

    // Créer l'iframe
    this.iframe = document.createElement('iframe');
    this.iframe.id = 'excalidraw-iframe';
    this.iframe.src = '/galaxy/?miro=1'; // Mode Miro activé
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100%';
    this.iframe.style.border = 'none';
    this.iframe.allow = 'clipboard-read; clipboard-write';
    this.iframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms allow-modals';

    // Écouter les messages de l'iframe
    window.addEventListener('message', (event) => this.handleMessage(event));

    // Monter l'iframe
    this.container.innerHTML = '';
    this.container.appendChild(this.iframe);

    // Attendre que l'iframe soit ready
    await this.waitForReady();

    // Appliquer les transformations Miro
    this.applyMiroTransformations();

    console.log('✅ [ExcalidrawCore] Ready');
    return this;
  }

  /**
   * Attend que Excalidraw soit prêt
   */
  waitForReady() {
    return new Promise((resolve) => {
      const checkReady = setInterval(() => {
        if (this.isReady) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);

      // Timeout 10s
      setTimeout(() => {
        clearInterval(checkReady);
        if (!this.isReady) {
          console.warn('⚠️ [ExcalidrawCore] Timeout waiting for ready');
          this.isReady = true; // Force ready
        }
        resolve();
      }, 10000);
    });
  }

  /**
   * Gère les messages reçus de l'iframe
   */
  handleMessage(event) {
    // Vérifier origin (sécurité)
    if (!event.origin.includes(window.location.hostname)) {
      return;
    }

    const { type, data } = event.data;

    switch (type) {
      case 'excalidraw:ready':
        this.isReady = true;
        console.log('✅ [ExcalidrawCore] Excalidraw ready');
        this.processMessageQueue();
        break;

      case 'excalidraw:elements-changed':
        this.elements = data.elements;
        this.appState = { ...this.appState, ...data.appState };
        this.saveToLocalStorage();
        break;

      case 'excalidraw:pointer-update':
        this.onPointerUpdate(data);
        break;

      default:
        console.log('[ExcalidrawCore] Unknown message:', type);
    }
  }

  /**
   * Envoie un message à l'iframe
   */
  postMessage(type, data = {}) {
    if (!this.iframe || !this.iframe.contentWindow) {
      console.warn('⚠️ [ExcalidrawCore] iframe not ready, queueing message');
      this.messageQueue.push({ type, data });
      return;
    }

    this.iframe.contentWindow.postMessage(
      { type, data },
      window.location.origin
    );
  }

  /**
   * Traite la queue de messages en attente
   */
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const { type, data } = this.messageQueue.shift();
      this.postMessage(type, data);
    }
  }

  /**
   * Applique les transformations Miro
   */
  applyMiroTransformations() {
    console.log('🎨 [ExcalidrawCore] Applying Miro transformations');

    // Désactiver la grille
    this.updateScene({
      appState: { gridSize: null }
    });

    // Palette Miro par défaut
    this.setDefaultColors({
      stroke: '#050038', // Miro dark blue
      background: '#FFFFFF',
      fill: '#E8F5FD' // Miro light blue
    });

    // Charger les données sauvegardées
    this.loadFromLocalStorage();
  }

  /**
   * Met à jour la scène Excalidraw
   */
  updateScene(updates) {
    this.postMessage('excalidraw:update-scene', updates);
  }

  /**
   * Change les couleurs par défaut
   */
  setDefaultColors(colors) {
    this.updateScene({
      appState: {
        currentItemStrokeColor: colors.stroke,
        currentItemBackgroundColor: colors.background,
        currentItemFillStyle: 'solid'
      }
    });
  }

  /**
   * Sélectionne un outil
   */
  setActiveTool(tool) {
    this.postMessage('excalidraw:set-tool', { tool });
  }

  /**
   * Zoom in
   */
  zoomIn() {
    this.postMessage('excalidraw:zoom', { direction: 'in' });
  }

  /**
   * Zoom out
   */
  zoomOut() {
    this.postMessage('excalidraw:zoom', { direction: 'out' });
  }

  /**
   * Fit to screen
   */
  zoomToFit() {
    this.postMessage('excalidraw:zoom-fit');
  }

  /**
   * Undo
   */
  undo() {
    this.postMessage('excalidraw:undo');
  }

  /**
   * Redo
   */
  redo() {
    this.postMessage('excalidraw:redo');
  }

  /**
   * Ajouter un élément
   */
  addElement(element) {
    this.postMessage('excalidraw:add-element', { element });
  }

  /**
   * Mettre à jour un élément
   */
  updateElement(id, updates) {
    this.postMessage('excalidraw:update-element', { id, updates });
  }

  /**
   * Supprimer un élément
   */
  deleteElement(id) {
    this.postMessage('excalidraw:delete-element', { id });
  }

  /**
   * Créer un sticky note Miro
   */
  createStickyNote(x, y, text = '', color = '#FFD02F') {
    const sticky = {
      type: 'rectangle',
      x,
      y,
      width: 200,
      height: 200,
      backgroundColor: color,
      strokeColor: color,
      fillStyle: 'solid',
      strokeWidth: 0,
      roundness: { type: 'adaptive' },
      text,
      fontSize: 16,
      fontFamily: 1, // Hand-drawn
      textAlign: 'left',
      verticalAlign: 'top'
    };
    this.addElement(sticky);
  }

  /**
   * Créer un frame Miro
   */
  createFrame(x, y, width, height, title = 'New Frame') {
    const frame = {
      type: 'rectangle',
      x,
      y,
      width,
      height,
      backgroundColor: 'transparent',
      strokeColor: '#E1E4E8',
      strokeWidth: 2,
      strokeStyle: 'dashed',
      fillStyle: 'hachure',
      text: title,
      fontSize: 18,
      fontFamily: 1
    };
    this.addElement(frame);
  }

  /**
   * Callback pointer update (pour collaboration)
   */
  onPointerUpdate(payload) {
    // Pour collaboration temps réel (Phase 3)
    if (window.ExcalidrawCollab) {
      window.ExcalidrawCollab.broadcastPointer(payload);
    }
  }

  /**
   * Sauvegarde dans localStorage
   */
  saveToLocalStorage() {
    const data = {
      elements: this.elements,
      appState: this.appState,
      version: '1.0',
      timestamp: Date.now()
    };
    localStorage.setItem('excalidraw_miro_data', JSON.stringify(data));
  }

  /**
   * Charge depuis localStorage
   */
  loadFromLocalStorage() {
    const stored = localStorage.getItem('excalidraw_miro_data');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.elements = data.elements || [];
        this.appState = { ...this.appState, ...(data.appState || {}) };

        // Envoyer à Excalidraw
        this.updateScene({
          elements: this.elements,
          appState: this.appState
        });

        console.log(`📥 [ExcalidrawCore] Loaded ${this.elements.length} elements`);
      } catch (error) {
        console.error('❌ [ExcalidrawCore] Error loading data:', error);
      }
    }
  }

  /**
   * Export PNG
   */
  async exportToPNG() {
    return new Promise((resolve) => {
      const handler = (event) => {
        if (event.data.type === 'excalidraw:export-png-result') {
          window.removeEventListener('message', handler);
          resolve(event.data.data.blob);
        }
      };
      window.addEventListener('message', handler);
      this.postMessage('excalidraw:export-png');
    });
  }

  /**
   * Export SVG
   */
  async exportToSVG() {
    return new Promise((resolve) => {
      const handler = (event) => {
        if (event.data.type === 'excalidraw:export-svg-result') {
          window.removeEventListener('message', handler);
          resolve(event.data.data.svg);
        }
      };
      window.addEventListener('message', handler);
      this.postMessage('excalidraw:export-svg');
    });
  }

  /**
   * Export JSON
   */
  exportToJSON() {
    return {
      type: 'excalidraw',
      version: 2,
      source: 'ProductiveApp Miro Clone',
      elements: this.elements,
      appState: this.appState,
      files: {}
    };
  }

  /**
   * Destroy (cleanup)
   */
  destroy() {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    window.removeEventListener('message', this.handleMessage);
    console.log('🗑️ [ExcalidrawCore] Destroyed');
  }
}

// Exposer globalement
window.ExcalidrawCore = ExcalidrawCore;
