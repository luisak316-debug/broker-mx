import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { fmtDate, isoDate } from '../lib/format';
import type { AdvisorRow, ContactRow } from '../types';

export function AssignContactsPage() {
  const [advisors, setAdvisors] = useState<AdvisorRow[]>([]);
  const [todayRows, setTodayRows] = useState<ContactRow[]>([]);
  const [form, setForm] = useState({
    advisorId: '',
    clientName: '',
    phone: '',
    email: '',
    description: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const today = isoDate(new Date());

  function reloadToday(advisorId?: string) {
    const d = new Date();
    api
      .contacts({
        advisorId: advisorId || undefined,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
      })
      .then(setTodayRows);
  }

  useEffect(() => {
    api.advisors().then((list) => {
      setAdvisors(list);
      if (list[0]) setForm((f) => ({ ...f, advisorId: f.advisorId || list[0].id }));
    });
    reloadToday();
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(null);
    if (!form.advisorId) {
      setError('Selecciona un asesor.');
      return;
    }
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      setError('Teléfono de 10 dígitos.');
      return;
    }
    setBusy(true);
    try {
      await api.saveContact({
        advisorId: form.advisorId,
        clientName: form.clientName,
        phone: form.phone.replace(/\D/g, '').slice(-10),
        email: form.email,
        description: form.description,
        assignedDate: today,
      });
      setSaved('Contacto guardado y asignado al asesor.');
      setForm((f) => ({ ...f, clientName: '', phone: '', email: '', description: '' }));
      reloadToday(form.advisorId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  }

  const advisorName = advisors.find((a) => a.id === form.advisorId)?.displayName;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Asignar contactos</h1>
        <p className="text-sm text-slate-400">
          Reparte prospectos a tus asesores para sus llamadas del día ({fmtDate(today)}).
        </p>
      </header>

      <Card title="Nuevo contacto">
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="label">Asesor</label>
            <select
              className="input max-w-md"
              value={form.advisorId}
              onChange={(e) => {
                setForm({ ...form, advisorId: e.target.value });
                reloadToday(e.target.value);
              }}
              required
            >
              <option value="">Seleccionar…</option>
              {advisors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nombre del cliente</label>
              <input
                className="input"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                placeholder="Ej. Carlos Méndez"
                required
              />
            </div>
            <div>
              <label className="label">Teléfono (10 dígitos)</label>
              <input
                className="input"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="5512345678"
                required
              />
            </div>
            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="cliente@correo.com"
              />
            </div>
          </div>

          <div>
            <label className="label">Descripción / notas para el asesor</label>
            <textarea
              className="input min-h-[88px] resize-y"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ej. Quiere invertir en petróleo. Muy interesado, pedir que le llame hoy."
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
          {saved && (
            <p className="rounded-lg bg-ok/15 px-3 py-2 text-sm text-ok">{saved}</p>
          )}

          <button type="submit" className="btn-primary w-full py-3 text-base sm:w-auto sm:px-8" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar contacto'}
          </button>
        </form>
      </Card>

      {form.advisorId && (
        <Card title={`Contactos de hoy — ${advisorName ?? 'Asesor'}`}>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {todayRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Sin contactos asignados hoy.
                    </td>
                  </tr>
                ) : (
                  todayRows.map((c) => (
                    <tr key={c.id}>
                      <td className="font-medium text-white">{c.clientName}</td>
                      <td>{c.phone}</td>
                      <td>{c.email || '—'}</td>
                      <td className="max-w-xs text-slate-300">{c.description || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
