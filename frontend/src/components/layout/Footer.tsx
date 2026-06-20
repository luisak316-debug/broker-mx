import { useState } from 'react';

/**
 * Aviso de Riesgo y Términos y Condiciones (sección obligatoria).
 * Cumplimiento México: aclara que se trata de un entorno de simulación /
 * intermediación financiera profesional, no constituye asesoría de inversión.
 */
export function Footer() {
  const [open, setOpen] = useState(false);
  return (
    <footer className="border-t border-ink-600/60 bg-ink-900/80 px-4 py-4 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl space-y-2">
        <p className="font-semibold text-slate-300">
          Aviso de Riesgo y Términos y Condiciones
        </p>
        <p>
          <strong className="text-amber-300">Broker.mx</strong> es un entorno de{' '}
          <strong>simulación e intermediación financiera profesional</strong>. La
          información, cotizaciones y resultados mostrados son{' '}
          <strong>simulados</strong> y no representan operaciones reales ni constituyen
          asesoría de inversión, oferta o recomendación de compra/venta de valores.
        </p>
        {open && (
          <div className="space-y-2 rounded-lg border border-ink-600 bg-ink-800/60 p-3 text-slate-400">
            <p>
              Invertir en instrumentos financieros (acciones, materias primas, divisas y
              criptoactivos) implica <strong>riesgos</strong>, incluida la posible pérdida
              total del capital. El rendimiento pasado no garantiza resultados futuros. Los
              productos apalancados (posiciones cortas/largas con derivados) pueden
              amplificar pérdidas.
            </p>
            <p>
              Los criptoactivos no son moneda de curso legal ni están respaldados por el
              Gobierno Federal ni por el Banco de México. Cualquier servicio real estaría
              sujeto a la regulación aplicable (CNBV, Banxico, Condusef y Ley para Regular
              las Instituciones de Tecnología Financiera — “Ley Fintech”), así como a
              procesos de identificación del cliente (KYC/PLD).
            </p>
            <p>
              Al utilizar esta plataforma usted acepta los Términos y Condiciones y el Aviso
              de Privacidad. Consulte a un asesor certificado antes de tomar decisiones de
              inversión reales.
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button onClick={() => setOpen((v) => !v)} className="text-brand-400 hover:underline">
            {open ? 'Ocultar aviso completo' : 'Leer aviso completo'}
          </button>
          <span className="text-slate-600">·</span>
          <span>© {new Date().getFullYear()} Broker.mx · Simulación educativa</span>
        </div>
      </div>
    </footer>
  );
}
