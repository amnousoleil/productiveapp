// Script pour exécuter la migration 022 (error_logs table)
const { Pool } = require('pg');
const fs = require('fs');

// Utiliser les mêmes credentials que l'app (depuis .env ou variables d'environnement)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://productive_user@localhost:5432/productive_app'
});

async function runMigration() {
  try {
    console.log('🔧 Exécution migration 022 : error_logs table...');

    const sql = fs.readFileSync('/root/productive-core-backend/src/db/migrations/022_monitoring.sql', 'utf8');

    await pool.query(sql);

    console.log('✅ Migration 022 exécutée avec succès !');

    // Vérifier que la table existe
    const result = await pool.query("SELECT tablename FROM pg_tables WHERE tablename = 'error_logs'");
    console.log('✅ Table error_logs:', result.rows.length > 0 ? 'CRÉÉE' : 'NON TROUVÉE');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

runMigration();
