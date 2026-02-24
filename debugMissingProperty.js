const fs = require('fs');

const parseNum = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === 'number') return v;
    let s = String(v).trim().replace(/[^\d.,\-]/g, '');
    if (s === "" || s === "-" || s === "---" || s === "N/A" || s === "undefined") return 0;
    const dotCount = (s.match(/\./g) || []).length;
    const commaCount = (s.match(/,/g) || []).length;
    if (dotCount > 0 && commaCount > 0) {
        if (s.lastIndexOf(',') > s.lastIndexOf('.')) { s = s.replace(/\./g, '').replace(',', '.'); } else { s = s.replace(/,/g, ''); }
    } else if (commaCount > 1) { s = s.replace(/,/g, ''); 
    } else if (dotCount > 1) { s = s.replace(/\./g, ''); 
    } else if (commaCount === 1) {
        if (s.split(',').pop().length === 3 && s.length > 4) s = s.replace(',', ''); else s = s.replace(',', '.');
    } else if (dotCount === 1) {
        if (s.split('.').pop().length === 3 && s.length > 4) s = s.replace(/\./g, '');
    }
    const res = parseFloat(s);
    return isNaN(res) ? 0 : (res > 100000000 ? 0 : res);
};

const toNum = parseNum;

let existingRow = { "Pernoct.": "30" };
let newRow = { "Pernoct.": undefined }; // Excel did not have Pernoctaciones column

let changes = {};
const rawOld = existingRow["Pernoct."];
const rawNew = newRow["Pernoct."];

console.log('rawOld:', rawOld, 'rawNew:', rawNew);

// Skip if both are effectively empty
const isEmptyOld = (rawOld === null || rawOld === undefined || String(rawOld).trim() === "" || String(rawOld).trim() === "---");
const isEmptyNew = (rawNew === null || rawNew === undefined || String(rawNew).trim() === "" || String(rawNew).trim() === "---");

// IF THE EXCEL DOESN'T HAVE IT, SHOULD WE WARN IT WAS REMOVED?
if (rawNew === undefined) {
    console.log("No detectaremos cambios porque rawNew es undefined.");
} else {
    console.log("Detectaremos cambios");
}

