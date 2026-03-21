const fs = require('fs');
const html = fs.readFileSync('Fac Prof.html', 'utf8');
const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
const js = scripts[scripts.length - 1].replace(/<script\b[^>]*>/i, '').replace(/<\/script>/i, '');
fs.writeFileSync('temp.js', js);
console.log('Extracted the last script block to temp.js');
