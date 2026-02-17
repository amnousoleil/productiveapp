/**
 * AI Context - Génère le contexte pour l'IA
 */

import type { HabitPattern, DailyStats } from '../streaks/habit-analyzer.js';
import type { LevelStatus } from '../core/level-phases.js';

export interface BehaviorPattern {
  type: 'time_preference' | 'task_preference' | 'productivity_cycle' | 'learning_style';
  description: string;
  confidence: number; // 0-1
  data: Record<string, unknown>;
}

export interface Prediction {
  type: 'churn_risk' | 'engagement_trend' | 'goal_completion' | 'optimal_time' | 'burnout_risk';
  score: number; // 0-1
  confidence: number;
  factors: { name: string; impact: number; description: string }[];
  recommendations: string[];
}

export interface AIContext {
  userId: string;
  generatedAt: string;

  currentStatus: {
    level: LevelStatus;
    currentStreak: number;
    bestStreak: number;
    recentXP: number;
    todayActive: boolean;
  };

  recentHistory: {
    last7DaysXP: number;
    last30DaysXP: number;
    activeDaysLast7: number;
    activeDaysLast30: number;
    recentAchievements: string[];
  };

  trends: {
    xpTrend: 'increasing' | 'stable' | 'decreasing';
    activityTrend: 'increasing' | 'stable' | 'decreasing';
    streakHealth: 'healthy' | 'at_risk' | 'recovering' | 'broken';
    engagementScore: number;
  };

  patterns: BehaviorPattern[];
  predictions: Prediction[];
  suggestedPrompts: string[];
}

export interface AIContextInput {
  userId: string;
  levelStatus: LevelStatus;
  currentStreak: number;
  bestStreak: number;
  habitPattern: HabitPattern;
  recentDailyStats: DailyStats[];
  recentAchievements: string[];
}

/**
 * Génère le contexte complet pour l'IA
 */
export function generateAIContext(input: AIContextInput): AIContext {
  const { userId, levelStatus, currentStreak, bestStreak, habitPattern, recentDailyStats, recentAchievements } = input;

  // Calculs des stats récentes
  const last7Days = recentDailyStats.slice(-7);
  const last30Days = recentDailyStats.slice(-30);
  const last7DaysXP = last7Days.reduce((sum, d) => sum + d.xpGained, 0);
  const last30DaysXP = last30Days.reduce((sum, d) => sum + d.xpGained, 0);
  const activeDaysLast7 = last7Days.filter(d => d.isActive).length;
  const activeDaysLast30 = last30Days.filter(d => d.isActive).length;

  // Trends
  const trends = calculateTrends(last7Days, last30Days, habitPattern);

  // Patterns
  const patterns = detectPatterns(habitPattern, recentDailyStats);

  // Predictions
  const predictions = generatePredictions(trends, habitPattern, currentStreak);

  // Prompts suggérés
  const suggestedPrompts = generateSuggestedPrompts(trends, habitPattern, levelStatus);

  const today = new Date().toISOString().slice(0, 10);
  const todayActive = recentDailyStats.some(d => d.date === today && d.isActive);

  return {
    userId,
    generatedAt: new Date().toISOString(),
    currentStatus: {
      level: levelStatus,
      currentStreak,
      bestStreak,
      recentXP: last7DaysXP,
      todayActive,
    },
    recentHistory: {
      last7DaysXP,
      last30DaysXP,
      activeDaysLast7,
      activeDaysLast30,
      recentAchievements: recentAchievements.slice(0, 5),
    },
    trends,
    patterns,
    predictions,
    suggestedPrompts,
  };
}

function calculateTrends(last7: DailyStats[], last30: DailyStats[], pattern: HabitPattern): AIContext['trends'] {
  // XP trend: compare 7 derniers jours vs 7 jours précédents
  const recent7XP = last7.reduce((sum, d) => sum + d.xpGained, 0);
  const previous7 = last30.slice(-14, -7);
  const previous7XP = previous7.reduce((sum, d) => sum + d.xpGained, 0);

  let xpTrend: AIContext['trends']['xpTrend'] = 'stable';
  if (recent7XP > previous7XP * 1.2) xpTrend = 'increasing';
  else if (recent7XP < previous7XP * 0.8) xpTrend = 'decreasing';

  // Activity trend
  const recent7Active = last7.filter(d => d.isActive).length;
  const previous7Active = previous7.filter(d => d.isActive).length;

  let activityTrend: AIContext['trends']['activityTrend'] = 'stable';
  if (recent7Active > previous7Active + 1) activityTrend = 'increasing';
  else if (recent7Active < previous7Active - 1) activityTrend = 'decreasing';

  // Engagement score (0-100)
  const engagementScore = Math.min(100, Math.round(
    pattern.consistencyScore * 0.4 +
    pattern.productivityScore * 0.4 +
    (recent7Active / 7 * 100) * 0.2
  ));

  return {
    xpTrend,
    activityTrend,
    streakHealth: pattern.streakHealth,
    engagementScore,
  };
}

function detectPatterns(pattern: HabitPattern, _dailyStats: DailyStats[]): BehaviorPattern[] {
  const patterns: BehaviorPattern[] = [];

  // Time preference
  if (pattern.peakHours.length > 0) {
    const isMorning = pattern.peakHours.some(h => h >= 5 && h < 12);
    const isEvening = pattern.peakHours.some(h => h >= 18 && h < 22);
    const isNight = pattern.peakHours.some(h => h >= 22 || h < 5);

    let timeDesc = 'Variable';
    if (isMorning && !isEvening && !isNight) timeDesc = 'Matinal';
    else if (!isMorning && isEvening && !isNight) timeDesc = 'Vespéral';
    else if (isNight) timeDesc = 'Nocturne';

    patterns.push({
      type: 'time_preference',
      description: `Préférence ${timeDesc.toLowerCase()} (pics à ${pattern.peakHours.join('h, ')}h)`,
      confidence: 0.8,
      data: { peakHours: pattern.peakHours, preference: timeDesc },
    });
  }

  // Productivity cycle
  if (pattern.bestDays.length >= 2) {
    patterns.push({
      type: 'productivity_cycle',
      description: `Plus productif le ${pattern.bestDays.join(', ')}`,
      confidence: 0.7,
      data: { bestDays: pattern.bestDays },
    });
  }

  return patterns;
}

function generatePredictions(trends: AIContext['trends'], pattern: HabitPattern, _streak: number): Prediction[] {
  const predictions: Prediction[] = [];

  // Churn risk
  const churnScore = calculateChurnRisk(trends, pattern);
  if (churnScore > 0.3) {
    predictions.push({
      type: 'churn_risk',
      score: churnScore,
      confidence: 0.7,
      factors: [
        { name: 'Activité en baisse', impact: trends.activityTrend === 'decreasing' ? 0.4 : 0, description: 'Moins de jours actifs récemment' },
        { name: 'Streak en danger', impact: trends.streakHealth === 'at_risk' ? 0.3 : 0, description: 'Le streak risque d\'être perdu' },
      ].filter(f => f.impact > 0),
      recommendations: ['Connectez-vous quotidiennement', 'Fixez-vous un objectif simple'],
    });
  }

  // Optimal time
  if (pattern.peakHours.length > 0) {
    predictions.push({
      type: 'optimal_time',
      score: pattern.peakHours[0]! / 24,
      confidence: 0.8,
      factors: [{ name: 'Historique d\'activité', impact: 0.8, description: 'Basé sur vos habitudes' }],
      recommendations: [`Planifiez vos tâches importantes vers ${pattern.peakHours[0]}h`],
    });
  }

  return predictions;
}

function generateSuggestedPrompts(trends: AIContext['trends'], pattern: HabitPattern, level: LevelStatus): string[] {
  const prompts: string[] = [];

  if (trends.streakHealth === 'at_risk') {
    prompts.push('Comment puis-je maintenir mon streak?');
  }

  if (level.progressPercent > 80) {
    prompts.push(`Je suis proche du niveau ${level.current + 1}, que me conseilles-tu?`);
  }

  if (pattern.productivityScore < 50) {
    prompts.push('Comment améliorer ma productivité quotidienne?');
  }

  prompts.push('Quels sont mes meilleurs moments pour travailler?');
  prompts.push('Quels achievements suis-je proche de débloquer?');

  return prompts.slice(0, 5);
}

function calculateChurnRisk(trends: AIContext['trends'], pattern: HabitPattern): number {
  let risk = 0;
  if (trends.activityTrend === 'decreasing') risk += 0.3;
  if (trends.xpTrend === 'decreasing') risk += 0.2;
  if (trends.streakHealth === 'at_risk') risk += 0.25;
  if (trends.streakHealth === 'broken') risk += 0.4;
  if (pattern.consistencyScore < 30) risk += 0.2;
  return Math.min(1, risk);
}
