/**
 * SCROLL BRUTAL FIX v1.0 - SOLUTION ULTIME
 * Force le scroll molette PARTOUT sans exception
 * Méthode: Intercepte wheel AVANT tout autre script et force scrollBy() directement
 * Date: 2026-02-14
 */

(function() {
  'use strict';

  console.log('%c⚡ SCROLL BRUTAL FIX v1.0 - DÉMARRAGE IMMÉDIAT', 'font-size: 18px; font-weight: bold; color: #00ff00; background: #000; padding: 8px;');

  let scrollCount = 0;
  let forceScrollCount = 0;

  /**
   * Handler wheel ultra-prioritaire
   * S'exécute AVANT tout autre listener grâce à capture: true
   */
  function brutalWheelHandler(e) {
    scrollCount++;

    // Calculer delta de scroll
    let deltaY = e.deltaY;
    let deltaX = e.deltaX;

    // Normaliser selon deltaMode
    if (e.deltaMode === 1) { // Lignes
      deltaY *= 40;
      deltaX *= 40;
    } else if (e.deltaMode === 2) { // Pages
      deltaY *= window.innerHeight;
      deltaX *= window.innerWidth;
    }

    // FORCER le scroll sur window IMMÉDIATEMENT
    window.scrollBy({
      top: deltaY,
      left: 0, // Pas de scroll horizontal
      behavior: 'auto' // Pas smooth pour être instantané
    });

    forceScrollCount++;

    // Log uniquement les 3 premiers pour ne pas spammer
    if (scrollCount <= 3) {
      console.log(`🖱️ Scroll #${scrollCount}: deltaY=${e.deltaY} → Force scroll window by ${deltaY}px`);
    }

    // NE PAS preventDefault pour ne pas casser d'autres fonctionnalités
    // Le double scroll est préférable au pas de scroll du tout
  }

  /**
   * Installation du handler avec PRIORITÉ MAXIMALE
   */
  function install() {
    // Utiliser addEventListener avec:
    // - capture: true (phase de capture, AVANT bubble phase)
    // - passive: false (permet preventDefault si besoin)
    window.addEventListener('wheel', brutalWheelHandler, {
      capture: true,
      passive: false
    });

    // Aussi sur document pour être sûr
    document.addEventListener('wheel', brutalWheelHandler, {
      capture: true,
      passive: false
    });

    console.log('✅ Brutal wheel handler installé (capture mode, priorité maximale)');
    console.log('ℹ️ Le scroll est maintenant FORCÉ sur TOUTES les pages');

    // Stats après 2 secondes
    setTimeout(() => {
      if (scrollCount > 0) {
        console.log(`📊 Brutal Scroll Stats: ${scrollCount} événements wheel, ${forceScrollCount} scrolls forcés`);
      }
    }, 2000);
  }

  // INSTALLER IMMÉDIATEMENT (synchrone, pas d'attente DOMContentLoaded)
  install();

  // Exposer pour debug
  window.ScrollBrutalFix = {
    stats: () => ({
      wheelEvents: scrollCount,
      forcedScrolls: forceScrollCount
    }),
    reset: () => {
      scrollCount = 0;
      forceScrollCount = 0;
      console.log('📊 Stats réinitialisées');
    },
    disable: () => {
      window.removeEventListener('wheel', brutalWheelHandler, { capture: true });
      document.removeEventListener('wheel', brutalWheelHandler, { capture: true });
      console.log('❌ Brutal scroll fix désactivé');
    }
  };

  console.log('ℹ️ Debug: ScrollBrutalFix.stats() | ScrollBrutalFix.disable()');
})();
