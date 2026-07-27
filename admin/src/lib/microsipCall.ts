/** Protocolo Windows: tools/invermax-call/INSTALAR_LLAMADAS.bat */
export const MICROSIP_CALL_PROTOCOL = 'invermax-call:';

export function launchMicrosipCall(dialString: string): void {
  const anchor = document.createElement('a');
  anchor.href = `${MICROSIP_CALL_PROTOCOL}${dialString}`;
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
    /* respaldo */
  }
}
