#!/bin/bash
cd /home/z/my-project

pkill -f "next dev\|node server\|persist-server" 2>/dev/null
sleep 2

if [ ! -d ".next/standalone" ]; then
  echo "Building..."
  DATABASE_URL="file:/home/z/my-project/prisma/dev.db" NODE_OPTIONS="--max-old-space-size=512" npx next build
fi

cp -r .next/static .next/standalone/.next/ 2>/dev/null
cp -r public .next/standalone/ 2>/dev/null

mkdir -p .next/standalone/prisma
ln -sf /home/z/my-project/prisma/dev.db .next/standalone/prisma/dev.db

echo "DATABASE_URL=file:/home/z/my-project/prisma/dev.db" > .next/standalone/.env

cd .next/standalone
export DATABASE_URL="file:/home/z/my-project/prisma/dev.db"
export PORT=3000
export NODE_OPTIONS="--max-old-space-size=256"
exec node server.js
