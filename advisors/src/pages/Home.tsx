import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../components/ui/Card';
import { fmtDate, isoDate } from '../lib/format';

export function Home() {
  const { staff } = useAuth();
  const today = isoDate(new Date());
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    const [year, month, day] = today.split('-').map(Number);
    return api.myContacts({ year, month, day }).then((rows) => setCount(rows.length));
  }, [today]);

  useEffect(() => {
    reload().finally(() => setLoading(false));
    const timer = window.setInterval(() => void reload(), 30_000);
    return () => window.clearInterval(timer);
  }, [reload]);

  const teamLabel = staff?.managerTeamName ?? (staff?.managerTeam ? `Gerencia ${staff.managerTeam}` : 'Sin gerencia asignada');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Hola, {staff?.displayName?.split(' ')[0]}</h1>
        <p className="text-sm text-slate-400">
          {teamLabel} · {fmtDate(today)}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Contactos asignados hoy">
          <p className="text-4xl font-bold text-ok">{loading ? '…' : (count ?? 0)}</p>
          <p className="mt-1 text-xs text-slate-500">
            Prospectos listos para marcar desde MicroSIP
          </p>
        </Card>
        <Card title="Cómo llamar">
          <ol className="list-decimal space-y-2 pl-4 text-sm text-slate-300">
            <li>Abre MicroSIP en tu PC</li>
            <li>Ve a <strong className="text-white">Mis contactos</strong></li>
            <li>Pulsa <strong className="text-emerald-300">Llamar</strong> y pega en MicroSIP</li>
          </ol>
        </Card>
      </div>

      <Card title="Acceso rápido">
        <Link to="/contactos" className="btn-primary inline-flex py-3 px-6">
          Ver mis {count ?? 0} contacto{(count ?? 0) === 1 ? '' : 's'} de hoy
        </Link>
      </Card>
    </div>
  );
}
