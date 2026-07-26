import { useEffect, useState, type FormEvent } from 'react';
import type { ManagerTeamRow } from '../../types';

type Props = {
  teams: ManagerTeamRow[];
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSave: (updates: Array<{ id: number; displayName: string }>) => Promise<void>;
};

export function GerenciasRenameDialog({ teams, open, busy, onClose, onSave }: Props) {
  const [names, setNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open) {
      setNames(Object.fromEntries(teams.map((t) => [t.team, t.displayName])));
    }
  }, [open, teams]);

  if (!open) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    await onSave(
      teams.map((t) => ({
        id: t.team,
        displayName: names[t.team]?.trim() || t.displayName,
      })),
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="card w-full max-w-md space-y-4">
        <header>
          <h2 className="text-lg font-semibold text-white">Renombrar gerencias</h2>
          <p className="text-xs text-slate-400">
            Ejemplo: Los Tiburones, Los Tigres, Los Chapulines, Los Leones…
          </p>
        </header>
        <form onSubmit={submit} className="space-y-3">
          {teams.map((t) => (
            <div key={t.team}>
              <label className="label">Gerencia {t.team}</label>
              <input
                className="input"
                value={names[t.team] ?? ''}
                onChange={(e) => setNames({ ...names, [t.team]: e.target.value })}
                required
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Guardando…' : 'Guardar nombres'}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
