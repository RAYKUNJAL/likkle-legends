# Security Fix: Gemini API Key Exposure (April 2026)

## Vulnerability Summary

**CRITICAL**: The Gemini API key was previously exposed in the browser bundle through the `NEXT_PUBLIC_GEMINI_API_KEY` environment variable. This allowed attackers to:

- Make unlimited free API calls impersonating the application
- Deplete the billing quota
- Redirect requests to attacker-controlled infrastructure
- Scrape sensitive content through the API

**Impact**: 20+ files were referencing `NEXT_PUBLIC_GEMINI_API_KEY`, including:
- Client components
- Server actions
- API routes
- Development scripts

## Fix Applied

### 1. Removed NEXT_PUBLIC_ from all API key references
All instances of `NEXT_PUBLIC_GEMINI_API_KEY` have been removed. The API key is now exclusively server-side:

```env
# OLD (EXPOSED):
NEXT_PUBLIC_GEMINI_API_KEY=sk-xxx

# NEW (SECURE):
GEMINI_API_KEY=sk-xxx
```

### 2. Created Backend Proxy Endpoints
New secure API routes proxy all Gemini calls through the backend:

- **`POST /api/gemini/generate`** - General text generation
  - Requires user authentication
  - Accepts: `prompt`, `model`, `temperature`, `maxTokens`, `responseMimeType`
  - Returns: Generated content

- **`POST /api/gemini/image`** - Image generation
  - Requires user authentication
  - Accepts: `prompt`, `fileName`
  - Returns: Supabase-hosted image URL

### 3. Updated Files

#### Core Library Files
- `lib/ai-content-generator/core.ts` - Removed NEXT_PUBLIC_
- `lib/ai-content-generator/provider-wrapper.ts` - Removed NEXT_PUBLIC_
- `lib/ai-image-generator/image-client.ts` - Removed NEXT_PUBLIC_
- `lib/roti-voice.ts` - Removed NEXT_PUBLIC_
- `lib/decodable/agents.ts` - Removed NEXT_PUBLIC_
- `lib/services/blog-agent.ts` - Removed NEXT_PUBLIC_

#### Server Actions
- `app/actions/agents.ts` - Removed NEXT_PUBLIC_
- `app/actions/debug-ai.ts` - Removed NEXT_PUBLIC_
- `app/actions/island-brain.ts` - Removed NEXT_PUBLIC_

#### API Routes
- `app/api/features/generate/route.ts` - Removed NEXT_PUBLIC_
- `app/api/gemini/generate/route.ts` - NEW secure proxy
- `app/api/gemini/image/route.ts` - NEW secure proxy

#### Development Scripts
- `scripts/list-models.ts` - Removed NEXT_PUBLIC_
- `scripts/check-models.ts` - Removed NEXT_PUBLIC_
- `scripts/check-image-models.ts` - Removed NEXT_PUBLIC_
- `scripts/check-image-models-v2.ts` - Removed NEXT_PUBLIC_

#### Client Components
- `app/admin/client-debug/page.tsx` - Now uses backend proxy instead of direct API access

#### Documentation
- `README.md` - Updated to show server-side key configuration

## Migration Guide

### For Developers

1. **Update `.env.local`**:
   ```env
   # Remove this:
   NEXT_PUBLIC_GEMINI_API_KEY=sk-xxx

   # Add this instead:
   GEMINI_API_KEY=sk-xxx
   GOOGLE_GENERATIVE_AI_API_KEY=sk-xxx  # Alternative name
   ```

2. **Use Backend Proxies**:
   If you need to generate content from the frontend, use the new API endpoints:

   ```typescript
   // Client-side code
   const response = await fetch('/api/gemini/generate', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       prompt: 'Generate a story about...',
       model: 'gemini-2.5-pro',
       temperature: 0.9,
       maxTokens: 8192
     })
   });
   const data = await response.json();
   console.log(data.content);
   ```

3. **For Image Generation**:
   ```typescript
   const response = await fetch('/api/gemini/image', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       prompt: 'Vibrant Caribbean island scene...',
       fileName: 'story-image'
     })
   });
   const data = await response.json();
   console.log(data.imageUrl);
   ```

### Environment Configuration

**Development** (`.env.local`):
```env
GEMINI_API_KEY=your_actual_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key  # Alternative
```

**Production**:
- Set `GEMINI_API_KEY` as a secret in your hosting platform
- Ensure it's NOT prefixed with `NEXT_PUBLIC_`
- Verify it's only available to server-side code

## Testing

All existing Gemini features continue to work:
- ✅ Story generation
- ✅ Image generation
- ✅ Text TTS (ROTI voice)
- ✅ Blog post generation
- ✅ Content generation agents

No changes needed to user-facing features.

## Verification Checklist

- [x] Removed all `NEXT_PUBLIC_GEMINI_API_KEY` references
- [x] Created `/api/gemini/generate` backend proxy
- [x] Created `/api/gemini/image` backend proxy
- [x] Updated README with security guidance
- [x] Updated client debug page to use backend
- [x] All server actions updated
- [x] All library functions updated
- [x] All development scripts updated
- [x] Verified no NEXT_PUBLIC_GEMINI in browser bundle

## Security Best Practices Applied

1. **API Keys are Server-Side Only**: Keys never leave the server
2. **Authentication Required**: All endpoints verify user is logged in
3. **No Key Exposure**: Client receives only the generated content, never the key
4. **Rate Limiting Ready**: Backend endpoints can be rate-limited per user
5. **Audit Trail**: Server-side calls can be logged for compliance

## Commit Message

```
security: move Gemini API key to server-side only, remove from client bundle

BREAKING: NEXT_PUBLIC_GEMINI_API_KEY is no longer used.

Changes:
- Removed NEXT_PUBLIC_GEMINI_API_KEY from 20+ files
- Created /api/gemini/generate backend proxy endpoint
- Created /api/gemini/image backend proxy endpoint
- Updated README with server-side key configuration
- All Gemini features now proxied through secure backend

This prevents:
- API key exposure in browser bundle
- Unauthorized API calls impersonating the app
- Billing quota depletion attacks
- Request redirection to attacker infrastructure

Migration: Use GEMINI_API_KEY (no NEXT_PUBLIC_ prefix) in .env.local
```

## References

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [OWASP: Secrets in Code](https://owasp.org/www-community/Secret_in_Code)
- [Google API Security Best Practices](https://cloud.google.com/docs/authentication/best-practices)
