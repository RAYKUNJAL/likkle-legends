# Likkle Legends Launch Room

## Operating Model

Paperclip is the orchestration layer for the launch room. Codex leads repo edits, verification, and final integration. Gemini powers in-app AI for agents, curriculum, blogs, artwork prompts, and customer-facing intelligence. Goose can be used for bounded local failure inspection when it saves time.

Local Paperclip is available at:

- Health: `http://127.0.0.1:3100/api/health`
- Onboarding: `http://127.0.0.1:3100/onboarding`

## Launch Agents

- CEO Agent: priorities, revenue targets, weekly execution decisions
- Tech Lead Agent: build health, integrations, deployment blockers
- Content Agent: island curriculum, stories, YouTube scripts, blogs
- Art Director Agent: character consistency, artwork prompts, asset QA
- Revenue Agent: subscriptions, checkout, churn, email campaigns
- School Sales Agent: B2B licensing, teacher onboarding, renewal playbooks
- Customer Success Agent: parent onboarding, support, rescue campaigns
- Compliance Agent: COPPA, accessibility, privacy, payment safety

## Hard Rules

- No Claude or Anthropic API runtime in this build.
- Gemini is the default AI provider for cost control.
- OpenAI can be added later only as an optional fallback for tasks where it is cheaper or clearly better.
- Checkout, onboarding, admin launch health, and child profile creation are P0.
- Any AI spend must be measurable, capped, and visible in admin before scale.

## P0 Build Board

- Payment path: PayPal one-time order creation and capture through deployed Supabase Edge Functions.
- Kid onboarding: signup to child profile to portal must complete without manual support.
- Admin command center: revenue, AI team, YouTube pipeline, onboarding health, and launch blockers.
- Content engine: Gemini-powered story/blog/script generation with character and island guardrails.
- YouTube growth engine: 5 approved videos per day first, then 10 per day after quality and rights checks are consistently green.
- Verification: `npm run build`, local smoke, then production endpoint checks after push.
