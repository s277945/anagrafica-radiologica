#!/usr/bin/env bash
set -Eeuo pipefail

KEEP_ALIVE=false

if [[ "${1:-}" == "--keep-alive" || "${1:-}" == "-k" ]]; then
  KEEP_ALIVE=true
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.integration-tests.yml"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
SMOKE_SCRIPT="$SCRIPT_DIR/smoke-tests.sh"

cleanup() {
  local exit_code=$?

  if [[ "$exit_code" -ne 0 ]]; then
    echo ""
    echo "Backend logs:"
    docker compose -f "$COMPOSE_FILE" logs backend --tail=100 || true

    echo ""
    echo "Frontend logs:"
    docker compose -f "$COMPOSE_FILE" logs frontend --tail=100 || true

    echo ""
    echo "DB logs:"
    docker compose -f "$COMPOSE_FILE" logs db --tail=100 || true
  fi

  if [[ "$KEEP_ALIVE" == "false" ]]; then
    echo "Stopping integration test environment..."
    docker compose -f "$COMPOSE_FILE" down -v || true
  else
    echo "KeepAlive enabled: Docker environment left running."
  fi

  exit "$exit_code"
}

trap cleanup EXIT

wait_http() {
  local url="$1"
  local timeout_seconds="${2:-180}"
  local deadline=$((SECONDS + timeout_seconds))

  while [[ "$SECONDS" -lt "$deadline" ]]; do
    if curl -fsS --max-time 3 "$url" >/dev/null 2>&1; then
      return 0
    fi

    sleep 2
  done

  echo "Timeout waiting for $url" >&2
  return 1
}

invoke_psql() {
  local sql="$1"

  docker exec \
    -e PGPASSWORD=postgres \
    anagrafica-radiologica-db-it \
    psql \
    -U postgres \
    -d anagrafica_radiologica \
    -v ON_ERROR_STOP=1 \
    -c "$sql"
}

ensure_integration_seed() {
  echo "Creating integration seed data..."

  local sql="
INSERT INTO organizzazioni (id, nome)
VALUES ('OR0000000001', 'Organizzazione Integration Test')
ON CONFLICT (id) DO NOTHING;

INSERT INTO contenitori (id, nome, organizzazione_id, parent_id)
VALUES ('CO0000000001', 'Contenitore Integration Test', 'OR0000000001', NULL)
ON CONFLICT (id) DO NOTHING;
"

  invoke_psql "$sql"

  echo "Integration seed completed."
}

echo "Checking Docker availability..."

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker non risulta disponibile nel PATH. Installa/avvia Docker Desktop o Docker Engine." >&2
  exit 1
fi

docker compose version >/dev/null
docker ps >/dev/null

cd "$PROJECT_ROOT"

echo "Building backend WAR..."
if [[ -x "./mvnw" ]]; then
  ./mvnw clean package -DskipTests
else
  mvn clean package -DskipTests
fi

echo "Cleaning previous integration environment..."
docker compose -f "$COMPOSE_FILE" down -v || true

echo "Starting integration test environment..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "Containers status:"
docker compose -f "$COMPOSE_FILE" ps

echo "Waiting for backend on http://localhost:8080/anagrafica/swagger-ui.html ..."
wait_http "http://localhost:8080/anagrafica/swagger-ui.html" 180

# A questo punto Spring Boot ha avuto tempo di inizializzare lo schema DB.
ensure_integration_seed

echo "Waiting for frontend on http://localhost:5173/ ..."
wait_http "http://localhost:5173/" 180

if [[ -f "$SMOKE_SCRIPT" ]]; then
  echo "Running backend smoke tests..."
  bash "$SMOKE_SCRIPT"
else
  echo "Smoke script not found, skipping: $SMOKE_SCRIPT"
fi

cd "$FRONTEND_DIR"

echo "Installing Playwright browsers..."
npx playwright install

echo "Running Playwright integration tests..."
npm run test:integration

echo "Integration tests completed successfully."