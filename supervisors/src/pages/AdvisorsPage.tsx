import { Fragment, useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import { AdvisorManagePanel } from '../components/advisors/AdvisorManagePanel';
import { GerenciasManageDialog } from '../components/advisors/GerenciasManageDialog';
import { GerenciasRenameDialog } from '../components/advisors/GerenciasRenameDialog';
import { Card } from '../components/ui/Card';
import { fmtDate } from '../lib/format';
import type { AdvisorRow, ManagerTeamRow } from '../types';

export function AdvisorsPage() {
  const [rows, setRows] = useState<AdvisorRow[]>([]);
  const [teams, setTeams] = useState<ManagerTeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    managerTeam: '',
    phone: '',
    hireDate: '',
  });
  const [busy, setBusy] = useState(false);
  const [manageId, setManageId] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [manageTeamsOpen, setManageTeamsOpen] = useState(false);
  const [teamsBusy, setTeamsBusy] = useState(false);

  const teamLabel = useCallback(
    (teamId: number | null | undefined) => {
      if (!teamId) return '—';
      return teams.find((t) => t.team === teamId)?.displayName ?? `Gerencia ${teamId}`;
    },
    [teams],
  );

  function reloadAdvisors() {
    setLoading(true);
    api
      .advisors()
      .then(setRows)
      .finally(() => setLoading(false));
  }

  function reloadTeams() {
    return api.managers().then(setTeams);
  }

  function reloadAll() {
    reloadAdvisors();
    void reloadTeams();
  }

  useEffect(() => {
    reloadAll();
    const timer = window.setInterval(reloadAll, 30_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') reloadAll();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setBusy(true);
    try {
      await api.createAdvisor({
        email: form.email,
        displayName: form.displayName,
        password: form.password,
        managerTeam: form.managerTeam ? Number(form.managerTeam) : null,
        phone: form.phone ? form.phone.replace(/\D/g, '').slice(-10) : null,
        hireDate: form.hireDate || null,
      });
      setForm({
        displayName: '',
        email: '',
        password: '',
        managerTeam: '',
        phone: '',
        hireDate: '',
      });
      setOk('Asesor agregado correctamente.');
      reloadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear asesor.');
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(id: string, name: string) {
    if (!confirm(`¿Desactivar al asesor ${name}?`)) return;
    setError(null);
    try {
      await api.removeAdvisor(id);
      setOk('Asesor desactivado.');
      if (manageId === id) setManageId(null);
      reloadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar.');
    }
  }

  async function onSaveRename(updates: Array<{ id: number; displayName: string }>) {
    setTeamsBusy(true);
    setError(null);
    try {
      const next = await api.renameManagerTeams(updates);
      setTeams(next);
      setOk('Nombres de gerencias actualizados.');
      setRenameOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron renombrar las gerencias.');
    } finally {
      setTeamsBusy(false);
    }
  }

  async function onAddTeam() {
    setTeamsBusy(true);
    setError(null);
    try {
      const next = await api.addManagerTeam();
      setTeams(next);
      setOk('Gerencia agregada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar la gerencia.');
    } finally {
      setTeamsBusy(false);
    }
  }

  async function onRemoveTeam(teamId: number) {
    const label = teamLabel(teamId);
    if (!confirm(`¿Eliminar la gerencia «${label}»?`)) return;
    setTeamsBusy(true);
    setError(null);
    try {
      const next = await api.removeManagerTeam(teamId);
      setTeams(next);
      setOk('Gerencia eliminada.');
      if (form.managerTeam === String(teamId)) {
        setForm((f) => ({ ...f, managerTeam: '' }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la gerencia.');
    } finally {
      setTeamsBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Asesores</h1>
        <p className="text-sm text-slate-400">
          Control de asesores, gerencias y acceso al portal de llamadas.
        </p>
      </header>

      <Card title="Agregar asesor">
        <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nombre completo</label>
            <input
              className="input"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Correo</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Teléfono (10 dígitos)</label>
            <input
              className="input"
              inputMode="numeric"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
              }
              placeholder="5512345678"
            />
          </div>
          <div>
            <label className="label">Fecha de ingreso</label>
            <input
              type="date"
              className="input"
              value={form.hireDate}
              onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Contraseña inicial</label>
            <input
              type="password"
              className="input max-w-md"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Ej. INVERMAX1997 (misma para todos por ahora)"
              required
            />
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <label className="label mb-0">Equipo de gerencia</label>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  className="btn-ghost px-2 py-1 text-xs"
                  onClick={() => setRenameOpen(true)}
                >
                  Renombrar gerencias
                </button>
                <button
                  type="button"
                  className="btn-ghost px-2 py-1 text-xs"
                  onClick={() => setManageTeamsOpen(true)}
                >
                  + / − gerencias
                </button>
              </div>
            </div>
            <select
              className="input max-w-md"
              value={form.managerTeam}
              onChange={(e) => setForm({ ...form, managerTeam: e.target.value })}
            >
              <option value="">Sin equipo</option>
              {teams.map((t) => (
                <option key={t.team} value={t.team}>
                  {t.displayName}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="sm:col-span-2 text-sm text-danger">{error}</p>}
          {ok && <p className="sm:col-span-2 text-sm text-ok">{ok}</p>}
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary px-6" disabled={busy}>
              {busy ? 'Guardando…' : 'Guardar asesor'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="Asesores activos">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Equipo</th>
                <th>Teléfono</th>
                <th>Ingreso</th>
                <th>Inactividad</th>
                <th>Correo</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Cargando…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No hay asesores. Agrega uno arriba.
                  </td>
                </tr>
              ) : (
                rows.map((a) => (
                  <Fragment key={a.id}>
                    <tr>
                      <td className="font-medium text-white">{a.displayName}</td>
                      <td>{teamLabel(a.managerTeam)}</td>
                      <td className="font-mono">{a.phone ?? '—'}</td>
                      <td>{a.hireDate ? fmtDate(a.hireDate) : '—'}</td>
                      <td>{a.inactiveDate ? fmtDate(a.inactiveDate) : '—'}</td>
                      <td>{a.email}</td>
                      <td className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            className="btn-secondary text-xs"
                            onClick={() => setManageId(manageId === a.id ? null : a.id)}
                          >
                            {manageId === a.id ? 'Ocultar' : 'Gestionar'}
                          </button>
                          <button
                            type="button"
                            className="btn-danger text-xs"
                            onClick={() => onRemove(a.id, a.displayName)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                    {manageId === a.id && (
                      <tr key={`${a.id}-panel`}>
                        <td colSpan={7} className="pb-4 pt-0">
                          <AdvisorManagePanel
                            advisor={a}
                            onUpdated={reloadAll}
                            onClose={() => setManageId(null)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <GerenciasRenameDialog
        teams={teams}
        open={renameOpen}
        busy={teamsBusy}
        onClose={() => setRenameOpen(false)}
        onSave={onSaveRename}
      />
      <GerenciasManageDialog
        teams={teams}
        open={manageTeamsOpen}
        busy={teamsBusy}
        onClose={() => setManageTeamsOpen(false)}
        onAdd={onAddTeam}
        onRemove={onRemoveTeam}
      />
    </div>
  );
}
