# Procedimiento de Migración y Rotación de Credenciales Gemini (`GEMINI_KEY`)

> **Alcance:** Procedimiento operativo para ejecutar en Google Cloud / Firebase durante la ventana de despliegue aprobada. **No ejecutar durante la fase de validación previa.**

## 1. Situación corregida en código

- Se ha eliminado la lectura y el almacenamiento de `system.geminiApiKey` en `settings/main`, en el panel de `Configuracion.jsx` y en el cliente `js/gemini.js`.
- Todas las llamadas a `window.callGemini(...)` se envían exclusivamente a la Cloud Function autenticada `analizarGruposIA` con cabecera `Authorization: Bearer <Firebase ID Token>`.
- La Cloud Function obtiene la clave únicamente desde Google Cloud Secret Manager (`GEMINI_KEY`).

## 2. Pasos de rotación y migración (orden estricto)

1. **Generar nueva clave API en Google AI Studio / Google Cloud Console**
   - Crear una clave dedicada para el proyecto `gest-grupos-hotel`.
   - Restringir la clave exclusivamente a **Generative Language API** (`generativelanguage.googleapis.com`).
   - No restringir por HTTP referer de navegador, ya que se invoca únicamente desde Cloud Functions (servidor).
2. **Registrar la nueva clave en Firebase Secret Manager**
   ```bash
   firebase functions:secrets:set GEMINI_KEY --project gest-grupos-hotel
   ```
   - Introducir el valor de la nueva clave en la entrada estándar interactiva (nunca en código fuente, commits ni ficheros `.env` versionados).
3. **Desplegar la Cloud Function `analizarGruposIA`**
   ```bash
   firebase deploy --only functions:analizarGruposIA --project gest-grupos-hotel
   ```
4. **Verificar funcionamiento con usuario autenticado**
   - Iniciar sesión en Nexus Groups con una cuenta activa (`access_members/{uid}`).
   - Probar una operación asistida por IA (traducción de cláusula o análisis) y comprobar respuesta HTTP `200`.
   - Verificar que una petición sin cabecera `Authorization` devuelve `401`.
5. **Purgar la clave heredada de Firestore (`settings/main`)**
   - Eliminar el campo `system.geminiApiKey` (y `system.pin` / `system.users` si persistieran) del documento `settings/main` mediante la consola de Firestore o al guardar desde el nuevo panel de Configuración con cuenta autorizada.
6. **Revocar la clave anterior en Google AI Studio / Google Cloud Console**
   - Una vez confirmado que ninguna versión antigua del cliente sigue en uso y que `analizarGruposIA` responde correctamente con la nueva clave, eliminar o revocar la clave antigua.

## 3. Verificación post-rotación

- Confirmar en Firestore que `settings/main` no contiene `system.geminiApiKey`.
- Confirmar en DevTools (pestaña Network) que el navegador **no** realiza peticiones directas a `generativelanguage.googleapis.com` y solo llama a `analizarGruposIA` con token Bearer.
