/**
 * GALAXY AI - AI-powered constellation intelligence
 * ProductiveApp v5.0
 *
 * Features:
 * - AI analysis of notes/tasks to generate clusters and connections
 * - Mind map generation from a topic
 * - Semantic relationship detection
 * - Priority scoring
 * - Converts AI results into 3D sphere data for Galaxy3D
 */
const GalaxyAI = (function() {
    'use strict';

    const SYSTEM_PROMPT = `Tu es un analyste de données expert en visualisation 3D. Tu analyses des notes et tâches pour créer des constellations visuelles intelligentes.

RÈGLES STRICTES:
1. Réponds UNIQUEMENT avec du JSON valide, sans texte avant ni après
2. Analyse les thèmes, mots-clés, et relations sémantiques
3. Groupe les éléments similaires en clusters
4. Détecte les connexions même implicites entre éléments
5. Évalue la priorité réelle de chaque élément (1-10)
6. Les clusters doivent avoir des noms descriptifs et courts

FORMAT DE RÉPONSE (JSON uniquement):
{
  "clusters": [
    {"name": "Nom du cluster", "items": ["id1", "id2"], "color": "#hexcolor"}
  ],
  "connections": [
    {"from": "id1", "to": "id2", "strength": 0.8, "reason": "Raison courte"}
  ],
  "priorities": [
    {"id": "id1", "score": 8}
  ]
}`;

    const MINDMAP_PROMPT = `Tu es un expert en mind mapping et pensée visuelle. Génère une mind map complète et riche à partir du sujet donné.

RÈGLES:
1. Réponds UNIQUEMENT avec du JSON valide
2. Crée un nœud central + branches principales + sous-branches
3. Chaque nœud a un titre court (max 4 mots)
4. Les connexions entre nœuds liés thématiquement
5. Priorité basée sur l'importance du concept

FORMAT (JSON uniquement):
{
  "nodes": [
    {"id": "node_1", "label": "Titre", "type": "note", "priority": "high", "size": 2, "tags": ["tag1"]}
  ],
  "connections": [
    {"from": "node_1", "to": "node_2", "strength": 0.9, "reason": "Lien thématique"}
  ]
}`;

    let isProcessing = false;

    /**
     * Generate AI constellation from notes and tasks
     */
    async function generateConstellation(notes, tasks) {
        if (isProcessing) {
            console.warn('GalaxyAI: already processing');
            return null;
        }

        if (!ApiAi || !ApiAi.isAvailable()) {
            console.error('GalaxyAI: AI API not available');
            return null;
        }

        isProcessing = true;

        try {
            // Build data summary for AI
            const items = [];

            if (notes && notes.length > 0) {
                notes.forEach(n => {
                    items.push({
                        id: 'note_' + n.id,
                        type: 'note',
                        title: n.title || 'Sans titre',
                        content: (n.content || '').substring(0, 200),
                        tags: n.tags || [],
                        priority: n.is_pinned ? 'high' : 'medium',
                        created: n.created_at
                    });
                });
            }

            if (tasks && tasks.length > 0) {
                tasks.forEach(t => {
                    const priorityMap = { 1: 'low', 2: 'medium', 3: 'high', 4: 'urgent' };
                    items.push({
                        id: 'task_' + t.id,
                        type: 'task',
                        title: t.text || t.title || 'Sans titre',
                        status: t.status,
                        priority: priorityMap[t.priority?.level || t.priority] || 'medium',
                        project: t.project || t.projectId,
                        tags: t.tags || []
                    });
                });
            }

            if (items.length === 0) {
                console.log('GalaxyAI: no items to analyze');
                return null;
            }

            const prompt = `Analyse ces ${items.length} éléments et génère la constellation:\n\n${JSON.stringify(items, null, 1)}`;

            const rawResponse = await ApiAi.generate(prompt, SYSTEM_PROMPT);
            const result = parseAIResponse(rawResponse);

            if (!result) {
                console.error('GalaxyAI: failed to parse AI response');
                return null;
            }

            // Convert AI result to Galaxy3D data
            return convertToGalaxyData(result, items);
        } catch (error) {
            console.error('GalaxyAI: constellation generation failed:', error);
            return null;
        } finally {
            isProcessing = false;
        }
    }

    /**
     * Generate a mind map from a topic
     */
    async function generateMindMap(topic) {
        if (isProcessing) return null;
        if (!ApiAi || !ApiAi.isAvailable()) return null;

        isProcessing = true;

        try {
            const prompt = `Crée une mind map détaillée sur le sujet: "${topic}"\n\nGénère au moins 8 nœuds avec des connexions entre eux.`;
            const rawResponse = await ApiAi.generate(prompt, MINDMAP_PROMPT);
            const result = parseAIResponse(rawResponse);

            if (!result || !result.nodes) return null;

            // Add positions (will be force-layouted later)
            const nodes = result.nodes.map((n, i) => ({
                id: n.id || 'mind_' + i,
                type: n.type || 'note',
                sourceId: null,
                label: n.label || n.title || 'Node ' + i,
                priority: n.priority || 'medium',
                size: n.size || 1,
                tags: n.tags || [],
                metadata: { source: 'mindmap', topic: topic }
            }));

            const conns = (result.connections || []).map((c, i) => ({
                id: 'mindconn_' + i,
                from: c.from,
                to: c.to,
                strength: c.strength || 0.5,
                reason: c.reason || ''
            }));

            return { nodes, connections: conns };
        } catch (error) {
            console.error('GalaxyAI: mind map generation failed:', error);
            return null;
        } finally {
            isProcessing = false;
        }
    }

    /**
     * Find relationships between items using AI
     */
    async function findRelationships(items) {
        if (!ApiAi || !ApiAi.isAvailable()) return [];
        if (!items || items.length < 2) return [];

        try {
            const prompt = `Trouve les relations entre ces éléments. Pour chaque paire liée, donne un score de force (0-1) et une raison courte.\n\nÉléments:\n${JSON.stringify(items.map(i => ({ id: i.id, title: i.label || i.title, tags: i.tags })), null, 1)}`;

            const rawResponse = await ApiAi.generate(prompt, SYSTEM_PROMPT);
            const result = parseAIResponse(rawResponse);

            return (result?.connections || []).map((c, i) => ({
                id: 'aiconn_' + i,
                from: c.from,
                to: c.to,
                strength: c.strength || 0.5,
                reason: c.reason || 'Relation IA',
                color: strengthToColor(c.strength || 0.5)
            }));
        } catch (error) {
            console.error('GalaxyAI: relationship detection failed:', error);
            return [];
        }
    }

    /**
     * Parse AI response (extract JSON from text)
     */
    function parseAIResponse(raw) {
        if (!raw) return null;

        // Try direct parse
        try {
            return JSON.parse(raw);
        } catch (e) {
            // Try to extract JSON from markdown code blocks
            const jsonMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[1]);
                } catch (e2) {}
            }

            // Try to find JSON object in text
            const braceMatch = raw.match(/\{[\s\S]*\}/);
            if (braceMatch) {
                try {
                    return JSON.parse(braceMatch[0]);
                } catch (e3) {}
            }
        }

        return null;
    }

    /**
     * Convert AI analysis result to Galaxy3D-compatible data
     */
    function convertToGalaxyData(aiResult, originalItems) {
        const nodes = [];
        const conns = [];

        // Priority map from AI scores
        const priorityMap = {};
        if (aiResult.priorities) {
            aiResult.priorities.forEach(p => {
                if (p.score >= 8) priorityMap[p.id] = 'urgent';
                else if (p.score >= 6) priorityMap[p.id] = 'high';
                else if (p.score >= 4) priorityMap[p.id] = 'medium';
                else priorityMap[p.id] = 'low';
            });
        }

        // Create nodes from original items with AI-enhanced priorities
        originalItems.forEach(item => {
            const aiPriority = priorityMap[item.id] || item.priority || 'medium';
            const size = aiPriority === 'urgent' ? 2.0 : aiPriority === 'high' ? 1.5 : aiPriority === 'medium' ? 1.0 : 0.8;

            nodes.push({
                id: item.id,
                type: item.type,
                sourceId: item.id.replace(/^(note_|task_)/, ''),
                label: item.title,
                priority: item.status === 'done' ? 'done' : aiPriority,
                size: size,
                tags: item.tags || [],
                metadata: {
                    content: item.content,
                    status: item.status,
                    source: 'ai-constellation'
                }
            });
        });

        // Create connections from AI analysis
        if (aiResult.connections) {
            aiResult.connections.forEach((c, i) => {
                conns.push({
                    id: 'aiconn_' + i,
                    from: c.from,
                    to: c.to,
                    strength: c.strength || 0.5,
                    reason: c.reason || '',
                    color: strengthToColor(c.strength || 0.5)
                });
            });
        }

        return { nodes, connections: conns, clusters: aiResult.clusters || [] };
    }

    /**
     * Convert connection strength to color
     */
    function strengthToColor(strength) {
        if (strength >= 0.8) return '#ff6644';  // Strong = warm
        if (strength >= 0.5) return '#ffaa44';  // Medium = gold
        if (strength >= 0.3) return '#44aaff';  // Weak = cool blue
        return '#6666aa';                        // Very weak = dim
    }

    return {
        generateConstellation,
        generateMindMap,
        findRelationships,
        get isProcessing() { return isProcessing; }
    };
})();

window.GalaxyAI = GalaxyAI;
console.log('GalaxyAI module loaded');
