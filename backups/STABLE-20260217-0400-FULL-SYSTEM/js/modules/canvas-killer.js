/**
 * CANVAS KILLER v1.0
 * Supprime IMMÉDIATEMENT le canvas #matrix-bg dès qu'il apparaît
 * Bloque toute tentative de recréation
 */

(function() {
  console.log('🔫 CanvasKiller: Activated - Will destroy canvas on sight');

  // Compteur de suppressions
  let killCount = 0;

  // Fonction pour tuer le canvas
  function killCanvas(source) {
    const canvas = document.getElementById('matrix-bg');
    if (canvas) {
      killCount++;
      console.warn(`🔫 CanvasKiller: Destroying canvas (kill #${killCount}) - Source: ${source}`);

      // Triple kill
      canvas.style.display = 'none';
      canvas.style.opacity = '0';
      canvas.style.visibility = 'hidden';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '-9999';
      canvas.remove();

      console.log(`✅ Canvas destroyed (total kills: ${killCount})`);
      return true;
    }
    return false;
  }

  // 1. Kill immédiat (avant DOM ready)
  killCanvas('immediate-inline');

  // 2. Kill au DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      killCanvas('DOMContentLoaded');
    });
  } else {
    killCanvas('already-loaded');
  }

  // 3. Kill après window.load
  window.addEventListener('load', () => {
    killCanvas('window.load');
  });

  // 4. Kill toutes les 100ms pendant 5 secondes (mode agressif)
  let intervalCount = 0;
  const killInterval = setInterval(() => {
    intervalCount++;
    killCanvas(`interval-${intervalCount}`);

    if (intervalCount >= 50) { // 50 x 100ms = 5 secondes
      clearInterval(killInterval);
      console.log('🔫 CanvasKiller: Aggressive mode ended');
    }
  }, 100);

  // 5. MutationObserver - surveille les nouvelles créations
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        // Canvas ajouté directement
        if (node.id === 'matrix-bg') {
          console.error('🚨 CanvasKiller: Canvas creation detected!');
          killCanvas('MutationObserver-direct');
        }

        // Canvas dans un sous-élément
        if (node.querySelector && node.querySelector('#matrix-bg')) {
          console.error('🚨 CanvasKiller: Canvas in child element!');
          killCanvas('MutationObserver-child');
        }
      });
    });
  });

  // Observer tout le body
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    console.log('✅ CanvasKiller: MutationObserver active');
  } else {
    // Body pas encore créé, attendre
    setTimeout(() => {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      console.log('✅ CanvasKiller: MutationObserver active (delayed)');
    }, 10);
  }

  // 6. Intercepter document.createElement pour bloquer la création
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function(tagName, options) {
    const element = originalCreateElement(tagName, options);

    // Si c'est un canvas avec l'ID matrix-bg, le saboter
    if (tagName.toLowerCase() === 'canvas') {
      // Intercepter l'attribution de l'ID
      const originalSetAttribute = element.setAttribute.bind(element);
      element.setAttribute = function(name, value) {
        if (name === 'id' && value === 'matrix-bg') {
          console.error('🚨 CanvasKiller: BLOCKED canvas creation attempt via createElement!');
          // Retourner sans rien faire
          return;
        }
        return originalSetAttribute(name, value);
      };

      // Intercepter l'affectation directe de .id
      Object.defineProperty(element, 'id', {
        set: function(value) {
          if (value === 'matrix-bg') {
            console.error('🚨 CanvasKiller: BLOCKED canvas ID assignment!');
            return; // Bloquer
          }
          // Autoriser les autres IDs
          originalSetAttribute('id', value);
        },
        get: function() {
          return element.getAttribute('id');
        }
      });
    }

    return element;
  };
  console.log('✅ CanvasKiller: createElement intercepted');

  // 7. Fonction globale pour kill manuel
  window.killCanvas = () => {
    const killed = killCanvas('manual-call');
    if (!killed) {
      console.log('ℹ️ No canvas found to kill');
    }
    console.log(`📊 Total kills: ${killCount}`);
  };

  // 8. Kill final après 10 secondes (dernière chance)
  setTimeout(() => {
    killCanvas('final-sweep-10s');
    console.log(`🔫 CanvasKiller: Final report - Total canvas kills: ${killCount}`);
  }, 10000);

  console.log('✅ CanvasKiller: Fully armed and operational');
})();
