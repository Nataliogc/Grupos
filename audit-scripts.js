const fs = require('fs');
const html = fs.readFileSync('Rooming-Servicios.html', 'utf-8');

// Regex to match <script> tags, ignoring those with type="application/json"
const regex = /<script(?:\s+[^>]*?)?>(.*?)<\/script>/gis;

let match;
let i = 0;
let allCode = '';
let omitted = 0;

while ((match = regex.exec(html)) !== null) {
    const fullTag = match[0];
    const code = match[1].trim();
    
    if (fullTag.includes('type="application/json"')) {
        omitted++;
        continue;
    }
    
    if (code) {
        i++;
        allCode += '\n// --- Script Block ' + i + ' ---\n' + code + '\n';
    }
}

fs.mkdirSync('audit', { recursive: true });
fs.writeFileSync('audit/tmp-rooming-servicios-inline.js', allCode);

console.log('Número de bloques <script> encontrados (con código): ' + (i + omitted));
console.log('Número de bloques JavaScript extraídos: ' + i);
console.log('Número de bloques omitidos y motivo: ' + omitted + ' (application/json)');

try {
    require('child_process').execSync('node --check audit/tmp-rooming-servicios-inline.js', {stdio:'inherit'});
    console.log('Syntax OK');
} catch(e) {
    console.error('\nSyntax Error detected');
}
