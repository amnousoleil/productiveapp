"use strict";
/**
 * Pool PostgreSQL pour le module comptabilité
 * Compatible avec pg.Pool API
 */
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const env_js_1 = require("../../config/env.js");
// Créer un pool pg standard pour le module accounting
const pool = new pg_1.Pool({
    connectionString: env_js_1.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
});
exports.default = pool;
//# sourceMappingURL=pool.js.map