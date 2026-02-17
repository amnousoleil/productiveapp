"use strict";
// =============================================
// MAIL MODULE EXPORTS
// =============================================
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
exports.MailInboundController = exports.MailInboundService = exports.MailController = exports.MailService = exports.mailInboundRoutes = exports.mailRoutes = void 0;
var mail_routes_js_1 = require("./mail.routes.js");
Object.defineProperty(exports, "mailRoutes", { enumerable: true, get: function () { return __importDefault(mail_routes_js_1).default; } });
var mail_inbound_routes_js_1 = require("./mail-inbound.routes.js");
Object.defineProperty(exports, "mailInboundRoutes", { enumerable: true, get: function () { return __importDefault(mail_inbound_routes_js_1).default; } });
var mail_service_js_1 = require("./mail.service.js");
Object.defineProperty(exports, "MailService", { enumerable: true, get: function () { return mail_service_js_1.MailService; } });
var mail_controller_js_1 = require("./mail.controller.js");
Object.defineProperty(exports, "MailController", { enumerable: true, get: function () { return mail_controller_js_1.MailController; } });
var mail_inbound_service_js_1 = require("./mail-inbound.service.js");
Object.defineProperty(exports, "MailInboundService", { enumerable: true, get: function () { return mail_inbound_service_js_1.MailInboundService; } });
var mail_inbound_controller_js_1 = require("./mail-inbound.controller.js");
Object.defineProperty(exports, "MailInboundController", { enumerable: true, get: function () { return mail_inbound_controller_js_1.MailInboundController; } });
__exportStar(require("./mail.types.js"), exports);
__exportStar(require("./mail-inbound.types.js"), exports);
//# sourceMappingURL=index.js.map