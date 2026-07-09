# Respaldo Landing Broker.mx — 8 julio 2026 (sin hueco Confianza → CTA)

Punto de restauración **aprobado por el usuario** («Perfect, save the changes»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-08-confianza-cta`
- **Carpeta snapshot:** `backups/landing-2026-07-08-confianza-cta/`
- **Deploy Vercel:** `dpl_Hy9FWDEEdJ3NF5T2YcRNGi5rmvPv` (bundle `index-BjI-nHq6.js`)

---

## Hero — implementación aprobada

### Scroll + esfera
- Esfera **fija** en stage sticky (`CapitalGlobeVideo`)
- Solo la **tarjeta vidrio** sube al scroll y pasa bajo el header (z-50)
- `transform: translateY(7%)` en la esfera
- Vídeo local: `frontend/public/video-esfera/video-esfera.mp4`
- Panel hero **240–280vh** para más recorrido de scroll

### Leyenda reveal (aprobado)
- Texto: «Soporte local. Conexión global.» + regulación CNBV
- Componente: `CapHeroScrollReveal.tsx`
- **Scroll nativo** + `useScrollFrame` — sin GSAP
- Permanece en el globo hasta `#quienes` («Nuestra firma»)
- Texto blanco sólido `#ffffff`

### Narrativa traders (aprobado — después de Salinas)
- Componente: `LandingTraderScroll.tsx`
- 3 frases + barras ámbar/blancas, scroll nativo

### Confianza / testimonios (aprobado)
- Componente: `LandingConfianzaScroll.tsx` → `LandingScrollNarrative` modo `backdrop`
- **Sin pin GSAP** — altura natural del contenido (elimina ~220vh de hueco negro)
- Barras decorativas estáticas detrás del carrusel
- CTA «Comienza a invertir desde hoy» pegado debajo de testimonios

---

## Orden de secciones

1. Menú (header sticky)
2. Hero: tarjeta scroll + esfera fija + leyenda reveal (`#top`)
3. Quiénes Somos (`#quienes`) — **Salinas dentro**
4. **Narrativa traders** (`#narrativa-trading`)
5. Qué hacemos / 4 noticias (`#noticias`)
6. Testimonios (`#testimonios`)
7. CTA final + Footer

---

## Cómo restaurar

```powershell
git checkout backup/landing-ok-2026-07-08-confianza-cta -- frontend/src/styles/index.css
git checkout backup/landing-ok-2026-07-08-confianza-cta -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-08-confianza-cta -- frontend/src/components/landing/capital-scroll
git checkout backup/landing-ok-2026-07-08-confianza-cta -- frontend/src/components/landing/LandingScrollNarrative.tsx
git checkout backup/landing-ok-2026-07-08-confianza-cta -- frontend/src/components/landing/LandingConfianzaScroll.tsx
git checkout backup/landing-ok-2026-07-08-confianza-cta -- frontend/src/components/landing/LandingTraderScroll.tsx
git checkout backup/landing-ok-2026-07-08-confianza-cta -- frontend/src/hooks/useScrollFrame.ts

# o:
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08-confianza-cta\RESTORE.ps1
```

---

## Respaldo anterior

- Tag: `backup/landing-ok-2026-07-08-leyenda-hold` (commit `8eda3c7`) — leyenda persistente hasta Nuestra firma

---

*Aprobado por el usuario el 8 jul 2026.*
