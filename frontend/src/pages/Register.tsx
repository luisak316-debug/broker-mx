import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useClientAuth } from '../auth/ClientAuthContext';

interface Errors {
  fullName?: string;
  phone?: string;
  otpCode?: string;
  password?: string;
}

export function Register() {
  const { register } = useClientAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [form, setForm] = useState({ fullName: '', phone: '', otpCode: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  function validatePhone(): boolean {
    const e: Errors = {};
    if (!/^\d{10}$/.test(form.phone.trim())) {
      e.phone = 'El teléfono celular debe tener exactamente 10 dígitos.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateRegister(): boolean {
    const e: Errors = {};
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ' .]{3,}$/.test(form.fullName.trim())) {
      e.fullName = 'Ingresa tu nombre completo (solo letras).';
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      e.phone = 'El teléfono celular debe tener exactamente 10 dígitos.';
    }
    if (!/^\d{6}$/.test(form.otpCode.trim())) {
      e.otpCode = 'Ingresa el código de 6 dígitos que recibiste por SMS.';
    }
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      e.password = 'Mínimo 8 caracteres, con letras y números.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSendCode(ev: FormEvent) {
    ev.preventDefault();
    setServerError(null);
    setInfo(null);
    setDebugCode(null);
    if (!validatePhone()) return;
    setBusy(true);
    try {
      const res = await api.sendOtp({ phone: form.phone.trim() });
      setStep('verify');
      setResendIn(60);
      setInfo(`Enviamos un código al celular terminado en ${res.maskedPhone}.`);
      if (res.debugCode) setDebugCode(res.debugCode);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'No se pudo enviar el código.');
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    if (resendIn > 0) return;
    setServerError(null);
    setBusy(true);
    try {
      const res = await api.sendOtp({ phone: form.phone.trim() });
      setResendIn(60);
      setInfo(`Nuevo código enviado al celular terminado en ${res.maskedPhone}.`);
      if (res.debugCode) setDebugCode(res.debugCode);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'No se pudo reenviar el código.');
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setServerError(null);
    if (!validateRegister()) return;
    setBusy(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        otpCode: form.otpCode.trim(),
        password: form.password,
      });
      navigate('/app', { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle={
        step === 'phone'
          ? 'Regístrate con tu número de celular mexicano (10 dígitos).'
          : 'Ingresa el código SMS y completa tus datos.'
      }
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-brand-400 hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      {step === 'phone' ? (
        <form onSubmit={onSendCode} className="space-y-4" noValidate>
          <Field
            label="Teléfono celular (10 dígitos)"
            type="tel"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v.replace(/\D/g, '').slice(0, 10) })}
            error={errors.phone}
            placeholder="5512345678"
            autoComplete="tel"
            hint="Te enviaremos un código de verificación por SMS."
          />

          {serverError && (
            <p className="rounded-lg bg-bear/15 px-3 py-2 text-sm text-bear">{serverError}</p>
          )}

          <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
            {busy ? 'Enviando código…' : 'Enviar código de verificación'}
          </button>
        </form>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="rounded-lg border border-ink-600 bg-ink-900/60 px-3 py-2 text-sm text-slate-300">
            Celular: <span className="font-medium text-white">{form.phone}</span>
            <button
              type="button"
              className="ml-2 text-brand-400 hover:underline"
              onClick={() => {
                setStep('phone');
                setForm({ ...form, otpCode: '' });
                setInfo(null);
                setDebugCode(null);
                setServerError(null);
              }}
            >
              Cambiar
            </button>
          </div>

          {info && <p className="rounded-lg bg-brand-500/10 px-3 py-2 text-sm text-brand-300">{info}</p>}
          {debugCode && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Modo desarrollo — código SMS: <strong className="tracking-widest">{debugCode}</strong>
            </p>
          )}

          <Field
            label="Código de verificación (6 dígitos)"
            type="text"
            inputMode="numeric"
            value={form.otpCode}
            onChange={(v) => setForm({ ...form, otpCode: v.replace(/\D/g, '').slice(0, 6) })}
            error={errors.otpCode}
            placeholder="123456"
            autoComplete="one-time-code"
          />

          <Field
            label="Nombre completo"
            value={form.fullName}
            onChange={(v) => setForm({ ...form, fullName: v })}
            error={errors.fullName}
            placeholder="Ej. María Fernanda López"
            autoComplete="name"
          />
          <Field
            label="Contraseña segura"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            error={errors.password}
            placeholder="Mínimo 8 caracteres, letras y números"
            autoComplete="new-password"
          />

          {serverError && (
            <p className="rounded-lg bg-bear/15 px-3 py-2 text-sm text-bear">{serverError}</p>
          )}

          <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
            {busy ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>

          <button
            type="button"
            className="w-full text-sm text-slate-400 hover:text-white disabled:opacity-50"
            disabled={busy || resendIn > 0}
            onClick={onResend}
          >
            {resendIn > 0 ? `Reenviar código en ${resendIn}s` : 'Reenviar código SMS'}
          </button>

          <p className="text-center text-xs text-slate-500">
            Al registrarte aceptas los Términos y Condiciones y el Aviso de Privacidad.
          </p>
        </form>
      )}
    </AuthShell>
  );
}

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
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 to-ink-900 p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 font-bold text-white">B</span>
          <span className="text-lg font-semibold text-white">Broker.mx</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight text-white">
            Construye la libertad financiera que tu familia merece.
          </h2>
          <p className="mt-4 max-w-md text-white/80">
            Acceso a Bolsa, Materias Primas, Forex y Cripto, con asesoría profesional y respaldo legal
            en México.
          </p>
        </div>
        <p className="text-xs text-white/60">Entorno de simulación / intermediación profesional.</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white lg:hidden">
            ← Volver al inicio
          </Link>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-center text-sm text-slate-400">{footer}</p>
        </div>
      </div>
    </div>
  );
}

function Field({
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
      <span className="mb-1 block text-sm text-slate-300">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full rounded-lg border bg-ink-900 px-3 py-2 text-white outline-none transition focus:border-brand-500 ${
          error ? 'border-bear' : 'border-ink-600'
        }`}
      />
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-bear">{error}</span>}
    </label>
  );
}
