#!/bin/sh
set -eu
if [ -n "${DATABASE_URL:-}" ]; then
  echo "Ensuring database schema is available..."
  npx prisma db push --skip-generate
fi
node server.js &
SERVER_PID=$!
for i in $(seq 1 60); do
  if node -e "fetch('http://127.0.0.1:'+(process.env.PORT||10000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then break; fi
  [ "$i" = 60 ] && echo "Web server did not become healthy" && kill "$SERVER_PID" 2>/dev/null || true && exit 1
  sleep 1
done
WORKER_PID=""
start_worker() {
  if [ "${ANALYSIS_WORKER_ENABLED:-true}" = "true" ] && [ -n "${ANALYSIS_WORKER_TOKEN:-}" ]; then
    node worker.js & WORKER_PID=$!; echo "Analysis worker started with PID $WORKER_PID"
  else
    echo "WARNING: worker disabled or ANALYSIS_WORKER_TOKEN missing; jobs cannot leave QUEUED state."
  fi
}
start_worker
# A worker crash must not silently leave the dashboard alive with jobs stuck forever.
(
  while true; do
    sleep 10
    if [ -n "$WORKER_PID" ] && ! kill -0 "$WORKER_PID" 2>/dev/null; then
      echo "Analysis worker exited; restarting..."
      start_worker
    fi
  done
) & WATCHDOG_PID=$!
shutdown() {
  [ -n "$WORKER_PID" ] && kill "$WORKER_PID" 2>/dev/null || true
  kill "$WATCHDOG_PID" 2>/dev/null || true
  kill "$SERVER_PID" 2>/dev/null || true
  wait "$SERVER_PID" 2>/dev/null || true
}
trap shutdown INT TERM
wait "$SERVER_PID"
