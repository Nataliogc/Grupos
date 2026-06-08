const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'Presupuestos.js');
let code = fs.readFileSync(filePath, 'utf8');

const listBadgePattern = /return \/\*#__PURE__\*\/React\.createElement\("span", \{\n\s*className: "px-2\.5 py-1 rounded-md text-\[10px\] inline-block " \+ followUpClass\n\s*\}, followUpDisplay\);/;

const listBadgeReplace = `return /*#__PURE__*/React.createElement("div", {
          className: "relative inline-block group"
        }, /*#__PURE__*/React.createElement("input", {
          type: "date",
          className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
          value: g.followUpDate || "",
          onChange: function(e) {
             var newDate = e.target.value;
             db.collection("groups").doc(g.uid).update({ followUpDate: newDate }).catch(function(err) {
                 console.error("Error actualizando fecha", err);
             });
          },
          title: "Click para cambiar fecha"
        }), /*#__PURE__*/React.createElement("span", {
          className: "px-2.5 py-1 rounded-md text-[10px] inline-block relative z-0 group-hover:brightness-95 transition-all " + followUpClass
        }, followUpDisplay));`;

code = code.replace(listBadgePattern, listBadgeReplace);

fs.writeFileSync(filePath, code);
console.log('Presupuestos.js updated to allow inline date editing in list view.');
