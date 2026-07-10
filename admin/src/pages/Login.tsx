import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { PasswordField } from '../components/common/PasswordField';
import { PortalAtmosphere } from '../components/portal/PortalAtmosphere';

export function Login() {
  const { staff, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@brokermx.com');
  const [password, setPassword] = useState('Admin1234');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (staff) return <Navigate to="/" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
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
          <div className="portal-brand-mark mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-xl font-bold text-white">
            A
          </div>
          <h1 className="portal-title text-xl font-bold">admin</h1>
          <p className="text-sm text-slate-400">Acceso para personal interno</p>
        </div>

        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="label">Correo corporativo</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          {error && (
            <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Validando…' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-4 rounded-lg portal-panel p-3 text-xs text-slate-400">
          <p className="mb-1 font-semibold text-slate-300">Cuentas de demostración (contraseña: Admin1234)</p>
          <ul className="space-y-0.5">
            <li>admin@brokermx.com — Administración</li>
            <li>juan.perez@brokermx.com — Asesor / Trader</li>
            <li>laura.cumplimiento@brokermx.com — Cumplimiento</li>
            <li>soporte@brokermx.com — Soporte (solo lectura)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
