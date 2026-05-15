const fs = require('fs');
const path = 'js/GestionGrupos.js';
let content = fs.readFileSync(path, 'utf8');
// Replace literal \n with real newlines
content = content.replace(/\\n/g, '\n');
fs.writeFileSync(path, content, 'utf8');
