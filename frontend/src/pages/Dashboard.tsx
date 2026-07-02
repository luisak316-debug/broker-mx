import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useClientAuth } from '../auth/ClientAuthContext';
import { useLivePrices } from '../hooks/useLivePrices';
import { StatTile } from '../components/common/Card';
import { Card } from '../components/common/Card';
import { QuoteTable } from '../components/common/QuoteTable';
import type { Instrument, PortfolioSummary } from '../types';
import { fmtMxn } from '../lib/format';

const MODULES = [
  { to: '/app/acciones', title: 'Bolsa de Valores', desc: 'Acciones, gráficos y dividendos', cls: 'stock' },
  { to: '/app/commodities', title: 'Materias Primas', desc: 'Metales, energía y agrícolas', cls: 'commodity' },
  { to: '/app/forex', title: 'Divisas (Forex)', desc: 'Pares contra el peso (MXN)', cls: 'forex' },
  { to: '/app/cripto', title: 'Criptomonedas', desc: 'Mercado 24/7', cls: 'crypto' },
];

export function Dashboard() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const { quotes } = useLivePrices();
  const { client } = useClientAuth();

  useEffect(() => {
    api.instruments().then(setInstruments).catch(() => setInstruments([]));
    if (!client?.id) return;
    api.portfolio(client.id).then(setPortfolio).catch(() => setPortfolio(null));
  }, [client?.id]);

  const featured = instruments
    .filter((i) => ['AAPL', 'XAU', 'USD/MXN', 'BTC'].includes(i.symbol));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-brand-500/30 bg-gradient-to-r from-brand-600/20 to-ink-800 p-5">
        <h1 className="text-2xl font-bold text-white">
          ¡Bienvenido{client ? `, ${client.displayName}` : ''}! 👋
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Tu cuenta está lista. Fondea tu cuenta para comenzar a invertir en las cuatro grandes
          categorías de mercados.
        </p>
        <Link to="/app/fondear" className="btn-primary mt-3 inline-flex">
          Fondear mi cuenta
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white">Resumen de Mercados</h2>
        <p className="text-sm text-slate-400">
          Vista consolidada de las cuatro grandes categorías de inversión.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Saldo disponible"
          value={portfolio ? fmtMxn(portfolio.cashMxn) : client ? fmtMxn(0) : '—'}
          sub="Cuenta en MXN"
        />
        <StatTile
          label="Exposición en mercado"
          value={portfolio ? fmtMxn(portfolio.equityExposureMxn) : '—'}
          sub={`${portfolio?.positions.length ?? 0} posiciones abiertas`}
        />
        <StatTile label="Instrumentos" value={instruments.length} sub="Activos disponibles" />
        <StatTile label="Operación" value="24/7" sub="Cripto siempre activa" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MODULES.map((m) => (
          <Link key={m.to} to={m.to} className="card transition hover:border-brand-500/60 hover:bg-ink-700/60">
            <p className="card-title">{m.title}</p>
            <p className="mt-1 text-sm text-slate-400">{m.desc}</p>
            <p className="mt-3 text-sm text-brand-400">Abrir módulo →</p>
          </Link>
        ))}
      </div>

      <Card title="Destacados del mercado">
        <QuoteTable instruments={featured} quotes={quotes} />
      </Card>
    </div>
  );
}
