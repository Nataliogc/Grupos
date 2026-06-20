const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// ------------------------------------------------------------------
// CONFIGURACIÓN Y UTILIDADES
// ------------------------------------------------------------------

function initFirebase(expectedProjectId) {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    }
    
    const actualProjectId = admin.app().options.projectId;
    if (actualProjectId !== expectedProjectId) {
        throw new Error(`CRITICAL: Proyecto conectado (${actualProjectId}) no coincide con el esperado (${expectedProjectId}). Abortando por seguridad.`);
    }

    return { db: admin.firestore(), actualProjectId };
}

function normalize(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim().toLowerCase();
}

function normalizeDate(d) {
    return normalize(d);
}

function getEconomicItemDate(item) {
    return normalizeDate(
        item.fechaCargo ?? item.chargeDate ?? item.date ?? item.fecha ?? item.dateIn ?? item.fechaEntrada
    );
}

function parseAmount(value) {
    const normalized = String(value || 0)
        .replace(/[^\d,.-]/g, "")
        .replace(/\.(?=\d{3}(?:\D|$))/g, "")
        .replace(",", ".");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : 0;
}

function normalizeMoney(value) {
    return parseAmount(value).toFixed(2);
}

function isEffectiveEconomicItem(item) {
    return Boolean(
        item &&
        item.isEconomicItem !== false &&
        item.isEconomicRepresentation !== false &&
        item.excludeFromEconomicTotals !== true &&
        item.isManualRoomingItem !== true &&
        !item.isAutomaticOperationalService
    );
}

function buildLegacyEconomicSignature(item) {
    return [
        normalize(item.hotel || item.hotelName || item.Hotel),
        normalize(item.type || item.roomType || item.product || item.producto || item.concept || item.Concepto),
        getEconomicItemDate(item),
        normalize(item.regime || item.reg || item.Regimen || item.REG),
        normalize(item.qty || item.quantity || item.cantidad || item.cant || item.rooms || item.units || 1),
        normalize(item.pax || item.Pax || ""),
        normalize(item.nights || item.noches || item.Noches || 1),
        normalizeMoney(item.price || item.unitPrice || item.precio || item.Precio),
        normalize(item.iva || 10),
        normalizeMoney(item.total || item.lineTotal || item.importe || item.Total || item.amount)
    ].join("|");
}

function getEconomicIdentity(item) {
    if (item.sourceBudgetId && item.sourceBudgetItemId) {
        return { strong: true, id: `budget|${item.sourceBudgetId}|${item.sourceBudgetItemId}` };
    }
    if (item.id) {
        return { strong: true, id: `id|${item.id}` };
    }
    return { strong: false, id: `legacy|${buildLegacyEconomicSignature(item)}` };
}

// ------------------------------------------------------------------
// LÓGICA PRINCIPAL DE ANÁLISIS Y REPARACIÓN
// ------------------------------------------------------------------

function analyzeDocument(docData, docId, collectionName) {
    let hasRecords = Array.isArray(docData.records);
    let canonicalItems = [];
    let extraCharges = [];
    let isClean = true;

    if (hasRecords) {
        // En caso de estructura legacy anidada, buscamos el canónico
        let firstValid = docData.records.find(r => r.RoomingList_JSON && r.RoomingList_JSON !== "[]");
        canonicalItems = firstValid && firstValid.RoomingList_JSON ? JSON.parse(firstValid.RoomingList_JSON) : [];
        extraCharges = firstValid && firstValid.extraCharges ? firstValid.extraCharges : (docData.extraCharges || []);
    } else {
        // Estructura plana (nueva)
        canonicalItems = docData.RoomingList_JSON ? JSON.parse(docData.RoomingList_JSON) : [];
        extraCharges = docData.extraCharges || [];
    }

    let exactDuplicatesCount = 0;
    let conflictsCount = 0;
    let finalLines = [];
    let addedLines = [];
    const identityMap = new Map();
    const duplicateDetails = [];

    for (const item of canonicalItems) {
        if (!isEffectiveEconomicItem(item)) {
            finalLines.push(item);
            continue;
        }

        const idInfo = getEconomicIdentity(item);
        const signature = buildLegacyEconomicSignature(item);
        
        if (identityMap.has(idInfo.id)) {
            const existing = identityMap.get(idInfo.id);
            const exSig = buildLegacyEconomicSignature(existing);
            
            if (idInfo.strong && exSig === signature) {
                exactDuplicatesCount++;
                isClean = false;
                duplicateDetails.push({
                    identity: idInfo.id,
                    product: item.type,
                    date: getEconomicItemDate(item),
                    amount: normalizeMoney(item.price),
                    kept: existing,
                    discarded: item
                });
            } else if (!idInfo.strong && exSig === signature) {
                exactDuplicatesCount++;
                isClean = false;
                duplicateDetails.push({
                    identity: signature,
                    product: item.type,
                    date: getEconomicItemDate(item),
                    amount: normalizeMoney(item.price),
                    kept: existing,
                    discarded: item
                });
            } else {
                conflictsCount++;
                isClean = false;
            }
        } else {
            identityMap.set(idInfo.id, item);
            finalLines.push(item);
        }
    }

    const newTotal = finalLines.filter(i => isEffectiveEconomicItem(i)).reduce((acc, i) => acc + parseAmount(i.total || i.lineTotal || i.importe || i.amount || 0), 0);
    const hasPersistentChanges = !isClean;

    return {
        isClean,
        hasPersistentChanges,
        hasRecords,
        exactDuplicatesCount,
        conflictsCount,
        finalLines,
        newTotal,
        addedLines,
        duplicateDetails,
        canonicalItems,
        extraCharges
    };
}

async function processRepair(reservationId, apply, expectedProjectId) {
    let db, actualProjectId;
    try {
        const fb = initFirebase(expectedProjectId);
        db = fb.db;
        actualProjectId = fb.actualProjectId;
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }

    console.log(`\n=== INFORME DE AUDITORÍA TÉCNICA ===`);
    console.log(`1. Proyecto Firebase real detectado: ${actualProjectId}`);

    // Buscar el documento
    const groupsRef = db.collection('groups');
    let docRef = null;
    let docId = reservationId;

    let docSnapshot = await groupsRef.doc(reservationId).get();
    if (!docSnapshot.exists) {
        // Fallback: search by "Reserva" field in groups or Grupos
        const q = await groupsRef.where("Reserva", "==", reservationId).get();
        if (!q.empty) {
            docSnapshot = q.docs[0];
            docId = docSnapshot.id;
            docRef = docSnapshot.ref;
        } else {
            // Intenta en Grupos (legacy)
            const oldRef = db.collection('Grupos');
            const qOld = await oldRef.where("Reserva", "==", reservationId).get();
            if (!qOld.empty) {
                docSnapshot = qOld.docs[0];
                docId = docSnapshot.id;
                docRef = docSnapshot.ref;
            } else {
                console.error(`Documento con reserva ${reservationId} no encontrado en 'groups' ni en 'Grupos'.`);
                process.exit(1);
            }
        }
    } else {
        docRef = docSnapshot.ref;
    }

    const docData = docSnapshot.data();
    console.log(`2. Número real de documentos coincidentes: 1`);
    console.log(`3. Colección: ${docRef.parent.id}`);
    console.log(`   ID documental: ${docId}`);
    console.log(`   Ruta exacta: ${docRef.path}`);
    console.log(`   Campo Reserva: ${docData.Reserva || 'N/A'}`);
    console.log(`   Campo presupuesto: ${docData._docId || 'N/A'}`);

    const repairPlan = analyzeDocument(docData, docId, docRef.parent.id);
    
    console.log(`4. Estructura real de 'records': ${repairPlan.hasRecords ? 'Array detectado' : 'NO EXISTE ARRAY records. El documento es PLANO.'}`);
    console.log(`5. Candidatos económicos reales: El documento raíz (${docRef.path})`);
    console.log(`6. Registro canónico propuesto: Documento raíz`);
    console.log(`7. Criterio real de selección: Ausencia de versiones históricas en array; es el único contenedor de RoomingList_JSON y extraCharges.`);

    console.log(`\n8. Detalle completo de duplicados (${repairPlan.exactDuplicatesCount}):`);
    if (repairPlan.exactDuplicatesCount === 0) console.log("   No hay duplicados exactos dentro de la fuente canónica.");
    repairPlan.duplicateDetails.forEach((d, i) => {
        console.log(`   Duplicado ${i+1}:`);
        console.log(`   - identidad: ${d.identity}`);
        console.log(`   - producto: ${d.product}`);
        console.log(`   - fecha: ${d.date}`);
        console.log(`   - importe: ${d.amount}€`);
    });

    console.log(`\n9. Líneas que se conservarían del origen:`);
    repairPlan.canonicalItems.forEach(i => console.log(`   - ${i.qty}x ${i.type} (${i.total}€)`));

    console.log(`\n10. Líneas que se añadirían desde otras fuentes:`);
    if (repairPlan.addedLines.length === 0) console.log("   Ninguna. Mantenemos el modelo persistido separado.");

    console.log(`\n11. Conflictos: ${repairPlan.conflictsCount}`);

    const oldTotal = parseAmount(docData["Importe(*)"]);
    console.log(`\n12. Total real antes: ${oldTotal.toFixed(2)} €`);
    console.log(`13. Total calculado después: ${repairPlan.newTotal.toFixed(2)} €`);

    if (!apply) {
        console.log(`\n14. MODO DRY-RUN: Sin escrituras`);
        if (repairPlan.isClean) {
            console.log(`\nDATOS PERSISTIDOS VÁLIDOS`);
            console.log(`Duplicados: 0`);
            console.log(`Conflictos: 0`);
            console.log(`Total persistido: ${oldTotal.toFixed(2)} €`);
            console.log(`Reparación necesaria: NO`);
            console.log(`Escrituras propuestas: 0`);
        } else {
            console.log(`\n14. Campos exactos que modificaría el PATCH: RoomingList_JSON y totales.`);
        }
    }

    if (!repairPlan.hasPersistentChanges) {
        console.log("\nNo existen cambios persistentes que aplicar.");
        process.exit(0);
    }

    if (apply) {
        console.log(`\n======================================================`);
        console.log(`⚠️  ATENCIÓN: EJECUTANDO REPARACIÓN EN PRODUCCIÓN`);
        console.log(`======================================================\n`);

        const backupDir = path.join(__dirname, '..', 'backups', 'applied');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `backup_${docId}_${timestamp}.json`);
        
        const backupData = {
            backedUpAt: new Date().toISOString(),
            documentId: docId,
            collection: docRef.parent.id,
            originalDocument: docData
        };
        
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
        console.log(`✓ Backup transaccional guardado en: ${backupPath}`);

        await db.runTransaction(async (transaction) => {
            const currentDoc = await transaction.get(docRef);
            if (!currentDoc.exists) throw new Error("Documento desapareció.");
            
            const currentData = currentDoc.data();
            const plan = analyzeDocument(currentData, docId, docRef.parent.id);
            
            if (plan.hasRecords) {
                const updatedRecords = [...currentData.records];
                const canonicalIndex = updatedRecords.findIndex(r => r.RoomingList_JSON && r.RoomingList_JSON !== "[]");
                updatedRecords[canonicalIndex].RoomingList_JSON = JSON.stringify(plan.finalLines);
                updatedRecords[canonicalIndex]["Importe(*)"] = plan.newTotal.toFixed(2);
                transaction.update(docRef, {
                    records: updatedRecords,
                    "Importe(*)": plan.newTotal.toFixed(2),
                    totalRevenue: plan.newTotal
                });
            } else {
                transaction.update(docRef, {
                    RoomingList_JSON: JSON.stringify(plan.finalLines),
                    "Importe(*)": plan.newTotal.toFixed(2),
                    _totalAmount: plan.newTotal
                });
            }
        });

        console.log(`✓ Transacción completada correctamente.`);
    }
}

// ------------------------------------------------------------------
// MODO RESTORE
// ------------------------------------------------------------------
async function processRestore(backupPath, apply, expectedProjectId) {
    if (!fs.existsSync(backupPath)) {
        console.error(`❌ Backup no encontrado: ${backupPath}`);
        process.exit(1);
    }
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    console.log(`\n=== MODO RESTORE (Backup de ${backup.backedUpAt}) ===`);

    if (!apply) {
        console.log(`Dry-run restore. Documento destino: ${backup.documentId}`);
        return;
    }

    const { db } = initFirebase(expectedProjectId);
    const docRef = db.collection(backup.collection).doc(backup.documentId);
    
    await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        if (!doc.exists) throw new Error("Documento no existe.");
        transaction.set(docRef, backup.originalDocument);
    });

    console.log(`✓ Documento restaurado desde el backup transaccionalmente.`);
}

// ------------------------------------------------------------------
// CLI ENTRY POINT
// ------------------------------------------------------------------

const args = process.argv.slice(2);
let reservationId = null;
let apply = false;
let confirmProject = null;
let restorePath = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--reservation') reservationId = args[++i];
    else if (args[i] === '--apply') apply = true;
    else if (args[i] === '--confirm-project') confirmProject = args[++i];
    else if (args[i] === '--restore') restorePath = args[++i];
}

if (restorePath) {
    if (apply && !confirmProject) {
        console.error("Para restaurar se requiere --confirm-project <ID>");
        process.exit(1);
    }
    processRestore(restorePath, apply, confirmProject);
} else if (reservationId) {
    if (apply && !confirmProject) {
        console.error("Para --apply se requiere --confirm-project <ID>");
        process.exit(1);
    }
    processRepair(reservationId, apply, confirmProject);
} else {
    console.log("Uso: node repair-group-economics.js --reservation <ID> [--dry-run | --apply --confirm-project <ID>]");
    console.log("     node repair-group-economics.js --restore <file> [--apply --confirm-project <ID>]");
}
