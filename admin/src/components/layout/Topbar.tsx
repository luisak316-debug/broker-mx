import { useAuth } from '../../auth/AuthContext';
import { ROLE_LABEL } from '../../lib/format';

export function Topbar() {
  const { staff, logout } = useAuth();
  const initials = staff?.displayName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="flex items-center justify-between border-b border-ink-600/60 bg-ink-900/60 px-4 py-3">
      <div className="text-sm text-slate-400">
        Panel de Administración · <span className="text-slate-200">Personal interno</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-white">{staff?.displayName}</p>
          <p className="text-xs text-brand-300">{staff ? ROLE_LABEL[staff.role] : ''}</p>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-ink-600 text-sm font-semibold text-white">
          {initials}
        </div>
        <button className="btn-ghost" onClick={logout}>
          Salir
        </button>
      </div>
    </header>
  );
}
