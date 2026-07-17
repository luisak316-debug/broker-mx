# Respaldo Admin + Supervisores Broker.mx — 9 julio 2026

Punto de restauración **aprobado por el usuario** («Perfect. Save everything.»).

- **Admin producción:** https://invermaxlatam.com/admin847/ (Vercel: https://invermax-latam-admin.vercel.app)
- **Supervisores producción:** https://invermax-latam-supervisors.vercel.app
- **API:** https://broker-mx-api.onrender.com
- **Tag git:** `backup/admin-ok-2026-07-09-comisiones-tema-negro`
- **Carpeta snapshot:** `backups/admin-2026-07-09-comisiones-tema-negro/`
- **Commit:** `4bb20a2`
- **Deploy admin Vercel:** `dpl_DHaFYCHuf5GrrWriksEt3usvtm1P`
- **Deploy supervisores Vercel:** (tema negro, commit `93ab648`)

---

## Cambios aprobados (esta versión)

### Tema negro profesional (admin + supervisores)
- Fondo negro sólido, sin verde «hacker»
- Paneles oscuros; esmerilado mínimo solo en header
- Acentos dorados / ámbar en botones y navegación activa

### Comisiones en ficha cliente (admin)
- **Custodia / mantenimiento:** 0,1% – 0,4% sobre nocional de operaciones abiertas
- **Gestión anual:** 1% – 2,75% sobre patrimonio (saldo + invertido), prorrateo mensual / trimestral / anual
- API: `POST /api/admin/clients/:id/commission`
- Auditoría: `COMMISSION_CHARGE`
- Descuento automático del saldo disponible

### Heredado de respaldo anterior
- Bonos (4 tipos), solicitudes de efectivo en supervisores, tema portal base

---

## Cómo restaurar

```powershell
git checkout backup/admin-ok-2026-07-09-comisiones-tema-negro -- admin supervisors backend/src/controllers/admin backend/src/lib/bonusCalc.ts backend/src/lib/commissionCalc.ts backend/src/routes/admin.ts backend/src/services/portfolio.service.ts docs/BACKUP-ADMIN.md

# o:
powershell -ExecutionPolicy Bypass -File backups\admin-2026-07-09-comisiones-tema-negro\RESTORE.ps1
```

---

## Respaldo anterior

- Tag: `backup/admin-ok-2026-07-09-portal-bonos` (commit `e9b2b73`)

---

*Aprobado por el usuario el 9 jul 2026.*
