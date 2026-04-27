#!/bin/bash
# Single command: start server and test immediately
cd /home/z/my-project
pkill -f "node server\|next dev" 2>/dev/null
sleep 1

# Start standalone server in background
cd .next/standalone
DATABASE_URL="file:/home/z/my-project/prisma/dev.db" PORT=3000 NODE_OPTIONS="--max-old-space-size=256" node server.js &
SERVER_PID=$!

# Wait for ready
sleep 5

# Test page
echo "=== Page Test ==="
RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}\nSIZE:%{size_download}" http://localhost:3000/)
HTTP_CODE=$(echo "$RESULT" | rg "HTTP_CODE:" | rg -o "[0-9]+")
SIZE=$(echo "$RESULT" | rg "SIZE:" | rg -o "[0-9]+")
echo "HTTP: $HTTP_CODE, Size: $SIZE bytes"

# Check HTML content
BODY=$(echo "$RESULT" | head -n -2)
echo "Has PazarLogic: $(echo "$BODY" | rg -c 'PazarLogic' || echo 0)"
echo "Has __next: $(echo "$BODY" | rg -c '__next' || echo 0)"
echo "Has script: $(echo "$BODY" | rg -c '<script' || echo 0)"

# Test APIs
echo ""
echo "=== API Tests ==="
for api in dashboard orders products; do
  R=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/$api 2>/dev/null)
  echo "/api/$api -> $R"
done

# Show process status
echo ""
echo "=== Process ==="
if kill -0 $SERVER_PID 2>/dev/null; then
  echo "Server RUNNING (PID $SERVER_PID)"
else
  echo "Server DEAD"
fi

# Keep alive - don't exit
echo ""
echo "Server is running on port 3000. Press Ctrl+C to stop."
wait $SERVER_PID 2>/dev/null
