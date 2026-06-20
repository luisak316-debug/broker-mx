import { EventEmitter } from 'node:events';
import { env } from '../config/env';
import { ALL_INSTRUMENTS, findInstrument } from '../data/instruments';
import type { Candle, Instrument, Quote } from '../types/market';

interface PriceState {
  price: number;
  open: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

/**
 * Motor de mercado simulado.
 *
 * - Mantiene el último precio de cada instrumento.
 * - Aplica un "random walk" acotado por la volatilidad de cada activo.
 * - Emite ticks periódicos consumidos por el WebSocket (feed en tiempo real).
 *
 * En producción esta clase se reemplazaría por un adaptador hacia un proveedor
 * de datos real (REST/WebSocket de un exchange o vendor), conservando la misma
 * interfaz pública (getQuote, getCandles, subscribe).
 */
class MarketDataService {
  private emitter = new EventEmitter();
  private state = new Map<string, PriceState>();
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    for (const inst of ALL_INSTRUMENTS) {
      this.state.set(inst.symbol, {
        price: inst.basePrice,
        open: inst.basePrice,
        high24h: inst.basePrice,
        low24h: inst.basePrice,
        volume24h: Math.round(Math.random() * 1_000_000),
      });
    }
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), env.priceTickMs);
    // No bloquear el cierre del proceso por el intervalo.
    this.timer.unref?.();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private tick(): void {
    const quotes: Quote[] = [];
    for (const inst of ALL_INSTRUMENTS) {
      const s = this.state.get(inst.symbol)!;
      const shock = (Math.random() - 0.5) * 2 * inst.volatility;
      const next = Math.max(0.0001, s.price * (1 + shock));
      s.price = roundFor(inst, next);
      s.high24h = Math.max(s.high24h, s.price);
      s.low24h = Math.min(s.low24h, s.price);
      s.volume24h += Math.round(Math.random() * 5000);
      quotes.push(this.buildQuote(inst, s));
    }
    this.emitter.emit('tick', quotes);
  }

  onTick(listener: (quotes: Quote[]) => void): void {
    this.emitter.on('tick', listener);
  }

  private buildQuote(inst: Instrument, s: PriceState): Quote {
    const spread = (inst.meta?.defaultSpread as number | undefined) ?? s.price * 0.0005;
    const changeAbs = s.price - s.open;
    const changePct = s.open ? (changeAbs / s.open) * 100 : 0;
    return {
      symbol: inst.symbol,
      price: s.price,
      bid: roundFor(inst, s.price - spread / 2),
      ask: roundFor(inst, s.price + spread / 2),
      changeAbs: roundFor(inst, changeAbs),
      changePct: Number(changePct.toFixed(2)),
      high24h: s.high24h,
      low24h: s.low24h,
      volume24h: s.volume24h,
      updatedAt: new Date().toISOString(),
    };
  }

  getQuote(symbol: string): Quote | null {
    const inst = findInstrument(symbol);
    const s = this.state.get(symbol);
    if (!inst || !s) return null;
    return this.buildQuote(inst, s);
  }

  getQuotes(symbols?: string[]): Quote[] {
    const list = symbols?.length
      ? symbols.map((s) => findInstrument(s)).filter(Boolean) as Instrument[]
      : ALL_INSTRUMENTS;
    return list.map((inst) => this.buildQuote(inst, this.state.get(inst.symbol)!));
  }

  /** Genera un histórico OHLC sintético pero coherente con el precio actual. */
  getCandles(symbol: string, points = 120, stepSeconds = 3600): Candle[] {
    const inst = findInstrument(symbol);
    if (!inst) return [];
    const now = Math.floor(Date.now() / 1000);
    const candles: Candle[] = [];
    let price = inst.basePrice;
    for (let i = points; i > 0; i--) {
      const open = price;
      const drift = (Math.random() - 0.5) * 2 * inst.volatility * 1.5;
      const close = Math.max(0.0001, open * (1 + drift));
      const high = Math.max(open, close) * (1 + Math.random() * inst.volatility);
      const low = Math.min(open, close) * (1 - Math.random() * inst.volatility);
      candles.push({
        time: now - i * stepSeconds,
        open: roundFor(inst, open),
        high: roundFor(inst, high),
        low: roundFor(inst, low),
        close: roundFor(inst, close),
        volume: Math.round(Math.random() * 50000),
      });
      price = close;
    }
    return candles;
  }
}

function roundFor(inst: Instrument, value: number): number {
  const decimals = inst.basePrice < 1 ? 5 : inst.basePrice < 10 ? 4 : 2;
  return Number(value.toFixed(decimals));
}

export const marketData = new MarketDataService();
