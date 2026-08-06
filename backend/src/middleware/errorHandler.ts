import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Recurso no encontrado' });
}

function zodErrorMessage(err: ZodError): string {
  const issue = err.issues[0];
  if (!issue) return 'Datos inválidos. Revisa el formulario.';
  const field = String(issue.path[0] ?? '');
  const labels: Record<string, string> = {
    access: 'Acceso',
    password: 'Contraseña',
    computerId: 'ID laptop / PC',
    phone: 'Teléfono',
    displayName: 'Nombre',
    hireDate: 'Fecha de ingreso',
    managerTeam: 'Equipo de gerencia',
  };
  const label = labels[field] ?? 'Formulario';
  const msg = issue.message;
  if (msg.includes('Required')) return `${label} es obligatorio.`;
  return `${label}: ${msg}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: zodErrorMessage(err) });
    return;
  }
  const status = err instanceof HttpError ? err.status : 400;
  const message = err instanceof Error ? err.message : 'Error desconocido';
  res.status(status).json({ error: message });
}

export function asyncHandler<T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown> | unknown,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
}
