const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'Presupuestos.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. DETAIL VIEW BOX
// We need to replace the whole detail view box injected previously.
// It starts with /*#__PURE__*/React.createElement("div", { className: "relative flex items-start gap-4 p-4 bg-amber-50/30 ...
// and ends right before /*#__PURE__*/React.createElement("div", { className: "space-y-0.5" }, /*#__PURE__*/React.createElement("span", { className: "text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest" }, "Pax Estimados")

const detailBoxPattern = /\/\*#__PURE__\*\/React\.createElement\("div", \{\n\s*className: "relative flex items-start gap-4 p-4 bg-amber-50\/30[\s\S]*?Sin seguimiento programado"\)\)\), \/\*#__PURE__\*\/React\.createElement\("div", \{/g;

const detailBoxReplace = `/*#__PURE__*/React.createElement("div", {
        className: "flex items-start gap-4 p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50 print:hidden"
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-calendar-check text-amber-600"
      })), /*#__PURE__*/React.createElement("div", { className: "flex-1" }, /*#__PURE__*/React.createElement("h4", {
        className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"
      }, "Pr\\xF3ximo Seguimiento"), /*#__PURE__*/React.createElement("input", {
        type: "date",
        className: "w-full bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-amber-500/20 rounded px-1 -ml-1 transition-all",
        value: g.followUpDate || "",
        onChange: function(e) {
           var newDate = e.target.value;
           db.collection("groups").doc(g.uid).update({ followUpDate: newDate }).catch(function(err) {
               console.error("Error actualizando fecha", err);
           });
        }
      }))), /*#__PURE__*/React.createElement("div", {`;

code = code.replace(detailBoxPattern, detailBoxReplace);

// 2. LIST VIEW BOX
// Pattern:
// return /*#__PURE__*/React.createElement("div", {
//          className: "relative inline-block group"
//        }, /*#__PURE__*/React.createElement("input", {
//          type: "date",
//          className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
//          value: g.followUpDate || "",
//          onClick: function(e) { try { e.target.showPicker(); } catch(err) {} },
//          onChange: function(e) {
//             var newDate = e.target.value;
//             db.collection("groups").doc(g.uid).update({ followUpDate: newDate }).catch(function(err) {
//                 console.error("Error actualizando fecha", err);
//             });
//          },
//          title: "Click para cambiar fecha"
//        }), /*#__PURE__*/React.createElement("span", {
//          className: "px-2.5 py-1 rounded-md text-[10px] inline-block relative z-0 group-hover:brightness-95 transition-all " + followUpClass
//        }, followUpDisplay));

const listBadgePattern = /return \/\*#__PURE__\*\/React\.createElement\("div", \{\n\s*className: "relative inline-block group"[\s\S]*?\}, followUpDisplay\)\);/g;

const listBadgeReplace = `return /*#__PURE__*/React.createElement("div", {
          className: "relative inline-flex items-center group bg-white border rounded-md overflow-hidden " + followUpClass.replace("bg-", "border-").replace("text-", "focus-within:border-")
        }, /*#__PURE__*/React.createElement("input", {
          type: "date",
          className: "w-full h-full bg-transparent outline-none cursor-pointer px-2 py-1 text-[10px] font-bold " + followUpClass.split(" ").find(c => c.startsWith("text-")),
          value: g.followUpDate || "",
          onChange: function(e) {
             var newDate = e.target.value;
             db.collection("groups").doc(g.uid).update({ followUpDate: newDate }).catch(function(err) {
                 console.error("Error actualizando fecha", err);
             });
          },
          title: "Cambiar fecha de seguimiento"
        }));`;

code = code.replace(listBadgePattern, listBadgeReplace);

fs.writeFileSync(filePath, code);
console.log('Presupuestos.js updated to use visible date inputs and hide detail box on print.');
