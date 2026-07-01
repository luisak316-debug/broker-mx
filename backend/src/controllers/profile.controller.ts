import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  findClient,
  getProfilePhotoBuffer,
  updateClientProfilePhoto,
} from '../repositories/client.repository';
import { HttpError } from '../middleware/errorHandler';

const uploadPhotoSchema = z.object({
  data: z.string().min(1, 'No se recibió la foto.'),
});

export async function uploadProfilePhoto(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.clientId);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  const parsed = uploadPhotoSchema.parse(req.body);
  let buffer: Buffer;
  try {
    buffer = Buffer.from(parsed.data, 'base64');
  } catch {
    throw new HttpError(400, 'Foto inválida.');
  }
  if (!buffer.length) throw new HttpError(400, 'La foto está vacía.');

  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new HttpError(400, 'Solo se permiten fotos capturadas en tiempo real (JPEG).');
  }

  const updated = await updateClientProfilePhoto(client.id, parsed.data);
  if (!updated?.profilePhotoUrl) throw new HttpError(500, 'No se pudo actualizar el perfil.');

  res.json({
    data: {
      profilePhotoUrl: updated.profilePhotoUrl,
    },
  });
}

export async function getProfilePhoto(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.clientId);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  const buffer = await getProfilePhotoBuffer(client.id);
  if (!buffer?.length) throw new HttpError(404, 'Foto no encontrada.');

  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=60');
  res.setHeader('Vary', 'Accept');
  res.send(buffer);
}
