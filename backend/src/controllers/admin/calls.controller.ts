import type { Request, Response } from 'express';
import { findClient } from '../../repositories/client.repository';
import { record } from '../../services/audit.service';
import {
  buildMicroSipDialString,
  clientPhoneToE164,
  maskPhoneE164,
} from '../../services/microsipDial.service';
import { contactPhoneToE164, maskContactPhoneE164 } from '../../lib/contactPhone';
import { maskUsEmitter, pickRandomUsEmitter } from '../../config/usEmitterPool';
import { findAdvisorContactById } from '../../repositories/advisorContact.repository';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';

/** Genera cadena de marcación MicroSIP (solo backend; el frontend no ve números completos). */
export async function getClientDialString(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.id);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');
  if (!client.phone?.trim()) {
    throw new HttpError(400, 'Este cliente no tiene teléfono registrado.');
  }

  const receiverE164 = clientPhoneToE164(client.countryCode ?? 'MX', client.phone);
  const emitterE164 = pickRandomUsEmitter();
  const dialString = buildMicroSipDialString(receiverE164, emitterE164);

  await record({
    actor: req.staff!,
    action: 'OUTBOUND_CALL_DIAL',
    targetUserId: client.id,
    description: `${req.staff!.name} solicitó marcación MicroSIP a ${client.displayName} (${maskPhoneE164(client.countryCode ?? 'MX', client.phone)}). Emisor ${maskUsEmitter(emitterE164)}.`,
    after: { emitterMasked: maskUsEmitter(emitterE164) },
    ip: clientIp(req),
  });

  res.json({
    data: {
      dialString,
      receiverMasked: maskPhoneE164(client.countryCode ?? 'MX', client.phone),
      emitterMasked: maskUsEmitter(emitterE164),
    },
  });
}

/** Marcación MicroSIP para contacto asignado (receptor internacional E.164). */
export async function getContactDialString(req: Request, res: Response): Promise<void> {
  const contact = await findAdvisorContactById(req.params.id);
  if (!contact) throw new HttpError(404, 'Contacto no encontrado.');

  const staff = req.staff!;
  if (staff.role === 'ADVISOR' && contact.advisorId !== staff.sub) {
    throw new HttpError(403, 'Este contacto no está asignado a ti.');
  }

  const receiverE164 = contactPhoneToE164(contact.phone);
  const emitterE164 = pickRandomUsEmitter();
  const dialString = buildMicroSipDialString(receiverE164, emitterE164);

  await record({
    actor: staff,
    action: 'OUTBOUND_CALL_DIAL',
    description: `${staff.name} marcación a contacto ${contact.clientName} (${maskContactPhoneE164(contact.phone)}). Emisor ${maskUsEmitter(emitterE164)}.`,
    after: { contactId: contact.id, emitterMasked: maskUsEmitter(emitterE164) },
    ip: clientIp(req),
  });

  res.json({
    data: {
      dialString,
      receiverMasked: maskContactPhoneE164(contact.phone),
      emitterMasked: maskUsEmitter(emitterE164),
    },
  });
}
