/**
 * Theme Favorites v1.0
 * Système d'étoiles favoris pour les thèmes
 * - Étoile ⭐ sur chaque carte thème (toggle favori)
 * - Section "Mes Favoris" en haut du modal
 * - Persistance localStorage
 */

const ThemeFavorites = (function() {
    'use strict';

    const STORAGE_KEY = 'tf_favorites';
    let favorites = [];

    function load() {
        try {
            favorites = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch(_) { favorites = []; }
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }

    function isFav(themeId) {
        return favorites.includes(themeId);
    }

    function toggle(themeId) {
        const idx = favorites.indexOf(themeId);
        if (idx === -1) favorites.push(themeId);
        else favorites.splice(idx, 1);
        save();
        _refreshAll(themeId);
        _renderFavSection();
    }

    // ── DOM helpers ─────────────────────────────────────────────────────
    function _addStarsToCards() {
        document.querySelectorAll('.theme-card').forEach(card => {
            if (card.querySelector('.tf-star')) return; // déjà fait
            const themeId = card.dataset.theme;
            if (!themeId) return;

            const star = document.createElement('button');
            star.className = 'tf-star';
            star.dataset.theme = themeId;
            star.title = isFav(themeId) ? 'Retirer des favoris' : 'Ajouter aux favoris';
            star.innerHTML = isFav(themeId) ? '★' : '☆';
            star.setAttribute('aria-label', 'Favori');

            star.addEventListener('click', (e) => {
                e.stopPropagation();
                toggle(themeId);
            });

            card.appendChild(star);
        });
    }

    function _refreshAll(changedId) {
        // Met à jour toutes les étoiles du thème modifié
        document.querySelectorAll(`.tf-star[data-theme="${changedId}"]`).forEach(star => {
            const active = isFav(changedId);
            star.innerHTML = active ? '★' : '☆';
            star.title = active ? 'Retirer des favoris' : 'Ajouter aux favoris';
            star.classList.toggle('active', active);
        });
        document.querySelectorAll(`.theme-card[data-theme="${changedId}"]`).forEach(card => {
            card.classList.toggle('tf-is-favorite', isFav(changedId));
        });
    }

    function _renderFavSection() {
        const modalBox = document.querySelector('#theme-modal .modal-box');
        if (!modalBox) return;

        // Supprimer section précédente
        const old = modalBox.querySelector('.tf-favorites-section');
        if (old) old.remove();

        if (!favorites.length) return;

        // Cloner les cartes des favoris
        const section = document.createElement('div');
        section.className = 'tf-favorites-section theme-category';
        section.innerHTML = `
            <h4 class="category-title tf-fav-title">⭐ Mes Favoris</h4>
            <p class="category-desc">Vos thèmes préférés</p>
            <div class="theme-grid tf-fav-grid" id="tf-fav-grid"></div>
        `;
        // Insérer avant la première catégorie
        const firstCat = modalBox.querySelector('.theme-category');
        if (firstCat) modalBox.insertBefore(section, firstCat);
        else modalBox.appendChild(section);

        // Ajouter les cartes clonées
        const grid = section.querySelector('#tf-fav-grid');
        favorites.forEach(themeId => {
            const original = document.querySelector(`.theme-card[data-theme="${themeId}"]:not(.tf-fav-clone)`);
            if (!original) return;
            const clone = original.cloneNode(true);
            clone.classList.add('tf-fav-clone');
            // Étoile sur le clone aussi
            const cloneStar = clone.querySelector('.tf-star');
            if (cloneStar) {
                cloneStar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggle(themeId);
                });
            }
            // Clic sur clone → set theme
            clone.addEventListener('click', () => {
                if (window.Themes) window.Themes.setTheme(themeId);
                document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
                document.querySelectorAll(`.theme-card[data-theme="${themeId}"]`).forEach(c => c.classList.add('active'));
            });
            grid.appendChild(clone);
        });
    }

    // ── CSS injecté ─────────────────────────────────────────────────────
    function _injectCSS() {
        if (document.getElementById('tf-styles')) return;
        const style = document.createElement('style');
        style.id = 'tf-styles';
        style.textContent = `
            /* Étoile favori sur chaque carte thème */
            .theme-card { position: relative; }
            .tf-star {
                position: absolute;
                top: 6px;
                right: 6px;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                background: rgba(0,0,0,0.55);
                backdrop-filter: blur(6px);
                border: 1px solid rgba(255,255,255,0.2);
                color: rgba(255,255,255,0.55);
                font-size: 14px;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 5;
                padding: 0;
            }
            .tf-star:hover {
                transform: scale(1.2);
                background: rgba(0,0,0,0.8);
                color: #fbbf24;
                border-color: #fbbf24;
            }
            .tf-star.active,
            .tf-star.active:hover {
                background: linear-gradient(135deg, #f59e0b, #f97316);
                border-color: #fbbf24;
                color: #fff;
            }

            /* Section favoris */
            .tf-favorites-section {
                border-bottom: 1px solid rgba(255,255,255,0.08);
                padding-bottom: 20px;
                margin-bottom: 8px;
            }
            .tf-fav-title {
                background: linear-gradient(135deg, #fbbf24, #f97316);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            /* Carte favorite surlignée subtilement */
            .theme-card.tf-is-favorite::after {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: inherit;
                border: 2px solid rgba(251,191,36,0.4);
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    // ── INIT ────────────────────────────────────────────────────────────
    function init() {
        load();
        _injectCSS();

        // Observer le modal thème pour ajouter les étoiles à l'ouverture
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                // Attendre que le modal soit affiché
                setTimeout(() => {
                    _addStarsToCards();
                    _renderFavSection();
                    // Marquer cartes favoris
                    favorites.forEach(id => {
                        document.querySelectorAll(`.theme-card[data-theme="${id}"]`).forEach(c => {
                            c.classList.add('tf-is-favorite');
                        });
                    });
                }, 80);
            });
        }

        // Aussi au cas où le modal s'ouvre autrement
        const themeModal = document.getElementById('theme-modal');
        if (themeModal) {
            const obs = new MutationObserver((mutations) => {
                for (const m of mutations) {
                    if (m.target.classList.contains('hidden')) continue;
                    _addStarsToCards();
                    _renderFavSection();
                }
            });
            obs.observe(themeModal, { attributes: true, attributeFilter: ['class'] });
        }
    }

    return { init, toggle, isFav };
})();

if (typeof window !== 'undefined') {
    window.ThemeFavorites = ThemeFavorites;
    // Auto-init après DOM prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ThemeFavorites.init());
    } else {
        ThemeFavorites.init();
    }
}
