'use strict';
// Nexus Groups — privileged identity management through Firebase Admin SDK.
// Cloud Functions callable endpoints. No Admin SDK credentials are sent to clients.
// App Check can be enforced after clients are enrolled; authentication + role
// are mandatory regardless of the caller's origin.
const admin = require('firebase-admin');
const crypto = require('node:crypto');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();
const options = { region: 'us-central1' };
const roles = ['admin', 'direction', 'reception', 'commercial'];
const validHotels = ['cumbria', 'guadiana'];
const members = db.collection('access_members');
const clean = s => String(s || '').trim();
const emailOf = s => clean(s).toLowerCase();

function ensureHotels(hotels, fallback = validHotels) {
  if (hotels === undefined) return [...fallback];
  if (!Array.isArray(hotels) || hotels.length === 0 || hotels.some(h => !validHotels.includes(h)))
    throw new HttpsError('invalid-argument', 'Hoteles autorizados no válidos.');
  return [...new Set(hotels)];
}
function ensureCanConvertBudget(value, defaultValue = false) {
  if (value === undefined) return Boolean(defaultValue);
  if (typeof value !== 'boolean')
    throw new HttpsError('invalid-argument', 'Permiso de conversión de presupuesto no válido.');
  return value;
}

function editGroupsPermission(value = false) {
  if (typeof value !== 'boolean') throw new HttpsError('invalid-argument', 'Permiso de edición no válido.');
  return value;
}

async function requireAdmin(request) {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Identificación obligatoria.');
  const actor = await members.doc(request.auth.uid).get();
  if (!actor.exists || actor.data()?.active !== true || actor.data()?.role !== 'admin')
    throw new HttpsError('permission-denied', 'Solo el administrador puede gestionar cuentas.');
  const record = await auth.getUser(request.auth.uid);
  if (record.disabled || emailOf(record.email) === 'demo@hotel.com') throw new HttpsError('permission-denied', 'Cuenta deshabilitada.');
  if (record.tokensValidAfterTime) {
    const validAfterMs = Date.parse(record.tokensValidAfterTime);
    const authTimeMs = Number(request.auth.token?.auth_time || 0) * 1000;
    if (Number.isFinite(validAfterMs) && authTimeMs > 0 && authTimeMs < validAfterMs)
      throw new HttpsError('unauthenticated', 'Sesión revocada. Vuelve a iniciar sesión.');
  }
  return request.auth.uid;
}
function input(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data))
    throw new HttpsError('invalid-argument', 'Solicitud incorrecta.');
  return data;
}
function ensureRole(role) {
  if (!roles.includes(role)) throw new HttpsError('invalid-argument', 'Perfil no válido.');
  return role;
}
function ensureEmail(email) {
  const value = emailOf(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 254)
    throw new HttpsError('invalid-argument', 'Correo electrónico no válido.');
  return value;
}
function ensureName(name) {
  const value = clean(name);
  if (value.length < 2 || value.length > 100)
    throw new HttpsError('invalid-argument', 'Nombre no válido.');
  return value;
}
async function ensureExisting(uid) {
  const user = await auth.getUser(uid);
  const doc = await members.doc(uid).get();
  if (!doc.exists) throw new HttpsError('not-found', 'No existe permiso de usuario.');
  return { user, data: doc.data(), version: doc.updateTime };
}


exports.nexusListUsers = onCall(options, async request => {
  await requireAdmin(request);
  // Authentication is the source of truth for identities; Firestore membership
  // only determines permission. Existing Firebase users must remain visible
  // even before being linked to Nexus.
  const users = [];
  let token;
  do {
    const page = await auth.listUsers(1000, token);
    users.push(...page.users);
    if (users.length > 5000) throw new HttpsError('resource-exhausted', 'Demasiados usuarios.');
    token = page.pageToken;
  } while (token);
  const results = await Promise.all(users.map(async u => {
    const doc = await members.doc(u.uid).get();
    const membership = doc.exists ? doc.data() : null;
    return {
      uid: u.uid,
      email: u.email || '',
      name: membership?.name || u.displayName || '',
      role: membership?.role || null,
      active: membership?.active === true && !u.disabled,
      disabled: u.disabled,
      linked: !!membership,
      hotels: Array.isArray(membership?.hotels) ? membership.hotels : [],
      canEditGroups: membership?.canEditGroups === true,
      canConvertBudget: membership?.canConvertBudget === true,
      paymentScopes: membership?.paymentScopes || [],
      testAccount: (u.email || '').toLowerCase() === 'demo@hotel.com'
    };
  }));
  return { users: results.sort((a, b) => a.email.localeCompare(b.email)) };
});

exports.nexusLinkUser = onCall(options, async request => {
  await requireAdmin(request);
  const data = input(request.data);
  const email = ensureEmail(data.email);
  const role = ensureRole(data.role);
  const name = ensureName(data.name);
  const hotels = ensureHotels(data.hotels);
  const canConvertBudget = ensureCanConvertBudget(data.canConvertBudget, role === 'admin');
  if (email === 'demo@hotel.com')
    throw new HttpsError('failed-precondition', 'No se puede vincular la cuenta de demostración.');
  let record;
  try { record = await auth.getUserByEmail(email); }
  catch (err) {
    if (err.code === 'auth/user-not-found')
      throw new HttpsError('not-found', 'La cuenta no existe; usa Crear usuario.');
    throw new HttpsError('internal', 'No se pudo comprobar la identidad.');
  }
  if (record.disabled || emailOf(record.email) === 'demo@hotel.com')
    throw new HttpsError('failed-precondition', 'La cuenta está inhabilitada en Firebase.');
  const ref = members.doc(record.uid);
  const existing = await ref.get();
  if (existing.exists)
    throw new HttpsError('already-exists', 'Esta cuenta ya tiene un perfil Nexus; utiliza Editar.');
  await ref.create({
    email: record.email || email, name, role, hotels, canConvertBudget, canEditGroups: editGroupsPermission(data.canEditGroups), active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { ok: true, uid: record.uid, email };
});

exports.nexusCreateUser = onCall(options, async request => {
  await requireAdmin(request);
  const data = input(request.data);
  const email = ensureEmail(data.email);
  if (email === 'demo@hotel.com') throw new HttpsError('permission-denied', 'Cuenta bloqueada.');
  const name = ensureName(data.name);
  const role = ensureRole(data.role);
  const hotels = ensureHotels(data.hotels);
  const canConvertBudget = ensureCanConvertBudget(data.canConvertBudget, role === 'admin');
  // Never accept a password from the administrator's browser.
  // A random password remains unknown; the user sets their own via reset.
  const randomPassword = crypto.randomBytes(36).toString('base64url') + 'Aa1!';
  let created;
  try {
    created = await auth.createUser({ email, displayName: name, password: randomPassword,
      emailVerified: false, disabled: false });
    await members.doc(created.uid).set({ name, email, role, hotels, canConvertBudget, canEditGroups: editGroupsPermission(data.canEditGroups), active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    const setupLink = await auth.generatePasswordResetLink(email);
    // Link is sensitive, supplied once to authorized admin for secure delivery.
    return { uid: created.uid, email, name, role, hotels, canConvertBudget, setupLink };
  } catch (err) {
    if (created) {
      await members.doc(created.uid).delete().catch(() => {});
      await auth.deleteUser(created.uid).catch(() => {});
    }
    if (err instanceof HttpsError) throw err;
    if (err.code === 'auth/email-already-exists')
      throw new HttpsError('already-exists', 'Este correo ya existe en Firebase Authentication.');
    throw new HttpsError('internal', 'No se pudo crear la cuenta.');
  }
});

exports.nexusUpdateUser = onCall(options, async request => {
  const actor = await requireAdmin(request);
  const { uid, role, active, name } = input(request.data);
  if (typeof uid !== 'string' || !uid || uid.length > 128)
    throw new HttpsError('invalid-argument', 'UID no válido.');
  const { user, data, version } = await ensureExisting(uid);
  if (user.email?.toLowerCase() === 'demo@hotel.com')
    throw new HttpsError('failed-precondition', 'La cuenta demo no puede reactivarse desde Nexus.');
  const changes = {};
  if (request.data.canEditGroups !== undefined) changes.canEditGroups = editGroupsPermission(request.data.canEditGroups);
  if (request.data.paymentScopes !== undefined) {
    const scopes = request.data.paymentScopes;
    if (!Array.isArray(scopes) || scopes.some(s => !/^(cumbria|guadiana)\/(grupos|mesachef|spa)$/.test(s)))
      throw new HttpsError('invalid-argument', 'Permiso de cobro desconocido.');
    changes.paymentScopes = [...new Set(scopes)];
  }
  if (request.data.hotels !== undefined) {
    changes.hotels = ensureHotels(request.data.hotels);
  }
  if (request.data.canConvertBudget !== undefined) {
    changes.canConvertBudget = ensureCanConvertBudget(request.data.canConvertBudget);
  }
  const newRole = role === undefined ? data.role : ensureRole(role);
  const newActive = active === undefined ? data.active === true : active;
  if (typeof newActive !== 'boolean')
    throw new HttpsError('invalid-argument', 'Estado no válido.');
  const newName = name === undefined ? data.name : ensureName(name);
  if (uid === actor && (newRole !== 'admin' || !newActive))
    throw new HttpsError('failed-precondition', 'No puedes retirar tu propio acceso de administrador.');
  await db.runTransaction(async tx => {
    const actorDoc = await tx.get(members.doc(actor));
    const targetDoc = await tx.get(members.doc(uid));
    if (!actorDoc.data()?.active || actorDoc.data()?.role !== 'admin')
      throw new HttpsError('permission-denied', 'Permiso revocado.');
    if (!targetDoc.exists || !targetDoc.updateTime.isEqual(version))
      throw new HttpsError('aborted', 'El usuario ha cambiado. Actualiza el listado.');
    // An active admin cannot remove their own access. Reading the actor and target
    // in the same transaction also prevents two admins from demoting each other.
    tx.update(targetDoc.ref, { ...changes, role:newRole, active:newActive, name:newName,
      updatedAt:admin.firestore.FieldValue.serverTimestamp() });
  });
  await auth.updateUser(uid, {disabled:!newActive, displayName:newName});
  if (!newActive) await auth.revokeRefreshTokens(uid);
  return { ok: true, uid };
});

exports.nexusResetUser = onCall(options, async request => {
  await requireAdmin(request);
  const { uid } = input(request.data);
  if (typeof uid !== 'string' || !uid) throw new HttpsError('invalid-argument', 'UID no válido.');
  const { user, data } = await ensureExisting(uid);
  if (!data.active || user.disabled || emailOf(user.email) === 'demo@hotel.com') throw new HttpsError('failed-precondition', 'Cuenta inhabilitada.');
  if (!user.email) throw new HttpsError('failed-precondition', 'La cuenta no tiene correo.');
  const resetLink = await auth.generatePasswordResetLink(user.email);
  return { email: user.email, resetLink };
});
