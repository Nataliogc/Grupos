const fs = require('fs');
const path = 'C:/Users/comun/Documents/GitHub/Grupos/src/GestionGrupos.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix rawRL
content = content.replace(
    'const rawRL = parseRoomingListSafe(selectedGroupFicha.records[0]?.["RoomingList_JSON"], "selectedGroupFicha");',
    'const rawRL = typeof window.roomingCore !== "undefined" && window.roomingCore.getGroupEconomicItems ? window.roomingCore.getGroupEconomicItems(selectedGroupFicha) : parseRoomingListSafe(selectedGroupFicha.records[0]?.["RoomingList_JSON"], "selectedGroupFicha");'
);

// 2. Fix handleProformaClick to send the correct items
// We need to find: proformaData["ProformaItems"] = mappedItems;
// And mappedItems is derived from roomList.
// In handleProformaClick, roomList is populated from getGroupEconomicItems, which is good.
// But we need to make sure Proforma HTML actually renders ALL of them without filtering out non-accommodation.

fs.writeFileSync(path, content);
console.log("Patched 1: rawRL");
