import type { ParsedBulkContact } from './parseBulkContacts';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_INLINE_RE =
  /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{4,6}|\+\d{10,15}|\d{10,15}/g;

const FB_NOISE_RE =
  /^(ver perfil|enviar mensaje|activo|active|hace \d+|facebook|messenger|lead|formulario|form|página|page|publicidad|ads|organic|organico|organico)$/i;

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
  return raw
    .replace(/^["'«»]+|["'«»]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLikelyName(line: string): boolean {
  if (!line || line.length < 3 || line.length > 80) return false;
  if (EMAIL_RE.test(line)) return false;
  if (/^https?:\/\//i.test(line)) return false;
  if (FB_NOISE_RE.test(line)) return false;
  if (NAME_LABEL_RE.test(line) || PHONE_LABEL_RE.test(line)) return false;
  const digits = line.replace(/\D/g, '');
  if (digits.length >= 8) return false;
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
  const lines = block
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
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

/** Formato preferido: nombre y teléfono en la misma línea (teléfono al final). */
function parseNamePhoneSameLine(line: string): ParsedBulkContact | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 14) return null;

  const match = trimmed.match(/^(.+?)\s+(?:p:)?(\+?\d{10,15})\s*$/i);
  if (!match) return null;

  const clientName = cleanName(match[1]);
  const phone =
    normalizePhone(match[2].replace(/^p:/i, '')) ??
    normalizePhone(extractPhonesFromText(match[2])[0] ?? '');

  if (!clientName || !phone) return null;
  if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(clientName)) return null;

  return {
    phone,
    clientName,
    email: '',
    description: 'Lead Facebook',
  };
}

export function looksLikeNamePhoneSameLine(raw: string): boolean {
  if (looksLikeFacebookLeadTsv(raw)) return false;
  if (looksLikeAlternatingNamePhone(raw)) return false;

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return false;

  let match = 0;
  for (const line of lines) {
    if (parseNamePhoneSameLine(line)) match++;
  }
  return match >= 1 && match >= lines.length * 0.6;
}

export function parseNamePhoneSameLineContacts(raw: string): {
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

  for (const line of lines) {
    const parsed = parseNamePhoneSameLine(line);
    if (!parsed) {
      skippedLines.push(line);
      continue;
    }
    if (seenPhones.has(parsed.phone)) continue;
    seenPhones.add(parsed.phone);
    contacts.push(parsed);
  }

  return { contacts, skippedLines };
}

/** Formato: nombre en una línea, teléfono en la siguiente (sin línea en blanco). */
export function looksLikeAlternatingNamePhone(raw: string): boolean {
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

export function parseAlternatingNamePhoneContacts(raw: string): {
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

export function looksLikeFacebookLeadTsv(raw: string): boolean {
  const firstLine = raw.split(/\r?\n/)[0] ?? '';
  return (
    firstLine.includes('\t') &&
    /nombre_completo/i.test(firstLine) &&
    /tel[eé]fono|phone/i.test(firstLine)
  );
}

export function parseFacebookLeadTsv(raw: string): {
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

export function looksLikeFacebookExport(raw: string): boolean {
  if (looksLikeNamePhoneSameLine(raw)) return false;
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

/** Extrae nombre + teléfono desde texto copiado de Facebook (bloques, etiquetas, líneas sueltas). */
export function parseFacebookContacts(raw: string): {
  contacts: ParsedBulkContact[];
  skippedBlocks: string[];
} {
  const contacts: ParsedBulkContact[] = [];
  const skippedBlocks: string[] = [];
  const seenPhones = new Set<string>();

  const blocks = raw
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

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

export function toSupervisorBulkLine(c: ParsedBulkContact): string {
  const email = c.email || 'sin-correo@facebook.lead';
  const desc = c.description.replace(/"/g, "'");
  return `${c.phone} "${c.clientName}" ${email} "${desc}"`;
}

export function toSimpleListLine(c: ParsedBulkContact): string {
  return `${c.clientName} ${c.phone}`;
}
