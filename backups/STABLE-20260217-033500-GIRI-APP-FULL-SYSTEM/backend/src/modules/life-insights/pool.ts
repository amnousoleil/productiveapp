// Pool PostgreSQL pour Life Insights
import pg from 'pg';
import { env } from '../../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client (life-insights pool)', err);
});

export default pool;
