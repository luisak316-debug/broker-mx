import twilio from 'twilio';
import { env } from '../config/env';
import { HttpError } from '../middleware/errorHandler';

type TwilioClient = ReturnType<typeof twilio>;

let twilioClient: TwilioClient | null = null;

function toE164Mx(phone10: string): string {
  return `+52${phone10.replace(/\D/g, '').slice(-10)}`;
}

function getTwilioClient(): TwilioClient | null {
  const { accountSid, authToken } = env.sms;
  if (!accountSid || !authToken) return null;
  if (!twilioClient) twilioClient = twilio(accountSid, authToken);
  return twilioClient;
}

export function isTwilioConfigured(): boolean {
  const { fromNumber, messagingServiceSid } = env.sms;
  return !!(getTwilioClient() && (fromNumber || messagingServiceSid));
}

function mapTwilioError(err: unknown): HttpError {
  const e = err as { code?: number; message?: string; moreInfo?: string };
  const code = e?.code;
  const detail = e?.message ?? 'Error al enviar SMS.';

  if (code === 21211 || code === 21614) {
    return new HttpError(400, 'Número de celular inválido. Verifica los 10 dígitos.');
  }
  if (code === 21608) {
    return new HttpError(
      400,
      'Cuenta Twilio en prueba: solo puedes enviar SMS a números verificados en tu consola Twilio.',
    );
  }
  if (code === 21610) {
    return new HttpError(400, 'Este número no puede recibir SMS en este momento.');
  }
  if (msg.includes('Test Account Credentials') || code === 20008) {
    return new HttpError(
      503,
      'Credenciales Twilio de prueba (Test). Usa Account SID y Auth Token LIVE en backend/.env.',
    );
  }
  if (code === 20003 || code === 20403) {
    return new HttpError(503, 'Credenciales Twilio incorrectas. Revisa TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN.');
  }
  if (code === 21408) {
    return new HttpError(
      503,
      'Tu cuenta Twilio no tiene permiso para enviar SMS a México (+52). Activa geo-permissions en Twilio.',
    );
  }

  console.error('[SMS Twilio]', code, detail, e?.moreInfo ?? '');
  return new HttpError(503, 'No se pudo enviar el SMS. Intenta de nuevo en unos minutos.');
}

/**
 * Envía el código OTP por SMS real vía Twilio.
 * Solo usa modo simulado si SMS_MOCK=true y Twilio no está configurado.
 */
export async function sendOtpSms(phone10: string, code: string): Promise<{ mock: boolean }> {
  const to = toE164Mx(phone10);
  const body = `Broker.mx: tu codigo de verificacion es ${code}. Valido 10 min. No lo compartas.`;

  const client = getTwilioClient();
  const { fromNumber, messagingServiceSid } = env.sms;

  if (client && (fromNumber || messagingServiceSid)) {
    try {
      await client.messages.create({
        to,
        body,
        ...(messagingServiceSid
          ? { messagingServiceSid }
          : { from: fromNumber }),
      });
      console.log(`[SMS] Codigo enviado a ${to}`);
      return { mock: false };
    } catch (err) {
      throw mapTwilioError(err);
    }
  }

  if (env.sms.mock) {
    console.log(`[SMS MOCK] Codigo para ${to}: ${code}`);
    return { mock: true };
  }

  throw new HttpError(
    503,
    'SMS no configurado. Agrega credenciales Twilio en backend/.env (ver backend/.env.example).',
  );
}

export function shouldExposeDebugCode(): boolean {
  return env.sms.mock && !isTwilioConfigured();
}

export function smsStatusLabel(): string {
  if (isTwilioConfigured()) return 'Twilio (SMS real)';
  if (env.sms.mock) return 'Simulado (SMS_MOCK=true)';
  return 'NO CONFIGURADO — los clientes no recibirán SMS';
}
