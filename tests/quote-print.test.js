const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function setup(naturalHeight) {
  const events = {};
  let scale = 1;
  const quote = {
    style: {
      setProperty: (_, value) => { scale = Number(value); },
      removeProperty: () => { scale = 1; }
    },
    appendChild() {},
    get scrollHeight() { return naturalHeight; },
    getBoundingClientRect: () => ({ height: naturalHeight * scale })
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../js/quotePrint.js'), 'utf8'), {
    document: {
      getElementById: () => quote,
      createElement: () => ({ style: {}, getBoundingClientRect: () => ({ height: 1040 }), remove() {} })
    },
    window: { addEventListener: (name, fn) => { events[name] = fn; } }
  });
  return { events, scale: () => scale };
}
test('long quotes fit one sheet and reset after printing', () => {
  const state = setup(1500);
  state.events.beforeprint();
  assert.ok(1500 * state.scale() <= 1040.01);
  state.events.afterprint();
  assert.equal(state.scale(), 1);
});
test('short quotes keep their original print size', () => {
  const state = setup(900);
  state.events.beforeprint();
  assert.equal(state.scale(), 1);
});
