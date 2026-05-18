const fs = require('fs');
const path = require('path');

function processHtml(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // We need to find where clauses are rendered. Usually it's something like:
    // ${(c.body || '').replace(/{DEP_30}/g, formatNum(totalNeto * 0.3) + ' EUR')}
    // or similar.
    
    // Let's inject a parseClauseVariables function right before allC.map
    const parseFunc = `
                                        const parseClauseVariables = (text) => {
                                            if (!text) return "";
                                            let parsed = text;
                                            parsed = parsed.replace(/{DEP_30}/g, formatNum(totalNeto * 0.3) + ' EUR');
                                            parsed = parsed.replace(/{DEP_50}/g, formatNum(totalNeto * 0.5) + ' EUR');
                                            parsed = parsed.replace(/{DEP_100}/g, formatNum(totalNeto) + ' EUR');
                                            const getRelDate = (days) => {
                                                if (!group.Entrada) return "[FECHA]";
                                                let d = new Date(group.Entrada);
                                                if (isNaN(d.getTime())) {
                                                    // try to parse dd/mm/yyyy
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
    
    if (content.includes('allC.map') && !content.includes('parseClauseVariables = (text) => {')) {
        content = content.replace('${allC.map((c, i) => {', parseFunc + '\n                                    ${allC.map((c, i) => {');
        content = content.replace(/\$\(\(c\.body \|\| ''\)\)\.replace\([^}]+\)/g, '${parseClauseVariables(c.body || "")}');
        // Wait, the regex might be tricky. Let's just do standard replace
        content = content.replace(/\$\(\(c\.body \|\| ''\)\.replace\(\{DEP_30\}\/g, formatNum\(totalNeto \* 0\.3\) \+ ' EUR'\)\}/g, '${parseClauseVariables(c.body || "")}');
        content = content.replace(/\$\(\(c\.body \|\| ''\)\.replace\(\{DEP_30\}\/g, formatNum\(totalNetoPagar \* 0\.3\) \+ ' EUR'\)\}/g, '${parseClauseVariables(c.body || "")}');
        content = content.replace(/\$\(\(c\.body \|\| ''\)\.replace\(\{DEP_30\}\/g, formatNum\(totalNeto \* 0\.3\) \+ '€'\)\}/g, '${parseClauseVariables(c.body || "")}');
        content = content.replace(/\$\(\(c\.body \|\| ''\)\.replace\(\{DEP_30\}\/g, formatNum\(totalNetoPagar \* 0\.3\) \+ '€'\)\}/g, '${parseClauseVariables(c.body || "")}');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + filePath);
}

processHtml(path.join(__dirname, '..', 'Fac Prof.html'));
processHtml(path.join(__dirname, '..', 'Orden Servicio.html'));
processHtml(path.join(__dirname, '..', 'Proformas.html'));
processHtml(path.join(__dirname, '..', 'temp.js'));
