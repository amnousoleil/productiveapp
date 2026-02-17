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
exports.tasksRoutes = exports.TasksController = exports.tasksController = exports.TasksService = exports.tasksService = void 0;
var tasks_service_js_1 = require("./tasks.service.js");
Object.defineProperty(exports, "tasksService", { enumerable: true, get: function () { return tasks_service_js_1.tasksService; } });
Object.defineProperty(exports, "TasksService", { enumerable: true, get: function () { return tasks_service_js_1.TasksService; } });
var tasks_controller_js_1 = require("./tasks.controller.js");
Object.defineProperty(exports, "tasksController", { enumerable: true, get: function () { return tasks_controller_js_1.tasksController; } });
Object.defineProperty(exports, "TasksController", { enumerable: true, get: function () { return tasks_controller_js_1.TasksController; } });
var tasks_routes_js_1 = require("./tasks.routes.js");
Object.defineProperty(exports, "tasksRoutes", { enumerable: true, get: function () { return __importDefault(tasks_routes_js_1).default; } });
__exportStar(require("./tasks.types.js"), exports);
//# sourceMappingURL=index.js.map