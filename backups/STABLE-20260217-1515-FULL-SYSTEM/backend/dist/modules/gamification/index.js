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
exports.gamificationRoutes = exports.GamificationController = exports.gamificationController = exports.GamificationService = exports.gamificationService = void 0;
var gamification_service_js_1 = require("./gamification.service.js");
Object.defineProperty(exports, "gamificationService", { enumerable: true, get: function () { return gamification_service_js_1.gamificationService; } });
Object.defineProperty(exports, "GamificationService", { enumerable: true, get: function () { return gamification_service_js_1.GamificationService; } });
var gamification_controller_js_1 = require("./gamification.controller.js");
Object.defineProperty(exports, "gamificationController", { enumerable: true, get: function () { return gamification_controller_js_1.gamificationController; } });
Object.defineProperty(exports, "GamificationController", { enumerable: true, get: function () { return gamification_controller_js_1.GamificationController; } });
var gamification_routes_js_1 = require("./gamification.routes.js");
Object.defineProperty(exports, "gamificationRoutes", { enumerable: true, get: function () { return __importDefault(gamification_routes_js_1).default; } });
__exportStar(require("./gamification.types.js"), exports);
//# sourceMappingURL=index.js.map