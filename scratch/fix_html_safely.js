const fs = require('fs');
const path = require('path');

// Fix Fac Prof.html
const facProfPath = path.join(__dirname, '..', 'Fac Prof.html');
if (fs.existsSync(facProfPath)) {
    let content = fs.readFileSync(facProfPath, 'utf8');
    
    // Locate: const totalNeto = total - totalComision;
    // We want to insert the function parseClauseVariables after it
    const searchTarget = 'const totalNeto = total - totalComision;';
    const insertion = `
                        const parseClauseVariables = (text) => {
                            if (!text) return "";
                            let parsed = text;
                            parsed = parsed.replace(/{DEP_30}/g, formatNum(totalNeto * 0.3) + ' EUR');
                            parsed = parsed.replace(/{DEP_50}/g, formatNum(totalNeto * 0.5) + ' EUR');
                            parsed = parsed.replace(/{DEP_100}/g, formatNum(totalNeto) + ' EUR');
                            const getRelDate = (days) => {
                                if (!groupData.Entrada) return "[FECHA]";
                                let d = new Date(groupData.Entrada);
                                if (isNaN(d.getTime())) {
                                    const parts = groupData.Entrada.split('/');
                                    if(parts.length===3) d = new Date(parts[2], parts[1]-1, parts[0]);
                                }
                                if (isNaN(d.getTime())) return groupData.Entrada;
                                d.setDate(d.getDate() - days);
                                return d.toLocaleDateString('es-ES');
                            };
                            parsed = parsed.replace(/{RELEASE_30}/g, getRelDate(30));
                            parsed = parsed.replace(/{RELEASE_15}/g, getRelDate(15));
                            parsed = parsed.replace(/{RELEASE_7}/g, getRelDate(7));
                            return parsed;
                        };
    `;

    if (content.includes(searchTarget) && !content.includes('const parseClauseVariables = (text) => {')) {
        content = content.replace(searchTarget, searchTarget + '\n' + insertion);
        
        // Now replace the body rendering line
        const targetLine = `\${(c.body || '').replace(/{DEP_30}/g, formatNum(totalNeto * 0.3) + ' EUR')}`;
        content = content.replace(targetLine, `\${parseClauseVariables(c.body || "")}`);
        
        fs.writeFileSync(facProfPath, content, 'utf8');
        console.log('Successfully fixed Fac Prof.html');
    } else {
        console.log('Fac Prof.html could not be updated or was already updated');
    }
}

// Fix temp.js
const tempJsPath = path.join(__dirname, '..', 'temp.js');
if (fs.existsSync(tempJsPath)) {
    let content = fs.readFileSync(tempJsPath, 'utf8');
    
    const searchTarget = 'const totalNeto = total - totalComision;';
    const insertion = `
                        const parseClauseVariables = (text) => {
                            if (!text) return "";
                            let parsed = text;
                            parsed = parsed.replace(/{DEP_30}/g, formatNum(totalNeto * 0.3) + '€');
                            parsed = parsed.replace(/{DEP_50}/g, formatNum(totalNeto * 0.5) + '€');
                            parsed = parsed.replace(/{DEP_100}/g, formatNum(totalNeto) + '€');
                            const getRelDate = (days) => {
                                if (!groupData.Entrada) return "[FECHA]";
                                let d = new Date(groupData.Entrada);
                                if (isNaN(d.getTime())) {
                                    const parts = groupData.Entrada.split('/');
                                    if(parts.length===3) d = new Date(parts[2], parts[1]-1, parts[0]);
                                }
                                if (isNaN(d.getTime())) return groupData.Entrada;
                                d.setDate(d.getDate() - days);
                                return d.toLocaleDateString('es-ES');
                            };
                            parsed = parsed.replace(/{RELEASE_30}/g, getRelDate(30));
                            parsed = parsed.replace(/{RELEASE_15}/g, getRelDate(15));
                            parsed = parsed.replace(/{RELEASE_7}/g, getRelDate(7));
                            return parsed;
                        };
    `;

    if (content.includes(searchTarget) && !content.includes('const parseClauseVariables = (text) => {')) {
        content = content.replace(searchTarget, searchTarget + '\n' + insertion);
        
        const targetLine = `\${(c.body || '').replace(/{DEP_30}/g, formatNum(totalNeto * 0.3) + '€')}`;
        content = content.replace(targetLine, `\${parseClauseVariables(c.body || "")}`);
        
        fs.writeFileSync(tempJsPath, content, 'utf8');
        console.log('Successfully fixed temp.js');
    } else {
        console.log('temp.js could not be updated or was already updated');
    }
}
