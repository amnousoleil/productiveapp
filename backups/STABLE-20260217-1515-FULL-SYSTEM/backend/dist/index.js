"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const hpp_1 = __importDefault(require("hpp"));
const env_js_1 = require("./config/env.js");
const database_js_1 = require("./config/database.js");
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const rateLimit_middleware_js_1 = require("./middleware/rateLimit.middleware.js");
const security_middleware_js_1 = require("./middleware/security.middleware.js");
const request_tracker_middleware_js_1 = require("./middleware/request-tracker.middleware.js");
// Import routes
const auth_routes_js_1 = __importDefault(require("./modules/auth/auth.routes.js"));
const users_routes_js_1 = __importDefault(require("./modules/users/users.routes.js"));
const workspaces_routes_js_1 = __importDefault(require("./modules/workspaces/workspaces.routes.js"));
const projects_routes_js_1 = __importDefault(require("./modules/projects/projects.routes.js"));
const notes_routes_js_1 = __importDefault(require("./modules/notes/notes.routes.js"));
const notes_graph_routes_js_1 = __importDefault(require("./modules/notes/notes-graph.routes.js"));
const tasks_routes_js_1 = __importDefault(require("./modules/tasks/tasks.routes.js"));
const index_js_1 = require("./modules/journal/index.js");
const messaging_routes_js_1 = __importDefault(require("./modules/messaging/messaging.routes.js"));
// import presenceRoutes from './modules/messaging/presence.routes.js';
// import emailRoutes from './modules/messaging/email.routes.js';
const gamification_routes_js_1 = __importDefault(require("./modules/gamification/gamification.routes.js"));
const audit_routes_js_1 = __importDefault(require("./modules/audit/audit.routes.js"));
const canvases_routes_js_1 = __importDefault(require("./modules/canvases/canvases.routes.js"));
const files_routes_js_1 = __importDefault(require("./modules/files/files.routes.js"));
const index_js_2 = require("./modules/notifications/index.js");
const analytics_routes_js_1 = __importDefault(require("./modules/analytics/analytics.routes.js"));
const reports_routes_js_1 = __importDefault(require("./modules/reports/reports.routes.js"));
const ai_reports_routes_js_1 = __importDefault(require("./modules/reports/ai-reports.routes.js"));
const index_js_3 = require("./modules/accounting/index.js");
const ai_routes_js_1 = __importDefault(require("./modules/ai/ai.routes.js"));
const index_js_4 = require("./modules/plans/index.js");
const signals_routes_js_1 = __importDefault(require("./modules/signals/signals.routes.js"));
const uploads_routes_js_1 = __importDefault(require("./modules/uploads/uploads.routes.js"));
const index_js_5 = require("./modules/campaigns/index.js");
const index_js_6 = require("./modules/giri-vision/index.js");
const index_js_7 = require("./modules/admin/index.js");
const index_js_8 = require("./modules/billing/index.js");
const index_js_9 = require("./modules/mail/index.js");
const config_routes_js_1 = __importDefault(require("./modules/config/config.routes.js"));
const index_js_10 = require("./modules/life-insights/index.js");
const games_routes_js_1 = __importDefault(require("./modules/games/games.routes.js"));
// Freelancer Power Pack v5.0
const time_tracking_routes_js_1 = __importDefault(require("./modules/time-tracking/time-tracking.routes.js"));
const time_tracking_service_js_1 = require("./modules/time-tracking/time-tracking.service.js");
const crm_routes_js_1 = __importDefault(require("./modules/crm/crm.routes.js"));
const crm_service_js_1 = require("./modules/crm/crm.service.js");
const calendar_routes_js_1 = __importDefault(require("./modules/calendar/calendar.routes.js"));
const calendar_service_js_1 = require("./modules/calendar/calendar.service.js");
const calendar_agent_routes_js_1 = __importDefault(require("./modules/calendar/calendar-agent.routes.js"));
const calendar_agent_service_js_1 = require("./modules/calendar/calendar-agent.service.js");
const contracts_routes_js_1 = __importDefault(require("./modules/contracts/contracts.routes.js"));
const contracts_service_js_1 = require("./modules/contracts/contracts.service.js");
const goals_routes_js_1 = __importDefault(require("./modules/goals/goals.routes.js"));
const goals_service_js_1 = require("./modules/goals/goals.service.js");
const relances_routes_js_1 = __importDefault(require("./modules/relances/relances.routes.js"));
const relances_service_js_1 = require("./modules/relances/relances.service.js");
const portal_routes_js_1 = require("./modules/client-portal/portal.routes.js");
const portal_service_js_1 = require("./modules/client-portal/portal.service.js");
const urssaf_routes_js_1 = __importDefault(require("./modules/urssaf/urssaf.routes.js"));
const monitoring_routes_js_1 = __importDefault(require("./modules/monitoring/monitoring.routes.js"));
const urssaf_service_js_1 = require("./modules/urssaf/urssaf.service.js");
const pool_js_1 = __importDefault(require("./modules/accounting/pool.js"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);
// Disable powered-by header
app.disable('x-powered-by');
// =============================================
// SECURITY MIDDLEWARE STACK
// =============================================
// 1. Request guard - block suspicious patterns
app.use(security_middleware_js_1.requestGuard);
// 2. Helmet - comprehensive security headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://meet.jit.si'],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://meet.jit.si', 'https://n8n.srv1053121.hstgr.cloud', 'wss:', 'ws:'],
            fontSrc: ["'self'", 'https:', 'data:'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", 'https://meet.jit.si'],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
}));
// 3. Additional security headers
app.use(security_middleware_js_1.additionalSecurityHeaders);
// 4. CORS - strict origin whitelist
const allowedOrigins = env_js_1.env.CORS_ORIGIN?.split(',').map(o => o.trim()).filter(Boolean) || [];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('CORS policy violation'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-Id', 'X-Request-Id'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
    maxAge: 600, // 10 minutes preflight cache
}));
// 5. HTTP Parameter Pollution protection
app.use((0, hpp_1.default)());
// 6. Logging (production: combined format, dev: dev format)
if (env_js_1.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)(env_js_1.isProd ? 'combined' : 'dev'));
}
// 6.5 Request tracker for API metrics
app.use(request_tracker_middleware_js_1.requestTrackerMiddleware);
// 7. Body parsing with strict limits
app.use(express_1.default.json({
    limit: '1mb', // Reduced from 10mb
    strict: true,
}));
app.use(express_1.default.urlencoded({
    extended: false, // Simpler parsing, prevents prototype pollution
    limit: '1mb',
    parameterLimit: 50,
}));
// 8. Input sanitization
app.use(security_middleware_js_1.inputSanitizer);
// 9. Global rate limiter
const globalRateLimiter = (0, rateLimit_middleware_js_1.createRateLimiter)({
    windowMs: 15 * 60 * 1000,
    max: 500,
});
app.use(globalRateLimiter);
// =============================================
// ROUTES
// =============================================
// API routes
const apiRouter = express_1.default.Router();
// Monitoring routes (includes /health endpoint) - DISABLED: TS compile errors
apiRouter.use('/auth', auth_routes_js_1.default);
apiRouter.use('/users', users_routes_js_1.default);
apiRouter.use('/workspaces', workspaces_routes_js_1.default);
apiRouter.use('/projects', projects_routes_js_1.default);
apiRouter.use('/notes', notes_routes_js_1.default);
apiRouter.use('/notes', notes_graph_routes_js_1.default); // Graph system routes
apiRouter.use('/tasks', tasks_routes_js_1.default);
apiRouter.use('/journal', (0, index_js_1.createJournalRouter)(pool_js_1.default));
apiRouter.use('/messaging', messaging_routes_js_1.default);
// apiRouter.use('/messaging', emailRoutes); // Email export routes (/:conversationId/email/*)
// apiRouter.use('/presence', presenceRoutes); // Presence & typing indicators
apiRouter.use('/gamification', gamification_routes_js_1.default);
apiRouter.use('/audit', audit_routes_js_1.default);
apiRouter.use('/canvases', canvases_routes_js_1.default);
apiRouter.use('/files', files_routes_js_1.default);
apiRouter.use('/notifications', index_js_2.notificationsRoutes);
apiRouter.use('/analytics', analytics_routes_js_1.default);
apiRouter.use('/reports', reports_routes_js_1.default);
apiRouter.use('/reports/ai', ai_reports_routes_js_1.default);
apiRouter.use('/accounting/workspace/:workspaceId', index_js_3.accountingRoutes);
apiRouter.use('/ai', ai_routes_js_1.default);
apiRouter.use('/monitoring', monitoring_routes_js_1.default);
apiRouter.use('/plans', index_js_4.plansRoutes);
apiRouter.use('/signals', signals_routes_js_1.default);
apiRouter.use('/uploads', uploads_routes_js_1.default);
apiRouter.use('/campaigns', index_js_5.campaignsRoutes);
apiRouter.use('/giri-vision', index_js_6.giriVisionRoutes);
apiRouter.use('/admin', index_js_7.adminRoutes);
apiRouter.use('/mail', index_js_9.mailInboundRoutes); // Inbound FIRST (webhook public + inbox auth)
apiRouter.use('/mail', index_js_9.mailRoutes); // Outbound routes (all protected)
apiRouter.use('/config', config_routes_js_1.default);
apiRouter.use('/billing', index_js_8.billingRoutes);
apiRouter.use('/life-insights', index_js_10.lifeInsightsRoutes);
apiRouter.use('/games', games_routes_js_1.default);
// Freelancer Power Pack v5.0 - Init services + mount routes
(0, time_tracking_service_js_1.initTimeTrackingService)(pool_js_1.default);
(0, crm_service_js_1.initCRMService)(pool_js_1.default);
(0, calendar_service_js_1.initCalendarService)(pool_js_1.default);
(0, calendar_agent_service_js_1.initCalendarAgentService)(pool_js_1.default);
(0, index_js_2.initNotificationService)(pool_js_1.default);
(0, contracts_service_js_1.initContractsService)(pool_js_1.default);
(0, goals_service_js_1.initGoalsService)(pool_js_1.default);
(0, relances_service_js_1.initRelancesService)(pool_js_1.default);
(0, portal_service_js_1.initPortalService)(pool_js_1.default);
(0, urssaf_service_js_1.initURSSAFService)(pool_js_1.default);
apiRouter.use('/time-tracking/workspace/:workspaceId', time_tracking_routes_js_1.default);
apiRouter.use('/crm/workspace/:workspaceId', crm_routes_js_1.default);
apiRouter.use('/calendar/workspace/:workspaceId', calendar_routes_js_1.default);
apiRouter.use('/calendar/workspace/:workspaceId/agent', calendar_agent_routes_js_1.default);
apiRouter.use('/contracts/workspace/:workspaceId', contracts_routes_js_1.default);
apiRouter.use('/goals/workspace/:workspaceId', goals_routes_js_1.default);
apiRouter.use('/relances/workspace/:workspaceId', relances_routes_js_1.default);
apiRouter.use('/portal/workspace/:workspaceId', portal_routes_js_1.adminRouter);
apiRouter.use('/portal/client', portal_routes_js_1.publicRouter);
apiRouter.use('/urssaf/workspace/:workspaceId', urssaf_routes_js_1.default);
console.log('[Freelancer Power Pack v5.0] 8 modules initialized');
// Health check endpoint (for Nginx monitoring)
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/v1', apiRouter);
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// =============================================
// ERROR HANDLING
// =============================================
app.use(error_middleware_js_1.notFoundHandler);
app.use(error_middleware_js_1.errorHandler);
// =============================================
// SERVER START
// =============================================
const PORT = env_js_1.env.PORT || 3000;
const HOST = '0.0.0.0'; // Bind to all interfaces - required for PM2 cluster mode load balancing
const server = app.listen(PORT, HOST, () => {
    console.log(`
  Productive Core API Server
  ============================
  Environment: ${env_js_1.env.NODE_ENV}
  Listening: ${HOST}:${PORT}
  ============================
  `);
});
// Set server timeouts
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.timeout = 30000;
// Initialize WebSocket server
import('./websocket/websocket.server.js').then(({ initWebSocket }) => {
    initWebSocket(server);
}).catch(err => console.error('WebSocket init error:', err));
server.maxHeadersCount = 50;
// =============================================
// NOTIFICATION CRON JOB
// =============================================
// Process pending notifications every minute
const notificationCronInterval = setInterval(async () => {
    try {
        await (0, index_js_2.processPendingNotifications)();
    }
    catch (error) {
        console.error('[Notification Cron] Error processing pending notifications:', error);
    }
}, 60000); // 60 seconds
console.log('[Notification Cron] Scheduled to run every 60 seconds');
// Graceful shutdown
const shutdown = async () => {
    console.log('\nShutting down gracefully...');
    // Clear notification cron
    clearInterval(notificationCronInterval);
    console.log('[Notification Cron] Stopped');
    server.close(async () => {
        try {
            await (0, database_js_1.closeDb)();
        }
        catch (error) {
            console.error('Error closing database:', error);
        }
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
// Prevent unhandled rejections from crashing the server
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    shutdown();
});
exports.default = app;
//# sourceMappingURL=index.js.map