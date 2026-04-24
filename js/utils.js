/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Utilidades Compartidas
 * ═══════════════════════════════════════════════════════════
 * Módulo centralizado de funciones de utilidad.
 * Se carga antes que cualquier script de página.
 *
 * Uso: <script src="js/utils.js"></script>
 *      Luego acceder via window.NexusUtils.*
 * ═══════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  // ── Parseo numérico robusto ─────────────────────────────
  function parseNum(v) {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === "number") return v;

    var s = String(v).trim().replace(/[^\d.,\-]/g, "");
    if (s === "" || s === "-" || s === "---" || s === "N/A" || s === "undefined") return 0;

    var dotCount = (s.match(/\./g) || []).length;
    var commaCount = (s.match(/,/g) || []).length;

    if (dotCount > 0 && commaCount > 0) {
      if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
        s = s.replace(/\./g, "").replace(",", ".");
      } else {
        s = s.replace(/,/g, "");
      }
    } else if (commaCount > 1) {
      s = s.replace(/,/g, "");
    } else if (dotCount > 1) {
      s = s.replace(/\./g, "");
    } else if (commaCount === 1) {
      if (s.split(",").pop().length === 3 && s.length > 4) s = s.replace(",", "");
      else s = s.replace(",", ".");
    } else if (dotCount === 1) {
      if (s.split(".").pop().length === 3 && s.length > 4) s = s.replace(/\./g, "");
    }

    var res = parseFloat(s);
    if (isNaN(res)) return 0;
    if (res > 100000000) {
      console.error("NexusUtils.parseNum: valor absurdo suprimido:", res);
      return 0;
    }
    return res;
  }

  // ── Normalización de IDs de Firestore ──────────────────
  function normalizeId(id) {
    if (!id) return "";
    return String(id).trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");
  }

  // ── Extracción de ID base ──────────────────────────────
  function getBaseId(id) {
    if (!id) return "";
    return String(id).trim().replace(/\.0$/, "").split("_")[0];
  }

  // ── Normalización de nombre de hotel ───────────────────
  function normalizeHotelName(h) {
    if (!h) return "N/A";
    var s = String(h).toLowerCase();
    if (s.includes("guadiana")) return "SERCOTEL GUADIANA";
    if (s.includes("cumbria")) return "Cumbria Spa&Hotel";
    return h;
  }

  // ── Formateo de fecha (YYYY-MM-DD → DD/MM/YYYY) ───────
  function formatDate(dateStr) {
    if (!dateStr) return "";
    var s = String(dateStr).trim();

    var num = parseFloat(s);
    if (!isNaN(num) && num > 40000 && num < 60000) {
      var date = new Date(Math.round((num - 25569) * 86400 * 1000));
      return date.toLocaleDateString("es-ES");
    }

    if (s.includes("/") || s.includes("-")) {
      var parts = s.split(/[-\/]/);
      if (parts.length === 3) {
        var d = parts[0], m = parts[1], y = parts[2];
        if (y && y.length === 2) y = "20" + y;
        if (d && d.length === 4) {
          return parts[2].padStart(2, "0") + "/" + parts[1].padStart(2, "0") + "/" + parts[0];
        }
        return d.padStart(2, "0") + "/" + m.padStart(2, "0") + "/" + y;
      }
    }
    return s;
  }

  // ── Normalización a formato input (YYYY-MM-DD) ───────
  function toInputDate(val) {
    if (!val) return "";
    var str = String(val).trim();

    // Caso 1: Excel Serial (ej: 46129)
    var num = parseFloat(str);
    if (!isNaN(num) && num > 40000 && num < 60000) {
      try {
        var date = new Date(Math.round((num - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) return date.toISOString().split("T")[0];
      } catch (e) { }
    }

    // Caso 2: DD/MM/YYYY -> YYYY-MM-DD
    if (str.indexOf("/") !== -1) {
      var parts = str.split("/");
      if (parts.length === 3) {
        var d = parts[0], m = parts[1], yRaw = parts[2];
        var y = parseInt(yRaw);
        if (y < 100) y += 2000;
        return String(y) + "-" + m.padStart(2, "0") + "-" + d.padStart(2, "0");
      }
    }

    // Caso 3: DD.MM.YYYY -> YYYY-MM-DD
    if (str.indexOf(".") !== -1) {
      var parts = str.split(".");
      if (parts.length === 3) {
        var d = parts[0], m = parts[1], yRaw = parts[2];
        var y = parseInt(yRaw);
        if (y < 100) y += 2000;
        var yrStr = String(y);
        if (yrStr.length === 4 || yrStr.length === 2) {
          return yrStr + "-" + m.padStart(2, "0") + "-" + d.padStart(2, "0");
        }
        if (d.length === 4) return d + "-" + m.padStart(2, "0") + "-" + String(y).padStart(2, "0");
      }
    }

    // Caso 4: YYYY-MM-DD o DD-MM-YYYY
    if (str.indexOf("-") !== -1) {
      var parts = str.split(/[-T ]/);
      if (parts[0] && parts[0].length === 4) return parts.slice(0, 3).join("-"); // YYYY-MM-DD
      if (parts[2] && (parts[2].length === 4 || parts[2].length === 2)) {
        var d = parts[0], m = parts[1], yRaw = parts[2];
        var y = parseInt(yRaw);
        if (y < 100) y += 2000;
        return String(y) + "-" + m.padStart(2, "0") + "-" + d.padStart(2, "0");
      }
    }

    return str;
  }

  // ── Formateo numérico español ──────────────────────────
  function formatNum(num, decimals = 2) {
    if (num === null || num === undefined) return "0,00";
    var n = parseFloat(num);
    if (isNaN(n)) return "0,00";
    
    // Garantizar que decimals es un valor válido para Intl.NumberFormat
    var d = Math.max(0, Math.min(20, parseInt(decimals) || 0));
    
    // El mínimo siempre será 2 a menos que decimals sea menor
    var minD = Math.min(d, 2);

    return n.toLocaleString("es-ES", {
      minimumFractionDigits: minD,
      maximumFractionDigits: d,
      useGrouping: true
    });
  }

  // ── Formateo numérico con separador de miles ──────────
  function formatCurrency(n) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n || 0);
  }

  // ── Acceso seguro a localStorage ───────────────────────
  var safeStorage = {
    getItem: function (key) {
      try { return localStorage.getItem(key); }
      catch (e) { console.warn("Storage access blocked for key: " + key, e); return null; }
    },
    setItem: function (key, value) {
      try { localStorage.setItem(key, value); }
      catch (e) { console.warn("Storage set failed for key: " + key, e); }
    },
    removeItem: function (key) {
      try { localStorage.removeItem(key); }
      catch (e) { console.warn("Storage remove failed for key: " + key, e); }
    },
  };

  // ── Generación de array de fechas ──────────────────────
  function generateDates(start, end) {
    if (!start || !end) return [];
    try {
      var d1 = new Date(start + "T00:00:00");
      var d2 = new Date(end + "T00:00:00");
      if (isNaN(d1) || isNaN(d2) || d1 >= d2) return [];
      var dates = [];
      var current = new Date(d1);
      while (current < d2) {
        var year = current.getFullYear();
        var month = String(current.getMonth() + 1).padStart(2, "0");
        var day = String(current.getDate()).padStart(2, "0");
        dates.push(year + "-" + month + "-" + day);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    } catch (e) { return []; }
  }

  // ── Generación de fechas para una serie (múltiples rangos) ──
  function generateSeriesDates(ranges) {
    if (!ranges || !Array.isArray(ranges) || ranges.length === 0) return [];
    var allDates = new Set();
    ranges.forEach(function(r) {
      if (r.in && r.out) {
        var dates = generateDates(r.in, r.out);
        dates.forEach(function(d) { allDates.add(d); });
      }
    });
    return Array.from(allDates).sort();
  }

  // ── Paleta de colores compartida ───────────────────────
  var COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ff5722", "#795548"];

  // ── Status helpers ─────────────────────────────────────
  function getStatusColor(status) {
    var s = (status || "").toUpperCase();
    if (s.includes("CONFIRM")) return "bg-green-100 text-green-700 border-green-200";
    if (s.includes("ENVIADO")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (s.includes("SEGUIMIENTO")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
    if (s.includes("DESESTIMADO") || s.includes("CANCEL")) return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  // ── Exportar al scope global ───────────────────────────
  window.NexusUtils = {
    parseNum: parseNum,
    normalizeId: normalizeId,
    getBaseId: getBaseId,
    normalizeHotelName: normalizeHotelName,
    formatDate: formatDate,
    formatNum: formatNum,
    formatCurrency: formatCurrency,
    safeStorage: safeStorage,
    generateDates: generateDates,
    generateSeriesDates: generateSeriesDates,
    getStatusColor: getStatusColor,
    toInputDate: toInputDate,
    COLORS: COLORS,
  };

})();
