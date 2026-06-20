const fs = require('fs');
const path = 'C:/Users/comun/Documents/GitHub/Grupos/test_integration.js';
let content = fs.readFileSync(path, 'utf8');

const testCases = `

// --- FichaModal Tests ---
function testFichaModalData() {
    const group = {
        RoomingList_JSON: JSON.stringify([
            { id: 1, type: "DOBLE", price: 118.3, qty: 15, total: 1774.50 },
            { id: 2, type: "DOBLE", price: 155.3, qty: 15, total: 2329.50 }
        ]),
        extraCharges: [
            { id: 3, concept: "Spa", unitPrice: 12, units: 30, price: 360 },
            { id: 4, concept: "Salón", unitPrice: 90, units: 1, price: 90 }
        ]
    };
    
    // Simulate FichaModal rawRL
    const rawRL = getGroupEconomicItems(group);
    
    if (rawRL.length === 4) {
        console.log("[PASS] FichaModal: renderiza cuatro lineas economicas.");
    } else {
        console.error("[FAIL] FichaModal: renderiza " + rawRL.length + " lineas.");
    }

    // Simulate Boton visibility logic
    const extraCharges = group.extraCharges || [];
    const rlIds = new Set(rawRL.map(item => item.id || item.sourceBudgetItemId));
    const pending = extraCharges.filter(ec => !rlIds.has(ec.id));
    
    if (pending.length === 0) {
        console.log("[PASS] Boton: boton oculto despues de sincronizar cuatro.");
    } else {
        console.error("[FAIL] Boton: pendiente length " + pending.length);
    }
}

// --- Proforma Tests ---
function testProformaData() {
    const group = {
        RoomingList_JSON: JSON.stringify([
            { id: 1, type: "DOBLE", price: 118.3, qty: 15, total: 1774.50 },
            { id: 2, type: "DOBLE", price: 155.3, qty: 15, total: 2329.50 }
        ]),
        extraCharges: [
            { id: 3, concept: "Spa", unitPrice: 12, units: 30, price: 360 },
            { id: 4, concept: "Salón", unitPrice: 90, units: 1, price: 90 }
        ]
    };
    const roomList = getGroupEconomicItems(group);
    const mappedItems = [];
    roomList.forEach(r => {
        mappedItems.push({
            cant: r.qty,
            concepto: r.type,
            precio: r.price,
            total: r.total
        });
    });
    
    if (mappedItems.length === 4) {
        console.log("[PASS] Proforma: El objeto transmitido a la plantilla contiene cuatro lineas.");
    } else {
        console.error("[FAIL] Proforma: transmitidas " + mappedItems.length + " lineas.");
    }
    
    const servicesInTemplate = mappedItems.filter(m => m.concepto === "Spa" || m.concepto === "Salón");
    if (servicesInTemplate.length === 2) {
        console.log("[PASS] Plantilla: La plantilla recibe servicios economicos.");
    } else {
        console.error("[FAIL] Plantilla: faltan servicios.");
    }
}

testFichaModalData();
testProformaData();
`;

if (!content.includes('testFichaModalData()')) {
    content += testCases;
    fs.writeFileSync(path, content);
    console.log("Integration tests appended.");
} else {
    console.log("Integration tests already exist.");
}
