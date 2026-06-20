import type { NextFunction, Request, Response } from 'express';
import { verifyToken, type SessionPayload } from '../services/security.service';
import type { StaffRole } from '../types/admin';
import { HttpError } from './errorHandler';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      staff?: SessionPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) throw new HttpError(401, 'No autenticado. Inicia sesión.');
  const payload = verifyToken(token);
  if (!payload) throw new HttpError(401, 'Sesión inválida o expirada.');
  req.staff = payload;
  next();
}

/** Restringe el acceso a uno o más roles. ADMIN siempre tiene acceso. */
export function requireRole(...roles: StaffRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.staff) throw new HttpError(401, 'No autenticado.');
    if (req.staff.role !== 'ADMIN' && !roles.includes(req.staff.role)) {
      throw new HttpError(403, 'No tienes permisos para realizar esta acción.');
    }
    next();
  };
}

export function clientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket.remoteAddress ?? 'desconocida';
}
