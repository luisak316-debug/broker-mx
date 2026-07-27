/**
 * Parser frontend (supervisores) — libreta + Facebook.
 * Mantener en sync con backend/src/lib/parseBulkContacts.ts
 */

export interface ParsedBulkContact {
  phone: string;
  clientName: string;
  email: string;
  description: string;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_INLINE_RE =
  /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{4,6}|\+\d{10,15}|\d{10,15}/g;
const FB_NOISE_RE =
  /^(ver perfil|enviar mensaje|activo|active|hace \d+|facebook|messenger|lead|formulario|form|página|page|publicidad|ads)$/i;
const NAME_LABEL_RE = /^(nombre(?:\s+completo)?|name|cliente|contacto)\s*:?\s*(.*)$/i;
const PHONE_LABEL_RE =
  /^(tel[eé]fono|telefono|celular|cel|m[oó]vil|whatsapp|phone|mobile|n[uú]mero)\s*:?\s*(.*)$/i;

function normalizePhone(raw: string, defaultCountry = '52'): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+${defaultCountry}${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return null;
}

function cleanName(raw: string): string {
  return raw.replace(/^["'«»]+|["'«»]+$/g, '').replace(/\s+/g, ' ').trim();
}

function isLikelyName(line: string): boolean {
  if (!line || line.length < 3 || line.length > 80) return false;
  if (EMAIL_RE.test(line)) return false;
  if (/^https?:\/\//i.test(line)) return false;
  if (FB_NOISE_RE.test(line)) return false;
  if (NAME_LABEL_RE.test(line) || PHONE_LABEL_RE.test(line)) return false;
  if (line.replace(/\D/g, '').length >= 8) return false;
  if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(line)) return false;
  return true;
}

function extractPhonesFromText(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.match(PHONE_INLINE_RE) ?? []) {
    const phone = normalizePhone(match);
    if (phone) found.add(phone);
  }
  return [...found];
}

function parseFacebookBlock(block: string): ParsedBulkContact | null {
  const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  let clientName = '';
  let phone = '';
  let email = '';
  const descriptionParts: string[] = [];

  for (const line of lines) {
    const nameLabel = line.match(NAME_LABEL_RE);
    if (nameLabel) {
      const val = cleanName(nameLabel[2] ?? '');
      if (val) clientName = val;
      continue;
    }
    const phoneLabel = line.match(PHONE_LABEL_RE);
    if (phoneLabel) {
      const phones = extractPhonesFromText(phoneLabel[2] ?? line);
      if (phones[0]) phone = phones[0];
      continue;
    }
    const emailMatch = line.match(EMAIL_RE);
    if (emailMatch) {
      email = emailMatch[0].toLowerCase();
      continue;
    }
    if (/facebook|messenger|meta/i.test(line) && line.length < 60) continue;

    const phones = extractPhonesFromText(line);
    if (phones.length === 1 && line.replace(/\D/g, '').length >= 10) {
      phone = phones[0];
      const maybeName = line.replace(PHONE_INLINE_RE, '').replace(/[-–—|]/g, ' ').trim();
      if (!clientName && isLikelyName(maybeName)) clientName = cleanName(maybeName);
      continue;
    }
    if (!clientName && isLikelyName(line)) {
      clientName = cleanName(line);
      continue;
    }
    if (line.length > 2) descriptionParts.push(line);
  }

  if (!phone) {
    const allPhones = extractPhonesFromText(block);
    if (allPhones[0]) phone = allPhones[0];
  }
  if (!clientName) {
    for (const line of lines) {
      if (isLikelyName(line)) {
        clientName = cleanName(line);
        break;
      }
    }
  }
  if (!phone || !clientName) return null;

  return {
    phone,
    clientName,
    email,
    description: (descriptionParts.join(' · ') || 'Lead Facebook').slice(0, 4000),
  };
}

function isPhoneLine(line: string): boolean {
  const work = line.trim().replace(/^p:/i, '');
  if (!/^\+?\d/.test(work)) return false;
  const digits = work.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function looksLikeAlternatingNamePhone(raw: string): boolean {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return false;
  let match = 0;
  for (let i = 0; i + 1 < lines.length; i += 2) {
    if (isLikelyName(lines[i]) && isPhoneLine(lines[i + 1])) match++;
  }
  return match >= 1 && match >= Math.ceil(lines.length / 2) * 0.5;
}

function parseAlternatingNamePhoneContacts(raw: string): {
  contacts: ParsedBulkContact[];
  skippedLines: string[];
} {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const contacts: ParsedBulkContact[] = [];
  const skippedLines: string[] = [];
  const seenPhones = new Set<string>();

  let i = 0;
  while (i < lines.length) {
    const nameLine = lines[i];
    const phoneLine = lines[i + 1];

    if (phoneLine && isLikelyName(nameLine) && isPhoneLine(phoneLine)) {
      const phone =
        normalizePhone(phoneLine.replace(/^p:/i, '')) ??
        normalizePhone(extractPhonesFromText(phoneLine)[0] ?? '');
      if (phone && !seenPhones.has(phone)) {
        seenPhones.add(phone);
        contacts.push({
          phone,
          clientName: cleanName(nameLine),
          email: '',
          description: 'Lead Facebook',
        });
        i += 2;
        continue;
      }
    }

    skippedLines.push(nameLine);
    i += 1;
  }

  return { contacts, skippedLines };
}

function looksLikeFacebookLeadTsv(raw: string): boolean {
  const firstLine = raw.split(/\r?\n/)[0] ?? '';
  return (
    firstLine.includes('\t') &&
    /nombre_completo/i.test(firstLine) &&
    /tel[eé]fono|phone/i.test(firstLine)
  );
}

function parseFacebookLeadTsv(raw: string): {
  contacts: ParsedBulkContact[];
  skippedLines: string[];
} {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { contacts: [], skippedLines: [] };

  const header = lines[0].split('\t');
  const nameIdx = header.findIndex((h) => /nombre_completo/i.test(h));
  const phoneIdx = header.findIndex((h) => /n[uú]mero_de_tel[eé]fono|phone/i.test(h));
  const emailIdx = header.findIndex((h) => /correo/i.test(h));

  const contacts: ParsedBulkContact[] = [];
  const skippedLines: string[] = [];
  const seenPhones = new Set<string>();

  for (const row of lines.slice(1)) {
    const cols = row.split('\t');
    const rawName = (cols[nameIdx] ?? '').replace(/^"|"$/g, '').trim();
    const rawPhone = (cols[phoneIdx] ?? '').replace(/^"|"$/g, '').trim();
    const rawEmail = emailIdx >= 0 ? (cols[emailIdx] ?? '').replace(/^"|"$/g, '').trim() : '';

    const phone =
      normalizePhone(rawPhone.replace(/^p:/i, '')) ??
      normalizePhone(extractPhonesFromText(rawPhone)[0] ?? '');

    if (!rawName || !phone) {
      skippedLines.push(row.slice(0, 120));
      continue;
    }
    if (seenPhones.has(phone)) continue;
    seenPhones.add(phone);

    contacts.push({
      phone,
      clientName: cleanName(rawName),
      email: rawEmail && EMAIL_RE.test(rawEmail) ? rawEmail.toLowerCase() : '',
      description: 'Lead Facebook',
    });
  }

  return { contacts, skippedLines };
}

function looksLikeFacebookExport(raw: string): boolean {
  if (looksLikeAlternatingNamePhone(raw)) return false;
  if (looksLikeFacebookLeadTsv(raw)) return false;
  const lower = raw.toLowerCase();
  if (/facebook|messenger|meta lead|formulario instantáneo|instant form/i.test(lower)) return true;
  if (/nombre\s*:|tel[eé]fono\s*:|whatsapp\s*:/i.test(raw)) return true;
  const blocks = raw.split(/\n\s*\n/).filter((b) => b.trim().length > 0);
  if (blocks.length >= 2) {
    const multiLineBlocks = blocks.filter((b) => b.split(/\r?\n/).filter(Boolean).length >= 2);
    if (multiLineBlocks.length >= Math.min(3, blocks.length)) return true;
  }
  return false;
}

function parseFacebookContacts(raw: string): {
  contacts: ParsedBulkContact[];
  skippedBlocks: string[];
} {
  const contacts: ParsedBulkContact[] = [];
  const skippedBlocks: string[] = [];
  const seenPhones = new Set<string>();
  const blocks = raw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const chunks = blocks.length >= 2 ? blocks : raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const chunk of chunks) {
    if (chunk.length < 8) continue;
    const parsed = parseFacebookBlock(chunk);
    if (!parsed) {
      skippedBlocks.push(chunk.slice(0, 120));
      continue;
    }
    if (seenPhones.has(parsed.phone)) continue;
    seenPhones.add(parsed.phone);
    contacts.push(parsed);
  }
  return { contacts, skippedBlocks };
}

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
  if (emailMatch) rest = rest.slice(rest.indexOf(emailMatch[0]) + emailMatch[0].length).trim();
  let description = '';
  const descQuoted = rest.match(/^"([^"]*)"/);
  if (descQuoted) {
    description = descQuoted[1].trim();
  } else if (rest) {
    description = rest.replace(/^["']|["']$/g, '').trim();
  }
  return { phone, clientName, email, description: description.slice(0, 4000) };
}

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

export function previewDistribution(contactCount: number, advisorCount: number): number[] {
  if (advisorCount === 0) return [];
  const base = Math.floor(contactCount / advisorCount);
  const extra = contactCount % advisorCount;
  return Array.from({ length: advisorCount }, (_, i) => base + (i < extra ? 1 : 0));
}
