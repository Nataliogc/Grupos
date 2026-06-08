const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'Presupuestos.js');
let code = fs.readFileSync(filePath, 'utf8');

const detailFollowUpPattern = /\/\*#__PURE__\*\/React\.createElement\("div", \{\n\s*className: "flex items-start gap-4 p-4 bg-slate-50\/50 rounded-2xl border border-slate-100"\n\s*\}, \/\*#__PURE__\*\/React\.createElement\("div", \{\n\s*className: "w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"/;

const detailFollowUpReplace = `/*#__PURE__*/React.createElement("div", {
        className: "relative flex items-start gap-4 p-4 bg-amber-50/30 hover:bg-amber-50 transition-colors rounded-2xl border border-amber-100/50 overflow-hidden group"
      }, 
      /*#__PURE__*/React.createElement("input", {
          type: "date",
          className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
          value: g.followUpDate || "",
          onChange: function(e) {
             var newDate = e.target.value;
             db.collection("groups").doc(g.uid).update({ followUpDate: newDate }).catch(function(err) {
                 console.error("Error actualizando fecha de seguimiento", err);
                 alert("Error actualizando fecha.");
             });
          },
          title: "Haz clic para cambiar la fecha de seguimiento"
      }),
      /*#__PURE__*/React.createElement("div", {
        className: "w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-amber-200 transition-colors flex items-center justify-center shrink-0 relative z-0"`;

code = code.replace(detailFollowUpPattern, detailFollowUpReplace);

fs.writeFileSync(filePath, code);
console.log('Presupuestos.js updated to allow inline clicking of follow up date.');
