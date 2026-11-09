/**
 * ═════════════════════════════════════════════════════════════════════════════
 * FIREBASE CLIENTS — AISLAMIENTO EXPLÍCITO Y GESTIÓN DE PROYECTOS MULTI-APP
 * ═════════════════════════════════════════════════════════════════════════════
 * Garantiza que cada escritura se dirija inequívocamente al proyecto Firebase
 * correspondiente:
 * - 'gest-grupos-hotel' (Nexus Groups)
 * - 'mesa-chef-prod'    (MesaChef)
 * - 'gest-spa'          (Gest-Spa)
 *
 * PREVIENE CONTAMINACIÓN CRUZADA:
 * Prohibido terminantemente escribir colecciones de Spa en Grupos o viceversa.
 */

let adminInstance = null;

function getAdmin() {
  if (!adminInstance) {
    try {
      adminInstance = require('firebase-admin');
    } catch (_) {
      adminInstance = null;
    }
  }
  return adminInstance;
}

const initializedApps = new Map();

/**
 * Obtiene la instancia de Firestore para un proyecto específico con inicialización explícita
 * @param {string} projectId - 'gest-spa' | 'gest-grupos-hotel' | 'mesa-chef-prod'
 * @param {object} options - Opciones opcionales { serviceAccountJson, mockDb }
 */
function getFirestoreForProject(projectId, options = {}) {
  // Soporte para inyección de mock en tests controlados
  if (options.mockDb) {
    return options.mockDb;
  }

  const admin = getAdmin();
  if (!admin) {
    throw new Error(`[Firebase Clients] firebase-admin no está disponible en este entorno.`);
  }

  const targetProject = String(projectId || '').trim();
  if (!targetProject) {
    throw new Error('[Firebase Clients] projectId es obligatorio para inicializar Firestore.');
  }

  // Comprobar si ya existe una app inicializada para este proyecto
  if (initializedApps.has(targetProject)) {
    return initializedApps.get(targetProject).firestore();
  }

  const existingApp = admin.apps.find(a => a && a.name === targetProject);
  if (existingApp) {
    initializedApps.set(targetProject, existingApp);
    return existingApp.firestore();
  }

  // Opciones de configuración
  const appConfig = {
    projectId: targetProject
  };

  // Si se proveen credenciales explícitas de Service Account (ej. desde Secret Manager)
  if (options.serviceAccountJson) {
    const creds = typeof options.serviceAccountJson === 'string'
      ? JSON.parse(options.serviceAccountJson)
      : options.serviceAccountJson;
    appConfig.credential = admin.credential.cert(creds);
  }

  try {
    const app = admin.initializeApp(appConfig, targetProject);
    initializedApps.set(targetProject, app);
    return app.firestore();
  } catch (err) {
    // Si la app por defecto ya coincide con el proyecto
    if (admin.apps.length > 0 && admin.app().options.projectId === targetProject) {
      return admin.app().firestore();
    }
    throw new Error(`[Firebase Clients] Error inicializando app para ${targetProject}: ${err.message}`);
  }
}

/**
 * Acceso explícito y validado a la base de datos de Gest-Spa
 */
function getSpaFirestore(options = {}) {
  const db = getFirestoreForProject('gest-spa', options);
  return db;
}

/**
 * Acceso explícito y validado a la base de datos de Grupos (gest-grupos-hotel)
 */
function getGruposFirestore(options = {}) {
  const db = getFirestoreForProject('gest-grupos-hotel', options);
  return db;
}

/**
 * Acceso explícito y validado a la base de datos de MesaChef (mesa-chef-prod)
 */
function getMesaChefFirestore(options = {}) {
  const db = getFirestoreForProject('mesa-chef-prod', options);
  return db;
}

/**
 * Validador de seguridad: asegura que la colección a escribir pertenece al proyecto correcto
 */
function assertCollectionProjectAffinity(collectionName, targetProjectId) {
  const SPA_ONLY = ['reservas_spa', 'reservas_suite', 'reservas_vip', 'reservas_cabina1', 'reservas_cabina2', 'bonos'];
  const GRUPOS_ONLY = ['groups'];
  const MESACHEF_ONLY = ['reservas_restaurante', 'reservas_salones', 'participantes_eventos'];

  if (SPA_ONLY.includes(collectionName) && targetProjectId !== 'gest-spa') {
    throw new Error(`[SEGURIDAD] Intento de escribir la colección de spa "${collectionName}" en el proyecto "${targetProjectId}". Operación bloqueada.`);
  }

  if (GRUPOS_ONLY.includes(collectionName) && targetProjectId !== 'gest-grupos-hotel') {
    throw new Error(`[SEGURIDAD] Intento de escribir la colección de grupos "${collectionName}" en el proyecto "${targetProjectId}". Operación bloqueada.`);
  }

  if (MESACHEF_ONLY.includes(collectionName) && targetProjectId !== 'mesa-chef-prod') {
    throw new Error(`[SEGURIDAD] Intento de escribir la colección de mesachef "${collectionName}" en el proyecto "${targetProjectId}". Operación bloqueada.`);
  }

  return true;
}

module.exports = {
  getFirestoreForProject,
  getSpaFirestore,
  getGruposFirestore,
  getMesaChefFirestore,
  assertCollectionProjectAffinity
};
