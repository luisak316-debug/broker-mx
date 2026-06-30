export interface ParsedBulkContact {
  phone: string;
  clientName: string;
  email: string;
  description: string;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

/** Parsea líneas pegadas desde libreta: teléfono "nombre" email "descripción" [monto] */
export function parseBulkContacts(raw: string): {
  contacts: ParsedBulkContact[];
  skippedLines: string[];
} {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const contacts: ParsedBulkContact[] = [];
  const skippedLines: string[] = [];

  for (const line of lines) {
    let work = line;
    const headerPrefix = work.match(/^(\d+\s+contactos\s+)/i);
    if (headerPrefix) {
      work = work.slice(headerPrefix[0].length).trim();
      if (!work) continue;
    }

    const phoneMatch = work.match(/^(\+?\d{10,15})/);
    if (!phoneMatch) {
      skippedLines.push(line);
      continue;
    }

    let rest = work.slice(phoneMatch[0].length).trim();
    const phone = phoneMatch[1].replace(/\D/g, '').slice(-10);
    if (phone.length !== 10) {
      skippedLines.push(line);
      continue;
    }

    const nameMatch = rest.match(/^"([^"]+)"/);
    if (!nameMatch) {
      skippedLines.push(line);
      continue;
    }
    const clientName = nameMatch[1].trim();
    rest = rest.slice(nameMatch[0].length).trim();

    const emailMatch = rest.match(EMAIL_RE);
    if (!emailMatch) {
      skippedLines.push(line);
      continue;
    }
    const email = emailMatch[0].toLowerCase();
    rest = rest.slice(rest.indexOf(emailMatch[0]) + emailMatch[0].length).trim();

    let description = '';
    const descQuoted = rest.match(/^"([^"]*)"/);
    if (descQuoted) {
      description = descQuoted[1].trim();
      rest = rest.slice(descQuoted[0].length).trim();
      if (rest) {
        description += `${description ? ' ' : ''}${rest.replace(/^["']|["']$/g, '').trim()}`;
      }
      rest = '';
    } else {
      const tailMatch = rest.match(/^(.+?)\s+([\d,\.'$+\s]+(?:\+)?)\s*$/u);
      if (tailMatch && /[\d]/.test(tailMatch[2])) {
        description = tailMatch[1].replace(/^["']|["']$/g, '').trim();
        description += `${description ? ' · ' : ''}Monto ref: ${tailMatch[2].trim()}`;
      } else {
        description = rest.replace(/^["']|["']$/g, '').trim();
      }
      rest = '';
    }

    if (rest && /[\d,$.+']/.test(rest)) {
      description += `${description ? ' · ' : ''}Monto ref: ${rest.trim()}`;
    }

    contacts.push({
      phone,
      clientName,
      email,
      description: description.slice(0, 4000),
    });
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
