// =============================================
// PRODUCTIVEAPP - CHATBOT MODULE
// Chatbot IA avec commandes locales et média
// =============================================

const Chatbot = {
    /**
     * Toggle l'affichage du chatbot
     */
    toggle() {
        const chatWindow = Utils.$('chatbot-window');
        const fab = Utils.$('chatbot-toggle');
        const isHidden = chatWindow.classList.contains('hidden');

        if (isHidden) {
            // Opening chat
            chatWindow.classList.remove('hidden');
            if (fab) fab.classList.add('hidden');
            Utils.$('chatbot-input')?.focus();
        } else {
            // Closing chat - add closing animation
            chatWindow.classList.add('closing');
            if (fab) fab.classList.remove('hidden');

            setTimeout(() => {
                chatWindow.classList.add('hidden');
                chatWindow.classList.remove('closing');
            }, 250);
        }
    },

    /**
     * Toggle la taille du chatbot
     */
    toggleSize() {
        AppState.toggleChatbotSize();
        Utils.$('chatbot-window').classList.toggle('large', AppState.ui.chatbotLarge);
    },

    /**
     * Toggle la taille de police
     */
    toggleFontSize() {
        const currentIndex = AppConfig.FONT_SIZES.indexOf(AppState.ui.chatbotFontSize);
        const nextIndex = (currentIndex + 1) % AppConfig.FONT_SIZES.length;
        AppState.ui.chatbotFontSize = AppConfig.FONT_SIZES[nextIndex];
        localStorage.setItem('chatbot-font-size', AppState.ui.chatbotFontSize);
        Utils.$('chatbot-window').dataset.font = AppState.ui.chatbotFontSize;

        const labels = { small: 'Petit', medium: 'Moyen', large: 'Grand', xlarge: 'Très grand' };
        const btn = Utils.$('chatbot-font-size');
        if (btn) {
            btn.textContent = labels[AppState.ui.chatbotFontSize];
            setTimeout(() => { btn.textContent = 'Aa'; }, 1000);
        }
    },

    /**
     * Initialise la taille de police
     */
    initFontSize() {
        const chatbotWindow = Utils.$('chatbot-window');
        if (chatbotWindow) {
            chatbotWindow.dataset.font = AppState.ui.chatbotFontSize;
        }
    },

    /**
     * Ajoute un message au chat
     * @param {string} text - Texte du message
     * @param {string} cls - Classe CSS
     * @returns {HTMLElement} - Élément créé
     */
    addMessage(text, cls) {
        const div = document.createElement('div');
        div.className = `chat-msg ${cls}`;
        div.textContent = text;
        Utils.$('chatbot-messages').appendChild(div);
        Utils.$('chatbot-messages').scrollTop = Utils.$('chatbot-messages').scrollHeight;
        return div;
    },

    /**
     * Construit le contexte pour l'IA
     * @returns {string} - Contexte formaté
     */
    buildContext() {
        const todo = AppState.tasks.filter(t => t.status === 'todo');
        const inProgress = AppState.tasks.filter(t => t.status === 'inprogress');
        const today = new Date().toDateString();
        const todayJournal = AppState.journal.filter(e => new Date(e.date).toDateString() === today);
        const urgent = todo.filter(t => t.priority?.level === 1);

        let ctx = `=== EMPIRE DIGITAL GIRI ===\nUser: ${AppState.currentUser.name} (${AppState.currentUser.role})\nDate: ${Utils.formatDate(new Date())}\n\n`;

        ctx += `📊 STATS: 🔥 Urgent: ${urgent.length} | 📋 À faire: ${todo.length} | 🔄 En cours: ${inProgress.length}\n\n`;

        ctx += `🤖 COMMANDES DISPONIBLES (utilise-les pour agir):
- ACTION:CREATE|texte → Créer une tâche
- ACTION:DONE|texte → Marquer comme terminé
- ACTION:START|texte → Commencer une tâche
- ACTION:PRIORITY|texte|1 → Mettre en urgent (1=urgent, 2=normal, 3=basse)
- ACTION:REOPEN|texte → Réouvrir une tâche terminée
- ACTION:DELETE_DUPLICATES → Supprimer les tâches en double

`;

        if (urgent.length) {
            ctx += `🔥 URGENT:\n${urgent.map(t => `- ${t.text} (${AppState.findProject(t.project)?.name})`).join('\n')}\n\n`;
        }

        if (inProgress.length) {
            ctx += `🔄 EN COURS:\n${inProgress.map(t => `- ${t.text}`).join('\n')}\n\n`;
        }

        ctx += `📋 TÂCHES À FAIRE:\n`;
        AppState.projects.forEach(p => {
            const pTodo = todo.filter(t => t.project === p.id);
            if (pTodo.length) {
                ctx += `${p.icon} ${p.name}:\n${pTodo.map(t => `  - ${t.text} [P${t.priority?.level}]`).join('\n')}\n`;
            }
        });

        ctx += `\n📝 JOURNAL (5 derniers): ${todayJournal.slice(0, 5).map(e => e.text).join(' | ') || 'Vide'}`;

        return ctx;
    },

    // =============================================
    // COMMANDES LOCALES (exécutées sans API)
    // =============================================

    /**
     * Gère les commandes locales
     * @param {string} message - Message utilisateur
     * @returns {Promise<boolean>} - true si commande traitée
     */
    async handleLocalCommands(message) {
        const msg = message.toLowerCase();

        // Suppression doublons
        if (msg.match(/supprim.*(doublon|duplicate|double)/i) || msg.includes('nettoie')) {
            await this.handleDeleteDuplicates();
            return true;
        }

        // Compter urgents
        if (msg.match(/combien.*(urgent|priorit)/i)) {
            const urgent = AppState.tasks.filter(t => t.status !== 'done' && t.priority?.level === 1);
            const urgentList = urgent.map(t => `- ${t.text}`).join('\n');
            this.addMessage(`🔥 Tu as **${urgent.length} tâche(s) urgente(s)** :\n\n${urgentList || 'Aucune'}`, 'assistant');
            return true;
        }

        // Compter en cours
        if (msg.match(/combien.*(en cours|progress)/i)) {
            const inProgress = AppState.tasks.filter(t => t.status === 'inprogress');
            const list = inProgress.map(t => `- ${t.text}`).join('\n');
            this.addMessage(`🔄 Tu as **${inProgress.length} tâche(s) en cours** :\n\n${list || 'Aucune'}`, 'assistant');
            return true;
        }

        // Stats globales
        if (msg.match(/stats|statistiques|résumé|bilan/i)) {
            const stats = AppState.getTaskStats();
            this.addMessage(`📊 **Statistiques de tes tâches** :\n\n` +
                `📋 À faire : ${stats.todo}\n` +
                `🔄 En cours : ${stats.inProgress}\n` +
                `✅ Terminé : ${stats.done}\n` +
                `🔥 Urgent : ${stats.urgent}\n` +
                `📌 Total : ${stats.total}`, 'assistant');
            return true;
        }

        return false;
    },

    /**
     * Supprime les doublons
     */
    async handleDeleteDuplicates() {
        const seen = new Map();
        const duplicates = [];

        AppState.tasks.forEach(t => {
            const key = `${t.text.toLowerCase().trim()}|${t.project}`;
            if (seen.has(key)) {
                duplicates.push(t);
            } else {
                seen.set(key, t);
            }
        });

        if (duplicates.length === 0) {
            this.addMessage('✅ Aucun doublon trouvé ! Tes tâches sont nickel.', 'assistant');
            return;
        }

        let deleted = 0;
        for (const dup of duplicates) {
            await ApiService.deleteTask(dup.id);
            AppState.removeTask(dup.id);
            deleted++;
        }

        Tasks.render();
        Projects.renderFilter();

        const dupList = duplicates.slice(0, 5).map(d => `- ${d.text}`).join('\n');
        const moreText = duplicates.length > 5 ? `\n... et ${duplicates.length - 5} autres` : '';

        this.addMessage(`🗑️ **${deleted} doublon(s) supprimé(s)** :\n\n${dupList}${moreText}`, 'assistant');
    },

    /**
     * Traite les actions de l'IA
     * @param {string} response - Réponse de l'IA
     * @returns {Promise<string>} - Réponse nettoyée
     */
    async processAIActions(response) {
        let actionsPerformed = [];

        // ACTION:CREATE|texte
        if (response.includes('ACTION:CREATE|')) {
            for (const m of [...response.matchAll(/ACTION:CREATE\|([^\n]+)/g)]) {
                const newTask = await Tasks.create({
                    text: m[1].trim(),
                    project: AppState.filters.project !== 'all' ? AppState.filters.project : 'general'
                });
                if (newTask) {
                    actionsPerformed.push(`✅ Tâche créée: ${m[1].trim()}`);
                    AppState.ui.lastChatbotActionTaskId = newTask.id;
                }
            }
        }

        // ACTION:DONE|texte
        if (response.includes('ACTION:DONE|')) {
            for (const m of [...response.matchAll(/ACTION:DONE\|([^\n]+)/g)]) {
                const searchText = m[1].trim().toLowerCase();
                const t = AppState.tasks.find(t => t.status !== 'done' && t.text.toLowerCase().includes(searchText));
                if (t) {
                    await Tasks.handleAction(t.id, 'done');
                    actionsPerformed.push(`✅ Terminé: ${t.text}`);
                    AppState.ui.lastChatbotActionTaskId = t.id;
                }
            }
        }

        // ACTION:PRIORITY|texte|niveau
        if (response.includes('ACTION:PRIORITY|')) {
            for (const m of [...response.matchAll(/ACTION:PRIORITY\|([^|]+)\|(\d)/g)]) {
                const searchText = m[1].trim().toLowerCase();
                const newPriority = parseInt(m[2]);
                const t = AppState.tasks.find(t => t.text.toLowerCase().includes(searchText));
                if (t && newPriority >= 1 && newPriority <= 3) {
                    await ApiService.updateTask(t.id, t.status, newPriority);
                    t.priority = { level: newPriority, label: Utils.getPriorityLabel(newPriority) };
                    const priorityNames = { 1: '🔥 Urgent', 2: 'Normal', 3: 'Basse' };
                    actionsPerformed.push(`🎯 Priorité ${priorityNames[newPriority]}: ${t.text}`);
                }
            }
        }

        // ACTION:START|texte
        if (response.includes('ACTION:START|')) {
            for (const m of [...response.matchAll(/ACTION:START\|([^\n]+)/g)]) {
                const searchText = m[1].trim().toLowerCase();
                const t = AppState.tasks.find(t => t.status === 'todo' && t.text.toLowerCase().includes(searchText));
                if (t) {
                    await Tasks.handleAction(t.id, 'start');
                    actionsPerformed.push(`▶️ Commencé: ${t.text}`);
                }
            }
        }

        // ACTION:REOPEN|texte
        if (response.includes('ACTION:REOPEN|')) {
            for (const m of [...response.matchAll(/ACTION:REOPEN\|([^\n]+)/g)]) {
                const searchText = m[1].trim().toLowerCase();
                const t = AppState.tasks.find(t => t.status === 'done' && t.text.toLowerCase().includes(searchText));
                if (t) {
                    await Tasks.handleAction(t.id, 'reopen');
                    actionsPerformed.push(`🔄 Réouvert: ${t.text}`);
                }
            }
        }

        // ACTION:DELETE_DUPLICATES
        if (response.includes('ACTION:DELETE_DUPLICATES')) {
            await this.handleDeleteDuplicates();
            actionsPerformed.push(`✅ Doublons traités`);
        }

        if (actionsPerformed.length > 0) {
            Tasks.render();
            Projects.renderFilter();
            response = response.replace(/ACTION:[A-Z_]+\|[^\n]*/g, '').trim();
            response += '\n\n' + actionsPerformed.join('\n');
        }

        return response.trim();
    },

    /**
     * Envoie un message au chatbot
     */
    async send() {
        const message = Utils.$('chatbot-input').value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        Utils.$('chatbot-input').value = '';

        // Commandes locales d'abord
        const localHandled = await this.handleLocalCommands(message);
        if (localHandled) return;

        const loadingDiv = this.addMessage('Réflexion...', 'assistant loading');

        try {
            let aiResponse;
            let hadActions = false;

            // Utiliser le nouveau backend AI si disponible
            if (typeof ApiAi !== 'undefined' && ApiAi.isAvailable()) {
                console.log('🤖 Using backend AI (smart routing)');
                const result = await ApiAi.chat({ message });
                aiResponse = result.content;
                hadActions = result.actions && result.actions.length > 0;

                // Log cost for monitoring
                console.log(`💰 AI Cost: $${result.cost?.toFixed(6)} (${result.model})`);

                // Process backend actions
                if (hadActions) {
                    for (const action of result.actions) {
                        await this.executeAction(action);
                    }
                }
            } else {
                // Fallback to N8N
                console.log('🤖 Using N8N fallback');
                const context = this.buildContext();
                aiResponse = await ApiService.sendChatMessage({
                    message,
                    context,
                    user: AppState.currentUser.name,
                    userId: AppState.currentUser.id
                });
                hadActions = aiResponse && aiResponse.includes('ACTION:');
                aiResponse = await this.processAIActions(aiResponse);
            }

            loadingDiv.remove();
            if (hadActions) await Tasks.load();
            this.addMessage(aiResponse || 'OK!', 'assistant');
        } catch (e) {
            loadingDiv.remove();
            this.addMessage('Erreur de connexion', 'assistant');
            console.error('❌ Erreur chatbot:', e);
        }
    },

    /**
     * Execute an action from the AI
     */
    async executeAction(action) {
        console.log('🎯 Executing action:', action.type, action.data);

        switch (action.type) {
            case 'CREATE_TASK':
                await Tasks.create({
                    text: action.data.title,
                    priority: action.data.priority,
                    project: action.data.project
                });
                break;

            case 'COMPLETE_TASK':
                await Tasks.handleAction(action.data.taskId, 'done');
                break;

            case 'DELETE_TASK':
                await Tasks.handleAction(action.data.taskId, 'delete');
                break;

            case 'UPDATE_TASK':
                // TODO: Implement task update
                console.log('⚠️ UPDATE_TASK not yet implemented');
                break;
        }
    },

    // =============================================
    // MÉDIA - Audio, Image, Fichier
    // =============================================

    /**
     * Initialise les boutons média
     */
    initMediaButtons() {
        const micBtn = Utils.$('chat-mic-btn');
        const cameraBtn = Utils.$('chat-camera-btn');
        const fileBtn = Utils.$('chat-file-btn');
        const cameraInput = Utils.$('chat-camera-input');
        const fileInput = Utils.$('chat-file-input');

        if (!micBtn) return;

        // Micro : maintenir appuyé
        micBtn.addEventListener('mousedown', () => this.startRecording());
        micBtn.addEventListener('mouseup', () => this.stopRecording(false));
        micBtn.addEventListener('mouseleave', () => {
            if (AppState.media.isRecording) this.stopRecording(true);
        });

        // Touch events pour mobile
        micBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startRecording();
        }, { passive: false });
        micBtn.addEventListener('touchend', () => this.stopRecording(false));
        micBtn.addEventListener('touchcancel', () => this.stopRecording(true));

        // Caméra
        if (cameraBtn && cameraInput) {
            cameraBtn.addEventListener('click', () => cameraInput.click());
            cameraInput.addEventListener('change', (e) => this.handleImageSelect(e));
        }

        // Fichier
        if (fileBtn && fileInput) {
            fileBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Bouton annuler enregistrement
        const cancelBtn = Utils.$('record-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.stopRecording(true));
        }
    },

    /**
     * Démarre l'enregistrement audio
     */
    async startRecording() {
        if (AppState.media.isRecording) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Setup analyser
            AppState.media.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            AppState.media.analyser = AppState.media.audioContext.createAnalyser();
            const source = AppState.media.audioContext.createMediaStreamSource(stream);
            source.connect(AppState.media.analyser);
            AppState.media.analyser.fftSize = 64;
            AppState.media.dataArray = new Uint8Array(AppState.media.analyser.frequencyBinCount);

            this.createWaveformBars();

            AppState.media.recorder = new MediaRecorder(stream);
            AppState.media.audioChunks = [];

            AppState.media.recorder.ondataavailable = (e) => {
                if (e.data.size > 0) AppState.media.audioChunks.push(e.data);
            };

            AppState.media.recorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                if (AppState.media.audioContext) AppState.media.audioContext.close();
                cancelAnimationFrame(AppState.media.animationId);
                clearInterval(AppState.media.timerInterval);

                if (AppState.media.audioChunks.length > 0 && !window.recordingCancelled) {
                    const audioBlob = new Blob(AppState.media.audioChunks, { type: 'audio/webm' });
                    await this.sendAudioMessage(audioBlob);
                }
                window.recordingCancelled = false;
            };

            AppState.media.recorder.start();
            Utils.$('chat-mic-btn').classList.add('recording');
            Utils.$('audio-recorder-ui').classList.add('active');
            Utils.$('chatbot-input').style.display = 'none';
            AppState.media.isRecording = true;

            AppState.media.recordingStartTime = Date.now();
            this.updateRecordTimer();
            AppState.media.timerInterval = setInterval(() => this.updateRecordTimer(), 1000);

            this.animateWaveform();

        } catch (err) {
            console.error('❌ Erreur micro:', err);
            this.addMessage('❌ Impossible d\'accéder au micro', 'assistant');
        }
    },

    /**
     * Crée les barres du visualiseur audio
     */
    createWaveformBars() {
        const waveform = Utils.$('audio-waveform');
        waveform.innerHTML = '';
        for (let i = 0; i < 20; i++) {
            const bar = document.createElement('div');
            bar.className = 'waveform-bar';
            bar.style.height = '4px';
            waveform.appendChild(bar);
        }
    },

    /**
     * Anime le visualiseur audio
     */
    animateWaveform() {
        if (!AppState.media.isRecording) return;

        AppState.media.analyser.getByteFrequencyData(AppState.media.dataArray);
        const bars = document.querySelectorAll('.waveform-bar');

        bars.forEach((bar, i) => {
            const value = AppState.media.dataArray[i] || 0;
            const height = Math.max(4, (value / 255) * 28);
            bar.style.height = height + 'px';
        });

        AppState.media.animationId = requestAnimationFrame(() => this.animateWaveform());
    },

    /**
     * Met à jour le timer d'enregistrement
     */
    updateRecordTimer() {
        const elapsed = Math.floor((Date.now() - AppState.media.recordingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timer = Utils.$('record-timer');
        if (timer) timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    /**
     * Arrête l'enregistrement
     * @param {boolean} cancel - Annuler au lieu d'envoyer
     */
    stopRecording(cancel = false) {
        window.recordingCancelled = cancel;

        if (cancel) {
            AppState.media.audioChunks = [];
        }

        if (AppState.media.recorder && AppState.media.recorder.state !== 'inactive') {
            AppState.media.recorder.stop();
        }

        Utils.$('chat-mic-btn')?.classList.remove('recording');
        Utils.$('audio-recorder-ui')?.classList.remove('active');
        if (Utils.$('chatbot-input')) Utils.$('chatbot-input').style.display = '';
        AppState.media.isRecording = false;

        clearInterval(AppState.media.timerInterval);
        cancelAnimationFrame(AppState.media.animationId);
    },

    /**
     * Envoie un message audio
     * @param {Blob} audioBlob - Blob audio
     */
    async sendAudioMessage(audioBlob) {
        const base64 = await Utils.blobToBase64(audioBlob);

        this.addMessage('🎙️ Audio envoyé...', 'user');
        const loadingDiv = this.addMessage('Analyse audio...', 'assistant loading');

        try {
            const aiResponse = await ApiService.sendChatMessage({
                type: 'audio',
                audio: base64,
                mimeType: 'audio/webm',
                user: AppState.currentUser.name,
                userId: AppState.currentUser.id,
                context: this.buildContext()
            });

            loadingDiv.remove();
            if (aiResponse && aiResponse.includes('ACTION:')) {
                const cleaned = await this.processAIActions(aiResponse);
                await Tasks.load();
                this.addMessage(cleaned || 'Audio reçu !', 'assistant');
            } else {
                this.addMessage(aiResponse || 'Audio reçu !', 'assistant');
            }
        } catch (e) {
            loadingDiv.remove();
            this.addMessage('❌ Erreur envoi audio', 'assistant');
            console.error('❌ Erreur envoi audio:', e);
        }
    },

    /**
     * Gère la sélection d'image
     * @param {Event} e - Événement change
     */
    async handleImageSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        const base64 = await Utils.fileToBase64(file);

        // Preview
        const previewDiv = document.createElement('div');
        previewDiv.className = 'chat-msg user media-preview';
        previewDiv.innerHTML = `<img src="${base64}" alt="Photo">`;
        Utils.$('chatbot-messages').appendChild(previewDiv);
        Utils.$('chatbot-messages').scrollTop = Utils.$('chatbot-messages').scrollHeight;

        const loadingDiv = this.addMessage('Analyse image...', 'assistant loading');

        try {
            const aiResponse = await ApiService.sendChatMessage({
                type: 'image',
                image: base64,
                mimeType: file.type,
                fileName: file.name,
                user: AppState.currentUser.name,
                userId: AppState.currentUser.id,
                context: this.buildContext()
            });

            loadingDiv.remove();
            if (aiResponse && aiResponse.includes('ACTION:')) {
                const cleaned = await this.processAIActions(aiResponse);
                await Tasks.load();
                this.addMessage(cleaned || 'Image reçue !', 'assistant');
            } else {
                this.addMessage(aiResponse || 'Image reçue !', 'assistant');
            }
        } catch (e) {
            loadingDiv.remove();
            this.addMessage('❌ Erreur envoi image', 'assistant');
            console.error('❌ Erreur envoi image:', e);
        }

        e.target.value = '';
    },

    /**
     * Gère la sélection de fichier
     * @param {Event} e - Événement change
     */
    async handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        const base64 = await Utils.fileToBase64(file);

        this.addMessage(`📎 Fichier: ${file.name}`, 'user');
        const loadingDiv = this.addMessage('Analyse fichier...', 'assistant loading');

        try {
            const aiResponse = await ApiService.sendChatMessage({
                type: 'file',
                file: base64,
                mimeType: file.type,
                fileName: file.name,
                user: AppState.currentUser.name,
                userId: AppState.currentUser.id,
                context: this.buildContext()
            });

            loadingDiv.remove();
            if (aiResponse && aiResponse.includes('ACTION:')) {
                const cleaned = await this.processAIActions(aiResponse);
                await Tasks.load();
                this.addMessage(cleaned || 'Fichier reçu !', 'assistant');
            } else {
                this.addMessage(aiResponse || 'Fichier reçu !', 'assistant');
            }
        } catch (e) {
            loadingDiv.remove();
            this.addMessage('❌ Erreur envoi fichier', 'assistant');
            console.error('❌ Erreur envoi fichier:', e);
        }

        e.target.value = '';
    },

    /**
     * Initialise les événements
     */
    initEvents() {
        const toggleBtn = Utils.$('chatbot-toggle');
        const closeBtn = Utils.$('chatbot-close');
        const resizeBtn = Utils.$('chatbot-resize');
        const fontSizeBtn = Utils.$('chatbot-font-size');
        const sendBtn = Utils.$('chatbot-send');
        const input = Utils.$('chatbot-input');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                Utils.$('chatbot-window').classList.add('hidden');
                // Scroll vers dernière tâche modifiée
                if (AppState.ui.lastChatbotActionTaskId) {
                    setTimeout(() => {
                        const bubble = document.querySelector(`[data-id="${AppState.ui.lastChatbotActionTaskId}"]`);
                        if (bubble) {
                            Utils.scrollTo(bubble);
                            bubble.classList.add('search-match');
                            setTimeout(() => bubble.classList.remove('search-match'), 2000);
                        }
                        AppState.ui.lastChatbotActionTaskId = null;
                    }, 300);
                }
            });
        }

        if (resizeBtn) {
            resizeBtn.addEventListener('click', () => this.toggleSize());
        }

        if (fontSizeBtn) {
            fontSizeBtn.addEventListener('click', () => this.toggleFontSize());
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.send());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.send();
            });
        }

        this.initMediaButtons();
    }
};

// Exposer globalement pour compatibilité
window.Chatbot = Chatbot;
window.toggleChatbot = () => Chatbot.toggle();
window.toggleChatbotSize = () => Chatbot.toggleSize();
window.toggleChatbotFontSize = () => Chatbot.toggleFontSize();
window.sendChatMessage = () => Chatbot.send();
window.addChatMsg = (text, cls) => Chatbot.addMessage(text, cls);
window.buildAIContext = () => Chatbot.buildContext();
window.processAIActions = (response) => Chatbot.processAIActions(response);
window.handleLocalCommands = (message) => Chatbot.handleLocalCommands(message);
