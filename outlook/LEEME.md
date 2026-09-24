# Contestar con Outlook clásico

Instalar una vez en cada PC Windows: ejecutar `Instalar-Outlook.ps1` desde esta carpeta con la cuenta habitual del usuario. No necesita permisos de administrador. Requiere Outlook clásico configurado; no funciona con el nuevo Outlook. Si la política corporativa bloquea scripts, informática debe firmar y distribuir los scripts según su política. El instalador no cambia esa protección.

El botón Contestar abre un mensaje dirigido a Reply-To de la agencia (o al remitente), con asunto RE. Outlook inserta la firma predeterminada para mensajes nuevos de la cuenta predeterminada. El enlace añade el mensaje original como texto debajo, conservando el formato y las imágenes de la firma, y sitúa el cursor arriba. Configurar una firma automática para mensajes nuevos en Outlook; si no hay firma configurada, no se inventa ninguna. Revisar la cuenta remitente antes de enviar; se usa la predeterminada del usuario, no se fuerza la dirección del hotel.

No envía correo automáticamente ni marca la petición como contestada. Los mensajes enviados desde Outlook todavía no se sincronizan con la aplicación. Para mensajes nuevos importados se conservan Reply-To y Message-ID, que se incluyen en las cabeceras de respuesta. Los anteriores sin identificador se abren como composición nueva con asunto RE.

El navegador puede pedir abrir la aplicación externa. Si no se abre, comprobar la instalación; la web no puede confirmar que Outlook haya arrancado. En mensajes largos se descarga `respuesta.nexusreply`: abrirlo para preparar la respuesta sin recortar el texto. Contiene el texto del correo; tratarlo como un documento privado. No se incluyen adjuntos originales. Los mensajes cuyo texto ya estaba abreviado en el servidor se deben contestar directamente en Outlook.

La instalación copia el enlace a `%LOCALAPPDATA%\NexusGroups\Outlook` y registra, solo para el usuario actual, `HKCU\Software\Classes\nexus-outlook`, `NexusGroups.Reply` y `.nexusreply`. Para desinstalar, informática puede eliminar exactamente esas tres claves y esa carpeta. El enlace solo valida datos y crea un borrador; no ejecuta contenido del mensaje ni acepta comandos de shell desde él.

Referencias: [editor de Outlook](https://learn.microsoft.com/en-us/office/vba/api/outlook.inspector.wordeditor), [firmas de Outlook](https://support.microsoft.com/en-us/outlook/mail/how-to-add-and-change-an-email-signature-in-outlook).
