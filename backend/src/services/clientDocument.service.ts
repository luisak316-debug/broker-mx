import { randomUUID } from 'node:crypto';
import { addClientDocument, clearClientIdentityDocuments } from '../data/adminStore';
import { isDatabaseEnabled } from '../lib/database';
import { prisma } from '../lib/prisma';
import { getInternalUserId } from '../repositories/client.repository';
import { saveClientDocument } from './documentUpload.service';
import type { Client, ClientDocument, DocumentType } from '../types/admin';

const IDENTITY_DOCUMENT_TYPES: DocumentType[] = ['INE', 'PASAPORTE', 'CONSTANCIA_FISCAL'];

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

  doc.previewUrl = `data:${params.mimeType};base64,${params.dataBase64}`;

  if (!isDatabaseEnabled()) {
    clearClientIdentityDocuments(params.client.id);
    addClientDocument(params.client.id, { ...doc, fileData: params.dataBase64 });
    doc.fileUrl = `/api/profile/${params.client.id}/documents/${doc.id}/file`;
    return doc;
  }

  const internalId = await getInternalUserId(params.client.id);
  if (!internalId) throw new Error('Cliente no encontrado.');

  await prisma.clientDocument.deleteMany({
    where: {
      userId: internalId,
      type: { in: IDENTITY_DOCUMENT_TYPES },
    },
  });

  const row = await prisma.clientDocument.create({
    data: {
      userId: internalId,
      type: params.type,
      fileName: params.fileName,
      mimeType: params.mimeType,
      fileData: params.dataBase64,
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
  doc.fileUrl = `/api/profile/${params.client.id}/documents/${row.id}/file`;
  doc.uploadedAt = row.uploadedAt.toISOString();
  return doc;
}
