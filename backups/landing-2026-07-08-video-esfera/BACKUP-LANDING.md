# Respaldo Landing Broker.mx — 8 julio 2026 (vídeo esfera local)

Punto de restauración **aprobado por el usuario** («Perfectísimo, guarda estos cambios»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-08-video-esfera`
- **Carpeta snapshot:** `backups/landing-2026-07-08-video-esfera/`
- **Deploy Vercel:** `dpl_ECbygqUozqhfusWP5SyesWccRzX1` (bundle `index-CG_blhu_.js`)

---

## Orden EXACTO de secciones (de arriba hacia abajo)

| # | Rubro | ID ancla | Archivo principal | Qué va aquí |
|---|--------|----------|-------------------|-------------|
| 1 | **Menú** | — | `Landing.tsx` | Logo, nav, Iniciar Sesión, Crear Cuenta |
| 2 | **Hero + esfera** | `#top` | `LandingCapitalScrolly` + `CapitalGlobeVideoMini` | Tarjeta vidrio esmerilado + vídeo local debajo |
| 3 | **Quiénes Somos** | `#quienes` | `Landing.tsx` | **Salinas DENTRO** de esta sección |
| 4 | **Qué hacemos / Mercados** | `#noticias` | `MarketNewsSection.tsx` | 4 noticias con foto + **Ver simulador** |
| 5 | **Testimonios** | `#testimonios` | `LandingConfianzaScroll` + `TestimonialsCarousel` | Carrusel con blur scroll |
| 6 | **CTA final** | — | `Landing.tsx` | «Tu futuro financiero empieza con una decisión» |
| 7 | **Footer** | — | `Landing.tsx` | Aviso legal breve |

---

## Esfera — implementación aprobada

Vídeo **local** (completo, sin recorte), no hotlink a Capital.com:

```html
<video muted playsinline loop autoplay>
  <source src="/video-esfera/video-esfera.mp4">
</video>
```

Origen: `VIDEO ESFERA/VIDEO ESFERA.mp4` → `frontend/public/video-esfera/video-esfera.mp4`

### Archivos

```
frontend/public/video-esfera/video-esfera.mp4
frontend/src/components/landing/capital-scroll/
├── CapitalGlobeVideo.tsx       # Vídeo stage (oculto en desktop; inline en hero)
├── CapitalGlobeVideoMini.tsx   # Vídeo inline debajo de tarjeta hero
├── CapitalHeroDecorCards.tsx   # Tarjetas UI decorativas desktop
├── LandingCapitalScrolly.tsx   # Orquestador scrollytelling
├── globeVideo.ts               # GLOBE_VIDEO_SRC constante
├── CapitalCandlestickChart.tsx # Legacy (velas ocultas en CSS)
├── capitalCandleData.ts
├── index.ts
├── useCapitalGlobe.ts          # Legacy Three.js (no usado)
└── buildGlobeGeometry.ts       # Legacy Three.js (no usado)
```

### CSS clave (`frontend/src/styles/index.css`)

- `.cap-hero-shell` — vidrio esmerilado (`backdrop-filter: blur`)
- `.cap-hero-stack` — tarjeta + esfera en columna, mismo ancho
- `.cap-hero-globe-slot` — vídeo centrado debajo de la tarjeta
- `.cap-scrolly__chart { display: none }` — sin velas japonesas
- Vídeo: `object-fit: contain` (sin recorte)

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
| Hotlink a `europe-bg.mp4` de Capital | Recortado; usar vídeo local |
| `object-fit: cover` + `scale` en vídeo | Recorta la esfera |
| Reset a `552269b` sin confirmar | Pierde hero vidrio + esfera local |

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
frontend/public/video-esfera/video-esfera.mp4
frontend/src/components/landing/capital-scroll/*
frontend/src/components/landing/LandingConfianzaScroll.tsx
frontend/src/components/landing/MarketNewsSection.tsx
frontend/src/styles/index.css
frontend/package.json
backups/landing-2026-07-08-video-esfera/
```

---

## Cómo restaurar

```powershell
cd "C:\Users\H23 BRT\TRADING"

# Opción A: tag git (recomendado)
git checkout backup/landing-ok-2026-07-08-video-esfera -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-08-video-esfera -- frontend/src/components/landing/capital-scroll
git checkout backup/landing-ok-2026-07-08-video-esfera -- frontend/src/styles/index.css
git checkout backup/landing-ok-2026-07-08-video-esfera -- frontend/public/video-esfera

# Opción B: script snapshot
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08-video-esfera\RESTORE.ps1

# Publicar
cd frontend
npm install
npm run build:vercel
npx vercel --prod --yes
```

---

## Respaldo anterior (vídeo Capital hotlink)

- Tag: `backup/landing-ok-2026-07-08-video` (commit `49e2dff`)
- Carpeta: `backups/landing-2026-07-08-video/`
- Usaba `europe-bg.mp4` de Capital.com

## Respaldo anterior (sin esfera video)

- Tag: `backup/landing-ok-2026-07-08` (commit `552269b`)
- Hero con aurora azul, sin `.cap-*`

---

*Aprobado por el usuario el 8 jul 2026. No borrar sin crear respaldo nuevo.*
