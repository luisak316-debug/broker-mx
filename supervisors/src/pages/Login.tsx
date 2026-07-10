import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { PortalAtmosphere } from '../components/portal/PortalAtmosphere';

export function Login() {
  const { staff, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('supervisor@brokermx.com');
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
          <div className="portal-brand-mark mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-xl font-bold text-white">
            S
          </div>
          <h1 className="portal-title text-xl font-bold">Supervisores</h1>
          <p className="text-sm text-emerald-200/60">Gestión de asesores y contactos</p>
        </div>

        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="label">Correo</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Validando…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-emerald-200/45">
          Demo: supervisor@brokermx.com · Admin1234
        </p>
      </div>
    </div>
  );
}
