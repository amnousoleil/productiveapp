/**
 * =============================================
 * MIRO TOOLBAR - Toolbar Horizontal Style Miro
 * =============================================
 *
 * Toolbar custom en bas de l'écran (comme Miro)
 * Remplace la toolbar verticale native d'Excalidraw
 */

export class MiroToolbar {
  constructor(excalidrawCore) {
    this.core = excalidrawCore;
    this.toolbar = null;
    this.activeTool = 'selection';
    this.activeColor = '#050038';
  }

  /**
   * Rend la toolbar
   */
  render() {
    console.log('🎨 [MiroToolbar] Rendering...');

    // Créer la toolbar
    this.toolbar = document.createElement('div');
    this.toolbar.id = 'miro-toolbar';
    this.toolbar.className = 'miro-toolbar';

    this.toolbar.innerHTML = `
      <!-- Section Outils -->
      <div class="miro-toolbar-section">
        <button class="miro-tool active" data-tool="selection" title="Selection (V)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3l7 18 3-7 7-3z"/>
          </svg>
        </button>
        <button class="miro-tool" data-tool="rectangle" title="Rectangle (R)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
          </svg>
        </button>
        <button class="miro-tool" data-tool="ellipse" title="Circle (O)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"/>
          </svg>
        </button>
        <button class="miro-tool" data-tool="diamond" title="Diamond (D)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l10 10-10 10L2 12z"/>
          </svg>
        </button>
        <button class="miro-tool" data-tool="arrow" title="Arrow (A)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
        <button class="miro-tool" data-tool="line" title="Line (L)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="19" x2="19" y2="5"/>
          </svg>
        </button>
        <button class="miro-tool" data-tool="text" title="Text (T)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4 7 4 4 20 4 20 7"/>
            <line x1="9" y1="20" x2="15" y2="20"/>
            <line x1="12" y1="4" x2="12" y2="20"/>
          </svg>
        </button>
        <button class="miro-tool" data-tool="sticky" title="Sticky Note (S)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD02F" stroke="currentColor" stroke-width="2">
            <path d="M3 3h18v14l-4 4H3z"/>
            <polyline points="17 17v4l4-4h-4"/>
          </svg>
        </button>
        <button class="miro-tool" data-tool="frame" title="Frame (F)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
          </svg>
        </button>
      </div>

      <!-- Section Couleurs -->
      <div class="miro-toolbar-section miro-toolbar-colors">
        <div class="color-swatch active" data-color="#050038" style="background: #050038" title="Miro Dark Blue"></div>
        <div class="color-swatch" data-color="#FFFFFF" style="background: #FFFFFF; border: 1px solid #E1E4E8" title="White"></div>
        <div class="color-swatch" data-color="#E8F5FD" style="background: #E8F5FD" title="Miro Light Blue"></div>
        <div class="color-swatch" data-color="#FFD02F" style="background: #FFD02F" title="Yellow"></div>
        <div class="color-swatch" data-color="#FF6F59" style="background: #FF6F59" title="Coral"></div>
        <div class="color-swatch" data-color="#7CE38B" style="background: #7CE38B" title="Green"></div>
        <div class="color-swatch" data-color="#A78BFA" style="background: #A78BFA" title="Purple"></div>
        <div class="color-swatch" data-color="#60A5FA" style="background: #60A5FA" title="Blue"></div>
      </div>

      <!-- Section Actions -->
      <div class="miro-toolbar-section">
        <button class="miro-tool" data-action="undo" title="Undo (Ctrl+Z)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v6h6"/>
            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
          </svg>
        </button>
        <button class="miro-tool" data-action="redo" title="Redo (Ctrl+Y)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 7v6h-6"/>
            <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/>
          </svg>
        </button>
        <button class="miro-tool" data-action="zoom-in" title="Zoom In (+)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button class="miro-tool" data-action="zoom-out" title="Zoom Out (-)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button class="miro-tool" data-action="zoom-fit" title="Fit to Screen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
          </svg>
        </button>
      </div>

      <!-- Section Templates -->
      <div class="miro-toolbar-section">
        <button class="miro-tool" data-action="templates" title="Templates">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
          </svg>
        </button>
        <button class="miro-tool" data-action="export" title="Export">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>
    `;

    // Injecter dans le DOM
    document.body.appendChild(this.toolbar);

    // Bind events
    this.bindEvents();

    // Cacher la toolbar native Excalidraw
    this.hideNativeToolbar();

    console.log('✅ [MiroToolbar] Rendered');
  }

  /**
   * Bind les événements
   */
  bindEvents() {
    // Outils
    this.toolbar.querySelectorAll('[data-tool]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tool = e.currentTarget.dataset.tool;
        this.selectTool(tool);
      });
    });

    // Couleurs
    this.toolbar.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        const color = e.currentTarget.dataset.color;
        this.setColor(color);
      });
    });

    // Actions
    this.toolbar.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.executeAction(action);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            this.core.undo();
            break;
          case 'y':
            e.preventDefault();
            this.core.redo();
            break;
        }
      }

      // Tool shortcuts (sans modifier)
      if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        const toolMap = {
          'v': 'selection',
          'r': 'rectangle',
          'o': 'ellipse',
          'd': 'diamond',
          'a': 'arrow',
          'l': 'line',
          't': 'text',
          's': 'sticky',
          'f': 'frame'
        };

        if (toolMap[e.key.toLowerCase()]) {
          e.preventDefault();
          this.selectTool(toolMap[e.key.toLowerCase()]);
        }
      }
    });
  }

  /**
   * Sélectionne un outil
   */
  selectTool(tool) {
    console.log(`🔧 [MiroToolbar] Tool: ${tool}`);

    this.activeTool = tool;

    // Mapping Miro → Excalidraw
    const toolMap = {
      'selection': 'selection',
      'rectangle': 'rectangle',
      'ellipse': 'ellipse',
      'diamond': 'diamond',
      'arrow': 'arrow',
      'line': 'line',
      'text': 'text',
      'sticky': 'rectangle', // Sticky = rectangle jaune
      'frame': 'rectangle' // Frame = rectangle dashed
    };

    // Si sticky, changer la couleur
    if (tool === 'sticky') {
      this.setColor('#FFD02F');
    }

    // Si frame, changer le style
    if (tool === 'frame') {
      this.core.updateScene({
        appState: {
          currentItemStrokeStyle: 'dashed',
          currentItemBackgroundColor: 'transparent'
        }
      });
    }

    // Envoyer à Excalidraw
    this.core.setActiveTool(toolMap[tool] || tool);

    // Update UI
    this.toolbar.querySelectorAll('[data-tool]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
  }

  /**
   * Change la couleur
   */
  setColor(color) {
    console.log(`🎨 [MiroToolbar] Color: ${color}`);

    this.activeColor = color;
    this.core.setDefaultColors({
      stroke: color,
      background: color,
      fill: color
    });

    // Update UI
    this.toolbar.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.classList.toggle('active', swatch.dataset.color === color);
    });
  }

  /**
   * Exécute une action
   */
  executeAction(action) {
    console.log(`⚡ [MiroToolbar] Action: ${action}`);

    switch (action) {
      case 'undo':
        this.core.undo();
        break;

      case 'redo':
        this.core.redo();
        break;

      case 'zoom-in':
        this.core.zoomIn();
        break;

      case 'zoom-out':
        this.core.zoomOut();
        break;

      case 'zoom-fit':
        this.core.zoomToFit();
        break;

      case 'templates':
        this.showTemplatesModal();
        break;

      case 'export':
        this.showExportModal();
        break;
    }
  }

  /**
   * Affiche le modal templates
   */
  showTemplatesModal() {
    const modal = document.createElement('div');
    modal.className = 'miro-modal-overlay';
    modal.innerHTML = `
      <div class="miro-modal">
        <h3>📐 Templates Miro</h3>
        <div class="miro-templates-grid">
          <button class="miro-template-card" data-template="brainstorm">
            <div class="template-icon">💡</div>
            <div class="template-name">Brainstorming</div>
          </button>
          <button class="miro-template-card" data-template="kanban">
            <div class="template-icon">📋</div>
            <div class="template-name">Kanban Board</div>
          </button>
          <button class="miro-template-card" data-template="mindmap">
            <div class="template-icon">🧠</div>
            <div class="template-name">Mind Map</div>
          </button>
          <button class="miro-template-card" data-template="flowchart">
            <div class="template-icon">🔄</div>
            <div class="template-name">Flowchart</div>
          </button>
        </div>
        <button class="miro-modal-close">Fermer</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Events
    modal.querySelector('.miro-modal-close').onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    modal.querySelectorAll('[data-template]').forEach(btn => {
      btn.onclick = () => {
        const template = btn.dataset.template;
        this.loadTemplate(template);
        modal.remove();
      };
    });
  }

  /**
   * Charge un template
   */
  loadTemplate(template) {
    console.log(`📐 [MiroToolbar] Loading template: ${template}`);

    switch (template) {
      case 'brainstorm':
        this.core.createFrame(100, 100, 1200, 800, 'Ideas');
        this.core.createStickyNote(150, 200, 'Idea 1', '#FFD02F');
        this.core.createStickyNote(400, 200, 'Idea 2', '#E8F5FD');
        this.core.createStickyNote(650, 200, 'Idea 3', '#FF6F59');
        break;

      case 'kanban':
        this.core.createFrame(100, 100, 400, 800, 'To Do');
        this.core.createFrame(550, 100, 400, 800, 'Doing');
        this.core.createFrame(1000, 100, 400, 800, 'Done');
        break;

      case 'mindmap':
        this.core.createStickyNote(600, 400, 'Central Idea', '#A78BFA');
        break;

      case 'flowchart':
        this.core.createFrame(100, 100, 1400, 900, 'Process Flow');
        break;
    }
  }

  /**
   * Affiche le modal export
   */
  async showExportModal() {
    const modal = document.createElement('div');
    modal.className = 'miro-modal-overlay';
    modal.innerHTML = `
      <div class="miro-modal">
        <h3>📥 Export</h3>
        <div class="miro-export-options">
          <button class="miro-export-btn" data-format="png">PNG Image</button>
          <button class="miro-export-btn" data-format="svg">SVG Vector</button>
          <button class="miro-export-btn" data-format="json">JSON Data</button>
        </div>
        <button class="miro-modal-close">Fermer</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Events
    modal.querySelector('.miro-modal-close').onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    modal.querySelectorAll('[data-format]').forEach(btn => {
      btn.onclick = async () => {
        const format = btn.dataset.format;
        await this.exportAs(format);
        modal.remove();
      };
    });
  }

  /**
   * Export dans un format
   */
  async exportAs(format) {
    console.log(`📥 [MiroToolbar] Exporting as ${format}`);

    try {
      switch (format) {
        case 'png':
          const blob = await this.core.exportToPNG();
          this.downloadBlob(blob, 'excalidraw-miro.png');
          break;

        case 'svg':
          const svg = await this.core.exportToSVG();
          this.downloadText(svg, 'excalidraw-miro.svg', 'image/svg+xml');
          break;

        case 'json':
          const json = this.core.exportToJSON();
          this.downloadText(JSON.stringify(json, null, 2), 'excalidraw-miro.json', 'application/json');
          break;
      }
    } catch (error) {
      console.error('❌ [MiroToolbar] Export error:', error);
      alert('Erreur lors de l\'export');
    }
  }

  /**
   * Télécharge un blob
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Télécharge du texte
   */
  downloadText(text, filename, mimeType) {
    const blob = new Blob([text], { type: mimeType });
    this.downloadBlob(blob, filename);
  }

  /**
   * Cache la toolbar native Excalidraw
   */
  hideNativeToolbar() {
    const style = document.createElement('style');
    style.id = 'miro-hide-native';
    style.textContent = `
      #excalidraw-iframe {
        /* Cache certains éléments de l'UI native si besoin */
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Destroy
   */
  destroy() {
    if (this.toolbar) {
      this.toolbar.remove();
      this.toolbar = null;
    }
    document.getElementById('miro-hide-native')?.remove();
    console.log('🗑️ [MiroToolbar] Destroyed');
  }
}

// Exposer globalement
window.MiroToolbar = MiroToolbar;
