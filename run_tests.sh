#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Running comprehensive application tests..."
echo "=========================================="

# Frontend (Node.js/Jest) Tests
# ------------------------------------------
echo ""
echo "Running frontend tests (Jest)..."
# Assumes npm install has been run previously (e.g., by startup.sh or manually)
# Consider adding 'npm ci' or 'npm install' here if this script is run in complete isolation.
npm run test # Assuming 'test' script in package.json runs jest, or use 'npx jest' directly
echo "Frontend tests complete."
echo "------------------------------------------"


# Backend (Python/Pytest) Tests
# ------------------------------------------
echo ""
echo "Running backend tests (Pytest)..."
# Assumes Python environment and dependencies are set up (e.g., by startup.sh or manually)
# Change to the backend directory to ensure pytest discovers tests and local modules correctly.
(cd backend && pytest)
# Alternatively, if tests are in a specific folder like backend/tests:
# pytest backend/tests
echo "Backend tests complete."
echo "------------------------------------------"

echo ""
echo "=========================================="
echo "All application tests finished."
