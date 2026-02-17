/**
 * ================================================
 * VISION JITSI - Giri Vision v1.2
 * Wrapper Jitsi Meet External API
 * - prejoinPage désactivé (pas de Google/GitHub)
 * - Gestion membersOnly/lobby
 * ================================================
 */

const VisionJitsi = (function () {
    'use strict';

    const JITSI_DOMAIN = 'meet.jit.si';
    let _api = null;
    let _startTime = null;
    let _onEndCallback = null;
    let _onErrorCallback = null;

    function loadJitsiScript() {
        return new Promise((resolve, reject) => {
            if (window.JitsiMeetExternalAPI) { resolve(); return; }
            const existing = document.querySelector('script[src*="meet.jit.si/external_api"]');
            if (existing) {
                if (window.JitsiMeetExternalAPI) { resolve(); return; }
                existing.addEventListener('load', resolve);
                existing.addEventListener('error', reject);
                return;
            }
            const script = document.createElement('script');
            script.src = `https://${JITSI_DOMAIN}/external_api.js`;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Impossible de charger le module vidéo'));
            document.head.appendChild(script);
        });
    }

    /**
     * Lance Jitsi directement en réunion (sans pre-join Jitsi, sans login social)
     */
    async function init(roomId, containerId, options = {}) {
        await loadJitsiScript();

        const container = document.getElementById(containerId);
        if (!container) throw new Error(`Conteneur #${containerId} introuvable`);

        if (_api) { try { _api.dispose(); } catch(e) {} _api = null; }

        _onEndCallback = options.onEnd || null;
        _onErrorCallback = options.onError || null;
        _startTime = Date.now();

        const config = {
            // CRITIQUE : désactive totalement la page de pre-join Jitsi
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },

            // CRITIQUE : désactive le lobby (évite membersOnly pour les nouvelles salles)
            lobby: { autoKnock: false, enableChat: false },
            enableLobbyChat: false,
            hideLobbyButton: true,

            startWithAudioMuted: !!options.startMuted,
            startWithVideoMuted: !!options.startCamOff,
            disableVirtualBackground: true,
            disableDeepLinking: true,
            enableClosePage: false,
            disableProfile: true,
            gravatarBaseURL: '',
            requireDisplayName: false,
            enableUserRolesBasedOnToken: false,

            subject: options.title || 'Réunion Giri Vision',

            toolbarButtons: [
                'microphone', 'camera', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'chat',
                'settings', 'raisehand', 'videoquality',
                'tileview', 'participants-pane', 'toggle-camera'
            ]
        };

        const interfaceConfig = {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            APP_NAME: 'Giri Vision',
            NATIVE_APP_NAME: 'Giri Vision',
            DEFAULT_BACKGROUND: _getThemeBg(),
            TOOLBAR_ALWAYS_VISIBLE: false,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: true,
            RECENT_LIST_ENABLED: false
        };

        _api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
            roomName: roomId,
            width: '100%',
            height: '100%',
            parentNode: container,
            userInfo: { displayName: options.displayName || 'Utilisateur', email: '' },
            configOverwrite: config,
            interfaceConfigOverwrite: interfaceConfig
        });

        // Permissions iframe
        setTimeout(() => {
            const iframe = container.querySelector('iframe');
            if (iframe) {
                iframe.setAttribute('allow',
                    'camera; microphone; display-capture; autoplay; clipboard-write; fullscreen');
            }
        }, 600);

        // Fallback: hide loading spinner after 5s regardless of events (Edge Tracking Prevention)
        const _hideLoading = () => {
            const loading = document.querySelector('.vision-loading-room');
            if (loading) {
                loading.style.transition = 'opacity 0.5s ease';
                loading.style.opacity = '0';
                setTimeout(() => { loading.style.display = 'none'; }, 500);
            }
        };
        const _loadingFallback = setTimeout(_hideLoading, 5000);

        _api.addEventListeners({
            readyToClose: () => {
                const duration = Math.floor((Date.now() - _startTime) / 1000);
                if (_onEndCallback) _onEndCallback(duration);
            },
            videoConferenceJoined: (p) => {
                console.log('✅ Giri Vision: réunion rejointe par', p.displayName);
                clearTimeout(_loadingFallback);
                _hideLoading();
            },
            conferenceError: (e) => {
                console.error('❌ Giri Vision: conference error', e.errorCode);
                clearTimeout(_loadingFallback);
                if (e.errorCode === 'conference.connectionError.membersOnly') {
                    if (_onErrorCallback) _onErrorCallback('membersOnly');
                } else {
                    if (_onErrorCallback) _onErrorCallback(e.errorCode || 'unknown');
                }
            }
        });

        return _api;
    }

    /** Lit la couleur de fond du thème courant pour Jitsi DEFAULT_BACKGROUND */
    function _getThemeBg() {
        const style = getComputedStyle(document.documentElement);
        const bg = style.getPropertyValue('--bg-primary').trim();
        return bg || '#0d0d1a';
    }

    function dispose() {
        if (_api) {
            try { _api.dispose(); } catch(e) {}
            _api = null;
            _startTime = null;
            _onEndCallback = null;
            _onErrorCallback = null;
        }
    }

    function isActive() { return _api !== null; }

    function getDuration() {
        if (!_startTime) return 0;
        return Math.floor((Date.now() - _startTime) / 1000);
    }

    return { init, dispose, isActive, getDuration };
})();

if (typeof window !== 'undefined') window.VisionJitsi = VisionJitsi;
