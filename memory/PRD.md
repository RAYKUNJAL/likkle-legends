# Likkle Legends - Product Requirements Document

## Project Overview
**Name:** Likkle Legends - Caribbean Emotional-Learning Platform  
**Target Audience:** Children ages 4-8 across the Caribbean region and diaspora  
**Domain:** www.likklelegends.com  
**Last Updated:** February 11, 2026

---

## Technical Stack
- **Framework:** Next.js 14.1.0 with App Router
- **Language:** TypeScript 5.9.3
- **Database:** Supabase (PostgreSQL)
- **AI Services:** Google Gemini 2.0 Flash
- **Voice:** ElevenLabs Caribbean voices
- **Payments:** PayPal SDK
- **Styling:** Tailwind CSS with custom Caribbean glassmorphism theme
- **Fonts:** Fredoka (headings), Quicksand (body)

---

## User Personas

### Primary: Caribbean Diaspora Parents
- Parents living outside Caribbean wanting children connected to roots
- Ages 25-45, college-educated, concerned about cultural identity
- Value educational content that celebrates Caribbean heritage

### Secondary: Educators
- Teachers seeking Caribbean-themed SEL curriculum
- Homeschool parents wanting cultural enrichment
- School administrators looking for diverse content

### Tertiary: Children (End Users)
- Ages 4-8 (Mini Legends & Big Legends tracks)
- Learning emotional literacy through Caribbean stories
- Engaging with AI characters and interactive content

---

## Core Requirements

### 1. Tanty Spice AI Chatbot ✅
- Pan-Caribbean grandmother personality
- Caribbean dialect responses (phonetic spelling)
- Age-appropriate linguistic tiering (3-5, 6-8, 9-12)
- Safety guardrails for forbidden topics

### 2. Magic Story Creator ✅
- 12-page personalized storybooks
- Custom hero names and Caribbean themes
- Image prompts for illustrations
- Parent notes for offline activities
- Patois vocabulary integration

### 3. Character System ✅
- R.O.T.I. (Learning Buddy)
- Tanty Spice (Emotional Anchor)
- Dilly Doubles (Joy Guide)
- Mango Moko (Nature Guardian)
- Benny of Shadows (Mystery Guide)
- Steelpan Sam (Music Master)

### 4. Voice Synthesis ✅
- ElevenLabs Caribbean voice models
- Tanty Spice custom voice
- R.O.T.I. robot voice

### 5. Authentication System ✅
- Email/Password login
- Magic Link login
- Supabase auth integration

### 6. Pricing Tiers ✅
- Starter Mailer ($9.99/mo)
- Legends Plus ($19.99/mo) - Most Popular
- Family Legacy ($34.99/mo)
- 7-Day Free Pass ($0)

---

## What's Been Implemented

### February 11, 2026
1. **Bug Fixes:**
   - Fixed `useEffect` import in LibraryGrid.tsx
   - Fixed Gemini model name (gemini-2.5-flash-preview-tts → gemini-2.0-flash)
   - Fixed StoryStudioWizard header overlay blocking navigation

2. **API Integrations:**
   - Tanty Spice AI chatbot working with Caribbean dialect
   - ElevenLabs TTS returning audio
   - Story generation API working (12-page stories)
   - Health check API functional

3. **Pages Verified Working:**
   - Homepage with hero section
   - Characters page with all 6 characters
   - Login page with Password/Magic Link options
   - Pricing page with 4 tiers
   - Navigation working across all pages

---

## Prioritized Backlog

### P0 - Critical (Blocking Launch)
- [ ] Supabase database tables creation (migrations)
- [ ] Image generation for stories (currently prompts only)
- [ ] Complete auth flow testing

### P1 - High Priority
- [ ] Parent Dashboard functionality
- [ ] Child Portal with gamification
- [ ] Story saving to database
- [ ] Audio narration for stories

### P2 - Medium Priority
- [ ] Island Radio music player
- [ ] Games (Anansi Game, Island Memory, etc.)
- [ ] Blog content management
- [ ] Email notifications (Resend)

### P3 - Nice to Have
- [ ] PayPal subscription integration
- [ ] Referral system
- [ ] Analytics dashboard
- [ ] PWA offline mode

---

## API Endpoints Summary

| Endpoint | Status | Description |
|----------|--------|-------------|
| /api/tanty-spice | ✅ Working | AI chatbot |
| /api/story/generate | ✅ Working | Story generation |
| /api/elevenlabs-tts | ✅ Working | Voice synthesis |
| /api/health | ✅ Working | Health check |
| /api/roti-chat | ✅ Working | R.O.T.I. chatbot |

---

## Environment Variables Required
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
- ELEVENLABS_API_KEY
- OPENAI_API_KEY (optional)
- NEXT_PUBLIC_PAYPAL_CLIENT_ID (for payments)
- RESEND_API_KEY (for emails)
