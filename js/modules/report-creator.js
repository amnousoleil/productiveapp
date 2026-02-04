/**
 * =====================================================
 * PSYCHO AUDIT ENGINE - Report Creator v1.0
 * Moteur d'audit d'entreprise haut de gamme par IA
 * =====================================================
 */

const ReportCreator = (function() {
    'use strict';

    // ========== CONFIGURATION ==========
    const CONFIG = {
        containerId: 'report-creator-container',
        apiEndpoint: '/api/ai/generate',
        brandName: 'GIRI',
        brandColor: '#E07840',
        version: '1.0'
    };

    // ========== TYPES DE RAPPORTS ==========
    const REPORT_TYPES = {
        executive: {
            id: 'executive',
            name: 'Rapport Exécutif',
            icon: '📊',
            description: 'Synthèse stratégique pour la direction',
            sections: ['summary', 'kpis', 'achievements', 'risks', 'recommendations'],
            estimatedTime: '2-3 min'
        },
        productivity: {
            id: 'productivity',
            name: 'Audit de Productivité',
            icon: '⚡',
            description: 'Analyse approfondie des performances et rendements',
            sections: ['metrics', 'trends', 'bottlenecks', 'optimization', 'benchmarks'],
            estimatedTime: '3-4 min'
        },
        habits: {
            id: 'habits',
            name: 'Analyse des Habitudes',
            icon: '🧠',
            description: 'Psychologie du travail et patterns comportementaux',
            sections: ['workPatterns', 'peakHours', 'consistency', 'suggestions', 'wellbeing'],
            estimatedTime: '2-3 min'
        },
        project: {
            id: 'project',
            name: 'Audit de Projet',
            icon: '📁',
            description: 'État de santé et trajectoire des projets',
            sections: ['health', 'timeline', 'resources', 'risks', 'milestones'],
            estimatedTime: '2-3 min'
        },
        team: {
            id: 'team',
            name: 'Performance Équipe',
            icon: '👥',
            description: 'Dynamique collective et collaboration',
            sections: ['collaboration', 'distribution', 'synergies', 'improvements'],
            estimatedTime: '3-4 min'
        },
        complete: {
            id: 'complete',
            name: 'Audit Complet',
            icon: '🎯',
            description: 'Analyse exhaustive de l\'entreprise',
            sections: ['all'],
            estimatedTime: '5-7 min'
        }
    };

    // ========== STATE ==========
    let state = {
        isOpen: false,
        selectedType: null,
        isGenerating: false,
        currentReport: null,
        reportHistory: [],
        dataSnapshot: null
    };

    // ========== ICONS SVG ==========
    const icons = {
        close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        generate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
        copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
        calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.94z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2z"/></svg>',
        target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
        star: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        loader: '<svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>'
    };

    // ========== DATA COLLECTION ==========

    /**
     * Collecte toutes les données pour l'analyse
     */
    function collectData() {
        const data = {
            timestamp: new Date().toISOString(),
            tasks: [],
            projects: [],
            journal: [],
            user: null,
            stats: {}
        };

        // Récupérer les tâches
        if (typeof AppState !== 'undefined' && AppState.tasks) {
            data.tasks = AppState.tasks;
        }

        // Récupérer les projets
        if (typeof AppState !== 'undefined' && AppState.projects) {
            data.projects = AppState.projects;
        }

        // Récupérer le journal
        if (typeof AppState !== 'undefined' && AppState.journal) {
            data.journal = AppState.journal;
        }

        // Récupérer l'utilisateur
        if (typeof AppState !== 'undefined' && AppState.currentUser) {
            data.user = {
                name: AppState.currentUser.name,
                role: AppState.currentUser.role
            };
        }

        // Calculer les statistiques
        data.stats = computeAdvancedStats(data);

        return data;
    }

    /**
     * Calcule des statistiques avancées
     */
    function computeAdvancedStats(data) {
        const tasks = data.tasks || [];
        const now = new Date();

        // Périodes
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Filtres par période
        const tasksToday = tasks.filter(t => new Date(t.completedAt || t.completed_at) >= today);
        const tasksWeek = tasks.filter(t => new Date(t.completedAt || t.completed_at) >= weekAgo);
        const tasksMonth = tasks.filter(t => new Date(t.completedAt || t.completed_at) >= monthAgo);

        // Statuts
        const byStatus = {
            todo: tasks.filter(t => t.status === 'todo' || !t.status).length,
            inProgress: tasks.filter(t => t.status === 'in_progress' || t.status === 'inProgress').length,
            done: tasks.filter(t => t.status === 'done' || t.status === 'completed').length
        };

        // Priorités
        const byPriority = {
            high: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
            medium: tasks.filter(t => t.priority === 'medium' || t.priority === 'normal').length,
            low: tasks.filter(t => t.priority === 'low').length
        };

        // Taux de complétion
        const completionRate = tasks.length > 0
            ? Math.round((byStatus.done / tasks.length) * 100)
            : 0;

        // Temps moyen de complétion
        const completedWithTime = tasks.filter(t =>
            (t.status === 'done' || t.status === 'completed') &&
            t.createdAt && t.completedAt
        );

        let avgCompletionTimeHours = null;
        if (completedWithTime.length > 0) {
            const totalMs = completedWithTime.reduce((sum, t) => {
                const created = new Date(t.createdAt || t.created_at);
                const completed = new Date(t.completedAt || t.completed_at);
                return sum + (completed - created);
            }, 0);
            avgCompletionTimeHours = Math.round(totalMs / completedWithTime.length / (1000 * 60 * 60));
        }

        // Analyse des heures de travail (basé sur les dates de création/complétion)
        const workHours = {};
        tasks.forEach(t => {
            const date = t.completedAt || t.createdAt || t.created_at;
            if (date) {
                const hour = new Date(date).getHours();
                workHours[hour] = (workHours[hour] || 0) + 1;
            }
        });

        // Heures de pic
        const peakHours = Object.entries(workHours)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([hour]) => parseInt(hour));

        // Jours les plus productifs
        const workDays = {};
        tasks.forEach(t => {
            const date = t.completedAt || t.completed_at;
            if (date && (tasks.status === 'done' || t.status === 'completed')) {
                const day = new Date(date).getDay();
                const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                workDays[dayNames[day]] = (workDays[dayNames[day]] || 0) + 1;
            }
        });

        // Projets avec le plus de tâches
        const projectStats = {};
        tasks.forEach(t => {
            const projectId = t.projectId || t.project_id || 'no-project';
            const projectName = t.project?.name || t.projectName || 'Sans projet';
            if (!projectStats[projectId]) {
                projectStats[projectId] = { name: projectName, total: 0, done: 0 };
            }
            projectStats[projectId].total++;
            if (t.status === 'done' || t.status === 'completed') {
                projectStats[projectId].done++;
            }
        });

        // Tâches en retard (avec deadline dépassée)
        const overdueTasks = tasks.filter(t => {
            const deadline = t.deadline || t.dueDate || t.due_date;
            return deadline &&
                   new Date(deadline) < now &&
                   t.status !== 'done' &&
                   t.status !== 'completed';
        });

        // Vélocité (tâches terminées par jour sur les 7 derniers jours)
        const weeklyVelocity = tasksWeek.filter(t => t.status === 'done' || t.status === 'completed').length / 7;

        // Streak (jours consécutifs avec au moins une tâche terminée)
        let streak = 0;
        let checkDate = new Date(today);
        while (true) {
            const dayStr = checkDate.toDateString();
            const tasksOnDay = tasks.filter(t => {
                const completed = t.completedAt || t.completed_at;
                return completed && new Date(completed).toDateString() === dayStr;
            });
            if (tasksOnDay.length === 0) break;
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        return {
            total: tasks.length,
            byStatus,
            byPriority,
            completionRate,
            avgCompletionTimeHours,
            peakHours,
            workDays,
            projectStats: Object.values(projectStats).sort((a, b) => b.total - a.total),
            overdueTasks: overdueTasks.length,
            weeklyVelocity: Math.round(weeklyVelocity * 10) / 10,
            streak,
            todayCompleted: tasksToday.filter(t => t.status === 'done' || t.status === 'completed').length,
            weekCompleted: tasksWeek.filter(t => t.status === 'done' || t.status === 'completed').length,
            monthCompleted: tasksMonth.filter(t => t.status === 'done' || t.status === 'completed').length
        };
    }

    // ========== PROMPTS IA ==========

    /**
     * Génère le prompt IA selon le type de rapport
     */
    function buildAIPrompt(type, data) {
        const stats = data.stats;
        const userName = data.user?.name || 'Utilisateur';

        const baseContext = `
Tu es un consultant en stratégie d'entreprise de niveau McKinsey/BCG. Tu produis des rapports d'audit professionnels et actionnables.

DONNÉES ACTUELLES:
- Utilisateur: ${userName}
- Total tâches: ${stats.total}
- Terminées: ${stats.byStatus.done} (${stats.completionRate}%)
- En cours: ${stats.byStatus.inProgress}
- À faire: ${stats.byStatus.todo}
- Tâches urgentes: ${stats.byPriority.high}
- En retard: ${stats.overdueTasks}
- Vélocité hebdo: ${stats.weeklyVelocity} tâches/jour
- Streak actuel: ${stats.streak} jours
- Temps moyen de complétion: ${stats.avgCompletionTimeHours ? stats.avgCompletionTimeHours + 'h' : 'N/A'}
- Heures de pic: ${stats.peakHours.map(h => h + 'h').join(', ') || 'N/A'}
- Projets: ${stats.projectStats.length}

PROJETS PRINCIPAUX:
${stats.projectStats.slice(0, 5).map(p => `- ${p.name}: ${p.done}/${p.total} (${p.total > 0 ? Math.round(p.done/p.total*100) : 0}%)`).join('\n')}
`;

        const prompts = {
            executive: `${baseContext}

GÉNÈRE UN RAPPORT EXÉCUTIF pour le comité de direction avec:

1. **SYNTHÈSE STRATÉGIQUE** (3-4 phrases percutantes)
   - État de santé global de l'activité
   - Tendance majeure observée

2. **KPIs CLÉS**
   - Productivité: note sur 10 avec justification
   - Efficience: analyse du ratio effort/résultat
   - Risque: évaluation des menaces

3. **ACCOMPLISSEMENTS MAJEURS**
   - Top 3 des réussites à valoriser

4. **POINTS D'ATTENTION**
   - Alertes nécessitant une action immédiate
   - Goulots d'étranglement identifiés

5. **RECOMMANDATIONS STRATÉGIQUES**
   - 3 actions prioritaires avec impact attendu

Format: professionnel, chiffré, orienté décision. Utilise des bullet points et des indicateurs visuels.`,

            productivity: `${baseContext}

GÉNÈRE UN AUDIT DE PRODUCTIVITÉ APPROFONDI:

1. **MÉTRIQUES DE PERFORMANCE**
   - Throughput: tâches traitées vs capacité théorique
   - Cycle time: analyse du temps de traitement
   - Work in Progress: charge actuelle vs optimale

2. **ANALYSE DES TENDANCES**
   - Évolution hebdomadaire/mensuelle
   - Patterns saisonniers détectés
   - Projections à court terme

3. **GOULOTS D'ÉTRANGLEMENT**
   - Identifie où le flux est bloqué
   - Causes probables (ressources, processus, priorités)
   - Impact quantifié

4. **PLAN D'OPTIMISATION**
   - Quick wins (impact rapide, effort faible)
   - Améliorations structurelles
   - Métriques de suivi recommandées

5. **BENCHMARKING**
   - Comparaison aux standards de l'industrie
   - Écarts et opportunités

Format: analytique avec données chiffrées, graphiques textuels si pertinent.`,

            habits: `${baseContext}

GÉNÈRE UNE ANALYSE COMPORTEMENTALE ET DES HABITUDES DE TRAVAIL:

1. **PATTERNS DE TRAVAIL**
   - Rythme circadien productif
   - Jours les plus/moins efficaces
   - Durée moyenne des sessions de focus

2. **CHRONOBIOLOGIE PRODUCTIVE**
   - Heures de pic identifiées: ${stats.peakHours.map(h => h + 'h').join(', ')}
   - Recommandations d'optimisation temporelle
   - Gestion de l'énergie cognitive

3. **CONSISTANCE ET DISCIPLINE**
   - Score de régularité: analyse du streak (${stats.streak} jours)
   - Facteurs de rupture potentiels
   - Stratégies de maintien

4. **CHARGE COGNITIVE**
   - Analyse de la répartition des tâches
   - Risque de surcharge/sous-charge
   - Équilibre effort/récupération

5. **RECOMMANDATIONS BIEN-ÊTRE**
   - Ajustements pour performance durable
   - Signaux d'alerte burn-out
   - Pratiques recommandées

Format: empathique mais factuel, orienté développement personnel et performance.`,

            project: `${baseContext}

GÉNÈRE UN AUDIT DE SANTÉ DES PROJETS:

1. **VUE D'ENSEMBLE PORTFOLIO**
   - État de santé de chaque projet (vert/jaune/rouge)
   - Allocation des ressources
   - Équilibre du portefeuille

2. **ANALYSE PAR PROJET**
Pour chaque projet principal:
   - Avancement vs objectif
   - Vélocité récente
   - Risques spécifiques
   - Prochaines étapes critiques

3. **TIMELINE ET JALONS**
   - Projets en avance/retard
   - Deadlines critiques à venir
   - Dépendances bloquantes

4. **ALLOCATION DES RESSOURCES**
   - Projets sous/sur-chargés
   - Recommandations de rééquilibrage

5. **MATRICE DES RISQUES**
   - Risques identifiés par probabilité/impact
   - Plans de mitigation suggérés

Format: tableau de bord exécutif avec indicateurs visuels.`,

            team: `${baseContext}

GÉNÈRE UNE ANALYSE DE PERFORMANCE D'ÉQUIPE:

1. **DYNAMIQUE COLLECTIVE**
   - Distribution de la charge de travail
   - Indicateurs de collaboration
   - Cohésion estimée

2. **ANALYSE DE LA DISTRIBUTION**
   - Qui fait quoi (anonymisé si nécessaire)
   - Équilibre de la charge
   - Spécialisations détectées

3. **SYNERGIES ET BLOCAGES**
   - Où la collaboration fonctionne bien
   - Points de friction identifiés
   - Dépendances critiques

4. **RECOMMANDATIONS MANAGÉRIALES**
   - Actions pour améliorer la collaboration
   - Réorganisation suggérée
   - Rituels d'équipe recommandés

Format: orienté management avec actions concrètes.`,

            complete: `${baseContext}

GÉNÈRE UN AUDIT D'ENTREPRISE COMPLET ET EXHAUSTIF:

## PARTIE 1: SYNTHÈSE EXÉCUTIVE
- Score de santé global: X/100
- 3 points forts majeurs
- 3 axes d'amélioration prioritaires
- Recommandation stratégique principale

## PARTIE 2: PERFORMANCE OPÉRATIONNELLE
- Métriques clés (productivité, qualité, délais)
- Analyse des tendances
- Benchmark sectoriel estimé

## PARTIE 3: GESTION DE PROJET
- État du portefeuille projets
- Projets à risque
- Ressources critiques

## PARTIE 4: CAPITAL HUMAIN
- Charge de travail
- Patterns d'efficacité
- Recommandations bien-être

## PARTIE 5: ANALYSE PROSPECTIVE
- Scénarios à 30/60/90 jours
- Risques anticipés
- Opportunités identifiées

## PARTIE 6: PLAN D'ACTION
- Actions immédiates (cette semaine)
- Actions court terme (ce mois)
- Actions moyen terme (ce trimestre)

Format: rapport de direction complet, professionnel, prêt à être présenté au board.`
        };

        return prompts[type] || prompts.executive;
    }

    // ========== GÉNÉRATION DE RAPPORT ==========

    /**
     * Génère un rapport via l'API IA
     */
    async function generateReport(type) {
        if (state.isGenerating) return;

        state.isGenerating = true;
        state.selectedType = type;
        state.dataSnapshot = collectData();

        updateUI('generating');

        const prompt = buildAIPrompt(type, state.dataSnapshot);

        try {
            // Essayer d'utiliser l'API existante
            let reportContent;

            if (typeof ApiService !== 'undefined' && ApiService.sendChatMessage) {
                const response = await ApiService.sendChatMessage({
                    message: prompt,
                    context: state.dataSnapshot,
                    user: state.dataSnapshot.user?.name || 'Utilisateur',
                    userId: AppState?.currentUser?.id,
                    type: 'report'
                });

                // Nettoyer la réponse des actions
                reportContent = response.replace(/ACTION:[A-Z_]+\|[^\n]*/g, '').trim();
            } else {
                // Fallback: générer un rapport basique sans IA
                reportContent = generateFallbackReport(type, state.dataSnapshot);
            }

            // Stocker le rapport
            state.currentReport = {
                type: type,
                typeInfo: REPORT_TYPES[type],
                content: reportContent,
                data: state.dataSnapshot,
                generatedAt: new Date(),
                id: 'report_' + Date.now()
            };

            // Ajouter à l'historique
            state.reportHistory.unshift(state.currentReport);
            if (state.reportHistory.length > 10) {
                state.reportHistory.pop();
            }

            updateUI('complete');

        } catch (error) {
            console.error('Erreur génération rapport:', error);
            updateUI('error', error.message);
        } finally {
            state.isGenerating = false;
        }
    }

    /**
     * Génère un rapport basique sans IA (fallback)
     */
    function generateFallbackReport(type, data) {
        const stats = data.stats;
        const typeInfo = REPORT_TYPES[type];

        return `
# ${typeInfo.icon} ${typeInfo.name}
_Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}_

---

## Synthèse

**Score de productivité: ${stats.completionRate}%**

| Métrique | Valeur |
|----------|--------|
| Tâches totales | ${stats.total} |
| Terminées | ${stats.byStatus.done} |
| En cours | ${stats.byStatus.inProgress} |
| À faire | ${stats.byStatus.todo} |
| En retard | ${stats.overdueTasks} |

## Performance

- **Vélocité hebdomadaire**: ${stats.weeklyVelocity} tâches/jour
- **Streak actuel**: ${stats.streak} jours consécutifs
- **Heures productives**: ${stats.peakHours.map(h => h + 'h').join(', ') || 'Non déterminé'}

## Projets

${stats.projectStats.slice(0, 5).map(p =>
    `### ${p.name}\n- Progression: ${p.done}/${p.total} (${p.total > 0 ? Math.round(p.done/p.total*100) : 0}%)`
).join('\n\n')}

## Recommandations

1. ${stats.overdueTasks > 0 ? `Traiter les ${stats.overdueTasks} tâches en retard en priorité` : 'Continuer sur cette lancée positive'}
2. ${stats.streak < 3 ? 'Établir une routine quotidienne pour améliorer la consistance' : `Maintenir le streak de ${stats.streak} jours`}
3. ${stats.byPriority.high > 3 ? 'Réévaluer les priorités - trop de tâches urgentes' : 'Bonne gestion des priorités'}

---
_Rapport généré par GIRI Psycho Audit Engine_
`;
    }

    // ========== EXPORT PDF ==========

    /**
     * Exporte le rapport actuel en PDF
     */
    function downloadPDF() {
        if (!state.currentReport) {
            notify('Génère un rapport d\'abord', 'warning');
            return;
        }

        const jsPDF = window.jspdf?.jsPDF;
        if (!jsPDF) {
            notify('jsPDF non chargé', 'error');
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let y = 0;

        // ===== PAGE DE GARDE =====
        // Background header
        doc.setFillColor(224, 120, 64); // Brand color
        doc.rect(0, 0, pageWidth, 60, 'F');

        // Logo / Brand
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('GIRI', pageWidth / 2, 25, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('PSYCHO AUDIT ENGINE', pageWidth / 2, 35, { align: 'center' });

        // Report type
        doc.setFontSize(10);
        doc.text(state.currentReport.typeInfo.name.toUpperCase(), pageWidth / 2, 50, { align: 'center' });

        // Date
        y = 80;
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(`Rapport généré le ${state.currentReport.generatedAt.toLocaleDateString('fr-FR')}`, pageWidth / 2, y, { align: 'center' });
        doc.text(`à ${state.currentReport.generatedAt.toLocaleTimeString('fr-FR')}`, pageWidth / 2, y + 5, { align: 'center' });

        // Stats summary box
        y = 100;
        const stats = state.currentReport.data.stats;

        doc.setFillColor(245, 245, 245);
        doc.roundedRect(margin, y, contentWidth, 40, 5, 5, 'F');

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);

        const summaryItems = [
            { label: 'Tâches', value: stats.total },
            { label: 'Terminées', value: stats.byStatus.done },
            { label: 'Complétion', value: stats.completionRate + '%' },
            { label: 'Vélocité', value: stats.weeklyVelocity + '/j' }
        ];

        const itemWidth = contentWidth / 4;
        summaryItems.forEach((item, i) => {
            const x = margin + (i * itemWidth) + (itemWidth / 2);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text(String(item.value), x, y + 18, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(item.label, x, y + 28, { align: 'center' });
        });

        // ===== CONTENU DU RAPPORT =====
        doc.addPage();
        y = margin;

        // Title
        doc.setTextColor(224, 120, 64);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(state.currentReport.typeInfo.icon + ' ' + state.currentReport.typeInfo.name, margin, y);
        y += 15;

        // Content
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const content = state.currentReport.content;
        const lines = doc.splitTextToSize(content, contentWidth);

        lines.forEach(line => {
            if (y > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }

            // Style headers
            if (line.startsWith('##')) {
                y += 5;
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(224, 120, 64);
                doc.text(line.replace(/^#+\s*/, ''), margin, y);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(40, 40, 40);
            } else if (line.startsWith('#')) {
                y += 8;
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(224, 120, 64);
                doc.text(line.replace(/^#+\s*/, ''), margin, y);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(40, 40, 40);
            } else if (line.startsWith('**') && line.endsWith('**')) {
                doc.setFont('helvetica', 'bold');
                doc.text(line.replace(/\*\*/g, ''), margin, y);
                doc.setFont('helvetica', 'normal');
            } else if (line.startsWith('- ') || line.startsWith('• ')) {
                doc.text('  ' + line, margin, y);
            } else {
                doc.text(line, margin, y);
            }
            y += 5;
        });

        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `GIRI Psycho Audit Engine - Page ${i}/${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }

        // Download
        const filename = `GIRI_${state.currentReport.typeInfo.id}_${state.currentReport.generatedAt.toISOString().split('T')[0]}.pdf`;
        doc.save(filename);

        notify('PDF téléchargé: ' + filename, 'success');
    }

    // ========== UI ==========

    /**
     * Ouvre le créateur de rapports
     */
    function open() {
        if (state.isOpen) return;

        createUI();
        state.isOpen = true;

        // Animer l'ouverture
        requestAnimationFrame(() => {
            const container = document.getElementById(CONFIG.containerId);
            if (container) {
                container.classList.add('visible');
            }
        });
    }

    /**
     * Ferme le créateur de rapports
     */
    function close() {
        const container = document.getElementById(CONFIG.containerId);
        if (container) {
            container.classList.remove('visible');
            setTimeout(() => {
                container.remove();
                state.isOpen = false;
            }, 300);
        }
    }

    /**
     * Crée l'interface utilisateur
     */
    function createUI() {
        // Supprimer l'ancien container si existe
        const existing = document.getElementById(CONFIG.containerId);
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = CONFIG.containerId;
        container.className = 'report-creator-overlay';
        container.innerHTML = `
            <div class="report-creator-modal">
                <div class="report-creator-header">
                    <div class="report-creator-brand">
                        <span class="brand-icon">${icons.target}</span>
                        <div class="brand-text">
                            <h2>Psycho Audit Engine</h2>
                            <span class="brand-subtitle">Rapports d'audit IA haut de gamme</span>
                        </div>
                    </div>
                    <button class="report-creator-close" onclick="ReportCreator.close()">
                        ${icons.close}
                    </button>
                </div>

                <div class="report-creator-body">
                    <!-- Sélection du type -->
                    <div class="report-type-selector" id="report-type-selector">
                        <h3>Sélectionnez le type d'audit</h3>
                        <div class="report-types-grid">
                            ${Object.values(REPORT_TYPES).map(type => `
                                <div class="report-type-card" onclick="ReportCreator.selectType('${type.id}')">
                                    <span class="type-icon">${type.icon}</span>
                                    <h4>${type.name}</h4>
                                    <p>${type.description}</p>
                                    <span class="type-time">${icons.clock} ${type.estimatedTime}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Zone de génération -->
                    <div class="report-generation-area hidden" id="report-generation-area">
                        <div class="generation-status">
                            <div class="status-icon">${icons.loader}</div>
                            <h3>Génération en cours...</h3>
                            <p>Analyse des données et rédaction du rapport</p>
                        </div>
                    </div>

                    <!-- Prévisualisation du rapport -->
                    <div class="report-preview-area hidden" id="report-preview-area">
                        <div class="preview-header">
                            <div class="preview-title">
                                <span class="preview-icon" id="preview-icon"></span>
                                <h3 id="preview-title">Rapport</h3>
                            </div>
                            <div class="preview-actions">
                                <button class="btn btn-secondary btn-sm" onclick="ReportCreator.copyToClipboard()">
                                    ${icons.copy} Copier
                                </button>
                                <button class="btn btn-primary btn-sm" onclick="ReportCreator.downloadPDF()">
                                    ${icons.download} PDF
                                </button>
                            </div>
                        </div>
                        <div class="preview-content" id="preview-content"></div>
                        <div class="preview-footer">
                            <button class="btn btn-outline" onclick="ReportCreator.backToSelection()">
                                Nouveau rapport
                            </button>
                            <button class="btn btn-secondary" onclick="ReportCreator.regenerate()">
                                ${icons.refresh} Régénérer
                            </button>
                        </div>
                    </div>

                    <!-- Erreur -->
                    <div class="report-error-area hidden" id="report-error-area">
                        <div class="error-icon">${icons.alert}</div>
                        <h3>Erreur de génération</h3>
                        <p id="error-message">Une erreur est survenue</p>
                        <button class="btn btn-primary" onclick="ReportCreator.backToSelection()">
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
        injectStyles();
    }

    /**
     * Met à jour l'interface selon l'état
     */
    function updateUI(status, errorMsg) {
        const typeSelector = document.getElementById('report-type-selector');
        const generationArea = document.getElementById('report-generation-area');
        const previewArea = document.getElementById('report-preview-area');
        const errorArea = document.getElementById('report-error-area');

        // Cacher tout
        [typeSelector, generationArea, previewArea, errorArea].forEach(el => {
            if (el) el.classList.add('hidden');
        });

        switch (status) {
            case 'selection':
                if (typeSelector) typeSelector.classList.remove('hidden');
                break;

            case 'generating':
                if (generationArea) generationArea.classList.remove('hidden');
                break;

            case 'complete':
                if (previewArea) {
                    previewArea.classList.remove('hidden');

                    // Mettre à jour le contenu
                    const previewIcon = document.getElementById('preview-icon');
                    const previewTitle = document.getElementById('preview-title');
                    const previewContent = document.getElementById('preview-content');

                    if (previewIcon && state.currentReport) {
                        previewIcon.textContent = state.currentReport.typeInfo.icon;
                    }
                    if (previewTitle && state.currentReport) {
                        previewTitle.textContent = state.currentReport.typeInfo.name;
                    }
                    if (previewContent && state.currentReport) {
                        previewContent.innerHTML = formatReportContent(state.currentReport.content);
                    }
                }
                break;

            case 'error':
                if (errorArea) {
                    errorArea.classList.remove('hidden');
                    const errorMsgEl = document.getElementById('error-message');
                    if (errorMsgEl) {
                        errorMsgEl.textContent = errorMsg || 'Une erreur est survenue';
                    }
                }
                break;
        }
    }

    /**
     * Formate le contenu du rapport en HTML
     */
    function formatReportContent(content) {
        if (!content) return '';

        // Échapper le HTML
        let html = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Convertir le markdown basique
        html = html
            // Headers
            .replace(/^### (.+)$/gm, '<h4>$1</h4>')
            .replace(/^## (.+)$/gm, '<h3>$1</h3>')
            .replace(/^# (.+)$/gm, '<h2>$1</h2>')
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Lists
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/^• (.+)$/gm, '<li>$1</li>')
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            // Wrap lists
            .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
            // Horizontal rules
            .replace(/^---$/gm, '<hr>')
            // Paragraphs
            .replace(/\n\n/g, '</p><p>')
            // Line breaks
            .replace(/\n/g, '<br>');

        return `<p>${html}</p>`;
    }

    /**
     * Sélectionne un type de rapport
     */
    function selectType(typeId) {
        generateReport(typeId);
    }

    /**
     * Retourne à la sélection
     */
    function backToSelection() {
        updateUI('selection');
    }

    /**
     * Régénère le rapport actuel
     */
    function regenerate() {
        if (state.selectedType) {
            generateReport(state.selectedType);
        }
    }

    /**
     * Copie le rapport dans le presse-papiers
     */
    function copyToClipboard() {
        if (!state.currentReport) return;

        navigator.clipboard.writeText(state.currentReport.content).then(() => {
            notify('Rapport copié dans le presse-papiers', 'success');
        }).catch(err => {
            console.error('Erreur copie:', err);
            notify('Erreur lors de la copie', 'error');
        });
    }

    /**
     * Affiche une notification
     */
    function notify(message, type = 'info') {
        if (typeof Utils !== 'undefined' && Utils.notify) {
            Utils.notify(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Injecte les styles CSS
     */
    function injectStyles() {
        if (document.getElementById('report-creator-styles')) return;

        const style = document.createElement('style');
        style.id = 'report-creator-styles';
        style.textContent = `
            /* ========== OVERLAY ========== */
            .report-creator-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .report-creator-overlay.visible {
                opacity: 1;
                visibility: visible;
            }

            /* ========== MODAL ========== */
            .report-creator-modal {
                background: var(--bg-primary, #1a1a2e);
                border-radius: 20px;
                width: 90%;
                max-width: 1000px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                border: 1px solid var(--border, rgba(255,255,255,0.1));
                transform: translateY(20px);
                transition: transform 0.3s ease;
            }

            .report-creator-overlay.visible .report-creator-modal {
                transform: translateY(0);
            }

            /* ========== HEADER ========== */
            .report-creator-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 24px;
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
                background: linear-gradient(135deg, rgba(224, 120, 64, 0.1), transparent);
            }

            .report-creator-brand {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .brand-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #E07840, #c45d2a);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .brand-icon svg {
                width: 24px;
                height: 24px;
                color: white;
            }

            .brand-text h2 {
                margin: 0;
                font-size: 18px;
                font-weight: 700;
                color: var(--text-primary, #fff);
            }

            .brand-subtitle {
                font-size: 12px;
                color: var(--text-muted, #888);
            }

            .report-creator-close {
                width: 36px;
                height: 36px;
                border-radius: 10px;
                border: none;
                background: var(--bg-secondary, #252538);
                color: var(--text-muted, #888);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .report-creator-close:hover {
                background: var(--danger, #e74c3c);
                color: white;
            }

            .report-creator-close svg {
                width: 18px;
                height: 18px;
            }

            /* ========== BODY ========== */
            .report-creator-body {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
            }

            /* ========== TYPE SELECTOR ========== */
            .report-type-selector h3 {
                margin: 0 0 20px;
                font-size: 16px;
                color: var(--text-muted, #888);
                text-align: center;
            }

            .report-types-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 16px;
            }

            .report-type-card {
                background: var(--bg-secondary, #252538);
                border: 2px solid transparent;
                border-radius: 16px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .report-type-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #E07840, #f5a623);
                transform: scaleX(0);
                transition: transform 0.3s ease;
            }

            .report-type-card:hover {
                border-color: var(--accent, #E07840);
                transform: translateY(-4px);
                box-shadow: 0 10px 30px rgba(224, 120, 64, 0.2);
            }

            .report-type-card:hover::before {
                transform: scaleX(1);
            }

            .type-icon {
                font-size: 32px;
                display: block;
                margin-bottom: 12px;
            }

            .report-type-card h4 {
                margin: 0 0 8px;
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary, #fff);
            }

            .report-type-card p {
                margin: 0 0 12px;
                font-size: 13px;
                color: var(--text-muted, #888);
                line-height: 1.5;
            }

            .type-time {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-size: 11px;
                color: var(--text-muted, #666);
                padding: 4px 10px;
                background: var(--bg-tertiary, rgba(255,255,255,0.05));
                border-radius: 20px;
            }

            .type-time svg {
                width: 12px;
                height: 12px;
            }

            /* ========== GENERATION AREA ========== */
            .report-generation-area {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 400px;
            }

            .generation-status {
                text-align: center;
            }

            .status-icon {
                width: 64px;
                height: 64px;
                margin: 0 auto 20px;
            }

            .status-icon svg {
                width: 100%;
                height: 100%;
                color: var(--accent, #E07840);
            }

            .status-icon svg.spin {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .generation-status h3 {
                margin: 0 0 8px;
                font-size: 20px;
                color: var(--text-primary, #fff);
            }

            .generation-status p {
                margin: 0;
                color: var(--text-muted, #888);
            }

            /* ========== PREVIEW AREA ========== */
            .report-preview-area {
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            .preview-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-bottom: 16px;
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
                margin-bottom: 16px;
            }

            .preview-title {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .preview-icon {
                font-size: 24px;
            }

            .preview-title h3 {
                margin: 0;
                font-size: 18px;
                color: var(--text-primary, #fff);
            }

            .preview-actions {
                display: flex;
                gap: 8px;
            }

            .preview-content {
                flex: 1;
                overflow-y: auto;
                background: var(--bg-secondary, #252538);
                border-radius: 12px;
                padding: 24px;
                font-size: 14px;
                line-height: 1.7;
                color: var(--text-primary, #e0e0e0);
                max-height: 50vh;
            }

            .preview-content h2 {
                color: var(--accent, #E07840);
                font-size: 18px;
                margin: 24px 0 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.1));
            }

            .preview-content h2:first-child {
                margin-top: 0;
            }

            .preview-content h3 {
                color: var(--text-primary, #fff);
                font-size: 15px;
                margin: 20px 0 10px;
            }

            .preview-content h4 {
                color: var(--text-secondary, #ccc);
                font-size: 14px;
                margin: 16px 0 8px;
            }

            .preview-content ul {
                margin: 10px 0;
                padding-left: 20px;
            }

            .preview-content li {
                margin: 6px 0;
            }

            .preview-content strong {
                color: var(--accent, #E07840);
            }

            .preview-content hr {
                border: none;
                border-top: 1px solid var(--border, rgba(255,255,255,0.1));
                margin: 20px 0;
            }

            .preview-footer {
                display: flex;
                justify-content: space-between;
                padding-top: 16px;
                margin-top: 16px;
                border-top: 1px solid var(--border, rgba(255,255,255,0.1));
            }

            /* ========== ERROR AREA ========== */
            .report-error-area {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 400px;
                text-align: center;
            }

            .error-icon {
                width: 64px;
                height: 64px;
                margin-bottom: 20px;
                color: var(--danger, #e74c3c);
            }

            .error-icon svg {
                width: 100%;
                height: 100%;
            }

            .report-error-area h3 {
                margin: 0 0 8px;
                color: var(--danger, #e74c3c);
            }

            .report-error-area p {
                margin: 0 0 20px;
                color: var(--text-muted, #888);
            }

            /* ========== BUTTONS ========== */
            .btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 18px;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 500;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn svg {
                width: 16px;
                height: 16px;
            }

            .btn-sm {
                padding: 8px 14px;
                font-size: 13px;
            }

            .btn-primary {
                background: linear-gradient(135deg, #E07840, #c45d2a);
                color: white;
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(224, 120, 64, 0.4);
            }

            .btn-secondary {
                background: var(--bg-tertiary, #353550);
                color: var(--text-primary, #fff);
            }

            .btn-secondary:hover {
                background: var(--bg-secondary, #404060);
            }

            .btn-outline {
                background: transparent;
                border: 1px solid var(--border, rgba(255,255,255,0.2));
                color: var(--text-muted, #888);
            }

            .btn-outline:hover {
                border-color: var(--accent, #E07840);
                color: var(--accent, #E07840);
            }

            /* ========== UTILITIES ========== */
            .hidden {
                display: none !important;
            }

            /* ========== RESPONSIVE ========== */
            @media (max-width: 768px) {
                .report-creator-modal {
                    width: 95%;
                    max-height: 95vh;
                    border-radius: 16px;
                }

                .report-creator-header {
                    padding: 16px;
                }

                .report-creator-body {
                    padding: 16px;
                }

                .report-types-grid {
                    grid-template-columns: 1fr;
                }

                .preview-header {
                    flex-direction: column;
                    gap: 12px;
                }

                .preview-actions {
                    width: 100%;
                    justify-content: stretch;
                }

                .preview-actions .btn {
                    flex: 1;
                    justify-content: center;
                }

                .preview-footer {
                    flex-direction: column;
                    gap: 12px;
                }

                .preview-footer .btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ========== PUBLIC API ==========
    return {
        open,
        close,
        selectType,
        generateReport,
        downloadPDF,
        copyToClipboard,
        backToSelection,
        regenerate,
        getReportHistory: () => [...state.reportHistory],
        getCurrentReport: () => state.currentReport,
        REPORT_TYPES
    };
})();

// Exposer globalement
if (typeof window !== 'undefined') {
    window.ReportCreator = ReportCreator;
}
