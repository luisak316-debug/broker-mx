# Respaldo Landing Broker.mx — 8 julio 2026 (esfera fija + tarjeta scroll)

Punto de restauración **aprobado por el usuario** («Perfectísimo, guarda los cambios»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-08-video-esfera-scroll`
- **Carpeta snapshot:** `backups/landing-2026-07-08-video-esfera-scroll/`
- **Deploy Vercel:** `dpl_GTCcur3EXG6k4dHe2XFyN8iAtMBQ` (bundle `index-jy-2ukI9.js`)

---

## Orden EXACTO de secciones (de arriba hacia abajo)

| # | Rubro | ID ancla | Archivo principal | Qué va aquí |
|---|--------|----------|-------------------|-------------|
| 1 | **Menú** | — | `Landing.tsx` | Logo, nav, Iniciar Sesión, Crear Cuenta (sticky z-50) |
| 2 | **Hero + esfera** | `#top` | `LandingCapitalScrolly` + `CapitalGlobeVideo` | Tarjeta vidrio scroll; esfera fija abajo |
| 3 | **Quiénes Somos** | `#quienes` | `Landing.tsx` | **Salinas DENTRO** de esta sección |
| 4 | **Qué hacemos / Mercados** | `#noticias` | `MarketNewsSection.tsx` | 4 noticias con foto + **Ver simulador** |
| 5 | **Testimonios** | `#testimonios` | `LandingConfianzaScroll` + `TestimonialsCarousel` | Carrusel con blur scroll |
| 6 | **CTA final** | — | `Landing.tsx` | «Tu futuro financiero empieza con una decisión» |
| 7 | **Footer** | — | `Landing.tsx` | Aviso legal breve |

---

## Hero — implementación aprobada

### Scroll (Capital.com)
- **Esfera fija** en `cap-scrolly__stage` sticky (`CapitalGlobeVideo`)
- **Solo la tarjeta vidrio** sube al hacer scroll y pasa **debajo del header**
- Al subir scroll, la tarjeta vuelve a su posición
- **Sin leyenda** «Soporte local» (pendiente en fase siguiente)

### Vídeo local
```html
<video muted playsinline loop autoplay>
  <source src="/video-esfera/video-esfera.mp4">
</video>
```

Origen: `VIDEO ESFERA/VIDEO ESFERA.mp4` → `frontend/public/video-esfera/video-esfera.mp4`

### CSS clave
- `.cap-scrolly__stage` — sticky 100vh, esfera anclada abajo (`transform: translateY(0)`)
- `.cap-scrolly__track` — z-index 3, `margin-top: -100vh`
- `.cap-scrolly__panel--hero` — min-height ~145–155vh (recorrido scroll tarjeta)
- `.cap-hero-shell` — tarjeta vidrio esmerilado en el track

### Archivos
```
frontend/public/video-esfera/video-esfera.mp4
frontend/src/components/landing/capital-scroll/
├── CapitalGlobeVideo.tsx       # Esfera fija en stage
├── CapitalGlobeVideoMini.tsx   # Legacy (no usado en hero actual)
├── LandingCapitalScrolly.tsx   # data-cap-version="7"
├── CapitalHeroDecorCards.tsx
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
| Parallax en la esfera al scroll | Usuario quiere esfera **fija** |
| `translateY` negativo grande en vídeo | Sube la esfera hacia el header |
| Leyenda reveal sin probar al 100% zoom | Rompe la experiencia; añadir en fase aparte |
| Salinas fuera de `#quienes` | Debe estar dentro de Quiénes Somos |

---

## Archivos clave del respaldo

```
frontend/src/pages/Landing.tsx
frontend/public/video-esfera/video-esfera.mp4
frontend/src/components/landing/capital-scroll/*
frontend/src/styles/index.css
backups/landing-2026-07-08-video-esfera-scroll/
```

---

## Cómo restaurar

```powershell
cd "C:\Users\H23 BRT\TRADING"

# Opción A: tag git (recomendado)
git checkout backup/landing-ok-2026-07-08-video-esfera-scroll -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-08-video-esfera-scroll -- frontend/src/components/landing/capital-scroll
git checkout backup/landing-ok-2026-07-08-video-esfera-scroll -- frontend/src/styles/index.css
git checkout backup/landing-ok-2026-07-08-video-esfera-scroll -- frontend/public/video-esfera

# Opción B: script snapshot
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08-video-esfera-scroll\RESTORE.ps1

# Publicar
cd frontend
npm run build:vercel
npx vercel --prod --yes
```

---

## Respaldo anterior (grid overlay sin scroll)

- Tag: `backup/landing-ok-2026-07-08-video-esfera-overlay` (commit `950f3f7`)

---

*Aprobado por el usuario el 8 jul 2026. No borrar sin crear respaldo nuevo.*
