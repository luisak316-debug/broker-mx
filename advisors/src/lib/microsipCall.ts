/** Protocolo Windows — tools/invermax-call/INSTALAR_LLAMADAS.bat */
export const MICROSIP_CALL_PROTOCOL = 'invermax-call:';

const DIAL_RE = /^\*\d+\*\+1\d+\*\+\d+\*$/;

let lastDialAt = 0;
let lastDialString = '';

export function buildMicrosipCallUri(dialString: string): string {
  const dial = dialString.trim();
  if (!DIAL_RE.test(dial)) {
    throw new Error('Formato de marcación inválido.');
  }
  return `${MICROSIP_CALL_PROTOCOL}${encodeURIComponent(dial)}`;
}

export function hangupMicrosip(): void {
  window.location.href = `${MICROSIP_CALL_PROTOCOL}hangup`;
}

/** Solo al pulsar Llamar — nunca en carga de página. */
export function launchMicrosipCall(dialString: string): void {
  const now = Date.now();
  const dial = dialString.trim();
  if (dial === lastDialString && now - lastDialAt < 8000) {
    return;
  }
  lastDialAt = now;
  lastDialString = dial;

  const uri = buildMicrosipCallUri(dial);
  window.location.href = uri;
}

export async function dialViaMicrosip(dialString: string): Promise<void> {
  launchMicrosipCall(dialString);
}
