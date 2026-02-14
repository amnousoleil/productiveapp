/**
 * WHEEL FORCE FIX v1.0
 * Force les événements de molette à fonctionner partout sur la page
 * Problème: Molette ne fonctionne qu'au survol de la scrollbar, pas au milieu de la page
 * Date: 2026-02-14
 */

(function() {
  'use strict';

  console.log('%c🔧 WHEEL FORCE FIX v1.0 - Initialisation', 'font-size: 14px; font-weight: bold; color: #d4af37;');

  // Compteur d'événements pour debug
  let wheelEventCount = 0;
  let blockedEventCount = 0;

  /**
   * Handler global qui force le scroll sur événement wheel
   */
  function forceWheelScroll(e) {
    wheelEventCount++;

    // Log des 5 premiers événements pour debug
    if (wheelEventCount <= 5) {
      console.log(`🖱️ Wheel event #${wheelEventCount}:`, {
        target: e.target.tagName + (e.target.id ? '#' + e.target.id : '') + (e.target.className ? '.' + e.target.className.split(' ')[0] : ''),
        deltaY: e.deltaY,
        deltaMode: e.deltaMode,
        defaultPrevented: e.defaultPrevented
      });
    }

    // Si l'événement est déjà bloqué par un autre script, on force quand même le scroll
    if (e.defaultPrevented) {
      blockedEventCount++;
      console.warn(`⚠️ Événement wheel bloqué par un autre script! (#${blockedEventCount})`);
    }

    // Calculer la quantité de scroll
    let delta = e.deltaY;

    // Si deltaMode === 1 (lignes), multiplier par hauteur de ligne (~40px)
    if (e.deltaMode === 1) {
      delta *= 40;
    }
    // Si deltaMode === 2 (pages), multiplier par hauteur de fenêtre
    else if (e.deltaMode === 2) {
      delta *= window.innerHeight;
    }

    // Trouver l'élément scrollable le plus proche
    let scrollableElement = findScrollableParent(e.target);

    if (scrollableElement) {
      // Scroll l'élément
      scrollableElement.scrollTop += delta;

      // Log uniquement si scroll effectué
      if (wheelEventCount <= 5) {
        console.log(`✅ Scroll appliqué sur:`, scrollableElement.tagName + (scrollableElement.id ? '#' + scrollableElement.id : ''));
      }
    } else {
      // Fallback: scroll window
      window.scrollBy({
        top: delta,
        behavior: 'auto' // Pas smooth pour être réactif
      });

      if (wheelEventCount <= 5) {
        console.log(`✅ Scroll appliqué sur: window`);
      }
    }

    // NE PAS preventDefault pour laisser le comportement natif aussi
    // (double scroll possible mais mieux que pas de scroll du tout)
  }

  /**
   * Trouve le parent scrollable le plus proche
   */
  function findScrollableParent(element) {
    if (!element || element === document.documentElement) {
      return document.documentElement;
    }

    const style = window.getComputedStyle(element);
    const overflowY = style.overflowY;
    const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight;

    if (isScrollable) {
      return element;
    }

    return findScrollableParent(element.parentElement);
  }

  /**
   * Ajoute le listener sur document avec capture=true pour intercepter AVANT les autres
   */
  function init() {
    // Utiliser capture: true pour être le PREMIER à recevoir l'événement
    document.addEventListener('wheel', forceWheelScroll, {
      passive: true, // Ne bloque pas le scroll natif
      capture: true  // Intercepte en phase de capture (avant les autres listeners)
    });

    console.log('✅ Wheel force fix installé (capture mode)');

    // Vérifier après 2 secondes
    setTimeout(() => {
      console.log(`📊 Statistiques après 2s: ${wheelEventCount} événements wheel, ${blockedEventCount} bloqués`);
    }, 2000);
  }

  // Initialiser immédiatement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exposer pour debug
  window.WheelForceFix = {
    stats: () => ({
      wheelEvents: wheelEventCount,
      blockedEvents: blockedEventCount
    }),
    reset: () => {
      wheelEventCount = 0;
      blockedEventCount = 0;
      console.log('📊 Stats réinitialisées');
    }
  };

  console.log('ℹ️  Debug: WheelForceFix.stats() pour voir les statistiques');
})();
