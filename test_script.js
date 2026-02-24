const fs = require('fs');

const parseNum = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === 'number') return v;
    let s = String(v).trim().replace(/[^\d.,\-]/g, '');
    if (s === "" || s === "-" || s === "---" || s === "N/A" || s === "undefined") return 0;

    const dotCount = (s.match(/\./g) || []).length;
    const commaCount = (s.match(/,/g) || []).length;

    if (dotCount > 0 && commaCount > 0) {
        if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
            s = s.replace(/\./g, '').replace(',', '.');
        } else {
            s = s.replace(/,/g, '');
        }
    } else if (commaCount > 1) {
        s = s.replace(/,/g, '');
    } else if (dotCount > 1) {
        s = s.replace(/\./g, '');
    } else if (commaCount === 1) {
        if (s.split(',').pop().length === 3 && s.length > 4) s = s.replace(',', '');
        else s = s.replace(',', '.');
    } else if (dotCount === 1) {
        if (s.split('.').pop().length === 3 && s.length > 4) s = s.replace(/\./g, '');
    }

    const res = parseFloat(s);
    if (isNaN(res)) return 0;
    if (res > 100000000) return 0; 
    return res;
};

// Simulation of 18 modifications
let existingRow = { "Pernoct.": undefined, "Noches": "30" };
let newRow = { "Pernoct.": undefined, "Noches": "30" };

// What does the loop do for 'Pernoct.'?
const relevantKeys = ["Entrada", "Salida", "Pax.", "Importe(*)", "Régimen", "Segment.", "Nombre del Grupo", "Noches", "Pernoct.", "Empresa/Agencia"];
const NUMERIC_KEYS = new Set(["Importe(*)", "Pax.", "Noches", "Pernoct."]);
const DATE_KEYS = new Set(["Entrada", "Salida"]);

let changes = {};

relevantKeys.forEach(key => {
    const rawOld = existingRow[key];
    const rawNew = newRow[key];

    const isEmptyOld = (rawOld === null || rawOld === undefined || String(rawOld).trim() === "" || String(rawOld).trim() === "---");
    const isEmptyNew = (rawNew === null || rawNew === undefined || String(rawNew).trim() === "" || String(rawNew).trim() === "---");
    if (isEmptyOld && isEmptyNew) return;

    let isDifferent = false;

    if (NUMERIC_KEYS.has(key)) {
        const numOld = parseNum(rawOld);
        const numNew = parseNum(rawNew);
        if (isNaN(numOld) && isNaN(numNew)) return;
        if (isNaN(numOld) !== isNaN(numNew)) {
            const validNum = isNaN(numOld) ? numNew : numOld;
            isDifferent = Math.abs(validNum) > 0.01;
        } else {
            isDifferent = Math.abs(numOld - numNew) > 0.05;
        }
    }

    if (isDifferent) {
        const displayOld = isEmptyOld ? "---" : rawOld;
        const displayNew = isEmptyNew ? "---" : rawNew;
        changes[key] = { old: displayOld, new: displayNew };
    }
});

console.log(changes);
