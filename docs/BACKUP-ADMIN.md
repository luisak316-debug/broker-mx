# Respaldo Admin + Supervisores Broker.mx — 9 julio 2026

Punto de restauración **aprobado por el usuario** («Perfect, save changes»).

- **Admin producción:** https://brokermxadmin-khaki.vercel.app
- **Supervisores producción:** https://brokermxsupervisors.vercel.app
- **API:** https://broker-mx-api.onrender.com
- **Tag git:** `backup/admin-ok-2026-07-09-portal-bonos`
- **Carpeta snapshot:** `backups/admin-2026-07-09-portal-bonos/`
- **Commit:** `e9b2b73`
- **Deploy admin Vercel:** `dpl_Hd5oKTk9YT8cWqvnAScnkKEmajHW`
- **Deploy supervisores Vercel:** `dpl_H4emBddTQieGWQhbwZphi3UXoTMb`

---

## Cambios aprobados (esta versión)

### Tema portal (admin + supervisores)
- Vidrio esmeralda, brillos dorados, fondo atmosférico
- CSS: `portal-theme.css` en cada app

### Solicitudes de efectivo → supervisores
- Removido de admin; disponible en `/solicitudes` (supervisores)
- API: `GET/PATCH /api/supervisor/cash-requests`

### Bonos en ficha cliente (admin)
- Apartado **Bonos** debajo de cuenta de depósito
- 4 tipos: depósito, fijo, % saldo, % invertido
- API: `POST /api/admin/clients/:id/bonus`
- Auditoría: `BONUS_GRANT`

---

## Cómo restaurar

```powershell
git checkout backup/admin-ok-2026-07-09-portal-bonos -- admin supervisors backend/src/controllers/admin/finance.controller.ts backend/src/lib/bonusCalc.ts backend/src/routes/admin.ts backend/src/routes/supervisor.ts shared

# o:
powershell -ExecutionPolicy Bypass -File backups\admin-2026-07-09-portal-bonos\RESTORE.ps1
```

---

## Respaldo anterior

- Landing: `backup/landing-ok-2026-07-09-five-markets` (commit `c0e5c05`)
- LATAM: `backup/latam-ok-2026-07-09`

---

*Aprobado por el usuario el 9 jul 2026.*
