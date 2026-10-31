const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const versionJsPath = path.join(rootDir, 'js', 'version.js');
const navigationJsPath = path.join(rootDir, 'js', 'navigation.js');
const packageJsonPath = path.join(rootDir, 'package.json');
const adminJsxPath = path.join(rootDir, 'src', 'Admin.jsx');
const swJsPath = path.join(rootDir, 'sw.js');

// 1. Obtener versión actual y calcular siguiente parche
let pkg = {};
try {
  pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (e) {
  pkg = { version: "2.5.0" };
}

let currentVer = pkg.version || "2.5.0";
currentVer = String(currentVer).replace(/^v/i, '').trim();
const parts = currentVer.split('.').map(n => parseInt(n, 10) || 0);
while (parts.length < 3) parts.push(0);

// Incrementar parche (X.Y.Z -> X.Y.(Z+1))
parts[2] += 1;
const rawVersion = parts.join('.');
const newVersionTag = `V${rawVersion}`;

const now = new Date();
const pad = n => String(n).padStart(2, '0');
const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

console.log(`[BUMP-VERSION] Autoincrementando versión: ${pkg.version} -> ${newVersionTag} (${dateStr})`);

// 2. Actualizar package.json
pkg.version = rawVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

// 3. Actualizar js/version.js
const versionJsContent = `/**
 * NEXUS GROUPS — VERSIÓN ÚNICA GLOBAL DEL SISTEMA
 * ═════════════════════════════════════════════════════════════
 * Versión única compartida por todos los módulos de la aplicación.
 * Autoincrementada automáticamente en cada compilación y mejora.
 */
(function (root) {
    "use strict";

    var versionInfo = {
        version: "${newVersionTag}",
        buildDate: "${dateStr}",
        name: "Nexus Groups"
    };

    root.NEXUS_VERSION = versionInfo.version;
    root.NEXUS_SYSTEM_INFO = versionInfo;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = versionInfo;
    }
})(typeof window !== "undefined" ? window : globalThis);
`;
fs.writeFileSync(versionJsPath, versionJsContent, 'utf8');

// 4. Actualizar js/navigation.js
if (fs.existsSync(navigationJsPath)) {
  let nav = fs.readFileSync(navigationJsPath, 'utf8');
  nav = nav.replace(
    /var NEXUS_GLOBAL_VERSION = [^;]+;/,
    `var NEXUS_GLOBAL_VERSION = (window.NEXUS_SYSTEM_INFO && window.NEXUS_SYSTEM_INFO.version) || window.NEXUS_VERSION || "${newVersionTag}";`
  );
  nav = nav.replace(
    /var NEXUS_GLOBAL_DATE = [^;]+;/,
    `var NEXUS_GLOBAL_DATE = (window.NEXUS_SYSTEM_INFO && window.NEXUS_SYSTEM_INFO.buildDate) || "${dateStr}";`
  );
  nav = nav.replace(
    /<span class="px-1\.5 py-0\.5 bg-slate-900 text-white[^>]+>[\s\S]*?<\/span>/,
    `<span class="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[8.5px] font-black uppercase tracking-wider shadow-2xs select-none" title="Versión Nexus Groups: ${newVersionTag} (${dateStr})">\n                                    ${newVersionTag}\n                                </span>`
  );
  fs.writeFileSync(navigationJsPath, nav, 'utf8');
}

// 5. Actualizar src/Admin.jsx footer
if (fs.existsSync(adminJsxPath)) {
  let admin = fs.readFileSync(adminJsxPath, 'utf8');
  admin = admin.replace(
    /Nexus Gold Edition (?:V|v)[\d\.]+/g,
    `Nexus Gold Edition ${newVersionTag}`
  );
  fs.writeFileSync(adminJsxPath, admin, 'utf8');
}

// 6. Actualizar versión de caché en sw.js
if (fs.existsSync(swJsPath)) {
  let sw = fs.readFileSync(swJsPath, 'utf8');
  sw = sw.replace(
    /const CACHE_NAME = "nexus-groups-pwa-[^"]+";/,
    `const CACHE_NAME = "nexus-groups-pwa-v${rawVersion}";`
  );
  fs.writeFileSync(swJsPath, sw, 'utf8');
}

console.log(`[BUMP-VERSION] ¡Versión ${newVersionTag} aplicada correctamente a todo el sistema!`);
