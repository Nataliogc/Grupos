const fs = require('fs');
const path = require('path');

const funcCode = `
                                        const parseClauseVariables = (text) => {
                                            if (!text) return "";
                                            let parsed = text;
                                            parsed = parsed.replace(/{DEP_30}/g, formatNum(typeof totalNeto !== 'undefined' ? totalNeto * 0.3 : totalNetoPagar * 0.3) + ' EUR');
                                            parsed = parsed.replace(/{DEP_50}/g, formatNum(typeof totalNeto !== 'undefined' ? totalNeto * 0.5 : totalNetoPagar * 0.5) + ' EUR');
                                            parsed = parsed.replace(/{DEP_100}/g, formatNum(typeof totalNeto !== 'undefined' ? totalNeto : totalNetoPagar) + ' EUR');
                                            
                                            const getRelDate = (days) => {
                                                if (!group.Entrada) return "[FECHA]";
                                                let d = new Date(group.Entrada);
                                                if (isNaN(d.getTime())) {
                                                    const parts = group.Entrada.split('/');
                                                    if(parts.length===3) d = new Date(parts[2], parts[1]-1, parts[0]);
                                                }
                                                if (isNaN(d.getTime())) return group.Entrada;
                                                d.setDate(d.getDate() - days);
                                                return d.toLocaleDateString('es-ES');
                                            };
                                            parsed = parsed.replace(/{RELEASE_30}/g, getRelDate(30));
                                            parsed = parsed.replace(/{RELEASE_15}/g, getRelDate(15));
                                            parsed = parsed.replace(/{RELEASE_7}/g, getRelDate(7));
                                            return parsed;
                                        };
`;

function processHtml(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('allC.map') && !content.includes('parseClauseVariables = (text) => {')) {
        content = content.replace('${allC.map((c, i) => {', funcCode + '\n                                    ${allC.map((c, i) => {');
        
        let r1 = `\${(c.body || '').replace(/{DEP_30}/g, formatNum(totalNeto * 0.3) + ' EUR')}`;
        let r2 = `\${(c.body || '').replace(/{DEP_30}/g, formatNum(totalNetoPagar * 0.3) + ' EUR')}`;
        let r3 = `\${(c.body || '').replace(/{DEP_30}/g, formatNum(totalNeto * 0.3) + '€')}`;
        let r4 = `\${(c.body || '').replace(/{DEP_30}/g, formatNum(totalNetoPagar * 0.3) + '€')}`;
        
        content = content.split(r1).join('${parseClauseVariables(c.body)}');
        content = content.split(r2).join('${parseClauseVariables(c.body)}');
        content = content.split(r3).join('${parseClauseVariables(c.body)}');
        content = content.split(r4).join('${parseClauseVariables(c.body)}');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + filePath);
}

processHtml(path.join(__dirname, '..', 'Fac Prof.html'));
processHtml(path.join(__dirname, '..', 'Orden Servicio.html'));
processHtml(path.join(__dirname, '..', 'Proformas.html'));
processHtml(path.join(__dirname, '..', 'temp.js'));
