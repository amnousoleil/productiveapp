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
exports.getEventSuggestions = exports.createEventFromQuery = exports.findAvailableSlots = exports.parseEventQuery = exports.initCalendarAgentService = void 0;
const calendarSvc = __importStar(require("./calendar.service.js"));
let pool;
const initCalendarAgentService = (p) => { pool = p; };
exports.initCalendarAgentService = initCalendarAgentService;
/**
 * Parse natural language query to extract event details
 * @param query - Natural language query (e.g., "Prends RDV avec Brice demain à 14h pour révision projet")
 */
const parseEventQuery = async (query) => {
    // Extract date/time information
    const now = new Date();
    let startDate = new Date(now);
    let endDate;
    // Simple date parsing (can be enhanced with more sophisticated NLP)
    const lowerQuery = query.toLowerCase();
    // Tomorrow
    if (lowerQuery.includes('demain')) {
        startDate.setDate(startDate.getDate() + 1);
    }
    // Today
    else if (lowerQuery.includes("aujourd'hui")) {
        // Keep current date
    }
    // This week days
    else if (lowerQuery.includes('lundi')) {
        startDate = getNextWeekday(1);
    }
    else if (lowerQuery.includes('mardi')) {
        startDate = getNextWeekday(2);
    }
    else if (lowerQuery.includes('mercredi')) {
        startDate = getNextWeekday(3);
    }
    else if (lowerQuery.includes('jeudi')) {
        startDate = getNextWeekday(4);
    }
    else if (lowerQuery.includes('vendredi')) {
        startDate = getNextWeekday(5);
    }
    else if (lowerQuery.includes('samedi')) {
        startDate = getNextWeekday(6);
    }
    else if (lowerQuery.includes('dimanche')) {
        startDate = getNextWeekday(0);
    }
    // Extract time (format: "14h", "14h30", "14:00")
    const timeMatch = lowerQuery.match(/(\d{1,2})h(\d{2})?|(\d{1,2}):(\d{2})/);
    if (timeMatch) {
        const hours = parseInt(timeMatch[1] || timeMatch[3]);
        const minutes = parseInt(timeMatch[2] || timeMatch[4] || '0');
        startDate.setHours(hours, minutes, 0, 0);
        // Default 1 hour duration
        endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);
    }
    else {
        // All-day event
        startDate.setHours(9, 0, 0, 0);
    }
    // Extract attendees (names after "avec")
    const attendees = [];
    const avecMatch = lowerQuery.match(/avec\s+([a-zàâäéèêëïîôöùûüÿçæœ\s,]+?)(?:\s+(?:à|pour|demain|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|\d))/i);
    if (avecMatch) {
        const names = avecMatch[1].split(/,|\set\s/);
        attendees.push(...names.map(n => n.trim()).filter(Boolean));
    }
    // Extract title/purpose (after "pour")
    let title = 'Rendez-vous';
    const pourMatch = lowerQuery.match(/pour\s+(.+?)$/i);
    if (pourMatch) {
        title = pourMatch[1].trim();
    }
    else if (attendees.length > 0) {
        title = `RDV avec ${attendees.join(', ')}`;
    }
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
    return {
        title,
        start_date: startDate.toISOString(),
        end_date: endDate?.toISOString(),
        attendees,
        event_type: 'meeting'
    };
};
exports.parseEventQuery = parseEventQuery;
/**
 * Get next occurrence of a weekday (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
function getNextWeekday(targetDay) {
    const date = new Date();
    const currentDay = date.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0)
        daysToAdd += 7; // Next week if already passed
    date.setDate(date.getDate() + daysToAdd);
    return date;
}
/**
 * Find available time slots in a given date range
 * @param wid - Workspace ID
 * @param mid - Member ID
 * @param startDate - Start date to search from
 * @param endDate - End date to search until
 * @param durationMinutes - Desired duration in minutes (default: 60)
 */
const findAvailableSlots = async (wid, mid, startDate, endDate, durationMinutes = 60) => {
    // Get all events in the range
    const events = (await pool.query(`SELECT start_at, end_at FROM calendar_events
     WHERE workspace_id = $1 AND member_id = $2
     AND start_at >= $3 AND start_at <= $4
     ORDER BY start_at ASC`, [wid, mid, startDate, endDate])).rows;
    const slots = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Generate working hours slots (9h-18h, Monday-Friday)
    let current = new Date(start);
    while (current < end) {
        const dayOfWeek = current.getDay();
        // Skip weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            current.setDate(current.getDate() + 1);
            current.setHours(9, 0, 0, 0);
            continue;
        }
        // Check working hours (9h-18h)
        if (current.getHours() >= 9 && current.getHours() < 18) {
            const slotStart = new Date(current);
            const slotEnd = new Date(current);
            slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);
            // Check if slot conflicts with existing events
            const hasConflict = events.some(ev => {
                const evStart = new Date(ev.start_at);
                const evEnd = new Date(ev.end_at || ev.start_at);
                return (slotStart < evEnd && slotEnd > evStart);
            });
            if (!hasConflict) {
                // Calculate score (prefer morning slots, mid-week)
                let score = 100;
                const hour = slotStart.getHours();
                if (hour >= 9 && hour <= 11)
                    score += 20; // Morning preference
                if (dayOfWeek >= 2 && dayOfWeek <= 4)
                    score += 10; // Mid-week preference
                slots.push({
                    start: slotStart.toISOString(),
                    end: slotEnd.toISOString(),
                    score
                });
            }
        }
        // Move to next 30-minute slot
        current.setMinutes(current.getMinutes() + 30);
    }
    // Return top 5 slots sorted by score
    return slots.sort((a, b) => b.score - a.score).slice(0, 5);
};
exports.findAvailableSlots = findAvailableSlots;
/**
 * Create event from natural language query
 */
const createEventFromQuery = async (wid, mid, query, autoSchedule = false) => {
    const parsed = await (0, exports.parseEventQuery)(query);
    // If autoSchedule and no specific time, find best slot
    if (autoSchedule && !query.match(/\d{1,2}[h:]\d{0,2}/)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const nextWeek = new Date(tomorrow);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const slots = await (0, exports.findAvailableSlots)(wid, mid, tomorrow.toISOString(), nextWeek.toISOString());
        if (slots.length > 0) {
            // Use best slot
            parsed.start_date = slots[0].start;
            parsed.end_date = slots[0].end;
        }
    }
    // Resolve attendee names to member IDs
    const attendeeIds = [];
    if (parsed.attendees && parsed.attendees.length > 0) {
        for (const name of parsed.attendees) {
            const member = (await pool.query(`SELECT id, name FROM users WHERE workspace_id = $1 AND LOWER(name) LIKE $2 LIMIT 1`, [wid, `%${name.toLowerCase()}%`])).rows[0];
            if (member) {
                attendeeIds.push(member.id);
            }
        }
    }
    // Create event
    const event = await calendarSvc.createEvent(wid, mid, {
        ...parsed,
        attendees: attendeeIds.map(id => ({ user_id: id, status: 'pending' }))
    });
    // Get alternative suggestions if auto-schedule was used
    let suggestions;
    if (autoSchedule) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(tomorrow);
        nextWeek.setDate(nextWeek.getDate() + 7);
        suggestions = await (0, exports.findAvailableSlots)(wid, mid, tomorrow.toISOString(), nextWeek.toISOString());
    }
    return { event, suggestions };
};
exports.createEventFromQuery = createEventFromQuery;
/**
 * Get AI suggestions for event optimization
 */
const getEventSuggestions = async (wid, mid, eventId) => {
    const event = await calendarSvc.getEvent(wid, eventId);
    if (!event)
        throw new Error('Event not found');
    const suggestions = {
        betterTimes: [],
        conflictingEvents: [],
        recommendations: []
    };
    // Find conflicts
    const conflicts = (await pool.query(`SELECT id, title, start_at, end_at FROM calendar_events
     WHERE workspace_id = $1 AND member_id = $2 AND id != $3
     AND start_at < $5 AND (end_at > $4 OR end_at IS NULL)`, [wid, mid, eventId, event.start_date, event.end_date || event.start_date])).rows;
    if (conflicts.length > 0) {
        suggestions.conflictingEvents = conflicts;
        suggestions.recommendations.push(`⚠️ ${conflicts.length} conflit(s) détecté(s). Considérez déplacer cet événement.`);
    }
    // Suggest better times if event is outside working hours
    const startHour = new Date(event.start_date).getHours();
    if (startHour < 9 || startHour >= 18) {
        suggestions.recommendations.push('💡 Cet événement est en dehors des heures de travail habituelles (9h-18h).');
        // Find alternative slots
        const tomorrow = new Date(event.start_date);
        const weekAfter = new Date(tomorrow);
        weekAfter.setDate(weekAfter.getDate() + 7);
        suggestions.betterTimes = await (0, exports.findAvailableSlots)(wid, mid, tomorrow.toISOString(), weekAfter.toISOString());
    }
    return suggestions;
};
exports.getEventSuggestions = getEventSuggestions;
//# sourceMappingURL=calendar-agent.service.js.map