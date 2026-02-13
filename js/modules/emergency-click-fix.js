/**
 * EMERGENCY CLICK FIX v2.0
 * Fixes phantom overlays blocking all interactions
 * ALSO REMOVES CANVAS #matrix-bg (écran noir fix)
 * Runs on DOMContentLoaded to clean up invisible blocking elements
 */

(function() {
  console.log('🔧 EmergencyClickFix v2.0: Initializing...');

  function removePhantomOverlays() {
    console.log('🔍 Scanning for phantom overlays...');

    let removed = 0;

    // 0. FORCE REMOVE CANVAS #matrix-bg (écran noir fix)
    const canvas = document.getElementById('matrix-bg');
    if (canvas) {
      console.warn('❌ Canvas #matrix-bg trouvé - SUPPRESSION FORCÉE');
      canvas.remove();
      removed++;
      console.log('✅ Canvas #matrix-bg supprimé définitivement');
    } else {
      console.log('✅ Canvas #matrix-bg absent (OK)');
    }

    // 1. Remove all invisible modal overlays that might be blocking
    const allElements = document.querySelectorAll('*');

    allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      const zIndex = parseInt(style.zIndex) || 0;
      const position = style.position;
      const opacity = parseFloat(style.opacity);
      const display = style.display;
      const visibility = style.visibility;

      // Detect phantom blockers: high z-index, fixed/absolute, invisible but display:block
      const isPhantomBlocker =
        zIndex > 100 &&
        (position === 'fixed' || position === 'absolute') &&
        display !== 'none' &&
        visibility !== 'hidden' &&
        opacity < 0.01 &&
        !el.classList.contains('main-content') &&
        !el.classList.contains('sidebar');

      if (isPhantomBlocker) {
        console.warn('⚠️ Found phantom blocker:', {
          element: el.tagName,
          id: el.id,
          classes: el.className,
          zIndex,
          position,
          opacity
        });

        // Force remove it
        el.style.display = 'none';
        el.style.pointerEvents = 'none';
        el.remove();
        removed++;
      }
    });

    // 2. Force remove common modal overlay selectors that might be stuck
    const commonOverlays = [
      '.modal-overlay',
      '.auth-overlay',
      '[class*="overlay"]'
    ];

    commonOverlays.forEach(selector => {
      const overlays = document.querySelectorAll(selector);
      overlays.forEach(overlay => {
        const style = window.getComputedStyle(overlay);
        if (style.display !== 'none' && style.position === 'fixed') {
          console.warn(`⚠️ Removing stuck overlay: ${selector}`);
          overlay.remove();
          removed++;
        }
      });
    });

    // 3. Ensure sidebar is clickable
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.style.pointerEvents = 'auto';
      sidebar.style.zIndex = '1000'; // Ensure it's above most things
      console.log('✅ Sidebar pointer-events restored');
    }

    // 4. Ensure main content is clickable
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.pointerEvents = 'auto';
      console.log('✅ Main content pointer-events restored');
    }

    // 5. Ensure view containers are clickable
    const viewContainers = document.querySelectorAll('.view-container');
    viewContainers.forEach(view => {
      view.style.pointerEvents = 'auto';
    });
    console.log(`✅ ${viewContainers.length} view containers pointer-events restored`);

    console.log(`✅ EmergencyClickFix: Removed ${removed} phantom blockers`);
  }

  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(removePhantomOverlays, 500);
    });
  } else {
    setTimeout(removePhantomOverlays, 500);
  }

  // Run again after window load (in case elements are added late)
  window.addEventListener('load', () => {
    setTimeout(removePhantomOverlays, 1000);
  });

  // Expose global function for manual triggering
  window.fixClicks = removePhantomOverlays;

  console.log('✅ EmergencyClickFix: Loaded (use window.fixClicks() to manually trigger)');
})();
