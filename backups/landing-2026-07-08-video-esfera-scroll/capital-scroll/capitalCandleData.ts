export type Candle = {
  open: number;
  close: number;
  high: number;
  low: number;
};

export function buildCandleSeries(count: number, seed = 42): Candle[] {
  const candles: Candle[] = [];
  let price = 100;

  for (let i = 0; i < count; i++) {
    const wave = Math.sin((i + seed) * 0.42) * 2.4;
    const drift = Math.cos((i + seed) * 0.18) * 1.1;
    const open = price;
    const close = open + wave + drift + ((i % 3) - 1) * 0.6;
    const high = Math.max(open, close) + 1.2 + (i % 5) * 0.15;
    const low = Math.min(open, close) - 1.1 - (i % 4) * 0.12;
    candles.push({ open, close, high, low });
    price = close;
  }

  return candles;
}
