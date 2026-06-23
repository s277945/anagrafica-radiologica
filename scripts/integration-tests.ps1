Param(
 [switch]$KeepAlive
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ComposeFile = Join-Path $ProjectRoot "docker-compose.integration-tests.yml"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$SmokeScript = Join-Path $ScriptDir "smoke-tests.ps1"

function Assert-LastCommandSucceeded {
 param(
  [string]$Message
 )

 if ($LASTEXITCODE -ne 0) {
  throw $Message
 }
}

function Wait-Http {
 param(
  [string]$Url,
  [int]$TimeoutSeconds = 180,
  [hashtable]$Headers = @{}
 )

 $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

 while ((Get-Date) -lt $deadline) {
  try {
   $response = Invoke-WebRequest -Uri $Url -Headers $Headers -UseBasicParsing -TimeoutSec 3

   if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
    return
   }
  }
  catch {
   Start-Sleep -Seconds 2
  }
 }

 throw "Timeout waiting for $Url"
}

function Invoke-Psql {
 param(
  [string]$Sql
 )

 docker exec `
  -e PGPASSWORD=postgres `
  anagrafica-radiologica-db-it `
  psql `
  -U postgres `
  -d anagrafica_radiologica `
  -v ON_ERROR_STOP=1 `
  -c "$Sql"

 Assert-LastCommandSucceeded "Comando psql fallito."
}

function Ensure-IntegrationSeed {
 Write-Host "Creating integration seed data..."

$sql = @"
INSERT INTO organizzazioni (id, nome)
VALUES ('OR0000000001', 'Organizzazione Integration Test')
ON CONFLICT (id) DO NOTHING;

INSERT INTO contenitori (id, nome, organizzazione_id, parent_id)
VALUES ('CO0000000001', 'Contenitore Integration Test', 'OR0000000001', NULL)
ON CONFLICT (id) DO NOTHING;
"@

 Invoke-Psql -Sql $sql

 Write-Host "Integration seed completed."
}

Write-Host "Checking Docker availability..."

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
 throw "Docker non risulta disponibile nel PATH. Installa/avvia Docker Desktop e riapri PowerShell."
}

docker compose version | Out-Null
docker ps | Out-Null

Push-Location $ProjectRoot

try {
 Write-Host "Building backend WAR..."
 .\mvnw.cmd clean package -DskipTests
 Assert-LastCommandSucceeded "Build Maven fallita."

 Write-Host "Cleaning previous integration environment..."
 docker compose -f $ComposeFile down -v

 Write-Host "Starting integration test environment..."
 docker compose -f $ComposeFile up -d --build
 Assert-LastCommandSucceeded "docker compose up fallito. I test non verranno eseguiti."

 Write-Host "Containers status:"
 docker compose -f $ComposeFile ps

 $Auth = "admin:admin"
 $EncodedAuth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($Auth))
 $Headers = @{
  Authorization = "Basic $EncodedAuth"
 }

 Write-Host "Waiting for backend on http://localhost:8080/anagrafica/swagger-ui.html ..."
 Wait-Http -Url "http://localhost:8080/anagrafica/swagger-ui.html" -TimeoutSeconds 180

 # A questo punto Spring Boot ha avuto tempo di inizializzare lo schema DB.
 Ensure-IntegrationSeed

 Write-Host "Waiting for frontend on http://localhost:5173/ ..."
 Wait-Http -Url "http://localhost:5173/" -TimeoutSeconds 180

 if (Test-Path $SmokeScript) {
  Write-Host "Running backend smoke tests..."
  & $SmokeScript
  Assert-LastCommandSucceeded "Smoke test backend falliti."
 }
 else {
  Write-Host "Smoke script not found, skipping: $SmokeScript"
 }

 Push-Location $FrontendDir

 Write-Host "Installing Playwright browsers..."
 npx playwright install
 Assert-LastCommandSucceeded "Installazione browser Playwright fallita."

 Write-Host "Running Playwright integration tests..."
 npm run test:integration
 Assert-LastCommandSucceeded "Playwright integration tests falliti."

 Pop-Location

 Write-Host "Integration tests completed successfully."
}
catch {
 Write-Error $_

 Write-Host ""
 Write-Host "Backend logs:"
 docker compose -f $ComposeFile logs backend --tail=100

 Write-Host ""
 Write-Host "Frontend logs:"
 docker compose -f $ComposeFile logs frontend --tail=100

 Write-Host ""
 Write-Host "DB logs:"
 docker compose -f $ComposeFile logs db --tail=100

 exit 1
}
finally {
 if ((Get-Location).Path -eq $FrontendDir) {
  Pop-Location
 }

 if (-not $KeepAlive) {
  Write-Host "Stopping integration test environment..."
  docker compose -f $ComposeFile down -v
 }
 else {
  Write-Host "KeepAlive enabled: Docker environment left running."
 }

 Pop-Location
}