# Respaldo Landing Broker.mx — 9 julio 2026 (vidrio esmerilado + responsive)

Punto de restauración **aprobado por el usuario** («Perfect, save changes»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-09-glass`
- **Carpeta snapshot:** `backups/landing-2026-07-09-glass/`
- **Commit:** `004cf81`
- **Deploy Vercel:** `dpl_XukY6Vg1p3ZJQWfLZ2Mr4oJgpbZA`

---

## Cambios aprobados

### Vidrio esmerilado esmeralda
- Tarjetas de las 4 categorías (`#mercados`) — clase `landing-glass-emerald`
- Todos los botones de la landing — `btn-landing-glass` / `--ghost`
- Botón **Ver simulador** — vidrio esmerilado (sin animación tornasol)
- Testimonios y CTA final — vidrio esmerilado

### Efectos dorado + confeti (mantenidos)
- `GoldenHighlight` en títulos acordados
- Confeti en CTAs principales y Ver simulador

### Responsive (móvil, tablet, laptop, desktop)
- Hero: botones apilados en móvil, tipografía ajustada
- Nav móvil con enlaces a secciones (debajo del header)
- Tarjetas de categoría: más espacio vertical en pantallas pequeñas
- Testimonios: 1 col móvil · 2 cols tablet · 3 cols desktop
- Sin overflow horizontal en `.landing-page`

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
git checkout backup/landing-ok-2026-07-09-glass -- frontend/src/styles/index.css
git checkout backup/landing-ok-2026-07-09-glass -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-09-glass -- frontend/src/components/landing

# o:
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-09-glass\RESTORE.ps1
```

---

## Respaldo anterior

- Tag: `backup/landing-ok-2026-07-08-mercados-scroll` (commit `1c7a60e`)

---

*Aprobado por el usuario el 9 jul 2026.*
