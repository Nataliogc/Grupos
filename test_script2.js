const fs = require('fs');

// We have 18 modifications exactly. 
// What if it's the Noches calculation?
// 'Entrada': '01-01-2026', 'Salida': '05-01-2026'

const parseToDateObj = (str) => {
    if (!str) return null;
    const parts = String(str).split(/[\/-]/);
    if (parts.length !== 3) return new Date(str);
    if (parts[0].length === 4) return new Date(str); // YYYY-MM-DD
    return new Date(`--`); // DD/MM/YYYY
};

let incomingRows = [
    { "Entrada": "16/01/2026", "Salida": "18/01/2026", "Noches": "" }
];

incomingRows.forEach(row => {
    if ((!row["Noches"] || row["Noches"] === "" || row["Noches"] === "0") && row["Entrada"] && row["Salida"]) {
        const eIn = parseToDateObj(row["Entrada"]);
        const eOut = parseToDateObj(row["Salida"]);
        if (eIn && eOut && !isNaN(eIn.getTime()) && !isNaN(eOut.getTime())) {
            const diffDays = Math.round((eOut - eIn) / (1000 * 60 * 60 * 24));
            if (diffDays > 0) row["Noches"] = diffDays.toString();
        }
    }
});

console.log("Calculated Noches:", incomingRows[0].Noches);
