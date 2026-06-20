import { useState } from 'react';

/**
 * Botón de copiar al portapapeles con confirmación temporal.
 * Compatible con móvil y escritorio (Clipboard API + respaldo execCommand).
 */
export function CopyButton({
  value,
  label = 'Copiar',
  onCopied,
}: {
  value: string;
  label?: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = value.replace(/\s/g, '');
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
        copied ? 'bg-bull/20 text-bull' : 'bg-ink-600/60 text-slate-200 hover:bg-ink-600'
      }`}
      aria-live="polite"
    >
      {copied ? '✓ ¡Copiado!' : `⧉ ${label}`}
    </button>
  );
}
