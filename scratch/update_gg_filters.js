const fs = require('fs');
const path = require('path');

const repoDir = 'c:/Users/comun/Documents/GitHub/Grupos';
const ggPath = path.join(repoDir, 'src/GestionGrupos.jsx');
let content = fs.readFileSync(ggPath, 'utf8');

// 1. In processedData
const searchMarker1 = 'filtered = filtered.filter(row => {\n          const res = String(row["Reserva"]';
const searchMarker1CRLF = 'filtered = filtered.filter(row => {\r\n          const res = String(row["Reserva"]';

const toInject1 = `        // REGLA: Si un presupuesto ha sido confirmado con número de reserva del PMS,
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
        });\n\n`;

if (content.includes(searchMarker1CRLF)) {
  content = content.replace(searchMarker1CRLF, toInject1.replace(/\n/g, '\r\n') + '        ' + searchMarker1CRLF);
  console.log('Injected filter in processedData (CRLF)');
} else if (content.includes(searchMarker1)) {
  content = content.replace(searchMarker1, toInject1 + '        ' + searchMarker1);
  console.log('Injected filter in processedData (LF)');
} else {
  console.warn('Could not find searchMarker1');
}

// 2. In studyData
const searchMarker2 = 'const hasReserva = (row["Reserva"] &&';
const toInject2 = `if (row.convertedToReservation || row.targetReservationId || row.isHistoricalBudget) {
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
          }\n\n          `;

if (content.includes(searchMarker2)) {
  content = content.replace(searchMarker2, toInject2.replace(/\n/g, '\r\n') + searchMarker2);
  console.log('Injected filter in studyData');
} else {
  console.warn('Could not find searchMarker2');
}

// 3. In MesaChef sync
const searchMarker3 = 'window.MesaChefService.syncAllEligibleGroups(dedupedRoomData);';
const toInject3 = `const groupsForMesachef = dedupedRoomData.filter(row => {
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
              window.MesaChefService.syncAllEligibleGroups(groupsForMesachef);`;

if (content.includes(searchMarker3)) {
  content = content.replace(searchMarker3, toInject3.replace(/\n/g, '\r\n'));
  console.log('Injected filter in MesaChef sync');
} else {
  console.warn('Could not find searchMarker3');
}

fs.writeFileSync(ggPath, content, 'utf8');
console.log('Done updating GestionGrupos.jsx');
