import type { Request, Response } from 'express';
import {
  isSipWebRtcConfigured,
  resolveAdvisorWssUrl,
  sipBridgeMode,
  sipTelephony,
} from '../../config/sipTelephony';
import { HttpError } from '../../middleware/errorHandler';

/**
 * Config WebRTC para SIP.js en el navegador del asesor.
 * La contraseña viaja solo por HTTPS autenticado; no se muestra en la UI.
 * (El asesor no ve MicroSIP ni menús de cuenta.)
 */
export async function getWebRtcConfig(req: Request, res: Response): Promise<void> {
  if (!isSipWebRtcConfigured()) {
    throw new HttpError(
      503,
      'Telefonía web no configurada. Contacta a soporte (faltan variables SIP en el servidor).',
    );
  }

  res.json({
    data: {
      wssUrl: resolveAdvisorWssUrl(),
      bridgeMode: sipBridgeMode(),
      domain: sipTelephony.domain,
      username: sipTelephony.username,
      authorizationPassword: sipTelephony.password,
      displayName: req.staff!.name,
      stunServers: sipTelephony.stunServers,
    },
  });
}
