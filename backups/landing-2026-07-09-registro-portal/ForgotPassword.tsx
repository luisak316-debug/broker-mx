import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { CountryPhoneFields } from '../components/auth/CountryPhoneFields';
import { PasswordField } from '../components/common/PasswordField';
import { getLatamCountry, isValidNationalPhone } from '../data/latamCountries';
import { AuthField, AuthShell } from '../components/auth/AuthShell';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'reset' | 'success'>('phone');
  const [countryCode, setCountryCode] = useState('MX');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (step === 'success') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  async function onSendCode(ev: FormEvent) {
    ev.preventDefault();
    setError(null);
    setInfo(null);
    setDebugCode(null);
    setPhoneError(null);
    const country = getLatamCountry(countryCode);
    if (!isValidNationalPhone(country, phone.trim())) {
      setPhoneError(`Ingresa un celular válido para ${country.name}.`);
      return;
    }
    setBusy(true);
    try {
      const res = await api.sendRecoveryOtp({ countryCode, phone: phone.trim() });
      setStep('reset');
      setResendIn(60);
      setInfo(`Enviamos un código al celular terminado en ${res.maskedPhone}.`);
      if (res.debugCode) setDebugCode(res.debugCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el código.');
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    if (resendIn > 0) return;
    setError(null);
    setBusy(true);
    try {
      const res = await api.sendRecoveryOtp({ countryCode, phone: phone.trim() });
      setResendIn(60);
      setInfo(`Nuevo código enviado al celular terminado en ${res.maskedPhone}.`);
      if (res.debugCode) setDebugCode(res.debugCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reenviar el código.');
    } finally {
      setBusy(false);
    }
  }

  async function onReset(ev: FormEvent) {
    ev.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setError('Ingresa el código de 6 dígitos.');
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, con letras y números.');
      return;
    }
    setBusy(true);
    try {
      await api.resetPassword({
        countryCode,
        phone: phone.trim(),
        otpCode: otpCode.trim(),
        password,
      });
      setError(null);
      setInfo(null);
      setOtpCode('');
      setPassword('');
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo restablecer la contraseña.');
    } finally {
      setBusy(false);
    }
  }

  const maskedPhone = phone.length >= 4 ? `***${phone.slice(-4)}` : '';

  return (
    <>
      {step === 'success' && (
        <div
          className="fixed inset-x-0 top-0 z-50 animate-[fadeIn_0.35s_ease-out] border-b border-bull/30 bg-bull px-4 py-3 text-center shadow-lg"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm font-semibold text-white sm:text-base">
            ✓ Acceso recuperado con éxito — ya puedes iniciar sesión
          </p>
        </div>
      )}

      <AuthShell
        title={step === 'success' ? 'Acceso restablecido' : 'Recuperar contraseña'}
        subtitle={
          step === 'phone'
            ? 'Te enviaremos un código SMS al celular registrado en tu cuenta.'
            : step === 'reset'
              ? 'Ingresa el código y elige una nueva contraseña.'
              : 'Tu acceso quedó restablecido de forma segura.'
        }
        footer={
          step === 'success' ? (
            <span className="text-emerald-200/55">Tu sesión anterior ya no es válida con la contraseña anterior.</span>
          ) : (
            <>
              <Link to="/login" className="auth-link">
                Volver a iniciar sesión
              </Link>
            </>
          )
        }
      >
        {step === 'success' ? (
          <div
            className="animate-[fadeIn_0.4s_ease-out] space-y-6 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-bull/20 ring-2 ring-bull/50">
              <svg
                className="h-10 w-10 text-bull"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-3">
              <p className="text-xl font-bold text-white">¡Acceso recuperado con éxito!</p>
              <p className="text-sm leading-relaxed text-slate-300">
                Tu acceso ha sido restablecido correctamente
                {maskedPhone ? (
                  <>
                    {' '}
                    para la cuenta del celular{' '}
                    <span className="font-semibold text-white">{maskedPhone}</span>
                  </>
                ) : null}
                . Inicia sesión con tu nueva contraseña en Broker.mx.
              </p>
            </div>

            <div className="rounded-xl border border-bull/30 bg-bull/10 px-4 py-4 text-left text-sm">
              <p className="font-semibold text-bull">Acceso restablecido</p>
              <p className="mt-2 text-slate-300">
                Por seguridad, no compartas tu contraseña. Si no solicitaste este cambio, contacta de inmediato a tu
                asesor de inversiones.
              </p>
            </div>

            <button
              type="button"
              className="auth-btn-primary text-base"
              onClick={() =>
                navigate('/login', { replace: true, state: { phone: phone.trim(), countryCode } })
              }
            >
              Ir a iniciar sesión
            </button>
          </div>
        ) : step === 'phone' ? (
          <form onSubmit={onSendCode} className="space-y-4" noValidate>
            <CountryPhoneFields
              countryCode={countryCode}
              phone={phone}
              onCountryChange={setCountryCode}
              onPhoneChange={setPhone}
              phoneError={phoneError ?? undefined}
              disabled={busy}
            />
            {error && <p className="rounded-lg bg-bear/15 px-3 py-2 text-sm text-bear">{error}</p>}
            <button type="submit" className="auth-btn-primary" disabled={busy}>
              {busy ? 'Enviando…' : 'Enviar código SMS'}
            </button>
          </form>
        ) : (
          <form onSubmit={onReset} className="space-y-4" noValidate autoComplete="off">
            <AuthField
              label="Código SMS (6 dígitos)"
              type="text"
              inputMode="numeric"
              value={otpCode}
              onChange={(v) => setOtpCode(v.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              autoComplete="one-time-code"
            />
            <PasswordField
              label="Nueva contraseña"
              value={password}
              onChange={setPassword}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              variant="auth"
            />
            {info && <p className="auth-info">{info}</p>}
            {debugCode && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                Modo demo — código: <strong>{debugCode}</strong>
              </p>
            )}
            {error && <p className="rounded-lg bg-bear/15 px-3 py-2 text-sm text-bear">{error}</p>}
            <button type="submit" className="auth-btn-primary" disabled={busy}>
              {busy ? 'Guardando…' : 'Restablecer contraseña'}
            </button>
            <button
              type="button"
              className="w-full text-sm text-emerald-200/55 hover:text-emerald-50 disabled:opacity-50"
              disabled={busy || resendIn > 0}
              onClick={onResend}
            >
              {resendIn > 0 ? `Reenviar código en ${resendIn}s` : 'Reenviar código'}
            </button>
          </form>
        )}
      </AuthShell>
    </>
  );
}
