import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { fmtMxn, fmtPhone } from '../../lib/format';
import { useClientAuth } from '../../auth/ClientAuthContext';
import { ProfileAvatar } from '../profile/ProfileAvatar';

export function Topbar({ connected }: { connected: boolean }) {
  const [cash, setCash] = useState<number | null>(null);
  const { client, logout, updateProfilePhoto } = useClientAuth();
  const navigate = useNavigate();

  const initials = (client?.displayName ?? 'Cliente')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  useEffect(() => {
    if (!client?.id) return;
    function refresh() {
      api.portfolio(client!.id).then((p) => setCash(p.cashMxn)).catch(() => setCash(null));
    }
    refresh();
    window.addEventListener('brokermx:balance-updated', refresh);
    return () => window.removeEventListener('brokermx:balance-updated', refresh);
  }, [client?.id]);

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
          <p className="text-xs text-slate-400">Saldo disponible</p>
          <p className="text-sm font-semibold text-white">
            {cash !== null ? fmtMxn(cash) : client ? fmtMxn(0) : '—'}
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-white">{client?.displayName ?? 'Cliente'}</p>
          <p className="text-xs text-slate-400">{client?.phone ? fmtPhone(client.phone) : ''}</p>
        </div>
        <ProfileAvatar
          photoUrl={client?.profilePhotoUrl}
          initials={initials}
          onPhotoSaved={updateProfilePhoto}
        />
        <button onClick={onLogout} className="btn-ghost">
          Salir
        </button>
      </div>
    </header>
  );
}
