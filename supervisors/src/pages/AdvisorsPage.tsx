import { Fragment, useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import { AdvisorManagePanel } from '../components/advisors/AdvisorManagePanel';
import { Card } from '../components/ui/Card';
import { fmtDate } from '../lib/format';
import type { AdvisorRow } from '../types';

export function AdvisorsPage() {
  const [rows, setRows] = useState<AdvisorRow[]>([]);
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

  function reload() {
    setLoading(true);
    api
      .advisors()
      .then(setRows)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
    const timer = window.setInterval(reload, 30_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') reload();
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
      reload();
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
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar.');
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Asesores</h1>
        <p className="text-sm text-slate-400">
          Control de asesores: teléfono actual, historial de números, ingreso e inactividad.
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
              placeholder="Mín. 8 caracteres, letras y números"
              required
            />
          </div>
          <div>
            <label className="label">Equipo de gerencia (1–4)</label>
            <select
              className="input max-w-md"
              value={form.managerTeam}
              onChange={(e) => setForm({ ...form, managerTeam: e.target.value })}
            >
              <option value="">Sin equipo</option>
              <option value="1">Gerencia 1</option>
              <option value="2">Gerencia 2</option>
              <option value="3">Gerencia 3</option>
              <option value="4">Gerencia 4</option>
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
                      <td>{a.managerTeam ? `Gerencia ${a.managerTeam}` : '—'}</td>
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
                            onUpdated={reload}
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
    </div>
  );
}
