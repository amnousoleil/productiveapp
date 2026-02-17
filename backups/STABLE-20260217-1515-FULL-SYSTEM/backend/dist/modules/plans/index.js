"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plansRoutes = exports.plansController = exports.plansService = void 0;
var plans_service_js_1 = require("./plans.service.js");
Object.defineProperty(exports, "plansService", { enumerable: true, get: function () { return plans_service_js_1.plansService; } });
var plans_controller_js_1 = require("./plans.controller.js");
Object.defineProperty(exports, "plansController", { enumerable: true, get: function () { return plans_controller_js_1.plansController; } });
var plans_routes_js_1 = require("./plans.routes.js");
Object.defineProperty(exports, "plansRoutes", { enumerable: true, get: function () { return __importDefault(plans_routes_js_1).default; } });
//# sourceMappingURL=index.js.map