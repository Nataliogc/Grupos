const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/GestionGrupos.jsx'), 'utf8');
const start = source.indexOf('      const [fichaReturnUrl]');
const end = source.indexOf('      const [isEditingGroupName', start);
function close(search, referrer = '') {
  const actions = [];
  const context = {URL, URLSearchParams, document: {referrer}, useState: fn => [fn()],
    setShowFichaModal: value => actions.push(value),
    window: {location: {search, href: 'https://example.com/Gestion-de-Grupos.html' + search,
      assign: url => actions.push(url)}}};
  vm.runInNewContext(source.slice(start, end) + '\ncloseGroupFicha();', context);
  return actions;
}
test('cerrar una consulta del Panel vuelve al Panel', () => {
  assert.deepEqual(close('?reserva=123&returnTo=Admin.html'), [false, 'https://example.com/Admin.html']);
});
test('una consulta desde otro módulo conserva su URL y filtros', () => {
  assert.deepEqual(close('?reserva=123', 'https://example.com/Presupuestos.html?filter=confirmed'),
    [false, 'https://example.com/Presupuestos.html?filter=confirmed']);
});
test('la ficha abierta en Grupos permanece en Grupos y no acepta destinos externos', () => {
  assert.deepEqual(close('', 'https://example.com/Admin.html'), [false]);
  assert.deepEqual(close('?reserva=123&returnTo=https://other.example'), [false]);
  assert.deepEqual(close('?reserva=123', 'https://example.com/Gestion-de-Grupos.html'), [false]);
});

test('al volver de la confirmación o proforma, cerrar la ficha termina en Grupos', () => {
  assert.deepEqual(close('?reserva=208017', 'https://example.com/Fac%20Prof.html'), [false]);
  assert.deepEqual(close('?reserva=208017&returnTo=Fac%20Prof.html'), [false]);
});

test('al volver de la orden de servicio, cerrar la ficha permanece en Grupos', () => {
  assert.deepEqual(close('?reserva=208017', 'https://example.com/Orden%20Servicio.html?v=1.1-meal-schedule'), [false]);
  assert.deepEqual(close('?reserva=208017&returnTo=Orden%20Servicio.html'), [false]);
});
