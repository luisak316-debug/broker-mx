# Respaldo Landing Broker.mx — 8 julio 2026 (leyenda blanco sólido + scroll suave)

Punto de restauración **aprobado por el usuario** («Perfectissimo, perfecto»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-08-leyenda-solid`
- **Carpeta snapshot:** `backups/landing-2026-07-08-leyenda-solid/`
- **Deploy Vercel:** `dpl_51ejdy3dzUfFQQEkjvhbXcsPaVSs` (bundle `index-DZRtxJta.js`)

---

## Hero — implementación aprobada

### Scroll + esfera
- Esfera **fija** en stage sticky (`CapitalGlobeVideo`)
- Solo la **tarjeta vidrio** sube al scroll y pasa bajo el header (z-50)
- `transform: translateY(7%)` en la esfera
- Vídeo local: `frontend/public/video-esfera/video-esfera.mp4`

### Leyenda reveal (aprobado)
- Texto: «Soporte local. Conexión global.» + regulación CNBV
- Componente: `CapHeroScrollReveal.tsx` (GSAP ScrollTrigger)
- **Detrás de la tarjeta vidrio**, alineada con el hero (`max-w-7xl`, padding shell)
- Stage fijo (no dentro de `stage-inner`)
- `data-cap-version="8"` en `LandingCapitalScrolly`

### Animación leyenda (ajuste aprobado)
- Texto **blanco sólido** `#ffffff` (título y subtítulo)
- **Sin fade de opacidad** — evita blanco semitransparente al hacer scroll
- Entrada/salida con `visibility` + movimiento vertical suave
- `scrub: 1.35` — scroll más lento, menos parpadeo

---

## Orden de secciones

1. Menú (header sticky)
2. Hero: tarjeta scroll + esfera fija + leyenda reveal (`#top`)
3. Quiénes Somos (`#quienes`) — **Salinas dentro**
4. Qué hacemos / 4 noticias (`#noticias`)
5. Testimonios (`#testimonios`)
6. CTA final + Footer

---

## Cómo restaurar

```powershell
git checkout backup/landing-ok-2026-07-08-leyenda-solid -- frontend/src/styles/index.css
git checkout backup/landing-ok-2026-07-08-leyenda-solid -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-08-leyenda-solid -- frontend/src/components/landing/capital-scroll

# o:
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08-leyenda-solid\RESTORE.ps1
```

---

## Respaldo anterior

- Tag: `backup/landing-ok-2026-07-08-leyenda-reveal` (commit `65c756f`) — leyenda con fade opacidad (reemplazado)

---

*Aprobado por el usuario el 8 jul 2026.*
