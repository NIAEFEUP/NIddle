set -e

echo "Starting NIddle API..."
node apps/api/dist/main.js &
API_PID=$!

echo "Starting NIddle Web Dashboard..."
npm run start -w apps/web &
WEB_PID=$!

trap 'kill -TERM $API_PID $WEB_PID' TERM INT

while kill -0 "$API_PID" 2>/dev/null && kill -0 "$WEB_PID" 2>/dev/null; do
  sleep 2
done

echo "⚠️  One of the processes exited. Stopping the container..."
kill "$API_PID" 2>/dev/null || true
kill "$WEB_PID" 2>/dev/null || true

wait "$API_PID" 2>/dev/null || true
wait "$WEB_PID" 2>/dev/null || true

exit 1
