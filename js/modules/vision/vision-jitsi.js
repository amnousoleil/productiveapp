/**
 * ================================================
 * VISION JITSI - Giri Vision v3.0
 * Moteur vidéo interne — technologie propriétaire
 * AUCUNE marque tierce visible par l'utilisateur
 * ================================================
 */

const VisionJitsi = (function () {
    'use strict';

    // Serveur vidéo interne — ne jamais exposer côté utilisateur
    const _SRV = 'meet.ffmuc.net';
    let _api = null;
    let _startTime = null;
    let _onEndCallback = null;
    let _onErrorCallback = null;

    /**
     * Préchargement optimisé — appeler dès l'ouverture de la vue Giri Vision
     * pour éliminer le délai au moment du clic "Rejoindre"
     */
    function preload() {
        if (window.JitsiMeetExternalAPI) return Promise.resolve();
        return _loadScript();
    }

    function _loadScript() {
        return new Promise((resolve, reject) => {
            if (window.JitsiMeetExternalAPI) { resolve(); return; }
            // Éviter double chargement
            if (document.querySelector('script[data-gv-engine]')) {
                const existing = document.querySelector('script[data-gv-engine]');
                existing.addEventListener('load', resolve);
                existing.addEventListener('error', reject);
                return;
            }
            const s = document.createElement('script');
            s.setAttribute('data-gv-engine', '1');
            s.src = `https://${_SRV}/external_api.js`;
            s.async = true;
            s.onload = resolve;
            s.onerror = () => reject(new Error('Connexion au service vidéo impossible'));
            document.head.appendChild(s);
        });
    }

    async function init(roomId, containerId, options = {}) {
        await _loadScript();

        const container = document.getElementById(containerId);
        if (!container) throw new Error(`Conteneur #${containerId} introuvable`);

        if (_api) { try { _api.dispose(); } catch(e) {} _api = null; }

        _onEndCallback = options.onEnd || null;
        _onErrorCallback = options.onError || null;
        _startTime = Date.now();

        const config = {
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
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
            subject: options.title || 'Séance Giri Vision',
            toolbarButtons: [
                'microphone', 'camera', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'chat',
                'settings', 'raisehand', 'videoquality',
                'tileview', 'participants-pane', 'toggle-camera'
            ]
        };

        const interfaceConfig = {
            // Suppression totale de toute référence tierce
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            // Identité Giri Vision
            APP_NAME: 'Giri Vision',
            NATIVE_APP_NAME: 'Giri Vision',
            DEFAULT_BACKGROUND: _getThemeBg(),
            TOOLBAR_ALWAYS_VISIBLE: false,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: true,
            RECENT_LIST_ENABLED: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false
        };

        _api = new window.JitsiMeetExternalAPI(_SRV, {
            roomName: roomId,
            width: '100%',
            height: '100%',
            parentNode: container,
            userInfo: { displayName: options.displayName || 'Participant', email: '' },
            configOverwrite: config,
            interfaceConfigOverwrite: interfaceConfig
        });

        // Permissions iframe + suppression border
        const _applyIframeAttrs = () => {
            const iframe = container.querySelector('iframe');
            if (iframe) {
                iframe.setAttribute('allow',
                    'camera; microphone; display-capture; autoplay; clipboard-write; fullscreen');
                iframe.style.border = 'none';
                // Montrer badge Giri Vision sur l'iframe
                const badge = document.getElementById('vision-brand-badge');
                if (badge) badge.style.display = 'flex';
            }
        };
        setTimeout(_applyIframeAttrs, 500);
        setTimeout(_applyIframeAttrs, 1500);

        // Masquer le spinner de chargement
        const _hideLoading = () => {
            const el = document.querySelector('.vision-loading-room');
            if (el) {
                el.style.transition = 'opacity 0.4s ease';
                el.style.opacity = '0';
                setTimeout(() => { if (el.parentNode) el.style.display = 'none'; }, 400);
            }
        };
        // Fallback : masquer après 6s même sans événement
        const fallback = setTimeout(_hideLoading, 6000);

        _api.addEventListeners({
            readyToClose: () => {
                const duration = Math.floor((Date.now() - _startTime) / 1000);
                if (_onEndCallback) _onEndCallback(duration);
            },
            videoConferenceJoined: () => {
                clearTimeout(fallback);
                _hideLoading();
                _applyIframeAttrs();
            },
            conferenceError: (e) => {
                clearTimeout(fallback);
                if (_onErrorCallback) _onErrorCallback(e.errorCode || 'unknown');
            }
        });

        return _api;
    }

    function _getThemeBg() {
        const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim();
        return bg || '#050510';
    }

    function dispose() {
        if (_api) {
            try { _api.dispose(); } catch(e) {}
            _api = null; _startTime = null;
            _onEndCallback = null; _onErrorCallback = null;
        }
    }

    function isActive() { return _api !== null; }

    function getDuration() {
        if (!_startTime) return 0;
        return Math.floor((Date.now() - _startTime) / 1000);
    }

    return { init, preload, dispose, isActive, getDuration };
})();

if (typeof window !== 'undefined') window.VisionJitsi = VisionJitsi;
