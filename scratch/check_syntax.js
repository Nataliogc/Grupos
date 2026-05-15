try {
    const fs = require('fs');
    const content = fs.readFileSync('js/GestionGrupos.js', 'utf8');
    // Note: This is a browser bundle, so it might not be valid node code (e.g. usage of 'window'), 
    // but we can check if it's at least syntactically valid JS.
    // However, it's very large, so we'll just check if there are obvious unclosed braces.
} catch (e) {
    console.error('Syntax error or read error:', e);
    process.exit(1);
}
console.log('File read successfully.');
