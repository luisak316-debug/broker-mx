# Broker MX — Dashboard Financiero Unificado

Plataforma de **corretaje profesional en modo simulación** para el mercado mexicano, que
consolida las cuatro grandes categorías de inversión en una sola interfaz limpia y
*scannable*:

1. **Bolsa de Valores (Acciones)** — gráficos de rendimiento, cotizaciones en tiempo real, compra/venta simulada (largo/corto) e historial de dividendos.
2. **Materias Primas (Commodities)** — Metales, Energía y Agrícolas; cotizaciones por contratos de futuros y alertas de alta volatilidad.
3. **Divisas (Forex)** — pares contra el peso (USD/MXN, EUR/MXN, JPY/MXN), calculadora de tipo de cambio, spreads configurables y velas japonesas.
4. **Criptomonedas** — seguimiento 24/7 y conexión simulada vía API con exchanges (Bitso / Binance).

> **Aviso:** Entorno de **simulación / intermediación financiera profesional**. Los datos son
> simulados y no constituyen asesoría de inversión. Ver el "Aviso de Riesgo" en el pie de la app.

---

## Arquitectura

Monorepo con dos paquetes (npm workspaces):

```
TRADING/
├─ package.json            # workspaces + scripts (dev/build)
├─ backend/                # API REST + WebSocket (Node + Express + TypeScript)
│  ├─ prisma/
│  │  ├─ schema.prisma     # Usuarios (leads), Balances MXN, Transacciones, Posiciones
│  │  └─ seed.ts           # Catálogo de instrumentos + usuario demo
│  └─ src/
│     ├─ config/           # Variables de entorno
│     ├─ data/             # Catálogo mock de los 4 módulos + dividendos
│     ├─ services/         # marketData (simulación de precios) + portfolio (MXN)
│     ├─ controllers/      # market, stocks, commodities, forex, portfolio, auth
│     ├─ routes/           # Definición de endpoints /api
│     ├─ sockets/          # Feed de precios en tiempo real (WebSocket)
│     ├─ middleware/       # Manejo de errores
│     ├─ app.ts            # App Express (helmet, cors, json, logging)
│     └─ server.ts         # HTTP + WebSocket + arranque del motor de mercado
├─ frontend/               # App de CLIENTES — SPA responsive (Vite + React + TS + Tailwind)
│  └─ src/
│     ├─ api/  hooks/  lib/  components/{layout,common,charts,trading}
│     └─ pages/            # Dashboard, Stocks, Commodities, Forex, Crypto
└─ admin/                  # BACKOFFICE / CRM interno — SPA separada (puerto 5174)
   └─ src/
      ├─ api/              # Cliente HTTP con token Bearer
      ├─ auth/             # AuthContext (sesión + RBAC: can(...roles))
      ├─ components/
      │  ├─ layout/        # AdminLayout (guard de sesión), Sidebar (RBAC), Topbar
      │  └─ ui/            # Card, Badge, ConfirmDialog (confirmación de cambios críticos)
      └─ pages/            # Login, Dashboard, Clients, ClientProfile, Transactions,
                           #   CashRequests, AuditLog
```

## Panel de Administración (Backoffice / CRM)

App **separada** (puerto **5174**) para el personal interno, con autenticación y **RBAC**.

**Cuentas demo (contraseña `Admin1234`):**

| Correo | Rol | Permisos |
|--------|-----|----------|
| `admin@brokermx.com` | ADMIN | Acceso total |
| `juan.perez@brokermx.com` | ADVISOR | Gestiona clientes, edita saldos, revisa solicitudes |
| `laura.cumplimiento@brokermx.com` | COMPLIANCE | Lo anterior + bitácora de auditoría |
| `soporte@brokermx.com` | SUPPORT | Solo lectura |

**Seguridad:** contraseñas con hash **scrypt** + salt; sesiones con **token firmado HMAC-SHA256**
(expiración 8 h); middleware `requireAuth` + `requireRole`; comparaciones en tiempo constante.

**Módulos:**
1. **CRM** — tabla con buscador y filtros (nombre / ID / correo / estado / KYC) + ficha individual (datos, documentos, asesor).
2. **Control de saldos (modo crítico)** — editar saldo y "Total invertido", agregar/remover fondos con **razón obligatoria** y **modal de confirmación**.
3. **Transacciones y solicitudes** — historial en las 4 categorías + aprobar/rechazar/pendiente de depósitos y retiros (al aprobar se ajusta el saldo).
4. **Bitácora de auditoría** — registro automático de quién, qué, cuándo y sobre qué cliente (estado previo/posterior + IP).

### Endpoints del backoffice (`/api/admin`)

| Método | Ruta | Rol mínimo |
|--------|------|-----------|
| POST | `/auth/login` | público |
| GET | `/auth/me` · `/metrics` | autenticado |
| GET | `/clients` · `/clients/:id` | autenticado |
| PATCH | `/clients/:id/balance` | ADVISOR / COMPLIANCE |
| POST | `/clients/:id/funds` | ADVISOR / COMPLIANCE |
| GET | `/transactions` · `/cash-requests` | autenticado |
| PATCH | `/cash-requests/:id` | ADVISOR / COMPLIANCE |
| PUT | `/clients/:id/deposit-account` | ADVISOR / COMPLIANCE |
| GET | `/audit` | COMPLIANCE |

### Cuenta de depósito personalizada por cliente

Módulo de pasarela de depósito (SPEI / ventanilla) con datos bancarios **individuales y
reemplazables** por cliente.

- **Backoffice (asesor):** apartado *"Cuenta de Depósito Asignada"* en la ficha del cliente para
  ingresar/modificar Beneficiario, Banco, Número de cuenta, **CLABE (validación de 18 dígitos)** y
  Referencia. Al guardar se persiste en el registro del cliente y se registra en la **bitácora de
  auditoría** (valor anterior y nuevo, asesor, fecha e IP).
- **App de cliente:** pantalla *"Fondear Cuenta / Invertir"* (`/fondear`) que lee en tiempo real la
  cuenta asignada y muestra una tarjeta limpia con **botones "Copiar"** en CLABE, Cuenta y
  Referencia, con confirmación temporal *"¡Copiado con éxito para pegar en tu banca en línea!"*.
- **Endpoint de lectura (cliente):** `GET /api/deposit-account/:clientId`.
- **Base de datos:** campos `depositBeneficiary`, `depositBank`, `depositAccountNumber`,
  `depositClabe`, `depositReference`, `depositUpdatedAt`, `depositUpdatedById` en el modelo `User`.

### Stack tecnológico

| Capa | Tecnología | Motivo |
|------|------------|--------|
| Backend | Node.js + Express + TypeScript | API REST robusta y tipada |
| Tiempo real | `ws` (WebSocket) | Feed de cotizaciones (24/7 para cripto) |
| Base de datos | Prisma ORM (SQLite dev / PostgreSQL prod) | Esquema preparado para usuarios, balances MXN y transacciones |
| Validación | Zod | Validación de entrada en endpoints |
| Frontend | React + Vite + TypeScript | SPA rápida y mantenible |
| Estilos | TailwindCSS | UI limpia, moderna y responsive |
| Gráficos | Recharts + lightweight-charts | Rendimiento (área) y velas japonesas |

### Multiplataforma (web y móvil)

El frontend es una **SPA responsive** (funciona en navegador de escritorio y móvil, lista para
PWA). La capa de datos (`src/api` + `src/hooks`) está desacoplada de la UI, de modo que puede
reutilizarse en un cliente **React Native / Expo** consumiendo la misma API y el mismo WebSocket
sin cambios en el backend.

---

## Requisitos

- Node.js >= 18.18
- npm >= 9

## Instalación

```bash
# En la raíz del proyecto (instala backend y frontend vía workspaces)
npm install

# Configurar variables de entorno del backend
cp backend/.env.example backend/.env
```

## Base de datos (opcional para desarrollo)

La API sirve datos de mercado simulados **sin necesidad de base de datos**. Para habilitar la
persistencia (usuarios, balances, transacciones):

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

## Ejecución

```bash
# Desde la raíz: levanta API (4000) y frontend (5173) en paralelo
npm run dev
```

- App de clientes (Landing): http://localhost:5173
- Backoffice / Admin: http://localhost:5174  (login: `admin@brokermx.com` / `Admin1234`)
- API REST: http://localhost:4000/api
- WebSocket: ws://localhost:4000/ws/prices

### Landing y registro de clientes

- `/` Landing pública: **Hero** (frase de impacto + CTA "Comienza a invertir desde hoy"), menú
  superior (Quiénes Somos · Mercados · Testimonios · Iniciar Sesión · Crear Cuenta), sección
  **Quiénes Somos** con las 4 categorías de mercado, y **Testimonios**.
- `/registro` formulario con validaciones MX (nombre solo texto, correo, **teléfono 10 dígitos**,
  contraseña segura ≥8 con letras y números). Al registrarse, se **crea el perfil del cliente en el
  CRM** (con campos bancarios vacíos para que el asesor los asigne) y se redirige al **Dashboard de
  bienvenida** (`/app`).
- `/login` inicio de sesión del cliente. Las rutas `/app/*` quedan protegidas por sesión de cliente.
- El cliente registrado aparece de inmediato en el backoffice (CRM) asignado a un asesor, con KYC
  `PENDING` y listo para asignarle su cuenta de depósito.

> Vite hace *proxy* de `/api` y `/ws` hacia el backend, evitando problemas de CORS en desarrollo.

### Apps Android (Capacitor)

Dos apps nativas con el mismo código que la web. Guía completa: **[ANDROID_GUIA.md](./ANDROID_GUIA.md)**

| App | Comando abrir Android Studio |
|-----|------------------------------|
| Clientes | `npm run android:client:open` |
| Asesores | `npm run android:admin:open` |

Configuración inicial: doble clic en **`INSTALAR_ANDROID.bat`**.

---

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/instruments?assetClass=&group=` | Catálogo de instrumentos |
| GET | `/api/quotes?symbols=AAPL,BTC` | Cotizaciones |
| GET | `/api/quotes/:symbol` | Cotización individual |
| GET | `/api/candles/:symbol?points=&step=` | Histórico OHLC (velas) |
| GET | `/api/stocks/:symbol/dividends` | Historial de dividendos |
| GET | `/api/commodities/alerts?threshold=` | Alertas de volatilidad |
| GET | `/api/forex/convert?pair=USD/MXN&amount=&side=&spread=` | Calculadora FX |
| POST | `/api/orders` | Orden simulada (compra/venta, largo/corto) |
| GET | `/api/portfolio/:userId` | Portafolio y P&L (MXN) |
| POST | `/api/auth/login` · `/api/auth/register` | Autenticación simulada |

---

## Cumplimiento (México)

- **Aviso de Riesgo y Términos y Condiciones** obligatorio en el pie de página (componente
  `Footer.tsx`), aclarando el carácter de simulación / intermediación financiera profesional.
- Esquema de datos preparado para **KYC** (`kycStatus`), perfil de riesgo y marca de *lead*.
- Nota sobre criptoactivos conforme a la regulación aplicable (CNBV, Banxico, Condusef y Ley
  Fintech).

> Para un despliegue real se requeriría: cifrado de contraseñas (argon2/bcrypt), JWT firmado,
> auditoría, conexión a proveedores de datos reales y los registros/licencias correspondientes
> ante las autoridades financieras mexicanas.
