/**
 * WHEEL UNBLOCK v1.0 - NUCLEAR OPTION
 * Désactive TOUS les preventDefault() sur les événements wheel
 * Force le scroll molette à fonctionner PARTOUT, toujours
 * Date: 2026-02-14
 */

(function() {
  'use strict';

  console.log('%c☢️  WHEEL UNBLOCK v1.0 - OPTION NUCLÉAIRE', 'font-size: 16px; font-weight: bold; color: #ff6b6b; background: #000; padding: 4px 8px;');

  let interceptedCount = 0;
  let preventedCount = 0;

  /**
   * Override de Event.prototype.preventDefault pour les wheel events
   */
  const originalPreventDefault = Event.prototype.preventDefault;

  Event.prototype.preventDefault = function() {
    // Si c'est un événement wheel, NE PAS bloquer (sauf dans certains cas légitimes)
    if (this.type === 'wheel' || this.type === 'mousewheel' || this.type === 'DOMMouseScroll') {

      // Exception: permettre preventDefault si c'est dans un canvas ou zone de zoom spécifique
      const target = this.target;
      const isCanvas = target.tagName === 'CANVAS';
      const isInModal = target.closest('.modal-content, .crop-modal, [class*="modal"]');
      const isZoomWidget = target.closest('[class*="zoom"], [class*="crop"]');

      if (isCanvas || isInModal || isZoomWidget) {
        // Cas légitimes: canvas 3D, modal de crop photo, etc.
        preventedCount++;
        console.log(`⚠️  preventDefault AUTORISÉ sur wheel (#${preventedCount}) pour:`, {
          element: target.tagName + (target.id ? '#' + target.id : ''),
          reason: isCanvas ? 'canvas' : isInModal ? 'modal' : 'zoom'
        });
        originalPreventDefault.call(this);
      } else {
        // BLOQUER le preventDefault pour permettre le scroll
        interceptedCount++;
        console.warn(`🚫 preventDefault BLOQUÉ sur wheel! (#${interceptedCount})`, {
          target: target.tagName + (target.id ? '#' + target.id : '') + (target.className ? '.' + target.className.split(' ')[0] : ''),
          stackTrace: new Error().stack.split('\n')[2]
        });
        // NE PAS appeler originalPreventDefault
        return;
      }
    } else {
      // Pour les autres événements, comportement normal
      originalPreventDefault.call(this);
    }
  };

  /**
   * Intercepte aussi stopPropagation sur wheel events
   */
  const originalStopPropagation = Event.prototype.stopPropagation;

  Event.prototype.stopPropagation = function() {
    if (this.type === 'wheel' || this.type === 'mousewheel' || this.type === 'DOMMouseScroll') {
      console.warn(`🚫 stopPropagation BLOQUÉ sur wheel!`, {
        target: this.target.tagName + (this.target.id ? '#' + this.target.id : '')
      });
      // NE PAS bloquer la propagation pour que le scroll fonctionne
      return;
    }
    originalStopPropagation.call(this);
  };

  /**
   * Force le scroll natif du navigateur
   */
  function enableNativeScroll() {
    // S'assurer que tous les éléments peuvent recevoir les événements wheel
    document.body.style.pointerEvents = 'auto';
    document.documentElement.style.pointerEvents = 'auto';

    // Désactiver touch-action: none qui pourrait bloquer
    const style = document.createElement('style');
    style.textContent = `
      * {
        touch-action: auto !important;
      }
      body, html, .main-content, .view-container, [id^="view-"] {
        overscroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);

    console.log('✅ Native scroll forcé sur body/html');
  }

  /**
   * Moniteur d'événements wheel pour debug
   */
  function monitorWheelEvents() {
    let lastWheelTime = 0;
    let wheelCounter = 0;

    window.addEventListener('wheel', function(e) {
      wheelCounter++;
      const now = Date.now();

      // Log uniquement les 10 premiers événements
      if (wheelCounter <= 10) {
        console.log(`🖱️  Wheel event #${wheelCounter}:`, {
          target: e.target.tagName + (e.target.id ? '#' + e.target.id : ''),
          deltaY: e.deltaY,
          defaultPrevented: e.defaultPrevented,
          propagationStopped: e.cancelBubble,
          timeSinceLastWheel: now - lastWheelTime + 'ms'
        });
      }

      lastWheelTime = now;
    }, { passive: true, capture: true });
  }

  /**
   * Polyfill pour forcer smooth scrolling
   */
  function enhanceSmoothScroll() {
    // Override window.scroll et scrollTo pour accepter les objets behavior
    const originalWindowScroll = window.scroll;
    const originalWindowScrollTo = window.scrollTo;

    window.scroll = window.scrollTo = function(x, y) {
      if (typeof x === 'object') {
        // Support moderne: { top, left, behavior }
        const options = x;
        const targetTop = options.top || 0;
        const targetLeft = options.left || 0;
        const behavior = options.behavior || 'auto';

        if (behavior === 'smooth') {
          // Smooth scroll avec animation
          const startTop = window.pageYOffset || document.documentElement.scrollTop;
          const startLeft = window.pageXOffset || document.documentElement.scrollLeft;
          const distanceTop = targetTop - startTop;
          const distanceLeft = targetLeft - startLeft;
          const duration = 300;
          const startTime = performance.now();

          function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easing = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            window.scrollTo(
              startLeft + distanceLeft * easing,
              startTop + distanceTop * easing
            );

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }

          requestAnimationFrame(animate);
        } else {
          originalWindowScrollTo.call(window, targetLeft, targetTop);
        }
      } else {
        // Ancienne syntaxe: scrollTo(x, y)
        originalWindowScrollTo.call(window, x, y);
      }
    };
  }

  // Initialisation
  function init() {
    enableNativeScroll();
    monitorWheelEvents();
    enhanceSmoothScroll();

    console.log('✅ Wheel unblock installé - preventDefault désactivé sur wheel events');
    console.log('ℹ️  Exceptions: Canvas, Modals, Widgets zoom');

    // Stats après 3 secondes
    setTimeout(() => {
      console.log(`📊 Statistiques Wheel Unblock:`, {
        'preventDefault bloqués': interceptedCount,
        'preventDefault autorisés (exceptions)': preventedCount
      });
    }, 3000);
  }

  // Démarrer IMMÉDIATEMENT (avant tout autre script)
  init();

  // Exposer pour debug
  window.WheelUnblock = {
    stats: () => ({
      intercepted: interceptedCount,
      prevented: preventedCount
    }),
    reset: () => {
      interceptedCount = 0;
      preventedCount = 0;
      console.log('📊 Stats réinitialisées');
    }
  };

  console.log('ℹ️  Debug: WheelUnblock.stats() pour voir les statistiques');
})();
