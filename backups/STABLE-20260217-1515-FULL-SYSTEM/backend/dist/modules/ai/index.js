"use strict";
/**
 * AI Module
 * ProductiveApp v4.0
 */
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
exports.aiRoutes = exports.aiController = exports.aiService = void 0;
var ai_service_js_1 = require("./ai.service.js");
Object.defineProperty(exports, "aiService", { enumerable: true, get: function () { return ai_service_js_1.aiService; } });
var ai_controller_js_1 = require("./ai.controller.js");
Object.defineProperty(exports, "aiController", { enumerable: true, get: function () { return ai_controller_js_1.aiController; } });
var ai_routes_js_1 = require("./ai.routes.js");
Object.defineProperty(exports, "aiRoutes", { enumerable: true, get: function () { return __importDefault(ai_routes_js_1).default; } });
__exportStar(require("./ai.types.js"), exports);
const ai_routes_js_2 = __importDefault(require("./ai.routes.js"));
exports.default = ai_routes_js_2.default;
//# sourceMappingURL=index.js.map