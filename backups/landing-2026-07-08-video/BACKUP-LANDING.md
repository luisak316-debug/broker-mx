# Respaldo Landing Broker.mx — 8 julio 2026 (esfera Capital video)

Punto de restauración **aprobado por el usuario** («Perfectísimo, genial. Estoy asombrado»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-08-video`
- **Carpeta snapshot:** `backups/landing-2026-07-08-video/`
- **Deploy Vercel:** `dpl_6viumQoJWzr22mMQ6TUzhNftUJUh` (bundle `index-BhKZZsXI.js`)

---

## Orden EXACTO de secciones (de arriba hacia abajo)

| # | Rubro | ID ancla | Archivo principal | Qué va aquí |
|---|--------|----------|-------------------|-------------|
| 1 | **Menú** | — | `Landing.tsx` | Logo, nav, Iniciar Sesión, Crear Cuenta |
| 2 | **Hero + esfera Capital** | `#top` | `LandingCapitalScrolly` + `CapitalGlobeVideo` | Vídeo `europe-bg.mp4` sticky, texto hero arriba-izquierda, velas SVG al scroll |
| 3 | **Quiénes Somos** | `#quienes` | `Landing.tsx` | **Salinas DENTRO** de esta sección |
| 4 | **Qué hacemos / Mercados** | `#noticias` | `MarketNewsSection.tsx` | 4 noticias con foto + **Ver simulador** |
| 5 | **Testimonios** | `#testimonios` | `LandingConfianzaScroll` + `TestimonialsCarousel` | Carrusel con blur scroll |
| 6 | **CTA final** | — | `Landing.tsx` | «Tu futuro financiero empieza con una decisión» |
| 7 | **Footer** | — | `Landing.tsx` | Aviso legal breve |

---

## Esfera Capital — implementación aprobada

Capital.com usa un **vídeo pre-renderizado**, no WebGL en vivo:

```html
<video muted playsinline loop autoplay>
  <source src="https://static.capital.com/home/regulation/europe-bg.mp4">
</video>
```

### Archivos

```
frontend/src/components/landing/capital-scroll/
├── CapitalGlobeVideo.tsx      # Vídeo sticky + parallax GSAP
├── LandingCapitalScrolly.tsx # Orquestador scrollytelling
├── CapitalCandlestickChart.tsx
├── capitalCandleData.ts
├── index.ts
├── useCapitalGlobe.ts         # Legacy Three.js (no usado en landing)
└── buildGlobeGeometry.ts      # Legacy Three.js (no usado en landing)
```

### CSS

Clases `.cap-scrolly*` en `frontend/src/styles/index.css`:
- Stage sticky `100vh`, fondo `#000000`
- Vídeo anclado abajo con viñetas
- Track con `margin-top: -100vh` para scroll sobre la esfera

### Dependencias (`frontend/package.json`)

- `gsap` — ScrollTrigger parallax
- `three` — solo archivos legacy, no montados en landing actual

---

## Sección «Quiénes Somos» — estructura interna (CRÍTICO)

Todo en **una sola** `<section id="quienes">`:

1. Etiqueta `Nuestra firma`
2. Título `Quiénes Somos`
3. Párrafo institucional
4. Párrafo de trayectoria → *«Broker.mx: el broker en el que puede confiar.»*
5. **Sub-bloque Salinas** (`NewsCard` + `SALINAS_FEATURED_NEWS`, con «Ver nota →»)

### ❌ Errores que NO repetir

| Error | Por qué está mal |
|-------|------------------|
| Salinas fuera de `#quienes` | Debe estar dentro de Quiénes Somos |
| Reemplazar vídeo por Three.js procedural | No coincide con Capital; usuario lo rechazó |
| Reset a `552269b` sin confirmar | Pierde la esfera video aprobada |
| Hotlink roto al CDN de Capital | Considerar copiar MP4 a `frontend/public/` |

---

## Sección «Qué hacemos» — 4 mercados

Archivo: `MarketNewsSection.tsx`  
Datos: `marketNews.default.ts`

- 4 tarjetas con foto + `SimulatorButton`
- **Sin** «Ver nota →» en estas tarjetas

---

## Archivos clave del respaldo

```
frontend/src/pages/Landing.tsx
frontend/src/components/landing/capital-scroll/*
frontend/src/components/landing/LandingConfianzaScroll.tsx
frontend/src/components/landing/MarketNewsSection.tsx
frontend/src/components/landing/TestimonialsCarousel.tsx
frontend/src/styles/index.css
frontend/package.json
backups/landing-2026-07-08-video/
```

---

## Cómo restaurar

```powershell
cd "C:\Users\H23 BRT\TRADING"

# Opción A: tag git (recomendado)
git checkout backup/landing-ok-2026-07-08-video -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-08-video -- frontend/src/components/landing/capital-scroll
git checkout backup/landing-ok-2026-07-08-video -- frontend/src/styles/index.css

# Opción B: script snapshot
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08-video\RESTORE.ps1

# Publicar
cd frontend
npm install
npm run build:vercel
npx vercel --prod --yes
```

---

## Respaldo anterior (sin esfera video)

- Tag: `backup/landing-ok-2026-07-08` (commit `552269b`)
- Hero con aurora azul, sin `.cap-*`

---

*Aprobado por el usuario el 8 jul 2026. No borrar sin crear respaldo nuevo.*
