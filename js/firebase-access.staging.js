/* Firebase Authentication bootstrap for Nexus Groups.
 * STAGING MODULE — not linked into production HTML.
 * Requires Firebase Auth compat SDK loaded before this file.
 * Never trust localStorage or a client-provided role as authorization.
 */
(function () {
  'use strict';
  const state = { user: null, member: null, ready: false };
  function getAuth() {
    if (!window.firebase || typeof firebase.auth !== 'function') {
      throw new Error('Firebase Auth SDK no disponible');
    }
    return firebase.auth();
  }
  const VALID_ROLES = ['admin', 'direction', 'reception', 'commercial'];
  async function getMember(user) {
    if (!user || !window.db) throw new Error('Identidad no disponible');
    if (typeof user.getIdToken === 'function') {
      await user.getIdToken(true);
    }
    const snapshot = await window.db.collection('access_members').doc(user.uid).get({source: 'server'});
    const member = snapshot.exists ? snapshot.data() : null;
    if (user.email?.toLowerCase() === 'demo@hotel.com' || !member || member.active !== true || !VALID_ROLES.includes(member.role)) {
      throw new Error('Cuenta sin permiso para Nexus Groups');
    }
    return {
      role: member.role,
      active: true,
      hotels: Array.isArray(member.hotels) ? member.hotels : [],
      canConvertBudget: member.canConvertBudget === true
    };
  }
  function start(callback) {
    return getAuth().onAuthStateChanged(async function (user) {
      state.ready = false;
      state.user = null;
      state.member = null;
      if (!user) {
        state.ready = true;
        callback({ authenticated: false });
        return;
      }
      try {
        const member = await getMember(user);
        state.user = user;
        state.member = member;
        state.ready = true;
        callback({ authenticated: true, uid: user.uid, role: member.role });
      } catch (error) {
        callback({ authenticated: false, error: error.message });
      }
    });
  }
  async function login(email, password) {
    const credential = await getAuth().signInWithEmailAndPassword(email, password);
    try {
      const member = await getMember(credential.user);
      state.user = credential.user;
      state.member = member;
      state.ready = true;
      return { uid: credential.user.uid, email: credential.user.email, role: member.role };
    } catch (error) {
      await getAuth().signOut();
      throw error;
    }
  }
  async function logout() {
    state.ready = false;
    state.member = null;
    state.user = null;
    return getAuth().signOut();
  }
  window.NexusFirebaseAccess = Object.freeze({
    login, logout, start,
    getSession: () => state.ready && state.user && state.member
      ? { uid: state.user.uid, role: state.member.role } : null
  });
})();
