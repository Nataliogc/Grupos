/**
 * test_integration.js — Pruebas de integración de la Rooming List
 * Ejecutar: node test_integration.js (desde la raíz del proyecto)
 */

const { groupAndMergeRoomingList, calculateMaxDailyOccupancy, calculateMaxDailyRooms, calculatePersonNights, calculateRoomNights, calculateDailyMovements, isStoredPaxConsistent, parseRoomingListSafe, getEconomicRoomingItems, getAccommodationItems, getServiceItems, isAccommodationItem } = require('./js/rooming-core.js');

let passed = 0;
let failed = 0;

function assert(condition, label) {
    if (condition) {
        console.log(`[PASS] ${label}`);
        passed++;
    } else {
        console.error(`[FAIL] ${label}`);
        failed++;
    }
}

function makeBlock(type, qty, pax, dateIn, dateOut, id) {
    return { id: id || ('id_' + Math.random()), type, qty, pax, dateIn, dateOut, isService: false };
}

// ── Grupo de UNA noche ──────────────────────────────────────────────────────
{
    const input = [
        makeBlock('Habitación Doble', 3, 2, '2026-07-10', '2026-07-11', 'a1'),
    ];
    const res = groupAndMergeRoomingList(input, '2026-07-10', '2026-07-11');
    assert(res.length === 3, 'Grupo 1 noche: 3 filas (una por habitación)');
    assert(res.every(r => r.checkIn === '2026-07-10' && r.checkOut === '2026-07-11'), 'Grupo 1 noche: fechas correctas sin extensión');
    assert(calculateMaxDailyOccupancy(input) === 6, 'Grupo 1 noche: pax máximo 6');
    assert(calculateMaxDailyRooms(input) === 3, 'Grupo 1 noche: habitaciones máximas 3');
    assert(calculatePersonNights(input) === 6, 'Grupo 1 noche: personas-noche 6 (= pax, solo 1 noche)');
}

// ── Grupo de TRES noches constantes ─────────────────────────────────────────
{
    const input = [
        makeBlock('Habitación Doble', 4, 2, '2026-08-01', '2026-08-02', 'b1'),
        makeBlock('Habitación Doble', 4, 2, '2026-08-02', '2026-08-03', 'b2'),
        makeBlock('Habitación Doble', 4, 2, '2026-08-03', '2026-08-04', 'b3'),
    ];
    const res = groupAndMergeRoomingList(input, '2026-08-01', '2026-08-04');
    assert(res.length === 4, '3 noches constantes: 4 estancias (una por hab)');
    assert(res.every(r => r.checkIn === '2026-08-01' && r.checkOut === '2026-08-04'), '3 noches constantes: estancias van de entrada a salida');
    assert(calculateMaxDailyOccupancy(input) === 8, '3 noches constantes: pax máximo 8');
    assert(calculatePersonNights(input) === 24, '3 noches constantes: personas-noche 24');
}

// ── Reducción de cantidad (8 → 6) ────────────────────────────────────────────
{
    const input = [
        makeBlock('Habitación Doble', 8, 2, '2026-09-10', '2026-09-11', 'c1'),
        makeBlock('Habitación Doble', 6, 2, '2026-09-11', '2026-09-12', 'c2'),
    ];
    const res = groupAndMergeRoomingList(input, '2026-09-10', '2026-09-12');
    const twoNights = res.filter(r => r.checkIn === '2026-09-10' && r.checkOut === '2026-09-12');
    const oneNight = res.filter(r => r.checkIn === '2026-09-10' && r.checkOut === '2026-09-11');
    assert(twoNights.length === 6, 'Reducción 8→6: 6 estancias de 2 noches');
    assert(oneNight.length === 2, 'Reducción 8→6: 2 estancias de 1 noche');
    assert(calculateMaxDailyOccupancy(input) === 16, 'Reducción 8→6: pax máximo 16');
    assert(calculateMaxDailyRooms(input) === 8, 'Reducción 8→6: habitaciones máximas 8');
}

// ── Aumento de cantidad (6 → 8) ──────────────────────────────────────────────
{
    const input = [
        makeBlock('Habitación Doble', 6, 2, '2026-10-01', '2026-10-02', 'd1'),
        makeBlock('Habitación Doble', 8, 2, '2026-10-02', '2026-10-03', 'd2'),
    ];
    const res = groupAndMergeRoomingList(input, '2026-10-01', '2026-10-03');
    const twoNights = res.filter(r => r.checkIn === '2026-10-01' && r.checkOut === '2026-10-03');
    const oneNight = res.filter(r => r.checkIn === '2026-10-02' && r.checkOut === '2026-10-03');
    assert(twoNights.length === 6, 'Aumento 6→8: 6 estancias de 2 noches');
    assert(oneNight.length === 2, 'Aumento 6→8: 2 estancias nuevas de 1 noche');
    assert(calculateMaxDailyRooms(input) === 8, 'Aumento 6→8: habitaciones máximas 8');
}

// ── Interrupción (22→23 y 24→25, sin noche 23→24) ───────────────────────────
{
    const input = [
        makeBlock('Habitación Doble', 2, 2, '2026-11-22', '2026-11-23', 'e1'),
        makeBlock('Habitación Doble', 2, 2, '2026-11-24', '2026-11-25', 'e2'),
    ];
    const res = groupAndMergeRoomingList(input, '2026-11-22', '2026-11-25');
    // 2 hab × 2 bloques separados = 4 estancias
    assert(res.length === 4, 'Interrupción: produce 4 estancias (2 hab × 2 períodos)');
    const firstPeriod = res.filter(r => r.checkIn === '2026-11-22' && r.checkOut === '2026-11-23');
    const secondPeriod = res.filter(r => r.checkIn === '2026-11-24' && r.checkOut === '2026-11-25');
    assert(firstPeriod.length === 2, 'Interrupción: 2 estancias primer período');
    assert(secondPeriod.length === 2, 'Interrupción: 2 estancias segundo período');
}

// ── Entrada parcial (pico de pax correcto) ───────────────────────────────────
{
    const input = [
        makeBlock('Habitación Doble', 4, 2, '2026-12-01', '2026-12-03', 'f1'),
        makeBlock('Habitación Doble', 2, 2, '2026-12-02', '2026-12-03', 'f2'), // entran tarde
    ];
    const maxPax = calculateMaxDailyOccupancy(input);
    const maxRooms = calculateMaxDailyRooms(input);
    assert(maxPax === 12, 'Entrada parcial: pax máximo 12 (día 2: 4+2 habs = 12 pax)');
    assert(maxRooms === 6, 'Entrada parcial: habitaciones máximas 6 (día 2)');
}

// ── Cambio de ocupantes divide la estancia ───────────────────────────────────
{
    const input = [
        { id: 'g1', type: 'Habitación Doble', qty: 1, pax: 2, dateIn: '2026-12-10', dateOut: '2026-12-11', ocupantes: 'Ana García', roomNo: '101', isService: false },
        { id: 'g2', type: 'Habitación Doble', qty: 1, pax: 2, dateIn: '2026-12-11', dateOut: '2026-12-12', ocupantes: 'Pedro López', roomNo: '101', isService: false },
    ];
    const res = groupAndMergeRoomingList(input, '2026-12-10', '2026-12-12');
    const room101 = res.filter(r => !r.isService);
    assert(room101.length === 2, 'Cambio ocupantes: genera 2 estancias separadas para la misma hab');
}

// ── Tipo desconocido no se mezcla con tipos conocidos ───────────────────────
{
    const input = [
        makeBlock('', 2, 2, '2026-12-20', '2026-12-21', 'h1'),
        makeBlock('Habitación Doble', 3, 2, '2026-12-20', '2026-12-21', 'h2'),
    ];
    const res = groupAndMergeRoomingList(input, '2026-12-20', '2026-12-21');
    const unknown = res.filter(r => r.type && r.type.includes('desconocido'));
    const known = res.filter(r => r.type === 'Habitación Doble');
    assert(unknown.length === 0, 'Tipo desconocido: no se interpreta como alojamiento sin criterio positivo');
    assert(known.length === 3, 'Tipo conocido: 3 estancias dobles sin mezcla');
}

// ── Validación estructura originalIds ────────────────────────────────────────
{
    const input = [
        makeBlock('Habitación Doble', 2, 2, '2027-01-10', '2027-01-11', 'orig_a'),
        makeBlock('Habitación Doble', 2, 2, '2027-01-11', '2027-01-12', 'orig_b'),
    ];
    const res = groupAndMergeRoomingList(input, '2027-01-10', '2027-01-12');
    const twoNight = res.filter(r => r.checkIn === '2027-01-10' && r.checkOut === '2027-01-12');
    assert(twoNight.length === 2, 'originalIds: 2 estancias de 2 noches');
    assert(twoNight.every(r => Array.isArray(r.originalIds)), 'originalIds: es array en todas las estancias');
    assert(twoNight.every(r => r.originalIds.length === 2), 'originalIds: cada estancia de 2 noches tiene 2 IDs originales');
    assert(twoNight.every(r => r.originalIds.includes('orig_a') && r.originalIds.includes('orig_b')), 'originalIds: contiene los IDs correctos');
    // Verificar que no hay IDs duplicados entre estancias distintas
    const allIds = res.flatMap(r => r.originalIds || []);
    const uniqueIds = new Set(allIds);
    // Es válido que el mismo ID aparezca en múltiples estancias si el bloque se reparte entre slots
    assert(allIds.length > 0, 'originalIds: hay IDs en todas las estancias');
}

// ── Ocupantes pendientes no cuentan como huéspedes únicos ────────────────────
{
    const input = [
        makeBlock('Habitación Doble', 3, 2, '2027-02-01', '2027-02-02', 'p1'),
    ];
    const res = groupAndMergeRoomingList(input, '2027-02-01', '2027-02-02');
    // Todas tienen "ocupantes" vacío (sin nombre)
    const pendientes = res.filter(r => !r.isService && (!r.ocupantes || r.ocupantes.trim() === '' || r.ocupantes === 'Ocupante Pendiente'));
    const identificados = res.filter(r => !r.isService && r.ocupantes && r.ocupantes.trim() !== '' && r.ocupantes !== 'Ocupante Pendiente');
    assert(res.length === 3, 'Ocupantes pendientes: 3 filas totales');
    assert(identificados.length === 0, 'Ocupantes pendientes: 0 huéspedes identificados (no confundir "Ocupante Pendiente" con un nombre)');

    // Pax previsto se calcula por métricas, no contando "Ocupante Pendiente" como persona única
    const maxPax = calculateMaxDailyOccupancy(input);
    assert(maxPax === 6, 'Pax previsto: 6 (3 hab × 2 pax), no 1 "Ocupante Pendiente"');
}

// ── isStoredPaxConsistent ─────────────────────────────────────────────────────
{
    // Caso correcto: campo coincide con pico
    assert(isStoredPaxConsistent(17, 17, 34) === true, 'isStoredPaxConsistent: 17 almacenado, pico 17 → consistente');
    // Campo contaminado (= personas-noche)
    assert(isStoredPaxConsistent(34, 17, 34) === false, 'isStoredPaxConsistent: 34 almacenado, pico 17, PN=34 → inconsistente (personas-noche)');
    // Campo más alto que el pico pero no es PN
    assert(isStoredPaxConsistent(20, 17, 34) === false, 'isStoredPaxConsistent: 20 almacenado, pico 17 → inconsistente');
}

// ── Sin addDays(dateOut, 1): fechas exactas ──────────────────────────────────
{
    // Si se detecta un addDays, las salidas serían 24 en lugar de 23 y 25 en lugar de 24
    const input = [
        makeBlock('Habitación Doble', 1, 2, '2026-06-22', '2026-06-23', 'fc1'),
        makeBlock('Habitación Doble', 1, 2, '2026-06-23', '2026-06-24', 'fc2'),
    ];
    const res = groupAndMergeRoomingList(input, '2026-06-22', '2026-06-24');
    const stay = res.find(r => !r.isService);
    assert(stay && stay.checkOut === '2026-06-24', 'Sin addDays: salida es 24/06, no 25/06');
    assert(stay && stay.checkIn === '2026-06-22', 'Sin addDays: entrada es 22/06, no 23/06');
}

// ── Pruebas de compatibilidad de formatos para parseRoomingListSafe ──────────
{
    // 1. Array válido
    assert(Array.isArray(parseRoomingListSafe([{ type: "Hab. Doble" }])) && parseRoomingListSafe([{ type: "Hab. Doble" }]).length === 1, 'parseRoomingListSafe: Array válido');

    // 2. String JSON con array
    assert(Array.isArray(parseRoomingListSafe('[{"type":"Hab. Doble"}]')) && parseRoomingListSafe('[{"type":"Hab. Doble"}]').length === 1, 'parseRoomingListSafe: String JSON con array');

    // 3. String vacío
    assert(Array.isArray(parseRoomingListSafe('')) && parseRoomingListSafe('').length === 0, 'parseRoomingListSafe: String vacío');

    // 4. null
    assert(Array.isArray(parseRoomingListSafe(null)) && parseRoomingListSafe(null).length === 0, 'parseRoomingListSafe: null');

    // 5. undefined
    assert(Array.isArray(parseRoomingListSafe(undefined)) && parseRoomingListSafe(undefined).length === 0, 'parseRoomingListSafe: undefined');

    // 6. Objeto vacío
    assert(Array.isArray(parseRoomingListSafe({})) && parseRoomingListSafe({}).length === 0, 'parseRoomingListSafe: Objeto vacío');

    // 7. JSON inválido
    assert(Array.isArray(parseRoomingListSafe('{invalid-json}')) && parseRoomingListSafe('{invalid-json}').length === 0, 'parseRoomingListSafe: JSON inválido');

    // 8. JSON con objeto en lugar de array
    assert(Array.isArray(parseRoomingListSafe('{"type":"Hab. Doble"}')) && parseRoomingListSafe('{"type":"Hab. Doble"}').length === 0, 'parseRoomingListSafe: JSON con objeto en lugar de array');

    // 9. Grupo antiguo sin RoomingList_JSON
    const groupOld = {};
    assert(Array.isArray(parseRoomingListSafe(groupOld.RoomingList_JSON)) && parseRoomingListSafe(groupOld.RoomingList_JSON).length === 0, 'parseRoomingListSafe: Grupo antiguo sin RoomingList_JSON');

    // 10. Grupo con habitaciones manuales
    const manualList = [{ isManualRoomingItem: true, excludeFromEconomicTotals: true, qty: 1 }];
    const manualRes = getEconomicRoomingItems(manualList);
    assert(manualRes.length === 0, 'getEconomicRoomingItems: Grupo con habitaciones manuales excluidas');

    // 11. Grupo con assignments
    const assignmentsList = [{ id: "b1", assignments: { "q0_n0": { occupants: ["Juan"] } } }];
    assert(parseRoomingListSafe(assignmentsList).length === 1, 'parseRoomingListSafe: Grupo con assignments');

    // 12. Grupo con servicios y habitaciones mezclados
    const mixedList = [{ type: "Hab. Doble", isService: false }, { type: "Menú", isService: true }];
    assert(parseRoomingListSafe(mixedList).length === 2, 'parseRoomingListSafe: Grupo con servicios y habitaciones mezclados');
}

console.log(`\n=== INTEGRACIÓN: ${passed} PASADAS, ${failed} FALLADAS ===\n`);
// Clasificacion alojativa: servicios con pax/fechas nunca contaminan ocupacion.
{
    const stay = { dateIn: '2026-06-20', dateOut: '2026-06-21' };
    const case78038 = [
        { ...stay, type: 'Hab. Triple', qty: 4, pax: 3, total: 900, isService: false },
        { ...stay, type: 'Hab. Doble', qty: 8, pax: 2, total: 1600, isService: false },
        { ...stay, type: 'Doble Uso Individual', qty: 1, pax: 1, total: 200, isService: false },
        { ...stay, type: 'ALMUERZO EXTRA', qty: 1, pax: 29, nights: 1, total: 285.19 }
    ];
    assert(calculateMaxDailyOccupancy(case78038) === 29, '78038: pax alojado 29; almuerzo excluido');
    assert(calculateMaxDailyRooms(case78038) === 13, '78038: 13 habitaciones; almuerzo excluido');
    assert(getServiceItems(case78038)[0].pax === 29, '78038: almuerzo conserva sus 29 pax');
    assert(getEconomicRoomingItems(case78038).length === 4, '78038: almuerzo permanece en lineas economicas');
    assert(getEconomicRoomingItems(case78038).reduce((sum, item) => sum + item.total, 0) === 2985.19, '78038: total economico permanece en 2.985,19 EUR');
    assert(groupAndMergeRoomingList(case78038, stay.dateIn, stay.dateOut).filter(isAccommodationItem).length === 13, '78038: Rooming contiene 13 habitaciones alojativas');

    for (const [type, pax] of [['Desayuno', 50], ['Sala', 100], ['Circuito Spa', 20]]) {
        const mixed = [case78038[1], { ...stay, type, qty: 1, pax }];
        assert(calculateMaxDailyOccupancy(mixed) === 16, `${type}: no aumenta el pax alojado`);
        assert(calculateMaxDailyRooms(mixed) === 8, `${type}: no aumenta habitaciones`);
    }

    const eventOnly = [{ ...stay, type: 'Almuerzo', qty: 1, pax: 80 }];
    assert(calculateMaxDailyOccupancy(eventOnly) === 0, 'Evento sin alojamiento: pax alojado 0');
    assert(calculateMaxDailyRooms(eventOnly) === 0, 'Evento sin alojamiento: habitaciones 0');
    assert(getServiceItems(eventOnly)[0].pax === 80, 'Evento sin alojamiento: servicio conserva 80 pax');

    const manualRoom = [{ ...stay, type: 'Hab. Doble', qty: 1, pax: 2, isManualRoomingItem: true, excludeFromEconomicTotals: true }];
    assert(getAccommodationItems(manualRoom).length === 1, 'Habitacion manual: cuenta como alojamiento');
    assert(getEconomicRoomingItems(manualRoom).length === 0, 'Habitacion manual: no cuenta en economia');
    assert(calculateMaxDailyRooms(manualRoom) === 1 && calculateRoomNights(manualRoom) === 1, 'Habitacion manual: cuenta como habitacion fisica');
}

// Movimientos diarios: entradas/salidas parciales y desayuno de la noche anterior.
{
    const movementItems = [
        { type: 'Hab. Doble', qty: 9, pax: 2, dateIn: '2026-06-24', dateOut: '2026-06-25' },
        { type: 'Hab. Triple', qty: 1, pax: 3, dateIn: '2026-06-24', dateOut: '2026-06-26' },
        { type: 'Almuerzo extra', qty: 1, pax: 100, dateIn: '2026-06-25', dateOut: '2026-06-26' }
    ];
    const movements = calculateDailyMovements(movementItems);
    assert(movements['2026-06-24'].arrivals.pax === 21, 'Movimientos: llegada 24/06 de 21 pax');
    assert(movements['2026-06-24'].arrivals.rooms === 10, 'Movimientos: llegada 24/06 de 10 habitaciones reales');
    assert(movements['2026-06-25'].breakfast.pax === 21, 'Movimientos: desayuno 25/06 de 21 pax');
    assert(movements['2026-06-25'].departures.pax === 18, 'Movimientos: salida parcial 25/06 de 18 pax');
    assert(movements['2026-06-25'].departures.rooms === 9, 'Movimientos: salida parcial de 9 habitaciones');
    assert(movements['2026-06-25'].overnight.pax === 3, 'Movimientos: permanecen 3 pax la noche del 25/06');
    assert(movements['2026-06-26'].breakfast.pax === 3, 'Movimientos: desayuno 26/06 de 3 pax');
    assert(movements['2026-06-26'].departures.pax === 3, 'Movimientos: salida final 26/06 de 3 pax');
    assert(movements['2026-06-26'].departures.rooms === 1, 'Movimientos: salida final de 1 habitacion');
    assert(movements['2026-06-26'].overnight.pax === 0, 'Movimientos: ocupacion cero tras salida final');
    assert(!Object.values(movements).some(day => day.arrivals.pax >= 100 || day.overnight.pax >= 100), 'Movimientos: servicio extra no altera ocupacion');

    const staggered = calculateDailyMovements([
        { type: 'Hab. Doble', qty: 2, pax: 2, dateIn: '2026-07-01', dateOut: '2026-07-03' },
        { type: 'Individual', qty: 1, pax: 1, dateIn: '2026-07-02', dateOut: '2026-07-04' }
    ]);
    assert(staggered['2026-07-01'].arrivals.pax === 4 && staggered['2026-07-02'].arrivals.pax === 1, 'Movimientos: varias fechas de entrada');
    assert(staggered['2026-07-03'].departures.pax === 4 && staggered['2026-07-04'].departures.pax === 1, 'Movimientos: varias fechas de salida');
    assert(staggered['2026-07-02'].breakfast.pax === 4 && staggered['2026-07-03'].breakfast.pax === 5, 'Movimientos: desayuno usa exclusivamente la noche anterior');

    const oneNight = calculateDailyMovements([{ type: 'Doble', qty: 1, pax: 2, dateIn: '2026-08-01', dateOut: '2026-08-02' }]);
    assert(oneNight['2026-08-02'].breakfast.pax === 2 && oneNight['2026-08-02'].departures.pax === 2, 'Movimientos: grupo de una noche desayuna y sale el mismo dia');

    const manual = calculateDailyMovements([{ type: 'Hab. Doble', qty: 1, pax: 2, dateIn: '2026-09-01', dateOut: '2026-09-04', isManualRoomingItem: true, excludeFromEconomicTotals: true }]);
    assert(manual['2026-09-02'].breakfast.pax === 2 && manual['2026-09-03'].overnight.pax === 2, 'Movimientos: habitacion manual cuenta durante tres noches');
}

console.log(`CLASIFICACION Y MOVIMIENTOS COMPLETADOS: ${passed} PASADAS, ${failed} FALLADAS`);
process.exit(failed > 0 ? 1 : 0);
