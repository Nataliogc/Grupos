const fs = require('fs');
let content = fs.readFileSync('js/services/mesachefService.js', 'utf8');

// 1. Update isYear2027OrLater function
const oldIsYearFunction = `  /**
   * Determina si una reserva pertenece ESTRICTAMENTE a 2027 o posterior (>= 2027)
   */
  function isYear2027OrLater(entryDateStr) {
    if (!entryDateStr) return false;
    if (typeof entryDateStr === "number") {
      // Número de serie Excel: 46388 corresponde al 01-01-2027
      if (entryDateStr >= 46388) return true;
      if (entryDateStr > 30000 && entryDateStr < 46388) return false; // 2026 o anterior
      return entryDateStr >= 2027;
    }
    var s = String(entryDateStr).trim();

    // Formato ISO YYYY-MM-DD o YYYY/MM/DD
    if (/^\\d{4}/.test(s)) {
      var y = parseInt(s.substring(0, 4), 10);
      return y >= 2027;
    }
    // Formato español DD/MM/YYYY o DD-MM-YYYY
    var parts = s.split(/[-\\/.]/);
    if (parts.length >= 3) {
      if (parts[2].length >= 4) {
        var yNum = parseInt(parts[2].substring(0, 4), 10);
        if (!isNaN(yNum)) return yNum >= 2027;
      }
      if (parts[0].length === 4) {
        var yFirst = parseInt(parts[0], 10);
        if (!isNaN(yFirst)) return yFirst >= 2027;
      }
    }
    var d = new Date(s);
    return !isNaN(d.getTime()) && d.getFullYear() >= 2027;
  }`;

const newIsYearFunction = `  /**
   * Determina si una reserva es a partir del 5 de octubre de 2026 en adelante (>= 2026-10-05)
   */
  function isYear2027OrLater(entryDateStr) {
    if (!entryDateStr) return false;
    var iso = toIsoDate(entryDateStr);
    if (iso) {
      return iso >= "2026-10-05";
    }
    return false;
  }
  var isEligibleDate = isYear2027OrLater;`;

// 2. Update toIsoDate to support Excel serial numbers
const oldToIsoDate = `  function toIsoDate(dateVal) {
    if (!dateVal) return null;
    if (dateVal instanceof Date) {
      if (isNaN(dateVal.getTime())) return null;
      return dateVal.toISOString().split("T")[0];
    }
    var s = String(dateVal).trim();
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(s)) return s;
    if (/^\\d{4}\\/\\d{2}\\/\\d{2}$/.test(s)) return s.replace(/\\//g, "-");

    var parts = s.split(/[-\\/.]/);
    if (parts.length >= 3) {
      var d = parts[0].padStart(2, "0");
      var m = parts[1].padStart(2, "0");
      var y = parts[2].substring(0, 4);
      if (d.length === 2 && y.length === 4) {
        return y + "-" + m + "-" + d;
      }
    }
    var parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
    return null;
  }`;

const newToIsoDate = `  function toIsoDate(dateVal) {
    if (!dateVal) return null;
    if (typeof dateVal === "number" || (!isNaN(Number(dateVal)) && Number(dateVal) > 30000 && !String(dateVal).includes("-") && !String(dateVal).includes("/"))) {
      var n = Number(dateVal);
      var excelEpoch = new Date(Date.UTC(1899, 11, 30));
      var jsDate = new Date(excelEpoch.getTime() + n * 86400000);
      return jsDate.toISOString().split("T")[0];
    }
    if (dateVal instanceof Date) {
      if (isNaN(dateVal.getTime())) return null;
      return dateVal.toISOString().split("T")[0];
    }
    var s = String(dateVal).trim();
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(s)) return s;
    if (/^\\d{4}\\/\\d{2}\\/\\d{2}$/.test(s)) return s.replace(/\\//g, "-");

    var parts = s.split(/[-\\/.]/);
    if (parts.length >= 3) {
      var d = parts[0].padStart(2, "0");
      var m = parts[1].padStart(2, "0");
      var y = parts[2].substring(0, 4);
      if (d.length === 2 && y.length === 4) {
        return y + "-" + m + "-" + d;
      }
    }
    var parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
    return null;
  }`;

content = content.replace(oldIsYearFunction, newIsYearFunction);
content = content.replace(oldToIsoDate, newToIsoDate);
content = content.replace(/2027 en adelante/g, "5 de octubre de 2026 en adelante");
content = content.replace(/solo 2027\+ con MP\/PC/g, "desde 05/10/2026 con MP/PC");

fs.writeFileSync('js/services/mesachefService.js', content, 'utf8');
console.log('Updated mesachefService.js to support >= 2026-10-05!');
