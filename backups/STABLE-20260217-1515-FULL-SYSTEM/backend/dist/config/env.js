"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isProd = exports.isDev = exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.config)();
const envSchema = zod_1.z.object({
    // Database
    DATABASE_URL: zod_1.z.string().url(),
    // JWT
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_ACCESS_EXPIRES: zod_1.z.string().default('7d'),
    JWT_REFRESH_EXPIRES: zod_1.z.string().default('7d'),
    // Password
    BCRYPT_ROUNDS: zod_1.z.coerce.number().min(10).max(15).default(12),
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().default(900000),
    RATE_LIMIT_MAX: zod_1.z.coerce.number().default(100),
    RATE_LIMIT_LOGIN_MAX: zod_1.z.coerce.number().default(5),
    // Server
    PORT: zod_1.z.coerce.number().default(3000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    // CORS
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:5173'),
    // File Upload
    MAX_FILE_SIZE: zod_1.z.coerce.number().default(10485760),
    UPLOAD_DIR: zod_1.z.string().default('./uploads'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
exports.isDev = exports.env.NODE_ENV === 'development';
exports.isProd = exports.env.NODE_ENV === 'production';
exports.isTest = exports.env.NODE_ENV === 'test';
//# sourceMappingURL=env.js.map