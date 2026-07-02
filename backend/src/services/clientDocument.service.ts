import { randomUUID } from 'node:crypto';
import { addClientDocument, removeClientIdentityDocuments } from '../data/adminStore';
import { isDatabaseEnabled } from '../lib/database';
import { prisma } from '../lib/prisma';
import { getInternalUserId } from '../repositories/client.repository';
import { saveClientDocument } from './documentUpload.service';
import type { Client, ClientDocument, DocumentSide } from '../types/admin';

const CLIENT_IDENTITY_TYPES: Array<'INE' | 'PASAPORTE'> = ['INE', 'PASAPORTE'];

export async function uploadClientIdentityDocument(params: {
  client: Client;
  type: 'INE' | 'PASAPORTE';
  side?: DocumentSide;
  fileName: string;
  mimeType: string;
  dataBase64: string;
  uploadedByName: string;
}): Promise<ClientDocument> {
  if (params.type === 'INE' && !params.side) {
    throw new Error('La INE requiere indicar anverso o reverso.');
  }
  if (params.type === 'PASAPORTE' && params.side === 'REVERSO') {
    throw new Error('El pasaporte solo requiere la página principal.');
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(params.dataBase64, 'base64');
  } catch {
    throw new Error('Archivo inválido.');
  }
  if (!buffer.length) throw new Error('El archivo está vacío.');

  if (!params.mimeType.startsWith('image/')) {
    throw new Error('Solo se permiten fotos capturadas con la cámara.');
  }

  const saved = saveClientDocument({
    clientId: params.client.id,
    fileName: params.fileName,
    mimeType: params.mimeType,
    buffer,
  });

  const side = params.type === 'PASAPORTE' ? (params.side ?? 'ANVERSO') : params.side;

  const doc: ClientDocument = {
    id: randomUUID(),
    type: params.type,
    side,
    fileName: params.fileName,
    mimeType: params.mimeType,
    fileUrl: saved.fileUrl,
    status: 'EN_REVISION',
    uploadedAt: new Date().toISOString(),
    uploadedByName: params.uploadedByName,
  };

  doc.previewUrl = `data:${params.mimeType};base64,${params.dataBase64}`;

  if (!isDatabaseEnabled()) {
    removeClientIdentityDocuments(params.client.id, {
      type: params.type,
      side,
      clearPassport: params.type === 'INE',
      clearIne: params.type === 'PASAPORTE',
    });
    addClientDocument(params.client.id, { ...doc, fileData: params.dataBase64 });
    doc.fileUrl = `/api/profile/${params.client.id}/documents/${doc.id}/file`;
    return doc;
  }

  const internalId = await getInternalUserId(params.client.id);
  if (!internalId) throw new Error('Cliente no encontrado.');

  if (params.type === 'PASAPORTE') {
    await prisma.clientDocument.deleteMany({
      where: { userId: internalId, type: { in: CLIENT_IDENTITY_TYPES } },
    });
  } else {
    await prisma.clientDocument.deleteMany({
      where: { userId: internalId, type: 'PASAPORTE' },
    });
    await prisma.clientDocument.deleteMany({
      where: { userId: internalId, type: 'INE', side },
    });
  }

  const row = await prisma.clientDocument.create({
    data: {
      userId: internalId,
      type: params.type,
      side,
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
