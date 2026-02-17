/**
 * =============================================
 * EXCALIDRAW INIT - Initialisation Miro Clone
 * =============================================
 *
 * Point d'entrée pour Excalidraw Miro dans Galaxie View
 * Charge tous les modules et initialise le canvas
 */

import { ExcalidrawCore } from './excalidraw-core.js';
import { MiroToolbar } from './excalidraw-toolbar.js';
import { ExcalidrawCollab } from './excalidraw-collab.js';

let excalidrawInstance = null;
let toolbarInstance = null;
let collabInstance = null;

/**
 * Initialise Excalidraw Miro dans Galaxie View
 */
async function initExcalidrawMiro() {
  console.log('🎨 [ExcalidrawInit] Initializing Excalidraw Miro...');

  // Trouver le container
  const container = document.getElementById('view-galaxy');
  if (!container) {
    console.error('❌ [ExcalidrawInit] #view-galaxy not found');
    return;
  }

  // Créer le container Excalidraw
  const excalidrawContainer = document.createElement('div');
  excalidrawContainer.id = 'excalidraw-container';
  container.innerHTML = '';
  container.appendChild(excalidrawContainer);

  try {
    // 1. Init Excalidraw Core
    console.log('📦 [ExcalidrawInit] Creating ExcalidrawCore...');
    excalidrawInstance = new ExcalidrawCore(excalidrawContainer);
    await excalidrawInstance.init();

    // 2. Init Miro Toolbar
    console.log('🎨 [ExcalidrawInit] Creating MiroToolbar...');
    toolbarInstance = new MiroToolbar(excalidrawInstance);
    toolbarInstance.render();

    // 3. Init Collaboration (optionnel)
    const workspaceId = localStorage.getItem('workspace_id');
    if (workspaceId && window.location.hostname !== 'localhost') {
      console.log('🔗 [ExcalidrawInit] Enabling collaboration...');
      collabInstance = new ExcalidrawCollab(excalidrawInstance, workspaceId);
      collabInstance.connect();
    } else {
      console.log('⚠️  [ExcalidrawInit] Collaboration disabled (localhost or no workspace)');
    }

    // 4. Écouter les changements d'éléments pour broadcast
    if (collabInstance) {
      const originalOnElementsChange = excalidrawInstance.handleMessage.bind(excalidrawInstance);
      excalidrawInstance.handleMessage = function(event) {
        originalOnElementsChange(event);

        // Broadcast si changement local
        if (event.data.type === 'excalidraw:elements-changed') {
          collabInstance.broadcastElements(event.data.data.elements);
        }
      };
    }

    console.log('✅ [ExcalidrawInit] Excalidraw Miro initialized successfully');

    // Afficher message de bienvenue
    showWelcomeMessage();

  } catch (error) {
    console.error('❌ [ExcalidrawInit] Error:', error);
    showErrorMessage(error);
  }
}

/**
 * Détruit l'instance Excalidraw
 */
function destroyExcalidrawMiro() {
  console.log('🗑️  [ExcalidrawInit] Destroying...');

  if (collabInstance) {
    collabInstance.destroy();
    collabInstance = null;
  }

  if (toolbarInstance) {
    toolbarInstance.destroy();
    toolbarInstance = null;
  }

  if (excalidrawInstance) {
    excalidrawInstance.destroy();
    excalidrawInstance = null;
  }

  console.log('✅ [ExcalidrawInit] Destroyed');
}

/**
 * Affiche un message de bienvenue
 */
function showWelcomeMessage() {
  const welcome = document.createElement('div');
  welcome.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 32px 48px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: 10003;
    text-align: center;
    animation: fadeIn 0.5s ease;
  `;

  welcome.innerHTML = `
    <h2 style="margin: 0 0 16px 0; font-size: 32px; color: #050038;">
      🎨 Bienvenue sur Miro Clone
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #6B7280;">
      Canvas collaboratif style Miro powered by Excalidraw
    </p>
    <div style="display: flex; gap: 12px; font-size: 14px; color: #6B7280; justify-content: center;">
      <div><kbd style="padding: 4px 8px; background: #F6F8FA; border-radius: 4px;">V</kbd> Selection</div>
      <div><kbd style="padding: 4px 8px; background: #F6F8FA; border-radius: 4px;">R</kbd> Rectangle</div>
      <div><kbd style="padding: 4px 8px; background: #F6F8FA; border-radius: 4px;">S</kbd> Sticky</div>
      <div><kbd style="padding: 4px 8px; background: #F6F8FA; border-radius: 4px;">T</kbd> Text</div>
    </div>
    <button style="
      margin-top: 24px;
      padding: 12px 32px;
      background: linear-gradient(135deg, #0074E8 0%, #60A5FA 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    " onclick="this.parentElement.remove()">
      Commencer 🚀
    </button>
  `;

  document.body.appendChild(welcome);

  // Auto-fermeture après 10s
  setTimeout(() => {
    if (welcome.parentElement) {
      welcome.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => welcome.remove(), 300);
    }
  }, 10000);
}

/**
 * Affiche un message d'erreur
 */
function showErrorMessage(error) {
  const errorMsg = document.createElement('div');
  errorMsg.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #FFF5F5;
    padding: 32px 48px;
    border-radius: 20px;
    border: 2px solid #FF6F59;
    box-shadow: 0 20px 60px rgba(255, 111, 89, 0.3);
    z-index: 10003;
    text-align: center;
  `;

  errorMsg.innerHTML = `
    <h2 style="margin: 0 0 16px 0; font-size: 28px; color: #FF6F59;">
      ❌ Erreur
    </h2>
    <p style="margin: 0; font-size: 16px; color: #6B7280;">
      ${error.message || 'Une erreur est survenue lors du chargement'}
    </p>
    <button style="
      margin-top: 24px;
      padding: 12px 32px;
      background: #FF6F59;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    " onclick="this.parentElement.remove()">
      Fermer
    </button>
  `;

  document.body.appendChild(errorMsg);
}

// Exposer globalement pour ViewRouter
window.initExcalidrawMiro = initExcalidrawMiro;
window.destroyExcalidrawMiro = destroyExcalidrawMiro;

// Exposer les instances pour debug
window.__excalidraw = {
  core: () => excalidrawInstance,
  toolbar: () => toolbarInstance,
  collab: () => collabInstance
};

console.log('✅ [ExcalidrawInit] Module loaded');
