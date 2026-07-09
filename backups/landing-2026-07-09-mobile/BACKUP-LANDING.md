# Respaldo Landing Broker.mx — 9 julio 2026 (móvil: header + categorías)

Punto de restauración **aprobado por el usuario** («Perfect, save changes» — fixes iPhone).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-09-mobile`
- **Carpeta snapshot:** `backups/landing-2026-07-09-mobile/`
- **Deploy Vercel:** `dpl_C56hg4d88AC6u2GeBHHwRA1uQK5a`

---

## Cambios aprobados (esta versión)

### Fixes móvil (iPhone / dispositivos)
- Header mide altura real (`ResizeObserver` → `--landing-header-h`)
- Leyenda **Conexión global** y **3 frases** ya no quedan tapadas por logo/botones/nav
- Sección mercados anclada debajo del header sticky
- Título «Acceso a las 4 categorías…» se desvanece al iniciar tarjetas (no queda detrás del vidrio)
- Tarjetas ocupan pantalla completa en modo `--cards-only`

### Heredado del respaldo glass (9 jul)
- Vidrio esmerilado esmeralda en categorías, botones, testimonios, CTA
- GoldenHighlight + confeti en CTAs acordados
- Responsive multi-dispositivo (nav móvil, grillas testimonios)

---

## Orden de secciones

1. Menú (header sticky + nav móvil)
2. Hero: tarjeta scroll + esfera + leyenda CNBV (`#top`)
3. Quiénes Somos (`#quienes`) — **Salinas dentro**
4. Narrativa + 4 mercados (`#mercados`) — scroll scrolly
5. Confianza / testimonios (`#testimonios`)
6. CTA final + Footer

---

## Cómo restaurar

```powershell
git checkout backup/landing-ok-2026-07-09-mobile -- frontend/src/styles/index.css
git checkout backup/landing-ok-2026-07-09-mobile -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-09-mobile -- frontend/src/components/landing/LandingTraderScroll.tsx
git checkout backup/landing-ok-2026-07-09-mobile -- frontend/src/components/landing/capital-scroll/CapHeroScrollReveal.tsx

# o:
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-09-mobile\RESTORE.ps1
```

---

## Respaldo anterior

- Tag: `backup/landing-ok-2026-07-09-glass` (commit `004cf81`)

---

*Aprobado por el usuario el 9 jul 2026.*
