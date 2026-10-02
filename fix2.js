const fs = require('fs');
let c = fs.readFileSync('src/Configuracion.jsx', 'utf8');
c = c.replace('const [targetHotel, setTargetHotel] = useState(\"guadiana\");', 'const [targetHotel, setTargetHotel] = useState(\"guadiana\");\n      const [customBudgetIdInput, setCustomBudgetIdInput] = useState(\"\");');
fs.writeFileSync('src/Configuracion.jsx', c);
