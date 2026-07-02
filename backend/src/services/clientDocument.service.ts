import { randomUUID } from 'node:crypto';
import { addClientDocument } from '../data/adminStore';
import { isDatabaseEnabled } from '../lib/database';
import { prisma } from '../lib/prisma';
import { getInternalUserId } from '../repositories/client.repository';
import { saveClientDocument } from './documentUpload.service';
import type { Client, ClientDocument, DocumentType } from '../types/admin';

export async function uploadClientIdentityDocument(params: {
  client: Client;
  type: DocumentType;
  fileName: string;
  mimeType: string;
  dataBase64: string;
  uploadedByName: string;
}): Promise<ClientDocument> {
  let buffer: Buffer;
  try {
    buffer = Buffer.from(params.dataBase64, 'base64');
  } catch {
    throw new Error('Archivo inválido.');
  }
  if (!buffer.length) throw new Error('El archivo está vacío.');

  const saved = saveClientDocument({
    clientId: params.client.id,
    fileName: params.fileName,
    mimeType: params.mimeType,
    buffer,
  });

  const doc: ClientDocument = {
    id: randomUUID(),
    type: params.type,
    fileName: params.fileName,
    mimeType: params.mimeType,
    fileUrl: saved.fileUrl,
    status: 'EN_REVISION',
    uploadedAt: new Date().toISOString(),
    uploadedByName: params.uploadedByName,
  };

  if (!isDatabaseEnabled()) {
    addClientDocument(params.client.id, doc);
    return doc;
  }

  const internalId = await getInternalUserId(params.client.id);
  if (!internalId) throw new Error('Cliente no encontrado.');

  const row = await prisma.clientDocument.create({
    data: {
      userId: internalId,
      type: params.type,
      fileName: params.fileName,
      status: 'EN_REVISION',
    },
  });

  if (params.client.kycStatus === 'PENDING') {
    await prisma.user.update({
      where: { id: internalId },
      data: { kycStatus: 'IN_REVIEW' },
    });
  }

  doc.id = row.id;
  doc.uploadedAt = row.uploadedAt.toISOString();
  return doc;
}
