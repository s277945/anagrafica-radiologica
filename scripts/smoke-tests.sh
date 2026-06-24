#!/usr/bin/env bash
set -Eeuo pipefail

BASE_URL="http://localhost:8080/anagrafica"
AUTH="admin:admin"
ENCODED_AUTH="$(printf '%s' "$AUTH" | base64 | tr -d '\n')"

invoke_smoke_request() {
 local method="$1"
 local url="$2"
 local body="${3:-}"

 echo "Smoke $method $url"

 local response_file
 response_file="$(mktemp)"

 local status_code

 if [[ -n "$body" ]]; then
 status_code="$(
 curl -sS \
 -o "$response_file" \
 -w "%{http_code}" \
 --max-time 30 \
 -X "$method" \
 "$url" \
 -H "Authorization: Basic $ENCODED_AUTH" \
 -H "Content-Type: application/json" \
 --data "$body"
 )"
 else
 status_code="$(
 curl -sS \
 -o "$response_file" \
 -w "%{http_code}" \
 --max-time 30 \
 -X "$method" \
 "$url" \
 -H "Authorization: Basic $ENCODED_AUTH" \
 -H "Content-Type: application/json"
 )"
 fi

 if [[ "$status_code" -lt 200 || "$status_code" -ge 300 ]]; then
 echo ""
 echo "Smoke request failed"
 echo "Method: $method"
 echo "Url: $url"

 if [[ -n "$body" ]]; then
 echo "Request body:"
 echo "$body"
 fi

 echo "Status: $status_code"
 echo "Response body:"
 cat "$response_file"
 echo ""

 rm -f "$response_file"
 return 1
 fi

 rm -f "$response_file"
 return 0
}

echo "Running backend smoke tests..."

invoke_smoke_request \
 "GET" \
 "$BASE_URL/api/organizzazioni/OR0000000001/tree"

SERIALE="SMOKE-$(date +%s%3N)"

POST_BODY="$(
 cat <<JSON
{
 "nome": "TAC Smoke Test",
 "tipologia": "TAC",
 "numeroDiSerie": "$SERIALE",
 "dataInstallazione": "2024-03-15",
 "organizzazioneId": "OR0000000001",
 "contenitoreId": null
}
JSON
)"

invoke_smoke_request \
 "POST" \
 "$BASE_URL/api/apparecchiature" \
 "$POST_BODY"

echo "Smoke tests completed successfully."