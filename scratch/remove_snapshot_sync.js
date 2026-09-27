const fs = require('fs');
let content = fs.readFileSync('src/GestionGrupos.jsx', 'utf8');

const targetStr = `            // Sincronización automática a MesaChef (solo grupos >= 2027 con MP/PC)
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

const targetCRLF = targetStr.replace(/\n/g, '\r\n');

if (content.includes(targetCRLF)) {
  content = content.replace(targetCRLF, '            // Sincronización a MesaChef optimizada: se ejecuta únicamente cuando el usuario guarda cambios reales, evitando escrituras innecesarias.');
  fs.writeFileSync('src/GestionGrupos.jsx', content, 'utf8');
  console.log('Successfully removed redundant snapshot sync with CRLF');
} else if (content.includes(targetStr)) {
  content = content.replace(targetStr, '            // Sincronización a MesaChef optimizada: se ejecuta únicamente cuando el usuario guarda cambios reales, evitando escrituras innecesarias.');
  fs.writeFileSync('src/GestionGrupos.jsx', content, 'utf8');
  console.log('Successfully removed redundant snapshot sync with LF');
} else {
  console.error('Target string not found in src/GestionGrupos.jsx');
}
