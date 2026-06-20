const fs = require('fs');
const path = 'C:/Users/comun/Documents/GitHub/Grupos/src/GestionGrupos.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `proformaData["ProformaItems"] = mappedItems;`;
const consoleLogCode = `
            console.log("[PROFORMA ECONOMIC ITEMS]", mappedItems);
            proformaData["ProformaItems"] = mappedItems;
`;

if (content.includes(targetStr) && !content.includes('[PROFORMA ECONOMIC ITEMS]')) {
    content = content.replace(targetStr, consoleLogCode);
    fs.writeFileSync(path, content);
    console.log("Proforma log added.");
} else {
    console.log("Proforma log already present or target missing.");
}
