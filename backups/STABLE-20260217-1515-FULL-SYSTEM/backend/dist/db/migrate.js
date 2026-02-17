"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const path_1 = require("path");
const database_js_1 = require("../config/database.js");
// Use process.cwd() as base for migrations directory
const MIGRATIONS_DIR = (0, path_1.join)(process.cwd(), 'dist', 'db', 'migrations');
async function ensureMigrationsTable() {
    await (0, database_js_1.sql) `
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}
async function getAppliedMigrations() {
    const migrations = await (0, database_js_1.sql) `
    SELECT name FROM _migrations ORDER BY id
  `;
    return migrations.map((m) => m.name);
}
async function getMigrationFiles() {
    const files = await (0, promises_1.readdir)(MIGRATIONS_DIR);
    return files
        .filter((f) => f.endsWith('.sql'))
        .sort((a, b) => a.localeCompare(b));
}
async function applyMigration(filename) {
    const filepath = (0, path_1.join)(MIGRATIONS_DIR, filename);
    const content = await (0, promises_1.readFile)(filepath, 'utf-8');
    // Split by -- DOWN marker to separate up and down migrations
    const [upMigration] = content.split('-- DOWN');
    console.log(`  Applying: ${filename}`);
    try {
        await database_js_1.sql.unsafe(upMigration);
        await (0, database_js_1.sql) `INSERT INTO _migrations (name) VALUES (${filename})`;
        console.log(`  ✅ Applied: ${filename}`);
    }
    catch (error) {
        console.error(`  ❌ Failed: ${filename}`);
        throw error;
    }
}
async function rollbackMigration(filename) {
    const filepath = (0, path_1.join)(MIGRATIONS_DIR, filename);
    const content = await (0, promises_1.readFile)(filepath, 'utf-8');
    // Get the DOWN part of the migration
    const parts = content.split('-- DOWN');
    if (parts.length < 2) {
        console.log(`  ⚠️ No DOWN migration found for: ${filename}`);
        return;
    }
    const downMigration = parts[1];
    console.log(`  Rolling back: ${filename}`);
    try {
        await database_js_1.sql.unsafe(downMigration);
        await (0, database_js_1.sql) `DELETE FROM _migrations WHERE name = ${filename}`;
        console.log(`  ✅ Rolled back: ${filename}`);
    }
    catch (error) {
        console.error(`  ❌ Failed to rollback: ${filename}`);
        throw error;
    }
}
async function migrate() {
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
async function rollback(steps = 1) {
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
async function status() {
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
    }
    catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
    finally {
        await (0, database_js_1.closeDb)();
    }
}
main();
//# sourceMappingURL=migrate.js.map