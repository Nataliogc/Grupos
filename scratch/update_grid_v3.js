const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log("Not found: " + filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix grid col widths
    content = content.replace(/grid-cols-\[25px_85px_1fr_55px_85px_60px_25px\]/g, 'grid-cols-[25px_85px_1fr_75px_105px_60px_25px]');
    content = content.replace(/grid-cols-\[25px_75px_1fr_55px_85px_60px_25px\]/g, 'grid-cols-[25px_85px_1fr_75px_105px_60px_25px]');
    
    // Release input styling
    // min-w-[50px] for release days, let's bump to min-w-[60px] just in case
    content = content.replace(/min-w-\[50px\] h-6/g, 'min-w-[60px] h-6');
    content = content.replace(/w-9 text-center/g, 'w-10 text-center');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + filePath);
}

fixFile(path.join(__dirname, '..', 'js', 'GestionGrupos.js'));
fixFile(path.join(__dirname, '..', 'src', 'GestionGrupos.jsx'));
