import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { env } from '../config/env';
import type { StaffRole } from '../types/admin';

/**
 * Seguridad de credenciales y sesiones para el backoffice.
 *
 * - Contraseñas: hash con scrypt + salt aleatorio por usuario (resistente a fuerza bruta).
 * - Sesiones: token firmado tipo JWT (HMAC-SHA256) con expiración. Sin dependencias externas.
 *
 * En producción se recomienda además: rotación de secretos, almacenamiento del secreto en un
 * gestor (KMS/Secrets Manager), refresh tokens y MFA para personal interno.
 */

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, 'hex');
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

export interface SessionPayload {
  sub: string; // staff id
  role: StaffRole;
  email: string;
  name: string;
  exp: number; // epoch seconds
}

export function signToken(payload: Omit<SessionPayload, 'exp'>, ttlSeconds = 60 * 60 * 8): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }),
  );
  const signature = base64url(
    createHmac('sha256', env.jwtSecret).update(`${header}.${body}`).digest(),
  );
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = base64url(
    createHmac('sha256', env.jwtSecret).update(`${header}.${body}`).digest(),
  );
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(fromBase64url(body).toString()) as SessionPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
