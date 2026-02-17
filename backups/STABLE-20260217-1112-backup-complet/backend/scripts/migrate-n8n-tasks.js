const { Pool } = require('pg');

const n8nPool = new Pool({ user: 'postgres', password: 'postgres', host: 'localhost', database: 'productiveapp' });
const expressPool = new Pool({ user: 'postgres', password: 'postgres', host: 'localhost', database: 'productive_app' });

const WORKSPACE_ID = 'd737eaec-b55f-4c3c-9d54-4ac6d5113b0f';

// contact@mahagiri.fr = owner
const DEFAULT_USER = 'dd8db965-df93-4274-9ae9-8847a58730d3';
const USER_MAP = {
  'maha': DEFAULT_USER,
  'team': DEFAULT_USER,
  'brice': '7ea300fa-b086-4215-8641-bdb4dfb0c543',
};

const PROJECT_MAP = {
  'general': '9ba2a342-0ff1-4c9d-9109-6cf7b4621bf2',
  'academie': '788dc761-c846-47ae-8b1b-a2059ce9a402',
  'perso': 'c63dc525-f468-43b7-a1fb-938726fd0bb4',
  'entreprise': 'e4502de6-748a-41f5-92f8-c0f11c3172c7',
  'bible': '9a253d2b-fe91-4cd8-a39f-9603ac7db7b3',
  'digital': '4bc81062-8529-41e8-8a3c-fbdc4b2c64d4',
};

const STATUS_MAP = {
  'todo': 'todo',
  'in_progress': 'in_progress',
  'inprogress': 'in_progress',
  'done': 'done',
};

const PRIORITY_MAP = {
  1: 'urgent',
  2: 'medium',
  3: 'low',
  4: 'low',
};

async function migrate() {
  try {
    // 1. Supprimer les tâches d'onboarding du workspace
    const deleted = await expressPool.query(
      'DELETE FROM tasks WHERE workspace_id = $1', [WORKSPACE_ID]
    );
    console.log(`🗑️ ${deleted.rowCount} tâches onboarding supprimées`);

    // 2. Lire toutes les tâches N8N
    const { rows: n8nTasks } = await n8nPool.query('SELECT * FROM tasks ORDER BY position');
    console.log(`📦 ${n8nTasks.length} tâches N8N trouvées`);

    // 3. Créer le projet manquant proj_1769891141090_v51x4 si nécessaire
    const DEFAULT_USER_ID = DEFAULT_USER;
    const missingProjects = [...new Set(n8nTasks.map(t => t.project_id))].filter(p => !PROJECT_MAP[p]);
    for (const projId of missingProjects) {
      const { rows } = await expressPool.query(
        `INSERT INTO projects (name, workspace_id, user_id, status) VALUES ($1, $2, $3, 'active') RETURNING id`,
        [`Projet ${projId}`, WORKSPACE_ID, DEFAULT_USER_ID]
      );
      PROJECT_MAP[projId] = rows[0].id;
      console.log(`📁 Projet créé: ${projId} → ${rows[0].id}`);
    }

    // 4. Migrer chaque tâche
    let migrated = 0, errors = 0;
    for (const task of n8nTasks) {
      try {
        // Parser title et description (séparés par ---)
        const parts = (task.text || '').split('---');
        const title = parts[0].trim().substring(0, 500);
        const description = parts.length > 1 ? parts.slice(1).join('---').trim() : null;

        const userId = USER_MAP[task.user_id] || USER_MAP['maha'];
        const projectId = PROJECT_MAP[task.project_id] || PROJECT_MAP['general'];
        const status = STATUS_MAP[task.status] || 'todo';
        const priority = PRIORITY_MAP[task.priority] || 'medium';

        await expressPool.query(
          `INSERT INTO tasks (title, description, status, priority, user_id, assigned_to, project_id, workspace_id, position, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9, $10)`,
          [title, description, status, priority, userId, projectId, WORKSPACE_ID, task.position || migrated, task.created_at, task.updated_at]
        );
        migrated++;
      } catch(e) {
        errors++;
        console.error(`❌ Tâche ${task.id} (${task.text?.substring(0,30)}): ${e.message}`);
      }
    }

    console.log(`\n✅ Migration terminée: ${migrated} migrées, ${errors} erreurs`);

    // 5. Vérification
    const { rows: check } = await expressPool.query(
      'SELECT COUNT(*) as total, status FROM tasks WHERE workspace_id = $1 GROUP BY status ORDER BY total DESC',
      [WORKSPACE_ID]
    );
    console.log('\n📊 Résultat en base:');
    check.forEach(r => console.log(`  ${r.status}: ${r.total}`));

  } catch(e) {
    console.error('💥 Erreur fatale:', e);
  } finally {
    await n8nPool.end();
    await expressPool.end();
  }
}

migrate();
