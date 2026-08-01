# Respaldo Portales INVERMAX LATAM — 1 agosto 2026

Punto de restauración **aprobado por el usuario** («Perfect, save the changes.»).

- **Asesores:** https://advisors-brown.vercel.app/ (proyecto Vercel `advisors`)
- **Asesores (alt):** https://brokermxadvisors.vercel.app/ (proyecto `brokermx.advisors`)
- **Admin:** https://brokermxadmin-khaki.vercel.app/ · https://invermaxlatam.com/admin847/
- **Supervisores:** https://brokermxsupervisors.vercel.app/
- **Clientes:** https://invermaxlatam.com/
- **API:** https://broker-mx-api.onrender.com
- **Tag git:** `backup/portales-ok-2026-08-01`
- **Commit:** `c66d742`
- **Carpeta snapshot:** `backups/portales-2026-08-01/`

---

## Cambios aprobados (esta versión)

### Portal asesores (`advisors/`)
- Historial de contactos por periodo (Hoy, Ayer, Semana pasada, Mes pasado, por año)
- Botón **Volver a llamar** en contactos anteriores
- API: `GET /api/advisor/my-contacts/history`
- Llamadas vía MicroSIP (`advisors-brown`) o WebRTC según `SIP_CALL_MODE`
- Favicon: `favicon.ico` + `favicon.svg` (logotipo «I» original, no PNG recortado)

### Marca y favicon (todos los portales)
- `BrandMark` — «I» con gradiente carbón→dorado y halo ámbar (CSS, **no** imagen recortada)
- Favicon SVG/ICO coherente con el BrandMark

### Admin
- Logo **INVERMAX LATAM** solo en sidebar (arriba de Dashboard)
- Topbar sin duplicado de marca — solo usuario y Salir

### Deploy
- `DESPLEGAR_ASESORES.bat` → proyecto Vercel `advisors` (`advisors-brown.vercel.app`)

---

## Cómo restaurar

```powershell
git checkout backup/portales-ok-2026-08-01 -- advisors admin supervisors frontend/index.html frontend/public/favicon.svg frontend/public/favicon.ico frontend/src/components/brand shared/brand backend/src/controllers/admin/advisorContacts.controller.ts backend/src/repositories/advisorContact.repository.ts backend/src/routes/advisor.ts DESPLEGAR_ASESORES.bat docs/BACKUP-PORTALES.md docs/PROJECT-BRAIN.md

# o:
powershell -ExecutionPolicy Bypass -File backups\portales-2026-08-01\RESTORE.ps1
```

Luego redesplegar Vercel si hace falta.

---

## Respaldo anterior (admin)

- Tag: `backup/admin-ok-2026-07-09-comisiones-tema-negro` — ver `docs/BACKUP-ADMIN.md`

---

*Aprobado por el usuario el 1 ago 2026.*
