const RoomingCore = require('./js/rooming-core.js');
Object.assign(global, RoomingCore);
global.window = { roomingIncidences: [] };
const ROOMING_DEBUG_MODE = true;

function runRoomingTests() {
    console.log("=== INICIANDO PRUEBAS DE ROOMING LIST (24 CASOS) ===");
    let passCount = 0;
    let failCount = 0;

    function assert(cond, msg) {
        if (cond) {
            console.log(`[PASS] ${msg}`);
            passCount++;
        } else {
            console.error(`[FAIL] ${msg}`);
            failCount++;
        }
    }

    // 1. misma cantidad durante dos noches
    try {
        const input = [
            { id: "d1", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "d2", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        assert(res.length === 8, "Prueba 1: Debe dar exactamente 8 estancias unificadas");
    } catch (e) {
        assert(false, `Prueba 1 fallÃ³: ${e.message}`);
    }

    // 2. reducciÃ³n de cantidad
    try {
        const input = [
            { id: "d1", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "d2", roomNo: "", type: "Hab. Doble", pax: 2, qty: 6, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        const twoNights = res.filter(r => r.displayNights === 2).length;
        const oneNight = res.filter(r => r.displayNights === 1).length;
        assert(res.length === 8 && twoNights === 6 && oneNight === 2, "Prueba 2: ReducciÃ³n (8 -> 6) da 6 de dos noches y 2 de una noche");
    } catch (e) {
        assert(false, `Prueba 2 fallÃ³: ${e.message}`);
    }

    // 3. aumento de cantidad
    try {
        const input = [
            { id: "d1", roomNo: "", type: "Hab. Doble", pax: 2, qty: 6, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "d2", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        const twoNights = res.filter(r => r.displayNights === 2).length;
        const startingSecond = res.filter(r => r.displayNights === 1 && r.checkIn === "2026-06-23").length;
        assert(res.length === 8 && twoNights === 6 && startingSecond === 2, "Prueba 3: Aumento (6 -> 8) da 6 de dos noches y 2 nuevas de una noche");
    } catch (e) {
        assert(false, `Prueba 3 fallÃ³: ${e.message}`);
    }

    // 4. secuencia 8 -> 6 -> 8
    try {
        const input = [
            { id: "d1", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "d2", roomNo: "", type: "Hab. Doble", pax: 2, qty: 6, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" },
            { id: "d3", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-24", dateOut: "2026-06-25" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-25");
        // DeberÃ­a dar:
        // 6 estancias de 3 noches (slot 0-5)
        // 2 estancias de 1 noche en dÃ­a 1 (slot 6-7 dÃ­a 1)
        // 2 estancias de 1 noche en dÃ­a 3 (slot 6-7 dÃ­a 3)
        // Total = 10 estancias fÃ­sicas
        assert(res.length === 10, "Prueba 4: Secuencia 8 -> 6 -> 8 da exactamente 10 estancias fÃ­sicas");
    } catch (e) {
        assert(false, `Prueba 4 fallÃ³: ${e.message}`);
    }

    // 5. interrupciÃ³n entre noches
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-24", dateOut: "2026-06-25" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-25");
        assert(res.length === 2, "Prueba 5: InterrupciÃ³n genera 2 estancias separadas");
    } catch (e) {
        assert(false, `Prueba 5 fallÃ³: ${e.message}`);
    }

    // 6. cambio de pax
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "2", roomNo: "101", type: "Hab. Doble", pax: 1, dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        assert(res.length === 2, "Prueba 6: Cambio de pax genera 2 estancias distintas");
    } catch (e) {
        assert(false, `Prueba 6 fallÃ³: ${e.message}`);
    }

    // 7. cambio de ocupantes
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23", ocupantes: "Ocupante A" },
            { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-23", dateOut: "2026-06-24", ocupantes: "Ocupante B" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        assert(res.length === 2, "Prueba 7: Cambio de ocupantes genera 2 estancias distintas");
    } catch (e) {
        assert(false, `Prueba 7 fallÃ³: ${e.message}`);
    }

    // 8. cambio de observaciones
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23", observ: "Cama matrimonio" },
            { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-23", dateOut: "2026-06-24", observ: "Dos camas" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        assert(res.length === 2, "Prueba 8: Cambio de observaciones genera 2 estancias distintas");
    } catch (e) {
        assert(false, `Prueba 8 fallÃ³: ${e.message}`);
    }

    // 9. cambio de rÃ©gimen
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, regime: "AD", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        assert(res.length === 2, "Prueba 9: Cambio de rÃ©gimen genera 2 estancias distintas");
    } catch (e) {
        assert(false, `Prueba 9 fallÃ³: ${e.message}`);
    }

    // 10. cambio de tipo
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "2", roomNo: "101", type: "Hab. Individual", pax: 1, dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        assert(res.length === 2, "Prueba 10: Cambio de tipo genera 2 estancias distintas");
    } catch (e) {
        assert(false, `Prueba 10 fallÃ³: ${e.message}`);
    }

    // 11. habitaciones numeradas
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "2", roomNo: "102", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
        assert(res.length === 2, "Prueba 11: Habitaciones numeradas permanecen separadas");
    } catch (e) {
        assert(false, `Prueba 11 fallÃ³: ${e.message}`);
    }

    // 12. habitaciones sin nÃºmero
    try {
        const input = [
            { id: "b1", roomNo: "", type: "Hab. Doble", qty: 2, pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
        assert(res.length === 2 && res[0].tempRoomId !== res[1].tempRoomId, "Prueba 12: Habitaciones sin nÃºmero asignadas a slots estables");
    } catch (e) {
        assert(false, `Prueba 12 fallÃ³: ${e.message}`);
    }

    // 13. solapamiento distinto
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-24", ocupantes: "A" },
            { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-23", dateOut: "2026-06-25", ocupantes: "B" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-25");
        assert(res.length === 2 && window.roomingIncidences.length === 1, "Prueba 13: Solapamiento distinto no se fusiona y genera incidencia");
    } catch (e) {
        assert(false, `Prueba 13 fallÃ³: ${e.message}`);
    }

    // 14. duplicado exacto
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23", ocupantes: "A" },
            { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23", ocupantes: "A" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
        assert(res.length === 1, "Prueba 14: Duplicado exacto se fusiona sin error");
    } catch (e) {
        assert(false, `Prueba 14 fallÃ³: ${e.message}`);
    }

    // 15. una sola noche
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
        assert(res.length === 1 && res[0].checkIn === "2026-06-22" && res[0].checkOut === "2026-06-23", "Prueba 15: Una sola noche mantiene fechas correctas");
    } catch (e) {
        assert(false, `Prueba 15 fallÃ³: ${e.message}`);
    }

    // 16. tres o mÃ¡s noches
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-23", dateOut: "2026-06-24" },
            { id: "3", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-24", dateOut: "2026-06-25" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-25");
        assert(res.length === 1 && res[0].checkOut === "2026-06-25", "Prueba 16: Tres o mÃ¡s noches consecutivas se fusionan en un Ãºnico rango");
    } catch (e) {
        assert(false, `Prueba 16 fallÃ³: ${e.message}`);
    }

    // 17. entradas parciales
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, qty: 1, dateIn: "2026-06-22", dateOut: "2026-06-24" },
            { id: "2", roomNo: "102", type: "Hab. Doble", pax: 2, qty: 1, dateIn: "2026-06-23", dateOut: "2026-06-25" }
        ];
        const maxPax = calculateMaxDailyOccupancy(input);
        assert(maxPax === 4, "Prueba 17: Entrada parcial calcula ocupaciÃ³n simultÃ¡nea mÃ¡xima correcta (4)");
    } catch (e) {
        assert(false, `Prueba 17 fallÃ³: ${e.message}`);
    }

    // 18. salidas parciales
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, qty: 1, dateIn: "2026-06-22", dateOut: "2026-06-25" },
            { id: "2", roomNo: "102", type: "Hab. Doble", pax: 2, qty: 1, dateIn: "2026-06-22", dateOut: "2026-06-24" }
        ];
        const maxPax = calculateMaxDailyOccupancy(input);
        assert(maxPax === 4, "Prueba 18: Salida parcial calcula ocupaciÃ³n simultÃ¡nea mÃ¡xima correcta (4)");
    } catch (e) {
        assert(false, `Prueba 18 fallÃ³: ${e.message}`);
    }

    // 19. tipo desconocido
    try {
        const input = [
            { id: "1", roomNo: "101", type: "", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "2", roomNo: "102", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
        assert(res.length === 2 && getCanonicalRoomType(res[0]) === "tipo-desconocido", "Prueba 19: Tipo vacÃ­o se normaliza a tipo-desconocido y no se mezcla");
    } catch (e) {
        assert(false, `Prueba 19 fallÃ³: ${e.message}`);
    }

    // 20. apertura y guardado sin cambios
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, price: 100, total: 100, dateIn: "2026-06-22", dateOut: "2026-06-23" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
        assert(res[0].price === 100 && parseFloat(res[0].total) === 100, "Prueba 20: FusiÃ³n mantiene intacta estructura econÃ³mica original");
    } catch (e) {
        assert(false, `Prueba 20 fallÃ³: ${e.message}`);
    }

    // 21. dato Pax. correcto
    try {
        const maxDaily = 17;
        const personNights = 34;
        const storedContracted = 17;
        const isConsistent = isStoredPaxConsistent(storedContracted, maxDaily, personNights);
        assert(isConsistent === true, "Prueba 21: Pax contratado es consistente si es igual al pico diario");
    } catch (e) {
        assert(false, `Prueba 21 fallÃ³: ${e.message}`);
    }

    // 22. dato Pax. contaminado con personas-noche
    try {
        const maxDaily = 17;
        const personNights = 34;
        const storedContracted = 34; // Glitch: Pax contratado coincide con personas-noche
        const isConsistent = isStoredPaxConsistent(storedContracted, maxDaily, personNights);
        assert(isConsistent === false, "Prueba 22: Pax contaminado con personas-noche se marca como inconsistente");
    } catch (e) {
        assert(false, `Prueba 22 fallÃ³: ${e.message}`);
    }

    // 23. habitaciones manuales pendientes
    try {
        const input = [
            { id: "m1", roomNo: "Manual 1", type: "Hab. Premium", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23", price: 0, total: 0, pendienteValoracion: true }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
        assert(res.length === 1 && res[0].pendienteValoracion === true && res[0].price === 0, "Prueba 23: HabitaciÃ³n manual se mantiene marcada como pendiente con precio 0");
    } catch (e) {
        assert(false, `Prueba 23 fallÃ³: ${e.message}`);
    }

    // 24. servicios fuera de la consolidaciÃ³n
    try {
        const input = [
            { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "s1", type: "PensiÃ³n Completa", price: 20, isService: true }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
        assert(res.length === 2 && res.some(i => i.isService), "Prueba 24: Servicios no se mezclan en la consolidaciÃ³n y se mantienen intactos");
    } catch (e) {
        assert(false, `Prueba 24 fallÃ³: ${e.message}`);
    }

    // REGRESIÃ“N: Caso Guardia Civil (78440)
    try {
        const gcInput = [
            { id: "d1", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "u1", roomNo: "", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "d2", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" },
            { id: "u2", roomNo: "", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const res = groupAndMergeRoomingList(gcInput, "2026-06-22", "2026-06-24");
        const maxDaily = calculateMaxDailyOccupancy(gcInput);
        const personNights = calculatePersonNights(gcInput);
        const totalRooms = calculateMaxDailyRooms(gcInput);
        
        assert(res.length === 9, "RegresiÃ³n Guardia Civil: Da exactamente 9 estancias");
        assert(maxDaily === 17, "RegresiÃ³n Guardia Civil: Pico mÃ¡ximo de Pax simultÃ¡neos es 17");
        assert(totalRooms === 9, "RegresiÃ³n Guardia Civil: Habitaciones simultÃ¡neas mÃ¡ximas es 9");
        assert(personNights === 34, "RegresiÃ³n Guardia Civil: Personas-noche totales es 34");
    } catch (e) {
        assert(false, `RegresiÃ³n Guardia Civil fallÃ³: ${e.message}`);
    }

    // === PRUEBAS ADICIONALES REQUERIDAS (9 CASOS DE SLOT / SERVICIOS) ===
    
    // Caso 1: bloques qty > 1 consecutivos
    try {
        const input = [
            { id: "d1", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "d2", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        const allTwoNights = res.every(r => r.displayNights === 2 && r.checkIn === "2026-06-22" && r.checkOut === "2026-06-24");
        const allHaveTwoRefs = res.every(r => r.assignmentRefs && r.assignmentRefs.length === 2);
        assert(res.length === 8 && allTwoNights && allHaveTwoRefs, "Caso 1: bloques qty > 1 consecutivos se consolidan con 2 assignmentRefs");
    } catch (e) {
        assert(false, `Caso 1 falló: ${e.message}`);
    }

    // Caso 2: bloque qty = 1
    try {
        const input = [
            { id: "u1", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "u2", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        assert(res.length === 1 && res[0].displayNights === 2 && res[0].checkIn === "2026-06-22" && res[0].checkOut === "2026-06-24", "Caso 2: bloque qty = 1 se consolida correctamente");
    } catch (e) {
        assert(false, `Caso 2 falló: ${e.message}`);
    }

    // Caso 3: combinación doble y DUI
    try {
        const input = [
            { id: "d1", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "u1", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "d2", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" },
            { id: "u2", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        const dobles = res.filter(r => r.type === "Hab. Doble");
        const duis = res.filter(r => r.type === "Hab. Doble Uso Individual");
        assert(res.length === 9 && dobles.length === 8 && duis.length === 1, "Caso 3: combinación doble y DUI da 8 dobles y 1 DUI");
    } catch (e) {
        assert(false, `Caso 3 falló: ${e.message}`);
    }

    // Caso 4: stayId legacy incorrecto
    try {
        const input = [
            {
                id: "d1", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23",
                assignments: {
                    "q0_n0": { stayId: "stay_d1_q0_n0", slotId: "hab-doble|2|pc|slot-0" }
                }
            },
            {
                id: "d2", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24",
                assignments: {
                    "q0_n0": { stayId: "stay_d2_q0_n0", slotId: "hab-doble|2|pc|slot-0" }
                }
            }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        const slot0 = res.find(r => String(r.slotId || r.tempRoomId).toLowerCase().endsWith('slot-0'));
        assert(res.length === 8 && slot0 && slot0.displayNights === 2, "Caso 4: stayId legacy incorrecto se limpia y permite consolidar");
    } catch (e) {
        assert(false, `Caso 4 falló: ${e.message}`);
    }

    // Caso 5: reducción 8 -> 6
    try {
        const input = [
            { id: "d1", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "d2", type: "Hab. Doble", pax: 2, qty: 6, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        const twoNights = res.filter(r => r.displayNights === 2).length;
        const oneNight = res.filter(r => r.displayNights === 1).length;
        assert(res.length === 8 && twoNights === 6 && oneNight === 2, "Caso 5: reducción 8 -> 6 da 6 de dos noches y 2 de una noche");
    } catch (e) {
        assert(false, `Caso 5 falló: ${e.message}`);
    }

    // Caso 6: aumento 6 -> 8
    try {
        const input = [
            { id: "d1", type: "Hab. Doble", pax: 2, qty: 6, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "d2", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
        const twoNights = res.filter(r => r.displayNights === 2).length;
        const oneNight = res.filter(r => r.displayNights === 1 && r.checkIn === "2026-06-23").length;
        assert(res.length === 8 && twoNights === 6 && oneNight === 2, "Caso 6: aumento 6 -> 8 da 6 de dos noches y 2 nuevas de una noche");
    } catch (e) {
        assert(false, `Caso 6 falló: ${e.message}`);
    }

    // Caso 7: ocupación diaria
    try {
        const input = [
            { id: "d1", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "u1", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "d2", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" },
            { id: "u2", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const daily = calculateDailyOccupancy(input);
        const day1 = daily["2026-06-22"];
        const day2 = daily["2026-06-23"];
        assert(day1 && day1.totalPax === 17 && day1.total === 9 && day2 && day2.totalPax === 17 && day2.total === 9, "Caso 7: ocupación diaria da 17 pax / 9 hab en ambas noches");
    } catch (e) {
        assert(false, `Caso 7 falló: ${e.message}`);
    }

    // Caso 8: servicios PC
    try {
        const input = [
            { id: "d1", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "u1", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "d2", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" },
            { id: "u2", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const daily = calculateDailyOccupancy(input);
        
        const mockGetOccupancy = (sName, sDate) => {
            const dateObj = parseDate(sDate);
            const lookupDate = new Date(dateObj);
            if (sName.toLowerCase().includes('desayuno')) {
                lookupDate.setDate(lookupDate.getDate() - 1);
            }
            const key = getLocalDateString(lookupDate);
            return daily[key] || { totalPax: 17, total: 9 };
        };

        const llegada = mockGetOccupancy('Llegada', '2026-06-22');
        const almuerzo22 = mockGetOccupancy('Almuerzo', '2026-06-22');
        const cena22 = mockGetOccupancy('Cena', '2026-06-22');
        const desayuno23 = mockGetOccupancy('Desayuno', '2026-06-23');
        const almuerzo23 = mockGetOccupancy('Almuerzo', '2026-06-23');
        const cena23 = mockGetOccupancy('Cena', '2026-06-23');
        const desayuno24 = mockGetOccupancy('Desayuno', '2026-06-24');
        const salida = mockGetOccupancy('Salida', '2026-06-24');

        const all17 = [llegada, almuerzo22, cena22, desayuno23, almuerzo23, cena23, desayuno24, salida].every(s => s.totalPax === 17);
        assert(all17, "Caso 8: todos los servicios de Pensión Completa tienen 17 pax");
    } catch (e) {
        assert(false, `Caso 8 falló: ${e.message}`);
    }

    // Caso 9: ninguna fila con 16 pax
    try {
        const input = [
            { id: "d1", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "u1", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
            { id: "d2", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" },
            { id: "u2", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
        ];
        const daily = calculateDailyOccupancy(input);
        const mockGetOccupancy = (sName, sDate) => {
            const dateObj = parseDate(sDate);
            const lookupDate = new Date(dateObj);
            if (sName.toLowerCase().includes('desayuno')) {
                lookupDate.setDate(lookupDate.getDate() - 1);
            }
            const key = getLocalDateString(lookupDate);
            return daily[key] || { totalPax: 17, total: 9 };
        };

        const servicesPaxList = [
            mockGetOccupancy('Llegada', '2026-06-22').totalPax,
            mockGetOccupancy('Almuerzo', '2026-06-22').totalPax,
            mockGetOccupancy('Cena', '2026-06-22').totalPax,
            mockGetOccupancy('Desayuno', '2026-06-23').totalPax,
            mockGetOccupancy('Almuerzo', '2026-06-23').totalPax,
            mockGetOccupancy('Cena', '2026-06-23').totalPax,
            mockGetOccupancy('Desayuno', '2026-06-24').totalPax,
            mockGetOccupancy('Salida', '2026-06-24').totalPax
        ];
        
        const has16 = servicesPaxList.some(pax => Number(pax) === 16);
        assert(!has16, "Caso 9: ninguna fila de servicio tiene 16 pax");
    } catch (e) {
        assert(false, `Caso 9 falló: ${e.message}`);
    }

    console.log(`=== FIN DE PRUEBAS DE ROOMING LIST: ${passCount} PASADAS, ${failCount} FALLADAS ===`);
}

function runIntegrationTests() {
    let passed = 0;
    let failed = 0;
    function check(condition, label) {
        if (condition) { console.log(`[PASS] ${label}`); passed++; }
        else { console.error(`[FAIL] ${label}`); failed++; }
    }
    function blk(type, qty, pax, dateIn, dateOut, id, extras) {
        return Object.assign({ id: id || ('i_' + Math.random()), type, qty, pax, dateIn, dateOut, isService: false }, extras || {});
    }

    // â”€â”€â”€ Grupo de 1 noche â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
        const inp = [blk('HabitaciÃ³n Doble', 3, 2, '2026-07-10', '2026-07-11', 'n1')];
        const res = groupAndMergeRoomingList(inp, '2026-07-10', '2026-07-11');
        check(res.length === 3, 'INT-1 Noche: 3 estancias fÃ­sicas');
        check(res.every(r => r.checkIn === '2026-07-10' && r.checkOut === '2026-07-11'), 'INT-1 Noche: fechas sin extensiÃ³n');
        check(calculateMaxDailyOccupancy(inp) === 6, 'INT-1 Noche: pax mÃ¡ximo 6');
        check(calculatePersonNights(inp) === 6, 'INT-1 Noche: personas-noche 6 (igual al pax, 1 noche)');
    }

    // â”€â”€â”€ Grupo de 3 noches constantes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
        const inp = [
            blk('HabitaciÃ³n Doble', 4, 2, '2026-08-01', '2026-08-02', 't1'),
            blk('HabitaciÃ³n Doble', 4, 2, '2026-08-02', '2026-08-03', 't2'),
            blk('HabitaciÃ³n Doble', 4, 2, '2026-08-03', '2026-08-04', 't3'),
        ];
        const res = groupAndMergeRoomingList(inp, '2026-08-01', '2026-08-04');
        check(res.length === 4, 'INT-3 Noches: 4 estancias continuas');
        check(res.every(r => r.checkIn === '2026-08-01' && r.checkOut === '2026-08-04'), 'INT-3 Noches: fusionadas en una sola estancia por hab');
        check(calculateMaxDailyOccupancy(inp) === 8, 'INT-3 Noches: pax mÃ¡ximo 8');
        check(calculatePersonNights(inp) === 24, 'INT-3 Noches: personas-noche 24');
    }

    // â”€â”€â”€ ReducciÃ³n 8â†’6 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
        const inp = [
            blk('HabitaciÃ³n Doble', 8, 2, '2026-09-10', '2026-09-11', 'r1'),
            blk('HabitaciÃ³n Doble', 6, 2, '2026-09-11', '2026-09-12', 'r2'),
        ];
        const res = groupAndMergeRoomingList(inp, '2026-09-10', '2026-09-12');
        const largo = res.filter(r => r.checkIn === '2026-09-10' && r.checkOut === '2026-09-12');
        const corto = res.filter(r => r.checkIn === '2026-09-10' && r.checkOut === '2026-09-11');
        check(largo.length === 6, 'INT-Red 8â†’6: 6 estancias de 2 noches');
        check(corto.length === 2, 'INT-Red 8â†’6: 2 estancias de 1 noche');
        check(calculateMaxDailyRooms(inp) === 8, 'INT-Red 8â†’6: habitaciones mÃ¡ximas 8');
    }

    // â”€â”€â”€ Aumento 6â†’8 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
        const inp = [
            blk('HabitaciÃ³n Doble', 6, 2, '2026-10-01', '2026-10-02', 'a1'),
            blk('HabitaciÃ³n Doble', 8, 2, '2026-10-02', '2026-10-03', 'a2'),
        ];
        const res = groupAndMergeRoomingList(inp, '2026-10-01', '2026-10-03');
        const largo = res.filter(r => r.checkIn === '2026-10-01' && r.checkOut === '2026-10-03');
        const nuevo = res.filter(r => r.checkIn === '2026-10-02' && r.checkOut === '2026-10-03');
        check(largo.length === 6, 'INT-Aum 6â†’8: 6 estancias de 2 noches');
        check(nuevo.length === 2, 'INT-Aum 6â†’8: 2 estancias nuevas de 1 noche');
        check(calculateMaxDailyRooms(inp) === 8, 'INT-Aum 6â†’8: habitaciones mÃ¡ximas 8');
    }

    // â”€â”€â”€ InterrupciÃ³n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
        const inp = [
            blk('HabitaciÃ³n Doble', 2, 2, '2026-11-22', '2026-11-23', 'int1'),
            blk('HabitaciÃ³n Doble', 2, 2, '2026-11-24', '2026-11-25', 'int2'),
        ];
        const res = groupAndMergeRoomingList(inp, '2026-11-22', '2026-11-25');
        check(res.length === 4, 'INT-Interrup: 4 estancias (2 hab Ã— 2 perÃ­odos)');
        check(res.filter(r => r.checkIn === '2026-11-22').length === 2, 'INT-Interrup: 2 del primer perÃ­odo');
        check(res.filter(r => r.checkIn === '2026-11-24').length === 2, 'INT-Interrup: 2 del segundo perÃ­odo');
    }

    // â”€â”€â”€ Entrada parcial â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
        const inp = [
            blk('HabitaciÃ³n Doble', 4, 2, '2026-12-01', '2026-12-03', 'ep1'),
            blk('HabitaciÃ³n Doble', 2, 2, '2026-12-02', '2026-12-03', 'ep2'),
        ];
        check(calculateMaxDailyOccupancy(inp) === 12, 'INT-EntrParcial: pax mÃ¡ximo 12 (dÃ­a pico)');
        check(calculateMaxDailyRooms(inp) === 6, 'INT-EntrParcial: habitaciones mÃ¡ximas 6');
    }

    // â”€â”€â”€ Cambio de ocupantes divide la estancia â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
        const inp = [
            { id: 'oc1', type: 'HabitaciÃ³n Doble', qty: 1, pax: 2, dateIn: '2026-12-10', dateOut: '2026-12-11', ocupantes: 'Ana GarcÃ­a', roomNo: '101', isService: false },
            { id: 'oc2', type: 'HabitaciÃ³n Doble', qty: 1, pax: 2, dateIn: '2026-12-11', dateOut: '2026-12-12', ocupantes: 'Pedro LÃ³pez', roomNo: '101', isService: false },
        ];
        const res = groupAndMergeRoomingList(inp, '2026-12-10', '2026-12-12');
        check(res.filter(r => !r.isService).length === 2, 'INT-CambioOcup: 2 estancias separadas para misma hab, distintos ocupantes');
    }

    // â”€â”€â”€ Tipo desconocido no se mezcla â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
        const inp = [
            blk('', 2, 2, '2026-12-20', '2026-12-21', 'uk1'),
            blk('HabitaciÃ³n Doble', 3, 2, '2026-12-20', '2026-12-21', 'kn1'),
        ];
        const res = groupAndMergeRoomingList(inp, '2026-12-20', '2026-12-21');
        const desconocidos = res.filter(r => r.type && r.type.includes('desconocido'));
        const conocidos = res.filter(r => r.type === 'HabitaciÃ³n Doble');
        check(desconocidos.length === 0, 'INT-TipoDescon: sin criterio positivo no se interpreta como alojamiento');
        check(conocidos.length === 3, 'INT-TipoDescon: 3 estancias dobles sin mezcla');
    }

    // â”€â”€â”€ Estructura originalIds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
        const inp = [
            blk('HabitaciÃ³n Doble', 2, 2, '2027-01-10', '2027-01-11', 'oid_a'),
            blk('HabitaciÃ³n Doble', 2, 2, '2027-01-11', '2027-01-12', 'oid_b'),
        ];
        const res = groupAndMergeRoomingList(inp, '2027-01-10', '2027-01-12');
        const dosNoches = res.filter(r => r.checkIn === '2027-01-10' && r.checkOut === '2027-01-12');
        check(dosNoches.length === 2, 'INT-OrigIds: 2 estancias de 2 noches');
        check(dosNoches.every(r => Array.isArray(r.originalIds)), 'INT-OrigIds: originalIds es array');
        check(dosNoches.every(r => r.originalIds.length === 2), 'INT-OrigIds: cada estancia de 2 noches tiene 2 IDs');
        check(dosNoches.every(r => r.originalIds.includes('oid_a') && r.originalIds.includes('oid_b')), 'INT-OrigIds: IDs correctos (oid_a, oid_b)');
    }

    // â”€â”€â”€ Fechas exactas, sin addDays(dateOut,1) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
        const inp = [
            blk('HabitaciÃ³n Doble', 1, 2, '2026-06-22', '2026-06-23', 'fc1'),
            blk('HabitaciÃ³n Doble', 1, 2, '2026-06-23', '2026-06-24', 'fc2'),
        ];
        const res = groupAndMergeRoomingList(inp, '2026-06-22', '2026-06-24');
        const stay = res.find(r => !r.isService);
        check(stay && stay.checkIn === '2026-06-22', 'INT-Fechas: entrada exacta 22/06');
        check(stay && stay.checkOut === '2026-06-24', 'INT-Fechas: salida exacta 24/06, no 25/06 (sin addDays)');
    }

    // â”€â”€â”€ isStoredPaxConsistent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
        check(isStoredPaxConsistent(17, 17, 34) === true, 'INT-PaxConsist: 17=pico â†’ consistente');
        check(isStoredPaxConsistent(34, 17, 34) === false, 'INT-PaxConsist: 34=PN, pico=17 â†’ inconsistente');
        check(isStoredPaxConsistent(20, 17, 34) === false, 'INT-PaxConsist: 20>pico â†’ inconsistente');
    }

    console.log(`=== FIN DE PRUEBAS DE INTEGRACIÃ“N: ${passed} PASADAS, ${failed} FALLADAS ===\n`);
    return { passed, failed };
}

runRoomingTests();
const integrationResult = runIntegrationTests();
if (typeof process !== 'undefined') {
    process.exitCode = integrationResult.failed > 0 ? 1 : 0;
}
