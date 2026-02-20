/**
 * GIRI ACADEMY v1.0
 * Module principal — Orchestrateur de navigation
 * Vues : list | editor | students | stats
 */

const GiriAcademy = (function () {
    'use strict';

    let _container = null;
    let _currentView = 'list';
    let _currentFormation = null;

    // ── Init ────────────────────────────────────────────────

    function init() {
        _container = document.getElementById('view-giri-academy');
        if (!_container) return;

        // Register sub-module handlers
        if (typeof FormationList !== 'undefined') {
            FormationList.setHandlers({
                onEdit: (formation, tab) => _navigate(tab === 'students' ? 'students' : 'editor', formation),
                onStats: (formation) => _navigate('stats', formation),
                onCreate: () => {
                    FormationList.showCreateModal((newFormation) => {
                        _navigate('editor', newFormation);
                    });
                }
            });
        }

        if (typeof FormationEditor !== 'undefined') {
            FormationEditor.setHandlers({
                onBack: () => _navigate('list')
            });
        }

        if (typeof StudentManager !== 'undefined') {
            StudentManager.setHandlers({
                onBack: () => _navigate('list')
            });
        }

        if (typeof FormationStats !== 'undefined') {
            FormationStats.setHandlers({
                onBack: () => _navigate('list')
            });
        }

        _navigate('list');
    }

    // Alias pour ViewRouter
    function refresh() {
        if (!_container) {
            _container = document.getElementById('view-giri-academy');
        }
        if (_container) {
            init();
        }
    }

    // ── Navigation ─────────────────────────────────────────

    function _navigate(view, formation) {
        _currentView = view;
        if (formation) _currentFormation = formation;

        switch (view) {
            case 'list':
                _currentFormation = null;
                _renderList();
                break;
            case 'editor':
                _renderEditor(_currentFormation);
                break;
            case 'students':
                _renderStudents(_currentFormation);
                break;
            case 'stats':
                _renderStats(_currentFormation);
                break;
            default:
                _renderList();
        }
    }

    function _renderList() {
        if (typeof FormationList !== 'undefined') {
            FormationList.render(_container);
        } else {
            _container.innerHTML = _fallback('FormationList');
        }
    }

    function _renderEditor(formation) {
        if (!formation) { _navigate('list'); return; }
        if (typeof FormationEditor !== 'undefined') {
            FormationEditor.render(_container, formation);
        } else {
            _container.innerHTML = _fallback('FormationEditor');
        }
    }

    function _renderStudents(formation) {
        if (!formation) { _navigate('list'); return; }
        if (typeof StudentManager !== 'undefined') {
            StudentManager.render(_container, formation);
        } else {
            _container.innerHTML = _fallback('StudentManager');
        }
    }

    function _renderStats(formation) {
        if (!formation) { _navigate('list'); return; }
        if (typeof FormationStats !== 'undefined') {
            FormationStats.render(_container, formation);
        } else {
            _container.innerHTML = _fallback('FormationStats');
        }
    }

    function _fallback(moduleName) {
        return `<div class="academy-empty" style="padding:80px 24px">
            <div class="academy-empty-icon">⚠️</div>
            <h2 class="academy-empty-title">Module non chargé</h2>
            <p class="academy-empty-desc">${moduleName} n'est pas disponible.</p>
        </div>`;
    }

    return { init, refresh };
})();

if (typeof window !== 'undefined') window.GiriAcademy = GiriAcademy;
