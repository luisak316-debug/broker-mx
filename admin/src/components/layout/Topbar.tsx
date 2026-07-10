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
    <header className="portal-header portal-glass-emerald--subtle">
      <div className="portal-title text-sm font-semibold">admin</div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-white">{staff?.displayName}</p>
          <p className="text-xs text-emerald-200/70">{staff ? ROLE_LABEL[staff.role] : ''}</p>
        </div>
        <div className="portal-brand-mark grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-700 to-emerald-900 text-sm font-semibold text-white">
          {initials}
        </div>
        <button className="btn-ghost" onClick={logout}>
          Salir
        </button>
      </div>
    </header>
  );
}
