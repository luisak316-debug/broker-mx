import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PortalAtmosphere } from './PortalAtmosphere';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="portal-page auth-page relative min-h-screen">
      <PortalAtmosphere />
      <div className="portal-shell relative z-10 grid min-h-screen lg:grid-cols-2">
        <aside className="auth-page__hero hidden flex-col justify-between p-10 lg:flex">
          <Link to="/" className="flex items-center gap-3">
            <span className="portal-brand-mark grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-900 font-bold text-white">
              B
            </span>
            <span className="portal-title text-lg font-semibold">Broker.mx</span>
          </Link>
          <div>
            <h2 className="portal-title text-3xl font-bold leading-tight">
              Construye la libertad financiera que tu familia merece.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-emerald-100/75">
              Acceso a Bolsa, Materias Primas, Forex y Cripto, con asesoría profesional en toda
              Latinoamérica.
            </p>
          </div>
          <p className="text-xs text-emerald-200/45">Intermediación financiera profesional.</p>
        </aside>

        <div className="flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="auth-link mb-6 inline-flex items-center gap-2 text-sm lg:hidden"
            >
              ← Volver al inicio
            </Link>
            <div className="auth-card landing-glass-emerald rounded-2xl p-6 sm:p-8">
              <h1 className="portal-title text-2xl font-bold">{title}</h1>
              <p className="mt-2 text-sm text-emerald-100/70">{subtitle}</p>
              <div className="mt-6">{children}</div>
            </div>
            <p className="auth-footer mt-6 text-center text-sm">{footer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  value,
  onChange,
  error,
  type = 'text',
  inputMode,
  placeholder,
  autoComplete,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  inputMode?: 'numeric' | 'text' | 'tel' | 'email';
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="auth-label mb-1 block text-sm">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`auth-field ${error ? 'auth-field--error' : ''}`}
      />
      {hint && !error && <span className="mt-1 block text-xs text-emerald-200/45">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-bear">{error}</span>}
    </label>
  );
}
