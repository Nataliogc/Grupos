const text = require('fs').readFileSync('Gestión de Grupos.html', 'utf8');
const lines = text.split(/\\r?\\n/);
console.log('Total:', lines.length);
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// 2. Excluir Cancelados/Anulados')) {
        console.log('FOUND AT:', i);
        console.log(lines.slice(i - 5, i + 15).join('\\n'));
        break;
    }
}
