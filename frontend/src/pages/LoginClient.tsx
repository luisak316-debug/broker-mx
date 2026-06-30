import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { wakeApi } from '../api/client';
import { useClientAuth } from '../auth/ClientAuthContext';
import { PasswordField } from '../components/common/PasswordField';
import { AuthShell } from './Register';

export function LoginClient() {
  const { login } = useClientAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    wakeApi();
  }, []);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setError(null);
    setStatus(null);
    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Ingresa tu celular de 10 dígitos.');
      return;
    }
    setBusy(true);
    wakeApi();
    statusTimerRef.current = setTimeout(() => {
      setStatus('Conectando con el servidor…');
    }, 2500);
    const slowTimer = setTimeout(() => {
      setStatus('El servidor está despertando. Esto puede tardar hasta 30 segundos…');
    }, 12_000);

    try {
      await login({ phone: phone.trim(), password });
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      clearTimeout(slowTimer);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      setBusy(false);
      setStatus(null);
    }
  }

  return (
    <AuthShell
      title="Inicia sesión"
      subtitle="Accede con tu número de celular y contraseña."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="text-brand-400 hover:underline">
            Crear cuenta
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
        <PasswordField
          label="Contraseña"
          value={password}
          onChange={setPassword}
          placeholder="Tu contraseña"
          autoComplete="current-password"
        />

        <p className="text-right text-sm">
          <Link to="/recuperar" className="text-brand-400 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>

        {status && (
          <p className="rounded-lg bg-brand-600/15 px-3 py-2 text-sm text-brand-100">{status}</p>
        )}
        {error && <p className="rounded-lg bg-bear/15 px-3 py-2 text-sm text-bear">{error}</p>}

        <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
          {busy ? 'Conectando…' : 'Iniciar sesión'}
        </button>
      </form>
    </AuthShell>
  );
}
