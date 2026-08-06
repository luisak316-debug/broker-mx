import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { PortalAtmosphere } from '../components/portal/PortalAtmosphere';
import { BrandMark } from '../components/brand/BrandMark';
import { PasswordField } from '../components/common/PasswordField';
import { BRAND_NAME } from '../data/brand';

export function Login() {
  const { staff, login } = useAuth();
  const navigate = useNavigate();
  const [access, setAccess] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (staff) return <Navigate to="/" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(access.replace(/\s+/g, ''), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="portal-page grid min-h-screen place-items-center px-4">
      <PortalAtmosphere />
      <div className="portal-shell w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-2.5">
            <BrandMark size="lg" />
            <h1 className="portal-title text-xl font-bold">{BRAND_NAME}</h1>
          </div>
          <p className="text-sm text-slate-400">Portal de asesores · contactos y llamadas</p>
        </div>

        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="label">Acceso</label>
            <input
              type="text"
              inputMode="numeric"
              className="input font-mono"
              value={access}
              onChange={(e) => setAccess(e.target.value.replace(/\D/g, '').slice(0, 24))}
              placeholder="Tu número de acceso (único)"
              autoComplete="username"
              required
            />
          </div>
          <PasswordField
            label="Contraseña"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
          />
          {error && <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Validando…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Usa el acceso y contraseña que te asignó supervisión.
        </p>
      </div>
    </div>
  );
}
