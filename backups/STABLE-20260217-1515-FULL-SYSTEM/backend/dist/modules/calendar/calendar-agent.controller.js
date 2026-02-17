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
exports.suggestions = exports.availableSlots = exports.createFromQuery = exports.parseQuery = void 0;
const agentSvc = __importStar(require("./calendar-agent.service.js"));
/**
 * POST /api/v1/calendar/workspace/:workspaceId/agent/parse
 * Parse natural language query
 */
const parseQuery = async (req, res) => {
    try {
        if (!req.body.query) {
            res.status(400).json({ error: 'query requis' });
            return;
        }
        const parsed = await agentSvc.parseEventQuery(req.body.query);
        res.json(parsed);
    }
    catch (e) {
        console.error('Calendar agent parse:', e);
        res.status(500).json({ error: 'Erreur lors du parsing' });
    }
};
exports.parseQuery = parseQuery;
/**
 * POST /api/v1/calendar/workspace/:workspaceId/agent/create
 * Create event from natural language query
 */
const createFromQuery = async (req, res) => {
    try {
        if (!req.body.query) {
            res.status(400).json({ error: 'query requis' });
            return;
        }
        const memberId = req.user?.id || req.body.member_id || null;
        const autoSchedule = req.body.auto_schedule === true;
        const result = await agentSvc.createEventFromQuery(req.params.workspaceId, memberId, req.body.query, autoSchedule);
        res.status(201).json(result);
    }
    catch (e) {
        console.error('Calendar agent create:', e);
        res.status(500).json({ error: 'Erreur lors de la création' });
    }
};
exports.createFromQuery = createFromQuery;
/**
 * GET /api/v1/calendar/workspace/:workspaceId/agent/available-slots
 * Find available time slots
 */
const availableSlots = async (req, res) => {
    try {
        if (!req.query.start_date || !req.query.end_date) {
            res.status(400).json({ error: 'start_date et end_date requis' });
            return;
        }
        const memberId = req.user?.id || req.query.member_id || null;
        const durationMinutes = parseInt(req.query.duration) || 60;
        const slots = await agentSvc.findAvailableSlots(req.params.workspaceId, memberId, req.query.start_date, req.query.end_date, durationMinutes);
        res.json({ slots });
    }
    catch (e) {
        console.error('Calendar agent available slots:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.availableSlots = availableSlots;
/**
 * GET /api/v1/calendar/workspace/:workspaceId/agent/suggestions/:eventId
 * Get AI suggestions for event optimization
 */
const suggestions = async (req, res) => {
    try {
        const memberId = req.user?.id || req.query.member_id || null;
        const result = await agentSvc.getEventSuggestions(req.params.workspaceId, memberId, req.params.eventId);
        res.json(result);
    }
    catch (e) {
        console.error('Calendar agent suggestions:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.suggestions = suggestions;
//# sourceMappingURL=calendar-agent.controller.js.map