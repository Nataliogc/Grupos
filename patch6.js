const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'Presupuestos.js');
let code = fs.readFileSync(filePath, 'utf8');

// The broken code looks like:
//      }, formatDate(g.Entrada)), /*#__PURE__*/React.createElement("td", {
//        className: "px-6 py-4"
//      }, function() {
//        ...
//        return /*#__PURE__*/React.createElement("span", {
//          className: "px-2.5 py-1 rounded-md text-[10px] inline-block " + followUpClass
//        }, followUpDisplay);
//      }()), /*#__PURE__*/React.createElement("span", {
//        className: "text-[8px] font-bold text-slate-400 uppercase tracking-widest"
//      }, "Click p/ Gesti\\xF3n"))), /*#__PURE__*/React.createElement("td", {
//        className: "px-6 py-4 text-center"

// Step 1: Remove the wrongly injected td from inside the Entrada div
const brokenPattern = /\}, formatDate\(g\.Entrada\)\), \/\*#__PURE__\*\/React\.createElement\("td", \{\s*className: "px-6 py-4"\s*\}, function\(\) \{[\s\S]*?return \/\*#__PURE__\*\/React\.createElement\("span", \{\s*className: "px-2\.5 py-1 rounded-md text-\[10px\] inline-block " \+ followUpClass\s*\}, followUpDisplay\);\s*\}\(\)\), \/\*#__PURE__\*\/React\.createElement\("span", \{/;

const fixedEntradaPattern = `}, formatDate(g.Entrada)), /*#__PURE__*/React.createElement("span", {`;

code = code.replace(brokenPattern, fixedEntradaPattern);

// Step 2: Inject the new td properly AFTER the Entrada td closes
const afterEntradaPattern = /\}, "Click p\/ Gesti\\xF3n"\)\)\), \/\*#__PURE__\*\/React\.createElement\("td", \{\n\s*className: "px-6 py-4 text-center"\n\s*\}, function \(_g\$createdAt\) \{/;

const properInjection = `}, "Click p/ Gesti\\xF3n"))), 
      /*#__PURE__*/React.createElement("td", {
        className: "px-6 py-4"
      }, function() {
        var followUpDisplay = "Sin seguimiento";
        var followUpClass = "text-slate-400 bg-slate-100";
        if (g.followUpDate) {
            var parts = g.followUpDate.split('-');
            if (parts.length === 3) {
              var fuDate = new Date(parts[0], parts[1] - 1, parts[2]);
              var today = new Date();
              today.setHours(0,0,0,0);
              if (fuDate < today) {
                  followUpDisplay = "Vencido";
                  followUpClass = "text-rose-600 bg-rose-100 font-bold border border-rose-200";
              } else if (fuDate.getTime() === today.getTime()) {
                  followUpDisplay = "Hoy";
                  followUpClass = "text-amber-600 bg-amber-100 font-bold border border-amber-200";
              } else {
                  followUpDisplay = formatDate(g.followUpDate);
                  followUpClass = "text-indigo-600 bg-indigo-50 border border-indigo-100";
              }
            }
        }
        return /*#__PURE__*/React.createElement("span", {
          className: "px-2.5 py-1 rounded-md text-[10px] inline-block " + followUpClass
        }, followUpDisplay);
      }()), 
      /*#__PURE__*/React.createElement("td", {
        className: "px-6 py-4 text-center"
      }, function (_g$createdAt) {`;

code = code.replace(afterEntradaPattern, properInjection);

fs.writeFileSync(filePath, code);
console.log('Presupuestos.js table structure fixed successfully.');
