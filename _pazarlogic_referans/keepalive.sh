#!/bin/bash
cd /home/z/my-project

# Kill any existing
pkill -f "next dev" 2>/dev/null
pkill -f "node server" 2>/dev/null
sleep 1

while true; do
  echo "[$(date)] Starting server..."
  DATABASE_URL="file:/home/z/my-project/prisma/dev.db" npx next dev -p 3000 2>&1
  echo "[$(date)] Server died, restarting in 3s..."
  sleep 3
done
