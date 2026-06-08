const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'Presupuestos.js');
let code = fs.readFileSync(filePath, 'utf8');

// For list view:
code = code.replace(/value: g\.followUpDate \|\| "",\n\s*onChange: function\(e\) \{/, `value: g.followUpDate || "",
          onClick: function(e) { if (e.target.showPicker) e.target.showPicker(); },
          onChange: function(e) {`);

// Ensure we replaced both instances (detail view and list view)
// Let's do a global replace for both if they match the exact same pattern:
// Wait, the previous replace will only replace the first occurrence. 
// Let's use global flag.
code = code.replace(/value: g\.followUpDate \|\| "",\n\s*onChange: function\s*\(e\)\s*\{/g, `value: g.followUpDate || "",
          onClick: function(e) { try { e.target.showPicker(); } catch(err) {} },
          onChange: function(e) {`);

fs.writeFileSync(filePath, code);
console.log('Presupuestos.js updated to call showPicker() on date inputs.');
