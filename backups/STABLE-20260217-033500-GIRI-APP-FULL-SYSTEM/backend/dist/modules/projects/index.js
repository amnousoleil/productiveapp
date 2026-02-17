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
exports.projectsRoutes = exports.ProjectsController = exports.projectsController = exports.ProjectsService = exports.projectsService = void 0;
var projects_service_js_1 = require("./projects.service.js");
Object.defineProperty(exports, "projectsService", { enumerable: true, get: function () { return projects_service_js_1.projectsService; } });
Object.defineProperty(exports, "ProjectsService", { enumerable: true, get: function () { return projects_service_js_1.ProjectsService; } });
var projects_controller_js_1 = require("./projects.controller.js");
Object.defineProperty(exports, "projectsController", { enumerable: true, get: function () { return projects_controller_js_1.projectsController; } });
Object.defineProperty(exports, "ProjectsController", { enumerable: true, get: function () { return projects_controller_js_1.ProjectsController; } });
var projects_routes_js_1 = require("./projects.routes.js");
Object.defineProperty(exports, "projectsRoutes", { enumerable: true, get: function () { return __importDefault(projects_routes_js_1).default; } });
__exportStar(require("./projects.types.js"), exports);
//# sourceMappingURL=index.js.map