#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting application initialization..."
echo "======================================"

# Backend Setup
# --------------------------------------
echo ""
echo "Setting up backend..."

# Install Python dependencies
echo "Installing Python dependencies using uv..."
uv pip install -r backend/requirements.txt

# Run database migrations for backend
# Assumes alembic.ini is configured correctly in the backend directory
echo "Running backend database migrations (Alembic)..."
alembic -c backend/alembic.ini upgrade head

# Initialize backend database (seed data)
# This script is expected to create initial necessary data, e.g., admin users
echo "Initializing backend database (seeding data)..."
python backend/init_db.py

echo "Backend setup complete."
echo "--------------------------------------"


# Frontend/Node.js Server Setup
# --------------------------------------
echo ""
echo "Setting up frontend/Node.js server..."

# Install Node.js dependencies
echo "Installing Node.js dependencies (npm install)..."
npm install

# Run database migrations for Node.js server (Drizzle)
echo "Running Node.js database migrations (Drizzle)..."
npm run db:push

# Build frontend/server
# This typically compiles TypeScript, bundles assets, etc.
echo "Building frontend/Node.js server (npm run build)..."
npm run build

echo "Frontend/Node.js server setup complete."
echo "--------------------------------------"


# Application Startup
# --------------------------------------
echo ""
echo "Starting applications..."

# Start Node.js server in the background
echo "Starting Node.js server (npm run start) in the background..."
# The 'start' script is defined in package.json
npm run start &
NODE_PID=$! # Capture PID of the backgrounded Node.js process
echo "Node.js server started with PID: $NODE_PID"

# Start Python backend server with Gunicorn
echo "Starting Python backend server with Gunicorn..."
# This command changes to the 'backend' directory,
# uses the 'gunicorn_config.py' for settings,
# and runs the Flask/FastAPI app (assuming 'app:app' is the WSGI entry point).
# Gunicorn will run in the foreground, making its logs visible directly.
gunicorn --chdir backend -c gunicorn_config.py app:app
# If Gunicorn is daemonized or exits, the script might end here or continue
# depending on Gunicorn's behavior and the -D flag (not used here).

echo ""
echo "*********************************************************************"
echo "Application startup script finished."
echo "Python backend (Gunicorn) was started in the foreground."
echo "Node.js server should be running in the background (PID: $NODE_PID)."
echo "To stop the Node.js server, you can use: kill $NODE_PID"
echo "If Gunicorn was not daemonized, Ctrl+C will stop it (and this script)."
echo "*********************************************************************"
