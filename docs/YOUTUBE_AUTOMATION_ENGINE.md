# Likkle Legends YouTube Automation Engine

## Goal

Publish two approved Caribbean kids educational videos per day to the Likkle Legends YouTube channel. The engine drives awareness, channel growth, and traffic back into the platform.

## Production Path

1. Gemini researches a kid-safe island topic for ages 3 to 9.
2. Gemini creates the lesson goal, script, captions, metadata, and visual prompts.
3. Approved character art from `public/assets/youtube/characters` anchors brand consistency.
4. Approved owned music from `public/assets/youtube/music` is attached to the plan.
5. Optional Seedance provider creates short motion clips from the owned character/reference art.
6. Remotion assembles the final 1080x1920 Short or 2-minute music video with captions and CTA.
7. Human approval gate checks COPPA, character consistency, factual safety, and rights.
8. YouTube Data API uploads as private, made-for-kids, then schedules publish.
9. Approved cuts are repackaged for Instagram Reels, Facebook Reels, and TikTok when platform-safe.

## Content Mix

Start with 5 videos per day until quality, retention, and approval speed are proven:

- 2 nursery-rhyme/music videos around owned Suno exports or uploaded songs
- 1 short island fact
- 1 Caribbean folklore story, softened for ages 3 to 9
- 1 healthy habit, numbers, letters, food, animal, or language lesson

Scale toward 10 per day only after the approval queue stays green for 7 days and every video has enough variation to avoid mass-produced or repetitious content problems.

## Approval Queue

- `GET /api/admin/youtube/approval-queue`
- `POST /api/admin/youtube/approval-queue` with `{ "count": 5 }`
- `PATCH /api/admin/youtube/approval-queue/:id` to move status through `approved`, `rejected`, `rendered`, `scheduled`, and `published`

Every queue item tracks COPPA safety, rights clearance, character consistency, island fact-checking, and parent-safe CTA review.

## CTA Rules

Kids videos should use soft brand CTAs only:

- "Subscribe for more Likkle Legends island learning."
- "Grown-ups, continue the adventure at LikkleLegends.com."

Do not ask children to comment personal details, submit names, share location, enter contests alone, or leave YouTube without a grown-up.

## Suno Music

Use exported/uploaded songs that Likkle Legends owns or has rights to use. Do not automate against a Suno website login unless Suno provides an official API and commercial terms for that account. Third-party Suno wrappers can be evaluated later, but they should stay behind a provider adapter and never be the default for a kids platform.

Current uploaded samples:

- `public/assets/youtube/music/saving-money.mp3`
- `public/assets/youtube/music/drinking-water.mp3`

## Seedance

Seedance should be treated as an optional video-generation provider, not the core renderer. Remotion remains the reliable owned pipeline. Seedance can be used for image-to-video motion clips when credentials, rights, and watermark/commercial terms are confirmed.

Expected environment variables when enabled:

- `SEEDANCE_PROVIDER`
- `SEEDANCE_API_KEY`
- `SEEDANCE_MODEL`

## Commands

- `npm run video:studio`
- `npm run video:render:sample`

## API Routes

- `GET /api/admin/youtube/plan` lists approved assets and schedule.
- `POST /api/admin/youtube/plan` creates a Gemini video plan.
- `POST /api/cron/youtube/twice-daily` queues 1 to 10 plans behind `CRON_SECRET` in production.
