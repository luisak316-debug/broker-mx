# Respaldo Landing Broker.mx — 9 julio 2026 (header móvil estable)

Punto de restauración **aprobado por el usuario** («Perfect. Save changes» — sin vibración en scroll iPhone).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-09-mobile-header`
- **Carpeta snapshot:** `backups/landing-2026-07-09-mobile-header/`
- **Deploy Vercel:** `dpl_CCup897usmFmSEwiCjxTdD4pYLAX`

---

## Cambios aprobados (esta versión)

### Header móvil sin vibración (iPhone)
- Header **fijo** en móvil (`position: fixed`) — no sticky
- Sin `backdrop-blur` en iOS (fondo sólido)
- Altura `--landing-header-h` estable (sin ResizeObserver en móvil)
- Capa GPU + `100svh` en secciones sticky

### Heredado (respaldos 9 jul)
- Fixes móvil: textos visibles bajo header, título categorías se oculta al pasar tarjetas
- Vidrio esmerilado esmeralda, GoldenHighlight, confeti, responsive completo

---

## Orden de secciones

1. Menú (header fijo móvil + nav móvil)
2. Hero: tarjeta scroll + esfera + leyenda CNBV (`#top`)
3. Quiénes Somos (`#quienes`) — **Salinas dentro**
4. Narrativa + 4 mercados (`#mercados`)
5. Confianza / testimonios (`#testimonios`)
6. CTA final + Footer

---

## Cómo restaurar

```powershell
git checkout backup/landing-ok-2026-07-09-mobile-header -- frontend/src/styles/index.css
git checkout backup/landing-ok-2026-07-09-mobile-header -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-09-mobile-header -- frontend/src/components/landing/LandingTraderScroll.tsx

# o:
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-09-mobile-header\RESTORE.ps1
```

---

## Respaldo anterior

- Tag: `backup/landing-ok-2026-07-09-mobile` (commit `e4bdca2`)

---

*Aprobado por el usuario el 9 jul 2026.*
