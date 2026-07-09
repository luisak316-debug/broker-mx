# Respaldo Landing Broker.mx — 8 julio 2026 (scroll mercados + Confianza reemplaza Qué hacemos)

Punto de restauración **aprobado por el usuario** («¡Más que perfecto! ¡Guarda los cambios!»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-08-mercados-scroll`
- **Carpeta snapshot:** `backups/landing-2026-07-08-mercados-scroll/`
- **Deploy Vercel:** `dpl_5QyxwN5gpokZ45cyHGV6JGBKgPuz` (bundle `index-gKrHvm_P.js`)

---

## Hero — implementación aprobada

### Scroll + esfera
- Esfera fija, tarjeta vidrio sube, leyenda CNBV hasta «Nuestra firma»
- Panel hero 240–280vh

### Narrativa traders + mercados (aprobado)
- Componente: `LandingTraderScroll.tsx` — `#mercados`
- **Fase 1:** 3 frases + barras borrosas (scroll nativo)
- **Fase 2:** «Qué hacemos» — una categoría por scroll:
  1. Criptomonedas
  2. Bolsa de Valores
  3. Materias Primas
  4. Divisas (Forex)
- Cada categoría: imagen, descripción, bullets, botón **Ver simulador** (abre modal)
- Datos: `landingMarketScroll.ts` + `marketCategories.ts`
- Altura scroll: ~780vh

### Confianza (aprobado — reemplaza sección Qué hacemos fija)
- `LandingConfianzaScroll` + carrusel testimonios **después** del scroll de mercados
- Sin `MarketNewsSection` en landing (grilla 4 noticias eliminada)

---

## Orden de secciones

1. Menú (header sticky)
2. Hero: tarjeta scroll + esfera + leyenda (`#top`)
3. Quiénes Somos (`#quienes`) — **Salinas dentro**
4. **Narrativa + 4 mercados** (`#mercados`) — scroll scrolly
5. **Confianza / testimonios** (`#testimonios`)
6. CTA final + Footer

---

## Cómo restaurar

```powershell
git checkout backup/landing-ok-2026-07-08-mercados-scroll -- frontend/src/styles/index.css
git checkout backup/landing-ok-2026-07-08-mercados-scroll -- frontend/src/pages/Landing.tsx
git checkout backup/landing-ok-2026-07-08-mercados-scroll -- frontend/src/components/landing/LandingTraderScroll.tsx
git checkout backup/landing-ok-2026-07-08-mercados-scroll -- frontend/src/components/landing/LandingConfianzaScroll.tsx
git checkout backup/landing-ok-2026-07-08-mercados-scroll -- frontend/src/components/landing/LandingScrollNarrative.tsx
git checkout backup/landing-ok-2026-07-08-mercados-scroll -- frontend/src/components/landing/capital-scroll
git checkout backup/landing-ok-2026-07-08-mercados-scroll -- frontend/src/hooks/useScrollFrame.ts
git checkout backup/landing-ok-2026-07-08-mercados-scroll -- frontend/src/data/landingMarketScroll.ts

# o:
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08-mercados-scroll\RESTORE.ps1
```

---

## Respaldo anterior

- Tag: `backup/landing-ok-2026-07-08-confianza-cta` (commit `d33be4f`)

---

*Aprobado por el usuario el 8 jul 2026.*
