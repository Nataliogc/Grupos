'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  createVerifyHandlers,
  createHmacSigner,
  createMemoryRateLimiter,
  hashToken
} = require('../functions/nexus-verify-core');
const NexusVerifyService = require('../js/services/nexusVerifyService');

// Datos estrictamente ficticios para pruebas locales (nunca IBANs reales)
const FICTITIOUS_BANK_CONFIG = {
  guadiana: {
    hotelName: 'Sercotel Guadiana (TEST)',
    beneficiary: 'HOTEL GUADIANA TEST S.L.',
    bankName: 'Banco Prueba Guadiana',
    ibanOfficial: 'ES00 0000 0000 0000 0000 0001',
    bic: 'TESTESMMXXX',
    verifyDomain: 'https://verificar.hotelguadiana.es',
    phone: '+34 900 000 001'
  },
  cumbria: {
    hotelName: 'Cumbria Spa & Hotel (TEST)',
    beneficiary: 'HOTEL CUMBRIA TEST S.L.',
    bankName: 'Banco Prueba Cumbria',
    ibanOfficial: 'ES00 0000 0000 0000 0000 0002',
    bic: 'TESTESMMYYY',
    verifyDomain: 'https://verificar.hotelcumbria.es',
    phone: '+34 900 000 002'
  }
};

function createFakeDb(seed = {}) {
  const collections = new Map();
  for (const [colName, docs] of Object.entries(seed)) {
    const colMap = new Map();
    for (const [docId, data] of Object.entries(docs)) {
      colMap.set(docId, JSON.parse(JSON.stringify(data)));
    }
    collections.set(colName, colMap);
  }

  function getCol(name) {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name);
  }

  let autoId = 1;

  function makeDocRef(colName, docId) {
    return {
      id: docId,
      async get() {
        const col = getCol(colName);
        if (!col.has(docId)) return { exists: false, id: docId, data: () => undefined, ref: makeDocRef(colName, docId) };
        const snapData = JSON.parse(JSON.stringify(col.get(docId)));
        return { exists: true, id: docId, data: () => snapData, ref: makeDocRef(colName, docId) };
      },
      async set(val) {
        getCol(colName).set(docId, JSON.parse(JSON.stringify(val)));
      },
      async update(patch) {
        const col = getCol(colName);
        if (!col.has(docId)) throw new Error('NOT_FOUND');
        const cur = col.get(docId);
        col.set(docId, Object.assign({}, cur, JSON.parse(JSON.stringify(patch))));
      }
    };
  }

  function makeQuery(colName, filters = []) {
    return {
      where(field, op, value) {
        return makeQuery(colName, filters.concat([{ field, op, value }]));
      },
      async get() {
        const col = getCol(colName);
        const docs = [];
        for (const [docId, raw] of col.entries()) {
          const match = filters.every(f => f.op === '==' && raw[f.field] === f.value);
          if (match) {
            const snapData = JSON.parse(JSON.stringify(raw));
            docs.push({ id: docId, exists: true, data: () => snapData, ref: makeDocRef(colName, docId) });
          }
        }
        return { docs, empty: docs.length === 0, size: docs.length };
      }
    };
  }

  return {
    _raw: collections,
    collection(name) {
      return {
        doc(id) { return makeDocRef(name, id); },
        where(field, op, value) { return makeQuery(name, [{ field, op, value }]); },
        async add(data) {
          const id = `auto_${autoId++}`;
          getCol(name).set(id, JSON.parse(JSON.stringify(data)));
          return makeDocRef(name, id);
        }
      };
    }
  };
}

function createHarness(opts = {}) {
  const db = createFakeDb({
    access_members: {
      'uid-admin': { active: true, role: 'admin', hotels: ['guadiana', 'cumbria'] },
      'uid-gua': { active: true, role: 'commercial', hotels: ['guadiana'] },
      'uid-cum': { active: true, role: 'commercial', hotels: ['cumbria'] },
      'uid-inactive': { active: false, role: 'commercial', hotels: ['guadiana'] }
    },
    groups: {
      'GRP-GUA-01': {
        Reserva: '2026-00412',
        'Nombre del Grupo': 'Congreso Médico Ficticio',
        Hotel_Asignado: 'Sercotel Guadiana',
        Com_Total: 4250.5,
        Cliente_Email: 'privado.cliente@ejemplo.test',
        Cliente_Telefono: '+34 600 123 456'
      },
      'GRP-CUM-01': {
        Reserva: '2026-00988',
        'Nombre del Grupo': 'Equipo Deportivo Ficticio',
        Hotel_Asignado: 'Cumbria Spa&Hotel',
        Com_Total: 3100.0,
        Cliente_Email: 'equipo@ejemplo.test'
      }
    }
  });

  const signer = opts.signer || createHmacSigner('test-only-hmac-key-do-not-use-in-production-32bytes!');
  const rateLimiter = createMemoryRateLimiter({ max: opts.rateLimitMax || 5, windowMs: 60_000 });
  const handlers = createVerifyHandlers({
    db,
    getBankConfig: opts.getBankConfig || (async () => FICTITIOUS_BANK_CONFIG),
    getSigner: opts.getSigner || (async () => signer),
    rateLimiter,
    now: () => new Date('2026-11-23T10:00:00.000Z')
  });

  return { db, handlers, signer };
}

// ── PRUEBA 1: Documento auténtico + generación PDF binario (Opción A) + sellado SHA-256 ──
test('1. Documento auténtico: emisión, PDF binario Opción A, sellado SHA-256 y consulta pública sin PII', async () => {
  const { handlers } = createHarness();
  const issued = await handlers.issue({ uid: 'uid-gua' }, {
    groupDocId: 'GRP-GUA-01',
    docType: 'proforma',
    expectedAmountEuros: 4250.5
  });

  assert.equal(issued.ok, true);
  assert.match(issued.displayCode, /^NV-/);
  assert.equal(issued.ibanOfficial, FICTITIOUS_BANK_CONFIG.guadiana.ibanOfficial);
  assert.equal(issued.verifyUrl, `https://verificar.hotelguadiana.es/v/${issued.token}`);
  assert.equal(issued.officialIbanUrl, 'https://verificar.hotelguadiana.es/iban-oficial');

  // Generar PDF binario inmutable y sellar SHA-256 (write-once)
  const pdfBytes = NexusVerifyService.buildVerifiedPdfBytes({
    docType: 'proforma',
    reference: '2026-00412',
    groupName: 'Congreso Médico Ficticio',
    stayDates: '10/12/2026 a 12/12/2026',
    items: [{ description: 'Alojamiento 25 hab. dobles', amountText: '4.250,50 EUR' }]
  }, issued);
  assert.equal(Buffer.from(pdfBytes.slice(0, 8)).toString('ascii'), '%PDF-1.4');

  const pdfSha256 = await NexusVerifyService.computeSha256Hex(pdfBytes);
  assert.match(pdfSha256, /^[a-f0-9]{64}$/);

  const sealed = await handlers.sealPdf({ uid: 'uid-gua' }, { token: issued.token, pdfSha256 });
  assert.equal(sealed.ok, true);

  // Segundo sellado debe rechazarse (write-once)
  await assert.rejects(
    handlers.sealPdf({ uid: 'uid-gua' }, { token: issued.token, pdfSha256: 'a'.repeat(64) }),
    /ya está sellada/i
  );

  // Consulta pública
  const lookup = await handlers.lookup({ rawToken: issued.token, clientIp: '198.51.100.10' });
  assert.equal(lookup.status, 200);
  assert.equal(lookup.body.ok, true);
  assert.equal(lookup.body.document.status, 'VALID');
  assert.equal(lookup.body.document.ibanOfficial, FICTITIOUS_BANK_CONFIG.guadiana.ibanOfficial);
  assert.equal(lookup.body.document.pdfSha256, pdfSha256);
  assert.equal(lookup.body.document.amountEuros, 4250.5);

  // Cero PII en la respuesta pública
  const serialized = JSON.stringify(lookup.body);
  assert.equal(serialized.includes('privado.cliente@ejemplo.test'), false);
  assert.equal(serialized.includes('+34 600 123 456'), false);
  assert.equal(serialized.includes('Congreso Médico Ficticio'), false);
});

// ── PRUEBA 2: IBAN manipulado (cliente rechazado + manipulación en BD detectada) ──
test('2. IBAN manipulado: el cliente no puede inyectar IBAN y cualquier alteración en BD falla integridad', async () => {
  const { db, handlers } = createHarness();

  // 2a. Cliente intenta inyectar IBAN/beneficiario arbitrario -> rechazado
  await assert.rejects(
    handlers.issue({ uid: 'uid-gua' }, {
      groupDocId: 'GRP-GUA-01',
      docType: 'proforma',
      iban: 'ES99 9999 9999 9999 9999 9999'
    }),
    /no está permitido/i
  );

  // 2b. Emisión legítima seguida de alteración maliciosa del IBAN directamente en Firestore -> 409 INTEGRITY_ALERT
  const issued = await handlers.issue({ uid: 'uid-gua' }, { groupDocId: 'GRP-GUA-01', docType: 'proforma' });
  const tHash = hashToken(issued.token);
  await db.collection('verify_documents').doc(tHash).update({
    ibanOfficial: 'ES99 1111 2222 3333 4444 5555'
  });

  const lookup = await handlers.lookup({ rawToken: issued.token, clientIp: '198.51.100.11' });
  assert.equal(lookup.status, 409);
  assert.equal(lookup.body.code, 'INTEGRITY_ALERT');
});

// ── PRUEBA 3: PDF sustituido por otro (1 byte modificado -> SHA-256 distinto) ──
test('3. PDF sustituido por otro: alterar 1 solo byte invalida la huella SHA-256', async () => {
  const { handlers } = createHarness();
  const issued = await handlers.issue({ uid: 'uid-gua' }, { groupDocId: 'GRP-GUA-01', docType: 'budget' });
  const originalPdf = NexusVerifyService.buildVerifiedPdfBytes({
    docType: 'budget',
    reference: '2026-00412',
    groupName: 'Congreso Médico Ficticio'
  }, issued);
  const originalHash = await NexusVerifyService.computeSha256Hex(originalPdf);
  await handlers.sealPdf({ uid: 'uid-gua' }, { token: issued.token, pdfSha256: originalHash });

  // Atacante modifica 1 byte del PDF
  const tamperedPdf = new Uint8Array(originalPdf);
  tamperedPdf[tamperedPdf.length - 10] ^= 0x01;
  const tamperedHash = await NexusVerifyService.computeSha256Hex(tamperedPdf);

  const lookup = await handlers.lookup({ rawToken: issued.token, clientIp: '198.51.100.12' });
  assert.equal(lookup.status, 200);
  assert.equal(lookup.body.document.pdfSha256, originalHash);
  assert.notEqual(tamperedHash, lookup.body.document.pdfSha256);
});

// ── PRUEBA 4: QR falsificado / código inventado ──
test('4. QR falsificado: un código inventado devuelve 404 sin filtrar datos ni permitir enumeración', async () => {
  const { handlers } = createHarness();
  const fakeToken = crypto.randomBytes(18).toString('base64url');
  const res = await handlers.lookup({ rawToken: fakeToken, clientIp: '198.51.100.13' });
  assert.equal(res.status, 404);
  assert.equal(res.body.code, 'NOT_FOUND');
  assert.equal(res.body.document, undefined);
});

// ── PRUEBA 5: Documento revocado ──
test('5. Documento revocado: pasa a REVOKED, registra auditoría y la consulta pública lo alerta', async () => {
  const { db, handlers } = createHarness();
  const issued = await handlers.issue({ uid: 'uid-gua' }, { groupDocId: 'GRP-GUA-01', docType: 'proforma' });

  const rev = await handlers.revoke({ uid: 'uid-admin' }, {
    token: issued.token,
    reason: 'Anulado por modificación de condiciones'
  });
  assert.equal(rev.ok, true);
  assert.equal(rev.status, 'REVOKED');

  const lookup = await handlers.lookup({ rawToken: issued.token, clientIp: '198.51.100.14' });
  assert.equal(lookup.status, 200);
  assert.equal(lookup.body.document.status, 'REVOKED');

  const logs = Array.from(db._raw.get('verify_audit_logs').values());
  assert.ok(logs.some(l => l.eventType === 'REVOKE' && l.result === 'ok'));
});

// ── PRUEBA 6: Identificador inexistente o malformado ──
test('6. Identificador inexistente o malformado: 400 INVALID_CODE para secuencias consecutivas y formatos inválidos', async () => {
  const { handlers } = createHarness({ rateLimitMax: 20 });
  for (const bad of ['', '12345', '2026-00412', '../etc/passwd', 'NV-SHORT']) {
    const r = await handlers.lookup({ rawToken: bad, clientIp: '198.51.100.15' });
    assert.equal(r.status, 400);
    assert.equal(r.body.code, 'INVALID_CODE');
  }
});

// ── PRUEBA 7: Acceso automatizado abusivo (rate limiting + auditoría) ──
test('7. Acceso automatizado abusivo: superar el límite por IP devuelve 429 RATE_LIMITED y queda auditado', async () => {
  const { db, handlers } = createHarness({ rateLimitMax: 3 });
  const fakeToken = crypto.randomBytes(18).toString('base64url');
  for (let i = 0; i < 3; i++) {
    const r = await handlers.lookup({ rawToken: fakeToken, clientIp: '203.0.113.50' });
    assert.equal(r.status, 404);
  }
  const blocked = await handlers.lookup({ rawToken: fakeToken, clientIp: '203.0.113.50' });
  assert.equal(blocked.status, 429);
  assert.equal(blocked.body.code, 'RATE_LIMITED');

  const logs = Array.from(db._raw.get('verify_audit_logs').values());
  assert.ok(logs.some(l => l.eventType === 'LOOKUP_RATE_LIMITED'));
});

// ── PRUEBA 8: Separación estricta entre Guadiana y Cumbria ──
test('8. Separación entre hoteles: un comercial de Cumbria no puede emitir ni revocar documentos de Guadiana y los IBAN no se cruzan', async () => {
  const { handlers } = createHarness();

  // Comercial solo Cumbria intenta emitir documento de Guadiana -> permission-denied
  await assert.rejects(
    handlers.issue({ uid: 'uid-cum' }, { groupDocId: 'GRP-GUA-01', docType: 'proforma' }),
    /No tienes permiso para este hotel/i
  );

  // Emisiones legítimas separadas
  const gua = await handlers.issue({ uid: 'uid-gua' }, { groupDocId: 'GRP-GUA-01', docType: 'proforma' });
  const cum = await handlers.issue({ uid: 'uid-cum' }, { groupDocId: 'GRP-CUM-01', docType: 'proforma' });
  assert.equal(gua.hotel, 'guadiana');
  assert.equal(cum.hotel, 'cumbria');
  assert.equal(gua.ibanOfficial, FICTITIOUS_BANK_CONFIG.guadiana.ibanOfficial);
  assert.equal(cum.ibanOfficial, FICTITIOUS_BANK_CONFIG.cumbria.ibanOfficial);
  assert.notEqual(gua.ibanOfficial, cum.ibanOfficial);

  // Comercial solo Cumbria intenta revocar documento de Guadiana -> permission-denied
  await assert.rejects(
    handlers.revoke({ uid: 'uid-cum' }, { token: gua.token, reason: 'Intento cruzado' }),
    /No tienes permiso para este hotel/i
  );

  // Consulta de IBAN oficial independiente
  const official = await handlers.officialIbans({ clientIp: '198.51.100.18' });
  assert.equal(official.status, 200);
  assert.equal(official.body.hotels.guadiana.ibanOfficial, FICTITIOUS_BANK_CONFIG.guadiana.ibanOfficial);
  assert.equal(official.body.hotels.cumbria.ibanOfficial, FICTITIOUS_BANK_CONFIG.cumbria.ibanOfficial);
  assert.notEqual(official.body.hotels.guadiana.ibanOfficial, official.body.hotels.cumbria.ibanOfficial);
});

// ── PRUEBA 9: Modificación posterior de importe o beneficiario ──
test('9. Modificación posterior de importe o beneficiario: reemisión marca SUPERSEDED y alteración en BD invalida MAC', async () => {
  const { db, handlers } = createHarness();
  const v1 = await handlers.issue({ uid: 'uid-gua' }, { groupDocId: 'GRP-GUA-01', docType: 'proforma' });

  // Cambia importe en el grupo y se emite v2 -> v1 pasa a SUPERSEDED
  await db.collection('groups').doc('GRP-GUA-01').update({ Com_Total: 4900.0 });
  const v2 = await handlers.issue({ uid: 'uid-gua' }, { groupDocId: 'GRP-GUA-01', docType: 'proforma' });
  assert.equal(v2.version, 2);

  const checkV1 = await handlers.lookup({ rawToken: v1.token, clientIp: '198.51.100.19' });
  assert.equal(checkV1.status, 200);
  assert.equal(checkV1.body.document.status, 'SUPERSEDED');

  // Alteración directa de importe o beneficiario en v2 -> 409 INTEGRITY_ALERT
  const v2Hash = hashToken(v2.token);
  await db.collection('verify_documents').doc(v2Hash).update({
    amountCents: 100,
    beneficiary: 'ATACANTE S.L.'
  });
  const checkV2 = await handlers.lookup({ rawToken: v2.token, clientIp: '198.51.100.20' });
  assert.equal(checkV2.status, 409);
  assert.equal(checkV2.body.code, 'INTEGRITY_ALERT');
});

// ── PRUEBA 10: Fallo o indisponibilidad del servicio / KMS ──
test('10. Fallo o indisponibilidad de KMS/configuración: devuelve 503 seguro y nunca falso positivo', async () => {
  const base = createHarness();
  const issued = await base.handlers.issue({ uid: 'uid-gua' }, { groupDocId: 'GRP-GUA-01', docType: 'proforma' });

  const failingLookupHandlers = createVerifyHandlers({
    db: base.db,
    getBankConfig: async () => FICTITIOUS_BANK_CONFIG,
    getSigner: async () => { throw new Error('KMS_UNAVAILABLE'); },
    rateLimiter: createMemoryRateLimiter({ max: 10, windowMs: 60_000 })
  });

  const res = await failingLookupHandlers.lookup({ rawToken: issued.token, clientIp: '198.51.100.21' });
  assert.equal(res.status, 503);
  assert.equal(res.body.code, 'SERVICE_UNAVAILABLE');
  assert.equal(res.body.document, undefined);

  // Emisión con KMS caído también falla de forma segura
  await assert.rejects(
    failingLookupHandlers.issue({ uid: 'uid-gua' }, { groupDocId: 'GRP-GUA-01', docType: 'proforma' }),
    /KMS_UNAVAILABLE/
  );
});

// ── COMPROBACIÓN DE SEGURIDAD DE DESPLIEGUE Y SINTAXIS DEL PORTAL ──
test('Seguridad de manifiesto y portal: NEXUS_VERIFY_ENABLED=false no expone funciones y verify-portal/verify.js compila', () => {
  const prev = process.env.NEXUS_VERIFY_ENABLED;
  delete process.env.NEXUS_VERIFY_ENABLED;
  delete require.cache[require.resolve('../functions/index.js')];
  const exported = require('../functions/index.js');
  assert.equal(exported.nexusVerifyIssue, undefined);
  assert.equal(exported.nexusVerifyLookup, undefined);
  if (prev !== undefined) process.env.NEXUS_VERIFY_ENABLED = prev;

  const portalJs = fs.readFileSync(path.join(__dirname, '..', 'verify-portal', 'verify.js'), 'utf8');
  assert.doesNotThrow(() => new Function(portalJs));
});
