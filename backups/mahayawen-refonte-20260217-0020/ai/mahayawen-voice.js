// =============================================
// MAHAYAWEN VOICE INTERFACE
// Interface vocale avec Web Speech API pour commandes mains-libres
// Version 2.0 - Always Listening
// =============================================

const MahayawenVoice = {
    /**
     * État de la reconnaissance vocale
     */
    state: {
        isListening: false,
        isEnabled: false,
        isSpeaking: false,
        recognition: null,
        synthesis: null,
        continuousMode: false,
        language: 'fr-FR',
        lastTranscript: '',
        hotwordDetected: false
    },

    /**
     * Configuration
     */
    config: {
        hotwords: ['mahayawen', 'maya', 'assistant', 'hey maya'],
        autoStart: false,
        continuousListening: true,
        interimResults: true,
        maxAlternatives: 3,
        voiceFeedback: true
    },

    /**
     * Initialise la reconnaissance vocale
     */
    init() {
        // Vérifier la compatibilité
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('⚠️ Web Speech API non supportée dans ce navigateur');
            return false;
        }

        // Initialiser la reconnaissance vocale
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.state.recognition = new SpeechRecognition();

        // Configuration
        this.state.recognition.continuous = this.config.continuousListening;
        this.state.recognition.interimResults = this.config.interimResults;
        this.state.recognition.maxAlternatives = this.config.maxAlternatives;
        this.state.recognition.lang = this.state.language;

        // Événements
        this.state.recognition.onstart = () => this.onStart();
        this.state.recognition.onresult = (event) => this.onResult(event);
        this.state.recognition.onerror = (event) => this.onError(event);
        this.state.recognition.onend = () => this.onEnd();

        // Initialiser la synthèse vocale
        if ('speechSynthesis' in window) {
            this.state.synthesis = window.speechSynthesis;
        }

        this.state.isEnabled = true;
        console.log('🎤 Mahayawen Voice Interface initialized');

        return true;
    },

    /**
     * Démarre l'écoute
     */
    start() {
        if (!this.state.isEnabled || this.state.isListening) {
            return false;
        }

        try {
            this.state.recognition.start();
            this.state.continuousMode = true;
            console.log('🎤 Voice recognition started');
            this.showListeningIndicator();
            return true;
        } catch (error) {
            console.error('❌ Failed to start recognition:', error);
            return false;
        }
    },

    /**
     * Arrête l'écoute
     */
    stop() {
        if (!this.state.isListening) {
            return false;
        }

        this.state.recognition.stop();
        this.state.continuousMode = false;
        console.log('🎤 Voice recognition stopped');
        this.hideListeningIndicator();
        return true;
    },

    /**
     * Toggle l'écoute
     */
    toggle() {
        if (this.state.isListening) {
            return this.stop();
        } else {
            return this.start();
        }
    },

    /**
     * Événement : démarrage de l'écoute
     */
    onStart() {
        this.state.isListening = true;
        this.updateUI('listening');
        console.log('🎤 Listening...');
    },

    /**
     * Événement : résultat de reconnaissance
     */
    async onResult(event) {
        const results = event.results;
        const lastResult = results[results.length - 1];
        const transcript = lastResult[0].transcript.trim();
        const isFinal = lastResult.isFinal;
        const confidence = lastResult[0].confidence;

        console.log(`🎤 Transcript (${isFinal ? 'final' : 'interim'}):`, transcript, `(${Math.round(confidence * 100)}%)`);

        // Mise à jour UI temps réel
        if (!isFinal) {
            this.updateTranscript(transcript, false);
            return;
        }

        this.state.lastTranscript = transcript;
        this.updateTranscript(transcript, true);

        // Détection du hotword
        const hasHotword = this.detectHotword(transcript);

        if (hasHotword || this.state.hotwordDetected) {
            this.state.hotwordDetected = true;

            // Retirer le hotword de la commande
            const command = this.removeHotword(transcript);

            if (command.length > 3) {
                // Exécuter la commande
                await this.executeCommand(command, confidence);

                // Reset hotword après exécution
                if (!this.state.continuousMode) {
                    this.state.hotwordDetected = false;
                }
            } else {
                // Hotword seul détecté, en attente de commande
                this.speak('Oui ?');
                this.showWaitingIndicator();
            }
        } else {
            console.log('⏸️ Hotword not detected, ignoring:', transcript);
        }
    },

    /**
     * Détecte le hotword dans le transcript
     */
    detectHotword(transcript) {
        const lower = transcript.toLowerCase();
        return this.config.hotwords.some(hotword => lower.includes(hotword));
    },

    /**
     * Retire le hotword du transcript
     */
    removeHotword(transcript) {
        let cleaned = transcript;
        this.config.hotwords.forEach(hotword => {
            const regex = new RegExp(hotword, 'gi');
            cleaned = cleaned.replace(regex, '').trim();
        });
        return cleaned;
    },

    /**
     * Exécute une commande vocale
     */
    async executeCommand(command, confidence) {
        console.log('⚡ Executing voice command:', command);

        this.updateUI('processing');
        this.showProcessingIndicator();

        try {
            // Exécuter via MahayawenAgent
            const result = await MahayawenAgent.execute(command);

            console.log('✅ Command result:', result);

            // Feedback visuel
            if (result.success) {
                this.showSuccessIndicator();
                if (this.config.voiceFeedback) {
                    this.speak(result.message);
                }
            } else {
                this.showErrorIndicator();
                if (this.config.voiceFeedback) {
                    this.speak(result.message);
                }
            }

            // Afficher dans le chat
            this.displayInChat(command, result);

        } catch (error) {
            console.error('❌ Command execution failed:', error);
            this.showErrorIndicator();
            this.speak('Désolé, une erreur est survenue.');
        }

        this.updateUI('listening');
    },

    /**
     * Événement : erreur de reconnaissance
     */
    onError(event) {
        console.error('❌ Speech recognition error:', event.error);

        if (event.error === 'no-speech') {
            console.log('⏸️ No speech detected');
        } else if (event.error === 'audio-capture') {
            this.speak('Impossible d\'accéder au microphone');
            this.state.isEnabled = false;
        } else if (event.error === 'not-allowed') {
            this.speak('Permission microphone refusée');
            this.state.isEnabled = false;
        }

        this.updateUI('error');
    },

    /**
     * Événement : fin de l'écoute
     */
    onEnd() {
        this.state.isListening = false;
        console.log('🎤 Recognition ended');

        // Redémarrer automatiquement en mode continu
        if (this.state.continuousMode && this.state.isEnabled) {
            setTimeout(() => {
                console.log('🔄 Restarting recognition...');
                this.start();
            }, 500);
        } else {
            this.hideListeningIndicator();
            this.updateUI('idle');
        }
    },

    /**
     * Synthèse vocale
     */
    speak(text) {
        if (!this.state.synthesis || !this.config.voiceFeedback) {
            return;
        }

        // Annuler la parole en cours
        this.state.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.state.language;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;

        utterance.onstart = () => {
            this.state.isSpeaking = true;
            console.log('🔊 Speaking:', text);
        };

        utterance.onend = () => {
            this.state.isSpeaking = false;
        };

        this.state.synthesis.speak(utterance);
    },

    /**
     * Mise à jour de l'UI
     */
    updateUI(status) {
        const voiceBtn = document.getElementById('mahayawen-voice-btn');
        if (!voiceBtn) return;

        voiceBtn.dataset.status = status;

        const statusClasses = {
            'idle': 'voice-idle',
            'listening': 'voice-listening',
            'processing': 'voice-processing',
            'error': 'voice-error'
        };

        Object.values(statusClasses).forEach(cls => voiceBtn.classList.remove(cls));
        voiceBtn.classList.add(statusClasses[status] || 'voice-idle');
    },

    /**
     * Affiche le transcript en temps réel
     */
    updateTranscript(transcript, isFinal) {
        const transcriptEl = document.getElementById('mahayawen-transcript');
        if (!transcriptEl) return;

        transcriptEl.textContent = transcript;
        transcriptEl.classList.toggle('final', isFinal);

        if (isFinal) {
            setTimeout(() => {
                transcriptEl.textContent = '';
            }, 3000);
        }
    },

    /**
     * Affiche dans le chat
     */
    displayInChat(command, result) {
        if (typeof Chatbot !== 'undefined') {
            Chatbot.addMessage(command, 'user');
            Chatbot.addMessage(result.message, result.success ? 'assistant' : 'assistant error');
        }
    },

    /**
     * Indicateurs visuels
     */
    showListeningIndicator() {
        const indicator = this.createIndicator('🎤 En écoute...', 'listening');
        this.showIndicator(indicator);
    },

    showWaitingIndicator() {
        const indicator = this.createIndicator('⏳ En attente de commande...', 'waiting');
        this.showIndicator(indicator);
    },

    showProcessingIndicator() {
        const indicator = this.createIndicator('⚙️ Traitement...', 'processing');
        this.showIndicator(indicator);
    },

    showSuccessIndicator() {
        const indicator = this.createIndicator('✅ Commande exécutée !', 'success');
        this.showIndicator(indicator, 2000);
    },

    showErrorIndicator() {
        const indicator = this.createIndicator('❌ Erreur', 'error');
        this.showIndicator(indicator, 2000);
    },

    hideListeningIndicator() {
        const indicator = document.getElementById('mahayawen-voice-indicator');
        if (indicator) {
            indicator.remove();
        }
    },

    createIndicator(text, type) {
        const div = document.createElement('div');
        div.id = 'mahayawen-voice-indicator';
        div.className = `mahayawen-indicator mahayawen-indicator-${type}`;
        div.textContent = text;
        return div;
    },

    showIndicator(indicator, duration = null) {
        this.hideListeningIndicator();
        document.body.appendChild(indicator);

        if (duration) {
            setTimeout(() => {
                indicator.remove();
            }, duration);
        }
    },

    /**
     * Raccourcis clavier
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + Shift + V : Toggle voice
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                this.toggle();
            }

            // Espace (maintenu) : Push-to-talk
            if (e.code === 'Space' && !this.state.continuousMode) {
                const target = e.target;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                    return;
                }
                e.preventDefault();
                if (!this.state.isListening) {
                    this.start();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            // Espace (relâché) : Stop push-to-talk
            if (e.code === 'Space' && !this.state.continuousMode) {
                const target = e.target;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                    return;
                }
                e.preventDefault();
                this.stop();
            }
        });
    },

    /**
     * Mode conduite (toujours en écoute)
     */
    enableDrivingMode() {
        this.config.continuousListening = true;
        this.config.voiceFeedback = true;
        this.config.autoStart = true;
        this.start();
        this.speak('Mode conduite activé. Je suis à ton écoute.');
        console.log('🚗 Driving mode enabled');
    },

    /**
     * Désactiver mode conduite
     */
    disableDrivingMode() {
        this.config.autoStart = false;
        this.stop();
        this.speak('Mode conduite désactivé.');
        console.log('🚗 Driving mode disabled');
    }
};

// Exposer globalement
if (typeof window !== 'undefined') {
    window.MahayawenVoice = MahayawenVoice;
}
