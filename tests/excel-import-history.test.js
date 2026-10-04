const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../js/services/excelService');
test('Excel history records each accepted change with old and new values', () => {
  const row = { Reserva: '123', _diff: 'modified', _linea: '2', _changes: {
    'Segment.': { old: 'GRUPO TANTEO', new: 'GRUPO' },
    'Cant. Habitaciones': { old: 12, new: 15 },
    'Régimen': { old: 'AD', new: 'MP' },
    'Pax.': { old: 0, new: 30 },
    'Entrada': { old: '---', new: '2027-01-10' }
  } };
  const result = service.buildImportLog(row, new Date('2026-10-05T08:00:00Z'));
  assert.equal(result.changes.length, 5);
  assert.match(result.text, /Segmento: GRUPO TANTEO → GRUPO/);
  assert.match(result.text, /Habitaciones: 12 → 15/);
  assert.match(result.text, /Régimen: AD → MP/);
  assert.match(result.text, /Personas: 0 → 30/);
  assert.match(result.text, /Entrada: vacío → 2027-01-10/);
  assert.match(result.text, /Línea 2/);
  assert.equal(row._changes['Cant. Habitaciones'].old, 12);
});
test('new reservations are identified as additions and unchanged fields are omitted', () => {
  const result = service.buildImportLog({ _diff: 'new', _changes: { Estado: { old: 'CONFIRMADO', new: 'CONFIRMADO' } } });
  assert.match(result.text, /Alta de reserva/);
  assert.equal(result.changes.length, 0);
});
test('entries on different lines have distinct identifiers', () => {
  const now = new Date();
  assert.notEqual(service.buildImportLog({Reserva:'123', _linea:1}, now).id,
    service.buildImportLog({Reserva:'123', _linea:2}, now).id);
});
