/**
 * ================================================
 * VISION JITSI - Giri Vision v1.0
 * Wrapper Jitsi Meet External API
 * ================================================
 */

const VisionJitsi = (function () {
    'use strict';

    const JITSI_DOMAIN = 'meet.jit.si';
    let _api = null;
    let _startTime = null;
    let _onEndCallback = null;

    /**
     * Charge le script Jitsi External API de façon asynchrone
     */
    function loadJitsiScript() {
        return new Promise((resolve, reject) => {
            if (window.JitsiMeetExternalAPI) { resolve(); return; }

            const existing = document.querySelector('script[src*="meet.jit.si"]');
            if (existing) {
                existing.addEventListener('load', resolve);
                existing.addEventListener('error', reject);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://${JITSI_DOMAIN}/external_api.js`;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Impossible de charger Jitsi Meet'));
            document.head.appendChild(script);
        });
    }

    /**
     * Initialise Jitsi dans le conteneur donné
     * @param {string} roomId - ID de la salle (ex: giri-1234-abc)
     * @param {string} containerId - ID du div conteneur
     * @param {object} options - { displayName, title, onEnd }
     */
    async function init(roomId, containerId, options = {}) {
        await loadJitsiScript();

        const container = document.getElementById(containerId);
        if (!container) throw new Error(`Conteneur #${containerId} introuvable`);

        // Détruire session précédente
        if (_api) { try { _api.dispose(); } catch(e) {} _api = null; }

        _onEndCallback = options.onEnd || null;
        _startTime = Date.now();

        const config = {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableVirtualBackground: true,
            disableDeepLinking: true,
            prejoinPageEnabled: true,
            enableClosePage: false,
            disableProfile: true,
            gravatarBaseURL: '',
            toolbarButtons: [
                'microphone', 'camera', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'chat',
                'recording', 'settings', 'raisehand',
                'videoquality', 'tileview', 'participants-pane'
            ],
            subject: options.title || 'Réunion Giri Vision'
        };

        const interfaceConfig = {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            APP_NAME: 'Giri Vision',
            NATIVE_APP_NAME: 'Giri Vision',
            DEFAULT_BACKGROUND: '#1a1a2e',
            TOOLBAR_ALWAYS_VISIBLE: false,
            MOBILE_APP_PROMO: false
        };

        _api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
            roomName: roomId,
            width: '100%',
            height: '100%',
            parentNode: container,
            userInfo: { displayName: options.displayName || 'Utilisateur' },
            configOverwrite: config,
            interfaceConfigOverwrite: interfaceConfig
        });

        // Permissions
        setTimeout(() => {
            const iframe = container.querySelector('iframe');
            if (iframe) {
                iframe.setAttribute('allow',
                    'camera; microphone; display-capture; autoplay; clipboard-write; fullscreen');
            }
        }, 800);

        // Événements
        _api.addEventListeners({
            readyToClose: () => {
                const duration = Math.floor((Date.now() - _startTime) / 1000);
                if (_onEndCallback) _onEndCallback(duration);
            },
            participantJoined: (p) => {
                console.log('🟢 Participant rejoint:', p.displayName);
            },
            participantLeft: (p) => {
                console.log('🔴 Participant parti:', p.id);
            },
            videoConferenceJoined: (p) => {
                console.log('✅ Conférence rejointe par:', p.displayName);
            }
        });

        return _api;
    }

    function dispose() {
        if (_api) {
            try { _api.dispose(); } catch(e) {}
            _api = null;
            _startTime = null;
            _onEndCallback = null;
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
