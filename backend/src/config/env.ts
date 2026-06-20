import dotenv from 'dotenv';

dotenv.config();

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  port: num(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) ?? [
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  databaseUrl: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  baseCurrency: process.env.BASE_CURRENCY ?? 'MXN',
  priceTickMs: num(process.env.PRICE_TICK_MS, 1500),
  isProd: process.env.NODE_ENV === 'production',
  sms: {
    /** Solo true si explícitamente SMS_MOCK=true (respaldo local sin Twilio). */
    mock: process.env.SMS_MOCK === 'true',
    accountSid: process.env.TWILIO_ACCOUNT_SID?.trim() || undefined,
    authToken: process.env.TWILIO_AUTH_TOKEN?.trim() || undefined,
    fromNumber: process.env.TWILIO_FROM_NUMBER?.trim() || undefined,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID?.trim() || undefined,
  },
};
