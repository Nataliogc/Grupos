# Integración de peticiones por correo

## Entrega inicial (sin desplegar)

`Peticiones.html` ofrece una demostración con datos ficticios en memoria y acceso separado al equipo mediante Firebase Auth. Incluye filtros por buzón/responsable, conversación en texto plano, asignación, estados y notas con historial. La demostración no guarda datos ni envía correos. El acceso real usa funciones autenticadas; no confía en la sesión local heredada.

Destinatarios a conectar: `grupos@hotelguadiana.es` y `grupos@encumbria.es`. El usuario utiliza Outlook; el proveedor subyacente todavía se desconoce. No se ha conectado, leído ni modificado ningún buzón.

Consulta DNS pública del 24/09/2026: MX de `hotelguadiana.es` apunta a `hotelguadiana.es` (prioridad 0); MX de `encumbria.es` apunta a `encumbria.es` (prioridad 0). Esto no identifica el servidor IMAP ni demuestra que las cuentas sean Microsoft 365. Confirmar tipo de cuenta y servidor entrante en Outlook o con informática.

Validación realizada: tres pruebas locales de dominio/handlers aprobadas, compilación JSX y sintaxis del servidor correctas. En navegador se ha comprobado selección de petición, asignación y nota interna con historial en modo demostración. La página utiliza cabecera propia para que el acceso verificado no dependa de la sesión heredada de navegación.

## Activación por el administrador

1. Identificar en Outlook el tipo de cuenta (Microsoft 365/Exchange o IMAP) y, si es IMAP, el nombre del servidor. No compartir contraseñas en conversaciones ni en el repositorio.
2. Habilitar Email/Password en Firebase Authentication y crear cuentas individuales de acceso a la aplicación. No reutilizar claves del correo. Configurar recuperación de contraseña y los dominios autorizados antes del uso operativo.
3. Crear, con Admin SDK o consola de administración, `mailMembers/{firebaseAuthUid}` con `name`, `active: true`, `role: "admin"` o `"commercial"`, y `mailboxes` (lista explícita de los buzones permitidos). Son autorizaciones privadas, independientes de `settings/main`, que actualmente es público. Nunca copiar contraseñas de la configuración antigua. La lista comercial nueva usa UID estables; la migración desde la lista antigua requiere vincular cada persona a su cuenta verificada.
4. Desplegar el índice de `firestore.indexes.json` y las funciones `mailInbox`, `mailDetail`, `mailUpdate` tras revisar el proyecto de destino. Todas las colecciones nuevas permanecen denegadas a clientes por las reglas generales existentes; solo las funciones autenticadas acceden mediante Admin SDK. Dirección y comerciales solo ven buzones explícitamente autorizados. Un comercial puede reclamar una petición sin responsable; solo dirección puede reasignar.
5. Implementar el conector específico del proveedor en servidor con secretos y permisos limitados. `ingestMessage` es una función interna, NO un webhook público. El conector debe validar las notificaciones del proveedor, obtener el mensaje, proporcionar una identidad estable del hilo y ejecutar la ingesta con reintentos y cursor persistente. Los asuntos NO identifican conversaciones. Para IMAP hay que resolver `Message-ID`, `In-Reply-To` y `References` y contemplar `UIDVALIDITY`.
6. Añadir estado real del conector, última sincronización, renovación de suscripciones, recuperación de fallos y alertas. La UI muestra honestamente ambos buzones como pendientes mientras no exista conector.

## Decisiones y límites

- Un mensaje solo se registra una vez por buzón e identificador del proveedor; una respuesta conserva el responsable. Un correo dirigido a ambos hoteles mantiene dos peticiones por ahora. La fusión entre hoteles requiere revisión explícita.
- Las mutaciones verifican la versión dentro de una transacción y registran un evento. Una actualización concurrente obliga a refrescar.
- Bandeja: máximo 100 peticiones recientes por buzón; detalle: primeros 200 mensajes y últimos 100 eventos. Añadir paginación antes de gestionar históricos grandes. Actualización manual en esta entrega.
- Los mensajes se muestran como texto, nunca como HTML ejecutable. El adaptador debe extraer texto de mensajes HTML y decidir cómo conservar los originales. Mensajes vacíos/solo adjuntos y cuerpos de más de 200.000 caracteres requieren tratamiento específico en el conector; no deben descartarse silenciosamente.
- Pendientes: adjuntos privados con límites y validación, respuesta/envío y sincronización de enviados, recordatorios, conversión a presupuesto y extracción IA revisada por una persona. No se crean reservas ni se modifica ocupación.
- Antes de copiar contenido de correos a los grupos existentes, migrar la autenticación general y cerrar los accesos públicos de `groups` y `settings`. No se han endurecido esos accesos en esta entrega para evitar interrumpir las pantallas antiguas sin migrarlas.
- Antes de producción: probar con Firebase Emulator/proyecto de pruebas las funciones, permisos e índice; dos usuarios reclamando a la vez; reconexión del proveedor sin pérdidas; HTML/adjuntos; probar interfaz en navegador; definir conservación y acceso a originales. Las pruebas locales de dominio/handlers usan un almacén simulado, no sustituyen una prueba real de Firestore.

## Comprobación local

`node --test tests/mail.test.js`

`node node_modules/@babel/cli/bin/babel.js src/Peticiones.jsx --out-file js/Peticiones.js`

Abrir `Peticiones.html` a través de un servidor local para probar la demostración. No contiene correos reales.
