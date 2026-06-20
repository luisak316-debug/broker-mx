# Android — 3 pasos (sin confusión)

Olvida las carpetas `admin`, `frontend`, `android`… usa solo esto:

---

## Paso 1 — Servidor (tu PC)
Doble clic en **`INICIAR.bat`**  
Déjalo abierto. Sin esto la app no carga datos.

---

## Paso 2 — Abrir la app en Android Studio
Doble clic en **`ABRIR_ANDROID.bat`**

- Pulsa **1** = app de **clientes**
- Pulsa **2** = app de **asesores**

Android Studio se abre **solo**, en el proyecto correcto. No busques carpetas.

---

## Paso 3 — Ejecutar en el emulador
Dentro de Android Studio:

1. Espera que termine la barra de abajo (**Gradle Sync**).
2. Arriba, elige tu **emulador** (ej. Pixel).
3. Pulsa el triángulo verde **▶ Run**.

Listo. La app se instala en el emulador.

---

## Las 2 apps (resumen)

| Qué quieres probar | En ABRIR_ANDROID.bat |
|--------------------|----------------------|
| Clientes / inversionistas | **1** |
| Asesores / administradores | **2** |

Son dos apps distintas. Puedes abrir una hoy y la otra después.

---

## Si Run ▶ sigue gris

1. ¿Emulador encendido y seleccionado arriba?  
2. ¿Gradle Sync terminó sin error rojo abajo?  
3. ¿Tienes **INICIAR.bat** abierto?

---

## Regla de oro

**No uses File → Open** para buscar carpetas.  
Usa siempre **`ABRIR_ANDROID.bat`**.
