const { spawnSync } = require('child_process');
const cmd = process.platform === 'win32' ? '.\\mvnw.cmd' : './mvnw';
const result = spawnSync(cmd, process.argv.slice(2), { cwd: __dirname, stdio: 'inherit' });
process.exit(result.status || 0);
