import { Fragment, useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import { AdvisorManagePanel } from '../components/advisors/AdvisorManagePanel';
import { GerenciasManageDialog } from '../components/advisors/GerenciasManageDialog';
import { GerenciasRenameDialog } from '../components/advisors/GerenciasRenameDialog';
import { GerenciasWhatsappDialog } from '../components/advisors/GerenciasWhatsappDialog';
import { WipeAllLaptopsDialog } from '../components/advisors/WipeAllLaptopsDialog';
import { Card } from '../components/ui/Card';
import { fmtDate } from '../lib/format';
import type { AdvisorDeviceRow, AdvisorRow, ManagerTeamRow } from '../types';

export function AdvisorsPage() {
  const [rows, setRows] = useState<AdvisorRow[]>([]);
  const [teams, setTeams] = useState<ManagerTeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [form, setForm] = useState({
    displayName: '',
    access: '',
    password: '',
    managerTeam: '',
    phone: '',
    computerId: '',
    hireDate: '',
  });
  const [busy, setBusy] = useState(false);
  const [manageId, setManageId] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [manageTeamsOpen, setManageTeamsOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [wipeAllOpen, setWipeAllOpen] = useState(false);
  const [devices, setDevices] = useState<AdvisorDeviceRow[]>([]);
  const [teamsBusy, setTeamsBusy] = useState(false);
  const [wipeAllBusy, setWipeAllBusy] = useState(false);

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

  function reloadDevices() {
    return api.listDevices().then(setDevices).catch(() => setDevices([]));
  }

  function reloadAll() {
    reloadAdvisors();
    void reloadTeams();
    void reloadDevices();
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
        access: form.access,
        displayName: form.displayName,
        password: form.password,
        managerTeam: form.managerTeam ? Number(form.managerTeam) : null,
        phone: form.phone ? form.phone.replace(/\D/g, '').slice(-10) : null,
        computerId: form.computerId.trim() || null,
        hireDate: form.hireDate || null,
      });
      setForm({
        displayName: '',
        access: '',
        password: '',
        managerTeam: '',
        phone: '',
        computerId: '',
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

  async function onSaveWhatsapp(updates: Array<{ id: number; whatsappNumber: string | null }>) {
    setTeamsBusy(true);
    setError(null);
    try {
      const next = await api.updateManagerWhatsapp(updates);
      setTeams(next);
      setOk('WhatsApp de gerencias actualizado.');
      setWhatsappOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar WhatsApp.');
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

  async function onWipeAllDevices() {
    setWipeAllBusy(true);
    setError(null);
    try {
      const result = await api.wipeAllDevices();
      setOk(
        `Orden masiva enviada: ${result.queued} laptop(s)` +
          (result.skipped.length ? ` · ${result.skipped.length} ya tenían orden pendiente` : ''),
      );
      setWipeAllOpen(false);
      void reloadDevices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el borrado masivo.');
      throw err;
    } finally {
      setWipeAllBusy(false);
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
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Asesores</h1>
          <p className="text-sm text-slate-400">
            Control de asesores, gerencias y acceso al portal de llamadas (solo laptops).
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-900/40"
          onClick={() => setWipeAllOpen(true)}
          disabled={devices.length === 0}
        >
          Resetear todas las laptops ({devices.length})
        </button>
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
            <label className="label">Acceso</label>
            <input
              type="text"
              inputMode="numeric"
              className="input font-mono"
              value={form.access}
              onChange={(e) => setForm({ ...form, access: e.target.value.replace(/\D/g, '') })}
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
                  Renombrar
                </button>
                <button
                  type="button"
                  className="btn-ghost px-2 py-1 text-xs"
                  onClick={() => setWhatsappOpen(true)}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  className="btn-ghost px-2 py-1 text-xs"
                  onClick={() => setManageTeamsOpen(true)}
                >
                  + / −
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
          <div>
            <label className="label">ID laptop / PC</label>
            <input
              className="input max-w-md font-mono uppercase"
              value={form.computerId}
              onChange={(e) => setForm({ ...form, computerId: e.target.value.toUpperCase() })}
              placeholder="LAP-001"
            />
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
                <th>PC</th>
                <th>Teléfono</th>
                <th>Ingreso</th>
                <th>Inactividad</th>
                <th>Acceso</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    Cargando…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No hay asesores. Agrega uno arriba.
                  </td>
                </tr>
              ) : (
                rows.map((a) => (
                  <Fragment key={a.id}>
                    <tr>
                      <td className="font-medium text-white">{a.displayName}</td>
                      <td>{teamLabel(a.managerTeam)}</td>
                      <td className="font-mono text-xs">{a.computerId ?? '—'}</td>
                      <td className="font-mono">{a.phone ?? '—'}</td>
                      <td>{a.hireDate ? fmtDate(a.hireDate) : '—'}</td>
                      <td>{a.inactiveDate ? fmtDate(a.inactiveDate) : '—'}</td>
                      <td className="font-mono text-xs">{a.access}</td>
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
                        <td colSpan={8} className="pb-4 pt-0">
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

      <GerenciasWhatsappDialog
        teams={teams}
        open={whatsappOpen}
        busy={teamsBusy}
        onClose={() => setWhatsappOpen(false)}
        onSave={onSaveWhatsapp}
      />
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
      <WipeAllLaptopsDialog
        open={wipeAllOpen}
        deviceCount={devices.length}
        busy={wipeAllBusy}
        onClose={() => setWipeAllOpen(false)}
        onConfirm={onWipeAllDevices}
      />
    </div>
  );
}
