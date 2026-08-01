import type { TelephonyConfig } from './types';

export function isMicrosipCallMode(config: TelephonyConfig): boolean {
  if (config.callMode === 'webrtc') return false;
  if (config.callMode === 'microsip') return true;
  return /Windows/i.test(navigator.userAgent);
}
