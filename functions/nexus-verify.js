'use strict';

/**
 * NEXUS VERIFY — Cloud Functions v2 (Emisión, Sellado PDF, Revocación y Consulta Pública)
 * ═════════════════════════════════════════════════════════════════════════════
 * Cargado condicionalmente en functions/index.js cuando NEXUS_VERIFY_ENABLED=true,
 * garantizando que nunca bloquea despliegues selectivos de otras funciones.
 */

const admin = require('firebase-admin');
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const {
  createVerifyHandlers,
  createHmacSigner,
  createKmsSigner,
  createMemoryRateLimiter
} = require('./nexus-verify-core');

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

const bankConfigSecret = defineSecret('NEXUS_VERIFY_BANK_CONFIG');
const signingSecret = defineSecret('NEXUS_VERIFY_SIGNING_SECRET');

const callOptions = { region: 'us-central1', secrets: [bankConfigSecret, signingSecret] };
const lookupOptions = {
  region: 'us-central1',
  cors: true,
  invoker: 'public',
  maxInstances: 10,
  secrets: [bankConfigSecret, signingSecret]
};

const rateLimiter = createMemoryRateLimiter({ maxRequests: 20, windowMs: 60000 });

async function getAccessTokenFromMetadata() {
  const credential = admin.app().options.credential;
  if (credential && typeof credential.getAccessToken === 'function') {
    const t = await credential.getAccessToken();
    return t.access_token;
  }
  const res = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
    headers: { 'Metadata-Flavor': 'Google' }
  });
  if (!res.ok) throw new Error('Metadata token unavailable');
  return (await res.json()).access_token;
}

const handlers = createVerifyHandlers({
  db,
  auth,
  getBankConfig: () => bankConfigSecret.value(),
  getSigner: () => {
    const kmsKey = process.env.NEXUS_VERIFY_KMS_KEY;
    if (kmsKey) return createKmsSigner(kmsKey, getAccessTokenFromMetadata);
    return createHmacSigner(signingSecret.value());
  },
  rateLimiter
});

function rethrowAsHttps(err) {
  if (err instanceof HttpsError) throw err;
  const allowed = ['invalid-argument', 'unauthenticated', 'permission-denied', 'not-found', 'already-exists', 'failed-precondition', 'deadline-exceeded'];
  const code = allowed.includes(err?.code) ? err.code : 'internal';
  throw new HttpsError(code, err?.message || 'Error interno en Nexus Verify.');
}

exports.nexusVerifyIssue = onCall(callOptions, async (request) => {
  try { return await handlers.issue(request.auth, request.data); }
  catch (err) { rethrowAsHttps(err); }
});

exports.nexusVerifySealPdf = onCall(callOptions, async (request) => {
  try { return await handlers.sealPdf(request.auth, request.data); }
  catch (err) { rethrowAsHttps(err); }
});

exports.nexusVerifyRevoke = onCall(callOptions, async (request) => {
  try { return await handlers.revoke(request.auth, request.data); }
  catch (err) { rethrowAsHttps(err); }
});

exports.nexusVerifyLookup = onRequest(lookupOptions, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.set('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Método no permitido.' });
    return;
  }

  const clientIp = (req.get('x-forwarded-for') || req.ip || 'unknown').split(',')[0].trim();
  if (req.query?.mode === 'official-ibans') {
    const out = await handlers.officialIbans({ clientIp });
    res.status(out.status).json(out.body);
    return;
  }

  const rawToken = String(req.query?.code || req.path.split('/').filter(Boolean).pop() || '').trim();
  const out = await handlers.lookup({ rawToken, clientIp });
  if (out.headers) {
    for (const [k, v] of Object.entries(out.headers)) res.set(k, v);
  }
  res.status(out.status).json(out.body);
});
