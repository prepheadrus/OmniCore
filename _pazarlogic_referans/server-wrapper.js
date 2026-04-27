const http = require('http');
const { execSync, spawn } = require('child_process');
const path = require('path');

const STANDALONE_DIR = path.join(__dirname, '.next', 'standalone');
const PORT = 3000;
const MAX_RESTARTS = 100;
let restartCount = 0;

function startServer() {
  const server = spawn('node', ['server.js'], {
    cwd: STANDALONE_DIR,
    env: {
      ...process.env,
      PORT: String(PORT),
      DATABASE_URL: 'file:/home/z/my-project/prisma/dev.db',
      NODE_OPTIONS: '--max-old-space-size=256',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  server.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  server.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  server.on('exit', (code, signal) => {
    console.log(`\n[${new Date().toISOString()}] Server exited with code=${code} signal=${signal}`);
    restartCount++;
    if (restartCount < MAX_RESTARTS) {
      console.log(`Restarting in 2s (restart #${restartCount})...`);
      setTimeout(startServer, 2000);
    } else {
      console.log('Max restarts reached, giving up.');
      process.exit(1);
    }
  });

  // Health check - keep this process alive
  const healthCheck = setInterval(() => {
    try {
      const req = http.get(`http://localhost:${PORT}/api/dashboard`, { timeout: 5000 }, (res) => {
        // Server is alive
      });
      req.on('error', () => {
        // Server might be down, will be caught by exit handler
      });
      req.on('timeout', () => req.destroy());
    } catch (e) {}
  }, 30000);

  // Don't let this parent process die easily
  process.on('SIGTERM', () => {
    clearInterval(healthCheck);
    server.kill();
    process.exit(0);
  });
}

startServer();
