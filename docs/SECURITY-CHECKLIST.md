# Checklist de seguridad INVERMAX LATAM

> Prioridad máxima — inspirado en incidentes reales (credenciales en GitHub + BD expuesta).  
> **Última revisión:** 2026-08-06

---

## Resultado rápido del repo (automático)

| Revisión | Estado |
|----------|--------|
| `backend/.env` en historial git | ✅ No aparece en commits |
| Archivos `.env` trackeados | ✅ Ninguno |
| `ACCESOS ASESORES INVERMAX.txt` en git | ✅ En `.gitignore` |
| `MicroSIP.ini` / tokens puente en git | ✅ Ignorados |

---

## Hoy — 30 minutos (hazlo en este orden)

### 1. GitHub
- [ ] Repo **privado** (Settings → Danger zone → Change visibility).
- [ ] **2FA** activo en tu cuenta GitHub (Settings → Password and authentication).
- [ ] Revisar **Collaborators** — solo personas de confianza.
- [ ] Nunca pegar `.env` ni bloc de accesos en issues, PRs o chats públicos.

### 2. Render (API + PostgreSQL)
- [ ] **2FA** en cuenta Render.
- [ ] Variables sensibles solo en **Environment** (no en código):
  - `JWT_SECRET` (mín. 32 caracteres aleatorios)
  - `DATABASE_URL` (solo Render, nunca en git)
  - `TWILIO_*`, `SIP_PASSWORD`, `ADVISOR_BOOTSTRAP_PASSWORD`
- [ ] PostgreSQL **no** está abierto a internet como SQL Server clásico; solo la app en Render se conecta. No publicar `DATABASE_URL` en ningún lado.
- [ ] Tras cambiar `JWT_SECRET`, todos los usuarios deben **volver a iniciar sesión**.

### 3. Vercel (portales web)
- [ ] **2FA** en Vercel.
- [ ] Confirmar que `VITE_API_URL` apunta a `https://broker-mx-api.onrender.com` (no API local).

### 4. Contraseñas de producción (crítico)
- [ ] Cambiar **supervisor** y **admin** — no dejar `Admin1234` en producción.
- [ ] Contraseñas asesores: solo las que tú defines en **Supervisores** (bloc local gitignored).
- [ ] Render Dashboard → rotar `SIP_PASSWORD` / Twilio si alguna vez se filtró.

### 5. Laptops asesores
- [ ] Una cuenta SIP Narayana **por máquina** (regla ya documentada en cerebro).
- [ ] No compartir `ACCESOS ASESORES INVERMAX.txt` por WhatsApp/email sin cifrar.
- [ ] Agente INVERMAX + MicroSIP solo en PCs autorizadas.

---

## Esta semana

- [ ] **Bitwarden / 1Password** (o similar) para contraseñas del equipo.
- [ ] Lista de quién tiene acceso a: GitHub, Render, Vercel, Narayana, Twilio.
- [ ] Backup PostgreSQL en Render (Settings → database → backups).
- [ ] Revisar logs Render tras cambios de contraseña (intentos de login fallidos).

---

## Lo que ya tiene el código (no desactivar)

- JWT firmado para clientes y staff.
- Rate limit en logins (15 intentos / 15 min).
- CORS con lista cerrada (no `*` abierto).
- `plainPassword` fuera del listado admin API.
- Puente llamadas local con token (`127.0.0.1:18765`).
- Teléfono ejemplo `5512345678` **bloqueado** en backend al crear asesores.

---

## Si alguna vez filtraste un secreto

1. **Rotar** de inmediato (Twilio, SIP, JWT, BD password en Render).
2. **Revocar** tokens viejos.
3. No confiar en “borrar el commit” — el historial de GitHub puede conservarlo. Usar rotación + repo privado.

---

## Regla de oro (caso mensajería MX)

> **GitHub + credencial + servicio expuesto a internet = puerta abierta.**  
> El ransomware llega después; el arreglo empieza por **secretos fuera del repo** y **cuentas fuertes**.

---

Ver también: `docs/PROJECT-BRAIN.md` (§ Seguridad API), `.cursor/rules/advisor-access-supervisors.mdc`.
