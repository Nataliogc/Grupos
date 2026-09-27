const fs = require('fs');
let content = fs.readFileSync('src/GestionGrupos.jsx', 'utf8');

const target = `const savePayload = {
                                      RoomingList_JSON: JSON.stringify(currentRL || []),
                                      DailyDistribution_JSON: JSON.stringify(distMap || {})
                                    };`;

const targetCRLF = target.replace(/\n/g, '\r\n');

const replacement = `const savePayload = {
                                      RoomingList_JSON: JSON.stringify(currentRL || []),
                                      DailyDistribution_JSON: JSON.stringify(distMap || {}),
                                      "Pax.": String(selectedGroupFicha.totalPax || 0),
                                      "Cant.": String(selectedGroupFicha.totalRooms || 0),
                                      "Importe(*)": String(selectedGroupFicha.totalRevenue !== undefined ? Number(selectedGroupFicha.totalRevenue).toFixed(2) : (currentRec["Importe(*)"] || "0.00"))
                                    };`;

const replacementCRLF = replacement.replace(/\n/g, '\r\n');

if (content.includes(targetCRLF)) {
  content = content.replace(targetCRLF, replacementCRLF);
  fs.writeFileSync('src/GestionGrupos.jsx', content, 'utf8');
  console.log('Successfully updated with CRLF');
} else if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/GestionGrupos.jsx', content, 'utf8');
  console.log('Successfully updated with LF');
} else {
  console.log('Could not find target');
}
