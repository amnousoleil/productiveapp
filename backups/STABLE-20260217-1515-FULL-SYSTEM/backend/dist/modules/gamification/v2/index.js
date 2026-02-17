"use strict";
/**
 * Gamification Engine v2 - Module amélioré
 *
 * Apporte les fonctionnalités avancées au module existant:
 * - Calcul XP avec multiplicateurs (streak, combo, night owl, etc.)
 * - Système de niveaux enrichi avec phases et titres
 * - Protection de streak (jokers, freezes, recovery)
 * - Analyse des habitudes et patterns
 * - Génération de feedback visuel/sonore
 * - Contexte IA-ready
 * - Système d'événements
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetEventEmitter = exports.getEventEmitter = exports.generateAIContext = exports.generateCongratulationMessage = exports.generateFeedback = exports.generateInsights = exports.predictBestTime = exports.generateWeeklyHeatmap = exports.aggregateByDay = exports.analyzeHabits = exports.checkMonthlyReset = exports.getRemainingProtections = exports.attemptRecovery = exports.activateFreeze = exports.checkStreak = exports.getTitleForLevel = exports.getPhaseForLevel = exports.checkLevelUp = exports.getLevelStatus = exports.getLevelInfo = exports.getTotalXPForLevel = exports.getXPForLevel = exports.getLevelFromXP = exports.getStreakMultiplier = exports.estimateXP = exports.calculateXP = void 0;
// Core
var xp_calculator_js_1 = require("./core/xp-calculator.js");
Object.defineProperty(exports, "calculateXP", { enumerable: true, get: function () { return xp_calculator_js_1.calculateXP; } });
Object.defineProperty(exports, "estimateXP", { enumerable: true, get: function () { return xp_calculator_js_1.estimateXP; } });
Object.defineProperty(exports, "getStreakMultiplier", { enumerable: true, get: function () { return xp_calculator_js_1.getStreakMultiplier; } });
var level_phases_js_1 = require("./core/level-phases.js");
Object.defineProperty(exports, "getLevelFromXP", { enumerable: true, get: function () { return level_phases_js_1.getLevelFromXP; } });
Object.defineProperty(exports, "getXPForLevel", { enumerable: true, get: function () { return level_phases_js_1.getXPForLevel; } });
Object.defineProperty(exports, "getTotalXPForLevel", { enumerable: true, get: function () { return level_phases_js_1.getTotalXPForLevel; } });
Object.defineProperty(exports, "getLevelInfo", { enumerable: true, get: function () { return level_phases_js_1.getLevelInfo; } });
Object.defineProperty(exports, "getLevelStatus", { enumerable: true, get: function () { return level_phases_js_1.getLevelStatus; } });
Object.defineProperty(exports, "checkLevelUp", { enumerable: true, get: function () { return level_phases_js_1.checkLevelUp; } });
Object.defineProperty(exports, "getPhaseForLevel", { enumerable: true, get: function () { return level_phases_js_1.getPhaseForLevel; } });
Object.defineProperty(exports, "getTitleForLevel", { enumerable: true, get: function () { return level_phases_js_1.getTitleForLevel; } });
// Streaks
var streak_protector_js_1 = require("./streaks/streak-protector.js");
Object.defineProperty(exports, "checkStreak", { enumerable: true, get: function () { return streak_protector_js_1.checkStreak; } });
Object.defineProperty(exports, "activateFreeze", { enumerable: true, get: function () { return streak_protector_js_1.activateFreeze; } });
Object.defineProperty(exports, "attemptRecovery", { enumerable: true, get: function () { return streak_protector_js_1.attemptRecovery; } });
Object.defineProperty(exports, "getRemainingProtections", { enumerable: true, get: function () { return streak_protector_js_1.getRemainingProtections; } });
Object.defineProperty(exports, "checkMonthlyReset", { enumerable: true, get: function () { return streak_protector_js_1.checkMonthlyReset; } });
var habit_analyzer_js_1 = require("./streaks/habit-analyzer.js");
Object.defineProperty(exports, "analyzeHabits", { enumerable: true, get: function () { return habit_analyzer_js_1.analyzeHabits; } });
Object.defineProperty(exports, "aggregateByDay", { enumerable: true, get: function () { return habit_analyzer_js_1.aggregateByDay; } });
Object.defineProperty(exports, "generateWeeklyHeatmap", { enumerable: true, get: function () { return habit_analyzer_js_1.generateWeeklyHeatmap; } });
Object.defineProperty(exports, "predictBestTime", { enumerable: true, get: function () { return habit_analyzer_js_1.predictBestTime; } });
Object.defineProperty(exports, "generateInsights", { enumerable: true, get: function () { return habit_analyzer_js_1.generateInsights; } });
// Feedback
var feedback_generator_js_1 = require("./feedback/feedback-generator.js");
Object.defineProperty(exports, "generateFeedback", { enumerable: true, get: function () { return feedback_generator_js_1.generateFeedback; } });
Object.defineProperty(exports, "generateCongratulationMessage", { enumerable: true, get: function () { return feedback_generator_js_1.generateCongratulationMessage; } });
// AI
var ai_context_js_1 = require("./ai/ai-context.js");
Object.defineProperty(exports, "generateAIContext", { enumerable: true, get: function () { return ai_context_js_1.generateAIContext; } });
// Events
var event_emitter_js_1 = require("./events/event-emitter.js");
Object.defineProperty(exports, "getEventEmitter", { enumerable: true, get: function () { return event_emitter_js_1.getEventEmitter; } });
Object.defineProperty(exports, "resetEventEmitter", { enumerable: true, get: function () { return event_emitter_js_1.resetEventEmitter; } });
//# sourceMappingURL=index.js.map