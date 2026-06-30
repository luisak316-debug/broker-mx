import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { findClient, getInternalUserId } from '../../repositories/client.repository';
import { record } from '../../services/audit.service';
import { saveClientDocument } from '../../services/documentUpload.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';
import type { ClientDocument, DocumentType } from '../../types/admin';

const uploadSchema = z.object({
  type: z.enum(['INE', 'PASAPORTE', 'COMPROBANTE_DOMICILIO', 'CONSTANCIA_FISCAL']),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  data: z.string().min(1, 'No se recibió el archivo.'),
});

const DOC_LABEL: Record<DocumentType, string> = {
  INE: 'INE / Credencial para votar',
  PASAPORTE: 'Pasaporte',
  COMPROBANTE_DOMICILIO: 'Comprobante de domicilio',
  CONSTANCIA_FISCAL: 'Constancia fiscal',
};

export async function uploadDocument(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.id);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  const parsed = uploadSchema.parse(req.body);
  let buffer: Buffer;
  try {
    buffer = Buffer.from(parsed.data, 'base64');
  } catch {
    throw new HttpError(400, 'Archivo inválido.');
  }
  if (!buffer.length) throw new HttpError(400, 'El archivo está vacío.');

  let saved: { storageName: string; fileUrl: string };
  try {
    saved = saveClientDocument({
      clientId: client.id,
      fileName: parsed.fileName,
      mimeType: parsed.mimeType,
      buffer,
    });
  } catch (e) {
    throw new HttpError(400, e instanceof Error ? e.message : 'No se pudo guardar el archivo.');
  }

  const internalId = await getInternalUserId(client.id);
  if (!internalId) throw new HttpError(404, 'Cliente no encontrado.');

  const row = await prisma.clientDocument.create({
    data: {
      userId: internalId,
      type: parsed.type,
      fileName: parsed.fileName,
      status: 'EN_REVISION',
    },
  });

  if (client.kycStatus === 'PENDING') {
    await prisma.user.update({
      where: { id: internalId },
      data: { kycStatus: 'IN_REVIEW' },
    });
  }

  const doc: ClientDocument = {
    id: row.id,
    type: parsed.type,
    fileName: parsed.fileName,
    mimeType: parsed.mimeType,
    fileUrl: saved.fileUrl,
    status: 'EN_REVISION',
    uploadedAt: row.uploadedAt.toISOString(),
    uploadedByName: req.staff!.name,
  };

  const audit = await record({
    actor: req.staff!,
    action: 'DOCUMENT_UPLOAD',
    targetUserId: client.id,
    description: `${req.staff!.name} cargó el documento "${DOC_LABEL[parsed.type]}" (${parsed.fileName}) al expediente de ${client.displayName}.`,
    after: { documentId: doc.id, type: doc.type, fileName: doc.fileName },
    ip: clientIp(req),
  });

  res.status(201).json({ data: { document: doc, audit } });
}
