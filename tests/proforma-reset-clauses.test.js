const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'Fac Prof.html'), 'utf8');
const source = html.slice(html.indexOf('        async function resetClauses()'), html.indexOf('        async function saveAndExit()'));

function setup({ fail = false, valid = true } = {}) {
    let saved = JSON.stringify({ Reserva: '123', ProformaCustomFields: { confirmationClauses: [{ title: 'Custom', body: 'Old' }] } });
    let payload;
    const alerts = [];
    const context = vm.createContext({
        localStorage: { getItem: () => saved, setItem: (_, value) => { saved = value; } },
        confirm: () => true, alert: message => alerts.push(message),
        renderItems() {}, validateProformaAgainstSource: () => valid,
        reconcilePaymentPlan() {}, isIndependentProforma: () => false,
        items: [], paymentPlan: [], total: 0, currentHotel: 'guadiana', currentTemplate: 'confirmacion',
        document: { getElementById: () => null, querySelectorAll: () => [] },
        firebase: { firestore: { FieldValue: { serverTimestamp: () => 'timestamp' } } },
        db: { collection: () => ({ doc: () => ({ set: async value => {
            if (fail) throw new Error('offline');
            payload = value;
        } }) }) },
        console: { error() {} }
    });
    vm.runInContext(source, context);
    return { context, alerts, payload: () => payload, saved: () => JSON.parse(saved) };
}

test('reset persists an empty array so a merged save replaces old clauses', async () => {
    const state = setup();
    await state.context.resetClauses();
    assert.equal(state.payload().ProformaCustomFields.confirmationClauses.length, 0);
    assert.deepEqual(state.saved().ProformaCustomFields.confirmationClauses, []);
    assert.equal(state.alerts.length, 0);
});

for (const options of [{ fail: true }, { valid: false }]) {
    test(`reset reports an unsuccessful save ${JSON.stringify(options)}`, async () => {
        const state = setup(options);
        await state.context.resetClauses();
        assert.equal(state.payload(), undefined);
        assert.equal(state.alerts.length, 1);
    });
}
