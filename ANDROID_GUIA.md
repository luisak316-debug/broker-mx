# Broker MX — Guía Android y Google Play Store

Este proyecto incluye **dos aplicaciones Android**, igual que la web:

| App | Carpeta | Package ID (Play Store) | Usuarios |
|-----|---------|-------------------------|----------|
| **Broker MX** (clientes) | `frontend/android` | `com.brokermx.cliente` | Inversionistas |
| **Broker MX Asesores** | `admin/android` | `com.brokermx.asesores` | Asesores / administradores |

Ambas usan **Capacitor**: el mismo código React de la web, empaquetado como app nativa Android. Misma interfaz, mismos módulos (mercados, fondear cuenta, CRM, documentos, etc.).

---

## PARTE 1 — Lo que necesitas en tu PC (una sola vez)

### 1. Node.js
Ya lo usas para la web. Versión **18 o superior**.

### 2. Android Studio (ya lo tienes)
Abre **Android Studio** → **More Actions** → **SDK Manager** y verifica:

- **Android SDK Platform 34** (o la más reciente estable)
- **Android SDK Build-Tools**
- **Android Emulator** (opcional, para probar sin celular)

### 3. Variables de entorno (recomendado)
En Windows, agrega (ajusta la ruta si tu usuario es distinto):

```
ANDROID_HOME = C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
```

En **Path**, agrega:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

Cierra y vuelve a abrir CMD después de guardar.

---

## PARTE 2 — Generar las 2 apps en Android Studio

### Opción rápida (recomendada)

1. Doble clic en **`INSTALAR_ANDROID.bat`** (en la carpeta `TRADING`).
2. Espera a que termine (instala Capacitor, compila web, crea carpetas `android`).
3. Abre la app de **clientes**:
   ```bash
   cd frontend
   npm run android:open
   ```
4. Abre la app de **asesores** (otra ventana de Android Studio o otro proyecto):
   ```bash
   cd admin
   npm run android:open
   ```

### Opción manual

```bash
npm install

# App clientes
cd frontend
copy .env.android.example .env.android
npm run android:init
npm run android:open

# App asesores (en otra terminal)
cd admin
copy .env.android.example .env.android
npm run android:init
npm run android:open
```

### Probar en emulador

1. En Android Studio: **Device Manager** → crea un dispositivo virtual (Pixel, API 34).
2. Deja corriendo el **backend** (`INICIAR.bat` o `npm run dev:api`).
3. Pulsa el botón **Run ▶** (triángulo verde).

El emulador usa `http://10.0.2.2:4000` para llegar al API de tu PC automáticamente.

### Probar en celular físico (misma Wi‑Fi)

1. En CMD: `ipconfig` → anota tu **IPv4** (ej. `192.168.1.50`).
2. Edita `frontend/.env.android` y `admin/.env.android`:
   ```
   VITE_API_URL=http://192.168.1.50:4000
   ```
3. Vuelve a sincronizar:
   ```bash
   npm run android:client:sync
   npm run android:admin:sync
   ```
4. En el celular: **Opciones de desarrollador** → **Depuración USB** activada.
5. Conecta por USB y Run ▶ en Android Studio.

---

## PARTE 3 — Cuentas y requisitos para Google Play Store

### Cuenta obligatoria: Google Play Console

| Requisito | Detalle |
|-----------|---------|
| **Cuenta de desarrollador** | [Google Play Console](https://play.google.com/console) |
| **Costo único** | **25 USD** (pago una sola vez, no anual) |
| **Tipo de cuenta** | Personal u **Organización** (recomendado si eres firma legal) |
| **Verificación** | Identidad + datos fiscales (México: RFC si aplica) |

Con **una sola cuenta** publicas **las dos apps** (clientes y asesores son listados separados).

### NO necesitas (para empezar)

- Cuenta Apple (solo si más adelante quieres iPhone).
- Cuenta de desarrollador aparte por cada app.

### SÍ necesitas antes de publicar

1. **Política de privacidad** (URL pública en tu sitio web).
2. **Aviso de riesgo / Términos** (ya está en la app web; repítelo en la ficha de Play Store).
3. **Ícono de la app** 512×512 px (cada app puede tener ícono distinto).
4. **Capturas de pantalla** (mínimo 2 por app, teléfono).
5. **Descripción** en español para México.
6. **Correo de soporte** visible para usuarios.
7. **Servidor API en producción** con **HTTPS** (no `http://localhost`). Ejemplos: Railway, Render, AWS, VPS con dominio y SSL.

> Las apps en Play Store **no pueden** apuntar a `localhost`. Debes desplegar el backend en internet con certificado SSL.

---

## PARTE 4 — Publicar en Play Store (paso a paso)

### Fase A — Pruebas internas (haz esto primero)

1. Play Console → **Crear aplicación** → nombre **Broker MX** (clientes).
2. Repite para **Broker MX Asesores** (asesores).
3. **Pruebas internas** → sube el `.aab` (Android App Bundle):
   ```bash
   cd frontend/android
   ./gradlew bundleRelease
   ```
   El archivo queda en:  
   `frontend/android/app/build/outputs/bundle/release/app-release.aab`

4. Invita testers por correo (tú y tu equipo).
5. Corrige errores antes de producción.

### Fase B — Firma de la app (obligatorio)

Android Studio → **Build** → **Generate Signed Bundle / APK**:

- Crea un **keystore** (guárdalo y **nunca lo pierdas**; sin él no podrás actualizar la app).
- Activa **Google Play App Signing** (Google guarda la clave de producción).

Repite el proceso para **cada app** (clientes y asesores pueden usar keystores distintos).

### Fase C — Formularios Play Console (apps financieras)

Google exige declaraciones extra para fintech:

| Formulario | Qué declarar |
|------------|----------------|
| **Clasificación de contenido** | Cuestionario IARC |
| **Público objetivo** | Mayores de 18 años |
| **Datos y seguridad** | Qué datos recoges (correo, teléfono, documentos KYC) |
| **App financiera** | Que es intermediación / inversión; enlaza regulación si aplica |
| **Política de privacidad** | URL obligatoria |

### Fase D — Producción

1. **País**: México (y otros si quieres).
2. Sube el `.aab` firmado.
3. Revisión de Google: **1–7 días** (a veces más en apps financieras).
4. Publicación.

---

## PARTE 5 — Comandos útiles

| Acción | Comando |
|--------|---------|
| Sincronizar app clientes | `npm run android:client:sync` |
| Abrir clientes en Android Studio | `npm run android:client:open` |
| Sincronizar app asesores | `npm run android:admin:sync` |
| Abrir asesores en Android Studio | `npm run android:admin:open` |
| API + web en PC | `INICIAR.bat` |

Después de cambiar código web, **siempre** ejecuta `android:sync` antes de Run en Android Studio.

---

## PARTE 6 — Producción (API en la nube)

Cuando tengas servidor (ej. `https://api.brokermx.com`):

1. Edita `frontend/.env.android` y `admin/.env.android`:
   ```
   VITE_API_URL=https://api.brokermx.com
   ```
2. `npm run android:client:sync` y `npm run android:admin:sync`
3. Genera el `.aab` de release y súbelo a Play Console.

Actualiza también `backend` CORS con tus dominios de producción.

---

## Resumen: ¿qué haces tú ahora?

1. Ejecuta **`INSTALAR_ANDROID.bat`**.
2. Abre **`frontend`** en Android Studio → Run en emulador (con `INICIAR.bat` corriendo el API).
3. Abre **`admin`** en Android Studio → misma prueba con login de asesor.
4. Crea cuenta en **Google Play Console** (25 USD) cuando quieras publicar.
5. Prepara **política de privacidad** y **servidor HTTPS** antes de subir a producción.

Las dos apps quedan **sincronizadas con el mismo diseño y funciones** que la web: una para clientes y otra exclusiva para asesores.
