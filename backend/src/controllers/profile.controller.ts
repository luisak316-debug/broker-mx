import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  findClient,
  getProfilePhotoBuffer,
  updateClientProfileDetails,
  updateClientProfilePhoto,
} from '../repositories/client.repository';
import { uploadClientIdentityDocument } from '../services/clientDocument.service';
import { HttpError } from '../middleware/errorHandler';

const uploadPhotoSchema = z.object({
  data: z.string().min(1, 'No se recibió la foto.'),
});

const updateProfileSchema = z.object({
  city: z.string().trim().max(120).nullable().optional(),
  homeAddress: z.string().trim().max(500).nullable().optional(),
});

const uploadDocumentSchema = z.object({
  type: z.enum(['INE', 'PASAPORTE', 'COMPROBANTE_DOMICILIO', 'CONSTANCIA_FISCAL']),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  data: z.string().min(1, 'No se recibió el archivo.'),
});

export async function getClientProfile(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.clientId);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  res.json({
    data: {
      id: client.id,
      displayName: client.displayName,
      email: client.email,
      phone: client.phone ?? '',
      city: client.city ?? '',
      homeAddress: client.homeAddress ?? '',
      kycStatus: client.kycStatus,
      profilePhotoUrl: client.profilePhotoUrl ?? '',
      documents: client.documents,
      createdAt: client.createdAt,
    },
  });
}

export async function updateClientProfile(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.clientId);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  const body = updateProfileSchema.parse(req.body);
  const updated = await updateClientProfileDetails(client.id, {
    city: body.city,
    homeAddress: body.homeAddress,
  });
  if (!updated) throw new HttpError(404, 'Cliente no encontrado.');

  res.json({
    data: {
      id: updated.id,
      displayName: updated.displayName,
      email: updated.email,
      phone: updated.phone ?? '',
      city: updated.city ?? '',
      homeAddress: updated.homeAddress ?? '',
      kycStatus: updated.kycStatus,
      profilePhotoUrl: updated.profilePhotoUrl ?? '',
      documents: updated.documents,
      createdAt: updated.createdAt,
    },
  });
}

export async function uploadClientDocument(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.clientId);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  const parsed = uploadDocumentSchema.parse(req.body);
  try {
    const doc = await uploadClientIdentityDocument({
      client,
      type: parsed.type,
      fileName: parsed.fileName,
      mimeType: parsed.mimeType,
      dataBase64: parsed.data,
      uploadedByName: client.displayName,
    });
    res.status(201).json({ data: { document: doc } });
  } catch (e) {
    throw new HttpError(400, e instanceof Error ? e.message : 'No se pudo guardar el archivo.');
  }
}

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
