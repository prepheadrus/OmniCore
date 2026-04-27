#!/bin/bash
export DATABASE_URL="file:/home/z/my-project/.next/standalone/dev.db"
export PORT=3000
export NODE_OPTIONS="--max-old-space-size=256"
cd /home/z/my-project/.next/standalone
exec node server.js
