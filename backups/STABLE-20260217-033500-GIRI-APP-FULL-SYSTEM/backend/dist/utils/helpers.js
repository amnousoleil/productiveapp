"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.generateUUID = generateUUID;
exports.generateSlug = generateSlug;
exports.generateUniqueSlug = generateUniqueSlug;
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
exports.paginatedResponse = paginatedResponse;
exports.calculateOffset = calculateOffset;
exports.parseBoolean = parseBoolean;
exports.parseNumber = parseNumber;
exports.omitUndefined = omitUndefined;
exports.pick = pick;
exports.omit = omit;
exports.sleep = sleep;
exports.isValidUUID = isValidUUID;
exports.sanitizeHtml = sanitizeHtml;
exports.truncateString = truncateString;
exports.calculateWordCount = calculateWordCount;
exports.extractMentions = extractMentions;
exports.formatDateForDB = formatDateForDB;
exports.groupBy = groupBy;
exports.uniqueBy = uniqueBy;
exports.sortBy = sortBy;
const uuid_1 = require("uuid");
function generateUUID() {
    return (0, uuid_1.v4)();
}
function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
}
function generateUniqueSlug(name) {
    const baseSlug = generateSlug(name);
    const uniquePart = generateUUID().substring(0, 8);
    return `${baseSlug}-${uniquePart}`;
}
function successResponse(data, meta) {
    return {
        success: true,
        data,
        meta,
    };
}
function errorResponse(code, message, details) {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
    };
}
function paginatedResponse(data, params, total) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const totalPages = Math.ceil(total / limit);
    return {
        success: true,
        data,
        meta: {
            page,
            limit,
            total,
            hasMore: page < totalPages,
        },
    };
}
function calculateOffset(page, limit) {
    return (page - 1) * limit;
}
function parseBoolean(value) {
    if (value === undefined || value === null)
        return undefined;
    if (typeof value === 'boolean')
        return value;
    if (value === 'true' || value === '1')
        return true;
    if (value === 'false' || value === '0')
        return false;
    return undefined;
}
function parseNumber(value) {
    if (value === undefined || value === null)
        return undefined;
    if (typeof value === 'number')
        return value;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
}
function omitUndefined(obj) {
    const result = {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            result[key] = obj[key];
        }
    }
    return result;
}
function pick(obj, keys) {
    const result = {};
    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
}
function omit(obj, keys) {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}
function sanitizeHtml(html) {
    // Basic HTML sanitization - in production, use a proper library like DOMPurify
    return html
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function truncateString(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.substring(0, maxLength - 3) + '...';
}
function calculateWordCount(text) {
    if (!text || !text.trim())
        return 0;
    return text.trim().split(/\s+/).length;
}
function extractMentions(content) {
    // Extract @mentions in format @[user_id]
    const mentionRegex = /@\[([0-9a-f-]{36})\]/gi;
    const matches = content.matchAll(mentionRegex);
    const mentions = [];
    for (const match of matches) {
        if (isValidUUID(match[1])) {
            mentions.push(match[1]);
        }
    }
    return [...new Set(mentions)];
}
function formatDateForDB(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
}
function groupBy(array, keyFn) {
    return array.reduce((acc, item) => {
        const key = keyFn(item);
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});
}
function uniqueBy(array, keyFn) {
    const seen = new Set();
    return array.filter((item) => {
        const key = keyFn(item);
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
function sortBy(array, keyFn, order = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = keyFn(a);
        const bVal = keyFn(b);
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return order === 'asc' ? comparison : -comparison;
    });
}
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
    static badRequest(message, details) {
        return new AppError(400, 'BAD_REQUEST', message, details);
    }
    static unauthorized(message = 'Unauthorized') {
        return new AppError(401, 'UNAUTHORIZED', message);
    }
    static forbidden(message = 'Forbidden') {
        return new AppError(403, 'FORBIDDEN', message);
    }
    static notFound(resource = 'Resource') {
        return new AppError(404, 'NOT_FOUND', `${resource} not found`);
    }
    static conflict(message) {
        return new AppError(409, 'CONFLICT', message);
    }
    static tooManyRequests(message = 'Too many requests') {
        return new AppError(429, 'TOO_MANY_REQUESTS', message);
    }
    static internal(message = 'Internal server error') {
        return new AppError(500, 'INTERNAL_ERROR', message);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=helpers.js.map