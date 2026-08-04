/**
 * Iconos Android — foreground (logo grande, transparente) + background (negro).
 * Uso: node backend/scripts/export-app-icon.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const brandDir = join(root, 'shared/brand');
const assetsDir = join(root, 'assets');

mkdirSync(assetsDir, { recursive: true });

const logoInner = readFileSync(join(brandDir, 'invermax-logo-pure.svg'), 'utf8')
  .replace(/<\?xml[^?]*\?>\s*/i, '')
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '');

// Logo centrado en viewBox 512×512; escala para ~88% del canvas adaptive (1024).
const FILL = 0.88;
const SIZE = 1024;
const scale = (SIZE * FILL) / 320; // ancho visual del mark + halo ≈ 320 en coords 512

function buildIconSvg(background) {
  const bgRect =
    background === 'transparent'
      ? ''
      : `<rect width="${SIZE}" height="${SIZE}" fill="${background}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  ${bgRect}
  <g transform="translate(${SIZE / 2}, ${SIZE / 2}) scale(${scale}) translate(-256, -256)">
    ${logoInner}
  </g>
</svg>`;
}

function renderPng(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
  });
  return resvg.render().asPng();
}

const foregroundPath = join(assetsDir, 'invermax-app-icon-foreground.png');
const backgroundPath = join(assetsDir, 'invermax-app-icon-background.png');
const compositePath = join(assetsDir, 'invermax-app-icon-1024.png');

writeFileSync(foregroundPath, renderPng(buildIconSvg('transparent'), 1024));
writeFileSync(
  backgroundPath,
  renderPng(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024"><rect width="1024" height="1024" fill="#000000"/></svg>`,
    1024,
  ),
);
writeFileSync(compositePath, renderPng(buildIconSvg('#000000'), 1024));

for (const app of ['frontend', 'admin']) {
  const resDir = join(root, app, 'resources');
  mkdirSync(resDir, { recursive: true });
  copyFileSync(foregroundPath, join(resDir, 'icon-foreground.png'));
  copyFileSync(backgroundPath, join(resDir, 'icon-background.png'));
  copyFileSync(compositePath, join(resDir, 'icon.png'));
}

console.log('OK foreground', foregroundPath);
console.log('OK background', backgroundPath);
console.log('OK composite', compositePath);
