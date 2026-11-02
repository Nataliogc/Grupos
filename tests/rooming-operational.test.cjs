const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../js/services/roomingOperationalService');
const core = require('../js/rooming-core');
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
