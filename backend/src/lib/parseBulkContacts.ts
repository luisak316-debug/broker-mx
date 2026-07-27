import {
  looksLikeAlternatingNamePhone,
  looksLikeFacebookExport,
  looksLikeFacebookLeadTsv,
  parseAlternatingNamePhoneContacts,
  parseFacebookContacts,
  parseFacebookLeadTsv,
} from './parseFacebookContacts';

export interface ParsedBulkContact {
  phone: string;
  clientName: string;
  email: string;
  description: string;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

function parseLibretaLine(line: string): ParsedBulkContact | null {
  let work = line;
  const headerPrefix = work.match(/^(\d+\s+contactos\s+)/i);
  if (headerPrefix) {
    work = work.slice(headerPrefix[0].length).trim();
    if (!work) return null;
  }

  const phoneMatch = work.match(/^(\+?\d{10,15})/);
  if (!phoneMatch) return null;

  let rest = work.slice(phoneMatch[0].length).trim();
  const phoneDigits = phoneMatch[1].replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) return null;
  const phone = `+${phoneDigits}`;

  const nameMatch = rest.match(/^"([^"]+)"/);
  if (!nameMatch) return null;
  const clientName = nameMatch[1].trim();
  rest = rest.slice(nameMatch[0].length).trim();

  const emailMatch = rest.match(EMAIL_RE);
  const email = emailMatch ? emailMatch[0].toLowerCase() : '';
  if (emailMatch) {
    rest = rest.slice(rest.indexOf(emailMatch[0]) + emailMatch[0].length).trim();
  }

  let description = '';
  const descQuoted = rest.match(/^"([^"]*)"/);
  if (descQuoted) {
    description = descQuoted[1].trim();
    rest = rest.slice(descQuoted[0].length).trim();
    if (rest) {
      description += `${description ? ' ' : ''}${rest.replace(/^["']|["']$/g, '').trim()}`;
    }
  } else if (rest) {
    const tailMatch = rest.match(/^(.+?)\s+([\d,\.'$+\s]+(?:\+)?)\s*$/u);
    if (tailMatch && /[\d]/.test(tailMatch[2])) {
      description = tailMatch[1].replace(/^["']|["']$/g, '').trim();
      description += `${description ? ' · ' : ''}Monto ref: ${tailMatch[2].trim()}`;
    } else {
      description = rest.replace(/^["']|["']$/g, '').trim();
    }
  }

  return {
    phone,
    clientName,
    email,
    description: description.slice(0, 4000),
  };
}

/** Parsea libreta clásica o texto copiado desde Facebook (nombre + teléfono). */
export function parseBulkContacts(raw: string): {
  contacts: ParsedBulkContact[];
  skippedLines: string[];
} {
  const trimmed = raw.trim();
  if (!trimmed) return { contacts: [], skippedLines: [] };

  if (looksLikeFacebookLeadTsv(trimmed)) {
    return parseFacebookLeadTsv(trimmed);
  }

  if (looksLikeAlternatingNamePhone(trimmed)) {
    return parseAlternatingNamePhoneContacts(trimmed);
  }

  if (looksLikeFacebookExport(trimmed)) {
    const fb = parseFacebookContacts(trimmed);
    return { contacts: fb.contacts, skippedLines: fb.skippedBlocks };
  }

  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const contacts: ParsedBulkContact[] = [];
  const skippedLines: string[] = [];
  const seenPhones = new Set<string>();

  for (const line of lines) {
    const parsed = parseLibretaLine(line);
    if (!parsed) {
      skippedLines.push(line);
      continue;
    }
    if (seenPhones.has(parsed.phone)) continue;
    seenPhones.add(parsed.phone);
    contacts.push(parsed);
  }

  if (contacts.length === 0 && skippedLines.length >= 2) {
    const alt = parseAlternatingNamePhoneContacts(trimmed);
    if (alt.contacts.length > 0) return alt;

    const fb = parseFacebookContacts(trimmed);
    if (fb.contacts.length > 0) {
      return { contacts: fb.contacts, skippedLines: fb.skippedBlocks };
    }
  }

  return { contacts, skippedLines };
}

export function distributeContacts<T>(
  items: T[],
  advisorIds: string[],
): Array<T & { advisorId: string }> {
  if (advisorIds.length === 0) return [];
  const base = Math.floor(items.length / advisorIds.length);
  const extra = items.length % advisorIds.length;
  const out: Array<T & { advisorId: string }> = [];
  let idx = 0;

  for (let a = 0; a < advisorIds.length; a++) {
    const count = base + (a < extra ? 1 : 0);
    for (let j = 0; j < count; j++) {
      out.push({ ...items[idx], advisorId: advisorIds[a] });
      idx++;
    }
  }

  return out;
}
