const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/GestionGrupos.jsx'), 'utf8');
const status = source.slice(source.indexOf('      const getStatusProps ='), source.indexOf('      const toInputDate =', source.indexOf('      const getStatusProps =')));
const filterStart = source.indexOf('        // 1. Filtro de Estado');
const filters = source.slice(filterStart, source.indexOf('        // 2.5 Filtro de Fecha', filterStart));
test('ANULADA and CANCELADO classify as cancelled while rejected budgets keep their label', () => {
 const ctx = { toInputDate: x => x }; vm.createContext(ctx);
 vm.runInContext(status + '\nthis.status = getStatusProps;', ctx);
 assert.equal(ctx.status('', '2026-10-01', 'ANULADA').label, 'CANCELADO');
 assert.equal(ctx.status('DESESTIMADO', '2026-10-01', 'ANULADA').label, 'DESESTIMADO');
});
test('cancelled filter shows past and future cancellations despite future time default', () => {
 const ctx = { filtered: [{_stateLabel:'cancelado',_normArrival:'2026-09-01'},{_stateLabel:'cancelado',_normArrival:'2026-11-01'},{_stateLabel:'confirmado',_normArrival:'2026-11-01'}], filterStatus:'anulada',filterTime:'future',today:'2026-10-04',startDate:'',endDate:'',searchTerm:'' };
 vm.createContext(ctx); vm.runInContext(filters, ctx);
 assert.equal(ctx.filtered.length, 2);
});
test('past filter includes cancelled and active past groups', () => {
 const ctx = { filtered: [{_stateLabel:'cancelado',_normArrival:'2026-09-01'},{_stateLabel:'confirmado',_normArrival:'2026-09-02'},{_stateLabel:'cancelado',_normArrival:'2026-11-01'}], filterStatus:'pasado',filterTime:'future',today:'2026-10-04',startDate:'',endDate:'',searchTerm:'' };
 vm.createContext(ctx); vm.runInContext(filters, ctx);
 assert.equal(ctx.filtered.length, 2);
});
