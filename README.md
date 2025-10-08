# CargoFlow — Run and deploy locally

This contains everything you need to run the app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. (Optional) Create a `.env.local` file with any required environment variables for your local setup.
3. Run the app:
   `npm run dev`

## Local development (backend + frontend)

This repository includes a helper script to manage the local development stack (backend Flask API + frontend Vite). The script starts/stops both processes, writes log files and PID files, and offers a simple status command.

Script path: `scripts/run_local.sh`

Basic usage:

- Make the script executable and show status:

```bash
cd /home/alexis/Escritorio/CargoFlow
chmod +x scripts/run_local.sh
./scripts/run_local.sh status
```

- Start both services:

```bash
./scripts/run_local.sh start
```

- Force start if ports are in use (the script will attempt to kill processes occupying the ports):

```bash
./scripts/run_local.sh start --force
```

- Stop both services:

```bash
./scripts/run_local.sh stop
```

- Restart:

```bash
./scripts/run_local.sh restart
```

Where the script stores logs and PID files (defaults):

- Backend logs: `server.log`
- Frontend logs: `vite.log`
- Backend PID file: `.backend.pid`
- Frontend PID file: `.vite.pid`

Environment customization:

You can override defaults by exporting environment variables before running the script. Examples:

```bash
export VENV_PATH="$HOME/.venv"
export BACKEND_PORT=5001
export FRONTEND_PORT=3000
./scripts/run_local.sh start
```

Quick checks and troubleshooting:

```bash
# Tail backend logs
tail -f server.log

# Tail frontend logs
tail -f vite.log

# Probe the API
curl http://127.0.0.1:5001/api

# Check reset status endpoint
curl http://127.0.0.1:5001/api/reset/status | jq .
```

Notes:

- Vite may auto-select an alternative port if the configured one is busy (e.g. 3001, 3002). The script records the Vite log; check `vite.log` or `./scripts/run_local.sh status` to see which port Vite chose.
- If the backend fails to bind because the port is in use, you can run `./scripts/run_local.sh start --force` to free the port, or manually identify and stop the conflicting process.
- If you accidentally committed large files (virtualenv, database files), I can prepare a safe plan to remove them from git history (this requires force-push and coordination with collaborators).

## Changelog

- 2025-10-08: Removed references to Google AI Studio and Gemini. Replaced explicit `GEMINI_API_KEY` instruction with a generic note to use a local `.env.local` file. Added a "Local development (backend + frontend)" section documenting `scripts/run_local.sh` (start/status/stop/restart), logs and PID files, environment overrides and troubleshooting tips.
