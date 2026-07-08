# Respaldo Landing Broker.mx — 8 julio 2026

Punto de restauración cuando la landing esté **correcta y publicada**.

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-08`
- **Carpeta snapshot:** `backups/landing-2026-07-08/`

---

## Orden EXACTO de secciones (de arriba hacia abajo)

| # | Rubro | ID ancla | Archivo principal | Qué va aquí |
|---|--------|----------|-------------------|-------------|
| 1 | **Menú** | — | `frontend/src/pages/Landing.tsx` | Logo, Quiénes Somos, Mercados, Noticias, Testimonios, Iniciar Sesión, Crear Cuenta |
| 2 | **Hero** | `#top` | `Landing.tsx` + `frontend/src/styles/index.css` | Aurora, titular inflación, CTAs, línea de confianza (asesor, legal, SPEI) |
| 3 | **Quiénes Somos** | `#quienes` | `Landing.tsx` | Ver detalle abajo — **Salinas va DENTRO de esta sección** |
| 4 | **Qué hacemos / Mercados** | `#noticias` | `MarketNewsSection.tsx` | 4 tarjetas de NOTICIAS con foto + botón **Ver simulador** (sin «Ver nota») |
| 5 | **Testimonios** | `#testimonios` | `TestimonialsCarousel.tsx` | Carrusel con fotos reales en `frontend/public/testimonials/` |
| 6 | **CTA final** | — | `Landing.tsx` | «Tu futuro financiero empieza con una decisión» |
| 7 | **Footer** | — | `Landing.tsx` | Aviso legal breve |

---

## Sección «Quiénes Somos» — estructura interna (CRÍTICO)

Todo vive en **una sola** `<section id="quienes">`. En este orden:

1. **Etiqueta:** `Nuestra firma`
2. **Título:** `Quiénes Somos`
3. **Párrafo institucional** (protección, defensa y crecimiento patrimonial)
4. **Párrafo de trayectoria:** empresarios, inversionistas y figuras públicas → *«Broker.mx: el broker en el que puede confiar.»*
5. **Sub-bloque Salinas** (referencia de credibilidad, NO sección aparte):
   - Etiqueta: `Destacado del día`
   - Meta: `Actualizado hoy · México`
   - Descripción: *«Titulares que ilustran la visión de inversión que compartimos con quienes confían en nuestra asesoría.»*
   - Tarjeta: `NewsCard` con `SALINAS_FEATURED_NEWS` (Ricardo Salinas Pliego + Bitcoin)
   - Tiene **«Ver nota →»** (es titular informativo, no simulador)

### ❌ Errores que NO repetir

| Error | Por qué está mal |
|-------|------------------|
| Salinas en sección propia entre mercados y testimonios | Debe estar **dentro** de Quiénes Somos |
| Tarjetas `MarketCategoryCard` con iconos en landing | Reemplazadas por noticias con simulador |
| Diseño Capital.com (globo, narrativa scroll, `.cap-*`) | Usuario lo rechazó explícitamente |
| Reset a `75b62aa` sin confirmar | Pierde fotos, fondeo, simulador, noticias |
| «Actualizado hoy» encima de «Qué hacemos» | Solo corresponde al bloque Salinas en Quiénes Somos |

---

## Sección «Qué hacemos» — 4 mercados

Archivo: `frontend/src/components/landing/MarketNewsSection.tsx`  
Datos: `frontend/src/data/marketNews.default.ts` → `MARKET_NEWS_GRID`

| Tarjeta | Categoría | Acción |
|---------|-----------|--------|
| Bitcoin / ETFs | Criptomonedas | Abre simulador cripto |
| Bolsa Mexicana | Bolsa de Valores | Abre simulador bolsa |
| Oro / commodities | Materias Primas | Abre simulador commodities |
| Dólar-peso / Forex | Divisas | Abre simulador forex |

- Botón: `SimulatorButton` (estilo sunset en `index.css` → `.btn-simulator-sunset`)
- **Sin** enlace «Ver nota →» en estas 4 tarjetas
- Imágenes en `frontend/public/news/`

---

## Archivos clave del respaldo

```
frontend/src/pages/Landing.tsx
frontend/src/components/landing/MarketNewsSection.tsx
frontend/src/components/landing/LandingSectionHeader.tsx
frontend/src/components/landing/SimulatorButton.tsx
frontend/src/components/landing/TestimonialsCarousel.tsx
frontend/src/components/landing/MarketCategoryModal.tsx
frontend/src/data/marketNews.default.ts
frontend/src/data/testimonials.ts
frontend/src/styles/index.css
frontend/tailwind.config.js
frontend/public/testimonials/*.jpg
frontend/public/news/*.jpg
```

### Componentes Capital — NO usar en landing actual

```
LandingGlobeCanvas.tsx
LandingScrollNarrative.tsx
LandingPlatforms.tsx
LandingMarketsShowcase.tsx
```

Existen en el repo pero **no deben importarse** en `Landing.tsx`.

---

## Colores y estilo

- Paleta **azul original** Broker.mx (`brand-500: #1f7aff`, `ink-900: #0b1120`)
- **No** paleta midnight/oro de Capital (`.cap-*`, `cap-midnight`, `cap-gold`)
- Hero: clases `hero-aurora`, `hero-spotlight`, `hero-glitter`

---

## Cómo restaurar desde git

```powershell
cd "C:\Users\H23 BRT\TRADING"

# Opción A: tag de respaldo (recomendado)
git checkout backup/landing-ok-2026-07-08 -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-08 -- frontend/src/components/landing/MarketNewsSection.tsx
git checkout backup/landing-ok-2026-07-08 -- docs/BACKUP-LANDING.md
git checkout backup/landing-ok-2026-07-08 -- backups/landing-2026-07-08/

# Opción B: reset completo al commit de respaldo (destructivo)
# git reset --hard backup/landing-ok-2026-07-08

# Verificar y publicar
cd frontend
npx tsc --noEmit
npx vercel --prod --yes -e VITE_API_URL=https://broker-mx-api.onrender.com
```

## Cómo restaurar desde carpeta snapshot

```powershell
Copy-Item "backups\landing-2026-07-08\Landing.tsx" "frontend\src\pages\Landing.tsx" -Force
Copy-Item "backups\landing-2026-07-08\MarketNewsSection.tsx" "frontend\src\components\landing\MarketNewsSection.tsx" -Force
```

---

## Deploy producción

```powershell
cd frontend
npx vercel --prod --yes -e VITE_API_URL=https://broker-mx-api.onrender.com
```

URL final: **https://brokermx-alpha.vercel.app**

---

*Generado automáticamente. No borrar sin crear un respaldo nuevo primero.*
