const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log("Not found: " + filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We need to find the addPlanRow function and update the defaults
    // Look for: var addPlanRow = function addPlanRow() {
    // Or: const addPlanRow = () => {
    
    // JS version
    content = content.replace(
        /var remaining = Math\.max\(0, 100 - totalPercent\);\s*var d;/g,
        'var remaining = plan.length === 0 ? 30 : Math.max(0, 100 - totalPercent);\n          var d;'
    );
    content = content.replace(
        /label: remaining === 100 \? "Pago Único" : plan\.length === 0 \? "Primer Pago" : "Pago Final",/g,
        'label: plan.length === 0 ? "Depósito" : remaining === 100 ? "Pago Único" : "Pago Final",'
    );
    
    // JSX version
    content = content.replace(
        /const remaining = Math\.max\(0, 100 - totalPercent\);\s*let d;/g,
        'const remaining = plan.length === 0 ? 30 : Math.max(0, 100 - totalPercent);\n          let d;'
    );
    content = content.replace(
        /label: remaining === 100 \? 'Pago Único' : plan\.length === 0 \? 'Primer Pago' : 'Pago Final',/g,
        "label: plan.length === 0 ? 'Depósito' : remaining === 100 ? 'Pago Único' : 'Pago Final',"
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + filePath);
}

fixFile(path.join(__dirname, '..', 'js', 'GestionGrupos.js'));
fixFile(path.join(__dirname, '..', 'src', 'GestionGrupos.jsx'));
