import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import { env, isProd } from './config/env.js';
import { closeDb } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { createRateLimiter } from './middleware/rateLimit.middleware.js';
import { inputSanitizer, requestGuard, additionalSecurityHeaders } from './middleware/security.middleware.js';
import { requestTrackerMiddleware } from './middleware/request-tracker.middleware.js';

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import workspacesRoutes from './modules/workspaces/workspaces.routes.js';
import projectsRoutes from './modules/projects/projects.routes.js';
import notesRoutes from './modules/notes/notes.routes.js';
import notesGraphRoutes from './modules/notes/notes-graph.routes.js';
import tasksRoutes from './modules/tasks/tasks.routes.js';
import { createJournalRouter } from './modules/journal/index.js';
import messagingRoutes from './modules/messaging/messaging.routes.js';
// import presenceRoutes from './modules/messaging/presence.routes.js';
// import emailRoutes from './modules/messaging/email.routes.js';
import gamificationRoutes from './modules/gamification/gamification.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import canvasesRoutes from './modules/canvases/canvases.routes.js';
import filesRoutes from './modules/files/files.routes.js';
import { notificationsRoutes, initNotificationService, processPendingNotifications } from './modules/notifications/index.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import aiReportsRoutes from './modules/reports/ai-reports.routes.js';
import { accountingRoutes } from './modules/accounting/index.js';
import aiRoutes from './modules/ai/ai.routes.js';
import { plansRoutes } from './modules/plans/index.js';
import signalsRoutes from './modules/signals/signals.routes.js';
import uploadsRoutes from './modules/uploads/uploads.routes.js';
import { campaignsRoutes } from './modules/campaigns/index.js';
import { giriVisionRoutes } from './modules/giri-vision/index.js';
import { adminRoutes } from './modules/admin/index.js';
import { mailRoutes } from './modules/mail/index.js';
import configRoutes from './modules/config/config.routes.js';
import { lifeInsightsRoutes } from './modules/life-insights/index.js';
// Freelancer Power Pack v5.0
import timeTrackingRoutes from './modules/time-tracking/time-tracking.routes.js';
import { initTimeTrackingService } from './modules/time-tracking/time-tracking.service.js';
import crmRoutes from './modules/crm/crm.routes.js';
import { initCRMService } from './modules/crm/crm.service.js';
import calendarRoutes from './modules/calendar/calendar.routes.js';
import { initCalendarService } from './modules/calendar/calendar.service.js';
import calendarAgentRoutes from './modules/calendar/calendar-agent.routes.js';
import { initCalendarAgentService } from './modules/calendar/calendar-agent.service.js';
import contractsRoutes from './modules/contracts/contracts.routes.js';
import { initContractsService } from './modules/contracts/contracts.service.js';
import goalsRoutes from './modules/goals/goals.routes.js';
import { initGoalsService } from './modules/goals/goals.service.js';
import relancesRoutes from './modules/relances/relances.routes.js';
import { initRelancesService } from './modules/relances/relances.service.js';
import { adminRouter as portalAdminRoutes, publicRouter as portalPublicRoutes } from './modules/client-portal/portal.routes.js';
import { initPortalService } from './modules/client-portal/portal.service.js';
import urssafRoutes from './modules/urssaf/urssaf.routes.js';
import monitoringRoutes from './modules/monitoring/monitoring.routes.js';
import { initURSSAFService } from './modules/urssaf/urssaf.service.js';
import pool from './modules/accounting/pool.js';
import path from 'path';

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Disable powered-by header
app.disable('x-powered-by');

// =============================================
// SECURITY MIDDLEWARE STACK
// =============================================

// 1. Request guard - block suspicious patterns
app.use(requestGuard);

// 2. Helmet - comprehensive security headers
app.use(helmet({
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
app.use(additionalSecurityHeaders);

// 4. CORS - strict origin whitelist
const allowedOrigins = env.CORS_ORIGIN?.split(',').map(o => o.trim()).filter(Boolean) || [];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
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
app.use(hpp());

// 6. Logging (production: combined format, dev: dev format)
if (env.NODE_ENV !== 'test') {
  app.use(morgan(isProd ? 'combined' : 'dev'));
}

// 6.5 Request tracker for API metrics
app.use(requestTrackerMiddleware);

// 7. Body parsing with strict limits
app.use(express.json({
  limit: '1mb', // Reduced from 10mb
  strict: true,
}));
app.use(express.urlencoded({
  extended: false, // Simpler parsing, prevents prototype pollution
  limit: '1mb',
  parameterLimit: 50,
}));

// 8. Input sanitization
app.use(inputSanitizer);

// 9. Global rate limiter
const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
});
app.use(globalRateLimiter);

// =============================================
// ROUTES
// =============================================

// API routes
const apiRouter = express.Router();

// Monitoring routes (includes /health endpoint) - DISABLED: TS compile errors

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/workspaces', workspacesRoutes);
apiRouter.use('/projects', projectsRoutes);
apiRouter.use('/notes', notesRoutes);
apiRouter.use('/notes', notesGraphRoutes); // Graph system routes
apiRouter.use('/tasks', tasksRoutes);
apiRouter.use('/journal', createJournalRouter(pool));
apiRouter.use('/messaging', messagingRoutes);
// apiRouter.use('/messaging', emailRoutes); // Email export routes (/:conversationId/email/*)
// apiRouter.use('/presence', presenceRoutes); // Presence & typing indicators
apiRouter.use('/gamification', gamificationRoutes);
apiRouter.use('/audit', auditRoutes);
apiRouter.use('/canvases', canvasesRoutes);
apiRouter.use('/files', filesRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/reports', reportsRoutes);
apiRouter.use('/reports/ai', aiReportsRoutes);
apiRouter.use('/accounting/workspace/:workspaceId', accountingRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/monitoring', monitoringRoutes);
apiRouter.use('/plans', plansRoutes);
apiRouter.use('/signals', signalsRoutes);
apiRouter.use('/uploads', uploadsRoutes);
apiRouter.use('/campaigns', campaignsRoutes);
apiRouter.use('/giri-vision', giriVisionRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/mail', mailRoutes);
apiRouter.use('/config', configRoutes);
apiRouter.use('/life-insights', lifeInsightsRoutes);

// Freelancer Power Pack v5.0 - Init services + mount routes
initTimeTrackingService(pool);
initCRMService(pool);
initCalendarService(pool);
initCalendarAgentService(pool);
initNotificationService(pool);
initContractsService(pool);
initGoalsService(pool);
initRelancesService(pool);
initPortalService(pool);
initURSSAFService(pool);

apiRouter.use('/time-tracking/workspace/:workspaceId', timeTrackingRoutes);
apiRouter.use('/crm/workspace/:workspaceId', crmRoutes);
apiRouter.use('/calendar/workspace/:workspaceId', calendarRoutes);
apiRouter.use('/calendar/workspace/:workspaceId/agent', calendarAgentRoutes);
apiRouter.use('/contracts/workspace/:workspaceId', contractsRoutes);
apiRouter.use('/goals/workspace/:workspaceId', goalsRoutes);
apiRouter.use('/relances/workspace/:workspaceId', relancesRoutes);
apiRouter.use('/portal/workspace/:workspaceId', portalAdminRoutes);
apiRouter.use('/portal/client', portalPublicRoutes);
apiRouter.use('/urssaf/workspace/:workspaceId', urssafRoutes);

console.log('[Freelancer Power Pack v5.0] 8 modules initialized');

// Health check endpoint (for Nginx monitoring)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1', apiRouter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// =============================================
// ERROR HANDLING
// =============================================

app.use(notFoundHandler);
app.use(errorHandler);

// =============================================
// SERVER START
// =============================================

const PORT = env.PORT || 3000;
const HOST = '0.0.0.0'; // Bind to all interfaces - required for PM2 cluster mode load balancing

const server = app.listen(PORT, HOST, () => {
  console.log(`
  Productive Core API Server
  ============================
  Environment: ${env.NODE_ENV}
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
    await processPendingNotifications();
  } catch (error) {
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
      await closeDb();
    } catch (error) {
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

export default app;
