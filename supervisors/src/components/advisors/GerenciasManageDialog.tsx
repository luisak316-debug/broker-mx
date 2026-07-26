import type { ManagerTeamRow } from '../../types';

type Props = {
  teams: ManagerTeamRow[];
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onAdd: () => Promise<void>;
  onRemove: (teamId: number) => Promise<void>;
};

export function GerenciasManageDialog({ teams, open, busy, onClose, onAdd, onRemove }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="card w-full max-w-md space-y-4">
        <header>
          <h2 className="text-lg font-semibold text-white">Agregar o quitar gerencias</h2>
          <p className="text-xs text-slate-400">
            Debe quedar al menos una gerencia activa. No se elimina una gerencia con asesores
            asignados.
          </p>
        </header>

        <ul className="space-y-2">
          {teams.map((t) => (
            <li
              key={t.team}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2"
            >
              <div>
                <p className="font-medium text-white">{t.displayName}</p>
                <p className="text-xs text-slate-500">
                  {t.advisorCount} asesor(es)
                </p>
              </div>
              <button
                type="button"
                className="btn-danger text-xs"
                disabled={busy || teams.length <= 1}
                onClick={() => void onRemove(t.team)}
                title={
                  t.advisorCount > 0
                    ? 'Reasigna los asesores antes de eliminar'
                    : 'Eliminar gerencia'
                }
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" disabled={busy} onClick={() => void onAdd()}>
            {busy ? '…' : '+ Agregar gerencia'}
          </button>
          <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
