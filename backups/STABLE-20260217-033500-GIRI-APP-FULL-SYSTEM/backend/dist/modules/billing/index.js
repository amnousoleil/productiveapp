"use strict";
/**
 * Billing Module - Export principal
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingService = exports.attachPlanInfo = exports.requireLimit = exports.requireFeature = exports.getMinimumPlanForFeature = exports.checkLimit = exports.hasFeature = exports.PLANS = exports.billingRoutes = void 0;
var billing_routes_js_1 = require("./billing.routes.js");
Object.defineProperty(exports, "billingRoutes", { enumerable: true, get: function () { return billing_routes_js_1.billingRoutes; } });
var billing_plans_js_1 = require("./billing.plans.js");
Object.defineProperty(exports, "PLANS", { enumerable: true, get: function () { return billing_plans_js_1.PLANS; } });
Object.defineProperty(exports, "hasFeature", { enumerable: true, get: function () { return billing_plans_js_1.hasFeature; } });
Object.defineProperty(exports, "checkLimit", { enumerable: true, get: function () { return billing_plans_js_1.checkLimit; } });
Object.defineProperty(exports, "getMinimumPlanForFeature", { enumerable: true, get: function () { return billing_plans_js_1.getMinimumPlanForFeature; } });
var billing_middleware_js_1 = require("./billing.middleware.js");
Object.defineProperty(exports, "requireFeature", { enumerable: true, get: function () { return billing_middleware_js_1.requireFeature; } });
Object.defineProperty(exports, "requireLimit", { enumerable: true, get: function () { return billing_middleware_js_1.requireLimit; } });
Object.defineProperty(exports, "attachPlanInfo", { enumerable: true, get: function () { return billing_middleware_js_1.attachPlanInfo; } });
exports.billingService = __importStar(require("./billing.service.js"));
//# sourceMappingURL=index.js.map