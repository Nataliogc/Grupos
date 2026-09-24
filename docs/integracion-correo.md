# Integración de peticiones por correo

## Estado actual (sin desplegar)

`Peticiones.html` ofrece una demostración con datos ficticios en memoria y acceso separado al equipo mediante Firebase Auth. Incluye filtros por buzón/responsable, conversación en texto plano, asignación, estados y notas con historial. La demostración no guarda datos ni envía correos. El acceso real usa funciones autenticadas; no confía en la sesión local heredada.

Destinatarios a conectar: `grupos@hotelguadiana.es` y `grupos@encumbria.es`. El usuario utiliza Outlook; el proveedor subyacente todavía se desconoce. No se ha conectado, leído ni modificado ningún buzón.

Consulta DNS pública del 24/09/2026: MX de `hotelguadiana.es` apunta a `hotelguadiana.es` (prioridad 0); MX de `encumbria.es` apunta a `encumbria.es` (prioridad 0). Esto no identifica el servidor IMAP ni demuestra que las cuentas sean Microsoft 365. Confirmar tipo de cuenta y servidor entrante en Outlook o con informática.

Validación realizada: doce pruebas locales de dominio, sincronización y handlers aprobadas; compilación JSX, sintaxis e importación de todas las funciones correctas. Se comprueba el análisis MIME con MailParser real y los flujos IMAP/Firestore con dobles de prueba. En navegador se ha comprobado selección de petición, asignación y nota interna con historial en modo demostración. La página utiliza cabecera propia para que el acceso verificado no dependa de la sesión heredada de navegación.

## Activación por el administrador

1. Identificar en Outlook el tipo de cuenta (Microsoft 365/Exchange o IMAP) y, si es IMAP, el nombre del servidor. No compartir contraseñas en conversaciones ni en el repositorio.
2. Habilitar Email/Password en Firebase Authentication y crear cuentas individuales de acceso a la aplicación. No reutilizar claves del correo. Configurar recuperación de contraseña y los dominios autorizados antes del uso operativo.
3. Crear, con Admin SDK o consola de administración, `mailMembers/{firebaseAuthUid}` con `name`, `active: true`, `role: "admin"` o `"commercial"`, y `mailboxes` (lista explícita de los buzones permitidos). Son autorizaciones privadas, independientes de `settings/main`, que actualmente es público. Nunca copiar contraseñas de la configuración antigua. La lista comercial nueva usa UID estables; la migración desde la lista antigua requiere vincular cada persona a su cuenta verificada.
4. Desplegar el índice de `firestore.indexes.json` y las funciones `mailInbox`, `mailDetail`, `mailUpdate` tras revisar el proyecto de destino. Todas las colecciones nuevas permanecen denegadas a clientes por las reglas generales existentes; solo las funciones autenticadas acceden mediante Admin SDK. Dirección y comerciales solo ven buzones explícitamente autorizados. Un comercial puede reclamar una petición sin responsable; solo dirección puede reasignar.
5. Si las cuentas admiten IMAP con TLS por puerto 993, configurar el conector incluido siguiendo el apartado siguiente. Si son Microsoft 365/Exchange sin IMAP autorizado, implementar Microsoft Graph y su autorización; no activar este conector por suposición. `ingestMessage` es una función interna, NO un webhook público.
6. Validar en un proyecto de pruebas la recepción, recuperación y permisos antes de desplegar. La bandeja consulta el estado real, última sincronización e incidencias. No hay notificaciones externas de incidencias todavía.

## Conector IMAP preparado, desactivado por defecto

- `syncGroupMail` se programa cada cinco minutos. Requiere el secreto `MAIL_IMAP_CONFIG` y el parámetro `MAIL_IMAP_ENABLED=true`. Su valor predeterminado es `false`. No se ha desplegado ningún trabajo programado.
- `functions/mail-imap.example.json` muestra la estructura del secreto sin credenciales reales. Configurar los valores exclusivamente en Secret Manager con la herramienta de Firebase (`firebase functions:secrets:set MAIL_IMAP_CONFIG`) y verificar el proyecto seleccionado. No introducir secretos en archivos versionados, `settings/main`, el navegador ni el chat. Cada cuenta necesita además `enabled: true`. El secreto debe existir para desplegar la función, incluso si permanece desactivada; puede contener `[]` durante la preparación.
- El parámetro de activación se establece en el entorno de despliegue de Firebase; las credenciales nunca van en ese parámetro. Desplegar únicamente las funciones de correo y los índices revisados. Se necesita facturación habilitada para Cloud Functions/Cloud Scheduler/Secret Manager; no se ha cambiado la facturación ni contratado servicios.
- Primera conexión correcta: guarda `UIDNEXT - 1` como punto de inicio. Importa mensajes que lleguen desde ese instante, sin importar el histórico. Los correos previos permanecen en Outlook. No mover ni eliminar mensajes de INBOX con reglas de Outlook antes de que la sincronización los recoja; el conector actual solo revisa INBOX.
- Conexión TLS con validación de certificado, buzón abierto en modo de solo lectura. No se envían mensajes, no se cambian flags y no se borra ni mueve correo. Logs de protocolo desactivados.
- Lee ventanas de hasta 100 UID por ejecución. El cursor avanza tras guardar el correo, o tras registrar una incidencia para mensajes de más de 10 MB/no interpretables. Si falla la red o Firestore se reintenta desde el último punto confirmado en la siguiente ejecución.
- El bloqueo persistente dura 12 minutos y evita sincronizaciones solapadas; la función tiene un límite de 9 minutos. Cada hotel se procesa por separado. Un cambio de servidor/usuario/`UIDVALIDITY` bloquea la recepción con aviso en vez de reiniciar el cursor y perder mensajes. Un administrador debe planificar la recuperación sin borrar a ciegas el cursor.
- `mailMessageIndex` evita duplicados por buzón y Message-ID (fallback UIDVALIDITY+UID). `mailThreadLinks` enlaza Message-ID, In-Reply-To y References; los asuntos no identifican hilos. Referencias contradictorias no fusionan peticiones existentes: se conserva la primera coincidencia y la reconciliación manual queda pendiente.
- `mailSync/{buzón}/issues` registra mensajes que requieren revisión (sin cuerpo ni contraseña). La pantalla muestra hasta 20 incidencias abiertas. El administrador debe revisar el original y organizar su reingesta antes de marcar `resolved: true`; todavía no existe una acción de reintento desde la interfaz.
- Los mensajes HTML se convierten a texto. El texto visible se limita a 160.000 caracteres y se señala si se abrevia. Se conservan nombre, tipo y tamaño de hasta 100 adjuntos, pero el contenido de los adjuntos sigue únicamente en el buzón original.

## Decisiones y límites

- Un mensaje solo se registra una vez por buzón e identificador del proveedor; una respuesta conserva el responsable. Un correo dirigido a ambos hoteles mantiene dos peticiones por ahora. La fusión entre hoteles requiere revisión explícita.
- Las mutaciones verifican la versión dentro de una transacción y registran un evento. Una actualización concurrente obliga a refrescar.
- Bandeja: máximo 100 peticiones recientes por buzón; detalle: últimos 200 mensajes (mostrados en orden cronológico) y últimos 100 eventos. Añadir paginación antes de gestionar históricos grandes. Actualización manual en esta entrega.
- Los mensajes se muestran como texto, nunca como HTML ejecutable. Se crea una petición incluso para correos sin texto o con solo adjuntos, indicando dónde consultar el original.
- El botón Contestar prepara una respuesta al último mensaje en Outlook clásico mediante el enlace local de `outlook/`. Outlook conserva la firma automática para mensajes nuevos y el enlace inserta debajo el texto original. Requiere instalación por equipo, firma configurada y revisión del remitente. No confirma ni registra un envío. Ver `outlook/LEEME.md`.
- Pendientes: adjuntos privados con límites y validación, sincronización de enviados desde Outlook, recordatorios, conversión a presupuesto y extracción IA revisada por una persona. No se crean reservas ni se modifica ocupación.
- Antes de copiar contenido de correos a los grupos existentes, migrar la autenticación general y cerrar los accesos públicos de `groups` y `settings`. No se han endurecido esos accesos en esta entrega para evitar interrumpir las pantallas antiguas sin migrarlas.
- Antes de producción: probar con Firebase Emulator/proyecto de pruebas las funciones, permisos e índice; dos usuarios reclamando a la vez; reconexión del proveedor sin pérdidas; HTML/adjuntos; probar interfaz en navegador; definir conservación y acceso a originales. Las pruebas locales de dominio/handlers usan un almacén simulado, no sustituyen una prueba real de Firestore.
- La auditoría `npm audit --omit=dev` detecta vulnerabilidades altas y críticas en dependencias heredadas de Firebase Admin 11 (incluidas cadenas Firestore/protobuf y Realtime Database). Hace falta una actualización compatible y validación antes de producción. No se ha aplicado una actualización mayor automática a toda la infraestructura en esta entrega. Las pruebas locales se ejecutaron con Node 24; verificar también el runtime objetivo Node 20 o actualizarlo con las dependencias antes del despliegue.

## Referencias de implementación

- [ImapFlow: conexión, lectura y bloqueos](https://imapflow.com/docs/api/imapflow-client/)
- [MailParser: procesamiento MIME](https://nodemailer.com/extras/mailparser)
- [Firebase: funciones programadas](https://firebase.google.com/docs/functions/schedule-functions)

## Comprobación local

`node --test tests/mail.test.js tests/mail-imap.test.js`

`node --test tests/outlookReply.test.js`

La validación de Outlook cubre destinatario, codificación, cabeceras, mensajes largos y lectura del enlace/archivo en Windows sin abrir Outlook. El enlace local está instalado en el equipo de desarrollo y el botón se ha verificado en la interfaz; la apertura real fue bloqueada por la política de seguridad del navegador de pruebas. Comprobar manualmente la firma y el borrador en Outlook clásico antes de dar la función por validada de extremo a extremo.

`node node_modules/@babel/cli/bin/babel.js src/Peticiones.jsx --out-file js/Peticiones.js`

Abrir `Peticiones.html` a través de un servidor local para probar la demostración. No contiene correos reales.
