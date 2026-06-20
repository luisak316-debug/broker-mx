import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClientAuth } from '../auth/ClientAuthContext';
import { AuthShell } from './Register';

export function LoginClient() {
  const { login } = useClientAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setError(null);
    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Ingresa tu celular de 10 dígitos.');
      return;
    }
    setBusy(true);
    try {
      await login({ phone: phone.trim(), password });
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
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
        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            autoComplete="current-password"
            className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-white outline-none focus:border-brand-500"
            required
          />
        </label>

        {error && <p className="rounded-lg bg-bear/15 px-3 py-2 text-sm text-bear">{error}</p>}

        <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
          {busy ? 'Validando…' : 'Iniciar sesión'}
        </button>
      </form>
    </AuthShell>
  );
}
