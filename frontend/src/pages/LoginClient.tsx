import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { wakeApi } from '../api/client';
import { useClientAuth } from '../auth/ClientAuthContext';
import { CountryPhoneFields } from '../components/auth/CountryPhoneFields';
import { PasswordField } from '../components/common/PasswordField';
import { getLatamCountry, isValidNationalPhone } from '../data/latamCountries';
import { AuthShell } from '../components/auth/AuthShell';

export function LoginClient() {
  const { login } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [countryCode, setCountryCode] = useState('MX');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recoveryApplied = useRef(false);

  useEffect(() => {
    wakeApi();
  }, []);

  useEffect(() => {
    if (recoveryApplied.current) return;
    const state = location.state as { phone?: string; countryCode?: string } | null;
    const fromRecovery = state?.phone?.trim();
    if (!fromRecovery) return;
    recoveryApplied.current = true;
    setCountryCode(state?.countryCode?.toUpperCase() ?? 'MX');
    setPhone(fromRecovery.replace(/\D/g, ''));
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setError(null);
    setPhoneError(null);
    setStatus(null);
    const country = getLatamCountry(countryCode);
    if (!isValidNationalPhone(country, phone.trim())) {
      setPhoneError(`Ingresa un celular válido para ${country.name}.`);
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
      await login({ countryCode, phone: phone.trim(), password });
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
      subtitle="Accede con tu país, número de celular y contraseña."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="auth-link">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <CountryPhoneFields
          countryCode={countryCode}
          phone={phone}
          onCountryChange={setCountryCode}
          onPhoneChange={setPhone}
          phoneError={phoneError ?? undefined}
          disabled={busy}
        />
        <PasswordField
          label="Contraseña"
          value={password}
          onChange={setPassword}
          placeholder="Tu contraseña"
          autoComplete="current-password"
          variant="auth"
        />
        <div className="text-right">
          <Link to="/recuperar" className="auth-link text-sm">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        {status && <p className="text-sm text-slate-400">{status}</p>}
        {error && <p className="rounded-lg bg-bear/15 px-3 py-2 text-sm text-bear">{error}</p>}
        <button type="submit" className="auth-btn-primary" disabled={busy}>
          {busy ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
    </AuthShell>
  );
}
