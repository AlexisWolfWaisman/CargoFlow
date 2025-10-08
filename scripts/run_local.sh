#!/usr/bin/env bash
# Run and manage the CargoFlow app locally (backend + frontend)
# Usage: ./scripts/run_local.sh start|stop|status|restart [--force]

set -euo pipefail
IFS=$'\n\t'

COMMAND=${1:-}
FLAG=${2:-}
FORCE=0
if [ "${FLAG:-}" = "--force" ] || [ "${3:-}" = "--force" ]; then
  FORCE=1
fi

# Determine project root (one level up from this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Configurable env
VENV_PATH=${VENV_PATH:-"$PROJECT_ROOT/.venv"}
BACKEND_PYTHON="${VENV_PATH}/bin/python"
if [ ! -x "$BACKEND_PYTHON" ]; then
  # fallback to system python3
  BACKEND_PYTHON="$(command -v python3 || command -v python)"
fi

BACKEND_PORT=${BACKEND_PORT:-5001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_LOG=${BACKEND_LOG:-"$PROJECT_ROOT/server.log"}
FRONTEND_LOG=${FRONTEND_LOG:-"$PROJECT_ROOT/vite.log"}
BACKEND_PID_FILE=${BACKEND_PID_FILE:-"$PROJECT_ROOT/.backend.pid"}
FRONTEND_PID_FILE=${FRONTEND_PID_FILE:-"$PROJECT_ROOT/.vite.pid"}

# Helpers
function is_port_in_use() {
  local port=$1
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti :$port || true
  else
    ss -ltnp 2>/dev/null | grep -E ":$port" || true
  fi
}

function kill_pidfile() {
  local pidfile=$1
  if [ -f "$pidfile" ]; then
    local pid
    pid=$(cat "$pidfile" || true)
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "Killing PID $pid (from $pidfile)"
      kill "$pid" || true
      sleep 1
      if kill -0 "$pid" 2>/dev/null; then
        echo "PID $pid did not stop, forcing..."
        kill -9 "$pid" || true
      fi
    else
      echo "PID $pid not running (or cannot be killed)."
    fi
    rm -f "$pidfile"
  else
    echo "PID file $pidfile not found"
  fi
}

function start_backend() {
  echo "Starting backend..."

  # Check port usage
  local pids
  pids=$(is_port_in_use $BACKEND_PORT | tr '\n' ' ' || true)
  if [ -n "${pids// /}" ]; then
    echo "Port $BACKEND_PORT appears in use by: $pids"
    if [ "$FORCE" -eq 1 ]; then
      echo "Force-killing processes on port $BACKEND_PORT"
      for pid in $pids; do
        kill "$pid" || true
      done
      sleep 1
    else
      echo "Use --force to kill them, or stop the process manually. Aborting backend start."
      return 1
    fi
  fi

  # Activate venv if present
  if [ -x "$VENV_PATH/bin/activate" ]; then
    # shellcheck disable=SC1090
    source "$VENV_PATH/bin/activate"
    echo "Activated venv: $VENV_PATH"
  else
    echo "Venv not found at $VENV_PATH, proceeding with system python: $BACKEND_PYTHON"
  fi

  # Ensure database exists (server.py will create/seed if missing on start)

  # Start backend using nohup and write pid
  nohup "$BACKEND_PYTHON" server.py > "$BACKEND_LOG" 2>&1 &
  local pid=$!
  echo "$pid" > "$BACKEND_PID_FILE"
  echo "Backend started (PID $pid). Logs -> $BACKEND_LOG"
}

function start_frontend() {
  echo "Starting frontend (Vite)..."
  if ! command -v npm >/dev/null 2>&1; then
    echo "npm not found in PATH. Install Node/npm before starting frontend." >&2
    return 1
  fi

  if [ ! -d node_modules ]; then
    echo "Installing frontend dependencies (npm install). This can take a while..."
    npm install --silent || true
  fi

  nohup npm run dev > "$FRONTEND_LOG" 2>&1 &
  local pid=$!
  echo "$pid" > "$FRONTEND_PID_FILE"
  echo "Vite started (PID $pid). Logs -> $FRONTEND_LOG"
}

function show_status() {
  echo "Project root: $PROJECT_ROOT"
  echo "Venv path: $VENV_PATH"

  echo "\nBackend (port $BACKEND_PORT):"
  if [ -f "$BACKEND_PID_FILE" ]; then
    local pid; pid=$(cat "$BACKEND_PID_FILE" || true)
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "  PID: $pid (running)"
    else
      echo "  PID: $pid (not running)"
    fi
  else
    echo "  No PID file ($BACKEND_PID_FILE)"
  fi
  echo "  Port usage:"
  is_port_in_use $BACKEND_PORT || echo "  (none)"
  echo "  Recent logs (server.log last 20 lines):"
  tail -n 20 "$BACKEND_LOG" || echo "  (no server.log yet)"

  echo "\nFrontend (port $FRONTEND_PORT):"
  if [ -f "$FRONTEND_PID_FILE" ]; then
    local pid; pid=$(cat "$FRONTEND_PID_FILE" || true)
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "  PID: $pid (running)"
    else
      echo "  PID: $pid (not running)"
    fi
  else
    echo "  No PID file ($FRONTEND_PID_FILE)"
  fi
  echo "  Port usage:"
  is_port_in_use $FRONTEND_PORT || echo "  (none)"
  echo "  Recent logs (vite.log first 20 lines):"
  head -n 20 "$FRONTEND_LOG" || echo "  (no vite.log yet)"

  echo "\nAPI quick probes:"
  if command -v curl >/dev/null 2>&1; then
    echo "  GET /api ->"
    curl -sS -I "http://127.0.0.1:$BACKEND_PORT/api" | sed -n '1,5p' || true
    echo "\n  GET /api/reset/status ->"
    curl -sS "http://127.0.0.1:$BACKEND_PORT/api/reset/status" || true
  else
    echo "  curl not available to probe endpoints"
  fi
}

# Attempt to detect the frontend URL that Vite printed to the log.
# Falls back to http://localhost:$FRONTEND_PORT/ if nothing is found.
function detect_frontend_url() {
  # Try to parse vite.log for a Local URL (Vite prints something like: "Local: http://localhost:3002/")
  if [ -f "$FRONTEND_LOG" ]; then
    for i in $(seq 1 8); do
      url=$(grep -m1 -Eo 'http://[^[:space:]]+' "$FRONTEND_LOG" | head -n1 || true)
      if [ -n "$url" ]; then
        echo "$url"
        return 0
      fi
      sleep 1
    done
  fi
  # fallback
  echo "http://localhost:$FRONTEND_PORT/"
}

# Show friendly access URLs for frontend and backend
function show_access_urls() {
  local fe_url
  fe_url=$(detect_frontend_url)
  echo "----------------------------------------------------------------"
  echo "Frontend (open in a browser): ${fe_url}"
  echo "Backend API endpoint: http://127.0.0.1:$BACKEND_PORT/api"
  echo "Logs: frontend -> $FRONTEND_LOG   backend -> $BACKEND_LOG"
  echo "----------------------------------------------------------------"
}

function stop_all() {
  echo "Stopping frontend..."
  if [ -f "$FRONTEND_PID_FILE" ]; then
    kill_pidfile "$FRONTEND_PID_FILE"
  else
    echo "No frontend pidfile. Trying to kill processes listening on $FRONTEND_PORT"
    local pids; pids=$(is_port_in_use $FRONTEND_PORT || true)
    for pid in $pids; do kill "$pid" || true; done
  fi

  echo "Stopping backend..."
  if [ -f "$BACKEND_PID_FILE" ]; then
    kill_pidfile "$BACKEND_PID_FILE"
  else
    echo "No backend pidfile. Trying to kill processes listening on $BACKEND_PORT"
    local pids; pids=$(is_port_in_use $BACKEND_PORT || true)
    for pid in $pids; do kill "$pid" || true; done
  fi
}

# Main dispatcher
case "${COMMAND}" in
  start)
    echo "Starting services..."
    start_backend || true
    start_frontend || true
    # Give frontend a moment to emit its startup lines, then show access URLs
    sleep 1
    show_access_urls
    ;;
  stop)
    stop_all
    ;;
  restart)
    stop_all
    sleep 1
    FORCE=1 # allow port reuse after stop
    start_backend || true
    start_frontend || true
    sleep 1
    show_access_urls
    ;;
  status|*)
    show_status
    ;;
esac

exit 0
