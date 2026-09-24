# Bibliotecas locales de Peticiones

La pantalla carga las mismas versiones del SDK de Firebase y versiones fijadas de React desde este directorio para evitar depender de scripts externos durante su apertura. Se conservan los avisos de licencia incluidos en cada distribución.

| Archivo | Versión | Fuente |
| --- | --- | --- |
| react-18.3.1.production.min.js | React 18.3.1 | https://unpkg.com/react@18.3.1/umd/react.production.min.js |
| react-dom-18.3.1.production.min.js | React DOM 18.3.1 | https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js |
| firebase-app-9.22.1-compat.js | Firebase 9.22.1 | https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js |
| firebase-auth-9.22.1-compat.js | Firebase 9.22.1 | https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js |
| firebase-functions-9.22.1-compat.js | Firebase 9.22.1 | https://www.gstatic.com/firebasejs/9.22.1/firebase-functions-compat.js |

Peticiones no inicializa Firestore en el navegador. Los estilos se generan con `npm run build:peticiones` usando el Tailwind 3 ya instalado en el proyecto. La autenticación y las funciones requieren conexión a Firebase; alojar los scripts localmente no elimina esa necesidad ni altera las protecciones del navegador.
