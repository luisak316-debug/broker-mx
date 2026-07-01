import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../../api/client';
import { fmtDate } from '../../lib/format';
import type { AdvisorPhoneHistoryRow, AdvisorRow } from '../../types';

type Props = {
  advisor: AdvisorRow;
  onUpdated: () => void;
  onClose: () => void;
};

export function AdvisorManagePanel({ advisor, onUpdated, onClose }: Props) {
  const [phone, setPhone] = useState(advisor.phone ?? '');
  const [hireDate, setHireDate] = useState(advisor.hireDate ?? '');
  const [inactiveDate, setInactiveDate] = useState(advisor.inactiveDate ?? '');
  const [history, setHistory] = useState<AdvisorPhoneHistoryRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [busyPhone, setBusyPhone] = useState(false);
  const [busyDates, setBusyDates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    setPhone(advisor.phone ?? '');
    setHireDate(advisor.hireDate ?? '');
    setInactiveDate(advisor.inactiveDate ?? '');
  }, [advisor]);

  useEffect(() => {
    setLoadingHistory(true);
    api
      .advisorPhoneHistory(advisor.id)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [advisor.id, advisor.phone]);

  async function onUpdatePhone(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (!/^\d{10}$/.test(digits)) {
      setError('Teléfono de 10 dígitos.');
      return;
    }
    if (digits === advisor.phone) {
      setError('Ese ya es el teléfono actual.');
      return;
    }
    setBusyPhone(true);
    try {
      await api.updateAdvisorPhone(advisor.id, digits);
      setOk('Teléfono actualizado. El anterior quedó en el historial.');
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el teléfono.');
    } finally {
      setBusyPhone(false);
    }
  }

  async function onUpdateDates(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setBusyDates(true);
    try {
      await api.updateAdvisorDates(advisor.id, {
        hireDate: hireDate || null,
        inactiveDate: inactiveDate || null,
      });
      setOk('Fechas guardadas.');
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar las fechas.');
    } finally {
      setBusyDates(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-white">Control — {advisor.displayName}</h3>
        <button type="button" className="btn-ghost text-xs" onClick={onClose}>
          Cerrar
        </button>
      </div>

      <form onSubmit={onUpdatePhone} className="space-y-3">
        <p className="text-sm font-medium text-slate-300">Teléfono actual</p>
        <div className="flex flex-wrap gap-2">
          <input
            className="input max-w-xs"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="5512345678"
          />
          <button type="submit" className="btn-primary text-sm" disabled={busyPhone}>
            {busyPhone ? 'Guardando…' : 'Actualizar teléfono'}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Al cambiar el número, el teléfono anterior se guarda automáticamente en el historial.
        </p>
      </form>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-300">Historial de teléfonos</p>
        {loadingHistory ? (
          <p className="text-sm text-slate-400">Cargando historial…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-400">Sin números anteriores registrados.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {history.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-md bg-slate-800/80 px-3 py-2"
              >
                <span className="font-mono text-white">{row.phone}</span>
                <span className="text-xs text-slate-400">
                  hasta {fmtDate(row.replacedAt.slice(0, 10))}
                  {row.replacedByName ? ` · por ${row.replacedByName}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={onUpdateDates} className="grid gap-4 sm:grid-cols-2">
        <p className="sm:col-span-2 text-sm font-medium text-slate-300">Fechas de control</p>
        <div>
          <label className="label">Fecha de ingreso</label>
          <input
            type="date"
            className="input"
            value={hireDate}
            onChange={(e) => setHireDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Fecha de inactividad</label>
          <input
            type="date"
            className="input"
            value={inactiveDate}
            onChange={(e) => setInactiveDate(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="btn-secondary text-sm" disabled={busyDates}>
            {busyDates ? 'Guardando…' : 'Guardar fechas'}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-danger">{error}</p>}
      {ok && <p className="text-sm text-ok">{ok}</p>}
    </div>
  );
}
