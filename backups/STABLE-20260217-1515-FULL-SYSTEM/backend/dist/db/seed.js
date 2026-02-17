"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_js_1 = require("../config/database.js");
const password_js_1 = require("../utils/password.js");
const helpers_js_1 = require("../utils/helpers.js");
async function seed() {
    console.log('🌱 Seeding database...\n');
    const now = new Date();
    // Create demo user
    const userId = (0, helpers_js_1.generateUUID)();
    const passwordHash = await (0, password_js_1.hashPassword)('Demo@123');
    console.log('Creating demo user...');
    await (0, database_js_1.sql) `
    INSERT INTO users (id, email, password_hash, name, status, plan, language, created_at, updated_at, email_verified)
    VALUES (${userId}, 'demo@productive.app', ${passwordHash}, 'Demo User', 'online', 'pro', 'en', ${now}, ${now}, true)
    ON CONFLICT (email) DO NOTHING
  `;
    // Get actual user ID (in case user already existed)
    const userResult = await (0, database_js_1.sql) `SELECT id FROM users WHERE email = 'demo@productive.app'`;
    const actualUserId = userResult[0].id;
    // Create demo workspace
    const workspaceId = (0, helpers_js_1.generateUUID)();
    console.log('Creating demo workspace...');
    await (0, database_js_1.sql) `
    INSERT INTO workspaces (id, owner_id, name, slug, settings, created_at, updated_at)
    VALUES (${workspaceId}, ${actualUserId}, 'Demo Workspace', 'demo-workspace', '{}', ${now}, ${now})
    ON CONFLICT (slug) DO NOTHING
  `;
    // Get actual workspace ID
    const workspaceResult = await (0, database_js_1.sql) `SELECT id FROM workspaces WHERE slug = 'demo-workspace'`;
    const actualWorkspaceId = workspaceResult[0].id;
    // Add user as workspace member
    await (0, database_js_1.sql) `
    INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
    VALUES (${actualWorkspaceId}, ${actualUserId}, 'owner', ${now})
    ON CONFLICT DO NOTHING
  `;
    // Initialize gamification for user
    console.log('Initializing gamification...');
    await (0, database_js_1.sql) `
    INSERT INTO user_gamification (user_id, workspace_id, total_xp, level, prestige, coins, current_streak, best_streak, updated_at)
    VALUES (${actualUserId}, ${actualWorkspaceId}, 0, 1, 0, 100, 0, 0, ${now})
    ON CONFLICT DO NOTHING
  `;
    // Create sample achievements
    console.log('Creating achievements...');
    const achievements = [
        {
            id: (0, helpers_js_1.generateUUID)(),
            name: 'First Note',
            description: 'Create your first note',
            icon: '📝',
            category: 'productivity',
            xp_reward: 50,
            coin_reward: 10,
            condition: { type: 'notes_created', threshold: 1 },
            rarity: 'common',
        },
        {
            id: (0, helpers_js_1.generateUUID)(),
            name: 'Note Master',
            description: 'Create 100 notes',
            icon: '📚',
            category: 'productivity',
            xp_reward: 500,
            coin_reward: 100,
            condition: { type: 'notes_created', threshold: 100 },
            rarity: 'rare',
        },
        {
            id: (0, helpers_js_1.generateUUID)(),
            name: 'Task Crusher',
            description: 'Complete 50 tasks',
            icon: '✅',
            category: 'productivity',
            xp_reward: 300,
            coin_reward: 50,
            condition: { type: 'tasks_completed', threshold: 50 },
            rarity: 'rare',
        },
        {
            id: (0, helpers_js_1.generateUUID)(),
            name: 'Week Warrior',
            description: 'Maintain a 7-day streak',
            icon: '🔥',
            category: 'streak',
            xp_reward: 200,
            coin_reward: 25,
            condition: { type: 'streak_days', threshold: 7 },
            rarity: 'common',
        },
        {
            id: (0, helpers_js_1.generateUUID)(),
            name: 'Month Master',
            description: 'Maintain a 30-day streak',
            icon: '🏆',
            category: 'streak',
            xp_reward: 1000,
            coin_reward: 200,
            condition: { type: 'streak_days', threshold: 30 },
            rarity: 'epic',
        },
        {
            id: (0, helpers_js_1.generateUUID)(),
            name: 'Level 10',
            description: 'Reach level 10',
            icon: '⭐',
            category: 'special',
            xp_reward: 500,
            coin_reward: 100,
            condition: { type: 'level_reached', threshold: 10 },
            rarity: 'rare',
        },
        {
            id: (0, helpers_js_1.generateUUID)(),
            name: 'Social Butterfly',
            description: 'Send 100 messages',
            icon: '💬',
            category: 'social',
            xp_reward: 250,
            coin_reward: 50,
            condition: { type: 'messages_sent', threshold: 100 },
            rarity: 'common',
        },
    ];
    for (const achievement of achievements) {
        await (0, database_js_1.sql) `
      INSERT INTO achievements (id, name, description, icon, category, xp_reward, coin_reward, condition, is_secret, rarity, created_at)
      VALUES (
        ${achievement.id}, ${achievement.name}, ${achievement.description}, ${achievement.icon},
        ${achievement.category}, ${achievement.xp_reward}, ${achievement.coin_reward},
        ${JSON.stringify(achievement.condition)}, false, ${achievement.rarity}, ${now}
      )
      ON CONFLICT DO NOTHING
    `;
    }
    // Create sample project
    const projectId = (0, helpers_js_1.generateUUID)();
    console.log('Creating sample project...');
    await (0, database_js_1.sql) `
    INSERT INTO projects (id, workspace_id, user_id, name, description, color, status, is_shared, position, created_at, updated_at)
    VALUES (${projectId}, ${actualWorkspaceId}, ${actualUserId}, 'Getting Started', 'Learn how to use Productive', '#3B82F6', 'active', false, 0, ${now}, ${now})
    ON CONFLICT DO NOTHING
  `;
    // Get actual project ID
    const projectResult = await (0, database_js_1.sql) `SELECT id FROM projects WHERE workspace_id = ${actualWorkspaceId} AND name = 'Getting Started'`;
    const actualProjectId = projectResult[0]?.id || projectId;
    // Add user as project member
    await (0, database_js_1.sql) `
    INSERT INTO project_members (project_id, user_id, role, added_at)
    VALUES (${actualProjectId}, ${actualUserId}, 'owner', ${now})
    ON CONFLICT DO NOTHING
  `;
    // Create sample notes
    console.log('Creating sample notes...');
    const noteId = (0, helpers_js_1.generateUUID)();
    await (0, database_js_1.sql) `
    INSERT INTO notes (id, workspace_id, user_id, project_id, title, content, tags, is_pinned, position, word_count, created_at, updated_at)
    VALUES (
      ${noteId}, ${actualWorkspaceId}, ${actualUserId}, ${actualProjectId},
      'Welcome to Productive!',
      'This is your first note. You can use **markdown** to format your content.\n\n## Features\n- Create notes and organize them in projects\n- Track tasks with due dates and priorities\n- Collaborate with your team\n- Gamification with XP and achievements\n\nEnjoy!',
      '["welcome", "getting-started"]'::jsonb,
      true, 0, 50, ${now}, ${now}
    )
    ON CONFLICT DO NOTHING
  `;
    // Create sample tasks
    console.log('Creating sample tasks...');
    const tasks = [
        { title: 'Explore the dashboard', description: 'Take a tour of all the features available', priority: 'medium', status: 'todo' },
        { title: 'Create your first project', description: 'Organize your work into projects', priority: 'high', status: 'todo' },
        { title: 'Write a note', description: 'Try the rich text editor', priority: 'low', status: 'done' },
        { title: 'Invite a team member', description: 'Collaborate with others', priority: 'medium', status: 'todo' },
    ];
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const taskId = (0, helpers_js_1.generateUUID)();
        await (0, database_js_1.sql) `
      INSERT INTO tasks (id, workspace_id, user_id, project_id, title, description, status, priority, position, tags, checklist, created_at, updated_at, completed_at)
      VALUES (
        ${taskId}, ${actualWorkspaceId}, ${actualUserId}, ${actualProjectId},
        ${task.title}, ${task.description}, ${task.status}, ${task.priority},
        ${i}, '[]'::jsonb, '[]'::jsonb, ${now}, ${now},
        ${task.status === 'done' ? now : null}
      )
      ON CONFLICT DO NOTHING
    `;
    }
    // Create notification settings
    console.log('Creating notification settings...');
    await (0, database_js_1.sql) `
    INSERT INTO notification_settings (user_id, workspace_id, email_notifications, push_notifications, mention_notifications, assignment_notifications, achievement_notifications, digest_frequency)
    VALUES (${actualUserId}, ${actualWorkspaceId}, true, true, true, true, true, 'realtime')
    ON CONFLICT DO NOTHING
  `;
    console.log('\n✅ Database seeded successfully!\n');
    console.log('Demo credentials:');
    console.log('  Email: demo@productive.app');
    console.log('  Password: Demo@123\n');
}
async function main() {
    try {
        await seed();
    }
    catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
    finally {
        await (0, database_js_1.closeDb)();
    }
}
main();
//# sourceMappingURL=seed.js.map