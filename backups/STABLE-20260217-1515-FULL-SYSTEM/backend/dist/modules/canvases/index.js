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
exports.canvasesRoutes = exports.CanvasesController = exports.canvasesController = exports.CanvasesService = exports.canvasesService = void 0;
var canvases_service_js_1 = require("./canvases.service.js");
Object.defineProperty(exports, "canvasesService", { enumerable: true, get: function () { return canvases_service_js_1.canvasesService; } });
Object.defineProperty(exports, "CanvasesService", { enumerable: true, get: function () { return canvases_service_js_1.CanvasesService; } });
var canvases_controller_js_1 = require("./canvases.controller.js");
Object.defineProperty(exports, "canvasesController", { enumerable: true, get: function () { return canvases_controller_js_1.canvasesController; } });
Object.defineProperty(exports, "CanvasesController", { enumerable: true, get: function () { return canvases_controller_js_1.CanvasesController; } });
var canvases_routes_js_1 = require("./canvases.routes.js");
Object.defineProperty(exports, "canvasesRoutes", { enumerable: true, get: function () { return __importDefault(canvases_routes_js_1).default; } });
__exportStar(require("./canvases.types.js"), exports);
//# sourceMappingURL=index.js.map