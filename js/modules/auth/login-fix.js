// =============================================
// PRODUCTIVEAPP - LOGIN FIX PATCH v1.0
// Corrections des bugs de connexion
// =============================================

(function() {
    'use strict';

    console.log('🔧 LoginFix: Initializing patches...');

    // =========================================
    // FIX 1: Assurer que le logo est visible (login + sidebar)
    // =========================================
    function ensureLogoVisible() {
        const observer = new MutationObserver(() => {
            // Login logo
            const loginLogo = document.querySelector('.auth-login-logo img');
            if (loginLogo) {
                // Force le logo à être visible
                loginLogo.style.display = 'block';
                loginLogo.style.visibility = 'visible';
                loginLogo.style.opacity = '1';

                // Vérifier que l'image charge correctement
                if (!loginLogo.complete || loginLogo.naturalHeight === 0) {
                    console.warn('⚠️ Login logo image not loading, checking...');
                    loginLogo.onerror = function() {
                        console.error('❌ Login logo failed to load from CDN');
                    };
                    loginLogo.onload = function() {
                        console.log('✅ Login logo loaded successfully');
                    };
                }

                console.log('✅ LoginFix: Login logo visibility ensured');
            }

            // Sidebar logo
            const sidebarLogo = document.querySelector('.sidebar-logo');
            if (sidebarLogo) {
                // Force le logo à être visible
                sidebarLogo.style.display = 'block';
                sidebarLogo.style.visibility = 'visible';
                sidebarLogo.style.opacity = '1';
                sidebarLogo.style.width = '32px';
                sidebarLogo.style.height = '32px';
                sidebarLogo.style.objectFit = 'cover';

                // Vérifier que l'image charge correctement
                if (!sidebarLogo.complete || sidebarLogo.naturalHeight === 0) {
                    console.warn('⚠️ Sidebar logo image not loading, checking...');
                    sidebarLogo.onerror = function() {
                        console.error('❌ Sidebar logo failed to load from CDN');
                        // Fallback: ajouter un emoji si l'image ne charge pas
                        const fallback = document.createElement('div');
                        fallback.textContent = '👑';
                        fallback.style.cssText = 'width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:20px;';
                        this.replaceWith(fallback);
                    };
                    sidebarLogo.onload = function() {
                        console.log('✅ Sidebar logo loaded successfully');
                    };
                }

                console.log('✅ LoginFix: Sidebar logo visibility ensured');
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Auto-disconnect après 10 secondes (augmenté pour la sidebar)
        setTimeout(() => observer.disconnect(), 10000);
    }

    // =========================================
    // FIX 2: Forcer l'auto-sélection du membre
    // =========================================
    function patchAutoSelectMember() {
        if (typeof AuthLogin === 'undefined') {
            console.warn('⚠️ AuthLogin not loaded yet, will retry');
            return;
        }

        // Sauvegarder la méthode originale
        const originalAutoSelect = AuthLogin.autoSelectMember;

        // Patcher la méthode
        AuthLogin.autoSelectMember = async function() {
            console.log('🔧 LoginFix: Patched autoSelectMember called');

            // 1. Matcher avec l'ID backend (priorité haute)
            if (this.apiUser && this.apiUser.id) {
                const matched = AppConfig.USERS.find(u => u.id === this.apiUser.id);
                if (matched) {
                    console.log('✅ LoginFix: Matched apiUser.id =', this.apiUser.id);
                    localStorage.setItem('selectedMemberId', matched.id);
                    await this.enterApp(matched);
                    return;
                }
            }

            // 2. Membre précédemment sélectionné
            const savedMemberId = localStorage.getItem('selectedMemberId');
            if (savedMemberId) {
                const saved = AppConfig.USERS.find(u => u.id === savedMemberId);
                if (saved) {
                    console.log('✅ LoginFix: Using savedMemberId =', savedMemberId);
                    await this.enterApp(saved);
                    return;
                }
            }

            // 3. Matcher par email (nouveau: si l'email correspond)
            if (this.apiUser && this.apiUser.email) {
                // Si c'est contact@mahagiri.fr, utiliser Maha Giri par défaut
                if (this.apiUser.email === 'contact@mahagiri.fr') {
                    const mahaGiri = AppConfig.USERS.find(u => u.name === 'Maha Giri');
                    if (mahaGiri) {
                        console.log('✅ LoginFix: Using Maha Giri for contact@mahagiri.fr');
                        localStorage.setItem('selectedMemberId', mahaGiri.id);
                        await this.enterApp(mahaGiri);
                        return;
                    }
                }
            }

            // 4. Défaut: premier utilisateur (boss)
            const defaultMember = AppConfig.USERS[0];
            if (defaultMember) {
                console.log('✅ LoginFix: Using default member (first user)');
                localStorage.setItem('selectedMemberId', defaultMember.id);
                await this.enterApp(defaultMember);
                return;
            }

            // 5. Dernier recours: appeler l'original (affichera le picker)
            console.warn('⚠️ LoginFix: All auto-select methods failed, showing picker');
            await originalAutoSelect.call(this);
        };

        console.log('✅ LoginFix: autoSelectMember patched');
    }

    // =========================================
    // FIX 3: Corriger les avatars du member picker
    // =========================================
    function fixMemberAvatars() {
        const observer = new MutationObserver(() => {
            const avatars = document.querySelectorAll('.auth-member-avatar');
            if (avatars.length > 0) {
                avatars.forEach(avatar => {
                    // Assurer que l'image est visible
                    avatar.style.display = 'block';
                    avatar.style.width = '80px';
                    avatar.style.height = '80px';
                    avatar.style.objectFit = 'cover';
                    avatar.style.borderRadius = '50%';

                    // Vérifier le chargement
                    if (!avatar.complete || avatar.naturalHeight === 0) {
                        avatar.onerror = function() {
                            console.error('❌ Avatar failed to load:', this.src);
                            // Fallback vers un avatar par défaut
                            this.style.display = 'none';
                            this.insertAdjacentHTML('afterend', '<div style="width:80px;height:80px;border-radius:50%;background:#d4af37;display:flex;align-items:center;justify-content:center;font-size:40px;">👤</div>');
                        };
                    }
                });

                console.log('✅ LoginFix: Member avatars fixed');
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Auto-disconnect après 5 secondes
        setTimeout(() => observer.disconnect(), 5000);
    }

    // =========================================
    // FIX 4: Cacher le member picker si déjà connecté
    // =========================================
    function hideMemberPickerIfAuthenticated() {
        // Vérifier si l'utilisateur est déjà authentifié
        const isAuthenticated = document.body.classList.contains('logged-in');
        const savedMemberId = localStorage.getItem('selectedMemberId');

        if (isAuthenticated && savedMemberId) {
            console.log('✅ LoginFix: User already authenticated, hiding auth overlays');

            // Cacher tous les overlays d'authentification
            const authOverlay = document.getElementById('auth-login-container');
            const loginScreen = document.getElementById('login-screen');
            const memberPicker = document.getElementById('member-picker');

            if (authOverlay) authOverlay.remove();
            if (loginScreen) loginScreen.remove();
            if (memberPicker) memberPicker.remove();

            return true;
        }

        return false;
    }

    // =========================================
    // FIX 5: Force close member picker after successful login
    // =========================================
    function monitorMemberPickerAfterLogin() {
        // Observer pour détecter quand logged-in est ajouté
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isLoggedIn = document.body.classList.contains('logged-in');

                    if (isLoggedIn) {
                        console.log('✅ LoginFix: Login detected, closing all auth overlays');

                        // Forcer la fermeture de tous les overlays
                        setTimeout(() => {
                            const authOverlay = document.getElementById('auth-login-container');
                            const loginScreen = document.getElementById('login-screen');
                            const memberPicker = document.getElementById('member-picker');
                            const authMemberPicker = document.getElementById('auth-member-picker');

                            if (authOverlay) {
                                authOverlay.remove();
                                console.log('✅ LoginFix: Removed auth-login-container');
                            }
                            if (loginScreen) {
                                loginScreen.remove();
                                console.log('✅ LoginFix: Removed login-screen');
                            }
                            if (memberPicker) {
                                memberPicker.remove();
                                console.log('✅ LoginFix: Removed member-picker');
                            }
                            if (authMemberPicker) {
                                authMemberPicker.classList.add('hidden');
                                console.log('✅ LoginFix: Hidden auth-member-picker');
                            }
                        }, 100);

                        // Disconnect après traitement
                        observer.disconnect();
                    }
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // =========================================
    // INITIALISATION
    // =========================================
    function init() {
        console.log('🔧 LoginFix: Starting initialization...');

        // Fix 1: Logo visibility
        ensureLogoVisible();

        // Fix 3: Avatar corrections
        fixMemberAvatars();

        // Fix 4: Hide picker if already authenticated
        if (hideMemberPickerIfAuthenticated()) {
            console.log('✅ LoginFix: User already logged in, patches not needed');
            return;
        }

        // Fix 5: Monitor login completion
        monitorMemberPickerAfterLogin();

        // Fix 2: Patch autoSelectMember (avec retry si AuthLogin pas encore chargé)
        if (typeof AuthLogin !== 'undefined') {
            patchAutoSelectMember();
        } else {
            console.log('⏳ LoginFix: Waiting for AuthLogin...');
            let retries = 0;
            const interval = setInterval(() => {
                retries++;
                if (typeof AuthLogin !== 'undefined') {
                    patchAutoSelectMember();
                    clearInterval(interval);
                } else if (retries > 50) {
                    console.warn('⚠️ LoginFix: AuthLogin not found after 50 retries');
                    clearInterval(interval);
                }
            }, 100);
        }

        console.log('✅ LoginFix: All patches initialized');
    }

    // Démarrer dès que possible
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Aussi démarrer sur window.load comme backup
    window.addEventListener('load', () => {
        // Re-vérifier au cas où
        hideMemberPickerIfAuthenticated();
    });

    // Exposer globalement pour debug
    window.LoginFix = {
        ensureLogoVisible,
        fixMemberAvatars,
        hideMemberPickerIfAuthenticated
    };

    console.log('✅ LoginFix: Module loaded');
})();
