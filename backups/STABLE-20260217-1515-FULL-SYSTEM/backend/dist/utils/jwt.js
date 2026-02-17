"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.generateTokens = generateTokens;
exports.verifyToken = verifyToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.hashToken = hashToken;
exports.generateSecureToken = generateSecureToken;
exports.getExpiryDate = getExpiryDate;
exports.getAccessTokenExpiry = getAccessTokenExpiry;
exports.getRefreshTokenExpiry = getRefreshTokenExpiry;
exports.decodeTokenWithoutVerification = decodeTokenWithoutVerification;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const env_js_1 = require("../config/env.js");
const ACCESS_TOKEN_EXPIRES = env_js_1.env.JWT_ACCESS_EXPIRES;
const REFRESH_TOKEN_EXPIRES = env_js_1.env.JWT_REFRESH_EXPIRES;
function parseExpiry(expiry) {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
        throw new Error(`Invalid expiry format: ${expiry}`);
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case 's':
            return value;
        case 'm':
            return value * 60;
        case 'h':
            return value * 60 * 60;
        case 'd':
            return value * 60 * 60 * 24;
        default:
            throw new Error(`Unknown time unit: ${unit}`);
    }
}
function generateAccessToken(payload) {
    const tokenPayload = {
        ...payload,
        type: 'access',
    };
    return jsonwebtoken_1.default.sign(tokenPayload, env_js_1.env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES,
    });
}
function generateRefreshToken(payload) {
    const tokenPayload = {
        ...payload,
        type: 'refresh',
    };
    return jsonwebtoken_1.default.sign(tokenPayload, env_js_1.env.JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES,
    });
}
function generateTokens(payload) {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return {
        accessToken,
        refreshToken,
        expiresIn: parseExpiry(ACCESS_TOKEN_EXPIRES),
    };
}
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Token expired');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw error;
    }
}
function verifyAccessToken(token) {
    const payload = verifyToken(token);
    if (payload.type !== 'access') {
        throw new Error('Invalid token type');
    }
    return payload;
}
function verifyRefreshToken(token) {
    const payload = verifyToken(token);
    if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
    }
    return payload;
}
function hashToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
function generateSecureToken(length = 32) {
    return crypto_1.default.randomBytes(length).toString('hex');
}
function getExpiryDate(expiry) {
    const seconds = parseExpiry(expiry);
    return new Date(Date.now() + seconds * 1000);
}
function getAccessTokenExpiry() {
    return getExpiryDate(ACCESS_TOKEN_EXPIRES);
}
function getRefreshTokenExpiry() {
    return getExpiryDate(REFRESH_TOKEN_EXPIRES);
}
function decodeTokenWithoutVerification(token) {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map