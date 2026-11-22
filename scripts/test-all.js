const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.join(__dirname, '..');
let failed = false;
for (const name of fs.readdirSync(path.join(root, 'tests')).filter(name => /\.test\.[cm]?js$/.test(name)).sort()) {
  const result = spawnSync(process.execPath, [path.join(root, 'tests', name)], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  failed ||= result.status !== 0;
}
process.exitCode = failed ? 1 : 0;
