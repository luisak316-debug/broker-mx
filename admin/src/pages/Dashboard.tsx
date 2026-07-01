import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../api/client';
import { Card, StatTile } from '../components/ui/Card';
import type { DashboardMetrics } from '../types';
import { CATEGORY_LABEL, fmtMxn } from '../lib/format';

const PIE_COLORS = ['#1f7aff', '#16a34a', '#d97706', '#a855f7'];
const REFRESH_MS = 30_000;

export function Dashboard() {
  const [m, setM] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadMetrics = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const data = await api.metrics();
      setM(data);
      setError(null);
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las métricas.');
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMetrics();
    const timer = window.setInterval(() => void loadMetrics(true), REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void loadMetrics(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [loadMetrics]);

  if (error && !m) return <p className="text-danger">{error}</p>;
  if (!m) return <p className="text-slate-400">Cargando métricas…</p>;

  const advisorData = m.advisors.map((a) => ({
    name: a.name.split(' ')[0],
    fullName: a.name,
    AUM: a.aumMxn,
    clientes: a.clients,
  }));
  const catData = m.byCategory.map((c) => ({
    name: CATEGORY_LABEL[c.category] ?? c.category,
    value: c.volumeMxn,
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Métricas del equipo de asesores activos y la operación diaria.
            {updatedAt && (
              <span className="ml-1 text-slate-500">
                · Actualizado {updatedAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary text-sm"
          disabled={refreshing}
          onClick={() => void loadMetrics()}
        >
          {refreshing ? 'Actualizando…' : 'Actualizar'}
        </button>
      </header>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Clientes" value={m.totalClients} sub="Activos en la firma" />
        <StatTile label="Efectivo total" value={fmtMxn(m.totalCash)} sub="Saldos disponibles" />
        <StatTile label="Total invertido" value={fmtMxn(m.totalInvested)} tone="ok" sub="Capital en mercado" />
        <StatTile
          label="Solicitudes pendientes"
          value={m.pendingRequests}
          tone={m.pendingRequests ? 'warn' : 'default'}
          sub="Depósitos / retiros por revisar"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Rendimiento por asesor (AUM)" className="lg:col-span-2">
          {advisorData.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              No hay asesores activos. Los cambios en Supervisores se reflejan aquí al instante.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={advisorData} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  width={70}
                  tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ background: '#111a2e', border: '1px solid #26324f', borderRadius: 8 }}
                  formatter={(v: number) => fmtMxn(v)}
                  labelFormatter={(label, items) => {
                    const row = items?.[0]?.payload as { fullName?: string; name?: string } | undefined;
                    return row?.fullName ?? String(label);
                  }}
                />
                <Bar dataKey="AUM" fill="#1f7aff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Volumen por categoría">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                {catData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#111a2e', border: '1px solid #26324f', borderRadius: 8 }}
                formatter={(v: number) => fmtMxn(v)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1 text-xs">
            {catData.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {c.name}
                </span>
                <span className="text-slate-400">{fmtMxn(c.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Depósitos aprobados hoy">
        <p className="text-3xl font-bold text-ok">{fmtMxn(m.depositsToday)}</p>
        <p className="text-sm text-slate-400">Suma de depósitos aprobados en la fecha actual.</p>
      </Card>
    </div>
  );
}
