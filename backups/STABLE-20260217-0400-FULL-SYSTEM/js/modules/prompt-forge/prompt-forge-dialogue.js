/**
 * PROMPT FORGE - DIALOGUE IA v1.0
 * ProductiveApp - Dialogue IA × IA avec amplification par le Forge
 * "Faire parler une IA avec une autre IA" - Vision utilisateur
 * Version: 1.0
 */

const PromptForgeDialogue = (function() {
    'use strict';

    // ─── State ─────────────────────────────────────────────────────────────────
    let messages = [];      // {id, role: 'user'|'ai'|'system', content, forged, ts}
    let isLoading = false;
    let autoForge = false;  // Forge chaque message avant envoi
    let renderCallback = null;
    let toastCallback = null;

    // Personas IA disponibles
    const AI_PERSONAS = [
        { id: 'analyst',    name: 'Analyste Stratège', icon: '🔬', style: 'analytique, précis, chiffres, logique' },
        { id: 'coach',      name: 'Coach Transformer',  icon: '🚀', style: 'motivant, actionnable, orienté résultats, défi' },
        { id: 'philosopher',name: 'Philosophe Socrate',  icon: '🏛️', style: 'questionnement profond, paradoxes, sagesse ancienne' },
        { id: 'creative',   name: 'Créateur Génial',     icon: '🎨', style: 'imaginatif, métaphores, connexions inattendues, art' },
        { id: 'critic',     name: 'Critique Bienveillant', icon: '⚖️', style: 'nuancé, contre-arguments, perspectives opposées' }
    ];

    let activePersona = AI_PERSONAS[0];

    // ─── Core Methods ──────────────────────────────────────────────────────────

    /**
     * Importer un prompt forgé comme point de départ du dialogue
     */
    function importPrompt(promptText) {
        if (!promptText) return;
        messages = [];
        // Message système d'amorçage
        messages.push({
            id: Date.now(),
            role: 'system',
            content: '⚡ Prompt Forgé importé — Dialogue IA initialisé',
            ts: new Date().toISOString()
        });
        // Le prompt devient le premier message utilisateur
        messages.push({
            id: Date.now() + 1,
            role: 'user',
            content: promptText,
            forged: true,
            ts: new Date().toISOString()
        });
        if (renderCallback) renderCallback();
        // Auto-envoyer le premier message forgé
        setTimeout(() => sendToAI(promptText), 400);
    }

    /**
     * Envoyer un message (avec ou sans forge préalable)
     */
    async function send(text, forceForge) {
        if (!text || !text.trim() || isLoading) return;
        const useForge = forceForge !== undefined ? forceForge : autoForge;

        let finalText = text.trim();
        let wasForged = false;

        // Si auto-forge activé, on amplifie le message d'abord
        if (useForge && typeof PromptForgeCore !== 'undefined') {
            isLoading = true;
            if (renderCallback) renderCallback();
            try {
                const forged = await PromptForgeCore.generatePrompt(text);
                if (forged && forged.prompt) {
                    finalText = forged.prompt;
                    wasForged = true;
                }
            } catch (e) {
                console.warn('PromptForgeDialogue: forge failed, using raw text', e);
            }
        }

        // Ajouter le message utilisateur
        messages.push({
            id: Date.now(),
            role: 'user',
            content: finalText,
            forged: wasForged,
            ts: new Date().toISOString()
        });

        if (renderCallback) renderCallback();
        await sendToAI(finalText);
    }

    /**
     * Envoyer à l'IA backend et récupérer la réponse
     */
    async function sendToAI(userMessage) {
        isLoading = true;
        if (renderCallback) renderCallback();

        try {
            if (typeof ApiAi === 'undefined') throw new Error('ApiAi non disponible');

            const personaSystem = `Tu es ${activePersona.name}. Ton style de réponse est : ${activePersona.style}.
Réponds en français, de manière approfondie et pertinente.
Tu es dans un "Dialogue IA" — traite chaque message comme une opportunité d'apporter une valeur maximale.
Garde tes réponses entre 100 et 300 mots, structurées et percutantes.`;

            const response = await ApiAi.generate(userMessage, personaSystem);
            const aiText = typeof response === 'string' ? response : (response.content || response.text || JSON.stringify(response));

            messages.push({
                id: Date.now(),
                role: 'ai',
                content: aiText,
                persona: activePersona.name,
                personaIcon: activePersona.icon,
                ts: new Date().toISOString()
            });
        } catch (err) {
            console.error('PromptForgeDialogue: AI error', err);
            messages.push({
                id: Date.now(),
                role: 'ai',
                content: 'Une erreur est survenue lors de la communication avec l\'IA. Vérifiez votre connexion et réessayez.',
                error: true,
                ts: new Date().toISOString()
            });
            if (toastCallback) toastCallback('Erreur IA — réessayez', 'error');
        } finally {
            isLoading = false;
            if (renderCallback) renderCallback();
        }
    }

    /**
     * Changer de persona IA
     */
    function setPersona(personaId) {
        const p = AI_PERSONAS.find(p => p.id === personaId);
        if (p) {
            activePersona = p;
            messages.push({
                id: Date.now(),
                role: 'system',
                content: `🔄 Persona changée → ${p.icon} ${p.name}`,
                ts: new Date().toISOString()
            });
            if (renderCallback) renderCallback();
        }
    }

    /**
     * Vider le dialogue
     */
    function clear() {
        messages = [];
        isLoading = false;
        if (renderCallback) renderCallback();
    }

    // ─── Render ────────────────────────────────────────────────────────────────

    function renderView() {
        const hasMessages = messages.length > 0;

        return `
<div class="pf-dialogue-view">

    <!-- Header avec persona selector -->
    <div class="pf-dialogue-header">
        <div class="pf-dialogue-title">
            <span class="pf-dialogue-icon">🤖</span>
            <span>Dialogue IA</span>
            <span class="pf-dialogue-badge">BETA</span>
        </div>
        <div class="pf-persona-selector">
            <span class="pf-persona-label">Persona</span>
            <div class="pf-persona-pills">
                ${AI_PERSONAS.map(p => `
                <button class="pf-persona-pill ${p.id === activePersona.id ? 'active' : ''}"
                        data-persona="${p.id}" title="${p.style}">
                    ${p.icon} ${p.name.split(' ')[0]}
                </button>`).join('')}
            </div>
        </div>
        <div class="pf-dialogue-actions">
            <label class="pf-auto-forge-toggle" title="Amplifie chaque message via le Forge avant envoi">
                <input type="checkbox" id="pf-auto-forge-cb" ${autoForge ? 'checked' : ''}>
                <span class="pf-toggle-track">
                    <span class="pf-toggle-thumb"></span>
                </span>
                <span class="pf-toggle-label">⚡ Auto-Forge</span>
            </label>
            <button class="pf-dialogue-clear" id="pf-clear-btn" title="Vider le dialogue">
                🗑️
            </button>
        </div>
    </div>

    <!-- Zone de messages -->
    <div class="pf-dialogue-messages" id="pf-dialogue-messages">
        ${hasMessages ? messages.map(m => renderMessage(m)).join('') : renderEmptyState()}
        ${isLoading ? renderTypingIndicator() : ''}
    </div>

    <!-- Zone d'entrée -->
    <div class="pf-dialogue-input-area">
        <div class="pf-dialogue-input-wrap">
            <textarea
                class="pf-dialogue-input"
                id="pf-dialogue-input"
                placeholder="Parlez à l'IA… ou importez un prompt forgé via ⚡ Lancer l'IA"
                rows="2"
                ${isLoading ? 'disabled' : ''}
            ></textarea>
            <button class="pf-dialogue-send ${isLoading ? 'loading' : ''}"
                    id="pf-send-btn"
                    ${isLoading ? 'disabled' : ''}>
                ${isLoading
                    ? '<span class="pf-btn-spinner"></span>'
                    : '<span>Envoyer</span><span class="pf-send-icon">↑</span>'}
            </button>
        </div>
        <div class="pf-dialogue-hint">
            <span>Entrée pour envoyer • Shift+Entrée pour nouvelle ligne</span>
            <span class="pf-msg-count">${messages.filter(m => m.role !== 'system').length} échanges</span>
        </div>
    </div>

</div>`;
    }

    function renderMessage(msg) {
        if (msg.role === 'system') {
            return `<div class="pf-msg pf-msg-system">
                <span>${msg.content}</span>
            </div>`;
        }

        if (msg.role === 'user') {
            return `<div class="pf-msg pf-msg-user">
                <div class="pf-msg-bubble pf-bubble-user">
                    ${msg.forged ? '<span class="pf-forged-badge">⚡ Forgé</span>' : ''}
                    <p>${escapeHtml(msg.content)}</p>
                </div>
                <div class="pf-msg-meta">${formatTime(msg.ts)}</div>
            </div>`;
        }

        if (msg.role === 'ai') {
            const content = msg.error
                ? `<p class="pf-error-text">${escapeHtml(msg.content)}</p>`
                : formatAIContent(msg.content);
            return `<div class="pf-msg pf-msg-ai">
                <div class="pf-msg-avatar">${msg.personaIcon || '🤖'}</div>
                <div class="pf-msg-body">
                    <div class="pf-msg-persona">${msg.persona || 'IA'}</div>
                    <div class="pf-msg-bubble pf-bubble-ai ${msg.error ? 'pf-bubble-error' : ''}">
                        ${content}
                    </div>
                    <div class="pf-msg-meta">${formatTime(msg.ts)}</div>
                </div>
            </div>`;
        }

        return '';
    }

    function renderTypingIndicator() {
        return `<div class="pf-msg pf-msg-ai pf-msg-typing">
            <div class="pf-msg-avatar">${activePersona.icon}</div>
            <div class="pf-msg-body">
                <div class="pf-msg-persona">${activePersona.name}</div>
                <div class="pf-msg-bubble pf-bubble-ai">
                    <div class="pf-typing-dots">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function renderEmptyState() {
        return `<div class="pf-dialogue-empty">
            <div class="pf-dialogue-empty-icon">🤖</div>
            <h3>Dialogue IA × IA</h3>
            <p>Forgez un prompt parfait puis lancez un dialogue profond avec l'IA.<br>
            Ou posez directement votre question ci-dessous.</p>
            <div class="pf-dialogue-starters">
                <button class="pf-starter-btn" data-text="Analyse les tendances clés qui vont transformer mon secteur dans les 5 prochaines années">
                    🔮 Tendances futures
                </button>
                <button class="pf-starter-btn" data-text="Identifie mes 3 plus grands angles morts dans ma façon de penser et propose des exercices pour les corriger">
                    🧠 Angles morts cognitifs
                </button>
                <button class="pf-starter-btn" data-text="Crée un plan de transformation personnelle sur 90 jours basé sur les principes des hauts performers">
                    🚀 Plan 90 jours
                </button>
            </div>
        </div>`;
    }

    // ─── Events ────────────────────────────────────────────────────────────────

    function attachEvents(renderCb, toastCb) {
        renderCallback = renderCb;
        toastCallback = toastCb;

        // Delegate on document since view re-renders
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeydown);
    }

    function handleClick(e) {
        // Send button
        if (e.target.closest('#pf-send-btn') && !isLoading) {
            const input = document.getElementById('pf-dialogue-input');
            if (input && input.value.trim()) {
                const text = input.value.trim();
                input.value = '';
                send(text);
            }
            return;
        }

        // Clear button
        if (e.target.closest('#pf-clear-btn')) {
            clear();
            return;
        }

        // Starter buttons
        const starter = e.target.closest('.pf-starter-btn');
        if (starter) {
            const text = starter.dataset.text;
            if (text) send(text);
            return;
        }

        // Persona pills
        const pill = e.target.closest('.pf-persona-pill');
        if (pill && pill.dataset.persona) {
            setPersona(pill.dataset.persona);
            return;
        }
    }

    function handleKeydown(e) {
        // Auto-forge checkbox
        const cb = document.getElementById('pf-auto-forge-cb');
        if (cb) autoForge = cb.checked;

        const input = document.getElementById('pf-dialogue-input');
        if (!input || document.activeElement !== input) return;

        // Enter sans Shift → envoyer
        if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
            e.preventDefault();
            const text = input.value.trim();
            if (text) {
                input.value = '';
                send(text);
            }
        }
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatAIContent(text) {
        // Convert simple markdown-ish to HTML
        return escapeHtml(text)
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\*\s(.+)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    function formatTime(isoString) {
        try {
            const d = new Date(isoString);
            return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    }

    /**
     * Scroll vers le bas des messages après render
     */
    function scrollToBottom() {
        const container = document.getElementById('pf-dialogue-messages');
        if (container) {
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
            });
        }
    }

    // Exposé publiquement pour auto-scroll après render
    function onAfterRender() {
        scrollToBottom();
        // Sync auto-forge checkbox
        const cb = document.getElementById('pf-auto-forge-cb');
        if (cb) cb.checked = autoForge;
        // Restore input focus
        if (!isLoading) {
            const input = document.getElementById('pf-dialogue-input');
            if (input) input.focus();
        }
    }

    return {
        importPrompt,
        send,
        clear,
        setPersona,
        renderView,
        attachEvents,
        onAfterRender,
        get isLoading() { return isLoading; },
        get messages() { return messages; }
    };
})();

// Export global
if (typeof window !== 'undefined') {
    window.PromptForgeDialogue = PromptForgeDialogue;
}
