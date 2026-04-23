const fs = require('fs');
const content = fs.readFileSync('Presupuestos.html', 'utf8');
const scriptMatch = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    console.log("No script found");
    process.exit(1);
}
const script = scriptMatch[1];
const lines = script.split('\n');

let balance = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = (line.match(/{/g) || []).length;
    const close = (line.match(/}/g) || []).length;
    balance += open;
    balance -= close;
}
console.log(`FINAL BALANCE: ${balance}`);
