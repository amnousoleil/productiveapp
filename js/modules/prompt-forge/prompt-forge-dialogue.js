/**
 * PROMPT FORGE - DIALOGUE AMPLIFIÉ v2.0
 * Vision : Boucle d'amplification conversation
 *
 * FLOW :
 *  1. Forge génère le prompt parfait
 *  2. User l'envoie à ChatGPT (bouton "Copier pour ChatGPT")
 *  3. User colle la réponse de ChatGPT ici
 *  4. Le Forge analyse la réponse + génère la meilleure question de suivi
 *  5. Boucle → chaque tour monte d'un niveau
 *
 * Mode alternatif : notre IA répond directement (sans passer par ChatGPT)
 */

const PromptForgeDialogue = (function() {
    'use strict';

    // ─── State ─────────────────────────────────────────────────────────────────
    let turns = [];          // [{id, prompt, aiResponse, amplified, ts}]
    let currentTurn = null;  // Turn en cours de construction
    let isForging  = false;  // Forge en train de générer le prompt
    let isAmplifying = false;// Forge en train d'amplifier la réponse
    let mode = 'chatgpt';    // 'chatgpt' | 'internal'
    let renderCallback = null;
    let toastCallback  = null;

    // ─── Import depuis le Générateur ─────────────────────────────────────────

    function importPrompt(promptText) {
        if (!promptText) return;
        turns = [];
        currentTurn = {
            id: Date.now(),
            prompt: promptText,
            aiResponse: null,
            amplified: null,
            ts: new Date().toISOString()
        };
        turns.push(currentTurn);
        if (renderCallback) renderCallback();
        // Si mode interne : l'IA répond directement
        if (mode === 'internal') _internalRespond(promptText);
    }

    // ─── ChatGPT Mode ────────────────────────────────────────────────────────

    function copyToGPT(promptText) {
        const text = promptText || (currentTurn && currentTurn.prompt) || '';
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                if (toastCallback) toastCallback('✅ Prompt copié ! Colle-le dans ChatGPT', 'success');
            });
        }
    }

    function pasteGPTResponse(responseText) {
        if (!responseText || !currentTurn) return;
        currentTurn.aiResponse = responseText;
        if (renderCallback) renderCallback();
        // Amplifier automatiquement
        _amplify();
    }

    // ─── Mode Interne (sans ChatGPT) ─────────────────────────────────────────

    async function _internalRespond(promptText) {
        isForging = true;
        if (renderCallback) renderCallback();
        try {
            if (typeof ApiAi === 'undefined') throw new Error('ApiAi manquant');
            const sys = `Tu es un assistant expert. Réponds en français, de manière approfondie, structurée et ultra-pertinente. Entre 150 et 350 mots.`;
            const resp = await ApiAi.generate(promptText, sys);
            const text = typeof resp === 'string' ? resp : (resp.content || resp.text || '');
            if (currentTurn) {
                currentTurn.aiResponse = text;
                if (renderCallback) renderCallback();
                await _amplify();
            }
        } catch (e) {
            console.error('PromptForgeDialogue: internal respond error', e);
            if (toastCallback) toastCallback('Erreur IA — réessayez', 'error');
        } finally {
            isForging = false;
            if (renderCallback) renderCallback();
        }
    }

    // ─── Amplification ───────────────────────────────────────────────────────

    async function _amplify() {
        if (!currentTurn || !currentTurn.aiResponse) return;
        isAmplifying = true;
        if (renderCallback) renderCallback();
        try {
            if (typeof ApiAi === 'undefined') throw new Error('ApiAi manquant');

            const conversationContext = turns.slice(0, -1).map((t, i) =>
                `Tour ${i+1}:\nQuestion: ${t.prompt}\nRéponse: ${t.aiResponse || '(en attente)'}`
            ).join('\n\n');

            const amplifySystem = `Tu es un expert en prompt engineering et en dialogue socratique.
Ton rôle : analyser une conversation et générer la question de suivi LA PLUS PUISSANTE possible.
La question doit :
- Approfondir exactement là où la réponse précédente ouvre le plus de valeur
- Pousser vers le concret, l'actionnable, ou révéler une vérité cachée
- Être formulée comme un prompt complet et autonome, prêt à être envoyé à une IA
- Ne PAS répéter ce qui a déjà été dit
- Monter d'un cran en sophistication à chaque tour
Réponds UNIQUEMENT avec le prompt, rien d'autre. Pas d'introduction, pas d'explication.`;

            const amplifyPrompt = `${conversationContext ? 'Historique de la conversation:\n' + conversationContext + '\n\n' : ''}Question précédente: ${currentTurn.prompt}\n\nRéponse reçue:\n${currentTurn.aiResponse}\n\nGénère maintenant la meilleure question de suivi possible.`;

            const amplified = await ApiAi.generate(amplifyPrompt, amplifySystem);
            const amplifiedText = typeof amplified === 'string' ? amplified : (amplified.content || amplified.text || '');
            if (currentTurn) currentTurn.amplified = amplifiedText.trim();
        } catch (e) {
            console.error('PromptForgeDialogue: amplify error', e);
        } finally {
            isAmplifying = false;
            if (renderCallback) renderCallback();
        }
    }

    // ─── Continuer avec le prompt amplifié ───────────────────────────────────

    function useAmplified() {
        if (!currentTurn || !currentTurn.amplified) return;
        const nextPrompt = currentTurn.amplified;
        const newTurn = {
            id: Date.now(),
            prompt: nextPrompt,
            aiResponse: null,
            amplified: null,
            ts: new Date().toISOString()
        };
        turns.push(newTurn);
        currentTurn = newTurn;
        if (renderCallback) renderCallback();
        if (mode === 'internal') _internalRespond(nextPrompt);
    }

    function editAndSend(promptText) {
        if (!promptText || !promptText.trim()) return;
        const newTurn = {
            id: Date.now(),
            prompt: promptText.trim(),
            aiResponse: null,
            amplified: null,
            ts: new Date().toISOString()
        };
        turns.push(newTurn);
        currentTurn = newTurn;
        if (renderCallback) renderCallback();
        if (mode === 'internal') _internalRespond(promptText.trim());
    }

    function clear() {
        turns = [];
        currentTurn = null;
        isForging = false;
        isAmplifying = false;
        if (renderCallback) renderCallback();
    }

    function setMode(m) {
        mode = m;
        if (renderCallback) renderCallback();
    }

    // ─── Render ──────────────────────────────────────────────────────────────

    function renderView() {
        const hasTurns = turns.length > 0;
        const turnNum = turns.length;

        return `
<div class="pfd-root">

    <!-- TOPBAR -->
    <div class="pfd-topbar">
        <div class="pfd-topbar-left">
            <span class="pfd-logo">⚡</span>
            <div>
                <div class="pfd-title">Dialogue Amplifié</div>
                <div class="pfd-subtitle">Chaque réponse forge la question suivante</div>
            </div>
        </div>
        <div class="pfd-topbar-right">
            <div class="pfd-mode-switch">
                <button class="pfd-mode-btn ${mode === 'chatgpt' ? 'active' : ''}" data-mode="chatgpt">
                    ChatGPT
                </button>
                <button class="pfd-mode-btn ${mode === 'internal' ? 'active' : ''}" data-mode="internal">
                    IA Interne
                </button>
            </div>
            ${hasTurns ? `<button class="pfd-clear-btn" id="pfd-clear">🗑 Recommencer</button>` : ''}
        </div>
    </div>

    <!-- EXPLICATION MODE (si aucun tour) -->
    ${!hasTurns ? renderOnboarding() : ''}

    <!-- TOURS DE CONVERSATION -->
    ${hasTurns ? `<div class="pfd-turns">${turns.map((t, i) => renderTurn(t, i)).join('')}</div>` : ''}

    <!-- ZONE PASTE ChatGPT (si mode chatgpt, tour en attente de réponse) -->
    ${hasTurns && mode === 'chatgpt' && currentTurn && !currentTurn.aiResponse && !isForging
        ? renderPasteZone()
        : ''}

</div>`;
    }

    function renderOnboarding() {
        if (mode === 'chatgpt') {
            return `
<div class="pfd-onboarding">
    <div class="pfd-steps">
        <div class="pfd-step">
            <div class="pfd-step-num">1</div>
            <div class="pfd-step-body">
                <strong>Forge ton prompt</strong>
                <span>Va dans <em>Générateur</em>, décris ton objectif, clique <em>Forger</em></span>
            </div>
        </div>
        <div class="pfd-step-arrow">→</div>
        <div class="pfd-step">
            <div class="pfd-step-num">2</div>
            <div class="pfd-step-body">
                <strong>Envoie à ChatGPT</strong>
                <span>Copie le prompt forgé et colle-le dans ChatGPT</span>
            </div>
        </div>
        <div class="pfd-step-arrow">→</div>
        <div class="pfd-step">
            <div class="pfd-step-num">3</div>
            <div class="pfd-step-body">
                <strong>Colle la réponse</strong>
                <span>Reviens ici et colle ce que ChatGPT t'a répondu</span>
            </div>
        </div>
        <div class="pfd-step-arrow">→</div>
        <div class="pfd-step pfd-step-highlight">
            <div class="pfd-step-num">⚡</div>
            <div class="pfd-step-body">
                <strong>Le Forge amplifie</strong>
                <span>On génère la meilleure question de suivi → boucle infinie vers le haut</span>
            </div>
        </div>
    </div>
    <p class="pfd-onboarding-hint">Commence en générant un prompt dans l'onglet <strong>⚡ Générateur</strong> →</p>
</div>`;
        } else {
            return `
<div class="pfd-onboarding pfd-onboarding-internal">
    <div class="pfd-internal-icon">🤖</div>
    <h3>Mode IA Interne</h3>
    <p>Notre IA répond directement, puis le Forge génère automatiquement la meilleure question de suivi. Boucle d'amplification complète sans quitter l'app.</p>
    <p class="pfd-onboarding-hint">Commence dans l'onglet <strong>⚡ Générateur</strong> →</p>
</div>`;
        }
    }

    function renderTurn(turn, index) {
        const isLast = index === turns.length - 1;
        return `
<div class="pfd-turn ${isLast ? 'pfd-turn-current' : 'pfd-turn-past'}">

    <!-- En-tête du tour -->
    <div class="pfd-turn-header">
        <span class="pfd-turn-badge">Tour ${index + 1}</span>
        ${index === 0 ? '<span class="pfd-turn-origin">⚡ Prompt Forgé</span>' : '<span class="pfd-turn-origin">🔁 Amplifié</span>'}
    </div>

    <!-- Le prompt envoyé -->
    <div class="pfd-block pfd-block-prompt">
        <div class="pfd-block-label">
            <span class="pfd-block-icon">💬</span>
            <span>Prompt ${mode === 'chatgpt' ? '→ ChatGPT' : '→ IA'}</span>
            ${mode === 'chatgpt' ? `
            <button class="pfd-copy-btn" data-copy="${encodeURIComponent(turn.prompt)}">
                📋 Copier pour ChatGPT
            </button>` : ''}
        </div>
        <div class="pfd-block-content pfd-prompt-text">${escapeHtml(turn.prompt)}</div>
    </div>

    <!-- Réponse IA -->
    ${turn.aiResponse ? `
    <div class="pfd-block pfd-block-response">
        <div class="pfd-block-label">
            <span class="pfd-block-icon">${mode === 'chatgpt' ? '🤖' : '✨'}</span>
            <span>Réponse ${mode === 'chatgpt' ? 'ChatGPT' : 'IA'}</span>
        </div>
        <div class="pfd-block-content">${formatText(turn.aiResponse)}</div>
    </div>` : (isLast && isForging ? `
    <div class="pfd-block pfd-block-loading">
        <div class="pfd-block-label"><span class="pfd-block-icon">✨</span><span>IA en train de répondre…</span></div>
        <div class="pfd-loading-dots"><span></span><span></span><span></span></div>
    </div>` : '')}

    <!-- Prompt amplifié (question de suivi générée) -->
    ${turn.aiResponse && isLast ? `
    <div class="pfd-block pfd-block-amplified ${isAmplifying ? 'pfd-forging' : ''}">
        <div class="pfd-block-label">
            <span class="pfd-block-icon">⚡</span>
            <span>Question de suivi forgée</span>
            ${isAmplifying ? '<span class="pfd-forging-text">Forge en cours…</span>' : ''}
        </div>
        ${turn.amplified && !isAmplifying ? `
        <div class="pfd-amplified-content">
            <textarea class="pfd-amplified-edit" id="pfd-amplified-edit">${escapeHtml(turn.amplified)}</textarea>
            <div class="pfd-amplified-actions">
                ${mode === 'chatgpt' ? `
                <button class="pfd-action-btn pfd-btn-copy" id="pfd-copy-amplified">
                    📋 Copier pour ChatGPT
                </button>` : ''}
                <button class="pfd-action-btn pfd-btn-use" id="pfd-use-amplified">
                    ⚡ Utiliser ce prompt
                    <span class="pfd-btn-sub">${mode === 'chatgpt' ? '→ prêt à copier' : '→ envoyer à l\'IA'}</span>
                </button>
            </div>
        </div>
        ${mode === 'chatgpt' ? `
        <div class="pfd-paste-cta">
            <p>Après avoir copié et envoyé ce prompt à ChatGPT, colle la réponse ci-dessous ↓</p>
        </div>` : ''}` : `
        <div class="pfd-loading-dots pfd-dots-fire"><span></span><span></span><span></span></div>`}
    </div>` : ''}

</div>`;
    }

    function renderPasteZone() {
        return `
<div class="pfd-paste-zone" id="pfd-paste-zone">
    <div class="pfd-paste-label">
        <span class="pfd-paste-icon">📥</span>
        <span>Colle ici la réponse de ChatGPT</span>
    </div>
    <textarea class="pfd-paste-input" id="pfd-paste-input"
              placeholder="Colle ici exactement ce que ChatGPT t'a répondu…"></textarea>
    <button class="pfd-paste-send" id="pfd-paste-send">
        <span>⚡ Analyser + Forger la suite</span>
    </button>
</div>`;
    }

    // ─── Events ──────────────────────────────────────────────────────────────

    function attachEvents(renderCb, toastCb) {
        renderCallback = renderCb;
        toastCallback  = toastCb;
        document.addEventListener('click', handleClick);
    }

    function handleClick(e) {
        // Mode switch
        const modeBtn = e.target.closest('.pfd-mode-btn');
        if (modeBtn && modeBtn.dataset.mode) {
            setMode(modeBtn.dataset.mode);
            return;
        }

        // Clear
        if (e.target.closest('#pfd-clear')) { clear(); return; }

        // Copy prompt for ChatGPT
        const copyBtn = e.target.closest('.pfd-copy-btn');
        if (copyBtn) {
            const text = decodeURIComponent(copyBtn.dataset.copy || '');
            if (text) {
                navigator.clipboard.writeText(text).catch(() => {});
                if (toastCallback) toastCallback('✅ Copié ! Colle-le dans ChatGPT', 'success');
            }
            return;
        }

        // Paste + send (mode ChatGPT)
        if (e.target.closest('#pfd-paste-send')) {
            const ta = document.getElementById('pfd-paste-input');
            if (ta && ta.value.trim()) {
                pasteGPTResponse(ta.value.trim());
            }
            return;
        }

        // Copy amplified
        if (e.target.closest('#pfd-copy-amplified')) {
            const ta = document.getElementById('pfd-amplified-edit');
            const text = ta ? ta.value : (currentTurn && currentTurn.amplified) || '';
            if (text) {
                navigator.clipboard.writeText(text).catch(() => {});
                if (toastCallback) toastCallback('✅ Prompt amplifié copié !', 'success');
            }
            return;
        }

        // Use amplified
        if (e.target.closest('#pfd-use-amplified')) {
            const ta = document.getElementById('pfd-amplified-edit');
            const text = ta ? ta.value.trim() : (currentTurn && currentTurn.amplified) || '';
            if (text && currentTurn) currentTurn.amplified = text;
            useAmplified();
            return;
        }
    }

    function onAfterRender() {
        // Scroll dernier tour visible
        const turns = document.querySelectorAll('.pfd-turn');
        if (turns.length > 0) {
            turns[turns.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatText(text) {
        return escapeHtml(text)
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/^/, '<p>').replace(/$/, '</p>');
    }

    return {
        importPrompt,
        copyToGPT,
        pasteGPTResponse,
        useAmplified,
        editAndSend,
        clear,
        setMode,
        renderView,
        attachEvents,
        onAfterRender,
        get turns() { return turns; },
        get mode() { return mode; }
    };
})();

if (typeof window !== 'undefined') window.PromptForgeDialogue = PromptForgeDialogue;
