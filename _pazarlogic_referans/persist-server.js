const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const STANDALONE_DIR = '/home/z/my-project/.next/standalone';

function checkAndStart() {
  const req = http.get('http://localhost:3000/api/dashboard', { timeout: 2000 }, (res) => {
    console.log('[' + new Date().toISOString() + '] Server already running');
    res.resume();
    return;
  });
  req.on('error', () => {
    startServer();
  });
  req.on('timeout', () => { req.destroy(); startServer(); });
}

function startServer() {
  console.log('[' + new Date().toISOString() + '] Starting Next.js server...');
  
  const child = spawn('/usr/bin/node', ['server.js'], {
    cwd: STANDALONE_DIR,
    env: {
      ...process.env,
      PORT: '3000',
      DATABASE_URL: 'file:/home/z/my-project/.next/standalone/dev.db',
      NODE_OPTIONS: '--max-old-space-size=256',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  child.stdout.on('data', (d) => process.stdout.write(d));
  child.stderr.on('data', (d) => process.stderr.write(d));

  child.on('exit', (code) => {
    console.log('[' + new Date().toISOString() + '] Server exited code=' + code + ', restarting in 2s...');
    setTimeout(startServer, 2000);
  });

  setInterval(() => {}, 60000);
}

process.on('SIGTERM', () => { /* ignore */ });
process.on('SIGHUP', () => { /* ignore */ });
process.on('SIGINT', () => { process.exit(0); });

checkAndStart();
