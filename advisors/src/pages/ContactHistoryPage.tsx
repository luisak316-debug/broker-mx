import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useCall } from '../call/CallContext';
import { Card } from '../components/ui/Card';
import {
  clientFirstName,
  fmtDate,
  fmtDateTime,
  isoDate,
  shiftDays,
} from '../lib/format';
import {
  groupContactsByPeriod,
  summarizeHistory,
  type HistorySection,
} from '../lib/contactHistoryGroups';
import type { ContactHistoryContact } from '../types';

type YearFilter = 'all' | number;

function HistorySectionBlock({
  section,
  todayIso,
  phoneReady,
  callingId,
  onCall,
  defaultOpen,
}: {
  section: HistorySection;
  todayIso: string;
  phoneReady: boolean;
  callingId: string | null;
  onCall: (id: string, name: string) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="history-section">
      <button
        type="button"
        className="history-section-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="text-left">
          <h3 className="text-base font-semibold text-white">{section.label}</h3>
          {section.hint && <p className="text-xs text-slate-500">{section.hint}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="history-section-count">{section.contacts.length}</span>
          <span className="text-slate-500">{open ? '▾' : '▸'}</span>
        </div>
      </button>

      {open && (
        <div className="history-section-body">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Notas</th>
                  <th>Asignado por</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {section.contacts.map((c) => {
                  const isToday = c.assignedDate === todayIso;
                  return (
                    <tr key={c.id}>
                      <td className="whitespace-nowrap text-slate-300">
                        <div>{fmtDate(c.assignedDate)}</div>
                        {c.createdAt && (
                          <div className="text-[11px] text-slate-500">{fmtDateTime(c.createdAt)}</div>
                        )}
                      </td>
                      <td className="font-medium text-white" title={c.clientName}>
                        {clientFirstName(c.clientName)}
                      </td>
                      <td className="font-mono text-xs">{c.phone}</td>
                      <td>{c.email || '—'}</td>
                      <td className="max-w-xs truncate text-slate-300" title={c.description}>
                        {c.description || '—'}
                      </td>
                      <td className="text-slate-400">{c.assignedByName || '—'}</td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn-call px-3 py-1.5 text-xs font-semibold"
                          disabled={callingId === c.id || !phoneReady}
                          onClick={() => onCall(c.id, c.clientName)}
                          title={isToday ? 'Llamar' : 'Volver a marcar este contacto'}
                        >
                          {callingId === c.id ? '…' : isToday ? 'Llamar' : 'Volver a llamar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export function ContactHistoryPage() {
  const today = isoDate(new Date());
  const { startCall, phoneReady } = useCall();
  const [contacts, setContacts] = useState<ContactHistoryContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<YearFilter>('all');
  const [callingId, setCallingId] = useState<string | null>(null);

  const availableYears = useMemo(() => {
    const current = new Date().getFullYear();
    const years = new Set<number>([current, current - 1, current - 2]);
    for (const c of contacts) {
      years.add(Number(c.assignedDate.slice(0, 4)));
    }
    return [...years].sort((a, b) => b - a);
  }, [contacts]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .myContactHistory(yearFilter === 'all' ? undefined : { year: yearFilter })
      .then((res) => setContacts(res.contacts))
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar el historial.'))
      .finally(() => setLoading(false));
  }, [yearFilter]);

  const sections = useMemo(() => groupContactsByPeriod(contacts), [contacts]);
  const summary = useMemo(() => summarizeHistory(contacts), [contacts]);

  async function onCall(id: string, clientName: string) {
    setCallingId(id);
    setError(null);
    try {
      await startCall(id, clientName);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar la llamada.');
    } finally {
      setCallingId(null);
    }
  }

  function jumpToDay(offset: number) {
    const iso = isoDate(shiftDays(new Date(), offset));
    const match = contacts.filter((c) => c.assignedDate === iso);
    if (match.length === 0) return;
    const el = document.getElementById(`history-section-${offset === 0 ? 'today' : offset === -1 ? 'yesterday' : 'dayBeforeYesterday'}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Historial de contactos</h1>
          <p className="mt-1 text-sm text-slate-400">
            Registro de prospectos asignados a tu línea. Puedes volver a llamar cualquier contacto
            desde aquí.
          </p>
        </div>
        <Link to="/contactos" className="btn-ghost text-sm">
          Ver contactos de hoy →
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="history-stat-card">
          <p className="history-stat-label">Total registrado</p>
          <p className="history-stat-value">{loading ? '…' : summary.total}</p>
        </Card>
        <Card className="history-stat-card">
          <p className="history-stat-label">Hoy</p>
          <p className="history-stat-value text-emerald-300">{loading ? '…' : summary.today}</p>
        </Card>
        <Card className="history-stat-card">
          <p className="history-stat-label">Esta semana</p>
          <p className="history-stat-value">{loading ? '…' : summary.thisWeek}</p>
        </Card>
        <Card className="history-stat-card">
          <p className="history-stat-label">Este mes</p>
          <p className="history-stat-value">{loading ? '…' : summary.thisMonth}</p>
        </Card>
      </div>

      <Card title="Periodo">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`history-chip ${yearFilter === 'all' ? 'history-chip-active' : ''}`}
            onClick={() => setYearFilter('all')}
          >
            Todo el historial
          </button>
          {availableYears.map((y) => (
            <button
              key={y}
              type="button"
              className={`history-chip ${yearFilter === y ? 'history-chip-active' : ''}`}
              onClick={() => setYearFilter(y)}
            >
              {y}
            </button>
          ))}
        </div>

        {yearFilter === 'all' && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
            <span className="text-xs text-slate-500 self-center">Ir a:</span>
            <button type="button" className="btn-ghost text-xs" onClick={() => jumpToDay(0)}>
              Hoy
            </button>
            <button type="button" className="btn-ghost text-xs" onClick={() => jumpToDay(-1)}>
              Ayer
            </button>
            <button type="button" className="btn-ghost text-xs" onClick={() => jumpToDay(-2)}>
              Anteayer
            </button>
          </div>
        )}
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading ? (
        <Card>
          <p className="py-10 text-center text-slate-400">Cargando historial…</p>
        </Card>
      ) : sections.length === 0 ? (
        <Card>
          <p className="py-10 text-center text-slate-400">
            Aún no tienes contactos asignados
            {yearFilter === 'all' ? '' : ` en ${yearFilter}`}.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={section.id}
              id={`history-section-${section.id}`}
            >
              <HistorySectionBlock
                section={section}
                todayIso={today}
                phoneReady={phoneReady}
                callingId={callingId}
                onCall={(id, name) => void onCall(id, name)}
                defaultOpen={index < 3}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
