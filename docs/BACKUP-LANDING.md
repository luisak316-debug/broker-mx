# Respaldo Landing Broker.mx — 8 julio 2026 (leyenda persistente hasta Nuestra firma)

Punto de restauración **aprobado por el usuario** («Perfecto. Save the changes»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-08-leyenda-hold`
- **Carpeta snapshot:** `backups/landing-2026-07-08-leyenda-hold/`
- **Deploy Vercel:** `dpl_4czqRT847mamDz6EMs1uzN5V91FT` (bundle `index-CKcKK4wm.js`)

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
- **Scroll nativo** + `useScrollFrame` (requestAnimationFrame) — sin GSAP
- Aparece al subir la tarjeta vidrio y **permanece en el globo** hasta que `#quienes` («Nuestra firma») entra al viewport
- Fade-out suave cuando la sección Quiénes Somos cubre la leyenda
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
git checkout backup/landing-ok-2026-07-08-leyenda-hold -- frontend/src/styles/index.css
git checkout backup/landing-ok-2026-07-08-leyenda-hold -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-08-leyenda-hold -- frontend/src/components/landing/capital-scroll
git checkout backup/landing-ok-2026-07-08-leyenda-hold -- frontend/src/components/landing/LandingTraderScroll.tsx
git checkout backup/landing-ok-2026-07-08-leyenda-hold -- frontend/src/hooks/useScrollFrame.ts

# o:
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08-leyenda-hold\RESTORE.ps1
```

---

## Respaldo anterior

- Tag: `backup/landing-ok-2026-07-08-trader-scroll` (commit `1385872`) — hero + 3 frases traders scroll nativo

---

*Aprobado por el usuario el 8 jul 2026.*
