/** MicroSIP / proveedor SIP — marcación saliente desde admin. */

/** Código entre asteriscos (ej. *8088*). */
export const MICROSIP_DIAL_PREFIX = process.env.MICROSIP_DIAL_PREFIX?.trim() || '8088';

/** Línea emisora (E.164), ej. +522293398127. */
export const TELEPHONY_EMITTER_E164 =
  process.env.TELEPHONY_EMITTER_E164?.trim() || '+522293398127';

/** Ruta local del softphone en PC de asesores (solo documentación / scripts). */
export const MICROSIP_EXE_PATH =
  process.env.MICROSIP_EXE_PATH?.trim() ||
  'C:\\Users\\H23 BRT\\TRADING\\tools\\MicroSIP\\MicroSIP.exe';
