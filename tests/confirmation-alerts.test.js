const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/Admin.jsx'), 'utf8');

function evaluateReleaseAlert(options = {}) {
  const start = source.indexOf('          // 2. Release / Plazo de Confirmación');
  const end = source.indexOf('          // 3. Tentativas Urgentes', start);
  const releaseBlock = source.slice(start, end);

  const ctx = {
    isConfirmed: false,
    g: { Com_Vencimiento_Rel: '2026-10-08' },
    startOfToday: new Date('2026-10-05T00:00:00'),
    fiveDaysFromNow: new Date('2026-10-10T00:00:00'),
    parseDate: value => (value ? new Date(value + 'T00:00:00') : null),
    formatDate: value => value.toISOString().slice(0, 10),
    groupAlerts: [],
    ...options
  };

  vm.runInNewContext(releaseBlock, ctx);
  return ctx.groupAlerts;
}

test('avisa del plazo de confirmacion proximo o vencido', () => {
  const alerts = evaluateReleaseAlert();
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].categoryKey, 'release');
});

test('no avisa de reservas confirmadas, sin plazo o con plazo lejano', () => {
  assert.equal(evaluateReleaseAlert({ isConfirmed: true }).length, 0);
  assert.equal(evaluateReleaseAlert({ g: {} }).length, 0);
  assert.equal(evaluateReleaseAlert({ g: { Com_Vencimiento_Rel: '2026-10-25' } }).length, 0);
});

test('distingue plazos vencidos con tipo danger', () => {
  const alerts = evaluateReleaseAlert({ g: { Com_Vencimiento_Rel: '2026-10-02' } });
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].type, 'danger');
  assert.match(alerts[0].label, /vencido/i);
});

test('the confirmation deadline today generates a clear alert', () => {
  const alerts = evaluateReleaseAlert({ g: { Com_Vencimiento_Rel: '2026-10-05' } });
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].label, 'Confirmación vence hoy');
  assert.match(alerts[0].detail, /vence hoy/);
});

test('a tentative group segment is not mistaken for confirmed', () => {
  const start = source.indexOf('          const isTentative =');
  const end = source.indexOf('          const fin =', start);
  const ctx = { status: 'TENTATIVA GRUPO TANTEO' };
  vm.runInNewContext(source.slice(start, end) + '\nthis.confirmed = isConfirmed; this.tentative = isTentative;', ctx);
  assert.equal(ctx.confirmed, false);
  assert.equal(ctx.tentative, true);
});

function createFinancialContext() {
  const finStart = source.indexOf('    const getGroupPaymentPlans =');
  const finEnd = source.indexOf('    const Sidebar =', finStart);
  const noticeStart = source.indexOf('      const getPaymentNotice =');
  const noticeEnd = source.indexOf('      // Consolidación de grupos', noticeStart);
  const ctx = {
    safeParseAmount: v => {
      if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
      const n = parseFloat(String(v || '0').replace(',', '.'));
      return Number.isFinite(n) ? n : 0;
    },
    parseDate: value => {
      if (!value) return null;
      if (value instanceof Date) return value;
      const str = String(value).trim();
      const parts = str.split(/[\/-]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    }
  };
  vm.runInNewContext(
    source.slice(finStart, finEnd) + '\n' + source.slice(noticeStart, noticeEnd) +
    '\nthis.getGroupFinancialInfo = getGroupFinancialInfo; this.getGroupPaymentPlans = getGroupPaymentPlans; this.notice = getPaymentNotice;',
    ctx
  );
  return ctx;
}

test('payment wording follows calendar dates and selects the earliest unpaid milestone', () => {
  const ctx = createFinancialContext();
  const group = {
    PaymentPlan_JSON: JSON.stringify([
      { date: '2026-10-09', status: 'Pendiente', amount: 100 },
      { date: '2026-10-06', status: 'Pendiente', amount: 100 },
      { date: '2026-10-01', status: 'Cobrado', amount: 100 }
    ])
  };
  assert.equal(ctx.notice(group, new Date(2026, 9, 1, 12)).label, 'Próximo vencimiento de pago');
  assert.equal(ctx.notice(group, new Date(2026, 9, 1, 12)).days, 5);
  assert.equal(ctx.notice(group, new Date(2026, 9, 6, 23)).label, 'Pago con vencimiento hoy');
  assert.equal(ctx.notice(group, new Date(2026, 9, 7)).label, 'Pago pendiente vencido');
  assert.equal(ctx.notice({}), null);
});

test('no genera alerta de pago vencido si el grupo ya esta pagado aunque tenga multiples registros o planes antiguos', () => {
  const ctx = createFinancialContext();
  const rooming = JSON.stringify([
    { total: 421, hotel: 'SERCOTEL GUADIANA' },
    { total: 488, hotel: 'SERCOTEL GUADIANA' }
  ]);
  const oldPlan = JSON.stringify([{ date: '29/10/2026', status: 'Pendiente', amount: 909 }]);
  const paidPlan = JSON.stringify([{ date: '04/11/2026', status: 'Cobrado', amount: 909 }]);

  const group = {
    Hotel_Asignado: 'SERCOTEL GUADIANA',
    PaymentPlan_JSON: paidPlan,
    RoomingList_JSON: rooming,
    records: [
      { Hotel_Asignado: 'SERCOTEL GUADIANA', PaymentPlan_JSON: oldPlan, RoomingList_JSON: rooming },
      { Hotel_Asignado: 'SERCOTEL GUADIANA', PaymentPlan_JSON: paidPlan, RoomingList_JSON: rooming }
    ]
  };

  const fin = ctx.getGroupFinancialInfo(group);
  assert.equal(fin.total, 909);
  assert.equal(fin.paid, 909);
  assert.equal(fin.pending, 0);
  assert.equal(fin.allMilestonesCobrado, true);
  assert.equal(ctx.notice(group, new Date(2026, 10, 14)), null);
});

test('no genera alerta si el pago se registro manualmente con Com_Pagado', () => {
  const ctx = createFinancialContext();
  const group = {
    Hotel_Asignado: 'SERCOTEL GUADIANA',
    Com_Pagado: 909,
    PaymentPlan_JSON: JSON.stringify([{ date: '29/10/2026', status: 'Pendiente', amount: 909 }]),
    RoomingList_JSON: JSON.stringify([{ total: 909 }])
  };
  const fin = ctx.getGroupFinancialInfo(group);
  assert.equal(fin.pending, 0);
  assert.equal(ctx.notice(group, new Date(2026, 10, 14)), null);
});

test('filtra grupos con 20 dias o mas de aviso (antelacion a llegada)', () => {
  const start = source.indexOf('          const entryDate = parseDate(g.Entrada);');
  const end = source.indexOf('          const isTentative =', start);
  const filterBlock = source.slice(start, end);

  const startOfToday = new Date(2026, 9, 30); // 30/10/2026

  function checkArrival(entradaStr) {
    const ctx = {
      g: { Entrada: entradaStr },
      startOfToday,
      parseDate: value => (value ? new Date(value + 'T00:00:00') : null)
    };
    const code = `(function() {\n${filterBlock}\nreturn false;\n})()`;
    // If it hit return before reaching `return false`, the return in filterBlock returns undefined (falsy) unless we return true.
    const codeWithTrue = `(function() {\n${filterBlock.replace(/return;/g, 'return true;')}\nreturn false;\n})()`;
    return vm.runInNewContext(codeWithTrue, ctx);
  }

  // 10 dias a la llegada (< 20) -> no se descarta
  assert.equal(checkArrival('2026-11-09'), false);
  // 19 dias a la llegada (< 20) -> no se descarta
  assert.equal(checkArrival('2026-11-18'), false);
  // 20 dias a la llegada (>= 20) -> se descarta
  assert.equal(checkArrival('2026-11-19'), true);
  // 26 dias a la llegada (>= 20) -> se descarta
  assert.equal(checkArrival('2026-11-25'), true);
  // 72 dias a la llegada (>= 20) -> se descarta
  assert.equal(checkArrival('2027-01-10'), true);
  // 309 dias a la llegada (>= 20) -> se descarta
  assert.equal(checkArrival('2027-09-04'), true);
});
