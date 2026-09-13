const assert = require('assert');

// Mock browser globals if needed
global.window = global.window || {};
global.window.NexusUtils = {
    parseNum: (v) => {
        if (v === null || v === undefined || v === "" || v === "---") return 0;
        const str = String(v).replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    },
    normalizeId: (id) => String(id || "").trim().toUpperCase()
};

const ExcelService = require('./js/services/excelService.js');

console.log("--- Starting Excel Sync & Merge Tests ---");

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`[PASS] ${name}`);
        passed++;
    } catch (e) {
        console.error(`[FAIL] ${name}:`, e.message);
        failed++;
    }
}

// Test 1: Status normalization helper
test("normalizeEstado normalizes masculine/feminine and synonyms", () => {
    assert.strictEqual(ExcelService.normalizeEstado("Confirmado"), "CONFIRMADA");
    assert.strictEqual(ExcelService.normalizeEstado("CONFIRMADA"), "CONFIRMADA");
    assert.strictEqual(ExcelService.normalizeEstado("CANCELADO"), "ANULADA");
    assert.strictEqual(ExcelService.normalizeEstado("Anulada"), "ANULADA");
    assert.strictEqual(ExcelService.normalizeEstado("Baja"), "ANULADA");
    assert.strictEqual(ExcelService.normalizeEstado("Presupuesto"), "PRESUPUESTO");
});

// Test 2: Hotel normalization helper
test("normalizeHotel normalizes hotel aliases", () => {
    assert.strictEqual(ExcelService.normalizeHotel("Guadiana"), "Sercotel Guadiana");
    assert.strictEqual(ExcelService.normalizeHotel("Sercotel Guadiana"), "Sercotel Guadiana");
    assert.strictEqual(ExcelService.normalizeHotel("Cumbria"), "Cumbria Spa&Hotel");
    assert.strictEqual(ExcelService.normalizeHotel("Cumbria Spa&Hotel"), "Cumbria Spa&Hotel");
});

// Test 3: Multi-line reservation matching and zero modifications on re-import
test("Re-importing exact same data produces 0 modifications", () => {
    const rawData = [
        {
            "Reserva": "RES-001",
            "Nombre del Grupo": "Grupo Médico",
            "Entrada": "01/06/2026",
            "Salida": "05/06/2026",
            "Pax.": "30",
            "Importe(*)": "3.000,00",
            "Estado": "Confirmada",
            "Hotel_Asignado": "Sercotel Guadiana",
            "Régimen": "MP",
            "Segment.": "GRUPO",
            "Noches": "4",
            "Pernoct.": "120",
            "Empresa/Agencia": "Viajes Halcón",
            "Cant. Habitaciones": "15",
            "_linea": "1"
        },
        // Multi-line line 2 of RES-001
        {
            "Reserva": "RES-001",
            "Nombre del Grupo": "Grupo Médico - Guías",
            "Entrada": "01/06/2026",
            "Salida": "05/06/2026",
            "Pax.": "2",
            "Importe(*)": "200,00",
            "Estado": "Confirmada",
            "Hotel_Asignado": "Sercotel Guadiana",
            "Régimen": "HD",
            "Segment.": "GRUPO",
            "Noches": "4",
            "Pernoct.": "8",
            "Empresa/Agencia": "Viajes Halcón",
            "Cant. Habitaciones": "1",
            "_linea": "2"
        },
        // Group with masculine Estado in Firestore vs feminine in Excel
        {
            "Reserva": "RES-002",
            "Nombre del Grupo": "Grupo Deportivo",
            "Entrada": "10/06/2026",
            "Salida": "12/06/2026",
            "Pax.": "20",
            "Importe(*)": "1.500,00",
            "Estado": "Confirmada",
            "Hotel_Asignado": "Sercotel Guadiana",
            "Régimen": "PC",
            "Segment.": "GRUPO",
            "Noches": "2",
            "Pernoct.": "40",
            "Empresa/Agencia": "Iberia",
            "Cant. Habitaciones": "10"
        },
        // Cancelled group in Excel that is CANCELADO in Firestore
        {
            "Reserva": "RES-003",
            "Nombre del Grupo": "Grupo Anulado",
            "Entrada": "15/06/2026",
            "Salida": "17/06/2026",
            "Pax.": "10",
            "Importe(*)": "800,00",
            "Estado": "Anulada",
            "Hotel_Asignado": "Sercotel Guadiana",
            "Régimen": "HA",
            "Segment.": "GRUPO",
            "Noches": "2",
            "Pernoct.": "20",
            "Empresa/Agencia": "B travel",
            "Cant. Habitaciones": "5"
        }
    ];

    // Current Firestore data simulating pre-existing records with slight format variations
    const currentFirestoreData = [
        {
            "_docId": "RES-001_1",
            "Reserva": "RES-001",
            "Nombre del Grupo": "Grupo Médico",
            "Entrada": "2026-06-01",
            "Salida": "2026-06-05",
            "Pax.": "30",
            "Importe(*)": "3000",
            "Estado": "Confirmado",
            "Hotel_Asignado": "Guadiana",
            "Hotel": "Sercotel Guadiana",
            "Régimen": "MP",
            "Segment.": "GRUPO",
            "Noches": "4",
            "Pernoct.": "120",
            "Empresa/Agencia": "Viajes Halcón",
            "Cant. Habitaciones": "15",
            "_linea": "1"
        },
        {
            "_docId": "RES-001_2",
            "Reserva": "RES-001",
            "Nombre del Grupo": "Grupo Médico - Guías",
            "Entrada": "2026-06-01",
            "Salida": "2026-06-05",
            "Pax.": "2",
            "Importe(*)": "200",
            "Estado": "Confirmado",
            "Hotel_Asignado": "Guadiana",
            "Hotel": "Sercotel Guadiana",
            "Régimen": "HD",
            "Segment.": "GRUPO",
            "Noches": "4",
            "Pernoct.": "8",
            "Empresa/Agencia": "Viajes Halcón",
            "Cant. Habitaciones": "1",
            "_linea": "2"
        },
        {
            "_docId": "RES-002",
            "Reserva": "RES-002",
            "Nombre del Grupo": "Grupo Deportivo",
            "Entrada": "2026-06-10",
            "Salida": "2026-06-12",
            "Pax.": "20",
            "Importe(*)": "1500",
            "Estado": "Confirmado",
            "Hotel_Asignado": "Sercotel Guadiana",
            "Régimen": "PC",
            "Segment.": "GRUPO",
            "Noches": "2",
            "Pernoct.": "40",
            "Empresa/Agencia": "Iberia",
            "Cant. Habitaciones": "10"
        },
        {
            "_docId": "RES-003",
            "Reserva": "RES-003",
            "Nombre del Grupo": "Grupo Anulado",
            "Entrada": "2026-06-15",
            "Salida": "2026-06-17",
            "Pax.": "10",
            "Importe(*)": "800",
            "Estado": "CANCELADO",
            "Com_Estado_Interno": "CANCELADO",
            "Hotel_Asignado": "Sercotel Guadiana",
            "Régimen": "HA",
            "Segment.": "GRUPO",
            "Noches": "2",
            "Pernoct.": "20",
            "Empresa/Agencia": "B travel",
            "Cant. Habitaciones": "5"
        }
    ];

    const result = ExcelService.sanitizeAndMerge(rawData, [], "Sercotel Guadiana", currentFirestoreData);

    assert.strictEqual(result.summaryData.newGroupsCount, 0, `Expected 0 new groups, got ${result.summaryData.newGroupsCount}`);
    assert.strictEqual(result.summaryData.modifiedGroupsCount, 0, `Expected 0 modified groups, got ${result.summaryData.modifiedGroupsCount}`);
});

// Test 4: Genuine modifications are detected correctly
test("Genuine changes in pax, revenue, dates or cancellation are detected", () => {
    const rawData = [
        {
            "Reserva": "RES-010",
            "Nombre del Grupo": "Grupo Modificado",
            "Entrada": "01/07/2026",
            "Salida": "05/07/2026",
            "Pax.": "50", // Changed from 30
            "Importe(*)": "5.000,00", // Changed from 3000
            "Estado": "Confirmada",
            "Hotel_Asignado": "Sercotel Guadiana",
            "Régimen": "MP",
            "Segment.": "GRUPO"
        }
    ];

    const currentData = [
        {
            "_docId": "RES-010",
            "Reserva": "RES-010",
            "Nombre del Grupo": "Grupo Modificado",
            "Entrada": "2026-07-01",
            "Salida": "2026-07-05",
            "Pax.": "30",
            "Importe(*)": "3000",
            "Estado": "Confirmada",
            "Hotel_Asignado": "Sercotel Guadiana",
            "Régimen": "MP",
            "Segment.": "GRUPO"
        }
    ];

    const result = ExcelService.sanitizeAndMerge(rawData, [], "Sercotel Guadiana", currentData);
    assert.strictEqual(result.summaryData.newGroupsCount, 0);
    assert.strictEqual(result.summaryData.modifiedGroupsCount, 1);
    const mod = result.sortedData.find(r => r.Reserva === "RES-010");
    assert(mod && mod._diff === "modified");
    assert(mod._changes["Pax."]);
    assert(mod._changes["Importe(*)"]);
});

// Test 5: String differences like accents and whitespace do not trigger false diffs
test("Accents and space variations in names and agencies do not trigger false diffs", () => {
    const rawData = [
        {
            "Reserva": "RES-020",
            "Nombre del Grupo": "ASOCIACIÓN PÉREZ GALDÓS",
            "Entrada": "01/08/2026",
            "Salida": "03/08/2026",
            "Pax.": "20",
            "Importe(*)": "1.000,00",
            "Estado": "Confirmada",
            "Hotel_Asignado": "Sercotel Guadiana",
            "Régimen": "HD",
            "Segment.": "GRUPO",
            "Empresa/Agencia": "VIAJES EL CORTE INGLÉS"
        }
    ];

    const currentData = [
        {
            "_docId": "RES-020",
            "Reserva": "RES-020",
            "Nombre del Grupo": "ASOCIACION PEREZ GALDOS",
            "Entrada": "2026-08-01",
            "Salida": "2026-08-03",
            "Pax.": "20",
            "Importe(*)": "1000",
            "Estado": "Confirmado",
            "Hotel_Asignado": "Guadiana",
            "Régimen": "HD",
            "Segment.": "GRUPO",
            "Empresa/Agencia": "VIAJES EL CORTE INGLES"
        }
    ];

    const result = ExcelService.sanitizeAndMerge(rawData, [], "Sercotel Guadiana", currentData);
    assert.strictEqual(result.summaryData.modifiedGroupsCount, 0);
    assert.strictEqual(result.summaryData.newGroupsCount, 0);
});

// Test 6: Empty vs 0 numeric fields do not trigger false diffs
test("Empty numeric field in Firestore vs 0 in Excel does not trigger false diff", () => {
    const rawData = [
        {
            "Reserva": "RES-030",
            "Nombre del Grupo": "Grupo Test",
            "Entrada": "01/09/2026",
            "Salida": "03/09/2026",
            "Pax.": "15",
            "Importe(*)": "900,00",
            "Estado": "Confirmada",
            "Hotel_Asignado": "Sercotel Guadiana",
            "Régimen": "PC",
            "Segment.": "GRUPO",
            "Pernoct.": "0",
            "Cant. Habitaciones": "0"
        }
    ];

    const currentData = [
        {
            "_docId": "RES-030",
            "Reserva": "RES-030",
            "Nombre del Grupo": "Grupo Test",
            "Entrada": "2026-09-01",
            "Salida": "2026-09-03",
            "Pax.": "15",
            "Importe(*)": "900",
            "Estado": "Confirmada",
            "Hotel_Asignado": "Sercotel Guadiana",
            "Régimen": "PC",
            "Segment.": "GRUPO"
            // Pernoct. and Cant. Habitaciones are undefined/missing
        }
    ];

    const result = ExcelService.sanitizeAndMerge(rawData, [], "Sercotel Guadiana", currentData);
    assert.strictEqual(result.summaryData.modifiedGroupsCount, 0);
});

// Test 7: Multi-line reservation with same arrival date does not cross-match lines
test("Multi-line reservation with same Entrada does not cross-match lines on re-import", () => {
    const currentData = [
        {
            _docId: '212348_1',
            Reserva: '212348',
            'Nombre del Grupo': 'FERCATUR 2026',
            Entrada: '10/09/2026',
            Salida: '11/09/2026',
            'Pax.': '2',
            'Importe(*)': '84',
            Estado: 'Confirmada',
            Hotel_Asignado: 'Sercotel Guadiana',
            Segment: 'GRUPO',
            Noches: '1',
            'Pernoct.': '2'
        },
        {
            _docId: '212348_2',
            Reserva: '212348',
            'Nombre del Grupo': 'FERCATUR 2026',
            Entrada: '10/09/2026',
            Salida: '14/09/2026',
            'Pax.': '2',
            'Importe(*)': '336',
            Estado: 'Confirmada',
            Hotel_Asignado: 'Sercotel Guadiana',
            Segment: 'GRUPO',
            Noches: '4',
            'Pernoct.': '8'
        }
    ];

    const incomingExcel = [
        {
            Reserva: '212348',
            'Nombre del Grupo': 'FERCATUR 2026',
            Entrada: '10/09/2026',
            Salida: '14/09/2026',
            'Pax.': '2',
            'Importe(*)': '336,00',
            Estado: 'Confirmada',
            Segment: 'GRUPO',
            Noches: '4',
            'Pernoct.': '8'
        },
        {
            Reserva: '212348',
            'Nombre del Grupo': 'FERCATUR 2026',
            Entrada: '10/09/2026',
            Salida: '11/09/2026',
            'Pax.': '2',
            'Importe(*)': '84,00',
            Estado: 'Confirmada',
            Segment: 'GRUPO',
            Noches: '1',
            'Pernoct.': '2'
        }
    ];

    const result = ExcelService.sanitizeAndMerge(incomingExcel, [], "Sercotel Guadiana", currentData);
    assert.strictEqual(result.summaryData.newGroupsCount, 0, "No new groups should be created");
    assert.strictEqual(result.summaryData.modifiedGroupsCount, 0, "0 modifications expected when re-importing identical lines");
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
