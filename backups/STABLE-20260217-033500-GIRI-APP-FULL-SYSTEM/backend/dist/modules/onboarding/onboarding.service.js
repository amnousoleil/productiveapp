"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingService = exports.OnboardingService = void 0;
const database_js_1 = require("../../config/database.js");
const helpers_js_1 = require("../../utils/helpers.js");
class OnboardingService {
    /**
     * Configure un workspace complet pour un nouvel utilisateur avec des données d'onboarding
     * @param userId - L'ID de l'utilisateur
     * @param userName - Le nom complet de l'utilisateur
     * @param email - L'email de l'utilisateur (non utilisé pour l'instant, prévu pour personnalisation future)
     */
    async setupNewUserWorkspace(userId, _userName /* unused */, _email) {
        const now = new Date();
        // 1. Récupérer le workspace créé pour l'utilisateur
        const workspaces = await (0, database_js_1.sql) `
      SELECT id FROM workspaces WHERE owner_id = ${userId} ORDER BY created_at DESC LIMIT 1
    `;
        if (workspaces.length === 0) {
            console.error(`[Onboarding] No workspace found for user ${userId}`);
            return;
        }
        const workspaceId = workspaces[0].id;
        // 2. Créer le projet d'onboarding
        const projectId = (0, helpers_js_1.generateUUID)();
        await (0, database_js_1.sql) `
      INSERT INTO projects (id, workspace_id, user_id, name, description, icon, color, status, position, created_at, updated_at)
      VALUES (
        ${projectId},
        ${workspaceId},
        ${userId},
        ${'Mon premier projet'},
        ${'Projet de démonstration pour découvrir ProductiveApp'},
        ${'📋'},
        ${'#6366f1'},
        'active',
        0,
        ${now},
        ${now}
      )
    `;
        // 3. Créer les 3 tâches d'onboarding
        const tasks = [
            { title: '✅ Découvrir le dashboard', status: 'done', position: 0 },
            { title: '🚀 Créer ma première tâche', status: 'in_progress', position: 1 },
            { title: '📊 Explorer les rapports', status: 'todo', position: 2 },
        ];
        for (const task of tasks) {
            const taskId = (0, helpers_js_1.generateUUID)();
            await (0, database_js_1.sql) `
        INSERT INTO tasks (id, workspace_id, project_id, user_id, title, status, priority, position, created_at, updated_at)
        VALUES (
          ${taskId},
          ${workspaceId},
          ${projectId},
          ${userId},
          ${task.title},
          ${task.status},
          'medium',
          ${task.position},
          ${now},
          ${now}
        )
      `;
        }
        // 4. Créer la note de bienvenue
        const noteId = (0, helpers_js_1.generateUUID)();
        const welcomeContent = `Bienvenue sur ProductiveApp ! 🎉

Vous venez de créer votre compte et nous sommes ravis de vous accueillir.

## Par où commencer ?

1. **Explorez le dashboard** - Visualisez vos tâches et votre progression
2. **Créez votre première tâche** - Cliquez sur "+" pour ajouter une tâche
3. **Organisez avec des projets** - Regroupez vos tâches par projet
4. **Suivez vos rapports** - Analysez votre productivité

## Besoin d'aide ?

N'hésitez pas à explorer les différentes fonctionnalités. Chaque action vous rapproche de vos objectifs !

Bonne productivité ! 🚀`;
        await (0, database_js_1.sql) `
      INSERT INTO notes (id, workspace_id, user_id, project_id, title, content, is_pinned, position, created_at, updated_at)
      VALUES (
        ${noteId},
        ${workspaceId},
        ${userId},
        ${projectId},
        ${'Bienvenue sur ProductiveApp'},
        ${welcomeContent},
        true,
        0,
        ${now},
        ${now}
      )
    `;
        // 5. Initialiser la gamification avec un bonus de bienvenue
        await (0, database_js_1.sql) `
      INSERT INTO user_gamification (user_id, workspace_id, total_xp, level, prestige, coins, current_streak, best_streak, last_activity_at, updated_at)
      VALUES (
        ${userId},
        ${workspaceId},
        100,
        1,
        0,
        50,
        1,
        1,
        ${now},
        ${now}
      )
    `;
        // 6. Enregistrer l'événement XP de bienvenue
        const xpEventId = (0, helpers_js_1.generateUUID)();
        await (0, database_js_1.sql) `
      INSERT INTO xp_events (id, user_id, workspace_id, amount, reason, metadata, created_at)
      VALUES (
        ${xpEventId},
        ${userId},
        ${workspaceId},
        100,
        'login_bonus',
        ${JSON.stringify({ type: 'welcome_bonus' })},
        ${now}
      )
    `;
        console.log(`[Onboarding] Setup completed for user ${userId} in workspace ${workspaceId}`);
    }
}
exports.OnboardingService = OnboardingService;
exports.onboardingService = new OnboardingService();
//# sourceMappingURL=onboarding.service.js.map