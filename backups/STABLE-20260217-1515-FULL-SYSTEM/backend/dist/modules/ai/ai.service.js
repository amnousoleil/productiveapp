"use strict";
/**
 * AI Service - OpenAI API with Smart Routing
 * ProductiveApp v4.0
 *
 * Uses gpt-4o-mini by default (cheap & fast)
 * Escalates to gpt-4o for complex requests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AiService = void 0;
const helpers_js_1 = require("../../utils/helpers.js");
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 30000;
// Model configuration
const MODELS = {
    MINI: 'gpt-4o-mini',
    FULL: 'gpt-4o'
};
// Pricing per 1M tokens (USD)
const PRICING = {
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 2.50, output: 10.00 }
};
// Complexity detection keywords
const COMPLEX_KEYWORDS = [
    'analyse', 'analyze', 'stratégie', 'strategy', 'compare', 'comparaison',
    'optimise', 'optimize', 'améliore', 'improve', 'refactor', 'architecture',
    'planifie', 'plan', 'organise', 'organize', 'productivité', 'productivity',
    'détaillé', 'detailed', 'approfondi', 'in-depth', 'complexe', 'complex'
];
// Galaxy View knowledge — injected when user is on Galaxy View
const GALAXY_VIEW_KNOWLEDGE = `

=== GALAXY VIEW — GUIDE EXPERT ===
Quand tu expliques Galaxy View, n'utilise JAMAIS d'anglicismes (pas de canvas, mind map, brainstorming, etc.). Parle en français simple et concret. Par exemple, dis "tableau créatif" au lieu de "canvas", "carte mentale" au lieu de "mind map", "réflexion visuelle" au lieu de "brainstorming". Explique les choses de manière concrète et enthousiaste, en montrant à quoi ça sert dans la vraie vie, pour donner envie d'utiliser l'outil. Parle comme si tu expliquais à un ami, pas comme un manuel technique.

Quand tu listes des raccourcis, insère TOUJOURS un double retour à la ligne entre chaque raccourci pour bien les séparer visuellement. Chaque raccourci doit être clairement isolé des autres. Format simple : "Ctrl+Z → Annuler". Pas de catégories en gras, pas de tirets, pas de listes. Juste les raccourcis les uns sous les autres, simples et clairs.

Quand l'utilisateur est sur Galaxy View, tu es expert de cette fonctionnalité. Réponds de manière claire et concise aux questions sur les outils, raccourcis, fonctionnalités. Guide l'utilisateur pas à pas si besoin.

Galaxy View est un éditeur de tableau créatif infini intégré à ProductiveApp (système Cosmic v3.0). Il permet de créer des cartes mentales, schémas et réflexions visuelles avec un fond cosmique animé.

## OUTILS (barre flottante en bas)

Groupe Sélection :
- Marquee : sélection par rectangle — cliquer-glisser sur le fond pour sélectionner une zone
- Pointeur : sélection standard — clic sur un nœud, Shift+clic pour multi-sélection
- Main : panoramique — cliquer-glisser pour déplacer la vue

Groupe Formes :
- Cercle, Rectangle, Losange, Hexagone, Étoile : cliquer-glisser sur le fond pour dessiner

Groupe Dessin :
- Connecteur/Flèche : cliquer nœud source puis nœud cible pour créer une connexion fléchée
- Stylo : dessin libre à main levée, épaisseur réglable (slider 1-20px)
- Texte : cliquer pour créer un nœud avec édition de texte immédiate

Groupe Actions :
- Undo (Ctrl+Z), Redo (Ctrl+Shift+Z ou Ctrl+Y)

Groupe Apparence :
- Skin toggle (soleil/lune) : bascule entre skin Night (nuit étoilée, fond noir) et Desert (doré chaud, fond crème)
- Swatch couleur : sélecteur de couleur avec 7 presets + panneau avancé HSL

## BOUTONS (barre en haut)

- Titre "Galaxie View" + nom du projet actif (avec point de statut coloré : vert=sauvé, jaune=modifié, rouge=erreur)
- ✓ Projets : ouvre le panneau de gestion des projets Galaxy
- + (Nouveau projet) : sauvegarde le projet actuel puis crée un nouveau projet vierge
- ✓ Tâches : filtre pour afficher/masquer les tâches sur le canvas
- Sauvegarder : sauvegarde manuelle du projet
- Export PNG (icône téléchargement) : exporte le canvas en PNG haute résolution (3x)
- Orbites : affiche/masque les connexions
- IA Constellation : analyse les notes/tâches et génère automatiquement une constellation de nœuds
- Mind Map : génère un mind map IA à partir d'un sujet saisi par l'utilisateur

## RACCOURCIS CLAVIER

Ctrl+Z → Annuler

Ctrl+Y → Rétablir

Ctrl+C → Copier

Ctrl+V → Coller

Suppr ou Retour arrière → Supprimer l'élément sélectionné

Échap → Fermer les panneaux

Alt + clic glissé → Dupliquer un élément

Deux doigts sur le trackpad → Se déplacer sur le tableau

Double-clic dans une forme → Ajouter ou modifier le texte

Clic droit sur un élément → Ouvrir le menu de modification

## INTERACTIONS SOURIS

- Clic sur nœud : sélectionne (Shift+clic = multi-sélection)
- Clic sur fond : désélectionne tout
- Glisser un nœud : déplace le(s) nœud(s) sélectionné(s)
- Alt+glisser : duplique le nœud/groupe et déplace la copie (connexions internes copiées)
- Clic droit sur nœud : menu radial contextuel (verrouiller, couleur, opacité, dupliquer, supprimer, éditer texte)
- Molette : panoramique (ou zoom avec Ctrl/pinch trackpad)
- 4 poignées de redimensionnement apparaissent sur un nœud sélectionné unique

## ÉLÉMENTS DU CANVAS

Formes : cercle, rectangle, losange, hexagone, étoile — chacune avec couleur, texte, taille, opacité, verrouillage
Connexions : flèches courbes Bézier entre nœuds, auto-ancrées sur les bords des formes
Traits libres : dessin au stylo avec lissage Bézier quadratique
Texte inline : éditable par double-clic, taille de police ajustable (A-/A+), couleur modifiable

## MENU RADIAL (clic droit sur un nœud)

6 actions en arc de cercle :
- Verrouiller/Déverrouiller : empêche le déplacement/redimensionnement
- Couleur : sous-menu avec 15 couleurs en anneaux concentriques
- Opacité : slider 0-100%
- Dupliquer : copie à +30px
- Supprimer : supprime le nœud
- Éditer texte : ouvre l'édition inline

## BARRE D'OUTILS TEXTE (apparaît au-dessus d'un nœud sélectionné)

- A- : diminue la taille de police (maintenir = accélérer)
- A+ : augmente la taille de police (maintenir = accélérer)
- Couleur : change la couleur du texte
- X : efface le texte

## GESTION DE PROJETS

- Chaque utilisateur peut avoir plusieurs projets Galaxy (canvases séparés)
- Créer : bouton "+" dans la toolbar ou "+ Nouveau projet" dans le panneau
- Ouvrir : cliquer "Ouvrir" dans la liste des projets
- Renommer : icône crayon dans la liste
- Supprimer : icône corbeille (impossible sur le projet actif)
- Sauvegarde automatique : debounced 1.2s après chaque modification
- Sauvegarde manuelle : bouton "Sauvegarder" dans la toolbar

## EXPORT

- PNG haute résolution (3x) : bouton icône téléchargement dans la toolbar du haut
- Le fichier est nommé galaxy-view-{nom-projet}.png

## FONCTIONNALITÉS IA

IA Constellation : analyse les notes et tâches existantes pour générer automatiquement des nœuds et connexions organisés en clusters sémantiques
Mind Map IA : l'utilisateur saisit un sujet, l'IA génère un mind map hiérarchique (nœud central + branches + sous-branches)

## SKINS VISUELS

Night (défaut) : fond noir étoilé avec particules, étoiles scintillantes et nébuleuses violettes/bleues
Desert : fond crème chaud avec fils de soie dorés ondulants, tons ambrés

## PERSISTANCE

Les données sont sauvegardées en PostgreSQL via l'API /api/v1/canvases. Le système sauvegarde automatiquement 1.2s après la dernière modification. Le point de statut dans la toolbar indique l'état (vert=sauvé, jaune=en cours, rouge=erreur).
`;
class AiService {
    getApiKey() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey === 'placeholder_key_here') {
            throw helpers_js_1.AppError.internal('OPENAI_API_KEY not configured');
        }
        return apiKey;
    }
    /**
     * Analyze message complexity (0-10 scale)
     */
    analyzeComplexity(message) {
        let score = 0;
        const lowerMessage = message.toLowerCase();
        // Length factor
        if (message.length > 500)
            score += 2;
        if (message.length > 1000)
            score += 2;
        // Complex keywords
        for (const keyword of COMPLEX_KEYWORDS) {
            if (lowerMessage.includes(keyword)) {
                score += 2;
                break; // Only count once
            }
        }
        // Multiple questions
        const questionCount = (message.match(/\?/g) || []).length;
        if (questionCount > 2)
            score += 2;
        // Code-related
        if (lowerMessage.includes('code') || lowerMessage.includes('script') ||
            lowerMessage.includes('function') || lowerMessage.includes('programme')) {
            score += 3;
        }
        // Analysis/report request
        if (lowerMessage.includes('rapport') || lowerMessage.includes('report') ||
            lowerMessage.includes('bilan') || lowerMessage.includes('synthèse')) {
            score += 2;
        }
        return Math.min(score, 10);
    }
    /**
     * Select model based on complexity
     */
    selectModel(message) {
        const complexity = this.analyzeComplexity(message);
        console.log(`🧠 Complexity score: ${complexity}/10`);
        // Use full model if complexity >= 7
        if (complexity >= 7) {
            console.log('🚀 Using gpt-4o (complex request)');
            return MODELS.FULL;
        }
        console.log('⚡ Using gpt-4o-mini (standard request)');
        return MODELS.MINI;
    }
    /**
     * Calculate cost in USD
     */
    calculateCost(model, inputTokens, outputTokens) {
        const pricing = PRICING[model];
        const inputCost = (inputTokens / 1_000_000) * pricing.input;
        const outputCost = (outputTokens / 1_000_000) * pricing.output;
        return inputCost + outputCost;
    }
    /**
     * Call OpenAI API
     */
    async callOpenAI(model, messages, maxTokens = 1024) {
        const apiKey = this.getApiKey();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        try {
            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages,
                    max_tokens: maxTokens
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorBody = await response.text();
                console.error('OpenAI API error:', response.status, errorBody);
                if (response.status === 401) {
                    throw helpers_js_1.AppError.unauthorized('Invalid API key');
                }
                else if (response.status === 429) {
                    throw helpers_js_1.AppError.tooManyRequests('Rate limit exceeded');
                }
                else if (response.status >= 500) {
                    throw helpers_js_1.AppError.internal('OpenAI API temporarily unavailable');
                }
                else {
                    throw helpers_js_1.AppError.internal(`OpenAI API error: ${response.status}`);
                }
            }
            const data = await response.json();
            if (!data.choices || data.choices.length === 0) {
                throw helpers_js_1.AppError.internal('Empty response from OpenAI API');
            }
            const content = data.choices[0].message?.content;
            if (!content) {
                throw helpers_js_1.AppError.internal('No content in OpenAI API response');
            }
            return { content, usage: data.usage };
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw helpers_js_1.AppError.internal('OpenAI API request timed out');
            }
            if (error instanceof helpers_js_1.AppError) {
                throw error;
            }
            console.error('AI Service error:', error);
            throw helpers_js_1.AppError.internal('Failed to generate AI response');
        }
    }
    /**
     * Generate content (simple API)
     */
    async generate(request) {
        const messages = [];
        if (request.system) {
            messages.push({ role: 'system', content: request.system });
        }
        messages.push({ role: 'user', content: request.prompt });
        const model = this.selectModel(request.prompt);
        const { content } = await this.callOpenAI(model, messages, request.max_tokens);
        return { content };
    }
    /**
     * Chat with context (smart routing)
     */
    async chat(request) {
        const messages = [];
        // Build system prompt with context
        let systemPrompt = `Tu es Giri, l'assistant IA de ProductiveApp. Tu aides l'équipe à gérer leurs tâches et projets.

RÈGLES:
- Réponds toujours en français
- Sois concis et efficace
- Tu peux créer, modifier ou supprimer des tâches
- Pour les actions, utilise le format: ACTION:TYPE|param1|param2

ACTIONS DISPONIBLES:
- ACTION:CREATE|titre|priorité|projet - Créer une tâche
- ACTION:DONE|taskId - Marquer comme terminée
- ACTION:DELETE|taskId - Supprimer une tâche

`;
        // Add context if available
        if (request.context) {
            if (request.context.currentUser) {
                systemPrompt += `\nUTILISATEUR ACTUEL: ${request.context.currentUser}\n`;
            }
            if (request.context.tasks && request.context.tasks.length > 0) {
                systemPrompt += `\nTÂCHES EN COURS:\n`;
                for (const task of request.context.tasks.slice(0, 20)) {
                    const priority = task.priority === 1 ? '🔥' : task.priority === 2 ? '⚡' : '💤';
                    const status = task.status === 'done' ? '✅' : task.status === 'in_progress' ? '🔄' : '📋';
                    systemPrompt += `- [${task.id}] ${status} ${priority} ${task.title}\n`;
                }
            }
            if (request.context.projects && request.context.projects.length > 0) {
                systemPrompt += `\nPROJETS:\n`;
                for (const project of request.context.projects) {
                    systemPrompt += `- ${project.name} (${project.id})\n`;
                }
            }
            // Galaxy View knowledge injection
            if (request.context.currentView === 'galaxy') {
                systemPrompt += GALAXY_VIEW_KNOWLEDGE;
            }
        }
        messages.push({ role: 'system', content: systemPrompt });
        // Add conversation history
        if (request.history && request.history.length > 0) {
            for (const msg of request.history.slice(-10)) { // Last 10 messages
                messages.push({ role: msg.role, content: msg.content });
            }
        }
        // Add current message
        messages.push({ role: 'user', content: request.message });
        // Select model based on complexity
        let model = this.selectModel(request.message);
        let result;
        try {
            result = await this.callOpenAI(model, messages, 1024);
        }
        catch (error) {
            // If mini fails, try with full model
            if (model === MODELS.MINI) {
                console.log('⚠️ Mini failed, escalating to gpt-4o');
                model = MODELS.FULL;
                result = await this.callOpenAI(model, messages, 1024);
            }
            else {
                throw error;
            }
        }
        // Parse actions from response
        const actions = this.parseActions(result.content);
        // Calculate cost
        const cost = this.calculateCost(model, result.usage.prompt_tokens, result.usage.completion_tokens);
        console.log(`💰 Cost: $${cost.toFixed(6)} (${model})`);
        return {
            content: result.content,
            model,
            tokens: {
                input: result.usage.prompt_tokens,
                output: result.usage.completion_tokens,
                total: result.usage.total_tokens
            },
            cost,
            actions
        };
    }
    /**
     * Parse ACTION: commands from response
     */
    parseActions(content) {
        const actions = [];
        const actionRegex = /ACTION:(CREATE|DONE|DELETE|UPDATE)\|([^\n]+)/g;
        let match;
        while ((match = actionRegex.exec(content)) !== null) {
            const [, type, params] = match;
            const parts = params.split('|');
            switch (type) {
                case 'CREATE':
                    actions.push({
                        type: 'CREATE_TASK',
                        data: {
                            title: parts[0],
                            priority: parseInt(parts[1]) || 2,
                            project: parts[2] || 'general'
                        }
                    });
                    break;
                case 'DONE':
                    actions.push({
                        type: 'COMPLETE_TASK',
                        data: { taskId: parts[0] }
                    });
                    break;
                case 'DELETE':
                    actions.push({
                        type: 'DELETE_TASK',
                        data: { taskId: parts[0] }
                    });
                    break;
                case 'UPDATE':
                    actions.push({
                        type: 'UPDATE_TASK',
                        data: {
                            taskId: parts[0],
                            updates: parts.slice(1)
                        }
                    });
                    break;
            }
        }
        return actions;
    }
    /**
     * Correct text (spell check)
     */
    async correctText(text, mode = 'all') {
        const systemPrompt = mode === 'ortho'
            ? 'Corrige uniquement l\'orthographe et la grammaire. Garde le même style et sens. Réponds UNIQUEMENT avec le texte corrigé, sans explication.'
            : 'Corrige et améliore ce texte (orthographe, grammaire, style). Réponds UNIQUEMENT avec le texte corrigé, sans explication.';
        const { content } = await this.generate({
            prompt: text,
            system: systemPrompt,
            max_tokens: 500
        });
        return content.trim();
    }
}
exports.AiService = AiService;
exports.aiService = new AiService();
//# sourceMappingURL=ai.service.js.map