# Respaldo Landing Broker.mx — 9 julio 2026 (registro portal + términos)

Punto de restauración **aprobado por el usuario** («Perfect. Save everything.»).

- **Producción:** https://invermaxlatam.com (Vercel: https://invermax-latam.vercel.app)
- **Registro:** https://invermaxlatam.com/registro
- **Tag git:** `backup/landing-ok-2026-07-09-registro-portal`
- **Carpeta snapshot:** `backups/landing-2026-07-09-registro-portal/`
- **Commit:** `4bb20a2`
- **Deploy Vercel:** `dpl_37DNCro5uoszFDdJJ92LGFETziix`

---

## Cambios aprobados (esta versión)

### Registro / login / recuperar — tema portal
- Fondo negro, vidrio esmeralda, acentos dorados
- `AuthShell`, `PortalAtmosphere`, `TermsAcceptance`
- Checkbox obligatorio de Términos y Condiciones
- Backend valida `acceptedTerms: true` en registro

### Heredado (5 mercados + Investing + USD)
- 5 categorías en scrolly, titulares Investing.com, simuladores USD
- Salinas Pliego dentro de `#quienes`, estructura landing intacta

---

## Orden de secciones (sin cambios)

1. Menú · 2. Hero · 3. Quiénes Somos · 4. Mercados · 5. Testimonios · 6. CTA + Footer

---

## Cómo restaurar

```powershell
git checkout backup/landing-ok-2026-07-09-registro-portal -- frontend/src/pages/Register.tsx frontend/src/pages/LoginClient.tsx frontend/src/pages/ForgotPassword.tsx frontend/src/components/auth frontend/src/data/termsContent.ts frontend/src/styles/portal-theme.css frontend/src/styles/index.css frontend/src/api/client.ts frontend/src/auth/ClientAuthContext.tsx frontend/src/components/common/PasswordField.tsx backend/src/controllers/auth.controller.ts

# o:
powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-09-registro-portal\RESTORE.ps1
```

---

## Respaldo anterior

- Tag: `backup/landing-ok-2026-07-09-five-markets` (commit `c0e5c05`)

---

*Aprobado por el usuario el 9 jul 2026.*
