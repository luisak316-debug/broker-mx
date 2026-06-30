export interface ParsedBulkContact {
  phone: string;
  clientName: string;
  email: string;
  description: string;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

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

    contacts.push({ phone, clientName, email, description: description.slice(0, 4000) });
  }

  return { contacts, skippedLines };
}

export function previewDistribution(contactCount: number, advisorCount: number): number[] {
  if (advisorCount === 0) return [];
  const base = Math.floor(contactCount / advisorCount);
  const extra = contactCount % advisorCount;
  return Array.from({ length: advisorCount }, (_, i) => base + (i < extra ? 1 : 0));
}
