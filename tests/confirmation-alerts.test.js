const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/Admin.jsx'), 'utf8');
const start = source.indexOf('          // El plazo de confirmación');
const end = source.indexOf('          // 3. Column 3:', start);
function alerts(options = {}) {
  const ctx = {isConfirmed: false, pending: 0, isCredito: false, seenRelease: new Set(), resId: '123',
    g: {Com_Vencimiento_Rel: '2026-10-08'}, now: new Date('2026-10-05T12:00:00'),
    startOfToday: new Date('2026-10-05T00:00:00'), fiveDaysFromNow: new Date('2026-10-10T00:00:00'),
    parseDate: value => value ? new Date(value + 'T00:00:00') : null,
    formatDate: value => value.toISOString().slice(0,10), releaseAlerts: [], ...options};
  vm.runInNewContext(source.slice(start,end),ctx);
  return ctx.releaseAlerts;
}
test('avisa del plazo incluso con saldo cero o pago a crédito', () => {
  assert.equal(alerts().length, 1);
  assert.equal(alerts({isCredito: true}).length, 1);
  assert.doesNotMatch(alerts()[0].detail, /Pend:|€|Pago/);
});
test('no avisa de reservas confirmadas, sin plazo o con plazo lejano', () => {
  assert.equal(alerts({isConfirmed: true}).length, 0);
  assert.equal(alerts({g: {}}).length, 0);
  assert.equal(alerts({g: {Com_Vencimiento_Rel: '2026-10-20'}}).length, 0);
});
test('distingue plazos vencidos', () => {
  assert.equal(alerts({g: {Com_Vencimiento_Rel: '2026-10-02'}})[0].type, 'danger');
});

test('a tentative group segment is not mistaken for confirmed', () => {
  const start = source.indexOf('          const isTentative =');
  const end = source.indexOf('          const entryDate =', start);
  const ctx = { status: 'TENTATIVA GRUPO TANTEO' };
  vm.runInNewContext(source.slice(start, end) + '\nthis.confirmed = isConfirmed; this.tentative = isTentative;', ctx);
  assert.equal(ctx.confirmed, false);
  assert.equal(ctx.tentative, true);
});
test('the confirmation deadline today generates a clear alert', () => {
  const result = alerts({g: {Com_Vencimiento_Rel: '2026-10-05'}});
  assert.equal(result.length, 1);
  assert.equal(result[0].label, 'Confirmación vence hoy');
  assert.match(result[0].detail, /vence hoy/);
});

test('a PMS group with GRUPO TANTEO segment appears in both alert columns', () => {
  const start = source.indexOf('      const columnsData = React.useMemo');
  const end = source.indexOf('      }, [filteredGroups]);', start) + '      }, [filteredGroups]);'.length;
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : ['2026-10-06T12:00:00'])); }
  }
  const group = { Reserva: '211520', Estado: 'RESERVA', 'Segment.': 'GRUPO TANTEO', Entrada: '2026-10-21', Salida: '2026-10-22', Com_Vencimiento_Rel: '2026-10-06' };
  const ctx = { Date: FixedDate, React: { useMemo: fn => fn() }, filteredGroups: [group],
    parseDate: value => value ? new Date(value + 'T00:00:00') : null,
    formatDate: value => value.toISOString().slice(0, 10),
    getGroupFinancialInfo: () => ({total: 1140, paid: 0, pending: 1140}), isCreditoGroup: () => false };
  vm.runInNewContext(source.slice(start, end) + '\nthis.result = columnsData;', ctx);
  assert.equal(ctx.result.releaseAlerts.length, 1);
  assert.equal(ctx.result.releaseAlerts[0].label, 'Confirmación vence hoy');
  assert.equal(ctx.result.tentativeAlerts.length, 1);
  assert.equal(ctx.result.logisticsAlerts.length, 0);
});

test('payment wording follows calendar dates and selects the earliest unpaid milestone', () => {
  const start = source.indexOf('      const getPaymentNotice =');
  const end = source.indexOf('      // Filtrado por hotel seleccionado', start);
  const ctx = {parseDate: value => value ? new Date(value + 'T00:00:00') : null};
  vm.runInNewContext(source.slice(start, end) + '\nthis.notice = getPaymentNotice;', ctx);
  const group = {PaymentPlan_JSON: JSON.stringify([{date:'2026-10-09',status:'Pendiente'}, {date:'2026-10-06',status:'Pendiente'}, {date:'2026-10-01',status:'Cobrado'}])};
  assert.equal(ctx.notice(group, new Date(2026,9,1,12)).label, 'Próximo vencimiento de pago');
  assert.equal(ctx.notice(group, new Date(2026,9,1,12)).days, 5);
  assert.equal(ctx.notice(group, new Date(2026,9,6,23)).label, 'Pago con vencimiento hoy');
  assert.equal(ctx.notice(group, new Date(2026,9,7)).label, 'Pago pendiente vencido');
  assert.equal(ctx.notice({}), null);
});
