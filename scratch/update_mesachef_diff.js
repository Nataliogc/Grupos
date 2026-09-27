const fs = require('fs');
let content = fs.readFileSync('js/services/mesachefService.js', 'utf8');

const targetStr = `      return targetDb.collection(COLLECTION_SALONES)
        .where("reservaId", "==", reservaId)
        .get()
        .then(function (snapshot) {
          var batch = targetDb.batch();

          // A. Guardar o actualizar los servicios actuales con el estado correspondiente
          salonDocs.forEach(function (docData) {
            var ref = targetDb.collection(COLLECTION_SALONES).doc(docData.id);
            batch.set(ref, docData, { merge: true });
          });

          // B. Si había servicios antiguos de esta reserva que ya no corresponden a las fechas, anularlos
          snapshot.forEach(function (docSnap) {
            if (!activeDocIds.has(docSnap.id)) {
              batch.update(docSnap.ref, {
                estado: "cancelada",
                updated_at: new Date().toISOString()
              });
            }
          });

          // C. Guardar ficha maestra en mesachef_grupos
          var firstDoc = salonDocs[0];
          var groupMasterRef = targetDb.collection(COLLECTION_GRUPOS).doc(firstDoc.reservaId);
          batch.set(groupMasterRef, {
            id: firstDoc.reservaId,
            referencia: firstDoc.reservaId,
            cliente: firstDoc.cliente,
            hotel: firstDoc.hotel,
            salon: firstDoc.salon,
            estado: firstDoc.estado,
            pax: firstDoc.detalles.pax_adultos,
            totalServicios: salonDocs.length,
            origen: "Nexus Groups",
            updated_at: new Date().toISOString()
          }, { merge: true });

          return batch.commit().then(function () {
            console.log("🍽️ [MesaChef Sync] Reserva " + firstDoc.reservaId + " sincronizada con estado '" + firstDoc.estado + "' en " + firstDoc.hotel + " (" + firstDoc.salon + "): " + salonDocs.length + " servicios en " + COLLECTION_SALONES);
            return { success: true, count: salonDocs.length, hotel: firstDoc.hotel, salon: firstDoc.salon, docs: salonDocs };
          });
        })`;

const replacementStr = `      return targetDb.collection(COLLECTION_SALONES)
        .where("reservaId", "==", reservaId)
        .get()
        .then(function (snapshot) {
          var batch = targetDb.batch();
          var writesCount = 0;
          var existingMap = new Map();
          snapshot.forEach(function (docSnap) {
            existingMap.set(docSnap.id, docSnap.data());
          });

          // A. Guardar o actualizar los servicios actuales ÚNICAMENTE si han cambiado o no existen
          salonDocs.forEach(function (docData) {
            var existing = existingMap.get(docData.id);
            var isDifferent = false;
            if (!existing) {
              isDifferent = true;
            } else {
              var oldDetalles = existing.detalles || {};
              var newDetalles = docData.detalles || {};
              var oldFirstSvc = (existing.servicios && existing.servicios[0]) || {};
              var newFirstSvc = (docData.servicios && docData.servicios[0]) || {};

              if (
                existing.estado !== docData.estado ||
                existing.cliente !== docData.cliente ||
                existing.hotel !== docData.hotel ||
                existing.salon !== docData.salon ||
                existing.fecha !== docData.fecha ||
                oldDetalles.pax_adultos !== newDetalles.pax_adultos ||
                oldDetalles.hora !== newDetalles.hora ||
                oldDetalles.jornada !== newDetalles.jornada ||
                oldDetalles.montaje !== newDetalles.montaje ||
                oldFirstSvc.uds !== newFirstSvc.uds ||
                oldFirstSvc.concepto !== newFirstSvc.concepto
              ) {
                isDifferent = true;
              }
            }

            if (isDifferent) {
              var ref = targetDb.collection(COLLECTION_SALONES).doc(docData.id);
              batch.set(ref, docData, { merge: true });
              writesCount++;
            }
          });

          // B. Si había servicios antiguos de esta reserva que ya no corresponden a las fechas, anularlos (solo si no están ya cancelados)
          snapshot.forEach(function (docSnap) {
            if (!activeDocIds.has(docSnap.id)) {
              var oldData = docSnap.data() || {};
              if (oldData.estado !== "cancelada") {
                batch.update(docSnap.ref, {
                  estado: "cancelada",
                  updated_at: new Date().toISOString()
                });
                writesCount++;
              }
            }
          });

          var firstDoc = salonDocs[0];

          // C. Si no hubo ninguna diferencia real, nos ahorramos la escritura en Firestore
          if (writesCount === 0) {
            return { success: true, count: 0, skipped: true, reason: "Sin cambios detectados (ahorro de costes)" };
          }

          // Guardar ficha maestra en mesachef_grupos
          var groupMasterRef = targetDb.collection(COLLECTION_GRUPOS).doc(firstDoc.reservaId);
          batch.set(groupMasterRef, {
            id: firstDoc.reservaId,
            referencia: firstDoc.reservaId,
            cliente: firstDoc.cliente,
            hotel: firstDoc.hotel,
            salon: firstDoc.salon,
            estado: firstDoc.estado,
            pax: firstDoc.detalles.pax_adultos,
            totalServicios: salonDocs.length,
            origen: "Nexus Groups",
            updated_at: new Date().toISOString()
          }, { merge: true });

          return batch.commit().then(function () {
            console.log("🍽️ [MesaChef Sync] Reserva " + firstDoc.reservaId + " actualizada (" + writesCount + " operaciones escritas en Firestore por cambios reales).");
            return { success: true, count: writesCount, hotel: firstDoc.hotel, salon: firstDoc.salon, docs: salonDocs };
          });
        })`;

const targetCRLF = targetStr.replace(/\n/g, '\r\n');
const replacementCRLF = replacementStr.replace(/\n/g, '\r\n');

if (content.includes(targetCRLF)) {
  content = content.replace(targetCRLF, replacementCRLF);
  fs.writeFileSync('js/services/mesachefService.js', content, 'utf8');
  console.log('Successfully updated mesachefService.js with CRLF');
} else if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('js/services/mesachefService.js', content, 'utf8');
  console.log('Successfully updated mesachefService.js with LF');
} else {
  console.error('Target string not found in js/services/mesachefService.js');
}
