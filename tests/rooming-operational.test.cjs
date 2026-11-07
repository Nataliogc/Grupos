const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../js/services/roomingOperationalService');
const core = require('../js/rooming-core');
test('orders extra and cached manual services by date, then time', () => {
  const rows = [
    { servicio: 'Salida', serviceDate: '2026-11-15' },
    { servicio: 'Cena', serviceDate: '2026-11-14', hora: '21:00' },
    { servicio: 'Llegada', serviceDate: '2026-11-13' },
    { servicio: 'SPA', serviceDate: '2026-11-14', hora: 'PENDIENTE' },
    { servicio: 'Manual', fecha: 'Sáb 14/11/2026', hora: '10:30' },
    { servicio: 'Desayuno', serviceDate: '2026-11-14' }
  ];
  assert.deepEqual(service.sortServices(rows).map(r => r.servicio), ['Llegada', 'Desayuno', 'Manual', 'SPA', 'Cena', 'Salida']);
  assert.equal(rows[0].servicio, 'Salida');
});
test('recognizes paid installments, including Pagado, without adding the summary twice', () => {
  assert.equal(service.paidAmount({ PaymentPlan_JSON: JSON.stringify([{ status: 'Pagado', amount: '2.109,40' }]), Com_Pagado: '2109.40' }), 2109.40);
  assert.equal(service.paidAmount({ PaymentPlan_JSON: '[]', Com_Pagado: '2109.40' }), 2109.40);
  assert.equal(service.paidAmount({ PaymentPlan_JSON: '{broken', Com_Pagado: '2109.40' }), 2109.40);
  assert.equal(service.paidAmount({ PaymentPlan_JSON: [{ status: 'Cobrado', amount: 300 }, { status: 'Pendiente', amount: 700 }] }), 300);
});
test('includes the November 14 spa for 16 people and excludes room blocks', () => {
  const rows = service.contractedServices(JSON.stringify([
    { id: 'spa', type: 'SPA', isService: true, dateIn: '2026-11-14', qty: 16, pax: 0 },
    { type: 'HAB. DOBLE', dateIn: '2026-11-14', qty: 8, pax: 2 }
  ]), core.isAccommodationItem);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].serviceDate, '2026-11-14');
  assert.equal(rows[0].paxHab, '16 pax');
  assert.equal(rows[0].hora, 'PENDIENTE');
});
test('obtiene ocupacion para almuerzo en dia de salida usando pax de salidas', () => {
  const movements = {
    '2026-11-12': {
      arrivals: { pax: 0, rooms: 0 },
      departures: { pax: 37, rooms: 19 },
      overnight: { pax: 0, rooms: 0 },
      breakfast: { pax: 37, rooms: 19 }
    }
  };
  const occ = service.getServiceOccupancy('Almuerzo', '2026-11-12', movements);
  assert.equal(occ.pax, 37);
  assert.equal(occ.rooms, 19);
});
test('ordena en dia de salida desayuno, almuerzo y salida cronologicamente', () => {
  const rows = [
    { servicio: 'Salida / check-out', serviceType: 'Salida', serviceDate: '2026-11-12', hora: '___:___ h' },
    { servicio: 'Almuerzo', serviceType: 'Almuerzo', serviceDate: '2026-11-12', hora: '___:___ h' },
    { servicio: 'Desayuno', serviceType: 'Desayuno', serviceDate: '2026-11-12', hora: '___:___ h' }
  ];
  const sorted = service.sortServices(rows);
  assert.deepEqual(sorted.map(r => r.servicio), ['Desayuno', 'Almuerzo', 'Salida / check-out']);
});
test('resolveSavedState prioritizes local draft and falls back to firestore RoomingServicios_JSON', () => {
  const localDraft = JSON.stringify({ pendientes: [{ pendiente: 'Local task' }] });
  const firestoreRecord = { RoomingServicios_JSON: JSON.stringify({ pendientes: [{ pendiente: 'Remote task' }] }) };
  assert.deepEqual(service.resolveSavedState(localDraft, firestoreRecord).pendientes[0].pendiente, 'Local task');
  assert.deepEqual(service.resolveSavedState(null, firestoreRecord).pendientes[0].pendiente, 'Remote task');
  assert.equal(service.resolveSavedState(null, {}), null);
});
test('preserves user saved pendientes even if record timestamp changed', () => {
  const savedState = { pendientes: [{ pendiente: 'Coordinar bus', detalle: 'A las 10:00' }] };
  assert.equal(service.shouldPreserveSavedPendientes(savedState), true);
  assert.equal(service.shouldPreserveSavedPendientes({ pendientes: [] }), true);
  assert.equal(service.shouldPreserveSavedPendientes({}), false);
  assert.equal(service.shouldPreserveSavedPendientes(null), false);
});
test('preserves user saved services unless restoreServices is explicitly flagged', () => {
  const savedServices = { servicios: [{ servicio: 'Cena', hora: '21:30' }] };
  assert.equal(service.shouldPreserveSavedServices(savedServices), true);
  assert.equal(service.shouldPreserveSavedServices({ ...savedServices, restoreServices: true }), false);
  assert.equal(service.shouldPreserveSavedServices({ servicios: [] }), false);
});
