# Respaldo Landing Broker.mx — 8 julio 2026 (leyenda reveal detrás tarjeta)

Punto de restauración **aprobado por el usuario** («Perfect, I am very happy»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-08-leyenda-reveal`
- **Carpeta snapshot:** `backups/landing-2026-07-08-leyenda-reveal/`
- **Deploy Vercel:** `dpl_Fx57eazMjo8pkCL5gHNnpTbyHfrk` (bundle `index-rVGbdNwq.js`)

---

## Hero — implementación aprobada

### Scroll + esfera (heredado del respaldo anterior)
- Esfera **fija** en stage sticky (`CapitalGlobeVideo`)
- Solo la **tarjeta vidrio** sube al scroll y pasa bajo el header (z-50)
- `transform: translateY(7%)` en la esfera
- Vídeo local: `frontend/public/video-esfera/video-esfera.mp4`

### Leyenda reveal (nuevo — aprobado)
- Texto: «Soporte local. Conexión global.» + regulación CNBV
- Componente: `CapHeroScrollReveal.tsx` (GSAP ScrollTrigger)
- Posicionada **detrás de la tarjeta vidrio**, alineada con el hero (`max-w-7xl`, padding shell)
- Vive en el **stage fijo** (no dentro de `stage-inner`) para coincidir con la tarjeta
- Aparece al hacer scroll cuando la tarjeta sube; se oculta antes de `#quienes`
- `data-cap-version="8"` en `LandingCapitalScrolly`

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
git checkout backup/landing-ok-2026-07-08-leyenda-reveal -- frontend/src/styles/index.css
git checkout backup/landing-ok-2026-07-08-leyenda-reveal -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-08-leyenda-reveal -- frontend/src/components/landing/capital-scroll

# o:
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08-leyenda-reveal\RESTORE.ps1
```

---

## Respaldo anterior

- Tag: `backup/landing-ok-2026-07-08-video-esfera-scroll-lower` (commit `ad244ec`) — esfera baja 7% + scroll tarjeta, sin leyenda

---

*Aprobado por el usuario el 8 jul 2026.*
