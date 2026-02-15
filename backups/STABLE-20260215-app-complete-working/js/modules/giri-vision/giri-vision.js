// js/modules/giri-vision/giri-vision.js
import { canvasData } from '../canvas/canvas-data.js';
import { giriVisionUI } from './giri-vision-ui.js';

export const giriVisionModule = {
    isOpen: false,
    conversationHistory: [],

    init() {
        console.log('🔮 Giri Vision init');
        this.setupEventListeners();
    },

    setupEventListeners() {
        const toggleBtn = document.getElementById('giri-vision-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }

        const closeBtn = document.getElementById('giri-vision-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        const sendBtn = document.getElementById('giri-send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        const input = document.getElementById('giri-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        const panel = document.getElementById('giri-vision-panel');
        if (panel) {
            panel.classList.add('active');
            this.isOpen = true;

            const input = document.getElementById('giri-input');
            if (input) input.focus();
        }
    },

    close() {
        const panel = document.getElementById('giri-vision-panel');
        if (panel) {
            panel.classList.remove('active');
            this.isOpen = false;
        }
    },

    async sendMessage() {
        const input = document.getElementById('giri-input');
        if (!input || !input.value.trim()) return;

        const userMessage = input.value.trim();
        input.value = '';

        giriVisionUI.addMessage('user', userMessage);

        const tasks = canvasData.getAllTasks();
        const context = this.buildContext(tasks);

        try {
            const response = await this.callAI(userMessage, context);
            giriVisionUI.addMessage('assistant', response);
        } catch (error) {
            console.error('Giri Vision error:', error);
            giriVisionUI.addMessage('assistant', 'Désolé, une erreur est survenue. Réessaye dans un moment.');
        }
    },

    buildContext(tasks) {
        const todoCount = tasks.filter(t => !t.completed).length;
        const doneCount = tasks.filter(t => t.completed).length;
        const urgentCount = tasks.filter(t => t.priority === 'urgent' && !t.completed).length;

        return `Contexte: ${todoCount} tâches à faire, ${doneCount} terminées, ${urgentCount} urgentes.`;
    },

    async callAI(message, context) {
        // ✅ SECURE: Calls backend which has the OpenAI key
        // Backend uses GPT-4o-mini (fast/cheap) or GPT-4o (complex requests)

        if (typeof ApiAi === 'undefined') {
            throw new Error('ApiAi service not available');
        }

        // Build system prompt
        const systemPrompt = `Tu es Mahayawen, assistant IA de ProductiveApp. ${context}`;

        // Call backend /api/v1/ai/generate which uses OpenAI GPT
        const response = await ApiAi.generate(message, systemPrompt);

        return response;
    }
};
