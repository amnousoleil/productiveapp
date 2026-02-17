// =============================================
// PRODUCTIVEAPP - LIFE INSIGHTS AI SERVICE
// Analyse comportementale et profil psychologique par IA
// ============================================

import { LifeInsightsService } from './life-insights.service.js';
import {
  ActivityLogEntry,
  BehavioralInsight,
  UserPattern,
  DailySnapshot,
  PsychologicalProfile,
  AnalyzeUserRequest,
  AnalyzeUserResponse,
  HourlyDistribution,
  DailyTrend,
} from './life-insights.types';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class LifeInsightsAIService {
  private static OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
  private static OPENAI_MODEL = 'gpt-4-turbo-preview';

  // ==================== AI Analysis ====================

  /**
   * Analyse complète de l'utilisateur
   */
  static async analyzeUser(request: AnalyzeUserRequest): Promise<AnalyzeUserResponse> {
    const { user_id, member_id, analysis_type, days_to_analyze = 30, regenerate = false } = request;

    // Collecter les données
    const activities = await LifeInsightsService.getActivities({
      user_id,
      member_id,
      start_date: new Date(Date.now() - days_to_analyze * 24 * 60 * 60 * 1000),
      limit: 5000,
    });

    const hourlyDist = await LifeInsightsService.getHourlyDistribution(user_id, days_to_analyze);
    const dailyTrends = await LifeInsightsService.getDailyTrends(user_id, days_to_analyze);
    const stats = await LifeInsightsService.getActivityStats({ user_id, member_id, period: 'month' });
    // Vérifier si on a assez de données
    if (activities.length < 20) {
      throw new Error('Pas assez de données pour générer une analyse (minimum 20 activités)');
    }

    let profile: PsychologicalProfile | null = null;
    let insights: BehavioralInsight[] = [];
    let patterns: UserPattern[] = [];
    let snapshots: DailySnapshot[] = [];

    // Générer selon le type d'analyse
    if (analysis_type === 'full' || analysis_type === 'psychological') {
      profile = await this.generatePsychologicalProfile(user_id, member_id, activities, hourlyDist, dailyTrends, regenerate);
    }

    if (analysis_type === 'full' || analysis_type === 'behavioral') {
      insights = await this.generateBehavioralInsights(user_id, member_id, activities, hourlyDist, dailyTrends);
    }

    if (analysis_type === 'full' || analysis_type === 'patterns') {
      patterns = await this.detectPatterns(user_id, member_id, activities, hourlyDist, dailyTrends);
    }

    if (analysis_type === 'full' || analysis_type === 'quick') {
      const snapshot = await this.generateDailySnapshot(user_id, member_id, activities);
      snapshots = [snapshot];
    }

    // Générer recommandations
    const recommendations = await this.generateRecommendations(profile, insights, patterns);

    return {
      user_id,
      analysis_type,
      profile,
      insights,
      patterns,
      daily_snapshots: snapshots,
      recommendations,
      confidence_score: this.calculateConfidenceScore(activities.length, days_to_analyze),
      data_points_analyzed: activities.length,
      generated_at: new Date(),
    };
  }

  // ==================== Psychological Profile ====================

  /**
   * Génère un profil psychologique complet via GPT-4
   */
  private static async generatePsychologicalProfile(
    userId: string,
    memberId: string | null | undefined,
    activities: ActivityLogEntry[],
    hourlyDist: HourlyDistribution[],
    dailyTrends: DailyTrend[],
    regenerate: boolean = false
  ): Promise<PsychologicalProfile> {
    // Vérifier si existe déjà
    if (!regenerate) {
      const existing = await LifeInsightsService.getProfile(userId, memberId);
      if (existing && existing.data_points_analyzed && existing.data_points_analyzed > activities.length * 0.8) {
        return existing; // Profil récent et pertinent
      }
    }

    // Préparer le contexte pour l'IA
    const context = this.buildActivityContext(activities, hourlyDist, dailyTrends);

    const prompt = `Tu es un psychologue expert en analyse comportementale. Analyse les données d'activité suivantes et génère un profil psychologique complet.

DONNÉES D'ACTIVITÉ:
${context}

CONSIGNES:
1. **Big Five Personality Traits** - Score de 0 à 100 pour chaque trait:
   - Openness (ouverture)
   - Conscientiousness (conscience professionnelle)
   - Extraversion
   - Agreeableness (amabilité)
   - Neuroticism (stabilité émotionnelle inverse)

2. **Styles de travail** - Choisis 1 parmi:
   - deep_focus : Travaille en blocs longs et concentrés
   - multitasker : Jongle entre plusieurs tâches
   - sprinter : Périodes courtes et intenses
   - marathoner : Rythme constant et soutenu
   - balanced : Équilibré entre tous
   - adaptive : S'adapte selon le contexte

3. **Patterns cognitifs**:
   - peak_performance_hours: Liste des heures (0-23) de pic de performance
   - preferred_task_types: Types de tâches préférées (creative, analytical, administrative, social)
   - energy_pattern: morning_person, night_owl, ou variable

4. **Motivation & Stress**:
   - primary_motivators: 3-5 motivateurs principaux (achievement, autonomy, mastery, recognition, growth, etc.)
   - stress_triggers: 3-5 déclencheurs de stress
   - coping_strategies: 3-5 stratégies d'adaptation observées

5. **Profil narratif**:
   - profile_summary: Résumé en 3-5 phrases du profil psychologique
   - strengths: 5 forces principales
   - growth_areas: 3 axes de développement
   - recommendations: 5 recommandations personnalisées

Réponds UNIQUEMENT en JSON valide, format:
{
  "openness_score": <0-100>,
  "conscientiousness_score": <0-100>,
  "extraversion_score": <0-100>,
  "agreeableness_score": <0-100>,
  "neuroticism_score": <0-100>,
  "work_style": "<style>",
  "communication_style": "<style>",
  "decision_style": "<style>",
  "peak_performance_hours": [<heures>],
  "preferred_task_types": ["<types>"],
  "energy_pattern": "<pattern>",
  "primary_motivators": ["<motivateurs>"],
  "stress_triggers": ["<triggers>"],
  "coping_strategies": ["<stratégies>"],
  "profile_summary": "<résumé>",
  "strengths": ["<forces>"],
  "growth_areas": ["<axes>"],
  "recommendations": ["<recommandations>"]
}`;

    const response = await this.callOpenAI(prompt);
    const profileData = JSON.parse(response);

    const profile: PsychologicalProfile = {
      user_id: userId,
      member_id: memberId || null,
      ...profileData,
      confidence_score: this.calculateConfidenceScore(activities.length, 30),
      data_points_analyzed: activities.length,
    };

    return await LifeInsightsService.upsertProfile(profile);
  }

  // ==================== Behavioral Insights ====================

  /**
   * Génère des insights comportementaux
   */
  private static async generateBehavioralInsights(
    userId: string,
    memberId: string | null | undefined,
    activities: ActivityLogEntry[],
    hourlyDist: HourlyDistribution[],
    dailyTrends: DailyTrend[]
  ): Promise<BehavioralInsight[]> {
    const context = this.buildActivityContext(activities, hourlyDist, dailyTrends);

    const prompt = `Analyse ces données d'activité et génère 5-8 insights comportementaux pertinents.

DONNÉES:
${context}

CATÉGORIES D'INSIGHTS:
- productivity: Patterns de productivité
- emotional: États émotionnels
- social: Interactions sociales
- health: Bien-être et santé
- cognitive: Fonctionnement cognitif
- motivation: Facteurs de motivation
- stress: Indicateurs de stress

Chaque insight doit avoir:
- title: Titre accrocheur (max 80 caractères)
- description: Explication détaillée (2-3 phrases)
- recommendation: Conseil actionnable (1-2 phrases)
- category: Catégorie (parmi celles ci-dessus)
- priority: 0=low, 1=medium, 2=high, 3=critical
- confidence: 0.0-1.0 (confiance dans l'insight)
- evidence_count: Nombre d'événements analysés

Réponds en JSON array:
[{
  "title": "<titre>",
  "description": "<description>",
  "recommendation": "<conseil>",
  "category": "<catégorie>",
  "priority": <0-3>,
  "confidence": <0.0-1.0>,
  "evidence_count": <nombre>
}]`;

    const response = await this.callOpenAI(prompt);
    const insightsData = JSON.parse(response);

    const insights: BehavioralInsight[] = [];

    for (const data of insightsData) {
      const insight = await LifeInsightsService.createInsight({
        user_id: userId,
        member_id: memberId || null,
        insight_type: `ai_generated_${data.category}`,
        insight_category: data.category,
        title: data.title,
        description: data.description,
        recommendation: data.recommendation,
        confidence_score: data.confidence,
        evidence_count: data.evidence_count,
        priority: data.priority,
      });
      insights.push(insight);
    }

    return insights;
  }

  // ==================== Pattern Detection ====================

  /**
   * Détecte les patterns comportementaux
   */
  private static async detectPatterns(
    userId: string,
    memberId: string | null | undefined,
    activities: ActivityLogEntry[],
    hourlyDist: HourlyDistribution[],
    dailyTrends: DailyTrend[]
  ): Promise<UserPattern[]> {
    const patterns: UserPattern[] = [];

    // 1. Peak hours pattern
    const peakHours = hourlyDist.sort((a, b) => b.action_count - a.action_count).slice(0, 3);
    if (peakHours.length > 0) {
      const pattern = await LifeInsightsService.upsertPattern({
        user_id: userId,
        member_id: memberId || null,
        pattern_type: 'peak_hours',
        pattern_name: `Heures de pic : ${peakHours.map((h) => `${h.hour}h`).join(', ')}`,
        pattern_data: { hours: peakHours.map((h) => h.hour) },
        strength: Math.min(peakHours[0].action_count / activities.length, 1.0),
        frequency: 'daily',
        is_positive: true,
      });
      patterns.push(pattern);
    }

    // 2. Task completion rhythm
    const completionRate =
      activities.filter((a) => a.action_type === 'task_completed').length /
      Math.max(activities.filter((a) => a.action_type === 'task_created').length, 1);

    if (completionRate > 0.01) {
      const pattern = await LifeInsightsService.upsertPattern({
        user_id: userId,
        member_id: memberId || null,
        pattern_type: 'task_completion_rhythm',
        pattern_name: `Taux de complétion : ${(completionRate * 100).toFixed(0)}%`,
        pattern_data: { completion_rate: completionRate },
        strength: completionRate,
        frequency: 'daily',
        is_positive: completionRate > 0.7,
      });
      patterns.push(pattern);
    }

    // 3. Energy cycle (based on hourly distribution)
    const morningEnergy = hourlyDist
      .filter((h) => h.hour >= 6 && h.hour < 12)
      .reduce((sum, h) => sum + h.action_count, 0);
    const afternoonEnergy = hourlyDist
      .filter((h) => h.hour >= 12 && h.hour < 18)
      .reduce((sum, h) => sum + h.action_count, 0);
    const eveningEnergy = hourlyDist
      .filter((h) => h.hour >= 18 && h.hour < 24)
      .reduce((sum, h) => sum + h.action_count, 0);

    const totalEnergy = morningEnergy + afternoonEnergy + eveningEnergy;
    if (totalEnergy > 0) {
      let energyType = 'variable';
      if (morningEnergy / totalEnergy > 0.5) energyType = 'morning_person';
      else if (eveningEnergy / totalEnergy > 0.4) energyType = 'night_owl';

      const pattern = await LifeInsightsService.upsertPattern({
        user_id: userId,
        member_id: memberId || null,
        pattern_type: 'energy_cycle',
        pattern_name: `Profil énergétique : ${energyType}`,
        pattern_data: {
          morning: (morningEnergy / totalEnergy).toFixed(2),
          afternoon: (afternoonEnergy / totalEnergy).toFixed(2),
          evening: (eveningEnergy / totalEnergy).toFixed(2),
          type: energyType,
        },
        strength: Math.max(morningEnergy, afternoonEnergy, eveningEnergy) / totalEnergy,
        frequency: 'daily',
        is_positive: null,
      });
      patterns.push(pattern);
    }

    // 4. Pomodoro usage pattern
    const pomodoroCount = activities.filter((a) => a.action_type === 'pomodoro_completed').length;
    if (pomodoroCount > 5) {
      const pattern = await LifeInsightsService.upsertPattern({
        user_id: userId,
        member_id: memberId || null,
        pattern_type: 'focus_duration',
        pattern_name: `Utilisateur Pomodoro actif : ${pomodoroCount} sessions`,
        pattern_data: { pomodoro_count: pomodoroCount, avg_per_day: pomodoroCount / dailyTrends.length },
        strength: Math.min(pomodoroCount / 30, 1.0),
        frequency: 'weekly',
        is_positive: true,
      });
      patterns.push(pattern);
    }

    return patterns;
  }

  // ==================== Daily Snapshot ====================

  /**
   * Génère le snapshot quotidien avec analyse IA
   */
  private static async generateDailySnapshot(
    userId: string,
    memberId: string | null | undefined,
    activities: ActivityLogEntry[]
  ): Promise<DailySnapshot> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivities = activities.filter((a) => {
      const activityDate = new Date(a.created_at || '');
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === today.getTime();
    });

    // Calculer les métriques
    const total_actions = todayActivities.length;
    const tasks_completed = todayActivities.filter((a) => a.action_type === 'task_completed').length;
    const notes_created = todayActivities.filter((a) => a.action_type === 'note_created').length;
    const pomodoros_completed = todayActivities.filter((a) => a.action_type === 'pomodoro_completed').length;

    // Top action types
    const actionTypeCounts: Record<string, number> = {};
    todayActivities.forEach((a) => {
      actionTypeCounts[a.action_type] = (actionTypeCounts[a.action_type] || 0) + 1;
    });
    const top_action_types = Object.entries(actionTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((e) => e[0]);

    // Générer résumé IA si assez d'activité
    let ai_summary = '';
    let highlights: string[] = [];
    let lowlights: string[] = [];
    let productivity_score = 0;

    if (total_actions >= 5) {
      const context = `Actions du jour (${total_actions} total):
- Tâches complétées: ${tasks_completed}
- Notes créées: ${notes_created}
- Pomodoros: ${pomodoros_completed}
- Types d'actions: ${top_action_types.join(', ')}`;

      const prompt = `Analyse cette journée et génère un résumé de 1-2 phrases + 2-3 highlights + 1-2 lowlights + score productivité (0-100).

${context}

Réponds en JSON:
{
  "summary": "<résumé>",
  "highlights": ["<point fort 1>", "<point fort 2>"],
  "lowlights": ["<point faible 1>"],
  "productivity_score": <0-100>
}`;

      try {
        const response = await this.callOpenAI(prompt);
        const data: any = JSON.parse(response);
        ai_summary = data.summary;
        highlights = data.highlights;
        lowlights = data.lowlights;
        productivity_score = data.productivity_score;
      } catch (error) {
        console.error('Erreur génération snapshot IA:', error);
        ai_summary = `Journée avec ${total_actions} actions enregistrées.`;
        productivity_score = Math.min((tasks_completed * 20 + pomodoros_completed * 15) / 2, 100);
      }
    } else {
      ai_summary = 'Journée calme avec peu d\'activité enregistrée.';
      productivity_score = 10;
    }

    const snapshot: DailySnapshot = {
      user_id: userId,
      member_id: memberId || null,
      snapshot_date: today,
      total_actions,
      tasks_completed,
      notes_created,
      pomodoros_completed,
      total_active_time_minutes: pomodoros_completed * 25, // Approximation
      productivity_score,
      top_action_types,
      top_categories: [],
      ai_summary,
      highlights,
      lowlights,
    };

    return await LifeInsightsService.updateDailySnapshot(snapshot);
  }

  // ==================== Recommendations ====================

  /**
   * Génère des recommandations personnalisées
   */
  private static async generateRecommendations(
    profile: PsychologicalProfile | null,
    insights: BehavioralInsight[],
    patterns: UserPattern[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Basé sur le profil
    if (profile) {
      if (profile.energy_pattern === 'morning_person' && profile.peak_performance_hours) {
        recommendations.push(`Planifiez vos tâches complexes entre ${profile.peak_performance_hours[0]}h et ${profile.peak_performance_hours[2] || profile.peak_performance_hours[0] + 2}h`);
      }

      if (profile.work_style === 'multitasker') {
        recommendations.push('Essayez le time-blocking pour réduire le changement de contexte et améliorer votre focus');
      }

      if (profile.stress_triggers && profile.stress_triggers.includes('deadlines')) {
        recommendations.push('Activez les rappels 2 jours avant les deadlines pour réduire le stress de dernière minute');
      }
    }

    // Basé sur les insights critiques
    const criticalInsights = insights.filter((i) => i.priority && i.priority >= 2);
    criticalInsights.forEach((insight) => {
      if (insight.recommendation) {
        recommendations.push(insight.recommendation);
      }
    });

    // Basé sur les patterns négatifs
    const negativePatterns = patterns.filter((p) => p.is_positive === false);
    if (negativePatterns.length > 0) {
      recommendations.push('Identifiez vos patterns négatifs et créez des contre-mesures (ex: rappels, routines)');
    }

    return recommendations.slice(0, 10); // Max 10 recommandations
  }

  // ==================== Utilities ====================

  /**
   * Construit le contexte d'activité pour l'IA
   */
  private static buildActivityContext(
    activities: ActivityLogEntry[],
    hourlyDist: HourlyDistribution[],
    dailyTrends: DailyTrend[]
  ): string {
    const actionTypeCounts: Record<string, number> = {};
    activities.forEach((a) => {
      actionTypeCounts[a.action_type] = (actionTypeCounts[a.action_type] || 0) + 1;
    });

    const topActions = Object.entries(actionTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((e) => `${e[0]}: ${e[1]}`)
      .join(', ');

    const topHours = hourlyDist
      .sort((a, b) => b.action_count - a.action_count)
      .slice(0, 5)
      .map((h) => `${h.hour}h (${h.action_count} actions)`)
      .join(', ');

    const avgDailyActions = dailyTrends.length > 0 ? Math.round(dailyTrends.reduce((sum, t) => sum + t.action_count, 0) / dailyTrends.length) : 0;

    return `
Total d'activités: ${activities.length}
Période analysée: ${dailyTrends.length} jours
Actions par jour (moyenne): ${avgDailyActions}

Top 10 types d'actions:
${topActions}

Heures les plus actives:
${topHours}

Tendances récentes (derniers 7 jours):
${dailyTrends
  .slice(0, 7)
  .map((t) => `${t.date}: ${t.action_count} actions, ${t.tasks_completed} tâches complétées`)
  .join('\n')}
`.trim();
  }

  /**
   * Calcule le score de confiance basé sur la quantité de données
   */
  private static calculateConfidenceScore(dataPoints: number, daysAnalyzed: number): number {
    // Formule: plus de données = plus de confiance
    // 100 data points sur 30 jours = score moyen
    const baseScore = Math.min(dataPoints / 100, 1.0);
    const daysBonus = Math.min(daysAnalyzed / 30, 1.0);
    return Math.min((baseScore + daysBonus) / 2, 1.0);
  }

  /**
   * Appelle l'API OpenAI
   */
  private static async callOpenAI(prompt: string): Promise<string> {
    if (!this.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content:
          'Tu es un psychologue expert en analyse comportementale. Tu réponds toujours en JSON valide et structuré. Tes analyses sont précises, empathiques et actionnables.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: this.OPENAI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }
}
