import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { AuthPayload, PublicUser, UserRecord } from '../types/index.ts';

// Use configured JWT_SECRET or generate a cryptographically secure per-process fallback in memory
const RUNTIME_FALLBACK_SECRET = crypto.randomBytes(32).toString('hex');

function getJwtSecret(): string {
  const envSecret = process.env.JWT_SECRET?.trim();
  return envSecret && envSecret.length >= 16 ? envSecret : RUNTIME_FALLBACK_SECRET;
}

// Track revoked token IDs (jti) with expiration timestamps so logout genuinely invalidates tokens
const revokedTokens = new Map<string, number>();

function pruneRevokedTokens(): void {
  const nowSec = Math.floor(Date.now() / 1000);
  for (const [jti, exp] of revokedTokens.entries()) {
    if (exp <= nowSec) {
      revokedTokens.delete(jti);
    }
  }
}

export function signAuthToken(payload: Omit<AuthPayload, 'jti' | 'exp'>): string {
  const jti = crypto.randomUUID();
  return jwt.sign({ ...payload, jti }, getJwtSecret(), {
    expiresIn: '8h',
  });
}

export function verifyAuthToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, getJwtSecret()) as AuthPayload;
  if (!decoded || !decoded.sub || !decoded.role || !decoded.jti) {
    throw new Error('Invalid token payload.');
  }
  if (revokedTokens.has(decoded.jti)) {
    throw new Error('Session has been logged out.');
  }
  return decoded;
}

export function revokeAuthToken(jti: string, exp?: number): void {
  pruneRevokedTokens();
  const fallbackExp = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
  revokedTokens.set(jti, exp ?? fallbackExp);
}

export function sanitizeUser(user: UserRecord): PublicUser {
  const { passwordHash: _omitted, ...publicFields } = user;
  return publicFields;
}
