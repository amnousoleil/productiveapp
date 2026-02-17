"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
// Pool PostgreSQL pour Life Insights
const pg_1 = __importDefault(require("pg"));
const env_js_1 = require("../../config/env.js");
const { Pool } = pg_1.default;
exports.pool = new Pool({
    connectionString: env_js_1.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
exports.pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client (life-insights pool)', err);
});
exports.default = exports.pool;
//# sourceMappingURL=pool.js.map