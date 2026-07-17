import Parser from 'rss-parser';
import { resolveHeroImage } from './newsHeroImages';

export type InvestingCategory = 'crypto' | 'stocks' | 'commodities' | 'forex';

export type InvestingArticle = {
  title: string;
  summary: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  category: InvestingCategory;
  /** sube | baja | neutral */
  trend: 'up' | 'down' | 'neutral';
};

type RssEnclosure = { url?: string; type?: string };
type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  enclosure?: RssEnclosure;
};

type RawRow = {
  title: string;
  summary: string;
  url: string;
  enclosureUrl?: string;
  publishedAt: string;
  category: InvestingCategory;
  trend: 'up' | 'down' | 'neutral';
  sortTs: number;
};

const parser = new Parser<{ enclosure?: RssEnclosure }, RssItem>({
  customFields: { item: [['enclosure', 'enclosure', { keepArray: false }]] },
});

/** Fuentes RSS de Investing.com (español). */
const INVESTING_RSS_FEEDS = [
  'https://es.investing.com/rss/news.rss',
  'https://es.investing.com/rss/stock.rss',
  'https://es.investing.com/rss/commodities.rss',
] as const;

const UP_WORDS =
  /\b(sube|suben|subió|subio|alza|alcista|repunte|rally|ganancias|positivo|positiva|aumenta|impulsa|fortaleza|recuperaci[oó]n|m[aá]ximos?|avanza|repuntan)\b/i;
const DOWN_WORDS =
  /\b(baja|bajan|baj[oó]|cae|caen|cay[oó]|ca[ií]da|retrocede|presi[oó]n|negativo|negativa|debilita|correcci[oó]n|volatilidad|toque?n?\s+m[ií]nimos?|caen\s+mientras)\b/i;

function detectTrend(title: string, summary: string): 'up' | 'down' | 'neutral' {
  const text = `${title} ${summary}`;
  const up = UP_WORDS.test(text);
  const down = DOWN_WORDS.test(text);
  if (up && !down) return 'up';
  if (down && !up) return 'down';
  return 'neutral';
}

function classifyItem(link: string, title: string): InvestingCategory {
  const blob = `${link} ${title}`.toLowerCase();
  if (/crypto|bitcoin|ethereum|cripto|btc|eth|blockchain/.test(blob)) return 'crypto';
  if (/forex|divisa|d[oó]lar|peso|usd|eur\/|gbp\/|yen|cambiari|moneda/.test(blob)) return 'forex';
  if (/commodit|oro|plata|petr|wti|brent|ma[ií]z|cobre|agr[ií]col|materias|petr[oó]leo/.test(blob))
    return 'commodities';
  return 'stocks';
}

/** Sube resolución de miniaturas Investing (108x81 → 800x533). */
export function upscaleInvestingImage(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.includes('i-invdn-com.investing.com')) {
    return url.replace(/_\d+x\d+(\.[a-z]+)$/i, '_800x533$1');
  }
  return url;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseDate(raw?: string): number {
  if (!raw) return 0;
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

function mapRssItem(item: RssItem): RawRow | null {
  if (!item.title || !item.link) return null;
  const category = classifyItem(item.link, item.title);
  const summary = stripHtml(item.contentSnippet ?? item.content ?? item.title);
  return {
    title: item.title.trim(),
    summary: summary.length > 220 ? `${summary.slice(0, 217)}…` : summary,
    url: item.link.trim(),
    enclosureUrl: item.enclosure?.url,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    category,
    trend: detectTrend(item.title, summary),
    sortTs: parseDate(item.pubDate),
  };
}

function rowToArticle(row: RawRow): InvestingArticle {
  const remote = upscaleInvestingImage(row.enclosureUrl);
  return {
    title: row.title,
    summary: row.summary,
    url: row.url,
    imageUrl: resolveHeroImage(row.category, row.title, row.summary, row.url, remote),
    publishedAt: row.publishedAt,
    category: row.category,
    trend: row.trend,
  };
}

async function fetchAllRssRows(): Promise<RawRow[]> {
  const feeds = await Promise.all(
    INVESTING_RSS_FEEDS.map((url) =>
      parser.parseURL(url).catch((err) => {
        console.warn(`[investing-news] RSS falló ${url}:`, err);
        return { items: [] as RssItem[] };
      }),
    ),
  );

  const seen = new Set<string>();
  const rows: RawRow[] = [];
  for (const feed of feeds) {
    for (const item of feed.items ?? []) {
      const row = mapRssItem(item);
      if (!row || seen.has(row.url)) continue;
      seen.add(row.url);
      rows.push(row);
    }
  }

  return rows.sort((a, b) => b.sortTs - a.sortTs);
}

function trendScore(t: InvestingArticle['trend']): number {
  if (t === 'up' || t === 'down') return 2;
  return 1;
}

export async function fetchInvestingDailyNews(): Promise<InvestingArticle[]> {
  const rows = await fetchAllRssRows();
  const picked = new Map<InvestingCategory, RawRow>();

  for (const row of rows) {
    if (!picked.has(row.category)) picked.set(row.category, row);
  }

  for (const row of rows) {
    for (const cat of ['crypto', 'stocks', 'commodities', 'forex'] as InvestingCategory[]) {
      if (!picked.has(cat) && row.category === cat) picked.set(cat, row);
    }
  }

  const articles: InvestingArticle[] = [];
  for (const cat of ['forex', 'commodities', 'stocks', 'crypto'] as InvestingCategory[]) {
    const row = picked.get(cat);
    if (row) articles.push(rowToArticle(row));
  }

  return articles;
}

/** Pool amplio de titulares para rotación del destacado (prioriza sube/baja). */
export async function fetchInvestingHeadlinePool(maxItems = 24): Promise<InvestingArticle[]> {
  const rows = await fetchAllRssRows();
  return rows
    .map(rowToArticle)
    .sort((a, b) => {
      const byTrend = trendScore(b.trend) - trendScore(a.trend);
      if (byTrend !== 0) return byTrend;
      return parseDate(b.publishedAt) - parseDate(a.publishedAt);
    })
    .slice(0, maxItems);
}

/** Pick titular destacado del día — prioriza movimientos de mercado (sube/baja). */
export function pickFeaturedHeadline(articles: InvestingArticle[]): InvestingArticle | null {
  if (!articles.length) return null;
  const movers = articles.filter((a) => a.trend !== 'neutral');
  return (movers.length ? movers : articles)[0] ?? null;
}
