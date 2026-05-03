param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl
)

$ErrorActionPreference = "Stop"

$paths = @(
  "/",
  "/signup",
  "/login",
  "/checkout",
  "/portal/super-pack",
  "/portal/heritage-story"
)

foreach ($path in $paths) {
  $url = "$BaseUrl$path"
  Write-Host "GET $url"
  $response = Invoke-WebRequest -Uri $url -UseBasicParsing -MaximumRedirection 5
  if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 400) {
    throw "Smoke check failed for $url with HTTP $($response.StatusCode)"
  }
}

Write-Host "Google staging smoke checks passed."
