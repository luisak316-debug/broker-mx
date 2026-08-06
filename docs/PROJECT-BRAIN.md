# Cerebro del proyecto — INVERMAX LATAM

> **Memoria persistente** para retomar el contexto cuando se pierde el chat de Cursor  
> **Última actualización:** 2026-08-06 (noche — login acceso numérico asesores + fixes supervisores)  
> **Mantenedor:** actualizar este archivo al cerrar sesiones importantes o cuando cambien decisiones clave.

---

## 1. Qué es este proyecto

Plataforma de **corretaje profesional en modo simulación** para el mercado mexicano.

| Módulo | Mercado |
|--------|---------|
| Bolsa de Valores | Acciones, dividendos, largo/corto simulado |
| Materias Primas | Metales, energía, agrícolas |
| Divisas (Forex) | USD/MXN, EUR/MXN, etc. |
| Criptomonedas | Seguimiento 24/7 simulado |

**Marca actual:** INVERMAX LATAM (antes *Broker MX*)  
**Fuente de verdad de marca:** `backend/src/config/brand.ts` → `BRAND_NAME`, `BRAND_DOMAIN`, correos staff.

---

## 2. Arquitectura (monorepo)

```
TRADING/
├── advisors/      → Portal asesores (contactos + llamadas) → puerto 5176
├── frontend/      → Clientes (landing + app)     → puerto 5173
├── admin/         → Backoffice / CRM             → puerto 5174
├── supervisors/   → Panel supervisores
├── backend/       → API REST + WebSocket         → puerto 4000
└── docs/          → Respaldos, cerebro, guías
```

**Stack:** Node + Express + TypeScript, Prisma (SQLite dev / PostgreSQL prod), React + Vite + Tailwind, Capacitor (Android).

**Arrancar local:**
```powershell
npm install          # raíz
npm run dev          # API :4000 + frontend :5173
```

---

## 3. URLs y credenciales demo

| Recurso | URL / dato |
|---------|------------|
| Landing producción | https://invermaxlatam.com |
| Admin producción | https://invermaxlatam.com/admin847/ |
| Asesores producción | https://advisors-brown.vercel.app/ (Vercel proyecto `advisors`) |
| Asesores (alt) | https://brokermxadvisors.vercel.app/ |
| API producción | https://broker-mx-api.onrender.com |
| Asesores vía Render | https://broker-mx-api.onrender.com/asesores847/ |
| Vercel landing (alt) | https://brokermx-alpha.vercel.app |
| Login admin demo | `admin@invermaxlatam.com` / `Admin1234` |
| Supervisor demo | `supervisor@invermaxlatam.com` / `Admin1234` |
| Asesor demo | `juan.perez@invermaxlatam.com` / `Admin1234` |

Migración automática en bootstrap: correos `@brokermx.com` → `@invermaxlatam.com`.

---

## 4. Dónde estamos ahora (estado al 2026-08-04)

### ✅ Hecho y desplegado

| Tema | Detalle |
|------|---------|
| **App clientes Android** | Logo INVERMAX, tema negro/vidrio post-login, campo teléfono vacío + grid CSS, API → Render |
| **Login app móvil** | `frontend/.env.android` → `https://broker-mx-api.onrender.com`; fallback en `apiConfig.ts` |
| **Login/registro web** | Campo teléfono grid (+52 pequeño, input ancho); desplegado Vercel — usuario aprobó desktop |
| Rebrand web | **4 portales** (clientes, admin, supervisores, **asesores**) — INVERMAX LATAM |
| Logo `BrandMark` | «I» gradiente carbón→dorado + halo ámbar (**CSS**, no PNG recortado) |
| Favicon pestañas | SVG + ICO en todos los portales; asesores en `advisors-brown.vercel.app` |
| Admin topbar | Logo **solo en sidebar** (sin duplicado en barra superior) — aprobado usuario |
| Portal asesores | Historial contactos por periodo + **Volver a llamar** en contactos viejos |
| Llamadas asesores | Modo MicroSIP oculto (Windows) o WebRTC; **fix 2026-08-04:** sin CMD/MicroSIP visible, sync colgado |
| **Seguridad plataformas (2026-08-05)** | JWT firmado clientes, rutas portfolio/perfil protegidas, rate limit logins, CORS lista cerrada, puente llamadas con token + handshake, `plainPassword` fuera del listado admin |
| API historial | `GET /api/advisor/my-contacts/history` |
| **Login asesores por acceso** | Numérico único 4–24 dígitos; portal `advisors-brown.vercel.app`; supervisores crean/editan |
| **Asesores reales (ago 2026)** | Francisco Medina `21011` · Javier Hernandez `372810444417924` — contraseña en bloc (gitignored) |

### ⏸ En pausa / pendiente

| Tema | Detalle |
|------|---------|
| **Twilio llamadas** | ❌ Descartado — costo por minuto muy alto para MX |
| **Net2Phone** | ⏸ Esperando contrato |
| **WebRTC PSTN** | Proveedor no enruta PSTN desde WebRTC ext. 21011 — usar MicroSIP |
| **Play Store** | No publicar aún |
| Android Play Store | No publicar aún (APK debug instalado por USB) |
| Otros cambios locales | Device wipe supervisores, scripts `.bat` personales — ver `git status` (sin commit aún) |
| **Deploy seguridad API** | Cambios backend en código local — **pendiente `git push` a Render** para activar JWT clientes en prod |
| **Agente llamadas post-seguridad** | Re-ejecutar `INSTALAR_LAPTOP_ASESOR.bat` en cada laptop (token puente + scripts nuevos) |
| **Narayana — cuentas SIP extra** | Comprar **1 cuenta SIP por PC/laptop** que llame; principal hoy: **21011** (PC ASUS `DESKTOP-SAMEJOJ`) |
| **HP Pavilion (prueba)** | Cuenta SIP **`372810444417924`** (Narayana); MicroSIP ya configurado en laptop; instalar agente INVERMAX desde USB |
| **Paquete portable** | `tools/invermax-call/CREAR_PAQUETE_PARA_OTRA_PC.bat` → `PAQUETE_LINEA_INVERMAX` |

### 🔄 Respaldo aprobado (1 ago 2026)

- **Tag:** `backup/portales-ok-2026-08-01` (commit `c66d742`)
- **Doc:** `docs/BACKUP-PORTALES.md` · `backups/portales-2026-08-01/RESTORE.ps1`
- Usuario: «Perfect, save the changes.»

---

## 5. Decisiones importantes (no olvidar)

### Noticias — «Destacado del día»

1. Usuario pidió **más noticias de Investing.com** (actualización ~24 h, subidas/bajadas).
2. Se implementó pool RSS, carrusel, fix de imágenes (Investing bloquea hotlink CDN).
3. **Usuario no gustó** — pidió revertir **solo la sección de noticias**.
4. **Estado actual (commit `cf6f03d`):**
   - Una tarjeta «Destacado del día»
   - Rotación cada **2 minutos**
   - **Salinas Pliego vuelve al rotador** (como antes)
   - Sin carrusel, sin chips debajo, sin `FeaturedNewsCarousel.tsx`
5. **No reintentar** carrusel/chips sin pedido explícito del usuario.

### Logo / BrandMark

- **Siempre CSS** (`BrandMark.tsx` + `.invermax-brand-mark`) — gradiente + halo dorado.
- **No usar** capturas PNG recortadas como logo (usuario lo rechazó explícitamente).
- Favicon: SVG/ICO generado del mismo estilo, no screenshot.

### Portal asesores

- URL principal: **advisors-brown.vercel.app** (proyecto Vercel `advisors`, no solo `brokermx.advisors`).
- Desplegar con `DESPLEGAR_ASESORES.bat`.
- Historial + llamadas: commits `eb42416` … `c66d742`.
- **Login:** acceso numérico + contraseña (no correo). Mismo acceso que en supervisores.
- **Regla acceso:** 4–24 dígitos, único por asesor activo; corto (`21011`) o largo (`372810444417924`).
- **Teléfono:** opcional; **nunca** guardar `5512345678` (solo placeholder UI). Vacío = `null` en BD.
- **Al desactivar asesor:** liberar `loginAccess` + archivar email; reactivar con mismo acceso permitido.
- **Altas/bajas:** solo portal **supervisores** — no Render por cada usuario. Ver `.cursor/rules/advisor-access-supervisors.mdc`.

### Llamadas (marca blanca INVERMAX)

- **Usuarios** (asesores, admin, supervisores, clientes) solo ven **INVERMAX** — nunca MicroSIP, Narayana ni credenciales.
- **Servidor (Render):** variables `SIP_*` — la API arma la marcacion; en modo desktop **no** envia contraseñas al navegador.
- **Cada PC o laptop Windows** que llame: instalador `INSTALAR_LAPTOP_ASESOR.bat` (soporte/IT, una vez) → `C:\ProgramData\InvermaxCall`.
- Portal comprueba conector local; si falta: «Pide a soporte INVERMAX que configure tu laptop».
- **Puente local (2026-08-05):** solo `127.0.0.1:18765`; CORS whitelist de portales INVERMAX; `/handshake` entrega token de sesión; `/dial` y `/hangup` exigen `Authorization: Bearer`. Token en `C:\ProgramData\InvermaxCall\bridge-token` (no en git).

### Narayana — líneas telefónicas (decisión 2026-08-05)

- **Proveedor SIP:** Narayana (`rdx.narayana.im`). Panel: https://narayana.im/dashboard → **SIP accounts** (no hay “extensiones” aparte; cada cuenta SIP **es** una línea).
- **Cuenta principal actual:** **`21011`** — en la **PC grande ASUS** (`DESKTOP-SAMEJOJ`).
- **Regla crítica:** la **misma** cuenta SIP (ej. 21011) solo puede estar **registrada en UNA máquina a la vez**. Por eso MicroSIP “solo” falla en otra laptop si la PC grande ya usa esa línea.
- **Decisión aprobada por usuario:** login asesores con **acceso numérico único** + contraseña (sin correos reales). Fuente: `ACCESOS ASESORES INVERMAX.txt`. Import: `backend/scripts/import-advisor-accesses.ts`.
- Primer asesor: **Javier Hernandez** — acceso `372810444417924`.
- **WebRTC (opción futura):** Narayana expone WSS; hoy PSTN no enruta bien desde WebRTC ext. 21011 — seguir con conector desktop hasta que Narayana lo habilite o haya extensión dedicada.
- **Mediano plazo:** mapear en BD qué asesor usa qué cuenta SIP (hoy Render usa una sola `SIP_USERNAME` global).
- **Hardware despliegue:** memoria USB dedicada **`D:\INVERMAX_LINEA`** (ago 2026) — misma memoria para instalar en cada laptop/PC asesor; primera prueba HP Pavilion.

### Continuidad del proyecto (filosofía del usuario, 2026-08-05)

- **No empezar de cero:** siempre apoyarse en `docs/PROJECT-BRAIN.md` y la experiencia acumulada.
- Usuario expresa **compromiso fuerte** con INVERMAX LATAM — aprender, iterar y mantener el ritmo es parte del objetivo.
- Registrar decisiones aquí para que futuros chats retomen contexto sin repetir trabajo revertido.

### Seguridad API (2026-08-05)

- **Clientes:** token JWT HMAC (`signClientToken`); rutas `/portfolio`, `/profile`, `/cash-requests`, `/orders` exigen `Authorization: Bearer`.
- **Staff:** rate limit 15 intentos / 15 min en login admin, asesor, supervisor.
- **CORS:** solo orígenes explícitos en `env.corsOrigin` — sin wildcard `*.vercel.app`.
- **Producción:** `JWT_SECRET` (mín. 32 chars) y `DEVICE_ENROLLMENT_SECRET` obligatorios en Render.
- **Marcación:** `dialString` enmascarado solo desde backend autenticado; credenciales SIP nunca al navegador en modo desktop.
- **Listado admin clientes:** sin campo `plainPassword` en respuesta API.

### Landing — hero y vidrio esmerilado

- Varios intentos de `backdrop-filter` en el hero **revertidos** por el usuario.
- Respaldo landing que le gustó (esfera + vídeo): tag `backup/landing-ok-2026-07-08-video`.
- Último respaldo landing **aprobado** por usuario: `backup/landing-ok-2026-07-09-registro-portal`.
- **Regla:** respaldo landing solo con aprobación explícita → ver `.cursor/rules/landing-backup-on-approval.mdc`.

### Estructura landing crítica

- **Salinas Pliego** va **dentro** de `#quienes` (Quiénes Somos).
- Orden: Menú → Hero → Quiénes Somos → Mercados → Testimonios → CTA + Footer.

### App Android clientes — errores que NO repetir

1. **API en celular físico:** `frontend/.env.android` debe apuntar a **`https://broker-mx-api.onrender.com`**.  
   - ❌ `TU_IP_LOCAL`, ❌ `10.0.2.2` (solo emulador). Sin URL válida → login imposible en celular real.
2. **Tras cambiar frontend Android:** siempre `npm run android:sync` + reinstalar APK en el teléfono (USB). La app instalada **no se actualiza sola**.
3. **Campo teléfono:** layout con **CSS Grid** (`.auth-phone-row`), no flex + `width:100%` en ambos hijos — rompe desktop y móvil.
4. **Sin número de ejemplo:** eliminado `phonePlaceholder` / `5512345678`; campo empieza vacío.

### Datos operativos (clientes, asesores, gerencias) — NO confundir

1. **Fuente de verdad en producción:** PostgreSQL en Render (`broker-mx-db`). Cambios de UI/app **no borran** esa base.
2. **Modo legacy local:** API sin `DATABASE_URL` → datos en memoria; **se pierden al reiniciar**. No es producción.
3. **Gerentes ≠ asesores en Supervisores:** cuentas `gerente1@invermaxlatam.com` … `gerente4@` (rol MANAGER) **no** aparecen en la tabla «Asesores»; van en **Gerencias**.
4. **Deploy Render:** el build ejecuta `prisma db push --accept-data-loss` — cambios de esquema destructivos pueden **perder filas**. Antes de push grande, backup en Render o migración controlada.
5. **Si «desaparecen» datos:** verificar `GET /api/health` → `storage: postgres`; portal en `brokermxsupervisors.vercel.app`; no asumir borrado por commits de frontend.

### Llamadas (MicroSIP en PC del asesor)

- Softphone: `tools/MicroSIP/MicroSIP.exe` (credenciales SIP ya en MicroSIP).
- Formato marcación: `*8088*+1{emisor US aleatorio}*+52{receptor MX}*`
- Pool US: `backend/src/config/usEmitterPool.ts` (~130 números, uno al azar por llamada).
- **Supervisores** ven teléfonos completos al asignar (`/asignar contactos`).
- **Asesores** ven enmascarado (`+52 ******1234`) en admin → **Mis contactos** → botón Llamar.
- Twilio llamadas: **descartado** (caro). Net2Phone: pendiente contrato.

---

## 6. Commits y tags recientes (referencia git)

```
73d14c6  Asesores: quitar teléfono ejemplo; borrar teléfono; reglas acceso
954fcde  Desactivar libera acceso; reactivar al volver a crear
44e6cff  Acceso 4–24 dígitos; login numérico asesores
b080a78  Fix build Render (TelephonyConfig)
1faa196  Login asesores por acceso numérico + sync bloc INVERMAX
472c36c  App cliente: tema negro/vidrio, logo Android, login móvil, teléfono vacío
c66d742  Admin: quitar logo duplicado topbar; deploy asesores → advisors-brown
```

**Tags aprobados portales:**
- `backup/portales-ok-2026-08-01` ← **último aprobado** (historial, marca, admin topbar)

**Tags landing aprobados:**
- `backup/landing-ok-2026-07-09-registro-portal` ← último aprobado
- `backup/landing-ok-2026-07-08-video` ← esfera + vídeo (le encantó)
- `backup/landing-ok-2026-07-08-mercados-scroll`

---

## 7. Archivos clave por área

| Área | Archivos |
|------|----------|
| App Android clientes | `frontend/.env.android`, `frontend/src/lib/apiConfig.ts`, `frontend/capacitor.config.ts` |
| Login teléfono | `frontend/src/components/auth/CountryPhoneFields.tsx`, `.auth-phone-row` en `index.css` |
| Marca | `backend/src/config/brand.ts`, `frontend/src/data/brand.ts` |
| Logo | `*/src/components/brand/BrandMark.tsx`, `.invermax-brand-mark` en CSS |
| Asesores | `advisors/src/pages/ContactHistoryPage.tsx`, `advisors/src/lib/contactHistoryGroups.ts` |
| Llamadas | `advisors/src/call/`, `tools/invermax-call/`, `backend/src/config/sipTelephony.ts` |
| Paquete línea otra PC | `tools/invermax-call/CREAR_PAQUETE_PARA_OTRA_PC.bat`, `PAQUETE_LINEA_INVERMAX/` |
| Detectar PCs en Wi-Fi | `tools/invermax-call/DETECTAR_PC_EN_RED.bat` |
| Respaldos portales | `docs/BACKUP-PORTALES.md`, `backups/portales-2026-08-01/RESTORE.ps1` |
| Respaldos landing | `docs/BACKUP-LANDING.md`, `backups/landing-*/RESTORE.ps1` |

---

## 8. Despliegue

| Destino | Cómo |
|---------|------|
| Frontend Vercel | `cd frontend && npx vercel --prod --yes -e VITE_API_URL=...` |
| Asesores Vercel | `DESPLEGAR_ASESORES.bat` → **advisors-brown.vercel.app** |
| Admin Vercel | proyecto `brokermx.admin` |
| Backend Render | `git push origin main` (auto-deploy) |
| Scripts útiles | `LANZAR_WEB.bat`, `DESPLEGAR_RENDER.bat` |

Variable API en prod: `VITE_API_URL=https://broker-mx-api.onrender.com`

**Android (celular físico):** copiar `frontend/.env.android.example` → `.env.android` con la misma URL Render. Luego `npm run android:sync` + instalar APK.

---

## 9. Cómo usar este cerebro

### Para ti (humano)

```powershell
# Ver memoria del proyecto en consola
powershell -ExecutionPolicy Bypass -File scripts\project-brain.ps1

# O doble clic
CEREBRO.bat
```

### Para el agente de Cursor

1. Al **iniciar sesión sin historial**, leer este archivo primero.
2. Al **cerrar trabajo importante**, actualizar §4 (estado), §5 (decisiones) y la fecha arriba.
3. **No borrar** decisiones revertidas — evita repetir errores (carrusel noticias, Twilio, etc.).

### Qué actualizar siempre

- Fecha en la cabecera
- Tabla §4 (hecho / pausa / pendiente)
- §5 si hay nueva decisión del usuario («no me gustó X», «perfecto guarda Y»)
- §6 si hay commit o tag nuevo relevante

---

## 10. Próximos pasos sugeridos (no obligatorios)

1. Integrar Net2Phone cuando llegue el contrato (solo admin, salientes).
2. Noticias: solo tocar si el usuario pide un enfoque **distinto** al carrusel revertido.
3. Configurar DNS definitivo de `invermaxlatam.com` si aún no apunta a Vercel.

---

*Este documento es la memoria del proyecto. Si contradice el chat, priorizar lo acordado con el usuario y actualizar aquí.*
