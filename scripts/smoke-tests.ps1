$ErrorActionPreference = "Stop"

$BaseUrl = "http://localhost:8080/anagrafica"
$Auth = "admin:admin"
$EncodedAuth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($Auth))

$Headers = @{
 Authorization = "Basic $EncodedAuth"
 "Content-Type" = "application/json"
}

function Invoke-SmokeRequest {
 param(
 [string]$Method,
 [string]$Url,
 [string]$Body = $null
 )

 Write-Host "Smoke $Method $Url"

 try {
 if ($Body) {
 return Invoke-WebRequest `
 -Method $Method `
 -Uri $Url `
 -Headers $Headers `
 -Body $Body `
 -UseBasicParsing `
 -TimeoutSec 30
 }

 return Invoke-WebRequest `
 -Method $Method `
 -Uri $Url `
 -Headers $Headers `
 -UseBasicParsing `
 -TimeoutSec 30
 }
 catch {
 Write-Host ""
 Write-Host "Smoke request failed"
 Write-Host "Method: $Method"
 Write-Host "Url: $Url"

 if ($Body) {
 Write-Host "Request body:"
 Write-Host $Body
 }

 if ($_.Exception.Response -ne $null) {
 $statusCode = [int]$_.Exception.Response.StatusCode
 Write-Host "Status: $statusCode"

 try {
 $stream = $_.Exception.Response.GetResponseStream()
 $reader = New-Object System.IO.StreamReader($stream)
 $responseBody = $reader.ReadToEnd()
 Write-Host "Response body:"
 Write-Host $responseBody
 }
 catch {
 Write-Host "Unable to read response body."
 }
 }

 throw
 }
}

Write-Host "Running backend smoke tests..."

$getResponse = Invoke-SmokeRequest `
 -Method "GET" `
 -Url "$BaseUrl/api/organizzazioni/OR0000000001/tree"

if ($getResponse.StatusCode -lt 200 -or $getResponse.StatusCode -ge 300) {
 throw "GET organizzazione tree fallita con status $($getResponse.StatusCode)"
}

$seriale = "SMOKE-$([DateTimeOffset]::Now.ToUnixTimeMilliseconds())"

$postBody = @{
 nome = "TAC Smoke Test"
 tipologia = "TAC"
 numeroDiSerie = $seriale
 dataInstallazione = "2024-03-15"
 organizzazioneId = "OR0000000001"
 contenitoreId = $null
} | ConvertTo-Json

$postResponse = Invoke-SmokeRequest `
 -Method "POST" `
 -Url "$BaseUrl/api/apparecchiature" `
 -Body $postBody

if ($postResponse.StatusCode -lt 200 -or $postResponse.StatusCode -ge 300) {
 throw "POST apparecchiatura fallita con status $($postResponse.StatusCode)"
}

Write-Host "Smoke tests completed successfully."