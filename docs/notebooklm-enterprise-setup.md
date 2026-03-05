# NotebookLM Enterprise Setup

## Important
NotebookLM Enterprise management endpoints require OAuth bearer authentication.  
A raw `GEMINI_API_KEY` alone is not sufficient for notebook management APIs.

## Environment Variables
Add these in `.env.local`:

```env
NOTEBOOKLM_API_BASE=https://discoveryengine.googleapis.com/v1alpha
NOTEBOOKLM_PARENT=projects/your-project/locations/us/collections/default_collection/engines/your-engine

# Either this:
NOTEBOOKLM_BEARER_TOKEN=ya29...

# Or service account credentials:
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Added API Routes
- `GET /api/notebooklm/setup`
- `GET /api/notebooklm/notebooks`
- `POST /api/notebooklm/notebooks`
- `DELETE /api/notebooklm/notebooks/:notebookId`
- `GET /api/notebooklm/notebooks/:notebookId`
- `GET /api/notebooklm/notebooks/:notebookId/sources`
- `POST /api/notebooklm/notebooks/:notebookId/sources`

## Quick Tests

### 1) Setup Status
```bash
curl http://localhost:3000/api/notebooklm/setup
```

### 2) Create Notebook
```bash
curl -X POST http://localhost:3000/api/notebooklm/notebooks \
  -H "Content-Type: application/json" \
  -d "{\"displayName\":\"Likkle Legends Folklore Notebook\"}"
```

### 3) Add Source
```bash
curl -X POST http://localhost:3000/api/notebooklm/notebooks/YOUR_NOTEBOOK_ID/sources \
  -H "Content-Type: application/json" \
  -d "{\"uri\":\"https://example.com/caribbean-folklore.pdf\",\"title\":\"Folklore Pack\"}"
```
