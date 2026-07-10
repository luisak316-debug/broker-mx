import Parser from 'rss-parser';

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

const parser = new Parser<{ enclosure?: RssEnclosure }, RssItem>({
  customFields: { item: [['enclosure', 'enclosure', { keepArray: false }]] },
});

const INVESTING_RSS = 'https://es.investing.com/rss/news.rss';

const LOCAL_FALLBACK: Record<InvestingCategory, string> = {
  crypto: '/news/crypto.jpg',
  stocks: '/news/stocks.jpg',
  commodities: '/news/commodities.jpg',
  forex: '/news/forex.jpg',
};

const UP_WORDS =
  /\b(sube|suben|subió|subio|alza|alcista|repunte|rally|ganancias|positivo|positiva|aumenta|impulsa|fortaleza|recuperaci[oó]n|m[aá]ximos?)\b/i;
const DOWN_WORDS =
  /\b(baja|bajan|baj[oó]|cae|caen|cay[oó]|ca[ií]da|retrocede|presi[oó]n|negativo|negativa|debilita|correcci[oó]n|volatilidad)\b/i;

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
  if (/forex|divisa|d[oó]lar|peso|usd|eur\/|gbp\/|yen|cambiari/.test(blob)) return 'forex';
  if (/commodit|oro|plata|petr|wti|brent|ma[ií]z|cobre|agr[ií]col|materias/.test(blob)) return 'commodities';
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

async function fetchOgImage(articleUrl: string): Promise<string | undefined> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(articleUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'BrokerMX-NewsBot/1.0 (+https://brokermx-alpha.vercel.app)',
        Accept: 'text/html',
      },
    });
    if (!res.ok) return undefined;
    const html = await res.text();
    const match =
      html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ??
      html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
    return match?.[1] ? upscaleInvestingImage(match[1]) : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveImage(
  enclosureUrl: string | undefined,
  articleUrl: string,
  category: InvestingCategory,
): Promise<string> {
  const upscaled = upscaleInvestingImage(enclosureUrl);
  if (upscaled && !upscaled.includes('108x81')) return upscaled;
  if (upscaled) {
    const hd = upscaleInvestingImage(upscaled);
    if (hd && !hd.includes('108x81')) return hd;
  }
  const og = await fetchOgImage(articleUrl);
  if (og) return og;
  return LOCAL_FALLBACK[category];
}

export async function fetchInvestingDailyNews(): Promise<InvestingArticle[]> {
  const feed = await parser.parseURL(INVESTING_RSS);
  const raw = (feed.items ?? [])
    .filter((item) => item.title && item.link)
    .map((item) => {
      const category = classifyItem(item.link!, item.title!);
      const summary = stripHtml(item.contentSnippet ?? item.content ?? item.title!);
      return {
        title: item.title!.trim(),
        summary: summary.length > 220 ? `${summary.slice(0, 217)}…` : summary,
        url: item.link!.trim(),
        enclosureUrl: item.enclosure?.url,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        category,
        trend: detectTrend(item.title!, summary),
        sortTs: parseDate(item.pubDate),
      };
    })
    .sort((a, b) => b.sortTs - a.sortTs);

  const picked = new Map<InvestingCategory, (typeof raw)[number]>();
  for (const row of raw) {
    if (!picked.has(row.category)) picked.set(row.category, row);
  }

  // Completa categorías faltantes con el siguiente titular disponible.
  for (const row of raw) {
    for (const cat of ['crypto', 'stocks', 'commodities', 'forex'] as InvestingCategory[]) {
      if (!picked.has(cat) && row.category === cat) picked.set(cat, row);
    }
  }

  const articles: InvestingArticle[] = [];
  for (const cat of ['forex', 'commodities', 'stocks', 'crypto'] as InvestingCategory[]) {
    const row = picked.get(cat);
    if (!row) continue;
    const imageUrl = await resolveImage(row.enclosureUrl, row.url, cat);
    articles.push({
      title: row.title,
      summary: row.summary,
      url: row.url,
      imageUrl,
      publishedAt: row.publishedAt,
      category: cat,
      trend: row.trend,
    });
  }

  return articles;
}

/** Pick titular destacado del día — prioriza movimientos de mercado (sube/baja). */
export function pickFeaturedHeadline(articles: InvestingArticle[]): InvestingArticle | null {
  if (!articles.length) return null;
  const movers = articles.filter((a) => a.trend !== 'neutral');
  const pool = movers.length ? movers : articles;
  return pool[0] ?? null;
}

export async function fetchInvestingHeadlinePool(): Promise<InvestingArticle[]> {
  const feed = await parser.parseURL(INVESTING_RSS);
  const rows = (feed.items ?? [])
    .filter((item) => item.title && item.link)
    .slice(0, 24);

  const out: InvestingArticle[] = [];
  for (const item of rows) {
    const category = classifyItem(item.link!, item.title!);
    const summary = stripHtml(item.contentSnippet ?? item.content ?? item.title!);
    const imageUrl = await resolveImage(item.enclosure?.url, item.link!, category);
    out.push({
      title: item.title!.trim(),
      summary: summary.length > 220 ? `${summary.slice(0, 217)}…` : summary,
      url: item.link!.trim(),
      imageUrl,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      category,
      trend: detectTrend(item.title!, summary),
    });
  }

  return out.sort((a, b) => {
    const score = (t: InvestingArticle) => (t.trend === 'neutral' ? 0 : 1);
    return score(b) - score(a);
  });
}
