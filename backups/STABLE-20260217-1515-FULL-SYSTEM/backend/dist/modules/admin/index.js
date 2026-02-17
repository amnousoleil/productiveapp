"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.AdminController = exports.AdminService = exports.adminRoutes = void 0;
var admin_routes_js_1 = require("./admin.routes.js");
Object.defineProperty(exports, "adminRoutes", { enumerable: true, get: function () { return __importDefault(admin_routes_js_1).default; } });
var admin_service_js_1 = require("./admin.service.js");
Object.defineProperty(exports, "AdminService", { enumerable: true, get: function () { return admin_service_js_1.AdminService; } });
var admin_controller_js_1 = require("./admin.controller.js");
Object.defineProperty(exports, "AdminController", { enumerable: true, get: function () { return admin_controller_js_1.AdminController; } });
var admin_middleware_js_1 = require("./admin.middleware.js");
Object.defineProperty(exports, "requireSuperAdmin", { enumerable: true, get: function () { return admin_middleware_js_1.requireSuperAdmin; } });
__exportStar(require("./types.js"), exports);
//# sourceMappingURL=index.js.map