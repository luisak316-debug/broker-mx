import { useMemo, useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import { Card } from '../ui/Card';
import { parseBulkContacts, previewDistribution } from '../../lib/parseBulkContacts';
import type { AdvisorRow } from '../../types';

const TEAM_IDS = [1, 2, 3, 4] as const;

function teamLabel(team: number): string {
  return `Gerencia ${team}`;
}

type Props = {
  advisors: AdvisorRow[];
  today: string;
  onSaved: () => void;
};

export function ManagerTeamsBulkForm({ advisors, today, onSaved }: Props) {
  const [teamTexts, setTeamTexts] = useState<Record<number, string>>({ 1: '', 2: '', 3: '', 4: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const teamPreviews = useMemo(() => {
    return TEAM_IDS.map((team) => {
      const raw = teamTexts[team] ?? '';
      const parsed = raw.trim() ? parseBulkContacts(raw) : { contacts: [], skippedLines: [] as string[] };
      const teamAdvisors = advisors.filter((a) => a.managerTeam === team);
      const counts = previewDistribution(parsed.contacts.length, teamAdvisors.length);
      return {
        team,
        label: teamLabel(team),
        advisorCount: teamAdvisors.length,
        parsed,
        distribution: teamAdvisors.map((a, i) => ({
          advisorId: a.id,
          advisorName: a.displayName,
          count: counts[i] ?? 0,
        })),
      };
    });
  }, [teamTexts, advisors]);

  const totalContacts = teamPreviews.reduce((s, t) => s + t.parsed.contacts.length, 0);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(null);
    if (totalContacts === 0) {
      setError('Pega contactos en al menos un equipo.');
      return;
    }

    setBusy(true);
    try {
      const result = await api.bulkAssignContactsToManagers({
        assignedDate: today,
        teams: TEAM_IDS.filter((t) => (teamTexts[t] ?? '').trim()).map((team) => ({
          team,
          rawText: teamTexts[team],
        })),
      });

      const parts = result.teams
        .filter((t) => t.saved > 0)
        .map((t) => `Equipo ${t.team}: ${t.saved}`)
        .join(' · ');
      const warnings = result.teams.filter((t) => t.warning).map((t) => t.warning);
      setSaved(
        `${result.saved} contactos asignados por equipos. ${parts}${
          warnings.length ? ` · ${warnings.join(' ')}` : ''
        }`,
      );
      setTeamTexts({ 1: '', 2: '', 3: '', 4: '' });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Asignación por equipos de gerencia">
      <form onSubmit={onSubmit} className="space-y-6">
        <p className="text-sm text-slate-400">
          Pega contactos en cada equipo que quieras cargar hoy. Cada bloque se reparte solo entre los
          asesores de esa gerencia (equipo 1, 2, 3 o 4). Puedes enviar 50 a un equipo y 2 a otro, como
          necesites.
        </p>

        {teamPreviews.map(({ team, label, advisorCount, parsed, distribution }) => (
          <div key={team} className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold text-white">{label}</h3>
              <span className="text-xs text-slate-400">
                {advisorCount} asesor(es) en este equipo
              </span>
            </div>

            <textarea
              className="input min-h-[140px] resize-y font-mono text-sm leading-relaxed"
              value={teamTexts[team]}
              onChange={(e) => setTeamTexts({ ...teamTexts, [team]: e.target.value })}
              placeholder={`Contactos para ${label}… (opcional si no hay lista hoy)`}
            />

            {parsed.contacts.length > 0 && (
              <div className="text-sm text-slate-300">
                <p>
                  <span className="text-white">{parsed.contacts.length}</span> contacto(s) · reparto:{' '}
                  {distribution
                    .filter((d) => d.count > 0)
                    .map((d) => `${d.advisorName}: ${d.count}`)
                    .join(' · ') || 'sin asesores en este equipo'}
                </p>
                {advisorCount === 0 && (
                  <p className="mt-1 text-amber-400">
                    Asigna asesores al equipo {team} en la sección Asesores.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && <p className="rounded-lg bg-ok/15 px-3 py-2 text-sm text-ok">{saved}</p>}

        <button
          type="submit"
          className="btn-primary w-full py-3 text-base sm:w-auto sm:px-8"
          disabled={busy || totalContacts === 0}
        >
          {busy ? 'Asignando por equipos…' : `Asignar ${totalContacts} contacto(s) a los equipos`}
        </button>
      </form>
    </Card>
  );
}
