const fs = require('fs');
const html = fs.readFileSync('Rooming-Servicios.html', 'utf-8');

// Regex to match <script> tags, ignoring those with type="application/json"
// Also ignoring external scripts with src="..."
const regex = /<script(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/gi;

let match;
let i = 0;
let omitted = 0;

fs.mkdirSync('audit', { recursive: true });

while ((match = regex.exec(html)) !== null) {
    const fullTag = match[0];
    const code = match[1]; // Do not trim, keep exact newlines
    
    // Ignore scripts with src
    if (fullTag.includes('src=')) {
        continue;
    }
    
    i++;
    // We add empty lines at the beginning so the line numbers match EXACTLY the HTML file!
    // This is crucial for debugging line 2213.
    const startLine = html.substring(0, match.index).split('\n').length;
    let padding = '\n'.repeat(startLine - 1);
    
    const tempFile = 'audit/tmp-block-' + i + '.js';
    fs.writeFileSync(tempFile, padding + code);
    
    try {
        require('child_process').execSync('node --check ' + tempFile, {stdio:'pipe'});
        console.log('Block ' + i + ' (starts at line ' + startLine + '): Syntax OK');
    } catch(e) {
        console.error('Block ' + i + ' (starts at line ' + startLine + '): Syntax Error detected!');
        console.error(e.stderr.toString());
    }
}

console.log('\nTotal inline script blocks checked: ' + i);
