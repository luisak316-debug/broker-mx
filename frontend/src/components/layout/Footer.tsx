import { useState } from 'react';
import { BRAND_NAME } from '../../data/brand';

/**
 * Aviso legal y términos — tono profesional, cumplimiento México sin alarmar al cliente.
 */
export function Footer() {
  const [open, setOpen] = useState(false);
  return (
    <footer className="border-t border-ink-600/60 bg-ink-900/80 px-4 py-4 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl space-y-2">
        <p className="font-semibold text-slate-300">Aviso Legal y Términos de Uso</p>
        <p>
          <strong className="text-brand-300">{BRAND_NAME}</strong> es una plataforma de{' '}
          <strong>intermediación financiera profesional</strong> en Latinoamérica. La información y
          cotizaciones que visualiza tienen fines operativos e informativos y no constituyen
          asesoría personalizada de inversión ni recomendación de compra o venta de valores.
        </p>
        {open && (
          <div className="space-y-2 rounded-lg border border-ink-600 bg-ink-800/60 p-3 text-slate-400">
            <p>
              Los mercados financieros —acciones, materias primas, divisas y criptoactivos—
              presentan variaciones naturales en el valor de los instrumentos. En {BRAND_NAME}
              trabajamos con transparencia para que usted opere con claridad sobre su perfil y
              objetivos.
            </p>
            <p>
              Nuestros servicios se prestan conforme al marco regulatorio aplicable en México
              (CNBV, Banco de México, CONDUSEF y normativa fintech vigente), con procesos de
              identificación del cliente (KYC/PLD) y protección de datos personales.
            </p>
            <p>
              Al utilizar esta plataforma usted confirma haber leído y aceptado los{' '}
              <strong>Términos y Condiciones</strong> y el <strong>Aviso de Privacidad</strong>.
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button onClick={() => setOpen((v) => !v)} className="text-brand-400 hover:underline">
            {open ? 'Ocultar información legal' : 'Ver información legal completa'}
          </button>
          <span className="text-slate-600">·</span>
          <span>© {new Date().getFullYear()} {BRAND_NAME} · Intermediación financiera profesional</span>
        </div>
      </div>
    </footer>
  );
}
