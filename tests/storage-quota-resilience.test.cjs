const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

const utilsCode = fs.readFileSync('js/utils.js', 'utf8');

function createMockStorage(initData = {}, quotaErrorUntilCleared = false) {
  const store = new Map(Object.entries(initData));
  let quotaReached = quotaErrorUntilCleared;

  return {
    store,
    getItem(k) {
      return store.has(k) ? store.get(k) : null;
    },
    setItem(k, v) {
      if (quotaReached) {
        const err = new Error("Failed to execute 'setItem' on 'Storage': Setting the value exceeded the quota.");
        err.name = 'QuotaExceededError';
        err.code = 22;
        throw err;
      }
      store.set(k, String(v));
    },
    removeItem(k) {
      store.delete(k);
      // Once expendable caches are cleared, simulate storage space being freed
      if (!store.has('v3_hotel_manager_db_v2') && !store.has('v3_revenue_data_v2')) {
        quotaReached = false;
      }
    }
  };
}

test('safeStorage purges expendable caches and retries on QuotaExceededError', () => {
  const mockLocal = createMockStorage({
    'v3_hotel_manager_db_v2': 'huge_db_json',
    'v3_revenue_data_v2': 'huge_rev_json',
    'nexus_user': '{"name":"Test User"}'
  }, true);

  const context = {
    window: {},
    console,
    localStorage: mockLocal,
    sessionStorage: createMockStorage()
  };

  vm.runInNewContext(utilsCode, context);
  const safeStorage = context.window.NexusUtils.safeStorage;

  // Now attempt to write a new key that would otherwise trigger QuotaExceededError
  const success = safeStorage.setItem('nexus_last_import_str', 'Guadiana: 05/11/2026 | Cumbria: 05/11/2026');

  assert.equal(success, true, 'setItem should succeed after freeing space');
  assert.equal(mockLocal.getItem('nexus_last_import_str'), 'Guadiana: 05/11/2026 | Cumbria: 05/11/2026');
  // Critical keys must be preserved
  assert.equal(mockLocal.getItem('nexus_user'), '{"name":"Test User"}');
  // Heavy expendable keys must have been removed
  assert.equal(mockLocal.getItem('v3_hotel_manager_db_v2'), null);
});

test('startup probe clears expendable caches when storage is full on initial page load', () => {
  const mockLocal = createMockStorage({
    'v3_hotel_manager_db_v2': 'huge_db_json',
    'v3_revenue_data_v2': 'huge_rev_json'
  }, true);

  const context = {
    window: {},
    console,
    localStorage: mockLocal,
    sessionStorage: createMockStorage()
  };

  // Running utilsCode will execute probeStorageQuota
  vm.runInNewContext(utilsCode, context);

  // Probe should have cleared expendables immediately on startup
  assert.equal(mockLocal.getItem('v3_hotel_manager_db_v2'), null);
  assert.equal(mockLocal.getItem('v3_revenue_data_v2'), null);
});
