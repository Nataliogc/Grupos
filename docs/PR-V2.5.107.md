# Propuesta de Pull Request · Nexus Groups V2.5.107

**Título propuesto** — Proteger los cobros PayGold y el acceso por hotel, y recuperar las 197 pruebas de Nexus Groups.

**Rama** — `security/nexus-v25106`, base `c37bdd9` (V2.5.106). Cambios locales para revisión.

## Cambios funcionales

- El servidor comprueba el token Firebase con revocación, la membresía activa y el permiso explícito para la combinación de hotel y aplicación antes de solicitar un enlace. Un administrador puede asignar esos permisos desde **Usuarios → Editar**. Las cuentas existentes se vinculan por UID. La cuenta demo queda bloqueada.
- Grupos obtiene el saldo, el siguiente tramo pendiente y, si procede, el depósito inicial del 30 % a partir de la reserva registrada. El navegador puede seleccionar un importe que coincida con esas cantidades. Los importes personalizados requieren un tramo registrado. Una referencia de presupuesto pendiente de conversión (`PRES-`) o una reserva ambigua no genera enlaces.
- Las reglas permiten al comercial mantener presupuestos y editar datos operativos de reservas. Dirección y Administración pueden crear reservas definitivas, convertir presupuestos y modificar hotel, localizador, total, plan o cobros registrados de una reserva definitiva. Este reparto de permisos debe revisarse con Recepción y Dirección antes de publicar. La escritura del servidor usa Firebase Admin.
- MesaChef y Gest-Spa consultan las reservas en sus proyectos de origen. Gest-Spa queda asociado a Cumbria. MesaChef requiere que la reserva identifique el hotel. Las aplicaciones externas necesitan usar una identidad aceptada por el hub y tener el permiso correspondiente.
- El pedido y su importe esperado se registran antes de contactar con Redsys. La respuesta REST necesita firma válida. El webhook coteja pedido, comercio, hotel, aplicación, referencia e importe. El recibo de entrega y el cambio de saldo se escriben en una misma transacción de destino para soportar reenvíos concurrentes. Se conserva el registro por localizador anterior cuando permite identificar inequívocamente el pedido.
- Las claves bancarias y la de comunicación interna se obtienen de la configuración de servidor. Se conserva la función de correo programado y su interruptor de configuración. El proyecto local continúa preparado para el TPV de Cumbria. La puesta en marcha de Guadiana sigue dependiendo de su configuración bancaria y de su función receptora.
- El acceso a los módulos usa Firebase Authentication. El panel administrativo gestiona cuentas existentes, roles, restablecimiento y permisos de cobro. El correo exige además pertenencia al buzón. El guardado de Configuración deja de escribir el antiguo directorio de contraseñas.

## Los 18 fallos iniciales

| Área | Fallos | Corrección y criterio |
| --- | ---: | --- |
| Estancia media | 2 | El entorno de prueba proporciona la lectura de PVP diario y el hotel alternativo que usa el cálculo real. Se mantienen las expectativas de medias por noche y régimen. |
| Duplicación de presupuestos | 1 | La prueba carga el módulo compartido que decide si la copia sigue editable. |
| Suplementos, descuentos y comisiones | 4 | El caso de prueba utiliza las fechas reales de estancia y NexusUtils. Mantiene el total de 10.325,20 €, el descuento, la base de comisión y el neto originales. |
| Alertas de confirmación y pagos | 3 | Se evalúan las funciones financieras hasta el inicio del componente actual, evitando interpretar JSX como JavaScript. |
| Fechas manuales | 1 | Se usa el generador real. Una fecha de entrada incompleta aporta cero noches, en coherencia con la prueba de fechas inválidas. |
| Suplementos de catálogo | 1 | Se corrige la tabla esperada para aplicar la regla comercial vigente de redondeo a 0,05 €. En el ejemplo de PVP 231 €, la triple en alojamiento queda en 318,20 €. |
| Outlook en Windows | 1 | Se verifica el manejador en modo de validación con política RemoteSigned limitada al proceso hijo. |
| Cláusulas de proforma | 5 | El entorno de prueba suministra el almacenamiento de grupo seleccionado que utiliza la pantalla. Se mantienen los casos de persistencia, edición y error de guardado. |

Los 18 fallos correspondían a preparaciones de prueba desactualizadas, expectativas contradictorias o diferencias del entorno. La corrección de esos casos conserva la fórmula económica del presupuesto. Los cambios de producto afectan principalmente a cobros, autenticación, permisos y reenvíos.

## Verificación local

- **Node.js 22.13.1 en Windows. 47 archivos, 204 pruebas superadas, cero fallidas, omitidas o canceladas.** Son las 197 pruebas anteriores y 7 nuevas. Para reproducir con Node 22, ejecutar `npm test` en la raíz. Cada archivo tiene su propio proceso para aislar variables globales y evitar el fallo de serialización de la salida de MesaChef en este entorno.
- Las nuevas pruebas cubren firmas inválidas o ausentes, respuesta REST de otro importe, referencia y comercio incorrectos, hotel y aplicación fuera de permiso, cuenta demo, claves ausentes, saldo ya pagado, presupuesto pendiente de conversión y reentrega concurrente tanto en el webhook como en destino. Las pruebas bancarias usan claves ficticias y dobles locales.
- Se comprobó que Functions carga sus 14 exportaciones en Node 22, incluido el sincronizador de correo. Se revisaron las dependencias de ejecución instaladas y las restricciones de Node de los paquetes del lockfile de Functions. Se mantienen las versiones de las dependencias.
- En Chrome se cargó el SDK de autenticación y se verificó la redirección al login al abrir Usuarios sin sesión, bloqueando el tráfico externo. La búsqueda de los tres valores literales históricos de Redsys y comunicación interna en los archivos locales del proyecto terminó sin coincidencias. Este resultado se refiere al árbol de trabajo.
- El incremento de versión se ejecutó una vez. La versión del paquete, el lockfile, la navegación, la información de versión, el panel y la caché PWA corresponden a V2.5.107.

## Pendiente de validar antes de publicar

El entorno no dispone de Java ni del emulador Firestore. Quedan por validar las reglas con dicho emulador y una sesión completa con cuentas de prueba de administrador, dirección y comercial. Conviene verificar especialmente la conversión desde presupuesto y el tratamiento de los campos económicos por Recepción. La activación exige una membresía administrativa inicial y la asignación de permisos PayGold a las cuentas autorizadas. Las cuentas Firebase y los datos de producción no se han modificado.

Quedan fuera de la verificación local los tokens de los clientes externos de MesaChef y Gest-Spa, sus permisos IAM entre proyectos, los pedidos históricos sin datos suficientes para conciliación y la comunicación bancaria real. Corresponde revisar en el proyecto de origen quién puede modificar los campos económicos de esas reservas. Antes de activar las nuevas reglas debe revisarse también si el antiguo documento de configuración aún contiene credenciales heredadas. Ninguna de estas comprobaciones requiere incluir valores secretos en la PR.
