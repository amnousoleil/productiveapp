import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { sql, closeDb } from '../config/database.js';

// Use process.cwd() as base for migrations directory
const MIGRATIONS_DIR = join(process.cwd(), 'dist', 'db', 'migrations');

interface MigrationRecord {
  id: number;
  name: string;
  applied_at: Date;
}

async function ensureMigrationsTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}

async function getAppliedMigrations(): Promise<string[]> {
  const migrations = await sql<MigrationRecord[]>`
    SELECT name FROM _migrations ORDER BY id
  `;
  return migrations.map((m) => m.name);
}

async function getMigrationFiles(): Promise<string[]> {
  const files = await readdir(MIGRATIONS_DIR);
  return files
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
}

async function applyMigration(filename: string): Promise<void> {
  const filepath = join(MIGRATIONS_DIR, filename);
  const content = await readFile(filepath, 'utf-8');

  // Split by -- DOWN marker to separate up and down migrations
  const [upMigration] = content.split('-- DOWN');

  console.log(`  Applying: ${filename}`);

  try {
    await sql.unsafe(upMigration);
    await sql`INSERT INTO _migrations (name) VALUES (${filename})`;
    console.log(`  ✅ Applied: ${filename}`);
  } catch (error) {
    console.error(`  ❌ Failed: ${filename}`);
    throw error;
  }
}

async function rollbackMigration(filename: string): Promise<void> {
  const filepath = join(MIGRATIONS_DIR, filename);
  const content = await readFile(filepath, 'utf-8');

  // Get the DOWN part of the migration
  const parts = content.split('-- DOWN');
  if (parts.length < 2) {
    console.log(`  ⚠️ No DOWN migration found for: ${filename}`);
    return;
  }

  const downMigration = parts[1];

  console.log(`  Rolling back: ${filename}`);

  try {
    await sql.unsafe(downMigration);
    await sql`DELETE FROM _migrations WHERE name = ${filename}`;
    console.log(`  ✅ Rolled back: ${filename}`);
  } catch (error) {
    console.error(`  ❌ Failed to rollback: ${filename}`);
    throw error;
  }
}

async function migrate(): Promise<void> {
  console.log('🚀 Running migrations...\n');

  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();
  const files = await getMigrationFiles();

  const pending = files.filter((f) => !applied.includes(f));

  if (pending.length === 0) {
    console.log('✅ No pending migrations\n');
    return;
  }

  console.log(`Found ${pending.length} pending migration(s):\n`);

  for (const file of pending) {
    await applyMigration(file);
  }

  console.log('\n✅ All migrations applied successfully!\n');
}

async function rollback(steps: number = 1): Promise<void> {
  console.log(`🔄 Rolling back ${steps} migration(s)...\n`);

  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();

  if (applied.length === 0) {
    console.log('✅ No migrations to rollback\n');
    return;
  }

  const toRollback = applied.slice(-steps).reverse();

  for (const filename of toRollback) {
    await rollbackMigration(filename);
  }

  console.log('\n✅ Rollback complete!\n');
}

async function status(): Promise<void> {
  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();
  const files = await getMigrationFiles();

  console.log('📋 Migration Status\n');
  console.log('Applied migrations:');
  for (const name of applied) {
    console.log(`  ✅ ${name}`);
  }

  const pending = files.filter((f) => !applied.includes(f));
  if (pending.length > 0) {
    console.log('\nPending migrations:');
    for (const name of pending) {
      console.log(`  ⏳ ${name}`);
    }
  }

  console.log('');
}

// CLI
const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case 'down':
      case 'rollback':
        const steps = parseInt(process.argv[3]) || 1;
        await rollback(steps);
        break;

      case 'status':
        await status();
        break;

      case 'up':
      default:
        await migrate();
        break;
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await closeDb();
  }
}

main();
