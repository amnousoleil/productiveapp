/**
 * GALAXY PROPERTIES PANEL v1.0
 * Panneau flottant pour éditer les formes sélectionnées (type Miro/Figma)
 */

const GalaxyPropertiesPanel = (function() {
    'use strict';

    let panel = null;
    let isVisible = false;
    let currentSelection = [];

    // Couleurs disponibles (même palette que galaxy.js)
    const COLORS = [
        { hex: '#1e1e1e', name: 'Noir' },
        { hex: '#e03131', name: 'Rouge' },
        { hex: '#2f9e44', name: 'Vert' },
        { hex: '#1971c2', name: 'Bleu' },
        { hex: '#f08c00', name: 'Orange' },
        { hex: '#ae3ec9', name: 'Violet' },
        { hex: '#0c8599', name: 'Cyan' },
        { hex: '#fbbf24', name: 'Jaune' }
    ];

    // Formes disponibles
    const SHAPES = [
        { id: 'circle', name: 'Cercle', icon: '●' },
        { hex: 'rect', name: 'Rectangle', icon: '▭' },
        { id: 'diamond', name: 'Losange', icon: '◆' },
        { id: 'text', name: 'Texte', icon: 'T' }
    ];

    /**
     * Initialiser le panneau
     */
    function init() {
        createPanel();
        console.log('✅ Galaxy Properties Panel initialisé');
    }

    /**
     * Créer le HTML du panneau
     */
    function createPanel() {
        panel = document.createElement('div');
        panel.className = 'galaxy-properties-panel';
        panel.id = 'galaxy-properties-panel';

        panel.innerHTML = `
            <div class="gpp-header">
                <div class="gpp-title">Propriétés</div>
                <button class="gpp-close-btn" id="gpp-close-btn">✕</button>
            </div>

            <div class="gpp-content">
                <!-- Badge sélection multiple -->
                <div class="gpp-multi-badge" id="gpp-multi-badge" style="display: none;">
                    <span id="gpp-selection-count">0</span> éléments sélectionnés
                </div>

                <!-- Section Texte -->
                <div class="gpp-section">
                    <div class="gpp-section-title">📝 Texte</div>
                    <div class="gpp-field">
                        <label class="gpp-label">Contenu</label>
                        <textarea class="gpp-input gpp-textarea" id="gpp-text-input" placeholder="Entrez votre texte..."></textarea>
                    </div>
                </div>

                <!-- Section Couleur -->
                <div class="gpp-section">
                    <div class="gpp-section-title">🎨 Couleur</div>
                    <div class="gpp-color-grid" id="gpp-color-grid">
                        ${COLORS.map(color => `
                            <button class="gpp-color-btn"
                                    data-color="${color.hex}"
                                    style="background: ${color.hex}"
                                    title="${color.name}"></button>
                        `).join('')}
                    </div>
                </div>

                <!-- Section Forme -->
                <div class="gpp-section">
                    <div class="gpp-section-title">⬜ Forme</div>
                    <div class="gpp-shape-grid" id="gpp-shape-grid">
                        ${SHAPES.map(shape => `
                            <button class="gpp-shape-btn" data-shape="${shape.id}">
                                <span style="font-size: 28px">${shape.icon}</span>
                                <span class="gpp-shape-name">${shape.name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Section Taille -->
                <div class="gpp-section" id="gpp-size-section">
                    <div class="gpp-section-title">📏 Taille</div>
                    <div class="gpp-field">
                        <label class="gpp-label">Largeur</label>
                        <div class="gpp-slider-container">
                            <input type="range" class="gpp-slider" id="gpp-width-slider" min="40" max="300" value="120">
                            <span class="gpp-slider-value" id="gpp-width-value">120</span>
                        </div>
                    </div>
                    <div class="gpp-field">
                        <label class="gpp-label">Hauteur</label>
                        <div class="gpp-slider-container">
                            <input type="range" class="gpp-slider" id="gpp-height-slider" min="40" max="300" value="80">
                            <span class="gpp-slider-value" id="gpp-height-value">80</span>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="gpp-actions">
                    <button class="gpp-btn gpp-btn-danger" id="gpp-delete-btn">🗑️ Supprimer</button>
                    <button class="gpp-btn" id="gpp-duplicate-btn">📋 Dupliquer</button>
                </div>
            </div>
        `;

        // Ajouter au DOM (dans galaxy-overlay)
        const galaxyOverlay = document.getElementById('galaxy-overlay');
        if (galaxyOverlay) {
            galaxyOverlay.appendChild(panel);
            setupEventListeners();
        }
    }

    /**
     * Setup événements du panneau
     */
    function setupEventListeners() {
        // Bouton fermer
        const closeBtn = document.getElementById('gpp-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', hide);
        }

        // Champ texte
        const textInput = document.getElementById('gpp-text-input');
        if (textInput) {
            textInput.addEventListener('input', (e) => {
                updateSelectionText(e.target.value);
            });
        }

        // Boutons couleur
        const colorBtns = document.querySelectorAll('.gpp-color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                updateSelectionColor(color);
                updateActiveColorButton(color);
            });
        });

        // Boutons forme
        const shapeBtns = document.querySelectorAll('.gpp-shape-btn');
        shapeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const shape = btn.dataset.shape;
                updateSelectionShape(shape);
                updateActiveShapeButton(shape);
                toggleSizeSection(shape);
            });
        });

        // Sliders taille
        const widthSlider = document.getElementById('gpp-width-slider');
        const heightSlider = document.getElementById('gpp-height-slider');
        const widthValue = document.getElementById('gpp-width-value');
        const heightValue = document.getElementById('gpp-height-value');

        if (widthSlider) {
            widthSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                widthValue.textContent = value;
                updateSelectionWidth(value);
            });
        }

        if (heightSlider) {
            heightSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                heightValue.textContent = value;
                updateSelectionHeight(value);
            });
        }

        // Bouton supprimer
        const deleteBtn = document.getElementById('gpp-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (typeof window.deleteSelectedNodes === 'function') {
                    await window.deleteSelectedNodes();
                    hide();
                }
            });
        }

        // Bouton dupliquer
        const duplicateBtn = document.getElementById('gpp-duplicate-btn');
        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', async () => {
                if (typeof window.duplicateSelectedNodes === 'function') {
                    await window.duplicateSelectedNodes();
                }
            });
        }
    }

    /**
     * Afficher le panneau avec la sélection actuelle
     * @param {Array} selection - Nodes sélectionnés
     */
    function show(selection) {
        if (!panel || !selection || selection.length === 0) return;

        currentSelection = selection;
        isVisible = true;
        panel.classList.add('visible');

        // Mettre à jour l'interface selon la sélection
        updatePanelForSelection(selection);

        console.log('📊 Panneau de propriétés affiché:', selection.length, 'élément(s)');
    }

    /**
     * Masquer le panneau
     */
    function hide() {
        if (!panel) return;
        isVisible = false;
        panel.classList.remove('visible');
        currentSelection = [];
    }

    /**
     * Basculer visibilité
     */
    function toggle(selection) {
        if (isVisible) {
            hide();
        } else {
            show(selection);
        }
    }

    /**
     * Mettre à jour l'interface selon la sélection
     */
    function updatePanelForSelection(selection) {
        // Badge multi-sélection
        const multiBadge = document.getElementById('gpp-multi-badge');
        const selectionCount = document.getElementById('gpp-selection-count');

        if (selection.length > 1) {
            multiBadge.style.display = 'block';
            selectionCount.textContent = selection.length;
        } else {
            multiBadge.style.display = 'none';
        }

        // Prendre les propriétés du premier élément sélectionné
        const node = selection[0];

        // Texte
        const textInput = document.getElementById('gpp-text-input');
        if (textInput) {
            textInput.value = node.text || '';
        }

        // Couleur active
        updateActiveColorButton(node.color);

        // Forme active
        updateActiveShapeButton(node.shape || 'circle');

        // Afficher/masquer section taille selon la forme
        toggleSizeSection(node.shape || 'circle');

        // Tailles (pour rect uniquement)
        if (node.shape === 'rect') {
            const widthSlider = document.getElementById('gpp-width-slider');
            const heightSlider = document.getElementById('gpp-height-slider');
            const widthValue = document.getElementById('gpp-width-value');
            const heightValue = document.getElementById('gpp-height-value');

            if (widthSlider) {
                widthSlider.value = node.width || 120;
                widthValue.textContent = node.width || 120;
            }

            if (heightSlider) {
                heightSlider.value = node.height || 80;
                heightValue.textContent = node.height || 80;
            }
        }
    }

    /**
     * Activer le bouton de couleur actif
     */
    function updateActiveColorButton(color) {
        const colorBtns = document.querySelectorAll('.gpp-color-btn');
        colorBtns.forEach(btn => {
            if (btn.dataset.color === color) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Activer le bouton de forme actif
     */
    function updateActiveShapeButton(shape) {
        const shapeBtns = document.querySelectorAll('.gpp-shape-btn');
        shapeBtns.forEach(btn => {
            if (btn.dataset.shape === shape) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Afficher/masquer section taille selon la forme
     */
    function toggleSizeSection(shape) {
        const sizeSection = document.getElementById('gpp-size-section');
        if (sizeSection) {
            // Uniquement pour les rectangles
            sizeSection.style.display = (shape === 'rect') ? 'block' : 'none';
        }
    }

    /**
     * Mettre à jour le texte de tous les nodes sélectionnés
     */
    function updateSelectionText(text) {
        if (!currentSelection || currentSelection.length === 0) return;

        currentSelection.forEach(node => {
            node.text = text;
        });

        // Sauvegarder si la fonction existe
        if (typeof window.saveNodeToAPI === 'function') {
            currentSelection.forEach(node => {
                window.saveNodeToAPI(node, 'update');
            });
        }
    }

    /**
     * Mettre à jour la couleur de tous les nodes sélectionnés
     */
    function updateSelectionColor(color) {
        if (!currentSelection || currentSelection.length === 0) return;

        currentSelection.forEach(node => {
            node.color = color;
        });

        // Sauvegarder
        if (typeof window.saveNodeToAPI === 'function') {
            currentSelection.forEach(node => {
                window.saveNodeToAPI(node, 'update');
            });
        }
    }

    /**
     * Mettre à jour la forme de tous les nodes sélectionnés
     */
    function updateSelectionShape(shape) {
        if (!currentSelection || currentSelection.length === 0) return;

        currentSelection.forEach(node => {
            node.shape = shape;

            // Réinitialiser dimensions selon la forme
            if (shape === 'rect') {
                node.width = node.width || 120;
                node.height = node.height || 80;
            } else {
                // Pour circle/diamond/text, pas de width/height custom
                delete node.width;
                delete node.height;
            }
        });

        // Sauvegarder
        if (typeof window.saveNodeToAPI === 'function') {
            currentSelection.forEach(node => {
                window.saveNodeToAPI(node, 'update');
            });
        }
    }

    /**
     * Mettre à jour la largeur (rect uniquement)
     */
    function updateSelectionWidth(width) {
        if (!currentSelection || currentSelection.length === 0) return;

        currentSelection.forEach(node => {
            if (node.shape === 'rect') {
                node.width = width;
            }
        });

        // Sauvegarder
        if (typeof window.saveNodeToAPI === 'function') {
            currentSelection.forEach(node => {
                window.saveNodeToAPI(node, 'update');
            });
        }
    }

    /**
     * Mettre à jour la hauteur (rect uniquement)
     */
    function updateSelectionHeight(height) {
        if (!currentSelection || currentSelection.length === 0) return;

        currentSelection.forEach(node => {
            if (node.shape === 'rect') {
                node.height = height;
            }
        });

        // Sauvegarder
        if (typeof window.saveNodeToAPI === 'function') {
            currentSelection.forEach(node => {
                window.saveNodeToAPI(node, 'update');
            });
        }
    }

    /**
     * Mettre à jour le panneau quand la sélection change
     */
    function updateSelection(selection) {
        if (!selection || selection.length === 0) {
            hide();
            return;
        }

        if (isVisible) {
            updatePanelForSelection(selection);
        }
    }

    return {
        init,
        show,
        hide,
        toggle,
        updateSelection,
        get isVisible() {
            return isVisible;
        }
    };
})();

// Export global
window.GalaxyPropertiesPanel = GalaxyPropertiesPanel;

console.log('📦 galaxy-properties-panel.js loaded');
