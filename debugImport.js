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

const normalizeId = (id) => id ? String(id).trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-") : "";

const toIsoDate = (v) => {
    if (v === null || v === undefined || v === "" || v === "---") return "";
    let s = String(v).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
    let d, m, y;
    if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/.test(s)) {
        const parts = s.split(/[-\/]/);
        [d, m, y] = parts;
    } else if (/^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(s)) {
        const parts = s.split(/[-\/T ]/);
        [y, m, d] = parts;
    }
    if (d && m && y) return \\-\-\\;
    return "";
};

const toNum = parseNum;
const cleanStr = (v) => String(v).replace(/\.0$/, '').trim().toUpperCase().replace(/\s+/g, ' ');

const INITIAL_DATA = [
    { "Reserva": "196215", "Nombre del Grupo": "ORGANIZACIÓN SALSEA", "Entrada": "16/01/2026", "Salida": "18/01/2026", "Noches": "2", "Pax.": "15", "Pernoct.": "30", "Empresa/Agencia": "SALSEA 2026", "Segment.": "GRUPOS", "Régimen": "HD", "Importe(*)": "1514", "Garantía": "ANTES 18:00" },
    { "Reserva": "196215", "Nombre del Grupo": "ORGANIZACIÓN SALSEA", "Entrada": "16/01/2026", "Salida": "18/01/2026", "Noches": "2", "Pax.": "7", "Pernoct.": "14", "Empresa/Agencia": "SALSEA 2026", "Segment.": "GRUPOS", "Régimen": "HA", "Importe(*)": "536", "Garantía": "ANTES 18:00" }
];

// First import!
const groupedMap = new Map();
const parseToDateObj = (str) => {
    if (!str) return null;
    const parts = String(str).split(/[\/-]/);
    if (parts.length !== 3) return new Date(str);
    if (parts[0].length === 4) return new Date(str);
    return new Date(\\-\-\\);
};

INITIAL_DATA.forEach(row => {
    const id = normalizeId(row["Reserva"]);
    if (!groupedMap.has(id)) {
        groupedMap.set(id, { ...row });
    } else {
        const existing = groupedMap.get(id);
        const oldPax = parseNum(existing["Pax."]);
        const newPax = parseNum(row["Pax."]);
        existing["Pax."] = (oldPax + newPax).toString();

        const oldImp = parseNum(existing["Importe(*)"]);
        const newImp = parseNum(row["Importe(*)"]);
        existing["Importe(*)"] = (oldImp + newImp).toFixed(2);

        const eIn = parseToDateObj(existing["Entrada"]);
        const rIn = parseToDateObj(row["Entrada"]);
        if (rIn && eIn && rIn < eIn) existing["Entrada"] = row["Entrada"];

        const eOut = parseToDateObj(existing["Salida"]);
        const rOut = parseToDateObj(row["Salida"]);
        if (rOut && eOut && rOut > eOut) existing["Salida"] = row["Salida"];

        if (row["Régimen"] && existing["Régimen"] !== row["Régimen"]) {
            if (!existing["Régimen"].includes(row["Régimen"])) {
                existing["Régimen"] = \\, \\;
            }
        }
    }
});
const incomingRows = Array.from(groupedMap.values());

// Pretend DB has exactly the aggregated row from previous import
let mergedData = [ JSON.parse(JSON.stringify(incomingRows[0])) ];

// Second import
let diffs = {};
const newRow = incomingRows[0];
const existingIdx = 0;
const existingRow = mergedData[existingIdx];

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
        const numOld = toNum(rawOld);
        const numNew = toNum(rawNew);
        if (isNaN(numOld) !== isNaN(numNew)) {
            const validNum = isNaN(numOld) ? numNew : numOld;
            isDifferent = Math.abs(validNum) > 0.01;
        } else {
            isDifferent = Math.abs(numOld - numNew) > 0.05;
        }
    } else if (DATE_KEYS.has(key)) {
        isDifferent = toIsoDate(rawOld) !== toIsoDate(rawNew);
    } else {
        const normOld = isEmptyOld ? "" : cleanStr(rawOld);
        const normNew = isEmptyNew ? "" : cleanStr(rawNew);
        if (normOld === "" && normNew === "") return;
        isDifferent = normOld !== normNew;
    }
    if (isDifferent) changes[key] = { old: rawOld, new: rawNew };
});

console.log("CHANGES:");
console.log(changes);
