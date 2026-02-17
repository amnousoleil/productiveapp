import type { TokenPayload, AuthTokens, UUID } from '../types/index.js';
export declare function generateAccessToken(payload: {
    userId: UUID;
    sessionId: UUID;
}): string;
export declare function generateRefreshToken(payload: {
    userId: UUID;
    sessionId: UUID;
}): string;
export declare function generateTokens(payload: {
    userId: UUID;
    sessionId: UUID;
}): AuthTokens;
export declare function verifyToken(token: string): TokenPayload;
export declare function verifyAccessToken(token: string): TokenPayload;
export declare function verifyRefreshToken(token: string): TokenPayload;
export declare function hashToken(token: string): string;
export declare function generateSecureToken(length?: number): string;
export declare function getExpiryDate(expiry: string): Date;
export declare function getAccessTokenExpiry(): Date;
export declare function getRefreshTokenExpiry(): Date;
export declare function decodeTokenWithoutVerification(token: string): TokenPayload | null;
//# sourceMappingURL=jwt.d.ts.map