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
exports.notificationsRoutes = exports.processPendingNotifications = exports.initNotificationService = void 0;
var notifications_service_js_1 = require("./notifications.service.js");
Object.defineProperty(exports, "initNotificationService", { enumerable: true, get: function () { return notifications_service_js_1.initNotificationService; } });
Object.defineProperty(exports, "processPendingNotifications", { enumerable: true, get: function () { return notifications_service_js_1.processPendingNotifications; } });
var notifications_routes_js_1 = require("./notifications.routes.js");
Object.defineProperty(exports, "notificationsRoutes", { enumerable: true, get: function () { return __importDefault(notifications_routes_js_1).default; } });
__exportStar(require("./notifications.types.js"), exports);
//# sourceMappingURL=index.js.map