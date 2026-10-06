const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/Presupuestos.jsx'), 'utf8');
const helpers = source.slice(source.indexOf('    const isLockedBudget ='), source.indexOf('    const getBudgetStatusStyle ='));
test('a duplicate with its own quote ID stays editable while PMS reservations stay locked', () => {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(helpers + '\nthis.locked = isLockedBudget; this.details = getBudgetLockedDetails;', ctx);
  const copy = { Reserva: 'PRES-123456', Presupuesto_Origen: 'PRES-654321', sourceQuoteId: 'PRES-654321', Estado: 'Presupuesto', Com_Estado_Interno: 'PRESUPUESTO' };
  assert.equal(ctx.locked(copy), false);
  assert.equal(ctx.details(copy).isLocked, false);
  for (const fields of [{ Reserva: '123456' }, { targetReservationId: '123456' }, { Estado: 'Confirmado', Com_Estado_Interno: 'CONFIRMADO' }, { isReadOnly: true }]) {
    assert.equal(ctx.locked({ ...copy, ...fields }), true);
    assert.equal(ctx.details({ ...copy, ...fields }).isLocked, true);
  }
});
test('duplication recalculates the destination hotel before calculating and persisting its total', async () => {
  const handler = source.slice(source.indexOf('      const duplicateBudget ='), source.indexOf('      const duplicateBudgetToOtherHotel ='));
  let stored, form;
  const ctx = {
    normalizeGroupData: value => value, groups: [], getAlternateHotel: () => 'Cumbria Spa&Hotel',
    repriceBudgetForHotel: value => ({ ...value, ratesOnlyGrid: { HD: { DOBLE: 73.5 } } }),
    calculateTotal: value => value.ratesOnlyGrid.HD.DOBLE,
    buildRoomingList: () => [], formatNum: String,
    firebase: { firestore: { FieldValue: { serverTimestamp: () => 'timestamp' } } },
    db: { collection: () => ({ doc: () => ({ set: async value => { stored = value; } }) }) },
    setFormData: value => { form = value; }, setCurrentView: () => {}, alert: message => { throw new Error(message); }, console
  };
  vm.createContext(ctx);
  await vm.runInContext(handler + '\nduplicateBudget({ Reserva: "PRES-654321", Hotel_Asignado: "Sercotel Guadiana", ratesOnlyGrid: { HD: { DOBLE: 99 } }, isReadOnly: true }, true);', ctx);
  assert.equal(stored.ratesOnlyGrid.HD.DOBLE, 73.5);
  assert.equal(stored['Importe(*)'], '73.5');
  assert.equal(stored.Hotel_Asignado, 'Cumbria Spa&Hotel');
  assert.equal(form.isReadOnly, undefined);
  assert.equal(stored.Presupuesto_Origen, 'PRES-654321');
});
