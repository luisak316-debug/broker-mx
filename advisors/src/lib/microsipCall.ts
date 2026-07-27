/** Protocolo Windows registrado con tools/invermax-call/INSTALAR_LLAMADAS.bat */
export const MICROSIP_CALL_PROTOCOL = 'invermax-call:';

export function buildMicrosipCallUri(dialString: string): string {
  return `${MICROSIP_CALL_PROTOCOL}${dialString}`;
}

/**
 * Envía la marcación a MicroSIP (Windows).
 * Requiere ejecutar INSTALAR_LLAMADAS.bat una vez en la laptop del asesor.
 */
export function launchMicrosipCall(dialString: string): void {
  const uri = buildMicrosipCallUri(dialString);
  const anchor = document.createElement('a');
  anchor.href = uri;
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export async function dialViaMicrosip(dialString: string): Promise<void> {
  launchMicrosipCall(dialString);
  try {
    await navigator.clipboard.writeText(dialString);
  } catch {
    /* respaldo silencioso si el portapapeles falla */
  }
}
