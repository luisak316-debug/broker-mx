/**
 * Reemplaza TODOS los asesores demo por los del bloc ACCESOS ASESORES INVERMAX.txt
 *
 * Uso:
 *   npx tsx scripts/replace-advisors-from-notepad.ts
 *   npx tsx scripts/replace-advisors-from-notepad.ts "ruta/al/archivo.txt"
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

async function removeAllAdvisors(): Promise<number> {
  const advisors = await prisma.staff.findMany({
    where: { role: 'ADVISOR' },
    select: { id: true, displayName: true },
  });
  if (advisors.length === 0) return 0;

  const ids = advisors.map((a) => a.id);
  await prisma.user.updateMany({
    where: { advisorId: { in: ids } },
    data: { advisorId: null },
  });

  const deleted = await prisma.staff.deleteMany({
    where: { role: 'ADVISOR' },
  });

  for (const a of advisors) {
    console.log(`Eliminado: ${a.displayName}`);
  }
  return deleted.count;
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
    throw new Error('No hay accesos completos en el bloc de notas.');
  }

  console.log(`Base: ${process.env.DATABASE_URL?.slice(0, 30)}…`);
  console.log('Eliminando asesores actuales…');
  const removed = await removeAllAdvisors();
  console.log(`Eliminados: ${removed}`);

  console.log('Creando asesores reales…');
  for (const row of rows) {
    const access = normalizeAdvisorLoginAccess(row.access);
    const displayName = titleCaseName(row.name);
    const email = advisorInternalEmail(access);
    const passwordHash = hashPassword(row.password);

    const saved = await prisma.staff.create({
      data: {
        email,
        loginAccess: access,
        displayName,
        role: 'ADVISOR',
        passwordHash,
        active: true,
      },
    });

    console.log(`OK ${displayName} → acceso ${access}`);
    console.log(`   id: ${saved.id}`);
  }

  console.log(`\nListo: ${rows.length} asesor(es) activos.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
