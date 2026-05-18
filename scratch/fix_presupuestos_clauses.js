const fs = require('fs');
const path = require('path');

const replacement = `    var getEffectiveClauses = function getEffectiveClauses() {
      var baseClauses = docMode === 'confirmacion' ? CONF_DEFAULT_CLAUSES : BUDGET_DEFAULT_CLAUSES;
      if (Array.isArray(g[groupKey]) && g[groupKey].length > 0) baseClauses = g[groupKey];
      else if (globalConfig && globalConfig[hotelKey] && Array.isArray(globalConfig[hotelKey][modeKey]) && globalConfig[hotelKey][modeKey].length > 0) baseClauses = globalConfig[hotelKey][modeKey];
      else if (globalConfig && globalConfig.common && Array.isArray(globalConfig.common[modeKey]) && globalConfig.common[modeKey].length > 0) baseClauses = globalConfig.common[modeKey];
      
      var plan = [];
      try {
        plan = JSON.parse(g.PaymentPlan_JSON || "[]");
      } catch(e){}
      
      if (plan && plan.length > 0) {
        var firstPayment = plan[0];
        var otherPayments = plan.slice(1);
        
        var fDate = function fDate(dStr) {
          if (!dStr) return "[FECHA]";
          var d = new Date(dStr);
          return isNaN(d.getTime()) ? dStr : d.toLocaleDateString('es-ES');
        };
        
        var dynamicClauses = JSON.parse(JSON.stringify(baseClauses));
        dynamicClauses.forEach(function(c) {
          if (c.title === "Confirmación y Depósito" || c.title === "Confirmación y Depósito / Confirmation & Deposit") {
            c.body = "Para garantizar la reserva definitiva, se requiere un primer depósito del " + firstPayment.percent + "% (" + formatNum(firstPayment.amount) + "€) en concepto de garantía antes del " + fDate(firstPayment.date) + ". La reserva no se considerará confirmada hasta la recepción del mismo. [EN] To guarantee the definitive reservation, a first deposit of " + firstPayment.percent + "% (" + formatNum(firstPayment.amount) + "€) is required as a guarantee before " + fDate(firstPayment.date) + ". The reservation will not be considered confirmed until it is received.";
          }
          if (c.title === "Calendario de Pagos y Release" || c.title === "Calendario de Pagos y Release / Payment Schedule") {
            if (otherPayments.length > 0) {
              var esText = "Se establece el siguiente calendario de pagos:\\n";
              var enText = "The following payment schedule is established:\\n";
              otherPayments.forEach(function(p) {
                esText += "- Un pago del " + p.percent + "% (" + formatNum(p.amount) + "€) con fecha límite " + fDate(p.date) + " (" + p.releaseDays + " días previos a la entrada).\\n";
                enText += "- A payment of " + p.percent + "% (" + formatNum(p.amount) + "€) with deadline " + fDate(p.date) + " (" + p.releaseDays + " days prior to entry).\\n";
              });
              c.body = esText.trim() + " [EN] " + enText.trim();
            } else {
              c.body = "Se establece un pago único del " + firstPayment.percent + "% (" + formatNum(firstPayment.amount) + "€) antes del " + fDate(firstPayment.date) + ". [EN] A single payment of " + firstPayment.percent + "% (" + formatNum(firstPayment.amount) + "€) is established before " + fDate(firstPayment.date) + ".";
            }
          }
        });
        return dynamicClauses;
      }
      return baseClauses;
    };`;

const targetContent1 = `    var getEffectiveClauses = function getEffectiveClauses() {
      if (Array.isArray(g[groupKey]) && g[groupKey].length > 0) return g[groupKey];
      if (globalConfig && globalConfig[hotelKey] && Array.isArray(globalConfig[hotelKey][modeKey]) && globalConfig[hotelKey][modeKey].length > 0) return globalConfig[hotelKey][modeKey];
      if (globalConfig && globalConfig.common && Array.isArray(globalConfig.common[modeKey]) && globalConfig.common[modeKey].length > 0) return globalConfig.common[modeKey];
      return docMode === 'confirmacion' ? CONF_DEFAULT_CLAUSES : BUDGET_DEFAULT_CLAUSES;
    };`;

const targetContent2 = `        const getEffectiveClauses = () => {
          if (Array.isArray(g[groupKey]) && g[groupKey].length > 0) return g[groupKey];
          if (globalConfig && globalConfig[hotelKey] && Array.isArray(globalConfig[hotelKey][modeKey]) && globalConfig[hotelKey][modeKey].length > 0) return globalConfig[hotelKey][modeKey];
          if (globalConfig && globalConfig.common && Array.isArray(globalConfig.common[modeKey]) && globalConfig.common[modeKey].length > 0) return globalConfig.common[modeKey];
          return docMode === 'confirmacion' ? CONF_DEFAULT_CLAUSES : BUDGET_DEFAULT_CLAUSES;
        };`;

const replacement2 = `        const getEffectiveClauses = () => {
          let baseClauses = docMode === 'confirmacion' ? CONF_DEFAULT_CLAUSES : BUDGET_DEFAULT_CLAUSES;
          if (Array.isArray(g[groupKey]) && g[groupKey].length > 0) baseClauses = g[groupKey];
          else if (globalConfig && globalConfig[hotelKey] && Array.isArray(globalConfig[hotelKey][modeKey]) && globalConfig[hotelKey][modeKey].length > 0) baseClauses = globalConfig[hotelKey][modeKey];
          else if (globalConfig && globalConfig.common && Array.isArray(globalConfig.common[modeKey]) && globalConfig.common[modeKey].length > 0) baseClauses = globalConfig.common[modeKey];
          
          let plan = [];
          try {
            plan = JSON.parse(g.PaymentPlan_JSON || "[]");
          } catch(e){}
          
          if (plan && plan.length > 0) {
            const firstPayment = plan[0];
            const otherPayments = plan.slice(1);
            
            const fDate = (dStr) => {
              if (!dStr) return "[FECHA]";
              const d = new Date(dStr);
              return isNaN(d.getTime()) ? dStr : d.toLocaleDateString('es-ES');
            };
            
            const dynamicClauses = JSON.parse(JSON.stringify(baseClauses));
            dynamicClauses.forEach(c => {
              if (c.title === "Confirmación y Depósito" || c.title === "Confirmación y Depósito / Confirmation & Deposit") {
                c.body = \`Para garantizar la reserva definitiva, se requiere un primer depósito del \${firstPayment.percent}% (\${formatNum(firstPayment.amount)}€) en concepto de garantía antes del \${fDate(firstPayment.date)}. La reserva no se considerará confirmada hasta la recepción del mismo. [EN] To guarantee the definitive reservation, a first deposit of \${firstPayment.percent}% (\${formatNum(firstPayment.amount)}€) is required as a guarantee before \${fDate(firstPayment.date)}. The reservation will not be considered confirmed until it is received.\`;
              }
              if (c.title === "Calendario de Pagos y Release" || c.title === "Calendario de Pagos y Release / Payment Schedule") {
                if (otherPayments.length > 0) {
                  let esText = "Se establece el siguiente calendario de pagos:\\n";
                  let enText = "The following payment schedule is established:\\n";
                  otherPayments.forEach(p => {
                    esText += \`- Un pago del \${p.percent}% (\${formatNum(p.amount)}€) con fecha límite \${fDate(p.date)} (\${p.releaseDays} días previos a la entrada).\\n\`;
                    enText += \`- A payment of \${p.percent}% (\${formatNum(p.amount)}€) with deadline \${fDate(p.date)} (\${p.releaseDays} days prior to entry).\\n\`;
                  });
                  c.body = esText.trim() + " [EN] " + enText.trim();
                } else {
                  c.body = \`Se establece un pago único del \${firstPayment.percent}% (\${formatNum(firstPayment.amount)}€) antes del \${fDate(firstPayment.date)}. [EN] A single payment of \${firstPayment.percent}% (\${formatNum(firstPayment.amount)}€) is established before \${fDate(firstPayment.date)}.\`;
                }
              }
            });
            return dynamicClauses;
          }
          return baseClauses;
        };`;

function doReplace(filePath, t, r) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(t, r);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + filePath);
}

doReplace(path.join(__dirname, 'js/Presupuestos.js'), targetContent1, replacement);
doReplace(path.join(__dirname, 'src/Presupuestos.jsx'), targetContent2, replacement2);
