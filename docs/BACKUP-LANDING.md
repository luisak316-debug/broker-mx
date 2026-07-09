# Respaldo Landing Broker.mx — 8 julio 2026 (hero + trader scroll nativo)

Punto de restauración **aprobado por el usuario** («Perfectísimo. Guarda los cambios»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-08-trader-scroll`
- **Carpeta snapshot:** `backups/landing-2026-07-08-trader-scroll/`
- **Deploy Vercel:** `dpl_kXKE4Uji1qNk5rqP8KY6TM6K54Xx` (bundle `index-DGABHV2k.js`)

---

## Hero — implementación aprobada

### Scroll + esfera
- Esfera **fija** en stage sticky (`CapitalGlobeVideo`)
- Solo la **tarjeta vidrio** sube al scroll y pasa bajo el header (z-50)
- `transform: translateY(7%)` en la esfera
- Vídeo local: `frontend/public/video-esfera/video-esfera.mp4`

### Leyenda reveal (aprobado)
- Texto: «Soporte local. Conexión global.» + regulación CNBV
- Componente: `CapHeroScrollReveal.tsx`
- **Scroll nativo** + `useScrollFrame` (requestAnimationFrame) — sin GSAP
- Detrás de la tarjeta vidrio, alineada con el hero
- Texto blanco sólido `#ffffff`

### Narrativa traders (aprobado — después de Salinas)
- Componente: `LandingTraderScroll.tsx`
- 3 frases: traders pierde dinero → mercado juega su papel → tus decisiones marcan la diferencia
- Barras ámbar/blancas se mueven a la **izquierda** al bajar, a la **derecha** al subir
- `height: 400vh` + `position: sticky` + scroll nativo (sin GSAP pin)
- Hook compartido: `frontend/src/hooks/useScrollFrame.ts`

---

## Orden de secciones

1. Menú (header sticky)
2. Hero: tarjeta scroll + esfera fija + leyenda reveal (`#top`)
3. Quiénes Somos (`#quienes`) — **Salinas dentro**
4. **Narrativa traders** (`#narrativa-trading`) — 3 frases + barras
5. Qué hacemos / 4 noticias (`#noticias`)
6. Testimonios (`#testimonios`)
7. CTA final + Footer

---

## Cómo restaurar

```powershell
git checkout backup/landing-ok-2026-07-08-trader-scroll -- frontend/src/styles/index.css
git checkout backup/landing-ok-2026-07-08-trader-scroll -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-08-trader-scroll -- frontend/src/components/landing/capital-scroll
git checkout backup/landing-ok-2026-07-08-trader-scroll -- frontend/src/components/landing/LandingTraderScroll.tsx
git checkout backup/landing-ok-2026-07-08-trader-scroll -- frontend/src/hooks/useScrollFrame.ts

# o:
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08-trader-scroll\RESTORE.ps1
```

---

## Respaldo anterior

- Tag: `backup/landing-ok-2026-07-08-leyenda-solid` (commit `409ece6`) — leyenda blanco sólido sin narrativa traders

---

*Aprobado por el usuario el 8 jul 2026.*
