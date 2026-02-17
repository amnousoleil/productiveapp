/**
 * Pool PostgreSQL pour le module comptabilité
 * Compatible avec pg.Pool API
 */

import { Pool } from 'pg';
import { env } from '../../config/env.js';

// Créer un pool pg standard pour le module accounting
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
});

export default pool;
