const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const {
    extractDateRanges,
    parseEmailTextLocally,
    parseEmailTextLocallyMulti,
    normalizeAiExtractionResponse
} = require('../js/services/emailParser.js');

test('AltaEmail.jsx integrates local email parser and multi-date support', () => {
    const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'AltaEmail.jsx'), 'utf8');
    assert.ok(code.includes('parseEmailTextLocally'), 'AltaEmail.jsx contains parseEmailTextLocally');
    assert.ok(code.includes('handleLocalExtract'), 'AltaEmail.jsx contains handleLocalExtract');
});

test('Detects two distinct date ranges, pax, rooms, driver/guide singles and agency in Galegria Viajes email', () => {
    const email = `Buenas noches.
Nos gustaría conocer cotización para estos dos grupos: 50 pasajeros/ sobre 27 habitaciones + chófer y guía en singled free.
En régimen de Mp o PC.
-Del 19 al 21 de marzo.
-Del 15 al 17 de mayo.
Un saludo.
---
DEPARTAMENTO DE GRUPOS
GALEGRÍA VIAJES (XG-719)
grupos@galegriaviajes.com
galegriaviajes.com
+34 633 075 935`;

    const refDate = new Date('2026-11-21T22:00:00Z');
    const groups = parseEmailTextLocallyMulti(email, refDate);

    assert.equal(groups.length, 2, 'Should detect 2 groups for the 2 date ranges');

    // Grupo 1: Marzo 2027 (rollover desde nov 2026)
    assert.equal(groups[0]['Entrada'], '2027-03-19');
    assert.equal(groups[0]['Salida'], '2027-03-21');
    assert.equal(groups[0]['Pax.'], 50);
    assert.equal(groups[0]['Empresa/Agencia'], 'GALEGRÍA VIAJES');
    assert.equal(groups[0]['Com_Nombre_Contacto'], 'DEPARTAMENTO DE GRUPOS');
    assert.equal(groups[0]['Com_Email_Contacto'], 'grupos@galegriaviajes.com');
    assert.equal(groups[0]['Com_Telefono_Contacto'], '633075935');
    assert.equal(groups[0]['Nombre del Grupo'], 'GRUPO GALEGRÍA VIAJES (19/03 - 21/03)');
    assert.equal(groups[0].roomCounts['DOBLE'], 23);
    assert.equal(groups[0].roomCounts['DOBLE DE USO INDIVIDUAL'], 6);
    assert.equal(groups[0].dailyConfig['2027-03-19']['DOBLE DE USO INDIVIDUAL'].gratuities, 2);
    assert.equal(groups[0].dailyConfig['2027-03-20']['DOBLE DE USO INDIVIDUAL'].gratuities, 2);

    // Grupo 2: Mayo 2027
    assert.equal(groups[1]['Entrada'], '2027-05-15');
    assert.equal(groups[1]['Salida'], '2027-05-17');
    assert.equal(groups[1]['Pax.'], 50);
    assert.equal(groups[1]['Nombre del Grupo'], 'GRUPO GALEGRÍA VIAJES (15/05 - 17/05)');
    assert.equal(groups[1].roomCounts['DOBLE'], 23);
    assert.equal(groups[1].roomCounts['DOBLE DE USO INDIVIDUAL'], 6);
    assert.equal(groups[1].dailyConfig['2027-05-15']['DOBLE DE USO INDIVIDUAL'].gratuities, 2);
});

test('Detects multiple numeric date ranges and cross-month/cross-year ranges', () => {
    const refDate = new Date('2026-11-21T12:00:00Z');

    const numericEmail = `Solicitamos presupuesto para 30 personas:
- Opción 1: del 10/04/2027 al 12/04/2027
- Opción 2: del 22/05/2027 al 24/05/2027`;
    const numRanges = extractDateRanges(numericEmail, refDate);
    assert.equal(numRanges.length, 2);
    assert.equal(numRanges[0].entrada, '2027-04-10');
    assert.equal(numRanges[0].salida, '2027-04-12');
    assert.equal(numRanges[1].entrada, '2027-05-22');
    assert.equal(numRanges[1].salida, '2027-05-24');

    const crossYearEmail = `Grupo fin de año del 30 de diciembre al 2 de enero para 40 pax en MP.`;
    const crossRanges = extractDateRanges(crossYearEmail, refDate);
    assert.equal(crossRanges.length, 1);
    assert.equal(crossRanges[0].entrada, '2026-12-30');
    assert.equal(crossRanges[0].salida, '2027-01-02');
});

test('Single date range email does not append date suffix to group name', () => {
    const refDate = new Date('2026-01-10T12:00:00Z');
    const email = `Hola, queremos reservar del 10 al 12 de junio de 2026 para 20 personas en 10 dobles, régimen HD.
Agencia: Viajes Sol`;
    const groups = parseEmailTextLocallyMulti(email, refDate);
    assert.equal(groups.length, 1);
    assert.equal(groups[0]['Entrada'], '2026-06-10');
    assert.equal(groups[0]['Salida'], '2026-06-12');
    assert.equal(groups[0]['Nombre del Grupo'], 'GRUPO VIAJES SOL');
    assert.equal(groups[0].roomCounts['DOBLE'], 10);
});

test('normalizeAiExtractionResponse expands single AI object when email has multiple date ranges', () => {
    const refDate = new Date('2026-11-21T12:00:00Z');
    const email = `Cotización para dos grupos de 50 pasajeros:
-Del 19 al 21 de marzo.
-Del 15 al 17 de mayo.`;

    const singleAiResult = {
        'Nombre del Grupo': 'GALEGRÍA VIAJES',
        'Entrada': '2027-03-19',
        'Salida': '2027-03-21',
        'Pax.': 50,
        'Régimen': 'MP'
    };

    const normalized = normalizeAiExtractionResponse(singleAiResult, email, refDate);
    assert.equal(normalized.length, 2);
    assert.equal(normalized[0]['Entrada'], '2027-03-19');
    assert.equal(normalized[0]['Salida'], '2027-03-21');
    assert.equal(normalized[1]['Entrada'], '2027-05-15');
    assert.equal(normalized[1]['Salida'], '2027-05-17');
});
