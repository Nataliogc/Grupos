/**
 * NEXUS GROUPS — VERSIÓN ÚNICA GLOBAL DEL SISTEMA
 * ═════════════════════════════════════════════════════════════
 * Versión única compartida por todos los módulos de la aplicación.
 * Autoincrementada automáticamente en cada compilación y mejora.
 */
(function (root) {
    "use strict";

    var versionInfo = {
        version: "V2.5.12",
        buildDate: "30/10/2026 02:43",
        name: "Nexus Groups"
    };

    root.NEXUS_VERSION = versionInfo.version;
    root.NEXUS_SYSTEM_INFO = versionInfo;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = versionInfo;
    }
})(typeof window !== "undefined" ? window : globalThis);
