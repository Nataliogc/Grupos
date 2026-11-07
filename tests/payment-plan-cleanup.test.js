const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../src/GestionGrupos.jsx'), 'utf8');
const start = source.indexOf('const reconcileReactPaymentPlan =');
const end = source.indexOf('const formatDate =', start);

function getReconcile() {
  const context = {
    toInputDate: (d) => String(d || '')
  };
  const code = source.slice(start, end).replace('const reconcileReactPaymentPlan =', 'reconcileReactPaymentPlan =');
  vm.runInNewContext(code, context);
  return context.reconcileReactPaymentPlan;
}

test('reconcileReactPaymentPlan removes 0 € pending rows when 100% is paid', () => {
  const reconcile = getReconcile();
  const plan = [
    { id: 1, amount: '909.00', percent: 100, status: 'Cobrado', date: '2026-11-04' },
    { id: 2, amount: '0.00', percent: 0, status: 'Pendiente', date: '2026-10-29' }
  ];
  const result = reconcile(plan, 909, '2026-11-13');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 1);
  assert.equal(result[0].status, 'Cobrado');
  assert.equal(result[0].amount, '909.00');
});

test('reconcileReactPaymentPlan keeps pending rows when there is real remaining amount', () => {
  const reconcile = getReconcile();
  const plan = [
    { id: 1, amount: '450.00', percent: 50, status: 'Cobrado', date: '2026-11-04' },
    { id: 2, amount: '459.00', percent: 50, status: 'Pendiente', date: '2026-10-29' }
  ];
  const result = reconcile(plan, 909, '2026-11-13');
  assert.equal(result.length, 2);
  assert.equal(result[0].status, 'Cobrado');
  assert.equal(result[1].status, 'Pendiente');
  assert.equal(result[1].amount, '459.00');
});

test('Admin.jsx past due check ignores milestones with 0 amount', () => {
  const admSource = fs.readFileSync(path.join(__dirname, '../src/Admin.jsx'), 'utf8');
  assert.ok(admSource.includes('(parseFloat(p.amount) || 0) > 0.05'));
});
