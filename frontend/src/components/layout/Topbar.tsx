import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { fmtMxn, fmtPhone } from '../../lib/format';
import { getUploadsBase } from '../../lib/apiConfig';
import { useClientAuth } from '../../auth/ClientAuthContext';

function ProfileAvatarDisplay({
  photoUrl,
  initials,
  size = 'md',
}: {
  photoUrl?: string;
  initials: string;
  size?: 'md' | 'lg';
}) {
  const [failed, setFailed] = useState(false);
  const box =
    size === 'lg'
      ? 'h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-base lg:text-lg'
      : 'h-11 w-11 sm:h-12 sm:w-12 text-sm';
  const resolved = photoUrl
    ? photoUrl.startsWith('http')
      ? photoUrl
      : `${getUploadsBase()}${photoUrl}`
    : undefined;

  useEffect(() => setFailed(false), [photoUrl]);

  if (resolved && !failed) {
    return (
      <img
        src={resolved}
        alt="Foto de perfil"
        className={`${box} shrink-0 rounded-full object-cover ring-2 ring-amber-400/50`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={`${box} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400/90 to-brand-600 font-semibold text-white ring-2 ring-amber-400/40`}
    >
      {initials}
    </span>
  );
}

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

  function openProfile() {
    navigate('/app/perfil');
  }

  const balance = cash !== null ? fmtMxn(cash) : client ? fmtMxn(0) : '—';
  const displayName = client?.displayName ?? 'Cliente';
  const phone = client?.phone ? fmtPhone(client.phone) : '';

  const profileButtonClass =
    'flex min-w-0 items-center gap-2.5 rounded-xl border border-transparent text-left transition hover:border-ink-600/50 hover:bg-ink-800/40';

  return (
    <header className="w-full max-w-[100dvw] shrink-0 overflow-hidden border-b border-ink-600/60 bg-ink-900/60 backdrop-blur">
      {/* Móvil */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`inline-block h-2 w-2 shrink-0 rounded-full ${connected ? 'bg-bull' : 'bg-bear'}`}
              title={connected ? 'Datos en vivo' : 'Reconectando'}
            />
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Saldo disponible
              </p>
              <p className="truncate text-sm font-semibold text-white">{balance}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="btn-ghost shrink-0 px-2.5 py-1.5 text-xs"
          >
            Salir
          </button>
        </div>

        <button
          type="button"
          onClick={openProfile}
          className={`${profileButtonClass} w-full border-t border-ink-600/40 px-3 py-2.5`}
          aria-label="Abrir mi perfil"
        >
          <ProfileAvatarDisplay
            photoUrl={client?.profilePhotoUrl}
            initials={initials}
            size="md"
          />
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold leading-tight text-white" title={displayName}>
              {displayName}
            </p>
            {phone ? (
              <p className="truncate text-xs leading-tight text-slate-400">{phone}</p>
            ) : null}
          </div>
        </button>
      </div>

      {/* Escritorio */}
      <div className="hidden items-center justify-between gap-4 px-4 py-3 md:flex">
        <div className="flex min-w-0 items-center gap-2 text-sm text-slate-400">
          <span
            className={`inline-block h-2 w-2 shrink-0 rounded-full ${connected ? 'bg-bull' : 'bg-bear'}`}
            title={connected ? 'Feed en vivo conectado' : 'Reconectando...'}
          />
          {connected ? 'Datos en tiempo real' : 'Reconectando…'}
        </div>
        <div className="flex min-w-0 items-center gap-4">
          <div className="shrink-0 text-right">
            <p className="text-xs text-slate-400">Saldo disponible</p>
            <p className="text-sm font-semibold text-white">{balance}</p>
          </div>
          <button
            type="button"
            onClick={openProfile}
            className={`${profileButtonClass} max-w-xs px-3 py-2 lg:max-w-sm`}
            aria-label="Abrir mi perfil"
          >
            <ProfileAvatarDisplay
              photoUrl={client?.profilePhotoUrl}
              initials={initials}
              size="lg"
            />
            <div className="min-w-0 overflow-hidden text-left">
              <p className="truncate text-base font-semibold text-white lg:text-lg">{displayName}</p>
              {phone ? <p className="truncate text-sm text-slate-300">{phone}</p> : null}
            </div>
          </button>
          <button type="button" onClick={onLogout} className="btn-ghost shrink-0">
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
