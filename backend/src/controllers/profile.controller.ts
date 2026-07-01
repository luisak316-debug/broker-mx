import type { Request, Response } from 'express';
import { z } from 'zod';
import { findClient, updateClientProfilePhoto } from '../repositories/client.repository';
import { saveClientProfilePhoto } from '../services/documentUpload.service';
import { HttpError } from '../middleware/errorHandler';

const uploadPhotoSchema = z.object({
  data: z.string().min(1, 'No se recibió la foto.'),
  capturedAt: z.string().datetime().optional(),
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

  let saved: { fileUrl: string };
  try {
    saved = saveClientProfilePhoto({ clientId: client.id, buffer });
  } catch (e) {
    throw new HttpError(400, e instanceof Error ? e.message : 'No se pudo guardar la foto.');
  }

  const updated = await updateClientProfilePhoto(client.id, saved.fileUrl);
  if (!updated) throw new HttpError(500, 'No se pudo actualizar el perfil.');

  res.json({
    data: {
      profilePhotoUrl: updated.profilePhotoUrl ?? saved.fileUrl,
    },
  });
}
