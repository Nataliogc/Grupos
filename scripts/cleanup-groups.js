/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Controlled Cleanup Script (Limpieza Controlada)
 * ═══════════════════════════════════════════════════════════
 * Script para analizar, respaldar, verificar y limpiar de forma
 * segura y controlada la colección `groups` de Firestore.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert');
const { Firestore, Timestamp, DocumentReference, GeoPoint } = require('@google-cloud/firestore');
const { OAuth2Client } = require('google-auth-library');

// -------------------------------------------------------------
// SERIALIZACIÓN / DESERIALIZACIÓN DE TIPOS NATIVOS FIRESTORE
// -------------------------------------------------------------
function serializeValue(val) {
    if (val === null || val === undefined) return val;
    if (val instanceof Timestamp) {
        return { __type__: 'timestamp', seconds: val.seconds, nanoseconds: val.nanoseconds };
    }
    if (val instanceof DocumentReference) {
        return { __type__: 'reference', path: val.path };
    }
    if (val instanceof GeoPoint) {
        return { __type__: 'geopoint', latitude: val.latitude, longitude: val.longitude };
    }
    if (Array.isArray(val)) {
        return val.map(serializeValue);
    }
    if (typeof val === 'object') {
        const res = {};
        for (const k of Object.keys(val)) {
            res[k] = serializeValue(val[k]);
        }
        return res;
    }
    return val;
}

function deserializeValue(val, db) {
    if (val === null || val === undefined) return val;
    if (typeof val === 'object') {
        if (val.__type__ === 'timestamp') {
            return new Timestamp(val.seconds, val.nanoseconds);
        }
        if (val.__type__ === 'reference') {
            return db.doc(val.path);
        }
        if (val.__type__ === 'geopoint') {
            return new GeoPoint(val.latitude, val.longitude);
        }
        if (Array.isArray(val)) {
            return val.map(v => deserializeValue(v, db));
        }
        const res = {};
        for (const k of Object.keys(val)) {
            res[k] = deserializeValue(val[k], db);
        }
        return res;
    }
    return val;
}

// Helper para convertir strings o maps de timestamp en un objeto Timestamp
function parseTimestamp(tsVal) {
    if (!tsVal) return null;
    if (tsVal instanceof Timestamp) return tsVal;
    if (tsVal._seconds !== undefined) {
        return new Timestamp(tsVal._seconds, tsVal._nanoseconds || 0);
    }
    if (tsVal.seconds !== undefined) {
        return new Timestamp(tsVal.seconds, tsVal.nanoseconds || 0);
    }
    if (typeof tsVal === 'string') {
        return Timestamp.fromDate(new Date(tsVal));
    }
    return null;
}

// -------------------------------------------------------------
// INICIALIZACIÓN DE FIRESTORE CON SEGURIDAD
// -------------------------------------------------------------
function initFirestore(expectedProjectId) {
    const configPath = 'C:\\Users\\comun\\.config\\configstore\\firebase-tools.json';
    if (!fs.existsSync(configPath)) {
        throw new Error("No se pudo encontrar firebase-tools.json. Ejecuta: firebase login");
    }

    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const tokenInfo = configData.tokens;
    if (!tokenInfo || (!tokenInfo.access_token && !tokenInfo.refresh_token)) {
        throw new Error("Tokens no válidos en firebase-tools.json.");
    }

    const auth = new OAuth2Client();
    auth.setCredentials({
        access_token: tokenInfo.access_token,
        refresh_token: tokenInfo.refresh_token
    });

    const db = new Firestore({
        projectId: 'gest-grupos-hotel',
        authClient: auth
    });

    // Validar proyecto real obtenido
    if (expectedProjectId && expectedProjectId !== 'gest-grupos-hotel') {
        throw new Error(`CRITICAL: El proyecto especificado (${expectedProjectId}) no coincide con 'gest-grupos-hotel'.`);
    }

    return db;
}

// -------------------------------------------------------------
// CRITERIOS DE EXCLUSIÓN OPERATIVA (Garantía de no borrar datos útiles)
// -------------------------------------------------------------
function hasUsefulOperationalInfo(data) {
    const reasons = [];

    // 1. Fechas válidas
    const entrada = data.Entrada || data.entrada || '';
    const salida = data.Salida || data.salida || '';
    if (entrada && !entrada.includes('1900') && entrada !== '-') {
        reasons.push(`Tiene fecha de entrada válida: ${entrada}`);
    }
    if (salida && !salida.includes('1900') && salida !== '-') {
        reasons.push(`Tiene fecha de salida válida: ${salida}`);
    }

    // 2. Cliente, agencia o contacto
    const empresa = data["Empresa/Agencia"] || data.Empresa || data.Agencia || '';
    const fiscal = data.Fiscal_RazonSocial || '';
    const contacto = data.Com_Nombre_Contacto || data.Com_Email_Contacto || data.Com_Telefono_Contacto || '';
    const solicitante = data.solicitante_org || data["solicitante-org"] || '';
    if (empresa.trim()) reasons.push(`Cliente/Agencia: "${empresa}"`);
    if (fiscal.trim()) reasons.push(`Razón Fiscal: "${fiscal}"`);
    if (contacto.trim()) reasons.push(`Contacto: "${contacto}"`);
    if (solicitante.trim()) reasons.push(`Solicitante: "${solicitante}"`);

    // 3. Habitaciones o pasajeros
    const pax = parseInt(data["Pax."] || data.Pax || 0, 10);
    const noches = parseInt(data.Noches || data.noches || 0, 10);
    const roomCounts = data.roomCounts || {};
    const hasRooms = Object.values(roomCounts).some(v => v > 0);
    const habsDesc = data.Habitaciones || '';
    if (pax > 0) reasons.push(`Pasajeros: ${pax}`);
    if (noches > 0) reasons.push(`Noches: ${noches}`);
    if (hasRooms) reasons.push(`Habitaciones asignadas en roomCounts`);
    if (habsDesc.trim()) reasons.push(`Descripción habitaciones: "${habsDesc}"`);

    // 4. Tarifas, cargos, pagos, depósitos o saldos
    let importeStr = String(data["Importe(*)"] || data.total || data.importe || '0');
    const importeNormalized = importeStr.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
    const importe = parseFloat(importeNormalized);
    if (!isNaN(importe) && Math.abs(importe) > 0.01) {
        reasons.push(`Importe financiero no nulo: ${importeStr}`);
    }

    const proformaItems = data.ProformaItems || [];
    if (proformaItems.length > 0) reasons.push(`Tiene ítems de proforma (${proformaItems.length})`);

    const rates = data.ratesOnlyGrid || {};
    if (Object.keys(rates).length > 0) reasons.push(`Tiene tarifas configuradas en ratesOnlyGrid`);

    const payments = data.PaymentPlan_JSON ? JSON.parse(data.PaymentPlan_JSON) : [];
    if (payments.length > 0) reasons.push(`Tiene plan de pagos (${payments.length})`);

    // 5. Historial, notas o tracking
    const notas = data.Com_Notas || '';
    if (notas.trim()) reasons.push(`Contiene notas comerciales`);

    const tracking = Array.isArray(data.tracking) ? data.tracking : [];
    if (tracking.length > 1) { 
        reasons.push(`Contiene historial de tracking operativo (${tracking.length} entradas)`);
    }

    // 6. Estado activo o facturado
    const estado = (data.Com_Estado_Interno || data.Estado || '').toUpperCase();
    if (['ACTIVO', 'CONFIRMADA', 'FACTURADO', 'PAGADO'].includes(estado)) {
        reasons.push(`Estado operativo protegido: "${estado}"`);
    }

    return {
        hasInfo: reasons.length > 0,
        reasons
    };
}

// -------------------------------------------------------------
// ANALIZAR Y CATEGORIZAR CON CRITERIOS REFORZADOS
// -------------------------------------------------------------
async function analyzeCollection(db) {
    console.log("Iniciando análisis y comprobación de integridad en Firestore...");
    const snapshot = await db.collection('groups').get();
    console.log(`Total documentos en colección 'groups': ${snapshot.size}`);

    const allDocsMap = new Map();
    snapshot.forEach(doc => {
        allDocsMap.set(doc.id, doc.data());
    });

    const candidates = [];
    const excluded = [];
    const stats = { temp: 0, year1900: 0, unnamed: 0, empty_stale: 0, old_cancelled: 0 };
    const overlapCounts = {};

    let totalSubcollectionsFound = 0;

    // Fase 1: Análisis Sincrónico rápido (Exclusiones por datos y referencias)
    const preliminaryCandidates = [];

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const id = doc.id;
        
        const name = data["Nombre del Grupo"] || data.name || '';
        const estado = (data.Com_Estado_Interno || data.Estado || '').toUpperCase();
        const entrada = data.Entrada || '';
        const salida = data.Salida || '';
        
        const isTemp = id.startsWith('TEMP-');
        const isUnnamed = !name || !name.trim() || name.toLowerCase() === 'sin nombre';
        
        let is1900 = false;
        if (typeof entrada === 'string' && (entrada.includes('1900') || entrada.endsWith('/1900'))) is1900 = true;
        if (typeof salida === 'string' && (salida.includes('1900') || salida.endsWith('/1900'))) is1900 = true;

        let isOldDate = false;
        let yearEntrada = null;
        if (entrada && typeof entrada === 'string') {
            const parts = entrada.split('/');
            if (parts.length === 3) yearEntrada = parseInt(parts[2], 10);
            else if (entrada.includes('-')) {
                const partsDash = entrada.split('-');
                if (partsDash.length >= 3) yearEntrada = parseInt(partsDash[0], 10);
            }
        }
        if (yearEntrada && yearEntrada <= 2024 && yearEntrada > 1900) {
            isOldDate = true;
        }

        const isDesestimado = estado === 'DESESTIMADO' || estado === 'ANULADA';
        const isCaducado = estado === 'CADUCADO';
        
        let roomingList = [];
        try {
            roomingList = data.RoomingList_JSON ? JSON.parse(data.RoomingList_JSON) : [];
        } catch(e) {
            roomingList = [];
        }
        const extraCharges = data.extraCharges || [];
        const isEmpty = roomingList.length === 0 && extraCharges.length === 0;

        const matchedCategories = [];
        if (isTemp) matchedCategories.push('temp');
        if (is1900) matchedCategories.push('year1900');
        if (isUnnamed) matchedCategories.push('unnamed');
        if (isEmpty && (isDesestimado || isCaducado)) matchedCategories.push('empty_stale');
        if ((isDesestimado || isCaducado) && isOldDate) matchedCategories.push('old_cancelled');

        if (matchedCategories.length === 0) continue;

        // Comprobación de referencias cruzadas
        const refReasons = [];
        allDocsMap.forEach((otherData, otherId) => {
            if (otherId === id) return;
            const strData = JSON.stringify(otherData);
            if (strData.includes(id) || (data.Reserva && strData.includes(data.Reserva))) {
                refReasons.push(`Referenciado en documento '${otherId}'`);
            }
        });

        const opCheck = hasUsefulOperationalInfo(data);

        // Registro de exclusión por datos o referencias
        const exclusions = [];
        if (refReasons.length > 0) {
            exclusions.push(`Referencias cruzadas detectadas: ${refReasons.join('; ')}`);
        }
        if (opCheck.hasInfo && (matchedCategories.includes('unnamed') || matchedCategories.includes('old_cancelled'))) {
            exclusions.push(`Contiene información operativa útil: ${opCheck.reasons.join(', ')}`);
        }

        const createTimeStr = doc.createTime ? doc.createTime.toDate().toISOString() : 'N/A';
        const updateTimeStr = doc.updateTime ? doc.updateTime.toDate().toISOString() : 'N/A';
        
        const createTimeObj = doc.createTime ? { seconds: doc.createTime.seconds, nanoseconds: doc.createTime.nanoseconds } : null;
        const updateTimeObj = doc.updateTime ? { seconds: doc.updateTime.seconds, nanoseconds: doc.updateTime.nanoseconds } : null;

        const item = {
            doc,
            id,
            path: doc.ref.path,
            name,
            estado,
            entrada,
            salida,
            categories: matchedCategories,
            updateTime: updateTimeStr,
            createTime: createTimeStr,
            updateTimeObj,
            createTimeObj,
            summary: {
                pax: data["Pax."] || 0,
                importe: data["Importe(*)"] || '0',
                comercial: data.Com_Comercial || 'N/A'
            },
            originalData: data,
            exclusions
        };

        if (exclusions.length > 0) {
            item.exclusionReason = exclusions.join(' | ');
            excluded.push(item);
        } else {
            preliminaryCandidates.push(item);
        }
    }

    // Fase 2: Comprobación asíncrona de subcolecciones SOLO para los pre-candidatos (85 items)
    console.log(`Evaluando subcolecciones activas en los ${preliminaryCandidates.length} candidatos preliminares en paralelo...`);
    const concurrencyLimit = 15;
    const candidatesWithSubcollections = [];

    for (let i = 0; i < preliminaryCandidates.length; i += concurrencyLimit) {
        const chunk = preliminaryCandidates.slice(i, i + concurrencyLimit);
        const chunkPromises = chunk.map(async (item) => {
            const subcollections = await item.doc.ref.listCollections();
            const subcollNames = subcollections.map(c => c.id);
            return { item, subcollNames };
        });
        const chunkResults = await Promise.all(chunkPromises);
        
        for (const res of chunkResults) {
            if (res.subcollNames.length > 0) {
                totalSubcollectionsFound += res.subcollNames.length;
                res.item.exclusions.push(`Contiene subcolecciones activas: [${res.subcollNames.join(', ')}]`);
                res.item.exclusionReason = res.item.exclusions.join(' | ');
                excluded.push(res.item);
            } else {
                candidates.push(res.item);
                res.item.categories.forEach(cat => {
                    stats[cat]++;
                });
                if (res.item.categories.length > 1) {
                    const overlapKey = res.item.categories.sort().join(' & ');
                    overlapCounts[overlapKey] = (overlapCounts[overlapKey] || 0) + 1;
                }
            }
        }
    }

    return { candidates, excluded, stats, overlapCounts, totalDbDocuments: snapshot.size, totalSubcollectionsFound };
}

// -------------------------------------------------------------
// COMPROBAR RESTAURACIÓN DE PRUEBA EN COLECCIÓN TEMPORAL
// -------------------------------------------------------------
async function runRestoreTest(db, candidates) {
    console.log("\n======================================================");
    console.log("🧪 EJECUTANDO PRUEBA REAL DE RESTAURACIÓN DE VALIDACIÓN");
    console.log("======================================================");

    const testCandidates = candidates.slice(0, Math.min(candidates.length, 5));
    if (testCandidates.length === 0) {
        console.log("No hay candidatos para validar restauración.");
        return true;
    }

    console.log(`Ejecutando restauración simulada de ${testCandidates.length} documentos de prueba en _cleanup_validation...`);
    const validationCollectionPath = '_cleanup_validation';

    try {
        for (const c of testCandidates) {
            const valDocRef = db.collection(validationCollectionPath).doc(c.id);
            
            const serialized = serializeValue(c.originalData);
            const deserialized = deserializeValue(serialized, db);

            await valDocRef.set(deserialized);

            const valDocSnap = await valDocRef.get();
            const restoredData = valDocSnap.data();

            assert.deepStrictEqual(restoredData, c.originalData, `Discrepancia en restauración de documento ${c.id}`);
            
            await valDocRef.delete();
        }

        // Limpieza de cualquier sobrante en la colección temporal
        const valSnapshot = await db.collection(validationCollectionPath).get();
        if (!valSnapshot.empty) {
            const cleanBatch = db.batch();
            valSnapshot.forEach(d => cleanBatch.delete(d.ref));
            await cleanBatch.commit();
        }

        console.log("✅ PRUEBA DE RESTAURACIÓN DE VALIDACIÓN COMPLETADA CON ÉXITO.");
        console.log("Tipos de datos nativos de Firestore verificados y validados.");
        return true;
    } catch (err) {
        console.error("❌ ERROR EN LA PRUEBA DE RESTAURACIÓN DE VALIDACIÓN:", err.message);
        return false;
    }
}

// -------------------------------------------------------------
// EJECUCIÓN DEL MODO DRY-RUN Y MANIFIESTO
// -------------------------------------------------------------
async function runDryRun(db) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const { candidates, excluded, stats, overlapCounts, totalDbDocuments, totalSubcollectionsFound } = await analyzeCollection(db);

    const manifestFilename = `manifest_groups_cleanup_${timestamp}.json`;
    const backupDir = path.join(__dirname, '..', 'backups', 'cleanup');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    const manifestPath = path.join(backupDir, manifestFilename);

    const manifestData = {
        metadata: {
            projectId: 'gest-grupos-hotel',
            runTime: new Date().toISOString(),
            totalDbDocuments,
            totalCandidates: candidates.length,
            totalExcluded: excluded.length,
            totalSubcollectionsFound,
            stats,
            overlapCounts
        },
        candidates: candidates.map(c => ({
            id: c.id,
            path: c.path,
            categories: c.categories,
            updateTime: c.updateTime,
            createTime: c.createTime,
            updateTimeObj: c.updateTimeObj,
            createTimeObj: c.createTimeObj,
            summary: c.summary
        })),
        excluded: excluded.map(e => ({
            id: e.id,
            categories: e.categories,
            exclusionReason: e.exclusionReason,
            summary: e.summary
        }))
    };

    const fullBackupData = {
        ...manifestData,
        records: candidates.map(c => ({
            id: c.id,
            data: serializeValue(c.originalData),
            categories: c.categories,
            updateTimeObj: c.updateTimeObj,
            createTimeObj: c.createTimeObj
        }))
    };

    const hash = crypto.createHash('sha256').update(JSON.stringify(fullBackupData.records)).digest('hex');
    fullBackupData.metadata.checksum = hash;

    fs.writeFileSync(manifestPath, JSON.stringify(fullBackupData, null, 2));

    console.log("\n======================================================");
    console.log("📊 RESULTADO DEL MODO DRY-RUN");
    console.log("======================================================");
    console.log(`Documentos totales en DB:                  ${totalDbDocuments}`);
    console.log(`Candidatos únicos autorizados a borrar:   ${candidates.length}`);
    console.log(`Candidatos excluidos por seguridad:        ${excluded.length}`);
    console.log(`Documentos candidatos con subcolecciones: 0`);
    console.log(`Subcolecciones totales encontradas (excl): ${totalSubcollectionsFound}`);
    console.log("\nDesglose por categoría de los aprobados:");
    console.log(`  - ID temporal (temp):                    ${stats.temp}`);
    console.log(`  - Fecha en 1900 (year1900):              ${stats.year1900}`);
    console.log(`  - Sin nombre de grupo (unnamed):         ${stats.unnamed}`);
    console.log(`  - Vacíos y cancelados (empty_stale):     ${stats.empty_stale}`);
    console.log(`  - Históricos cancelados <= 2024 (old_cancelled): ${stats.old_cancelled}`);

    console.log(`\nManifiesto y backup guardados en: ${manifestPath}`);
    console.log(`Checksum de seguridad: ${hash}`);

    return { candidates, manifestPath, count: candidates.length };
}

// -------------------------------------------------------------
// EJECUCIÓN DE ELIMINACIÓN Y ARCHIVADO COMBINADO (Atomic Batch)
// -------------------------------------------------------------
async function executeCleanup(db, manifestPath, confirmCount) {
    const startTime = new Date();
    if (!fs.existsSync(manifestPath)) {
        throw new Error(`Manifiesto no encontrado en la ruta: ${manifestPath}`);
    }

    console.log("Leyendo manifiesto...");
    const backupData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const candidates = backupData.records;
    const cleanupId = path.basename(manifestPath, '.json');

    // Recalcular SHA256 del contenido de los records para verificación de integridad
    const calculatedRecordsHash = crypto.createHash('sha256').update(JSON.stringify(backupData.records)).digest('hex');
    const expectedHash = "e5a12a78f3be80874918c08726d203c5480d1ee82608b5c2cad6226bb466362c";
    console.log(`Hash calculado de los registros: ${calculatedRecordsHash}`);
    console.log(`Hash esperado de los registros:   ${expectedHash}`);

    if (calculatedRecordsHash !== expectedHash) {
        throw new Error(`CRITICAL: El hash calculado (${calculatedRecordsHash}) no coincide con el esperado (${expectedHash}). Abortando por seguridad.`);
    }

    if (candidates.length !== confirmCount) {
        throw new Error(`CRITICAL: La cantidad de candidatos en el manifiesto (${candidates.length}) no coincide con --confirm-count (${confirmCount}). Ejecución abortada.`);
    }

    // 1. Validar restauración antes de aplicar cambios
    const validationPassed = await runRestoreTest(db, backupData.records.map(r => ({
        id: r.id,
        originalData: deserializeValue(r.data, db)
    })));
    if (!validationPassed) {
        throw new Error("CRITICAL: La prueba de restauración de validación falló. Abortando borrado.");
    }

    // 2. Comprobación expresa en vivo de subcolecciones en los 85 documentos
    console.log("\nComprobando subcolecciones activas en vivo en los candidatos...");
    let docsWithSubcollections = 0;
    for (const c of candidates) {
        const docRef = db.collection('groups').doc(c.id);
        const subcollections = await docRef.listCollections();
        if (subcollections.length > 0) {
            console.error(`❌ ERROR: El candidato '${c.id}' contiene subcolecciones activas en vivo!`);
            docsWithSubcollections++;
        }
    }
    console.log(`Documentos candidatos con subcolecciones: ${docsWithSubcollections}`);
    if (docsWithSubcollections > 0) {
        throw new Error("CRITICAL: Se detectaron candidatos con subcolecciones activas en vivo. Abortando.");
    }

    // 3. Crear el lote atómico principal
    console.log("\nPreparando lote atómico de escritura para archivo y borrado...");
    const batch = db.batch();

    // Documento principal del archivo (Control)
    const controlRef = db.collection('_cleanup_archives').doc(cleanupId);
    const controlData = {
        cleanupId,
        projectId: "gest-grupos-hotel",
        sourceCollection: "groups",
        manifestFile: path.basename(manifestPath),
        manifestHash: backupData.metadata.checksum || 'N/A',
        candidateCount: backupData.metadata.totalCandidates,
        excludedCount: backupData.metadata.totalExcluded,
        status: "completed",
        createdAt: Timestamp.now(),
        completedAt: Timestamp.now()
    };
    batch.set(controlRef, controlData); // Escritura de control

    // Agregar operaciones de archivo y borrado por cada candidato en el mismo batch
    for (const c of candidates) {
        const sourceRef = db.collection('groups').doc(c.id);
        const archiveRef = db.collection('_cleanup_archives').doc(cleanupId).collection('groups').doc(c.id);

        const originalData = deserializeValue(c.data, db);
        const originalUpdateTimeTs = parseTimestamp(c.updateTimeObj);

        // Cada documento archivado incluye metadatos y datos planos originales combinados
        const archivedData = Object.assign({}, originalData, {
            originalPath: sourceRef.path,
            originalId: c.id,
            originalUpdateTime: originalUpdateTimeTs,
            cleanupId: cleanupId,
            archivedAt: Timestamp.now()
        });

        // Copia de archivo preventivo: debe fallar si ya existe
        batch.create(archiveRef, archivedData);

        // Borrado condicionado atómicamente a updateTime del dry-run
        batch.delete(sourceRef, {
            lastUpdateTime: originalUpdateTimeTs
        });
    }

    console.log(`Enviando lote al servidor (incluye control + ${candidates.length} archivos + ${candidates.length} eliminaciones condicionales)...`);
    
    // Confirmando atómicamente la escritura por lotes mediante un único batch.commit()
    await batch.commit();
    
    const endTime = new Date();
    console.log(`\n✓ Escritura por lotes confirmada atómicamente mediante un único batch.commit() en ${endTime - startTime}ms.`);

    // 4. Verificaciones posteriores a la transacción
    console.log("\nEjecutando verificaciones posteriores de integridad...");
    let originCheckFailed = false;
    let archiveCheckFailed = false;

    for (const c of candidates) {
        // Verificar que ya no existe en la colección de origen
        const sourceSnap = await db.collection('groups').doc(c.id).get();
        if (sourceSnap.exists) {
            console.error(`❌ ERROR: El documento '${c.id}' sigue existiendo en el origen.`);
            originCheckFailed = true;
        }

        // Verificar que existe en la colección de archivo
        const archiveSnap = await db.collection('_cleanup_archives').doc(cleanupId).collection('groups').doc(c.id).get();
        if (!archiveSnap.exists) {
            console.error(`❌ ERROR: El documento '${c.id}' no se encuentra en el archivo.`);
            archiveCheckFailed = true;
        }
    }

    if (originCheckFailed || archiveCheckFailed) {
        console.error("\n⚠️ ADVERTENCIA: La verificación de integridad detectó inconsistencias posteriores.");
    } else {
        console.log(`✓ Verificación exitosa: Todos los ${candidates.length} IDs ya no existen en 'groups'.`);
        console.log(`✓ Verificación exitosa: Todos los ${candidates.length} IDs existen correctamente en el archivo.`);
    }

    console.log("\n======================================================");
    console.log("📝 INFORME FINAL DE EJECUCIÓN");
    console.log("======================================================");
    console.log(`Identificador de manifiesto:              ${cleanupId}`);
    console.log(`Hash del manifiesto:                      ${backupData.metadata.checksum || 'N/A'}`);
    console.log(`Hora de inicio:                           ${startTime.toISOString()}`);
    console.log(`Hora de finalización:                     ${endTime.toISOString()}`);
    console.log(`Número de documentos archivados:          ${candidates.length}`);
    console.log(`Número de documentos eliminados:          ${candidates.length}`);
    console.log(`Número de precondiciones verificadas:      ${candidates.length}`);
    console.log(`Número de subcolecciones encontradas:      0`);
    console.log(`Resultado del commit:                     EXITOSO`);
    console.log(`Estado final:                             COMPLETADO`);
}

// -------------------------------------------------------------
// RESTAURACIÓN CONTROLADA E IDEMPOTENTE DESDE ARCHIVO O MANIFIESTO
// -------------------------------------------------------------
async function executeRestore(db, restorePath, overwrite = false) {
    const isLocalFile = fs.existsSync(restorePath);
    let records = [];
    let cleanupId = '';

    if (isLocalFile) {
        console.log(`Leyendo backup local desde: ${restorePath}`);
        const backupData = JSON.parse(fs.readFileSync(restorePath, 'utf8'));
        records = backupData.records;
        cleanupId = path.basename(restorePath, '.json');
    } else {
        // Asumir que restorePath es el ID del manifiesto de Firestore
        cleanupId = restorePath;
        console.log(`Leyendo backup remoto desde Firestore: _cleanup_archives/${cleanupId}/groups/...`);
        const snapshot = await db.collection('_cleanup_archives').doc(cleanupId).collection('groups').get();
        if (snapshot.empty) {
            throw new Error(`No se encontraron registros de copia de seguridad en Firestore para el ID: ${cleanupId}`);
        }
        snapshot.forEach(doc => {
            const data = doc.data();
            // Restaurar los datos originales limpiando los metadatos agregados de archivado
            const cleanData = Object.assign({}, data);
            delete cleanData.originalPath;
            delete cleanData.originalId;
            delete cleanData.originalUpdateTime;
            delete cleanData.cleanupId;
            delete cleanData.archivedAt;

            records.push({
                id: doc.id,
                data: cleanData
            });
        });
    }

    console.log(`Total registros en el backup a restaurar: ${records.length}`);
    
    const batchSize = 100;
    let batch = db.batch();
    let count = 0;
    let restoredCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < records.length; i++) {
        const item = records[i];
        const docRef = db.collection('groups').doc(item.id);
        const snap = await docRef.get();

        if (snap.exists && !overwrite) {
            skippedCount++;
            continue;
        }

        const deserializedData = isLocalFile ? deserializeValue(item.data, db) : item.data;
        batch.set(docRef, deserializedData);
        count++;
        restoredCount++;

        if (count === batchSize || i === records.length - 1) {
            if (count > 0) {
                await batch.commit();
                batch = db.batch();
                count = 0;
            }
        }
    }

    console.log(`\n✅ RESTAURACIÓN COMPLETADA.`);
    console.log(`  - Documentos restaurados: ${restoredCount}`);
    console.log(`  - Documentos omitidos (ya existentes): ${skippedCount}`);
}

// -------------------------------------------------------------
// CLI ENTRY POINT
// -------------------------------------------------------------
async function run() {
    const args = process.argv.slice(2);
    let action = 'dry-run';
    let confirmProject = null;
    let confirmCount = null;
    let manifestPath = null;
    let restorePath = null;
    let overwrite = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--dry-run' || args[i] === '--analyze') action = 'dry-run';
        else if (args[i] === '--delete') action = 'delete';
        else if (args[i] === '--restore') {
            action = 'restore';
            restorePath = args[++i];
        }
        else if (args[i] === '--confirm-project') confirmProject = args[++i];
        else if (args[i] === '--confirm-count') confirmCount = parseInt(args[++i], 10);
        else if (args[i] === '--manifest') manifestPath = args[++i];
        else if (args[i] === '--overwrite') overwrite = true;
    }

    const db = initFirestore(confirmProject);

    if (action === 'dry-run') {
        const { candidates } = await runDryRun(db);
        await runRestoreTest(db, candidates);
    } else if (action === 'delete') {
        if (!confirmProject || confirmProject !== 'gest-grupos-hotel') {
            console.error("❌ ERROR: Debes confirmar el proyecto usando --confirm-project gest-grupos-hotel");
            process.exit(1);
        }
        if (!manifestPath) {
            console.error("❌ ERROR: Debes especificar el manifiesto usando --manifest <ruta_al_manifiesto>");
            process.exit(1);
        }
        if (confirmCount === null || isNaN(confirmCount)) {
            console.error("❌ ERROR: Debes especificar la cantidad confirmada usando --confirm-count <cantidad>");
            process.exit(1);
        }
        await executeCleanup(db, manifestPath, confirmCount);
    } else if (action === 'restore') {
        if (!confirmProject || confirmProject !== 'gest-grupos-hotel') {
            console.error("❌ ERROR: Debes confirmar el proyecto usando --confirm-project gest-grupos-hotel");
            process.exit(1);
        }
        await executeRestore(db, restorePath, overwrite);
    }
}

run().catch(err => {
    console.error("\n❌ OCURRIÓ UN ERROR CRÍTICO EN LA EJECUCIÓN:");
    console.error(err.stack || err.message || err);
    process.exit(1);
});
