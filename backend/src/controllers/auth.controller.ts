import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createClient,
  findClient,
  findClientByEmail,
  findClientByPhone,
  updateClientPassword,
} from '../repositories/client.repository';
import { hashPassword, verifyPassword } from '../services/security.service';
import { issueOtp, verifyOtp, consumeVerifiedOtp } from '../services/otp.service';
import { sendOtpSms, shouldExposeDebugCode } from '../services/sms.service';
import { HttpError } from '../middleware/errorHandler';
import {
  clientEmailFromPhone,
  getLatamCountry,
  isValidNationalPhone,
  maskPhone,
  normalizeNationalPhone,
  otpPhoneKey,
  toE164,
} from '../data/latamCountries';

function clientToken(id: string): string {
  return `client.${id}.${Date.now()}`;
}

function clientPayload(client: {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  countryCode?: string;
  currency?: string;
  city?: string;
  homeAddress?: string;
  kycStatus: string;
  accountStatus: string;
  profilePhotoUrl?: string;
}) {
  if (client.accountStatus !== 'ACTIVA') {
    throw new HttpError(403, 'Tu cuenta está suspendida. Contacta a tu asesor.');
  }
  const cc = client.countryCode ?? 'MX';
  const country = getLatamCountry(cc);
  return {
    id: client.id,
    email: client.email,
    phone: client.phone ?? '',
    countryCode: cc,
    currency: client.currency ?? country.currency,
    displayName: client.displayName,
    city: client.city ?? '',
    homeAddress: client.homeAddress ?? '',
    kycStatus: client.kycStatus,
    profilePhotoUrl: client.profilePhotoUrl ?? '',
  };
}

const countryCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(2, 'Selecciona un país válido.');

const phoneBodySchema = z.object({
  countryCode: countryCodeSchema.default('MX'),
  phone: z.string().trim().min(6, 'Ingresa tu número de celular.'),
});

function parsePhoneInput(body: unknown): { countryCode: string; national: string; otpKey: string } {
  const { countryCode, phone } = phoneBodySchema.parse(body);
  const country = getLatamCountry(countryCode);
  const national = normalizeNationalPhone(phone);
  if (!isValidNationalPhone(country, national)) {
    const len = Array.isArray(country.phoneLength)
      ? `${country.phoneLength[0]}–${country.phoneLength[1]}`
      : String(country.phoneLength);
    throw new HttpError(400, `El celular de ${country.name} debe tener ${len} dígitos.`);
  }
  return { countryCode: country.code, national, otpKey: otpPhoneKey(country.code, national) };
}

export async function sendOtp(req: Request, res: Response): Promise<void> {
  const { countryCode, national, otpKey } = parsePhoneInput(req.body);

  if (await findClientByPhone(countryCode, national)) {
    throw new HttpError(409, 'Ya existe una cuenta con este número de celular.');
  }

  const { code, expiresInSeconds } = issueOtp(otpKey);
  const { mock } = await sendOtpSms(countryCode, national, code);

  res.json({
    data: {
      message: 'Código enviado a tu celular.',
      expiresInSeconds,
      maskedPhone: maskPhone(national),
      countryCode,
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
  countryCode: countryCodeSchema.default('MX'),
  phone: z.string().trim().min(6),
  otpCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'El código debe tener 6 dígitos.'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .regex(/[A-Za-z]/, 'La contraseña debe incluir letras.')
    .regex(/\d/, 'La contraseña debe incluir números.'),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los Términos y Condiciones.' }),
  }),
});

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.parse(req.body);
  const country = getLatamCountry(parsed.countryCode);
  const national = normalizeNationalPhone(parsed.phone);
  if (!isValidNationalPhone(country, national)) {
    throw new HttpError(400, 'Número de celular inválido para el país seleccionado.');
  }
  const otpKey = otpPhoneKey(country.code, national);

  if (await findClientByPhone(country.code, national)) {
    throw new HttpError(409, 'Ya existe una cuenta con este número de celular.');
  }

  verifyOtp(otpKey, parsed.otpCode);
  consumeVerifiedOtp(otpKey, parsed.otpCode);

  const email = clientEmailFromPhone(country.code, national);
  if (await findClientByEmail(email)) {
    throw new HttpError(409, 'Ya existe una cuenta con este número de celular.');
  }

  const client = await createClient({
    displayName: parsed.fullName,
    email,
    phone: national,
    countryCode: country.code,
    currency: country.currency,
    passwordHash: hashPassword(parsed.password),
    plainPassword: parsed.password,
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
  countryCode: countryCodeSchema.default('MX'),
  phone: z.string().trim().min(6),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});

export async function login(req: Request, res: Response): Promise<void> {
  const { countryCode, phone, password } = loginSchema.parse(req.body);
  const national = normalizeNationalPhone(phone);
  const client = await findClientByPhone(countryCode, national);
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
  countryCode: countryCodeSchema.default('MX'),
  phone: z.string().trim().min(6),
  otpCode: z.string().trim().regex(/^\d{6}$/, 'El código debe tener 6 dígitos.'),
});

export function verifyOtpCode(req: Request, res: Response): void {
  const { countryCode, phone, otpCode } = verifyOtpOnlySchema.parse(req.body);
  const national = normalizeNationalPhone(phone);
  const otpKey = otpPhoneKey(countryCode, national);
  verifyOtp(otpKey, otpCode);
  res.json({ data: { valid: true } });
}

/** OTP para recuperar contraseña (solo si el celular ya está registrado). */
export async function sendRecoveryOtp(req: Request, res: Response): Promise<void> {
  const { countryCode, national, otpKey } = parsePhoneInput(req.body);
  const client = await findClientByPhone(countryCode, national);
  if (!client) {
    throw new HttpError(404, 'No hay cuenta registrada con este número de celular.');
  }
  if (client.accountStatus !== 'ACTIVA') {
    throw new HttpError(403, 'Tu cuenta está suspendida. Contacta a tu asesor.');
  }

  const { code, expiresInSeconds } = issueOtp(otpKey);
  const { mock } = await sendOtpSms(countryCode, national, code);

  res.json({
    data: {
      message: 'Código enviado a tu celular.',
      expiresInSeconds,
      maskedPhone: maskPhone(national),
      countryCode,
      ...(mock && shouldExposeDebugCode() ? { debugCode: code } : {}),
    },
  });
}

const resetPasswordSchema = z.object({
  countryCode: countryCodeSchema.default('MX'),
  phone: z.string().trim().min(6),
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

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { countryCode, phone, otpCode, password } = resetPasswordSchema.parse(req.body);
  const national = normalizeNationalPhone(phone);
  const otpKey = otpPhoneKey(countryCode, national);
  const client = await findClientByPhone(countryCode, national);
  if (!client) {
    throw new HttpError(404, 'No hay cuenta registrada con este número de celular.');
  }

  verifyOtp(otpKey, otpCode);
  consumeVerifiedOtp(otpKey, otpCode);

  await updateClientPassword(client.id, hashPassword(password), password);

  res.json({
    data: {
      message: 'Contraseña actualizada. Ya puedes iniciar sesión.',
    },
  });
}

/** Sincroniza datos del cliente (incl. foto) entre dispositivos tras login previo. */
export async function getClientSession(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.clientId);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');
  res.json({ data: clientPayload(client) });
}

// Re-export for tests
export { toE164 };
