import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { PasswordField } from '../components/common/PasswordField';
import { AuthShell } from './Register';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'reset'>('phone');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function onSendCode(ev: FormEvent) {
    ev.preventDefault();
    setError(null);
    setInfo(null);
    setDebugCode(null);
    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Ingresa tu celular de 10 dígitos.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.sendRecoveryOtp({ phone: phone.trim() });
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
      const res = await api.sendRecoveryOtp({ phone: phone.trim() });
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
      const res = await api.resetPassword({
        phone: phone.trim(),
        otpCode: otpCode.trim(),
        password,
      });
      setInfo(res.message);
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo restablecer la contraseña.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle={
        step === 'phone'
          ? 'Te enviaremos un código SMS al celular registrado en tu cuenta.'
          : 'Ingresa el código y elige una nueva contraseña.'
      }
      footer={
        <>
          <Link to="/login" className="text-brand-400 hover:underline">
            Volver a iniciar sesión
          </Link>
        </>
      }
    >
      {step === 'phone' ? (
        <form onSubmit={onSendCode} className="space-y-4" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Teléfono celular (10 dígitos)</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="5512345678"
              autoComplete="tel"
              className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-white outline-none focus:border-brand-500"
              required
            />
          </label>
          {error && <p className="rounded-lg bg-bear/15 px-3 py-2 text-sm text-bear">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
            {busy ? 'Enviando…' : 'Enviar código SMS'}
          </button>
        </form>
      ) : (
        <form onSubmit={onReset} className="space-y-4" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Código SMS (6 dígitos)</span>
            <input
              type="text"
              inputMode="numeric"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-white outline-none focus:border-brand-500"
              required
            />
          </label>
          <PasswordField
            label="Nueva contraseña"
            value={password}
            onChange={setPassword}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
          />
          {info && <p className="rounded-lg bg-brand-600/15 px-3 py-2 text-sm text-brand-100">{info}</p>}
          {debugCode && (
            <p className="rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-200">
              Modo demo — código: <strong>{debugCode}</strong>
            </p>
          )}
          {error && <p className="rounded-lg bg-bear/15 px-3 py-2 text-sm text-bear">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
            {busy ? 'Guardando…' : 'Restablecer contraseña'}
          </button>
          <button
            type="button"
            className="btn-ghost w-full text-sm text-slate-400"
            disabled={busy || resendIn > 0}
            onClick={onResend}
          >
            {resendIn > 0 ? `Reenviar código en ${resendIn}s` : 'Reenviar código'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
