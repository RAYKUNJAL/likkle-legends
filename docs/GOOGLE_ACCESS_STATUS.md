# Google Access Status

Checked from this workstation on 2026-05-03.

## What Works

- `gcloud` is installed.
- `gcloud` is authenticated as `raykunjal@gmail.com`.
- The account can list Google Cloud projects.
- The account can see `likkle-legends` and `callyuh-pro`.
- `callyuh-pro` has the needed Google services enabled for the migration foundation:
  - AI Platform
  - Cloud Build
  - Cloud Scheduler
  - Cloud Tasks
  - Firebase App Hosting
  - Firebase Hosting
  - Firestore
  - Cloud Run
  - Secret Manager

## What Is Blocked

- Firebase CLI is not logged in on this machine. Use:

```powershell
npx firebase-tools login
```

- `likkle-legends` is missing an attached billing account. Google refused to enable Cloud Run, Cloud Tasks, Cloud Scheduler, Secret Manager, Cloud Build, Artifact Registry, Container Registry, and the full App Hosting runtime until billing is attached.

## Next Human Step

In Google Cloud Console, attach billing to project `likkle-legends`.
Then run:

```powershell
.\scripts\google\bootstrap-project.ps1 -ProjectId likkle-legends
npx firebase-tools login
```

After that, this repo can deploy Firebase rules, App Hosting config, and Google-hosted staging/prod resources.
