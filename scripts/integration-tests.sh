#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-}"

COMPOSE="docker-compose.integration-tests.yml"

echo "Starting integration test environment..."
docker compose -f "$COMPOSE" up -d --build

cleanup() {
  echo "Stopping integration test environment..."
  docker compose -f "$COMPOSE" down -v
}
trap cleanup EXIT

pushd frontend >/dev/null
npm ci
npx playwright install --with-deps
export PLAYWRIGHT_BASE_URL="http://localhost:5173"

case "$MODE" in
  ui)
    npm run test:integration:ui
    ;;
  headed)
    npm run test:integration:headed
    ;;
  *)
    npm run test:integration
    ;;
esac
popd >/dev/null
