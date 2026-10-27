import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('==================================================');
console.log('   iMovies Full-Stack Development Server');
console.log('==================================================');

// 1. Start Backend Server
const serverProcess = spawn('node', ['server.js'], {
  cwd: path.join(rootDir, 'server'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PATH: `C:\\Program Files\\nodejs;${process.env.PATH}` },
});

// 2. Start Frontend Vite Client
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'client'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PATH: `C:\\Program Files\\nodejs;${process.env.PATH}` },
});

const cleanExit = () => {
  console.log('\nStopping iMovies development services...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit(0);
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
