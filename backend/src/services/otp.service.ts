import { HttpError } from '../middleware/errorHandler';

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  verified: boolean;
}

const store = new Map<string, OtpEntry>();

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

function randomCode(): string {
  return String(Math.floor(100_000 + Math.random() * 900_000));
}

export function issueOtp(phone: string): { code: string; expiresInSeconds: number } {
  const key = normalizePhone(phone);
  if (!/^\d{10}$/.test(key)) {
    throw new HttpError(400, 'El teléfono celular debe tener 10 dígitos.');
  }

  const now = Date.now();
  const existing = store.get(key);
  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
    throw new HttpError(429, `Espera ${wait} segundos antes de solicitar otro código.`);
  }

  const code = randomCode();
  store.set(key, {
    code,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    lastSentAt: now,
    verified: false,
  });

  return { code, expiresInSeconds: OTP_TTL_MS / 1000 };
}

export function verifyOtp(phone: string, code: string): void {
  const key = normalizePhone(phone);
  const entry = store.get(key);
  if (!entry) {
    throw new HttpError(400, 'No hay código activo para este número. Solicita uno nuevo.');
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    throw new HttpError(400, 'El código expiró. Solicita uno nuevo.');
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(key);
    throw new HttpError(400, 'Demasiados intentos fallidos. Solicita un código nuevo.');
  }

  if (entry.code !== code.trim()) {
    entry.attempts += 1;
    throw new HttpError(400, 'Código incorrecto. Verifica e intenta de nuevo.');
  }

  entry.verified = true;
}

export function consumeVerifiedOtp(phone: string, code: string): void {
  const key = normalizePhone(phone);
  const entry = store.get(key);
  if (!entry?.verified || entry.code !== code.trim()) {
    throw new HttpError(400, 'Debes verificar tu número con el código SMS antes de registrarte.');
  }
  store.delete(key);
}
