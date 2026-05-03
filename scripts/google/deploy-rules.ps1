param(
  [string]$ProjectAlias = "staging"
)

$ErrorActionPreference = "Stop"

Write-Host "Deploying Firestore and Storage rules to Firebase project alias '$ProjectAlias'"
npx firebase-tools use $ProjectAlias
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage
