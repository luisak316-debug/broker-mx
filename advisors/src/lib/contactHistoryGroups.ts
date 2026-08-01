import { fmtMonthYear, isoDate, shiftDays } from './format';
import type { ContactHistoryContact } from '../types';

export type HistorySection = {
  id: string;
  label: string;
  hint?: string;
  contacts: ContactHistoryContact[];
  sortKey: number;
};

type PeriodKey =
  | 'today'
  | 'yesterday'
  | 'dayBeforeYesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | `month-${string}`
  | `year-${number}`;

const SECTION_META: Record<
  Exclude<PeriodKey, `month-${string}` | `year-${number}`>,
  { label: string; hint?: string; sortKey: number }
> = {
  today: { label: 'Hoy', sortKey: 1000 },
  yesterday: { label: 'Ayer', sortKey: 999 },
  dayBeforeYesterday: { label: 'Anteayer', sortKey: 998 },
  thisWeek: { label: 'Esta semana', hint: 'Lunes a hoy', sortKey: 997 },
  lastWeek: { label: 'Semana pasada', hint: 'Semana calendario anterior', sortKey: 996 },
  thisMonth: { label: 'Este mes', sortKey: 995 },
  lastMonth: { label: 'Mes pasado', sortKey: 994 },
};

function parseLocalDate(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

function startOfWeekMonday(d: Date): Date {
  const copy = new Date(d);
  const weekday = copy.getDay();
  const offset = weekday === 0 ? -6 : 1 - weekday;
  copy.setDate(copy.getDate() + offset);
  return copy;
}

function endOfWeekSunday(d: Date): Date {
  const monday = startOfWeekMonday(d);
  return shiftDays(monday, 6);
}

function monthStart(year: number, month: number): Date {
  return new Date(year, month - 1, 1, 12, 0, 0, 0);
}

function classifyContactDate(iso: string, now: Date): PeriodKey {
  const todayIso = isoDate(now);
  const yesterdayIso = isoDate(shiftDays(now, -1));
  const dayBeforeIso = isoDate(shiftDays(now, -2));

  if (iso === todayIso) return 'today';
  if (iso === yesterdayIso) return 'yesterday';
  if (iso === dayBeforeIso) return 'dayBeforeYesterday';

  const date = parseLocalDate(iso);
  const weekStart = startOfWeekMonday(now);
  const weekEnd = endOfWeekSunday(now);
  const lastWeekStart = shiftDays(weekStart, -7);
  const lastWeekEnd = shiftDays(weekEnd, -7);

  if (date >= weekStart && date <= weekEnd && iso !== dayBeforeIso) {
    return 'thisWeek';
  }
  if (date >= lastWeekStart && date <= lastWeekEnd) {
    return 'lastWeek';
  }

  const thisMonthStart = monthStart(now.getFullYear(), now.getMonth() + 1);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 12, 0, 0, 0);
  const lastMonthStart = monthStart(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1);
  const lastMonthEnd = monthStart(now.getFullYear(), now.getMonth() + 1);

  if (date >= thisMonthStart) return 'thisMonth';
  if (date >= lastMonthStart && date < lastMonthEnd) return 'lastMonth';

  if (date.getFullYear() === now.getFullYear()) {
    return `month-${iso.slice(0, 7)}`;
  }

  return `year-${date.getFullYear()}`;
}

function sectionLabel(key: PeriodKey): { label: string; hint?: string; sortKey: number } {
  if (key in SECTION_META) {
    return SECTION_META[key as keyof typeof SECTION_META];
  }
  if (key.startsWith('month-')) {
    const [y, m] = key.slice(6).split('-').map(Number);
    return {
      label: fmtMonthYear(y, m),
      sortKey: y * 100 + m,
    };
  }
  const year = Number(key.slice(5));
  return {
    label: String(year),
    hint: 'Agrupado por año',
    sortKey: year,
  };
}

export function groupContactsByPeriod(
  contacts: ContactHistoryContact[],
  now = new Date(),
): HistorySection[] {
  const buckets = new Map<PeriodKey, ContactHistoryContact[]>();

  for (const contact of contacts) {
    const key = classifyContactDate(contact.assignedDate, now);
    const list = buckets.get(key) ?? [];
    list.push(contact);
    buckets.set(key, list);
  }

  const sections: HistorySection[] = [];

  for (const [key, items] of buckets) {
    const meta = sectionLabel(key);
    items.sort((a, b) => {
      const dateCmp = b.assignedDate.localeCompare(a.assignedDate);
      if (dateCmp !== 0) return dateCmp;
      return a.clientName.localeCompare(b.clientName, 'es');
    });
    sections.push({
      id: key,
      label: meta.label,
      hint: meta.hint,
      sortKey: meta.sortKey,
      contacts: items,
    });
  }

  sections.sort((a, b) => b.sortKey - a.sortKey);

  // Dentro de cada año, sub-agrupar por mes si la sección es year-YYYY
  const merged: HistorySection[] = [];
  for (const section of sections) {
    if (!section.id.startsWith('year-')) {
      merged.push(section);
      continue;
    }

    const byMonth = new Map<string, ContactHistoryContact[]>();
    for (const c of section.contacts) {
      const mk = c.assignedDate.slice(0, 7);
      const list = byMonth.get(mk) ?? [];
      list.push(c);
      byMonth.set(mk, list);
    }

    const monthSections = [...byMonth.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([mk, items]) => {
        const [y, m] = mk.split('-').map(Number);
        return {
          id: `month-${mk}`,
          label: fmtMonthYear(y, m),
          hint: section.label,
          sortKey: y * 100 + m,
          contacts: items.sort((a, b) => b.assignedDate.localeCompare(a.assignedDate)),
        };
      });

    merged.push(...monthSections);
  }

  merged.sort((a, b) => b.sortKey - a.sortKey);
  return merged;
}

export function summarizeHistory(contacts: ContactHistoryContact[], now = new Date()) {
  const todayIso = isoDate(now);
  const weekStartIso = isoDate(startOfWeekMonday(now));
  const monthStartIso = isoDate(monthStart(now.getFullYear(), now.getMonth() + 1));

  return {
    total: contacts.length,
    today: contacts.filter((c) => c.assignedDate === todayIso).length,
    thisWeek: contacts.filter((c) => c.assignedDate >= weekStartIso).length,
    thisMonth: contacts.filter((c) => c.assignedDate >= monthStartIso).length,
  };
}
