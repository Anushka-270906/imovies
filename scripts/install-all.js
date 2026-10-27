import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('Installing Server Dependencies...');
execSync(`${npmCmd} install`, {
  cwd: path.join(rootDir, 'server'),
  stdio: 'inherit',
  env: { ...process.env, PATH: `C:\\Program Files\\nodejs;${process.env.PATH}` },
});

console.log('\nInstalling Client Dependencies...');
execSync(`${npmCmd} install`, {
  cwd: path.join(rootDir, 'client'),
  stdio: 'inherit',
  env: { ...process.env, PATH: `C:\\Program Files\\nodejs;${process.env.PATH}` },
});

console.log('\nAll dependencies installed successfully!');
