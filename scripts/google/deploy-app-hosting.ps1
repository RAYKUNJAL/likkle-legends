param(
  [string]$ProjectAlias = "staging"
)

$ErrorActionPreference = "Stop"

Write-Host "Deploying App Hosting config for Firebase project alias '$ProjectAlias'"
npx firebase-tools use $ProjectAlias
npx firebase-tools deploy --only apphosting
