import type { Request, Response } from 'express';
import { z } from 'zod';
import { createClient, findClientByEmail, findClientByPhone } from '../data/adminStore';
import { hashPassword, verifyPassword } from '../services/security.service';
import { issueOtp, verifyOtp, consumeVerifiedOtp } from '../services/otp.service';
import { sendOtpSms, shouldExposeDebugCode } from '../services/sms.service';
import { HttpError } from '../middleware/errorHandler';

function clientToken(id: string): string {
  return `client.${id}.${Date.now()}`;
}

function clientEmailFromPhone(phone: string): string {
  return `+52${phone}@celular.brokermx`;
}

function clientPayload(client: { id: string; email: string; displayName: string; phone: string; kycStatus: string }) {
  return {
    id: client.id,
    email: client.email,
    phone: client.phone,
    displayName: client.displayName,
    kycStatus: client.kycStatus,
  };
}

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, 'El teléfono celular debe tener 10 dígitos.');

const sendOtpSchema = z.object({
  phone: phoneSchema,
});

/**
 * Envía un código de verificación por SMS al celular del prospecto.
 */
export async function sendOtp(req: Request, res: Response): Promise<void> {
  const { phone } = sendOtpSchema.parse(req.body);

  if (findClientByPhone(phone)) {
    throw new HttpError(409, 'Ya existe una cuenta con este número de celular.');
  }

  const { code, expiresInSeconds } = issueOtp(phone);
  const { mock } = await sendOtpSms(phone, code);

  res.json({
    data: {
      message: 'Código enviado a tu celular.',
      expiresInSeconds,
      maskedPhone: `***${phone.slice(-4)}`,
      ...(mock && shouldExposeDebugCode() ? { debugCode: code } : {}),
    },
  });
}

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Ingresa tu nombre completo.')
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ' .]+$/, 'El nombre solo puede contener letras.'),
  phone: phoneSchema,
  otpCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'El código debe tener 6 dígitos.'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .regex(/[A-Za-z]/, 'La contraseña debe incluir letras.')
    .regex(/\d/, 'La contraseña debe incluir números.'),
});

/**
 * Registro de un nuevo cliente verificando OTP SMS. Crea su perfil en el CRM.
 */
export function register(req: Request, res: Response): void {
  const { fullName, phone, otpCode, password } = registerSchema.parse(req.body);

  if (findClientByPhone(phone)) {
    throw new HttpError(409, 'Ya existe una cuenta con este número de celular.');
  }

  verifyOtp(phone, otpCode);
  consumeVerifiedOtp(phone, otpCode);

  const email = clientEmailFromPhone(phone);
  if (findClientByEmail(email)) {
    throw new HttpError(409, 'Ya existe una cuenta con este número de celular.');
  }

  const client = createClient({
    displayName: fullName,
    email,
    phone,
    passwordHash: hashPassword(password),
  });

  res.status(201).json({
    data: {
      token: clientToken(client.id),
      client: clientPayload(client),
      redirectTo: '/app',
    },
  });
}

const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});

export function login(req: Request, res: Response): void {
  const { phone, password } = loginSchema.parse(req.body);
  const client = findClientByPhone(phone);
  if (!client || !client.passwordHash || !verifyPassword(password, client.passwordHash)) {
    throw new HttpError(401, 'Celular o contraseña incorrectos.');
  }
  res.json({
    data: {
      token: clientToken(client.id),
      client: clientPayload(client),
      redirectTo: '/app',
    },
  });
}

const verifyOtpOnlySchema = z.object({
  phone: phoneSchema,
  otpCode: z.string().trim().regex(/^\d{6}$/, 'El código debe tener 6 dígitos.'),
});

/** Valida el código sin consumirlo (útil para feedback en el formulario). */
export function verifyOtpCode(req: Request, res: Response): void {
  const { phone, otpCode } = verifyOtpOnlySchema.parse(req.body);
  verifyOtp(phone, otpCode);
  res.json({ data: { valid: true } });
}
