# Respaldo Landing Broker.mx — 9 julio 2026 (5 mercados + Investing + USD)

Punto de restauración **aprobado por el usuario** («Ok, perfect. Now save the changes»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-09-five-markets`
- **Carpeta snapshot:** `backups/landing-2026-07-09-five-markets/`
- **Commit:** `18f21b4`
- **Deploy Vercel:** `dpl_E2xyFjV5ix2u2tcAryPdHYvv3Ud5`

---

## Cambios aprobados (esta versión)

### 5 categorías de inversión en landing
Orden fijo tras las 3 frases del scroll:
1. Divisas (Forex)
2. Materias Primas
3. Acciones
4. **Índices Bursátiles** (nueva)
5. Criptomonedas

### Destacado del día — Investing.com
- Sincronización con titulares de Investing.com (cache 24 h)
- Salinas Pliego en rotación + imágenes HD 800×533
- Rotación cada 2 minutos

### Simuladores en USD
- Montos: **$1,000 · $3,000 · $5,000 · $20,000 USD** (4 categorías landing)

### Heredado
- Header móvil estable, vidrio esmerilada, responsive, esfera Capital

---

## Orden de secciones

1. Menú (header fijo móvil)
2. Hero: esfera + leyenda CNBV (`#top`)
3. Quiénes Somos (`#quienes`) — **Salinas + Destacado Investing**
4. Narrativa + **5 mercados** (`#mercados`)
5. Confianza / testimonios (`#testimonios`)
6. CTA final + Footer

---

## Cómo restaurar

```powershell
git checkout backup/landing-ok-2026-07-09-five-markets -- frontend/src/pages/Landing.tsx frontend/src/styles/index.css frontend/src/components/landing frontend/src/data/marketCategories.ts frontend/src/data/landingMarketScroll.ts frontend/src/data/landingInstruments.ts frontend/src/hooks/useDailyMarketNews.ts frontend/src/lib/format.ts

# o:
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-09-five-markets\RESTORE.ps1
```

---

## Respaldo anterior

- Tag: `backup/landing-ok-2026-07-09-mobile-header` (commit `9c0b315`)

---

*Aprobado por el usuario el 9 jul 2026.*
