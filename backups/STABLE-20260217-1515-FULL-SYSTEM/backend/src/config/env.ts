import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default('7d'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  // Password
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(12),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().default(5),

  // Server
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // File Upload
  MAX_FILE_SIZE: z.coerce.number().default(10485760),
  UPLOAD_DIR: z.string().default('./uploads'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
