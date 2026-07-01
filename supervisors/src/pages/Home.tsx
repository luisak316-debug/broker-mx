import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { fmtMxn } from '../lib/format';

const REFRESH_MS = 30_000;

export function Home() {
  const [clients, setClients] = useState<Awaited<ReturnType<typeof api.clients>>>([]);
  const [advisors, setAdvisors] = useState<Awaited<ReturnType<typeof api.advisors>>>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    return Promise.all([api.clients(), api.advisors()]).then(([c, a]) => {
      setClients(c);
      setAdvisors(a);
    });
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
    const timer = window.setInterval(() => void reload(), REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reload();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [reload]);

  const totalInvested = clients.reduce((s, c) => s + c.totalInvestedMxn, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Panel de supervisión</h1>
        <p className="text-sm text-slate-400">
          Vista resumida: clientes, asesores y asignación de contactos para llamadas diarias.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card title="Clientes registrados">
          <p className="text-3xl font-bold text-white">{loading ? '…' : clients.length}</p>
        </Card>
        <Card title="Total invertido (MXN)">
          <p className="text-3xl font-bold text-brand-400">{loading ? '…' : fmtMxn(totalInvested)}</p>
        </Card>
        <Card title="Asesores activos">
          <p className="text-3xl font-bold text-white">{loading ? '…' : advisors.length}</p>
        </Card>
      </div>

      <Card title="Accesos rápidos">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/asignar" className="btn-primary py-3">
            Asignar contactos
          </Link>
          <Link to="/historial" className="btn-ghost py-3">
            Ver historial por fecha
          </Link>
        </div>
      </Card>
    </div>
  );
}
