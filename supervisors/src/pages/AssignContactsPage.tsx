import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { fmtDate, isoDate } from '../lib/format';
import { parseBulkContacts, previewDistribution } from '../lib/parseBulkContacts';
import type { AdvisorRow, ContactRow } from '../types';

type Mode = 'single' | 'bulk';

export function AssignContactsPage() {
  const [mode, setMode] = useState<Mode>('bulk');
  const [advisors, setAdvisors] = useState<AdvisorRow[]>([]);
  const [todayRows, setTodayRows] = useState<ContactRow[]>([]);
  const [form, setForm] = useState({
    advisorId: '',
    clientName: '',
    phone: '',
    email: '',
    description: '',
  });
  const [bulkText, setBulkText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const today = isoDate(new Date());

  const bulkPreview = useMemo(() => {
    if (!bulkText.trim()) {
      return { contacts: [], skippedLines: [] as string[] };
    }
    return parseBulkContacts(bulkText);
  }, [bulkText]);

  const distributionPreview = useMemo(() => {
    const counts = previewDistribution(bulkPreview.contacts.length, advisors.length);
    return advisors.map((advisor, i) => ({
      advisorId: advisor.id,
      advisorName: advisor.displayName,
      count: counts[i] ?? 0,
    }));
  }, [advisors, bulkPreview.contacts.length]);

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

  async function onSaveSingle(e: FormEvent) {
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

  async function onSaveBulk(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(null);

    if (advisors.length === 0) {
      setError('No hay asesores activos. Agrega asesores primero.');
      return;
    }
    if (bulkPreview.contacts.length === 0) {
      setError('No se detectaron contactos válidos. Revisa el formato de tu lista.');
      return;
    }

    setBusy(true);
    try {
      const result = await api.bulkAssignContacts({ rawText: bulkText, assignedDate: today });
      const detail = result.distribution
        .filter((d) => d.count > 0)
        .map((d) => `${d.advisorName}: ${d.count}`)
        .join(' · ');
      const skipped =
        result.skipped > 0 ? ` (${result.skipped} línea(s) omitida(s))` : '';
      setSaved(
        `${result.saved} contactos repartidos entre ${advisors.length} asesores${skipped}. ${detail}`,
      );
      setBulkText('');
      reloadToday();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la asignación masiva.');
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={mode === 'bulk' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => {
            setMode('bulk');
            setError(null);
            setSaved(null);
          }}
        >
          Asignar contactos a asesores
        </button>
        <button
          type="button"
          className={mode === 'single' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => {
            setMode('single');
            setError(null);
            setSaved(null);
          }}
        >
          Un contacto a la vez
        </button>
      </div>

      {mode === 'bulk' ? (
        <Card title="Asignación masiva — pegar desde libreta">
          <form onSubmit={onSaveBulk} className="space-y-4">
            <p className="text-sm text-slate-400">
              Pega todos tus contactos en un solo bloque. El sistema los reparte de forma equitativa
              entre los {advisors.length || '…'} asesores activos.
            </p>
            <p className="rounded-lg bg-slate-800/80 px-3 py-2 text-xs text-slate-400">
              Formato por línea:{' '}
              <span className="text-slate-300">
                +52teléfono &quot;Nombre completo&quot; correo@ejemplo.com &quot;Descripción o notas&quot;
                monto
              </span>
            </p>

            <div>
              <label className="label">Lista de contactos</label>
              <textarea
                className="input min-h-[280px] resize-y font-mono text-sm leading-relaxed"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Pega aquí tus contactos, uno por línea…\n\n+528442984802 "William Alberto Díaz Ayala" diazayala25@hotmail.com "trabajo como comprador de amazon" 400,000`}
              />
            </div>

            {bulkText.trim() && (
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-sm">
                <p className="font-medium text-white">
                  Vista previa: {bulkPreview.contacts.length} contacto(s) detectado(s)
                  {bulkPreview.skippedLines.length > 0 && (
                    <span className="ml-2 text-amber-400">
                      · {bulkPreview.skippedLines.length} línea(s) no reconocida(s)
                    </span>
                  )}
                </p>

                {advisors.length > 0 && bulkPreview.contacts.length > 0 && (
                  <ul className="mt-3 space-y-1 text-slate-300">
                    {distributionPreview.map((d) => (
                      <li key={d.advisorId}>
                        <span className="text-white">{d.advisorName}</span>: {d.count} contacto(s)
                      </li>
                    ))}
                  </ul>
                )}

                {bulkPreview.contacts.length > 0 && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="table-base text-xs">
                      <thead>
                        <tr>
                          <th>Cliente</th>
                          <th>Teléfono</th>
                          <th>Correo</th>
                          <th>Descripción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkPreview.contacts.slice(0, 5).map((c, i) => (
                          <tr key={`${c.phone}-${i}`}>
                            <td className="font-medium text-white">{c.clientName}</td>
                            <td>{c.phone}</td>
                            <td>{c.email}</td>
                            <td className="max-w-xs truncate text-slate-300">{c.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bulkPreview.contacts.length > 5 && (
                      <p className="mt-2 text-xs text-slate-500">
                        … y {bulkPreview.contacts.length - 5} contacto(s) más
                      </p>
                    )}
                  </div>
                )}

                {bulkPreview.skippedLines.length > 0 && (
                  <details className="mt-3 text-xs text-amber-400">
                    <summary>Líneas omitidas (revisa formato)</summary>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      {bulkPreview.skippedLines.slice(0, 5).map((line, i) => (
                        <li key={i} className="break-all text-slate-400">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            {error && <p className="text-sm text-danger">{error}</p>}
            {saved && (
              <p className="rounded-lg bg-ok/15 px-3 py-2 text-sm text-ok">{saved}</p>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3 text-base sm:w-auto sm:px-8"
              disabled={busy || advisors.length === 0 || bulkPreview.contacts.length === 0}
            >
              {busy
                ? 'Repartiendo contactos…'
                : `Repartir ${bulkPreview.contacts.length || ''} contacto(s) entre asesores`}
            </button>
          </form>
        </Card>
      ) : (
        <Card title="Nuevo contacto">
          <form onSubmit={onSaveSingle} className="space-y-4">
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
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                  }
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

            <button
              type="submit"
              className="btn-primary w-full py-3 text-base sm:w-auto sm:px-8"
              disabled={busy}
            >
              {busy ? 'Guardando…' : 'Guardar contacto'}
            </button>
          </form>
        </Card>
      )}

      {mode === 'single' && form.advisorId && (
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
