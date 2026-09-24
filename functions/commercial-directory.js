(function (root) {
  'use strict';
  const key = name => String(name || '').trim().normalize('NFKC').toLocaleLowerCase('es');
  function normalize(list) {
    const entries = new Map();
    for (const value of Array.isArray(list) ? list : []) {
      const name = (typeof value === 'string' ? value : typeof value?.name === 'string' ? value.name : '').trim();
      if (!name) continue;
      const id = key(name), active = typeof value === 'string' || (value.active !== false && value.revoked !== true);
      const old = entries.get(id);
      entries.set(id, { uid: 'catalog-' + encodeURIComponent(id), name, active: active && old?.active !== false });
    }
    return [...entries.values()].filter(e => e.active).sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }
  function merge(list, members, mailboxes) {
    const used = new Set();
    const catalog = normalize(list).map(entry => {
      const candidates = members.filter(m => key(m.commercialName || m.name) === key(entry.name));
      if (candidates.length === 1) { used.add(candidates[0].uid); return { ...candidates[0], name: entry.name, pendingAccess: false }; }
      return { uid: entry.uid, name: entry.name, mailboxes, pendingAccess: true };
    });
    // Existing authorized users remain visible; catalog entries never grant mailbox access.
    return [...catalog, ...members.filter(m => !used.has(m.uid))];
  }
  function fromFirestore(document) {
    const values = document?.fields?.system?.mapValue?.fields?.commercials?.arrayValue?.values || [];
    return normalize(values.map(value => {
      if (typeof value.stringValue === 'string') return value.stringValue;
      const fields = value.mapValue?.fields || {};
      return { name: fields.name?.stringValue || '', active: fields.active?.booleanValue !== false, revoked: fields.revoked?.booleanValue === true };
    }));
  }
  const api = { normalize, merge, fromFirestore };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NexusCommercialDirectory = api;
})(typeof window !== 'undefined' ? window : globalThis);
