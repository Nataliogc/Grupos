const fs = require('fs');
const path = require('path');

const repoDir = 'c:/Users/comun/Documents/GitHub/Grupos';

console.log("=== 1. Modifying src/services/splitSeriesReservation.js ===");
const splitPath = path.join(repoDir, 'src/services/splitSeriesReservation.js');
let splitContent = fs.readFileSync(splitPath, 'utf8');

// Update confirmBudget to handle manual PMS reservation number when confirming
const oldConfirmBudgetBlock = `    if (isMulti && isTransitioningToConfirmed) {
      const segIdsStr = activeSegments.map(s => s.id).join(", ");
      const msg = \`Esta serie contiene \${activeSegments.length} estancias. Al confirmarla se crearán \${activeSegments.length} reservas independientes con los siguientes códigos: \${segIdsStr}.\\n\\n¿Deseas continuar?\`;
      
      let userAccepted = false;
      if (typeof window !== "undefined") {
        userAccepted = window.confirm(msg);
      } else {
        // Non-browser script execution
        userAccepted = true; 
      }

      if (!userAccepted) {
        throw new Error("Operación cancelada por el usuario.");
      }

      await splitAndConfirmMultiSegment({
        budgetId,
        db,
        confirmedBy: confirmedBy || "Usuario",
        confirmationSource: confirmationSource || "Interfaz"
      });

      return { split: true, childIds: activeSegments.map(s => s.id) };
    } else {
      // Normal update/save process: update status and timestamp in parent document`;

const newConfirmBudgetBlock = `    if (isMulti && isTransitioningToConfirmed) {
      const segIdsStr = activeSegments.map(s => s.id).join(", ");
      const msg = \`Esta serie contiene \${activeSegments.length} estancias. Al confirmarla se crearán \${activeSegments.length} reservas independientes con los siguientes códigos: \${segIdsStr}.\\n\\n¿Deseas continuar?\`;
      
      let userAccepted = false;
      if (typeof window !== "undefined") {
        userAccepted = window.confirm(msg);
      } else {
        userAccepted = true; 
      }

      if (!userAccepted) {
        throw new Error("Operación cancelada por el usuario.");
      }

      await splitAndConfirmMultiSegment({
        budgetId,
        db,
        confirmedBy: confirmedBy || "Usuario",
        confirmationSource: confirmationSource || "Interfaz"
      });

      return { split: true, childIds: activeSegments.map(s => s.id) };
    } else if (isTransitioningToConfirmed) {
      // REGLA FUNDAMENTAL: Al confirmar un presupuesto individual, DEBE asignarse un número de reserva manual del PMS.
      // A partir de ese momento, la referencia única y válida del grupo es el Nº de Reserva.
      // El presupuesto original queda bloqueado en modo de mera consulta histórica y no se modifica más.
      const isBudgetDoc = String(budgetId).toUpperCase().startsWith("PRES-") ||
                          String(budget.Reserva || "").toUpperCase().startsWith("PRES-") ||
                          budget.isBudget === true ||
                          (budget.Com_Estado_Interno || "").toUpperCase() === "PRESUPUESTO" ||
                          (budget.Estado || "").toUpperCase() === "PRESUPUESTO";

      let pmsReserva = (typeof manualReservationId !== "undefined" && manualReservationId) ? String(manualReservationId).trim() : "";
      if (isBudgetDoc && !budget.convertedToReservation && !pmsReserva) {
        if (typeof window !== "undefined") {
          const promptMsg = "Introduce el NÚMERO DE RESERVA DEL PMS para confirmar este grupo / presupuesto:\\n\\n(A partir de este momento, la referencia única y válida oficial del grupo será este número de reserva)";
          const inputVal = window.prompt(promptMsg);
          if (inputVal === null || !inputVal.trim()) {
            throw new Error("Confirmación cancelada: Se requiere un número de reserva del PMS.");
          }
          pmsReserva = inputVal.trim();
        }
      }

      const now = new Date();
      const formattedDate = \`\${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}-\${String(now.getDate()).padStart(2, '0')} \${String(now.getHours()).padStart(2, '0')}:\${String(now.getMinutes()).padStart(2, '0')}\`;

      let track = [];
      try {
        if (typeof budget.tracking === 'string') track = JSON.parse(budget.tracking || "[]");
        else if (Array.isArray(budget.tracking)) track = budget.tracking;
      } catch (e) {}

      let serverTimestampVal = new Date();
      if (global.firebase && global.firebase.firestore && global.firebase.firestore.FieldValue) {
        serverTimestampVal = global.firebase.firestore.FieldValue.serverTimestamp();
      } else if (db.app && db.app.firebase_ && db.app.firebase_.firestore && db.app.firebase_.firestore.FieldValue) {
        serverTimestampVal = db.app.firebase_.firestore.FieldValue.serverTimestamp();
      }

      if (pmsReserva && pmsReserva !== budgetId) {
        if (pmsReserva.toUpperCase().startsWith("PRES-") || pmsReserva.toUpperCase().startsWith("COT-")) {
          throw new Error("El número de reserva del PMS debe ser un localizador real (no puede ser un código de presupuesto PRES-).");
        }
        if (/[/\\\\.]/.test(pmsReserva)) {
          throw new Error("El número de reserva del PMS no puede contener barras ni puntos.");
        }

        const checkDoc = await db.collection("groups").doc(pmsReserva).get();
        if (checkDoc.exists && checkDoc.id !== budgetId) {
          throw new Error(\`El número de reserva \${pmsReserva} ya existe en el sistema.\`);
        }

        // 1. Crear documento de la reserva oficial en groups
        const reservationData = {
          ...budget,
          id: pmsReserva,
          uid: pmsReserva,
          Reserva: pmsReserva,
          Presupuesto_Origen: budgetId,
          sourceQuoteId: budgetId,
          Com_Estado_Interno: "CONFIRMADO",
          Estado: "Confirmado",
          isBudget: false,
          updatedAt: serverTimestampVal,
          tracking: JSON.stringify([
            {
              id: Date.now(),
              date: formattedDate,
              text: \`Presupuesto \${budgetId} confirmado y asignado a reserva definitiva PMS: \${pmsReserva}\`
            },
            ...track
          ])
        };
        delete reservationData.convertedToReservation;
        delete reservationData.targetReservationId;
        delete reservationData.isHistoricalBudget;
        delete reservationData.isReadOnly;

        await db.collection("groups").doc(pmsReserva).set(reservationData);

        // 2. Marcar presupuesto original como bloqueado de mera consulta histórica
        const budgetUpdates = {
          Com_Estado_Interno: "CONFIRMADO",
          Estado: "Confirmado",
          convertedToReservation: pmsReserva,
          targetReservationId: pmsReserva,
          isHistoricalBudget: true,
          isReadOnly: true,
          updatedAt: serverTimestampVal,
          tracking: JSON.stringify([
            {
              id: Date.now(),
              date: formattedDate,
              text: \`Presupuesto confirmado y asignado a reserva definitiva PMS: \${pmsReserva}. Queda bloqueado en modo de mera consulta.\`
            },
            ...track
          ])
        };
        await docRef.update(budgetUpdates);

        // 3. Sincronización a MesaChef si procede
        if (typeof window !== "undefined" && window.MesaChefService && typeof window.MesaChefService.syncGroupToMesachef === "function") {
          try {
            window.MesaChefService.syncGroupToMesachef(reservationData);
          } catch (syncErr) {
            console.warn("MesaChef sync after confirmation warning:", syncErr);
          }
        }

        return { split: false, converted: true, newReservationId: pmsReserva };
      } else {
        track.unshift({
          id: Date.now(),
          date: formattedDate,
          text: \`Estado -> \${requestedStatus}\`
        });

        const updates = {
          Com_Estado_Interno: requestedStatus,
          Estado: "Confirmado",
          updatedAt: serverTimestampVal,
          tracking: JSON.stringify(track)
        };
        await docRef.update(updates);
        return { split: false };
      }
    } else {
      // Normal update/save process: update status and timestamp in parent document`;

if (splitContent.includes(oldConfirmBudgetBlock)) {
  splitContent = splitContent.replace(oldConfirmBudgetBlock, newConfirmBudgetBlock);
  fs.writeFileSync(splitPath, splitContent, 'utf8');
  console.log("Updated splitSeriesReservation.js successfully!");
} else {
  console.warn("Could not find oldConfirmBudgetBlock in splitSeriesReservation.js");
}

console.log("=== 2. Modifying src/GestionGrupos.jsx ===");
const ggPath = path.join(repoDir, 'src/GestionGrupos.jsx');
let ggContent = fs.readFileSync(ggPath, 'utf8');

// A. Filter in processedData
const oldProcessedFilter = `        // 0. Filtro de Validez (Reserva obligatoria) + Normalización de Segmentos
        filtered = filtered
          .filter(
            (row) =>
              (row["Reserva"] &&
               row["Reserva"].toString().trim() !== "" &&
               row["Reserva"].toString().trim() !== "-") ||
              (row["uid"] && row["uid"].toString().startsWith("PRES-"))
          )`;

const newProcessedFilter = `        // REGLA: Si un presupuesto ha sido confirmado con número de reserva del PMS,
        // la referencia única y válida es la reserva. El presupuesto queda de mera consulta y no debe duplicarse en el listado general.
        filtered = filtered.filter(row => {
          const res = String(row["Reserva"] || row.id || row.uid || "").trim();
          if (row.convertedToReservation || row.targetReservationId || row.isHistoricalBudget) {
            return false;
          }
          if (res.toUpperCase().startsWith("PRES-") || res.toUpperCase().startsWith("COT-")) {
            const hasAssociatedReservation = normalizedData.some(other => {
              const otherRes = String(other["Reserva"] || other.id || "").trim();
              if (otherRes === res || otherRes.toUpperCase().startsWith("PRES-")) return false;
              return (
                String(other["Presupuesto_Origen"] || "").trim() === res ||
                String(other["sourceQuoteId"] || "").trim() === res ||
                String(other["Com_Num_Presupuesto"] || "").trim() === res
              );
            });
            if (hasAssociatedReservation) return false;
          }
          return true;
        });

        // 0. Filtro de Validez (Reserva obligatoria) + Normalización de Segmentos
        filtered = filtered
          .filter(
            (row) =>
              (row["Reserva"] &&
               row["Reserva"].toString().trim() !== "" &&
               row["Reserva"].toString().trim() !== "-") ||
              (row["uid"] && row["uid"].toString().startsWith("PRES-"))
          )`;

if (ggContent.includes(oldProcessedFilter)) {
  ggContent = ggContent.replace(oldProcessedFilter, newProcessedFilter);
  console.log("Added reservation priority filter to processedData in GestionGrupos.jsx");
} else {
  console.warn("Could not find oldProcessedFilter in GestionGrupos.jsx");
}

// B. Filter in studyData
const oldStudyFilter = `          const hasReserva = (row["Reserva"] &&
            row["Reserva"].toString().trim() !== "" &&
            row["Reserva"].toString().trim() !== "-") ||
            (row["uid"] && row["uid"].toString().startsWith("PRES-"));
          if (!hasReserva) return false;`;

const newStudyFilter = `          if (row.convertedToReservation || row.targetReservationId || row.isHistoricalBudget) {
            return false;
          }
          const checkRes = String(row["Reserva"] || row.id || row.uid || "").trim();
          if (checkRes.toUpperCase().startsWith("PRES-") || checkRes.toUpperCase().startsWith("COT-")) {
            const hasAssociated = (normalizedData || []).some(other => {
              const otherRes = String(other["Reserva"] || other.id || "").trim();
              if (otherRes === checkRes || otherRes.toUpperCase().startsWith("PRES-")) return false;
              return (
                String(other["Presupuesto_Origen"] || "").trim() === checkRes ||
                String(other["sourceQuoteId"] || "").trim() === checkRes ||
                String(other["Com_Num_Presupuesto"] || "").trim() === checkRes
              );
            });
            if (hasAssociated) return false;
          }

          const hasReserva = (row["Reserva"] &&
            row["Reserva"].toString().trim() !== "" &&
            row["Reserva"].toString().trim() !== "-") ||
            (row["uid"] && row["uid"].toString().startsWith("PRES-"));
          if (!hasReserva) return false;`;

if (ggContent.includes(oldStudyFilter)) {
  ggContent = ggContent.replace(oldStudyFilter, newStudyFilter);
  console.log("Added reservation priority filter to studyData in GestionGrupos.jsx");
} else {
  console.warn("Could not find oldStudyFilter in GestionGrupos.jsx");
}

// C. MesaChef sync filter in snapshot
const oldMesachefSync = `            // Sincronización automática a MesaChef (solo grupos >= 2027 con MP/PC)
            if (window.MesaChefService && typeof window.MesaChefService.syncAllEligibleGroups === "function") {
              window.MesaChefService.syncAllEligibleGroups(dedupedRoomData);
            }`;

const newMesachefSync = `            // Sincronización automática a MesaChef (solo grupos >= 2027 con MP/PC)
            if (window.MesaChefService && typeof window.MesaChefService.syncAllEligibleGroups === "function") {
              const groupsForMesachef = dedupedRoomData.filter(row => {
                if (row.convertedToReservation || row.targetReservationId || row.isHistoricalBudget) return false;
                const r = String(row.Reserva || row.id || "").trim();
                if (r.toUpperCase().startsWith("PRES-")) {
                  const hasRealRes = dedupedRoomData.some(other => {
                    const otherRes = String(other.Reserva || other.id || "").trim();
                    if (otherRes === r || otherRes.toUpperCase().startsWith("PRES-")) return false;
                    return String(other.Presupuesto_Origen || other.sourceQuoteId || "").trim() === r;
                  });
                  if (hasRealRes) return false;
                }
                return true;
              });
              window.MesaChefService.syncAllEligibleGroups(groupsForMesachef);
            }`;

if (ggContent.includes(oldMesachefSync)) {
  ggContent = ggContent.replace(oldMesachefSync, newMesachefSync);
  console.log("Added MesaChef deduplication sync filter in GestionGrupos.jsx");
} else {
  console.warn("Could not find oldMesachefSync in GestionGrupos.jsx");
}

fs.writeFileSync(ggPath, ggContent, 'utf8');

console.log("=== 3. Modifying js/services/mesachefService.js ===");
const mcPath = path.join(repoDir, 'js/services/mesachefService.js');
let mcContent = fs.readFileSync(mcPath, 'utf8');

// A. Filter historical/converted budgets in prepareSalonDocuments
const oldPrepareDocs = `  function prepareSalonDocuments(groupRecord) {
    if (!groupRecord) return [];

    var reservaId = normalizeReservaId(
      groupRecord.reserva || groupRecord.Reserva || groupRecord.id || groupRecord.numReserva || groupRecord.uid
    );
    if (!reservaId) return [];`;

const newPrepareDocs = `  function prepareSalonDocuments(groupRecord) {
    if (!groupRecord) return [];

    // Presupuestos confirmados/convertidos a reserva PMS quedan solo como consulta interna y no se sincronizan
    if (groupRecord.convertedToReservation || groupRecord.targetReservationId || groupRecord.isHistoricalBudget) {
      return [];
    }

    var reservaId = normalizeReservaId(
      groupRecord.reserva || groupRecord.Reserva || groupRecord.id || groupRecord.numReserva || groupRecord.uid
    );
    if (!reservaId) return [];`;

if (mcContent.includes(oldPrepareDocs)) {
  mcContent = mcContent.replace(oldPrepareDocs, newPrepareDocs);
  console.log("Updated prepareSalonDocuments in mesachefService.js");
}

// B. Clean up old budget documents when syncing a confirmed reservation
const oldSyncCase2 = `      // ── CASO 2: RESERVA ACTIVA (CONFIRMADA / PRESUPUESTO / TENTATIVA) ──
      var salonDocs = prepareSalonDocuments(groupRecord);
      if (!salonDocs || salonDocs.length === 0) {
        return Promise.resolve({ skipped: true, reason: "No cumple criterios (solo 2027+ con MP/PC)" });
      }`;

const newSyncCase2 = `      // ── CASO 2: RESERVA ACTIVA (CONFIRMADA / PRESUPUESTO / TENTATIVA) ──
      // Si la reserva oficial tiene un presupuesto de origen asociado, limpiar/eliminar cualquier documento previo con ese código de presupuesto
      var origBudget = groupRecord.Presupuesto_Origen || groupRecord.sourceQuoteId || groupRecord.Com_Num_Presupuesto;
      if (origBudget && String(origBudget).trim() !== String(reservaId).trim()) {
        var cleanPto = normalizeReservaId(origBudget);
        targetDb.collection(COLLECTION_SALONES)
          .where("reservaId", "==", cleanPto)
          .get()
          .then(function (ptoSnap) {
            if (!ptoSnap.empty) {
              var pBatch = targetDb.batch();
              ptoSnap.forEach(function (docSnap) {
                pBatch.delete(docSnap.ref);
              });
              pBatch.commit().then(function () {
                console.log("🧹 [MesaChef Clean] Eliminados " + ptoSnap.size + " eventos duplicados del presupuesto " + cleanPto + " en favor de la reserva " + reservaId);
              }).catch(function (e) {
                console.warn("[MesaChef Clean Error]:", e);
              });
            }
          }).catch(function () {});
        targetDb.collection(COLLECTION_GRUPOS).doc(cleanPto).delete().catch(function () {});
      }

      var salonDocs = prepareSalonDocuments(groupRecord);
      if (!salonDocs || salonDocs.length === 0) {
        return Promise.resolve({ skipped: true, reason: "No cumple criterios (solo 2027+ con MP/PC)" });
      }`;

if (mcContent.includes(oldSyncCase2)) {
  mcContent = mcContent.replace(oldSyncCase2, newSyncCase2);
  console.log("Added budget cleanup to syncGroupToMesachef in mesachefService.js");
}

// C. Filter converted budgets in syncAllEligibleGroups
const oldSyncAllEligible = `    var eligibleGroups = groupsList.filter(function (g) {
      if (!g) return false;
      var entryDate = g.Entrada || g.entrada || g.fechaEntrada || g.fecha;
      if (!isYear2027OrLater(entryDate)) return false;
      var isCanc = isGroupCancelled(g);
      var regimen = String(g["Régimen"] || g.regimen || g.Regimen || "").toUpperCase();
      // Incluir si tiene MP/PC o si está cancelado
      return isMpOrPcRegimen(regimen) || isCanc;
    });`;

const newSyncAllEligible = `    var eligibleGroups = groupsList.filter(function (g) {
      if (!g) return false;
      if (g.convertedToReservation || g.targetReservationId || g.isHistoricalBudget) return false;
      var rId = String(g.Reserva || g.reserva || g.id || "").trim();
      if (rId.toUpperCase().startsWith("PRES-")) {
        var hasRealRes = groupsList.some(function (other) {
          var oId = String(other.Reserva || other.reserva || other.id || "").trim();
          if (oId === rId || oId.toUpperCase().startsWith("PRES-")) return false;
          return String(other.Presupuesto_Origen || other.sourceQuoteId || "").trim() === rId;
        });
        if (hasRealRes) return false;
      }
      var entryDate = g.Entrada || g.entrada || g.fechaEntrada || g.fecha;
      if (!isYear2027OrLater(entryDate)) return false;
      var isCanc = isGroupCancelled(g);
      var regimen = String(g["Régimen"] || g.regimen || g.Regimen || "").toUpperCase();
      return isMpOrPcRegimen(regimen) || isCanc;
    });`;

if (mcContent.includes(oldSyncAllEligible)) {
  mcContent = mcContent.replace(oldSyncAllEligible, newSyncAllEligible);
  console.log("Updated syncAllEligibleGroups filter in mesachefService.js");
}

fs.writeFileSync(mcPath, mcContent, 'utf8');

console.log("=== 4. Modifying src/Presupuestos.jsx for ReadOnly Mode ===");
const presPath = path.join(repoDir, 'src/Presupuestos.jsx');
let presContent = fs.readFileSync(presPath, 'utf8');

// Check read only in handleSave
const oldSaveTop = `      const handleSave = async (e) => {
        e.preventDefault();
        const now = new Date();`;

const newSaveTop = `      const handleSave = async (e) => {
        e.preventDefault();
        const uidToCheck = formData.uid || (groups.find(g => g.Reserva === formData.Reserva)?.uid);
        const oldRec = uidToCheck ? groups.find(g => g.uid === uidToCheck || g.Reserva === uidToCheck) : null;
        const isHistoricalReadOnly = Boolean(
          formData.convertedToReservation ||
          formData.targetReservationId ||
          formData.isHistoricalBudget ||
          formData.isReadOnly ||
          (oldRec && (oldRec.convertedToReservation || oldRec.targetReservationId || oldRec.isHistoricalBudget || oldRec.isReadOnly || oldRec.Com_Estado_Interno === "CONFIRMADO"))
        );

        if (isHistoricalReadOnly && formData.uid) {
          const resNum = formData.convertedToReservation || (oldRec && oldRec.convertedToReservation) || formData.Reserva;
          alert("⚠️ Este presupuesto ya está confirmado y asignado a la Reserva PMS Nº " + resNum + ".\\n\\nLa referencia única y válida es el número de reserva del PMS. Este presupuesto queda bloqueado exclusivamente en modo de consulta y no se puede modificar.");
          return;
        }

        const now = new Date();`;

if (presContent.includes(oldSaveTop)) {
  presContent = presContent.replace(oldSaveTop, newSaveTop);
  console.log("Added read-only protection to handleSave in Presupuestos.jsx");
}

// Banner in editor
const oldFormStart = `            <div className="grid grid-cols-1 gap-8">
              {/* Bloque 1: Información Básica */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-6">`;

const newFormStart = `            {Boolean(formData.convertedToReservation || formData.targetReservationId || formData.isHistoricalBudget || formData.isReadOnly || (formData.Com_Estado_Interno === 'CONFIRMADO' && formData.uid)) && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shrink-0">
                    🔒
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest">
                      Presupuesto Confirmado — Modo Solo Consulta
                    </h4>
                    <p className="text-xs text-amber-800 font-medium mt-0.5">
                      Este presupuesto está confirmado y vinculado a la <strong>Reserva PMS Nº {formData.convertedToReservation || formData.targetReservationId || formData.Reserva}</strong>.
                      La referencia única y válida es la reserva. Todos los datos están protegidos contra modificación.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-200 text-amber-900 px-3 py-1.5 rounded-full shrink-0">
                  Mera Consulta
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8">
              {/* Bloque 1: Información Básica */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-6">`;

if (presContent.includes(oldFormStart)) {
  presContent = presContent.replace(oldFormStart, newFormStart);
  console.log("Added read-only banner to editor in Presupuestos.jsx");
}

fs.writeFileSync(presPath, presContent, 'utf8');

console.log("ALL FILES UPDATED SUCCESSFULLY!");
