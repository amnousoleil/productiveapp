"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = exports.closeDb = exports.db = void 0;
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = __importDefault(require("postgres"));
const env_js_1 = require("./env.js");
const queryClient = (0, postgres_1.default)(env_js_1.env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
});
exports.sql = queryClient;
exports.db = (0, postgres_js_1.drizzle)(queryClient);
const closeDb = async () => {
    await queryClient.end();
};
exports.closeDb = closeDb;
//# sourceMappingURL=database.js.map