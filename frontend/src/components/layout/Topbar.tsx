import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { fmtMxn } from '../../lib/format';
import { useClientAuth } from '../../auth/ClientAuthContext';

export function Topbar({ connected }: { connected: boolean }) {
  const [cash, setCash] = useState<number | null>(null);
  const { client, logout } = useClientAuth();
  const navigate = useNavigate();

  const initials = (client?.displayName ?? 'Cliente')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  useEffect(() => {
    api.portfolio().then((p) => setCash(p.cashMxn)).catch(() => setCash(null));
  }, []);

  function onLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <header className="flex items-center justify-between border-b border-ink-600/60 bg-ink-900/60 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span
          className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-bull' : 'bg-bear'}`}
          title={connected ? 'Feed en vivo conectado' : 'Reconectando...'}
        />
        {connected ? 'Datos en tiempo real' : 'Reconectando…'}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-slate-400">Saldo simulado</p>
          <p className="text-sm font-semibold text-white">
            {cash !== null ? fmtMxn(cash) : '—'}
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-white">{client?.displayName ?? 'Cliente'}</p>
          <p className="text-xs text-slate-400">{client?.email ?? ''}</p>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-ink-600 text-sm font-semibold text-white">
          {initials}
        </div>
        <button onClick={onLogout} className="btn-ghost">
          Salir
        </button>
      </div>
    </header>
  );
}
