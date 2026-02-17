/**
 * Pool PostgreSQL pour le module config
 */
import { Pool } from 'pg';
import { env } from '../../config/env.js';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
});

export default pool;
