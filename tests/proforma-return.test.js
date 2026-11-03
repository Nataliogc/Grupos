const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../Fac Prof.html'), 'utf8');
const start = html.indexOf('        async function saveAndExit()');
const source = html.slice(start, html.indexOf('// callGemini base', start));

async function exit(group, success = true) {
    const alerts = [];
    const window = { location: { href: '' }, NexusSelectedGroupStorage: {
        getItem: () => JSON.stringify(group)
    } };
    const context = vm.createContext({ window, alert: message => alerts.push(message),
        saveProforma: async () => success,
        localStorage: { setItem() { throw new Error('QuotaExceededError'); } }
    });
    vm.runInContext(source, context);
    await context.saveAndExit();
    return { href: window.location.href, alerts };
}

test('saved proforma returns to its reservation even when storage is full', async () => {
    assert.equal((await exit({ Reserva: '80152' })).href, 'Gestion-de-Grupos.html?reserva=80152');
    assert.equal((await exit({ Reserva: 80152 })).href, 'Gestion-de-Grupos.html?reserva=80152');
    assert.equal((await exit({ id: 'A/B & C' })).href, 'Gestion-de-Grupos.html?reserva=A%2FB%20%26%20C');
});

test('independent proforma returns to the proforma list', async () => {
    assert.equal((await exit({ Reserva: 'prof-123' })).href, 'Proformas.html');
});

test('failed or incomplete save keeps the document open and alerts the user', async () => {
    for (const success of [false, null]) {
        const result = await exit({ Reserva: '80152' }, success);
        assert.equal(result.href, '');
        assert.equal(result.alerts.length, 1);
    }
});
