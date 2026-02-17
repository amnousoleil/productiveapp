/**
 * SCROLL DIAGNOSTIC v1.0
 * Vérifie que le scroll molette fonctionne sur tous les éléments critiques
 * Date: 2026-02-14
 */

(function() {
  'use strict';

  console.log('%c🔍 SCROLL DIAGNOSTIC v1.0', 'font-size: 16px; font-weight: bold; color: #d4af37;');
  console.log('═'.repeat(60));

  // Liste des éléments à vérifier
  const elementsToCheck = [
    { selector: 'html', name: 'HTML' },
    { selector: 'body', name: 'BODY' },
    { selector: '.main-content', name: 'Main Content' },
    { selector: '.view-container', name: 'View Container' },
    { selector: '#view-dashboard', name: 'Dashboard View' },
    { selector: '#view-tasks', name: 'Tasks View' },
    { selector: '#view-notes', name: 'Notes View' },
    { selector: '#view-projects', name: 'Projects View' }
  ];

  const results = [];

  elementsToCheck.forEach(({ selector, name }) => {
    const element = document.querySelector(selector);

    if (!element) {
      results.push({
        name,
        exists: false,
        status: '❌ ABSENT'
      });
      return;
    }

    const styles = window.getComputedStyle(element);
    const overflowY = styles.overflowY;
    const overflowX = styles.overflowX;
    const height = element.offsetHeight;
    const scrollHeight = element.scrollHeight;
    const canScroll = scrollHeight > height;

    const status = overflowY === 'auto' || overflowY === 'scroll'
      ? '✅ SCROLL ACTIF'
      : '❌ BLOQUÉ';

    results.push({
      name,
      exists: true,
      overflowY,
      overflowX,
      height: `${height}px`,
      scrollHeight: `${scrollHeight}px`,
      canScroll,
      status
    });
  });

  // Affichage des résultats
  console.table(results);

  // Résumé
  const blocked = results.filter(r => r.status === '❌ BLOQUÉ' || r.status === '❌ ABSENT');
  const active = results.filter(r => r.status === '✅ SCROLL ACTIF');

  console.log('═'.repeat(60));
  console.log(`%c📊 RÉSUMÉ`, 'font-size: 14px; font-weight: bold; color: #d4af37;');
  console.log(`   Scroll actif: ${active.length}/${results.length}`);
  console.log(`   Bloqués: ${blocked.length}/${results.length}`);

  if (blocked.length > 0) {
    console.log('%c⚠️  PROBLÈMES DÉTECTÉS:', 'color: #ff6b6b; font-weight: bold;');
    blocked.forEach(item => {
      console.log(`   - ${item.name}: ${item.status}`);
    });
  } else {
    console.log('%c✅ AUCUN PROBLÈME - Scroll molette devrait fonctionner partout!', 'color: #51cf66; font-weight: bold;');
  }

  console.log('═'.repeat(60));

  // Test de scroll programmé
  console.log('%c🎯 TEST DE SCROLL AUTOMATIQUE', 'font-size: 14px; font-weight: bold; color: #d4af37;');

  const testScroll = () => {
    const body = document.body;
    const initialScroll = body.scrollTop || window.scrollY;

    // Scroll de 100px
    window.scrollTo({ top: initialScroll + 100, behavior: 'smooth' });

    setTimeout(() => {
      const newScroll = body.scrollTop || window.scrollY;
      const scrolled = newScroll !== initialScroll;

      if (scrolled) {
        console.log(`%c✅ Scroll fonctionne! Position: ${initialScroll}px → ${newScroll}px`, 'color: #51cf66;');
      } else {
        console.log(`%c❌ Scroll bloqué! Position reste: ${initialScroll}px`, 'color: #ff6b6b;');
      }

      // Retour position initiale
      setTimeout(() => {
        window.scrollTo({ top: initialScroll, behavior: 'smooth' });
      }, 500);
    }, 600);
  };

  // Lancer le test après 1 seconde
  setTimeout(testScroll, 1000);

  // Exposer globalement pour tests manuels
  window.ScrollDiagnostic = {
    run: () => {
      console.clear();
      location.reload();
    },
    check: () => {
      console.table(results);
    }
  };

  console.log('%cℹ️  Pour relancer: ScrollDiagnostic.run()', 'color: #74c0fc;');
  console.log('═'.repeat(60));
})();
