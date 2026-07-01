import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'clients');
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

export function assertAllowedMime(mimeType: string): void {
  if (!ALLOWED_MIME.has(mimeType.toLowerCase())) {
    throw new Error('Formato no permitido. Usa PDF, PNG, JPG o WEBP.');
  }
}

export function saveClientDocument(params: {
  clientId: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}): { storageName: string; fileUrl: string } {
  if (params.buffer.length > MAX_BYTES) {
    throw new Error('El archivo supera el límite de 10 MB.');
  }
  assertAllowedMime(params.mimeType);

  const safeBase = params.fileName.replace(/[^\w.\-áéíóúñÁÉÍÓÚÑ ]/g, '_').slice(0, 120);
  const storageName = `${Date.now()}-${safeBase}`;
  const dir = path.join(UPLOAD_ROOT, params.clientId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, storageName), params.buffer);

  return {
    storageName,
    fileUrl: `/uploads/clients/${params.clientId}/${storageName}`,
  };
}

const PROFILE_MAX_BYTES = 2 * 1024 * 1024;

export function saveClientProfilePhoto(params: {
  clientId: string;
  buffer: Buffer;
}): { storageName: string; fileUrl: string } {
  if (params.buffer.length > PROFILE_MAX_BYTES) {
    throw new Error('La foto supera el límite de 2 MB.');
  }

  const storageName = `profile-${Date.now()}.jpg`;
  const dir = path.join(UPLOAD_ROOT, params.clientId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, storageName), params.buffer);

  return {
    storageName,
    fileUrl: `/uploads/clients/${params.clientId}/${storageName}`,
  };
}
