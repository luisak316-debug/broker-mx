import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useClientAuth } from '../auth/ClientAuthContext';
import { AuthField, AuthShell } from '../components/auth/AuthShell';
import { CountryPhoneFields } from '../components/auth/CountryPhoneFields';
import { TermsAcceptance } from '../components/auth/TermsAcceptance';
import { PasswordField } from '../components/common/PasswordField';
import {
  formatNationalPhone,
  getLatamCountry,
  isValidNationalPhone,
} from '../data/latamCountries';
import { fireCelebrationConfetti } from '../lib/celebrationConfetti';

interface Errors {
  fullName?: string;
  phone?: string;
  otpCode?: string;
  password?: string;
  terms?: string;
}

export function Register() {
  const { register } = useClientAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [countryCode, setCountryCode] = useState('MX');
  const [form, setForm] = useState({ fullName: '', phone: '', otpCode: '', password: '' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
    const country = getLatamCountry(countryCode);
    const e: Errors = {};
    if (!isValidNationalPhone(country, form.phone.trim())) {
      e.phone = `Ingresa un celular válido para ${country.name}.`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateRegister(): boolean {
    const country = getLatamCountry(countryCode);
    const e: Errors = {};
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ' .]{3,}$/.test(form.fullName.trim())) {
      e.fullName = 'Ingresa tu nombre completo (solo letras).';
    }
    if (!isValidNationalPhone(country, form.phone.trim())) {
      e.phone = `Ingresa un celular válido para ${country.name}.`;
    }
    if (!/^\d{6}$/.test(form.otpCode.trim())) {
      e.otpCode = 'Ingresa el código de 6 dígitos que recibiste por SMS.';
    }
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      e.password = 'Mínimo 8 caracteres, con letras y números.';
    }
    if (!acceptedTerms) {
      e.terms = 'Debes aceptar los Términos y Condiciones para crear tu cuenta.';
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
      const res = await api.sendOtp({ countryCode, phone: form.phone.trim() });
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
      const res = await api.sendOtp({ countryCode, phone: form.phone.trim() });
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
        countryCode,
        phone: form.phone.trim(),
        otpCode: form.otpCode.trim(),
        password: form.password,
        acceptedTerms: true,
      });
      fireCelebrationConfetti({ intensity: 'celebration' });
      window.setTimeout(() => navigate('/app', { replace: true }), 1100);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    } finally {
      setBusy(false);
    }
  }

  const country = getLatamCountry(countryCode);

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle={
        step === 'phone'
          ? 'Regístrate con tu celular. Disponible en toda Latinoamérica.'
          : 'Ingresa el código SMS, completa tus datos y acepta los términos.'
      }
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-link">
            Inicia sesión
          </Link>
        </>
      }
    >
      {step === 'phone' ? (
        <form onSubmit={onSendCode} className="space-y-4" noValidate>
          <CountryPhoneFields
            countryCode={countryCode}
            phone={form.phone}
            onCountryChange={setCountryCode}
            onPhoneChange={(v) => setForm({ ...form, phone: v })}
            phoneError={errors.phone}
            disabled={busy}
          />

          {serverError && (
            <p className="rounded-lg bg-bear/15 px-3 py-2 text-sm text-bear">{serverError}</p>
          )}

          <button type="submit" className="auth-btn-primary" disabled={busy}>
            {busy ? 'Enviando código…' : 'Enviar código de verificación'}
          </button>
        </form>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="auth-phone-badge">
            {country.flag} {formatNationalPhone(countryCode, form.phone)}
            <span className="mx-2 text-emerald-200/30">·</span>
            <span className="text-emerald-200/55">{country.currency}</span>
            <button
              type="button"
              className="auth-link ml-2 text-sm"
              onClick={() => {
                setStep('phone');
                setForm({ ...form, otpCode: '' });
                setInfo(null);
                setDebugCode(null);
                setServerError(null);
                setAcceptedTerms(false);
                setErrors({});
              }}
            >
              Cambiar
            </button>
          </div>

          {info && <p className="auth-info">{info}</p>}
          {debugCode && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Modo desarrollo — código SMS: <strong className="tracking-widest">{debugCode}</strong>
            </p>
          )}

          <AuthField
            label="Código de verificación (6 dígitos)"
            type="text"
            inputMode="numeric"
            value={form.otpCode}
            onChange={(v) => setForm({ ...form, otpCode: v.replace(/\D/g, '').slice(0, 6) })}
            error={errors.otpCode}
            placeholder="123456"
            autoComplete="one-time-code"
          />

          <AuthField
            label="Nombre completo"
            value={form.fullName}
            onChange={(v) => setForm({ ...form, fullName: v })}
            error={errors.fullName}
            placeholder="Ej. María Fernanda López"
            autoComplete="name"
          />
          <PasswordField
            label="Contraseña segura"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            error={errors.password}
            placeholder="Mínimo 8 caracteres, letras y números"
            autoComplete="new-password"
            variant="auth"
          />

          <TermsAcceptance
            checked={acceptedTerms}
            onChange={setAcceptedTerms}
            error={errors.terms}
            disabled={busy}
          />

          {serverError && (
            <p className="rounded-lg bg-bear/15 px-3 py-2 text-sm text-bear">{serverError}</p>
          )}

          <button type="submit" className="auth-btn-primary" disabled={busy || !acceptedTerms}>
            {busy ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>

          <button
            type="button"
            className="w-full text-sm text-emerald-200/55 hover:text-emerald-50 disabled:opacity-50"
            disabled={busy || resendIn > 0}
            onClick={onResend}
          >
            {resendIn > 0 ? `Reenviar código en ${resendIn}s` : 'Reenviar código SMS'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
