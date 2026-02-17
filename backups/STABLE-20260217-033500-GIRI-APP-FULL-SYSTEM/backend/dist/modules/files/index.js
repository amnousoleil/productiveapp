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
exports.filesRoutes = exports.FilesController = exports.filesController = exports.FilesService = exports.filesService = void 0;
var files_service_js_1 = require("./files.service.js");
Object.defineProperty(exports, "filesService", { enumerable: true, get: function () { return files_service_js_1.filesService; } });
Object.defineProperty(exports, "FilesService", { enumerable: true, get: function () { return files_service_js_1.FilesService; } });
var files_controller_js_1 = require("./files.controller.js");
Object.defineProperty(exports, "filesController", { enumerable: true, get: function () { return files_controller_js_1.filesController; } });
Object.defineProperty(exports, "FilesController", { enumerable: true, get: function () { return files_controller_js_1.FilesController; } });
var files_routes_js_1 = require("./files.routes.js");
Object.defineProperty(exports, "filesRoutes", { enumerable: true, get: function () { return __importDefault(files_routes_js_1).default; } });
__exportStar(require("./files.types.js"), exports);
//# sourceMappingURL=index.js.map