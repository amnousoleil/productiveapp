// fast-loader.js v1.2 - ULTRA PERFORMANCE LOADING SYSTEM 🚀
// Loads modules in 3 phases: Critical → Immediate → Lazy

const FastLoader = {
    loaded: new Set(),
    loading: new Map(),
    phase: 'critical',

    // ============================================================================
    // PHASE 1: CRITICAL (< 500ms) - Only essentials for login/auth
    // ============================================================================
    critical: [
        // Core
        'js/modules/config.js',
        'js/modules/state.js',
        'js/modules/utils.js',

        // Auth (essential for login)
        'js/modules/auth/auth.js',
        'js/modules/auth/login.js',

        // Router (essential for navigation)
        'js/modules/router.js',

        // Minimal CSS
        'css/style-base.css',
        'css/style-themes.css'
    ],

    // ============================================================================
    // PHASE 2: IMMEDIATE (< 1.5s) - Dashboard & basic UI after login
    // ============================================================================
    immediate: [
        // Sidebar (needed right after login)
        'js/modules/sidebar/sidebar-core.js',
        'js/modules/sidebar/sidebar-render.js',

        // Dashboard (first view)
        'js/modules/dashboard/dashboard.js',

        // External libs (loaded early for modules that need them)
        'https://cdn.jsdelivr.net/npm/marked/marked.min.js',

        // Light animations only
        'css/style-sidebar.css',
        'css/style-views.css'
    ],

    // ============================================================================
    // PHASE 3: LAZY - Load on demand when user navigates
    // ============================================================================
    lazyModules: {
        'tasks': [
            'js/modules/tasks/tasks.js',
            'js/modules/tasks/api-tasks.js',
            'css/modules/task-popup.css',
            'css/tasks-2.0-supreme.css',
            'js/modules/tasks/tasks-2.0-supreme.js',
            'js/modules/tasks/tasks-legacy-override.js'
        ],
        'notes': [
            // Core modules
            'js/modules/notes/notes-core.js',
            'js/modules/services/api-notes.js',
            'js/modules/notes/notes-render.js',
            'js/modules/notes/notes-editor.js',
            'js/modules/notes/notes-sidebar.js',
            'js/modules/notes/notes-markdown.js',
            'js/modules/notes/notes-search.js',
            'js/modules/notes/notes-ai-cluster.js',
            // v6.0 World Class System
            'js/modules/notes/notes-wiki-links.js',
            'js/modules/notes/notes-tags-view.js',
            'js/modules/notes/notes-daily-view.js',
            'js/modules/notes/notes-backlinks-panel.js',
            'js/modules/notes/notes-ai-bridge.js',
            'js/modules/notes/notes-command-palette.js',
            'js/modules/notes/notes-layout-v6.js',
            'js/modules/notes/notes-init.js',
            // CSS
            'css/modules/notes.css',
            'css/modules/notes-markdown.css',
            'css/modules/notes-search.css',
            // v6.0 CSS
            'css/notes-layout-v6.css',
            'css/notes-command-palette.css',
            'css/notes-components-v6.css'
        ],
        'projects': [
            'js/modules/projects/projects.js',
            'js/modules/projects/projects-view.js',
            'js/modules/projects/api-projects.js',
            'css/projects.css'
        ],
        'canvas': [
            'js/modules/canvas/canvas.js',
            'js/modules/canvas/canvas-data.js',
            'js/modules/canvas/canvas-render.js',
            'css/modules/canvas.css'
        ],
        'galaxy': [
            // Lightweight 2D galaxy view type Miro (90KB total)
            'assets/vendor/rough.min.js',  // Style hand-drawn Excalidraw
            'js/modules/services/api-galaxy.js',  // Backend PostgreSQL
            'css/galaxy.css',  // Styles premium
            'css/galaxy-properties-panel.css',  // Panneau de propriétés type Figma
            'js/galaxy.js',  // Engine principal
            'js/modules/galaxy/galaxy-properties-panel.js',  // Panneau de propriétés
            'js/galaxy-constellation.js',
            'js/modules/canvases/galaxie-view.js',
            'js/modules/canvases/galaxie-styles.js'
        ],
        'galaxy3d': [
            // Heavy 3D engine - only load if user explicitly switches to 3D mode
            'js/lib/three/three.min.js',
            'js/lib/three/OrbitControls.js',
            'js/lib/three/EffectComposer.js',
            'js/lib/three/RenderPass.js',
            'js/lib/three/UnrealBloomPass.js',
            'js/lib/three/LuminosityHighPassShader.js',
            'js/lib/three/CopyShader.js',
            'js/modules/canvases/galaxy-3d.js',
            'js/modules/canvases/galaxy-ai.js'
        ],
        'excalidraw': [
            // Excalidraw Miro clone - only when galaxy view opens (64KB)
            'css/modules/excalidraw-miro.css',
            'js/modules/excalidraw/excalidraw-core.js',
            'js/modules/excalidraw/excalidraw-toolbar.js',
            'js/modules/excalidraw/excalidraw-collab.js',
            'js/modules/excalidraw/excalidraw-init.js'
        ],
        'giriVision': [
            // Giri Vision AI Assistant - only when user opens assistant (132KB)
            'css/giri-vision-chat.css',
            'css/modules/giri-vision-modals.css',
            'js/modules/giri-vision/giri-security.js',
            'js/modules/giri-vision/giri-permissions-manager.js',
            'js/modules/giri-vision/giri-connection-manager.js',
            'js/modules/giri-vision/giri-keyboard-shortcuts.js',
            'js/modules/giri-vision/giri-vision.js'
        ],
        'accounting': [
            'js/modules/accounting/accounting.js',
            'js/modules/accounting/accounting-api.js'
        ],
        'gamification': [
            'js/modules/gamification/gamification-api.js',
            'js/modules/gamification/xp-feedback.js',
            'css/xp-feedback.css'
        ],
        'animations': [
            'js/animations.js?v=5101',
            'css/animations.css?v=5100'
        ],
        'admin': [
            'js/modules/admin/admin-api.js',
            'js/modules/admin/admin-view.js',
            'js/modules/admin/admin-errors.js',
            'js/modules/admin/admin-enhanced.js',
            'css/admin.css'
        ],
        'configDev': [
            'js/modules/config-dev/config-dev-api.js',
            'js/modules/config-dev/config-dev-view.js',
            'js/modules/config-dev/config-enhanced.js',
            'css/config-dev.css'
        ],
        'calendar': [
            'js/modules/calendar/calendar-api.js',
            'js/modules/calendar/calendar-view.js',
            'js/modules/calendar/calendar-agent.js',
            'css/calendar-view.css'
        ],
        'teamMessaging': [
            // CSS
            'css/messaging.css?v=1700',
            'css/messaging-animations.css?v=3000',
            // Core messaging
            'js/modules/messaging/messaging-api.js?v=1700',
            'js/modules/messaging/messaging-ui.js?v=1800',
            'js/modules/messaging/messaging-conversations.js?v=1800',
            'js/modules/messaging/messaging-chat.js?v=1700',
            'js/modules/messaging/messaging-events.js?v=1700',
            'js/modules/messaging/messaging-notifications.js?v=1700',
            // TeamTalk Pro v3.0
            'js/modules/messaging/messaging-presence.js?v=3000',
            'js/modules/messaging/messaging-email.js?v=3000',
            'js/modules/messaging/messaging-animations.js?v=3000',
            'js/modules/messaging/messaging-workspace.js?v=3000',
            // Main orchestrator
            'js/modules/messaging/messaging.js?v=1700'
        ]
    },

    // ============================================================================
    // SMART LOADER
    // ============================================================================
    async loadPhase(phase) {
        const startTime = performance.now();
        const files = this[phase] || [];

        console.log(`⚡ Loading ${phase} phase (${files.length} files)...`);

        const promises = files.map(file => this.loadFile(file));
        await Promise.all(promises);

        const duration = (performance.now() - startTime).toFixed(0);
        console.log(`✅ ${phase} phase loaded in ${duration}ms`);

        this.phase = phase;
        window.dispatchEvent(new CustomEvent('phaseLoaded', { detail: { phase, duration } }));
    },

    async loadFile(path) {
        // Skip if already loaded
        if (this.loaded.has(path)) {
            return Promise.resolve();
        }

        // Wait if already loading
        if (this.loading.has(path)) {
            return this.loading.get(path);
        }

        // Create load promise
        const promise = new Promise((resolve, reject) => {
            const ext = path.split('.').pop();

            if (ext === 'css') {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = path + '?v=9999';
                link.onload = () => {
                    this.loaded.add(path);
                    this.loading.delete(path);
                    resolve();
                };
                link.onerror = () => {
                    this.loading.delete(path);
                    reject(new Error(`Failed to load CSS: ${path}`));
                };
                document.head.appendChild(link);
            } else if (ext === 'js') {
                const script = document.createElement('script');
                script.src = path + '?v=9999';
                script.async = false; // Maintain execution order
                script.onload = () => {
                    this.loaded.add(path);
                    this.loading.delete(path);
                    resolve();
                };
                script.onerror = () => {
                    this.loading.delete(path);
                    reject(new Error(`Failed to load JS: ${path}`));
                };
                document.body.appendChild(script);
            } else {
                reject(new Error(`Unknown file type: ${ext}`));
            }
        });

        this.loading.set(path, promise);
        return promise;
    },

    // Load module on demand
    async loadModule(moduleName) {
        if (!this.lazyModules[moduleName]) {
            console.warn(`⚠️ Unknown module: ${moduleName}`);
            return;
        }

        console.log(`📦 Loading module: ${moduleName}`);
        const files = this.lazyModules[moduleName];
        const promises = files.map(file => this.loadFile(file));
        await Promise.all(promises);
        console.log(`✅ Module ${moduleName} loaded`);
    },

    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    async init() {
        const totalStart = performance.now();

        try {
            // Phase 1: Critical (must load first)
            await this.loadPhase('critical');

            // Phase 2: Immediate (load after critical)
            await this.loadPhase('immediate');

            // Phase 3: Lazy modules loaded on demand via router
            this.setupLazyLoading();

            const totalTime = (performance.now() - totalStart).toFixed(0);
            console.log(`🚀 App ready in ${totalTime}ms`);

            window.dispatchEvent(new CustomEvent('appReady', { detail: { time: totalTime } }));

        } catch (error) {
            console.error('❌ FastLoader error:', error);
            // Fallback: load everything (old behavior)
            console.warn('⚠️ Falling back to full load...');
            window.location.reload();
        }
    },

    setupLazyLoading() {
        // Hook into router to load modules on navigation
        window.addEventListener('routeChange', (e) => {
            const route = e.detail?.route;
            if (!route) return;

            // Map routes to modules
            const moduleMap = {
                'tasks': 'tasks',
                'notes': 'notes',
                'projects': 'projects',
                'canvas': 'canvas',
                'galaxy': 'galaxy',
                'galaxie': 'galaxy',  // Fixed: was pointing to wrong 'canvas' module
                'accounting': 'accounting',
                'gamification': 'gamification',
                'admin': 'admin',
                'configDev': 'configDev',
                'calendar': 'calendar'
            };

            const moduleName = moduleMap[route];
            if (moduleName) {
                this.loadModule(moduleName).catch(err => {
                    console.error(`Failed to load module ${moduleName}:`, err);
                });
            }
        });

        // Hook into galaxy view to load Excalidraw on-demand
        document.addEventListener('viewChanged', (e) => {
            if (e.detail && e.detail.view === 'galaxy') {
                this.loadModule('excalidraw').then(() => {
                    console.log('✅ Excalidraw loaded for galaxy view');
                    // Initialize if needed
                    setTimeout(() => {
                        if (window.initExcalidrawMiro) {
                            window.initExcalidrawMiro();
                        }
                    }, 100);
                }).catch(err => {
                    console.error('Failed to load Excalidraw:', err);
                });
            }
        });

        // Hook into Giri Vision button to load on-demand
        const loadGiriVisionOnce = () => {
            this.loadModule('giriVision').then(() => {
                console.log('✅ Giri Vision loaded');
                // Initialize canvas data if needed
                if (window.canvasData && typeof window.canvasData.init === 'function') {
                    window.canvasData.init();
                }
                // Initialize Giri Vision module
                if (window.giriVisionModule && typeof window.giriVisionModule.init === 'function') {
                    window.giriVisionModule.init();
                }
            }).catch(err => {
                console.error('Failed to load Giri Vision:', err);
            });
        };

        // Listen for Giri Vision button click
        document.addEventListener('click', (e) => {
            const giriBtn = e.target.closest('#giri-vision-toggle');
            if (giriBtn && !this.loaded.has('js/modules/giri-vision/giri-vision.js')) {
                loadGiriVisionOnce();
            }
        });
    },

    // Preload specific modules in background (low priority)
    preload(moduleNames) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                moduleNames.forEach(name => this.loadModule(name));
            });
        } else {
            setTimeout(() => {
                moduleNames.forEach(name => this.loadModule(name));
            }, 2000);
        }
    }
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FastLoader.init());
} else {
    FastLoader.init();
}

// Expose globally
window.FastLoader = FastLoader;
