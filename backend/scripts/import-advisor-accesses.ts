/**
 * Importa asesores desde ACCESOS ASESORES INVERMAX.txt
 * Formato por bloque:
 *   ACCESO: 372810444417924
 *   CONTRASEÑA: Corp1997
 *   ASESOR: JAVIER HERNANDEZ
 */
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { prisma } from '../src/lib/prisma';
import {
  advisorInternalEmail,
  normalizeAdvisorLoginAccess,
  titleCaseName,
} from '../src/lib/advisorAccess';
import { hashPassword } from '../src/services/security.service';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

type Row = { access: string; password: string; name: string };

function parseFile(content: string): Row[] {
  const rows: Row[] = [];
  let access = '';
  let password = '';
  let name = '';

  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      if (access && password && name) rows.push({ access, password, name });
      access = password = name = '';
      continue;
    }
    if (/^ACCESO:/i.test(line)) access = line.replace(/^ACCESO:\s*/i, '').trim();
    else if (/^CONTRASEÑA:/i.test(line)) password = line.replace(/^CONTRASEÑA:\s*/i, '').trim();
    else if (/^ASESOR:/i.test(line)) name = line.replace(/^ASESOR:\s*/i, '').trim();
  }
  if (access && password && name) rows.push({ access, password, name });
  return rows;
}

async function main() {
  const file =
    process.argv[2] ??
    path.resolve(__dirname, '..', '..', 'ACCESOS ASESORES INVERMAX.txt');
  if (!fs.existsSync(file)) {
    throw new Error(`No se encontró ${file}`);
  }

  const rows = parseFile(fs.readFileSync(file, 'utf8'));
  if (rows.length === 0) {
    console.log('No hay accesos completos en el archivo.');
    return;
  }

  for (const row of rows) {
    const access = normalizeAdvisorLoginAccess(row.access);
    const displayName = titleCaseName(row.name);
    const email = advisorInternalEmail(access);
    const passwordHash = hashPassword(row.password);

    const saved = await prisma.staff.upsert({
      where: { loginAccess: access },
      create: {
        email,
        loginAccess: access,
        displayName,
        role: 'ADVISOR',
        passwordHash,
        active: true,
      },
      update: {
        email,
        displayName,
        passwordHash,
        active: true,
      },
    });

    console.log(`OK ${displayName} → acceso ${access} (${saved.id})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
