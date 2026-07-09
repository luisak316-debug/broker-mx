# Respaldo Landing Broker.mx — 8 julio 2026 (esfera baja + scroll tarjeta)

Punto de restauración **aprobado por el usuario** («Perfecto. Perfectísimo. Guarda el cambio»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-08-video-esfera-scroll-lower`
- **Carpeta snapshot:** `backups/landing-2026-07-08-video-esfera-scroll-lower/`
- **Deploy Vercel:** `dpl_5CFyLnfTHffWQ7rgWSne8bnEJNFT` (bundle `index-DboPBk6O.js`)

---

## Hero — implementación aprobada

### Scroll
- Esfera **fija** en stage sticky (`CapitalGlobeVideo`)
- Solo la **tarjeta vidrio** sube al scroll y pasa bajo el header (z-50)

### Posición esfera (ajuste aprobado)
- Anclada abajo del viewport
- `transform: translateY(7%)` — un poco más abajo
- Padding inferior reducido en `.cap-scrolly__globe-anchor`

### Vídeo local
- `frontend/public/video-esfera/video-esfera.mp4`
- Origen: `VIDEO ESFERA/VIDEO ESFERA.mp4`

---

## Orden de secciones

1. Menú (header sticky)
2. Hero: tarjeta scroll + esfera fija (`#top`)
3. Quiénes Somos (`#quienes`) — **Salinas dentro**
4. Qué hacemos / 4 noticias (`#noticias`)
5. Testimonios (`#testimonios`)
6. CTA final + Footer

---

## Cómo restaurar

```powershell
git checkout backup/landing-ok-2026-07-08-video-esfera-scroll-lower -- frontend/src/styles/index.css
git checkout backup/landing-ok-2026-07-08-video-esfera-scroll-lower -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-08-video-esfera-scroll-lower -- frontend/src/components/landing/capital-scroll

# o:
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08-video-esfera-scroll-lower\RESTORE.ps1
```

---

## Respaldo anterior

- Tag: `backup/landing-ok-2026-07-08-video-esfera-scroll` (commit `b19b8e4`) — esfera fija sin bajar 7%

---

*Aprobado por el usuario el 8 jul 2026.*
