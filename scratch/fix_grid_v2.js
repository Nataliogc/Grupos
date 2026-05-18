const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log("Not found: " + filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix grid col widths
    content = content.replace(/grid-cols-\[25px_45px_1fr_55px_85px_60px_25px\]/g, 'grid-cols-[25px_75px_1fr_55px_85px_60px_25px]');
    content = content.replace(/grid-cols-\[25px_55px_1fr_55px_85px_60px_25px\]/g, 'grid-cols-[25px_75px_1fr_55px_85px_60px_25px]');
    content = content.replace(/grid-cols-\[25px_65px_1fr_55px_85px_60px_25px\]/g, 'grid-cols-[25px_75px_1fr_55px_85px_60px_25px]');
    content = content.replace(/grid-cols-\[25px_75px_1fr_55px_85px_60px_25px\]/g, 'grid-cols-[25px_85px_1fr_55px_85px_60px_25px]');
    
    // Fix percent input widths in js/GestionGrupos.js
    content = content.replace(/min-w-\[40px\]/g, 'min-w-[75px]');
    content = content.replace(/min-w-\[50px\]/g, 'min-w-[75px]');
    content = content.replace(/w-8 text-right/g, 'w-16 text-right');
    content = content.replace(/w-10 text-right/g, 'w-16 text-right');
    content = content.replace(/w-14 text-right/g, 'w-16 text-right');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + filePath);
}

fixFile(path.join(__dirname, '..', 'js', 'GestionGrupos.js'));
fixFile(path.join(__dirname, '..', 'src', 'GestionGrupos.jsx'));
