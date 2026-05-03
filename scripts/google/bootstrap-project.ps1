param(
  [string]$ProjectId = "likkle-legends",
  [string]$Region = "us-central1"
)

$ErrorActionPreference = "Stop"

Write-Host "Bootstrapping Google services for $ProjectId in $Region"

gcloud config set project $ProjectId

$services = @(
  "firebaseapphosting.googleapis.com",
  "firebase.googleapis.com",
  "firestore.googleapis.com",
  "firebasestorage.googleapis.com",
  "run.googleapis.com",
  "cloudtasks.googleapis.com",
  "cloudscheduler.googleapis.com",
  "secretmanager.googleapis.com",
  "cloudbuild.googleapis.com",
  "aiplatform.googleapis.com"
)

foreach ($service in $services) {
  Write-Host "Enabling $service"
  gcloud services enable $service
}

Write-Host "Bootstrap complete. Next: set secrets, deploy rules, and create the App Hosting backend."
