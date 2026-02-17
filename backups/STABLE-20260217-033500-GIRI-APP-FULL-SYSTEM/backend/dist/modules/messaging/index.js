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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.presenceService = exports.emailRoutes = exports.presenceRoutes = exports.messagingRoutes = exports.MessagingController = exports.messagingController = exports.MessagingService = exports.messagingService = void 0;
var messaging_service_js_1 = require("./messaging.service.js");
Object.defineProperty(exports, "messagingService", { enumerable: true, get: function () { return messaging_service_js_1.messagingService; } });
Object.defineProperty(exports, "MessagingService", { enumerable: true, get: function () { return messaging_service_js_1.MessagingService; } });
var messaging_controller_js_1 = require("./messaging.controller.js");
Object.defineProperty(exports, "messagingController", { enumerable: true, get: function () { return messaging_controller_js_1.messagingController; } });
Object.defineProperty(exports, "MessagingController", { enumerable: true, get: function () { return messaging_controller_js_1.MessagingController; } });
var messaging_routes_js_1 = require("./messaging.routes.js");
Object.defineProperty(exports, "messagingRoutes", { enumerable: true, get: function () { return __importDefault(messaging_routes_js_1).default; } });
var presence_routes_js_1 = require("./presence.routes.js");
Object.defineProperty(exports, "presenceRoutes", { enumerable: true, get: function () { return __importDefault(presence_routes_js_1).default; } });
var email_routes_js_1 = require("./email.routes.js");
Object.defineProperty(exports, "emailRoutes", { enumerable: true, get: function () { return __importDefault(email_routes_js_1).default; } });
__exportStar(require("./messaging.types.js"), exports);
exports.presenceService = __importStar(require("./presence.service.js"));
exports.emailService = __importStar(require("./email.service.js"));
//# sourceMappingURL=index.js.map