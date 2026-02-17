"use strict";
/**
 * AI Reports Service
 * Generates intelligent reports with AI analysis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiReportsService = exports.AIReportsService = void 0;
const database_js_1 = require("../../config/database.js");
const helpers_js_1 = require("../../utils/helpers.js");
const ai_service_js_1 = require("../ai/ai.service.js");
class AIReportsService {
    /**
     * Generate an AI-powered report
     */
    async generateReport(workspaceId, userId, input) {
        const reportType = input.report_type || 'standard';
        const periodType = input.period_type || 'week';
        // Get raw metrics
        const { start, end } = this.getPeriodDates(periodType);
        // Get tasks data
        const tasks = await (0, database_js_1.sql) `
      SELECT id, title, status, priority, project_id, created_at, completed_at
      FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND created_at >= ${start}
      ORDER BY created_at DESC
      LIMIT 100
    `;
        // Get projects data with calculated progress
        const projects = await (0, database_js_1.sql) `
      SELECT
        p.id, p.name, p.status,
        COALESCE(
          ROUND(
            (COUNT(*) FILTER (WHERE t.status = 'done')::float /
             NULLIF(COUNT(t.id), 0) * 100)
          ), 0
        )::int as progress
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.workspace_id = ${workspaceId}
      GROUP BY p.id, p.name, p.status
    `;
        // Calculate metrics
        const metrics = await this.calculateMetrics(workspaceId, userId, start, end);
        // Build context for AI
        const context = this.buildAIContext(tasks, projects, metrics, periodType);
        // Generate AI analysis based on report type
        const aiPrompt = this.buildPrompt(reportType, context, input.custom_prompt);
        const aiResponse = await ai_service_js_1.aiService.generate({
            prompt: aiPrompt,
            system: this.getSystemPrompt(reportType),
            max_tokens: 2000,
        });
        // Parse AI response
        const parsed = this.parseAIResponse(aiResponse.content, reportType);
        // Calculate AI score
        const aiScore = this.calculateAIScore(metrics, parsed);
        // Generate title
        const title = input.title || this.generateTitle(reportType, periodType);
        // Save to database
        const id = (0, helpers_js_1.generateUUID)();
        const result = await (0, database_js_1.sql) `
      INSERT INTO ai_reports (
        id, workspace_id, user_id, report_type, title,
        period_type, period_start, period_end, metrics,
        ai_analysis, ai_recommendations, ai_score,
        strengths, weaknesses, opportunities, threats,
        created_at, updated_at
      ) VALUES (
        ${id}, ${workspaceId}, ${userId}, ${reportType}, ${title},
        ${periodType}, ${start}, ${end}, ${JSON.stringify(metrics)},
        ${parsed.analysis}, ${parsed.recommendations}, ${aiScore},
        ${parsed.strengths}, ${parsed.weaknesses},
        ${parsed.opportunities}, ${parsed.threats},
        NOW(), NOW()
      )
      RETURNING *
    `;
        return result[0];
    }
    /**
     * Get list of AI reports
     */
    async getReports(workspaceId, userId, params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const offset = (page - 1) * limit;
        let conditions = (0, database_js_1.sql) `workspace_id = ${workspaceId} AND user_id = ${userId}`;
        if (params.report_type) {
            conditions = (0, database_js_1.sql) `${conditions} AND report_type = ${params.report_type}`;
        }
        if (params.from) {
            conditions = (0, database_js_1.sql) `${conditions} AND created_at >= ${params.from}`;
        }
        if (params.to) {
            conditions = (0, database_js_1.sql) `${conditions} AND created_at <= ${params.to}`;
        }
        const reports = await (0, database_js_1.sql) `
      SELECT * FROM ai_reports
      WHERE ${conditions}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count FROM ai_reports
      WHERE ${conditions}
    `;
        return {
            reports: reports,
            total: countResult[0].count,
        };
    }
    /**
     * Get a single report by ID
     */
    async getReportById(reportId, workspaceId) {
        const result = await (0, database_js_1.sql) `
      SELECT * FROM ai_reports
      WHERE id = ${reportId} AND workspace_id = ${workspaceId}
    `;
        return result[0] || null;
    }
    /**
     * Generate meta-synthesis (analysis of multiple reports)
     */
    async generateMetaSynthesis(workspaceId, userId, input) {
        // Get previous reports to analyze
        let reports;
        if (input.report_ids && input.report_ids.length > 0) {
            const result = await (0, database_js_1.sql) `
        SELECT * FROM ai_reports
        WHERE id = ANY(${input.report_ids})
          AND workspace_id = ${workspaceId}
        ORDER BY created_at ASC
      `;
            reports = result;
        }
        else {
            // Get all reports from the period
            const { start, end } = this.getPeriodDates(input.period_type || 'month');
            const result = await (0, database_js_1.sql) `
        SELECT * FROM ai_reports
        WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
          AND created_at >= ${start} AND created_at <= ${end}
        ORDER BY created_at ASC
        LIMIT 20
      `;
            reports = result;
        }
        if (reports.length === 0) {
            throw new Error('Aucun rapport disponible pour la synthèse');
        }
        // Build synthesis context
        const synthesisContext = this.buildSynthesisContext(reports);
        // Generate meta-synthesis
        const aiResponse = await ai_service_js_1.aiService.generate({
            prompt: this.buildMetaSynthesisPrompt(synthesisContext, input.focus_areas),
            system: this.getMetaSynthesisSystemPrompt(),
            max_tokens: 3000,
        });
        // Parse response
        const parsed = this.parseAIResponse(aiResponse.content, 'meta_synthesis');
        // Calculate evolution score
        const evolutionScore = this.calculateEvolutionScore(reports);
        // Save
        const id = (0, helpers_js_1.generateUUID)();
        const title = `Méta-Synthèse - ${reports.length} rapports analysés`;
        const result = await (0, database_js_1.sql) `
      INSERT INTO ai_reports (
        id, workspace_id, user_id, report_type, title,
        ai_analysis, ai_recommendations, ai_score,
        strengths, weaknesses, opportunities, threats,
        created_at, updated_at
      ) VALUES (
        ${id}, ${workspaceId}, ${userId}, 'meta_synthesis', ${title},
        ${parsed.analysis}, ${parsed.recommendations}, ${evolutionScore},
        ${parsed.strengths}, ${parsed.weaknesses},
        ${parsed.opportunities}, ${parsed.threats},
        NOW(), NOW()
      )
      RETURNING *
    `;
        return result[0];
    }
    /**
     * Get visualization data for charts
     */
    async getVisualizationData(workspaceId, userId, periodType) {
        const { start } = this.getPeriodDates(periodType);
        // Tasks by status
        const tasksByStatus = await (0, database_js_1.sql) `
      SELECT status, COUNT(*)::int as count
      FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND created_at >= ${start}
      GROUP BY status
    `;
        // Daily productivity (last 7 days)
        const dailyProductivity = await (0, database_js_1.sql) `
      SELECT DATE(completed_at) as day, COUNT(*)::int as count
      FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND completed_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(completed_at)
      ORDER BY day
    `;
        // Projects progress (calculated from tasks)
        const projectsProgress = await (0, database_js_1.sql) `
      SELECT
        p.name,
        COALESCE(
          ROUND(
            (COUNT(*) FILTER (WHERE t.status = 'done')::float /
             NULLIF(COUNT(t.id), 0) * 100)
          ), 0
        )::int as progress
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.workspace_id = ${workspaceId}
      GROUP BY p.id, p.name
      ORDER BY progress DESC
      LIMIT 5
    `;
        // Priority distribution
        const priorityDist = await (0, database_js_1.sql) `
      SELECT priority, COUNT(*)::int as count
      FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND status != 'done'
      GROUP BY priority
    `;
        // Weekly comparison
        const weeklyComparison = await (0, database_js_1.sql) `
      SELECT
        EXTRACT(WEEK FROM completed_at) as week,
        COUNT(*)::int as count
      FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND completed_at >= NOW() - INTERVAL '4 weeks'
      GROUP BY week
      ORDER BY week
    `;
        return {
            tasksByStatus: this.formatChartData(tasksByStatus, 'status', 'count', ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6']),
            productivityTrend: this.formatLineChartData(dailyProductivity, 'day', 'count', 'Tâches complétées'),
            projectsProgress: this.formatChartData(projectsProgress, 'name', 'progress', ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981']),
            priorityDistribution: this.formatChartData(priorityDist, 'priority', 'count', ['#ef4444', '#f59e0b', '#10b981']),
            weeklyComparison: this.formatLineChartData(weeklyComparison, 'week', 'count', 'Semaine'),
        };
    }
    // =============================================
    // PRIVATE METHODS
    // =============================================
    async calculateMetrics(workspaceId, userId, start, end) {
        const tasksCreated = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND created_at >= ${start} AND created_at <= ${end}
    `;
        const tasksCompleted = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND completed_at >= ${start} AND completed_at <= ${end}
    `;
        const tasksOverdue = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count FROM tasks
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        AND due_date < NOW() AND status != 'done'
    `;
        // Calculate project stats with average progress from tasks
        const projectsData = await (0, database_js_1.sql) `
      WITH project_progress AS (
        SELECT
          p.id,
          p.status,
          COALESCE(
            ROUND(
              (COUNT(*) FILTER (WHERE t.status = 'done')::float /
               NULLIF(COUNT(t.id), 0) * 100)
            ), 0
          )::int as progress
        FROM projects p
        LEFT JOIN tasks t ON t.project_id = p.id
        WHERE p.workspace_id = ${workspaceId}
        GROUP BY p.id, p.status
      )
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'active')::int as active,
        COUNT(*) FILTER (WHERE status = 'archived')::int as archived,
        COALESCE(AVG(progress), 0)::int as avg_progress
      FROM project_progress
    `;
        const completionRate = tasksCreated[0].count > 0
            ? Math.round((tasksCompleted[0].count / tasksCreated[0].count) * 100)
            : 0;
        const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
        const tasksPerDay = tasksCompleted[0].count / daysInPeriod;
        return {
            tasks: {
                created: tasksCreated[0].count,
                completed: tasksCompleted[0].count,
                overdue: tasksOverdue[0].count,
                completion_rate: completionRate,
            },
            projects: {
                total: projectsData[0].total,
                active: projectsData[0].active,
                completed: projectsData[0].archived,
                avg_progress: projectsData[0].avg_progress,
            },
            productivity: {
                tasks_per_day: Math.round(tasksPerDay * 10) / 10,
                avg_completion_time_hours: null,
                most_productive_day: null,
                most_productive_hour: null,
            },
            gamification: {
                xp_earned: 0,
                current_streak: 0,
                achievements_unlocked: 0,
                level: 1,
            },
            score: 0,
        };
    }
    buildAIContext(tasks, projects, metrics, periodType) {
        const periodLabel = periodType === 'week' ? 'semaine' : periodType === 'month' ? 'mois' : 'année';
        const tasksList = tasks;
        const projectsList = projects;
        // Calculate advanced metrics
        const urgentTasks = tasksList.filter(t => t.priority === 1).length;
        const normalTasks = tasksList.filter(t => t.priority === 2).length;
        const lowTasks = tasksList.filter(t => t.priority === 3).length;
        const todoTasks = tasksList.filter(t => t.status === 'todo').length;
        const inProgressTasks = tasksList.filter(t => t.status === 'inprogress').length;
        const doneTasks = tasksList.filter(t => t.status === 'done').length;
        // Projects by progress category
        const projectsHigh = projectsList.filter(p => p.progress >= 75).length;
        const projectsMid = projectsList.filter(p => p.progress >= 50 && p.progress < 75).length;
        const projectsLow = projectsList.filter(p => p.progress < 50).length;
        // Task velocity (completed tasks over time)
        const completionVelocity = metrics.productivity.tasks_per_day;
        const velocityTrend = completionVelocity > 3 ? 'élevée' : completionVelocity > 1.5 ? 'moyenne' : 'faible';
        // Overdue analysis
        const overdueRatio = metrics.tasks.created > 0 ? Math.round((metrics.tasks.overdue / metrics.tasks.created) * 100) : 0;
        const overdueStatus = overdueRatio > 20 ? 'CRITIQUE' : overdueRatio > 10 ? 'préoccupant' : 'sous contrôle';
        return `
╔═══════════════════════════════════════════════════════════════╗
║ RAPPORT D'ANALYSE ULTRA-DÉTAILLÉ - ${periodLabel.toUpperCase()}
╚═══════════════════════════════════════════════════════════════╝

📊 MÉTRIQUES DE PERFORMANCE GLOBALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Taux de complétion: ${metrics.tasks.completion_rate}% ${metrics.tasks.completion_rate >= 80 ? '🔥 EXCELLENT' : metrics.tasks.completion_rate >= 60 ? '✓ Bon' : '⚠️ À améliorer'}
• Vélocité: ${completionVelocity.toFixed(1)} tâches/jour (${velocityTrend})
• Retards: ${metrics.tasks.overdue} tâches (${overdueRatio}% - ${overdueStatus})

📈 ANALYSE DES TÂCHES (${metrics.tasks.created} créées, ${metrics.tasks.completed} complétées)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STATUS:
  ✅ Terminées: ${doneTasks}
  🔄 En cours: ${inProgressTasks}
  📋 À faire: ${todoTasks}

PRIORITÉS:
  🔥 Urgentes: ${urgentTasks} ${urgentTasks > 5 ? '⚠️ SURCHARGE' : ''}
  ⚡ Normales: ${normalTasks}
  🌱 Basses: ${lowTasks}

📁 ANALYSE DES PROJETS (${metrics.projects.total} total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Actifs: ${metrics.projects.active}
• Complétés: ${metrics.projects.completed}
• Progression moyenne: ${metrics.projects.avg_progress}%

RÉPARTITION PAR AVANCEMENT:
  🏆 Bien avancés (≥75%): ${projectsHigh}
  📊 En cours (50-74%): ${projectsMid}
  🌱 Démarrés (<50%): ${projectsLow}

🎯 DÉTAIL DES TÂCHES ACTIVES (Top 20):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${tasksList.slice(0, 20).map((t, i) => {
            const priorityLabel = t.priority === 1 ? '🔥 URGENT' : t.priority === 2 ? '⚡ NORMAL' : '🌱 BASSE';
            const statusEmoji = t.status === 'done' ? '✅' : t.status === 'inprogress' ? '🔄' : '📋';
            return `${i + 1}. ${statusEmoji} [${priorityLabel}] ${t.title}`;
        }).join('\n')}

📂 PROJETS EN DÉTAIL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${projectsList.slice(0, 10).map((p, i) => {
            const progressBar = '█'.repeat(Math.floor(p.progress / 10)) + '░'.repeat(10 - Math.floor(p.progress / 10));
            return `${i + 1}. [${progressBar}] ${p.progress}% - ${p.name}`;
        }).join('\n')}

🔍 INSIGHTS COMPORTEMENTAUX:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Charge de travail: ${metrics.tasks.created > 20 ? 'ÉLEVÉE' : metrics.tasks.created > 10 ? 'Modérée' : 'Légère'}
• Focus projet: ${projectsList.length > 5 ? 'Multi-projets' : 'Focus réduit'}
• Gestion des urgences: ${urgentTasks < 3 ? 'Maîtrisée' : urgentTasks < 6 ? 'Attention requise' : 'CRITIQUE'}
• Complétion: ${metrics.tasks.completion_rate >= 80 ? 'Excellente discipline' : metrics.tasks.completion_rate >= 60 ? 'Bonne régularité' : 'Dispersion d\'effort'}

╔═══════════════════════════════════════════════════════════════╗
║ DONNÉES À ANALYSER CI-DESSUS
║ Mission: Fournir une analyse psychologique et comportementale
║ approfondie, des insights actionnables et des recommandations
║ personnalisées basées sur ces patterns.
╚═══════════════════════════════════════════════════════════════╝
`;
    }
    buildPrompt(reportType, context, customPrompt) {
        const basePrompt = `Analyse les données suivantes et génère un rapport ${reportType === 'audit' ? "d'audit comportemental" : 'de productivité'}:\n\n${context}`;
        if (customPrompt) {
            return `${basePrompt}\n\nFOCUS SPÉCIFIQUE: ${customPrompt}`;
        }
        return basePrompt;
    }
    getSystemPrompt(reportType) {
        if (reportType === 'audit') {
            return `Tu es un consultant expert en audit d'entreprise et développement personnel.
Analyse les données et fournis un audit comportemental approfondi.

Format de réponse OBLIGATOIRE (utilise ces marqueurs exactement):

[ANALYSE]
(Analyse détaillée de 3-5 paragraphes sur la performance, les patterns comportementaux et tendances)

[RECOMMANDATIONS]
- Recommandation 1
- Recommandation 2
- Recommandation 3
(au moins 5 recommandations concrètes)

[FORCES]
- Force 1
- Force 2
- Force 3

[FAIBLESSES]
- Faiblesse 1
- Faiblesse 2

[OPPORTUNITÉS]
- Opportunité 1
- Opportunité 2

[MENACES]
- Menace 1
- Menace 2

Sois direct, précis et bienveillant. Donne des conseils actionnables.
Réponds en français.`;
        }
        return `Tu es un assistant de productivité expert.
Analyse les données et génère un rapport de productivité clair et actionnable.

Format de réponse OBLIGATOIRE:

[ANALYSE]
(Synthèse de 2-3 paragraphes sur la performance de la période)

[RECOMMANDATIONS]
- Recommandation 1
- Recommandation 2
- Recommandation 3

[FORCES]
- Point fort 1
- Point fort 2

[FAIBLESSES]
- Point d'amélioration 1
- Point d'amélioration 2

Sois concis et pratique. Réponds en français.`;
    }
    getMetaSynthesisSystemPrompt() {
        return `Tu es un consultant stratégique expert en développement personnel et professionnel.
Tu analyses l'évolution d'une personne sur plusieurs rapports pour identifier les tendances profondes.

Format de réponse OBLIGATOIRE:

[ANALYSE]
(Analyse de l'évolution sur la période, patterns récurrents, progression ou régression, 4-6 paragraphes)

[RECOMMANDATIONS]
- Recommandation stratégique 1
- Recommandation stratégique 2
(au moins 5 recommandations long terme)

[FORCES]
- Force confirmée 1
- Force émergente 2

[FAIBLESSES]
- Faiblesse persistante 1
- Axe d'amélioration prioritaire 2

[OPPORTUNITÉS]
- Opportunité de croissance 1
- Opportunité de développement 2

[MENACES]
- Risque identifié 1
- Point de vigilance 2

Sois inspirant mais réaliste. Aide cette personne à devenir sa meilleure version.
Réponds en français.`;
    }
    buildSynthesisContext(reports) {
        let context = `ÉVOLUTION SUR ${reports.length} RAPPORTS:\n\n`;
        reports.forEach((report, index) => {
            const date = new Date(report.created_at).toLocaleDateString('fr-FR');
            context += `--- RAPPORT ${index + 1} (${date}) ---\n`;
            context += `Score: ${report.ai_score}/100\n`;
            context += `Analyse: ${report.ai_analysis?.substring(0, 500)}...\n`;
            context += `Forces: ${report.strengths?.join(', ') || 'N/A'}\n`;
            context += `Faiblesses: ${report.weaknesses?.join(', ') || 'N/A'}\n\n`;
        });
        // Calculate trends
        const scores = reports.map(r => r.ai_score || 0);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const trend = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;
        context += `\nTENDANCES:\n`;
        context += `- Score moyen: ${Math.round(avgScore)}/100\n`;
        context += `- Évolution: ${trend > 0 ? '+' : ''}${trend} points\n`;
        context += `- Tendance: ${trend > 5 ? 'Progression' : trend < -5 ? 'Régression' : 'Stable'}\n`;
        return context;
    }
    buildMetaSynthesisPrompt(context, focusAreas) {
        let prompt = `Analyse l'évolution de cette personne à travers ses rapports:\n\n${context}`;
        if (focusAreas && focusAreas.length > 0) {
            prompt += `\n\nDOMAINES DE FOCUS: ${focusAreas.join(', ')}`;
        }
        prompt += `\n\nIdentifie les patterns comportementaux, l'évolution de la performance,
et propose un plan d'action stratégique pour maximiser le potentiel de cette personne.`;
        return prompt;
    }
    parseAIResponse(content, _reportType) {
        const extractSection = (marker) => {
            const regex = new RegExp(`\\[${marker}\\]([\\s\\S]*?)(?=\\[|$)`, 'i');
            const match = content.match(regex);
            return match ? match[1].trim() : '';
        };
        const extractList = (marker) => {
            const section = extractSection(marker);
            return section
                .split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.replace(/^-\s*/, '').trim())
                .filter(Boolean);
        };
        return {
            analysis: extractSection('ANALYSE'),
            recommendations: extractList('RECOMMANDATIONS'),
            strengths: extractList('FORCES'),
            weaknesses: extractList('FAIBLESSES'),
            opportunities: extractList('OPPORTUNITÉS') || extractList('OPPORTUNITES'),
            threats: extractList('MENACES'),
        };
    }
    calculateAIScore(metrics, parsed) {
        let score = 0;
        // Completion rate (40 points max)
        score += Math.round(metrics.tasks.completion_rate * 0.4);
        // Tasks per day (20 points max)
        score += Math.min(metrics.productivity.tasks_per_day * 4, 20);
        // No overdue tasks bonus (15 points)
        if (metrics.tasks.overdue === 0) {
            score += 15;
        }
        else {
            score += Math.max(0, 15 - metrics.tasks.overdue * 2);
        }
        // Strengths vs weaknesses balance (15 points)
        const balance = (parsed.strengths.length - parsed.weaknesses.length) / 2;
        score += Math.min(Math.max(balance * 5 + 7.5, 0), 15);
        // Project progress (10 points)
        score += Math.round(metrics.projects.avg_progress * 0.1);
        return Math.min(Math.max(Math.round(score), 0), 100);
    }
    calculateEvolutionScore(reports) {
        if (reports.length < 2)
            return 50;
        const scores = reports.map(r => r.ai_score || 50);
        const trend = scores[scores.length - 1] - scores[0];
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        // Base score is average
        let evolutionScore = avgScore;
        // Bonus for positive trend
        if (trend > 0) {
            evolutionScore += Math.min(trend / 2, 15);
        }
        // Consistency bonus
        const variance = scores.reduce((acc, s) => acc + Math.pow(s - avgScore, 2), 0) / scores.length;
        if (variance < 100) {
            evolutionScore += 5;
        }
        return Math.min(Math.max(Math.round(evolutionScore), 0), 100);
    }
    generateTitle(reportType, periodType) {
        const periodLabel = {
            week: 'Semaine',
            month: 'Mois',
            year: 'Année',
        }[periodType];
        const typeLabel = {
            standard: 'Rapport de Productivité',
            audit: 'Audit Comportemental',
            meta_synthesis: 'Méta-Synthèse',
        }[reportType];
        const date = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        return `${typeLabel} - ${periodLabel} de ${date}`;
    }
    getPeriodDates(periodType) {
        const now = new Date();
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        switch (periodType) {
            case 'week':
                start.setDate(now.getDate() - now.getDay());
                break;
            case 'month':
                start.setDate(1);
                break;
            case 'year':
                start.setMonth(0, 1);
                break;
        }
        return { start, end };
    }
    formatChartData(data, labelKey, valueKey, colors) {
        const items = data;
        return {
            labels: items.map(d => String(d[labelKey])),
            datasets: [{
                    label: 'Données',
                    data: items.map(d => Number(d[valueKey])),
                    backgroundColor: colors,
                    borderColor: colors.map(c => c),
                    borderWidth: 2,
                }],
        };
    }
    formatLineChartData(data, labelKey, valueKey, label) {
        const items = data;
        return {
            labels: items.map(d => String(d[labelKey])),
            datasets: [{
                    label,
                    data: items.map(d => Number(d[valueKey])),
                    borderColor: '#e07840',
                    backgroundColor: 'rgba(224, 120, 64, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                }],
        };
    }
}
exports.AIReportsService = AIReportsService;
exports.aiReportsService = new AIReportsService();
//# sourceMappingURL=ai-reports.service.js.map