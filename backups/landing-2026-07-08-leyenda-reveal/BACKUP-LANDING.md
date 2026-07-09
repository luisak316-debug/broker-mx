# Respaldo Landing Broker.mx — 8 julio 2026 (leyenda reveal detrás tarjeta)

Punto de restauración **aprobado por el usuario** («Perfect, I am very happy»).

- **Producción:** https://brokermx-alpha.vercel.app
- **Tag git:** `backup/landing-ok-2026-07-08-leyenda-reveal`
- **Carpeta snapshot:** `backups/landing-2026-07-08-leyenda-reveal/`
- **Deploy Vercel:** `dpl_Fx57eazMjo8pkCL5gHNnpTbyHfrk`

---

## Hero — leyenda reveal

- `CapHeroScrollReveal.tsx` — fade in/out con GSAP al scroll
- Alineada con la tarjeta vidrio (`max-w-7xl`, padding `cap-hero-shell`)
- Stage fijo z-1; tarjeta track z-3; leyenda z-2

Ver `docs/BACKUP-LANDING.md` en la raíz del repo para detalle completo.

---

## Restaurar

```powershell
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08-leyenda-reveal\RESTORE.ps1
```
