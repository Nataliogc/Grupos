'use strict';

/**
 * NEXUS VERIFY — Core Antifraude de Transferencias Bancarias
 * ═════════════════════════════════════════════════════════════════════════════
 * - Tokens criptográficamente aleatorios (144 bits de entropía, SHA-256 en BD)
 * - Fuente de verdad bancaria exclusivamente en servidor (Secret Manager)
 * - Firma y verificación de integridad mediante Cloud KMS o HMAC-SHA256
 * - Huella SHA-256 de PDF write-once (inmutable tras sellado)
 * - Aislamiento estricto Guadiana / Cumbria, cero PII pública y rate-limiting
 */

const crypto = require('node:crypto');

const VALID_HOTELS = ['cumbria', 'guadiana'];
const VALID_DOC_TYPES = ['budget', 'proforma'];
const VALID_STATUSES = ['VALID', 'SUPERSEDED', 'REVOKED'];
const ISSUE_ROLES = ['admin', 'direction', 'commercial'];
const REVOKE_ROLES = ['admin', 'direction'];
const SEAL_WINDOW_MS = 10 * 60 * 1000;

function generateVerificationToken() {
  const token = crypto.randomBytes(18).toString('base64url'); // 24 chars, 144-bit entropy
  const displayCode = 'NV-' + token.match(/.{1,4}/g).join('-');
  return { token, displayCode, tokenHash: hashToken(token) };
}

function normalizeTokenInput(raw) {
  if (typeof raw !== 'string') return null;
  let cleaned = raw.trim();
  if (/^NV-/i.test(cleaned)) cleaned = cleaned.slice(3);
  // Allow formatted blocks with hyphens/spaces ONLY if removing them yields 24 base64url chars
  const compact = cleaned.replace(/[\s-]+/g, '');
  if (!/^[A-Za-z0-9_-]{24}$/.test(compact)) {
    // Also accept raw base64url token containing '-' directly
    if (/^[A-Za-z0-9_-]{24}$/.test(cleaned)) return cleaned;
    return null;
  }
  return compact;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token), 'utf8').digest('hex');
}

function hashIp(ip, dailySalt = new Date().toISOString().slice(0, 10)) {
  return crypto.createHash('sha256').update(`${dailySalt}:${String(ip || 'unknown')}`, 'utf8').digest('hex').slice(0, 16);
}

function resolveHotelKey(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s) return null;
  if (s.includes('guadiana')) return 'guadiana';
  if (s.includes('cumbria')) return 'cumbria';
  return null;
}

function maskReference(rawRef) {
  const clean = String(rawRef || '').trim();
  if (!clean) return 'DOC-•••';
  const prefixMatch = clean.match(/^([A-Za-z]{2,6}-)(.+)$/);
  if (prefixMatch) {
    const tail = prefixMatch[2];
    const visible = tail.length > 3 ? tail.slice(-3) : tail.slice(-1);
    return `${prefixMatch[1]}•••${visible}`;
  }
  if (clean.length <= 3) return '••' + clean.slice(-1);
  return '•••' + clean.slice(-3);
}

function parseAmountCents(value) {
  let text = String(value ?? '').trim();
  if (/^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(text)) text = text.replace(/\./g, '');
  text = text.replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return NaN;
  const result = Math.round(Number(text) * 100);
  return Number.isSafeInteger(result) && result > 0 ? result : NaN;
}

function parseBankConfig(rawJson) {
  const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Configuración bancaria de Nexus Verify ausente o inválida.');
  }
  const out = {};
  for (const hotel of VALID_HOTELS) {
    const entry = parsed[hotel];
    if (!entry || typeof entry !== 'object') {
      throw new Error(`Falta configuración bancaria oficial para ${hotel}.`);
    }
    const required = ['hotelName', 'beneficiary', 'bankName', 'ibanOfficial', 'verifyDomain', 'phone'];
    for (const k of required) {
      if (typeof entry[k] !== 'string' || !entry[k].trim()) {
        throw new Error(`Campo bancario obligatorio ausente (${hotel}.${k}).`);
      }
    }
    out[hotel] = {
      hotelName: entry.hotelName.trim(),
      beneficiary: entry.beneficiary.trim(),
      bankName: entry.bankName.trim(),
      ibanOfficial: entry.ibanOfficial.trim(),
      bic: typeof entry.bic === 'string' ? entry.bic.trim() : '',
      verifyDomain: entry.verifyDomain.trim().replace(/\/+$/, ''),
      phone: entry.phone.trim(),
      email: typeof entry.email === 'string' ? entry.email.trim() : ''
    };
  }
  return out;
}

function canonicalIntegrityPayload(record) {
  return JSON.stringify([
    'NEXUS_VERIFY_V1',
    record.tokenHash,
    record.hotel,
    record.docType,
    record.maskedReference,
    record.amountCents,
    record.currency,
    record.beneficiary,
    record.bankName,
    record.ibanOfficial,
    record.pdfSha256 || '',
    record.issuedAt
  ]);
}

function createHmacSigner(secretKey) {
  if (!secretKey || typeof secretKey !== 'string' || secretKey.length < 16) {
    throw new Error('Clave de firma Nexus Verify no configurada.');
  }
  return {
    async sign(payload) {
      return crypto.createHmac('sha256', secretKey).update(payload, 'utf8').digest('base64');
    },
    async verify(payload, mac) {
      if (typeof mac !== 'string' || !mac) return false;
      const expected = crypto.createHmac('sha256', secretKey).update(payload, 'utf8').digest('base64');
      const a = Buffer.from(expected, 'utf8');
      const b = Buffer.from(mac, 'utf8');
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    }
  };
}

function createKmsSigner(kmsCryptoKeyVersionName, getAccessToken) {
  if (!kmsCryptoKeyVersionName) {
    throw new Error('Falta identificador de clave Cloud KMS para Nexus Verify.');
  }
  const baseUrl = `https://cloudkms.googleapis.com/v1/${kmsCryptoKeyVersionName}`;
  return {
    async sign(payload) {
      const token = await getAccessToken();
      const res = await fetch(`${baseUrl}:macSign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: Buffer.from(payload, 'utf8').toString('base64') })
      });
      if (!res.ok) throw new Error(`KMS macSign HTTP ${res.status}`);
      const json = await res.json();
      if (!json.mac) throw new Error('KMS macSign sin firma');
      return json.mac;
    },
    async verify(payload, mac) {
      if (typeof mac !== 'string' || !mac) return false;
      const token = await getAccessToken();
      const res = await fetch(`${baseUrl}:macVerify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: Buffer.from(payload, 'utf8').toString('base64'), mac })
      });
      if (!res.ok) throw new Error(`KMS macVerify HTTP ${res.status}`);
      const json = await res.json();
      return json.success === true;
    }
  };
}

function createMemoryRateLimiter({ maxRequests = 20, windowMs = 60000 } = {}) {
  const buckets = new Map();
  return {
    check(key, nowMs = Date.now()) {
      const entry = buckets.get(key);
      if (!entry || nowMs >= entry.resetAt) {
        buckets.set(key, { count: 1, resetAt: nowMs + windowMs });
        return { allowed: true, remaining: maxRequests - 1 };
      }
      if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0, retryAfterSec: Math.ceil((entry.resetAt - nowMs) / 1000) };
      }
      entry.count += 1;
      return { allowed: true, remaining: maxRequests - entry.count };
    },
    reset() {
      buckets.clear();
    }
  };
}

function buildPublicResponse(record) {
  return {
    status: record.status,
    hotel: record.hotel,
    hotelName: record.hotelName,
    beneficiary: record.beneficiary,
    bankName: record.bankName,
    ibanOfficial: record.ibanOfficial,
    bic: record.bic || '',
    verifyDomain: record.verifyDomain,
    phone: record.phone,
    docType: record.docType,
    maskedReference: record.maskedReference,
    amountEuros: Number((record.amountCents / 100).toFixed(2)),
    currency: record.currency || 'EUR',
    issuedAt: record.issuedAt,
    pdfSha256: record.pdfSha256 || null,
    revokedAt: record.revokedAt || null,
    revokeReason: record.status === 'REVOKED' ? (record.revokeReason || 'Documento revocado por el hotel.') : null
  };
}

function makeError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

function createVerifyHandlers({
  db,
  auth,
  getBankConfig,
  getSigner,
  rateLimiter = createMemoryRateLimiter(),
  now = () => new Date()
}) {
  async function writeAudit(entry) {
    try {
      await db.collection('verify_audit_logs').doc().set({
        ...entry,
        timestamp: now().toISOString()
      });
    } catch (_) {
      // No bloquear respuesta segura si falla el log secundario
    }
  }

  async function requireAuthorizedStaff(authContext, allowedRoles, requiredHotel = null) {
    if (!authContext?.uid) throw makeError('unauthenticated', 'Identificación obligatoria.');
    const email = String(authContext.token?.email || '').trim().toLowerCase();
    if (email === 'demo@hotel.com') throw makeError('permission-denied', 'Cuenta bloqueada.');
    const snap = await db.collection('access_members').doc(authContext.uid).get();
    const member = snap.exists ? snap.data() : null;
    if (!member || member.active !== true || !allowedRoles.includes(member.role)) {
      throw makeError('permission-denied', 'Sin permiso para operar Nexus Verify.');
    }
    if (auth && typeof auth.getUser === 'function') {
      const record = await auth.getUser(authContext.uid);
      if (record.disabled || String(record.email || '').toLowerCase() === 'demo@hotel.com') {
        throw makeError('permission-denied', 'Cuenta inhabilitada.');
      }
      if (record.tokensValidAfterTime && authContext.token?.auth_time) {
        const validAfterMs = Date.parse(record.tokensValidAfterTime);
        if (Number.isFinite(validAfterMs) && Number(authContext.token.auth_time) * 1000 < validAfterMs) {
          throw makeError('unauthenticated', 'Sesión revocada.');
        }
      }
    }
    const hotels = Array.isArray(member.hotels) ? member.hotels : [];
    if (requiredHotel && !hotels.includes(requiredHotel)) {
      throw makeError('permission-denied', 'Sin acceso autorizado a este hotel.');
    }
    return { uid: authContext.uid, member, hotels };
  }

  async function issue(authContext, data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw makeError('invalid-argument', 'Solicitud incorrecta.');
    }
    // Reject any attempt to inject client-supplied bank details
    if (data.iban !== undefined || data.ibanOfficial !== undefined || data.beneficiary !== undefined) {
      throw makeError('invalid-argument', 'Los datos bancarios solo se resuelven desde el servidor.');
    }
    const groupDocId = String(data.groupDocId || '').trim();
    const docType = String(data.docType || '').trim().toLowerCase();
    if (!groupDocId || groupDocId.includes('/') || groupDocId.length > 150) {
      throw makeError('invalid-argument', 'Identificador de documento no válido.');
    }
    if (!VALID_DOC_TYPES.includes(docType)) {
      throw makeError('invalid-argument', 'Tipo de documento no válido.');
    }

    const groupSnap = await db.collection('groups').doc(groupDocId).get();
    if (!groupSnap.exists) {
      throw makeError('not-found', 'Documento de grupo no encontrado.');
    }
    const group = groupSnap.data();
    const hotel = resolveHotelKey(group.Hotel_Asignado || group.Hotel);
    if (!hotel) {
      throw makeError('failed-precondition', 'El documento no tiene un hotel válido asignado.');
    }

    // Proformas on confirmed reservations require admin/direction; budgets allow commercial too
    const isQuote = typeof group.Reserva === 'string' && /^PRES-/i.test(group.Reserva);
    const allowedRoles = (docType === 'proforma' && !isQuote) ? REVOKE_ROLES : ISSUE_ROLES;
    const actor = await requireAuthorizedStaff(authContext, allowedRoles, hotel);

    const serverAmountCents = parseAmountCents(
      group.Com_Total ?? group.Total ?? group.total ?? group['Importe(*)']
    );
    if (!Number.isSafeInteger(serverAmountCents) || serverAmountCents <= 0) {
      throw makeError('failed-precondition', 'El documento no tiene un importe válido registrado.');
    }
    if (data.expectedAmountEuros !== undefined) {
      const clientCents = parseAmountCents(data.expectedAmountEuros);
      if (clientCents !== serverAmountCents) {
        throw makeError('failed-precondition', 'El importe no coincide con el registrado en el servidor.');
      }
    }

    const bankConfig = parseBankConfig(await getBankConfig());
    const bank = bankConfig[hotel];
    const signer = await getSigner();

    let pdfSha256 = null;
    if (data.pdfSha256 !== undefined && data.pdfSha256 !== null && data.pdfSha256 !== '') {
      if (typeof data.pdfSha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(data.pdfSha256)) {
        throw makeError('invalid-argument', 'Huella SHA-256 de PDF no válida.');
      }
      pdfSha256 = data.pdfSha256.toLowerCase();
    }

    const { token, displayCode, tokenHash } = generateVerificationToken();
    const issuedAt = now().toISOString();
    const maskedReference = maskReference(group.Reserva || groupDocId);

    // Mark previous VALID verifications for the same groupDocId + docType as SUPERSEDED
    const prevSnap = await db.collection('verify_documents')
      .where('groupDocId', '==', groupDocId)
      .where('docType', '==', docType)
      .where('status', '==', 'VALID')
      .get();

    let nextVersion = 1;
    for (const prev of (prevSnap.docs || [])) {
      const prevData = prev.data();
      if (typeof prevData.version === 'number' && prevData.version >= nextVersion) {
        nextVersion = prevData.version + 1;
      }
      await prev.ref.update({
        status: 'SUPERSEDED',
        supersededAt: issuedAt,
        supersededByHash: tokenHash
      });
      await writeAudit({
        eventType: 'SUPERSEDE',
        tokenHash: prev.id,
        hotel,
        actorUid: actor.uid,
        result: 'ok'
      });
    }

    const record = {
      tokenHash,
      hotel,
      hotelName: bank.hotelName,
      groupDocId,
      docType,
      maskedReference,
      amountCents: serverAmountCents,
      currency: 'EUR',
      beneficiary: bank.beneficiary,
      bankName: bank.bankName,
      ibanOfficial: bank.ibanOfficial,
      bic: bank.bic,
      verifyDomain: bank.verifyDomain,
      phone: bank.phone,
      pdfSha256,
      status: 'VALID',
      version: nextVersion,
      issuedAt,
      issuedByUid: actor.uid,
      revokedAt: null,
      revokedByUid: null,
      revokeReason: null
    };
    record.integrityMac = await signer.sign(canonicalIntegrityPayload(record));

    await db.collection('verify_documents').doc(tokenHash).set(record);
    await writeAudit({
      eventType: 'ISSUE',
      tokenHash,
      hotel,
      actorUid: actor.uid,
      docType,
      version: nextVersion,
      result: 'ok'
    });

    return {
      ok: true,
      token,
      displayCode,
      verifyUrl: `${bank.verifyDomain}/v/${token}`,
      officialIbanUrl: `${bank.verifyDomain}/iban-oficial`,
      hotel,
      hotelName: bank.hotelName,
      beneficiary: bank.beneficiary,
      bankName: bank.bankName,
      ibanOfficial: bank.ibanOfficial,
      maskedReference,
      amountEuros: Number((serverAmountCents / 100).toFixed(2)),
      issuedAt,
      pdfSha256,
      version: nextVersion
    };
  }

  async function sealPdf(authContext, data) {
    if (!data || typeof data !== 'object') throw makeError('invalid-argument', 'Solicitud incorrecta.');
    const token = normalizeTokenInput(data.token);
    const pdfSha256 = typeof data.pdfSha256 === 'string' ? data.pdfSha256.trim().toLowerCase() : '';
    if (!token || !/^[a-f0-9]{64}$/.test(pdfSha256)) {
      throw makeError('invalid-argument', 'Token o huella SHA-256 inválidos.');
    }
    const tokenHash = hashToken(token);
    const ref = db.collection('verify_documents').doc(tokenHash);
    const snap = await ref.get();
    if (!snap.exists) throw makeError('not-found', 'Registro de verificación no encontrado.');
    const record = snap.data();

    const actor = await requireAuthorizedStaff(authContext, ISSUE_ROLES, record.hotel);
    if (record.issuedByUid !== actor.uid && actor.member.role !== 'admin') {
      throw makeError('permission-denied', 'Solo el emisor o administrador puede sellar el PDF.');
    }
    if (record.status !== 'VALID') {
      throw makeError('failed-precondition', 'No se puede sellar un documento que no está vigente.');
    }
    if (record.pdfSha256) {
      throw makeError('already-exists', 'La huella SHA-256 del PDF ya fue sellada y es inmutable.');
    }
    if (now().getTime() - Date.parse(record.issuedAt) > SEAL_WINDOW_MS) {
      throw makeError('deadline-exceeded', 'Ventana de sellado expirada; emita una nueva verificación.');
    }

    const updated = { ...record, pdfSha256 };
    const signer = await getSigner();
    updated.integrityMac = await signer.sign(canonicalIntegrityPayload(updated));

    await ref.update({ pdfSha256, integrityMac: updated.integrityMac });
    await writeAudit({ eventType: 'SEAL_PDF', tokenHash, hotel: record.hotel, actorUid: actor.uid, result: 'ok' });
    return { ok: true, pdfSha256 };
  }

  async function revoke(authContext, data) {
    if (!data || typeof data !== 'object') throw makeError('invalid-argument', 'Solicitud incorrecta.');
    const token = normalizeTokenInput(data.token);
    const tokenHash = token ? hashToken(token) : (typeof data.tokenHash === 'string' && /^[a-f0-9]{64}$/.test(data.tokenHash) ? data.tokenHash : null);
    if (!tokenHash) throw makeError('invalid-argument', 'Identificador de verificación no válido.');
    const reason = String(data.reason || 'Revocado por administración del hotel.').trim().slice(0, 240);

    const ref = db.collection('verify_documents').doc(tokenHash);
    const snap = await ref.get();
    if (!snap.exists) throw makeError('not-found', 'Documento de verificación no encontrado.');
    const record = snap.data();

    const actor = await requireAuthorizedStaff(authContext, REVOKE_ROLES, record.hotel);
    const revokedAt = now().toISOString();
    await ref.update({
      status: 'REVOKED',
      revokedAt,
      revokedByUid: actor.uid,
      revokeReason: reason
    });
    await writeAudit({
      eventType: 'REVOKE',
      tokenHash,
      hotel: record.hotel,
      actorUid: actor.uid,
      result: 'ok'
    });
    return { ok: true, status: 'REVOKED', revokedAt };
  }

  async function lookup({ rawToken, clientIp = 'unknown' }) {
    const ipHash = hashIp(clientIp, now().toISOString().slice(0, 10));
    const rl = rateLimiter.check(ipHash, now().getTime());
    if (!rl.allowed) {
      await writeAudit({ eventType: 'LOOKUP_RATE_LIMITED', ipHash, result: '429' });
      return {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSec || 60) },
        body: { ok: false, code: 'RATE_LIMITED', error: 'Demasiadas consultas. Espere un momento antes de reintentar.' }
      };
    }

    const token = normalizeTokenInput(rawToken);
    if (!token) {
      await writeAudit({ eventType: 'LOOKUP_MISS', ipHash, result: '400' });
      return {
        status: 400,
        body: { ok: false, code: 'INVALID_CODE', error: 'El formato del código de verificación no es válido.' }
      };
    }

    const tokenHash = hashToken(token);
    try {
      const snap = await db.collection('verify_documents').doc(tokenHash).get();
      if (!snap.exists) {
        await writeAudit({ eventType: 'LOOKUP_MISS', tokenHash, ipHash, result: '404' });
        return {
          status: 404,
          body: { ok: false, code: 'NOT_FOUND', error: 'Código de verificación no encontrado. No realice ninguna transferencia sin confirmar con el hotel.' }
        };
      }
      const record = snap.data();
      const signer = await getSigner();
      const validMac = await signer.verify(canonicalIntegrityPayload(record), record.integrityMac);
      if (!validMac) {
        await writeAudit({ eventType: 'INTEGRITY_FAILURE', tokenHash, hotel: record.hotel, ipHash, result: '409' });
        return {
          status: 409,
          body: { ok: false, code: 'INTEGRITY_ALERT', error: 'Alerta de integridad del registro. No realice ninguna transferencia y contacte telefónicamente con el hotel.' }
        };
      }

      // Cross-check against live server bank config so a tampered record can never display a non-official IBAN
      const bankConfig = parseBankConfig(await getBankConfig());
      const official = bankConfig[record.hotel];
      if (!official || official.ibanOfficial !== record.ibanOfficial || official.beneficiary !== record.beneficiary) {
        await writeAudit({ eventType: 'INTEGRITY_FAILURE', tokenHash, hotel: record.hotel, ipHash, result: '409_BANK_MISMATCH' });
        return {
          status: 409,
          body: { ok: false, code: 'BANK_MISMATCH', error: 'Los datos bancarios no coinciden con la cuenta oficial vigente. No realice la transferencia sin confirmar por teléfono.' }
        };
      }

      await writeAudit({ eventType: 'LOOKUP_OK', tokenHash, hotel: record.hotel, ipHash, result: record.status });
      return { status: 200, body: { ok: true, document: buildPublicResponse(record) } };
    } catch (err) {
      return {
        status: 503,
        body: { ok: false, code: 'SERVICE_UNAVAILABLE', error: 'Servicio de verificación temporalmente no disponible. Confirme el IBAN telefónicamente con el hotel antes de transferir.' }
      };
    }
  }

  async function officialIbans({ clientIp = 'unknown' }) {
    const ipHash = hashIp(clientIp, now().toISOString().slice(0, 10));
    const rl = rateLimiter.check('iban:' + ipHash, now().getTime());
    if (!rl.allowed) {
      return { status: 429, body: { ok: false, code: 'RATE_LIMITED', error: 'Demasiadas consultas.' } };
    }
    try {
      const bankConfig = parseBankConfig(await getBankConfig());
      return {
        status: 200,
        body: {
          ok: true,
          hotels: {
            guadiana: bankConfig.guadiana,
            cumbria: bankConfig.cumbria
          }
        }
      };
    } catch (_) {
      return {
        status: 503,
        body: { ok: false, code: 'SERVICE_UNAVAILABLE', error: 'Información bancaria temporalmente no disponible.' }
      };
    }
  }

  return { issue, sealPdf, revoke, lookup, officialIbans };
}

module.exports = {
  VALID_HOTELS,
  VALID_DOC_TYPES,
  VALID_STATUSES,
  generateVerificationToken,
  normalizeTokenInput,
  hashToken,
  hashIp,
  resolveHotelKey,
  maskReference,
  parseAmountCents,
  parseBankConfig,
  canonicalIntegrityPayload,
  createHmacSigner,
  createKmsSigner,
  createMemoryRateLimiter,
  buildPublicResponse,
  createVerifyHandlers
};
