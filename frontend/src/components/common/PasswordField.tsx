import { useState } from 'react';

export function PasswordField({
  label,
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  variant = 'default',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  variant?: 'default' | 'auth';
}) {
  const [visible, setVisible] = useState(false);
  const inputClass =
    variant === 'auth'
      ? `auth-field pr-10 ${error ? 'auth-field--error' : ''}`
      : `w-full rounded-lg border bg-ink-900 px-3 py-2 pr-10 text-white outline-none transition focus:border-brand-500 ${
          error ? 'border-bear' : 'border-ink-600'
        }`;
  const labelClass = variant === 'auth' ? 'auth-label mb-1 block text-sm' : 'mb-1 block text-sm text-slate-300';

  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-white"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          tabIndex={-1}
        >
          {visible ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && <span className="mt-1 block text-xs text-bear">{error}</span>}
    </label>
  );
}
