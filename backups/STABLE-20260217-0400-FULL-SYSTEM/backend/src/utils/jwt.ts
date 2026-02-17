import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import type { TokenPayload, AuthTokens, UUID } from '../types/index.js';

const ACCESS_TOKEN_EXPIRES = env.JWT_ACCESS_EXPIRES;
const REFRESH_TOKEN_EXPIRES = env.JWT_REFRESH_EXPIRES;

function parseExpiry(expiry: string): number {
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

export function generateAccessToken(payload: {
  userId: UUID;
  sessionId: UUID;
}): string {
  const tokenPayload: TokenPayload = {
    ...payload,
    type: 'access',
  };

  return jwt.sign(tokenPayload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES as string,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: {
  userId: UUID;
  sessionId: UUID;
}): string {
  const tokenPayload: TokenPayload = {
    ...payload,
    type: 'refresh',
  };

  return jwt.sign(tokenPayload, env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES as string,
  } as jwt.SignOptions);
}

export function generateTokens(payload: {
  userId: UUID;
  sessionId: UUID;
}): AuthTokens {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: parseExpiry(ACCESS_TOKEN_EXPIRES),
  };
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

export function verifyAccessToken(token: string): TokenPayload {
  const payload = verifyToken(token);
  if (payload.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return payload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const payload = verifyToken(token);
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return payload;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function getExpiryDate(expiry: string): Date {
  const seconds = parseExpiry(expiry);
  return new Date(Date.now() + seconds * 1000);
}

export function getAccessTokenExpiry(): Date {
  return getExpiryDate(ACCESS_TOKEN_EXPIRES);
}

export function getRefreshTokenExpiry(): Date {
  return getExpiryDate(REFRESH_TOKEN_EXPIRES);
}

export function decodeTokenWithoutVerification(
  token: string
): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}
