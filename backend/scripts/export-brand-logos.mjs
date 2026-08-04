/**
 * Exporta logos SVG de marca a PNG (fondo transparente).
 * Uso: node backend/scripts/export-brand-logos.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const brandDir = join(root, 'shared/brand');
const outDir = join(root, 'assets');

mkdirSync(outDir, { recursive: true });

const exports = [
  { svg: 'invermax-logo-pure.svg', png: 'invermax-logo-puro.png', width: 1024 },
  { svg: 'invermax-logo-with-name.svg', png: 'invermax-logo-con-nombre.png', width: 1840 },
];

for (const item of exports) {
  const svgPath = join(brandDir, item.svg);
  const svg = readFileSync(svgPath, 'utf8');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: item.width },
    background: 'transparent',
  });
  const png = resvg.render().asPng();
  const outPath = join(outDir, item.png);
  writeFileSync(outPath, png);
  console.log('OK', outPath, `(${png.length} bytes)`);
}
