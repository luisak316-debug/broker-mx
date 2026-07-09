# Respaldo Landing Broker.mx — 8 julio 2026 (esfera detrás del vidrio)

Punto de restauración **aprobado por el usuario** («Perfectísimo, guarda los cambios»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-08-video-esfera-overlay`
- **Carpeta snapshot:** `backups/landing-2026-07-08-video-esfera-overlay/`
- **Deploy Vercel:** `dpl_2DJsZQoS3WaQ9GoaXX5UDmw8ngPj` (bundle `index-2N3NXUCs.js`)

---

## Orden EXACTO de secciones (de arriba hacia abajo)

| # | Rubro | ID ancla | Archivo principal | Qué va aquí |
|---|--------|----------|-------------------|-------------|
| 1 | **Menú** | — | `Landing.tsx` | Logo, nav, Iniciar Sesión, Crear Cuenta |
| 2 | **Hero + esfera** | `#top` | `LandingCapitalScrolly` + `CapitalGlobeVideoMini` | Tarjeta vidrio encima, esfera detrás (mitad superior bajo el vidrio) |
| 3 | **Quiénes Somos** | `#quienes` | `Landing.tsx` | **Salinas DENTRO** de esta sección |
| 4 | **Qué hacemos / Mercados** | `#noticias` | `MarketNewsSection.tsx` | 4 noticias con foto + **Ver simulador** |
| 5 | **Testimonios** | `#testimonios` | `LandingConfianzaScroll` + `TestimonialsCarousel` | Carrusel con blur scroll |
| 6 | **CTA final** | — | `Landing.tsx` | «Tu futuro financiero empieza con una decisión» |
| 7 | **Footer** | — | `Landing.tsx` | Aviso legal breve |

---

## Esfera — implementación aprobada

Vídeo **local** (completo, sin recorte):

```html
<video muted playsinline loop autoplay>
  <source src="/video-esfera/video-esfera.mp4">
</video>
```

Origen: `VIDEO ESFERA/VIDEO ESFERA.mp4` → `frontend/public/video-esfera/video-esfera.mp4`

### Layout hero (CSS Grid overlay)

- `.cap-hero-stack` — `display: grid; grid-template-areas: 'hero'`
- `.cap-hero-shell` — `grid-area: hero; z-index: 2` (vidrio esmerilado encima)
- `.cap-hero-globe-slot` — `grid-area: hero; z-index: 1; align-self: end; height: 0`
- `.cap-hero-globe-slot__video` — `width: 100%; transform: translateY(-50%)` (mitad superior detrás de la tarjeta)
- Fondo negro `#000000` en `.cap-scrolly`

### Archivos

```
frontend/public/video-esfera/video-esfera.mp4
frontend/src/components/landing/capital-scroll/
├── CapitalGlobeVideoMini.tsx   # Esfera inline en hero
├── CapitalGlobeVideo.tsx       # Stage scrolly (oculto)
├── CapitalHeroDecorCards.tsx
├── LandingCapitalScrolly.tsx
├── globeVideo.ts
└── ...
```

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
| Esfera **debajo** de la tarjeta en flujo vertical | Debe ir **detrás**, en la misma capa grid |
| Posicionamiento solo con JS (`top` dinámico) | Rompe si el vídeo tarda en cargar |
| Hotlink a `europe-bg.mp4` de Capital | Recortado; usar vídeo local |
| Salinas fuera de `#quienes` | Debe estar dentro de Quiénes Somos |

---

## Archivos clave del respaldo

```
frontend/src/pages/Landing.tsx
frontend/public/video-esfera/video-esfera.mp4
frontend/src/components/landing/capital-scroll/*
frontend/src/components/landing/MarketNewsSection.tsx
frontend/src/styles/index.css
backups/landing-2026-07-08-video-esfera-overlay/
```

---

## Cómo restaurar

```powershell
cd "C:\Users\H23 BRT\TRADING"

# Opción A: tag git (recomendado)
git checkout backup/landing-ok-2026-07-08-video-esfera-overlay -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-08-video-esfera-overlay -- frontend/src/components/landing/capital-scroll
git checkout backup/landing-ok-2026-07-08-video-esfera-overlay -- frontend/src/styles/index.css
git checkout backup/landing-ok-2026-07-08-video-esfera-overlay -- frontend/public/video-esfera

# Opción B: script snapshot
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08-video-esfera-overlay\RESTORE.ps1

# Publicar
cd frontend
npm run build:vercel
npx vercel --prod --yes
```

---

## Respaldo anterior (esfera debajo de tarjeta)

- Tag: `backup/landing-ok-2026-07-08-video-esfera` (commit `328dd68`)

## Respaldo anterior (vídeo Capital hotlink)

- Tag: `backup/landing-ok-2026-07-08-video` (commit `49e2dff`)

---

*Aprobado por el usuario el 8 jul 2026. No borrar sin crear respaldo nuevo.*
