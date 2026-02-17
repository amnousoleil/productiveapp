// =============================================
// GALAXY CONSTELLATION MAPPING
// Mapping Projets → Constellations, Tâches → Étoiles
// =============================================

const GalaxyConstellation = (function() {
    'use strict';

    // Couleurs selon priorité
    const PRIORITY_COLORS = {
        urgent: '#ef4444',   // Rouge
        high: '#f59e0b',     // Orange
        medium: '#3b82f6',   // Bleu
        low: '#10b981'       // Vert
    };

    // Couleurs selon statut (opacity)
    const STATUS_OPACITY = {
        todo: 0.5,
        in_progress: 0.8,
        done: 1.0,
        blocked: 0.3
    };

    /**
     * Génère des constellations depuis les projets
     * @returns {Array} Nodes de type constellation
     */
    function generateConstellations() {
        console.log('🔍 generateConstellations() called');

        if (typeof AppState === 'undefined' || !AppState.projects) {
            console.error('❌ AppState.projects non disponible');
            console.log('AppState:', typeof AppState);
            return [];
        }

        const projects = AppState.projects || [];
        console.log('📊 Projects found:', projects.length);

        const constellations = [];

        projects.forEach((project, index) => {
            const pos = calculateConstellationPosition(index, projects.length);
            const taskCount = getProjectTaskCount(project.id);

            const constellation = {
                id: `constellation-${project.id}`,
                x: pos.x,
                y: pos.y,
                text: project.name,
                color: project.color || '#3b82f6',
                shape: 'circle',
                width: calculateConstellationSize(taskCount),
                height: calculateConstellationSize(taskCount),
                metadata: {
                    type: 'constellation',
                    projectId: project.id,
                    taskCount: taskCount
                }
            };

            constellations.push(constellation);
        });

        console.log(`✨ ${constellations.length} constellations générées`);
        return constellations;
    }

    /**
     * Génère des étoiles depuis les tâches d'un projet
     * @param {string} projectId - ID du projet
     * @param {Object} constellation - Constellation parent
     * @returns {Array} Nodes de type étoile
     */
    function generateStars(projectId, constellation) {
        if (typeof AppState === 'undefined' || !AppState.tasks) {
            console.warn('⚠️ AppState.tasks non disponible');
            return [];
        }

        const tasks = AppState.tasks.filter(t => t.project_id === projectId);
        const stars = [];

        tasks.forEach((task, index) => {
            const pos = calculateStarPosition(
                index,
                tasks.length,
                constellation
            );

            const star = {
                id: `star-${task.id}`,
                x: pos.x,
                y: pos.y,
                text: task.title,
                color: getStarColor(task),
                shape: 'circle',
                width: 20,
                height: 20,
                metadata: {
                    type: 'star',
                    taskId: task.id,
                    projectId: projectId,
                    priority: task.priority,
                    status: task.status
                }
            };

            stars.push(star);
        });

        return stars;
    }

    /**
     * Génère toutes les constellations ET toutes les étoiles
     * @returns {Object} { constellations, stars }
     */
    function generateAll() {
        const constellations = generateConstellations();
        let allStars = [];

        constellations.forEach(constellation => {
            const projectId = constellation.metadata.projectId;
            const stars = generateStars(projectId, constellation);
            allStars = allStars.concat(stars);
        });

        console.log(`🌌 Total: ${constellations.length} constellations, ${allStars.length} étoiles`);

        return {
            constellations,
            stars: allStars,
            nodes: [...constellations, ...allStars]
        };
    }

    /**
     * Calcule la position d'une constellation (disposition circulaire)
     */
    function calculateConstellationPosition(index, total) {
        const radius = 500 + Math.min(total * 30, 1000);
        const angle = (index / total) * 2 * Math.PI;

        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    }

    /**
     * Calcule la position d'une étoile autour de sa constellation
     */
    function calculateStarPosition(index, total, constellation) {
        if (total === 0) {
            return { x: constellation.x, y: constellation.y };
        }

        const innerRadius = (constellation.width / 2) + 50;
        const angle = (index / total) * 2 * Math.PI;

        return {
            x: constellation.x + Math.cos(angle) * innerRadius,
            y: constellation.y + Math.sin(angle) * innerRadius
        };
    }

    /**
     * Calcule la taille d'une constellation selon le nombre de tâches
     */
    function calculateConstellationSize(taskCount) {
        return Math.max(150, Math.min(taskCount * 15, 400));
    }

    /**
     * Récupère le nombre de tâches d'un projet
     */
    function getProjectTaskCount(projectId) {
        if (typeof AppState === 'undefined' || !AppState.tasks) {
            return 0;
        }
        return AppState.tasks.filter(t => t.project_id === projectId).length;
    }

    /**
     * Détermine la couleur d'une étoile selon priorité et statut
     */
    function getStarColor(task) {
        const baseColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
        return baseColor;
    }

    /**
     * Synchronise AppState avec galaxyNodes
     * Remplace les nodes existants par constellations + étoiles
     */
    function syncWithAppState() {
        console.log('🔄 syncWithAppState() called');

        const data = generateAll();

        // Remplacer galaxyNodes global
        if (typeof window.galaxyNodes !== 'undefined') {
            window.galaxyNodes = data.nodes;
            console.log('✅ galaxyNodes synchronisé:', data.nodes.length, 'nodes');
            console.log('  - Constellations:', data.constellations.length);
            console.log('  - Stars:', data.stars.length);
        } else {
            console.error('❌ window.galaxyNodes non défini');
        }

        return data;
    }

    // Public API
    return {
        generateConstellations,
        generateStars,
        generateAll,
        syncWithAppState
    };
})();

// Export global
window.GalaxyConstellation = GalaxyConstellation;
console.log('📦 galaxy-constellation.js loaded');
