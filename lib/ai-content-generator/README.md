# 🤖 AI Content Generator System

Automated content creation for Likkle Legends platform using Google Gemini AI.

## Overview

This system generates Caribbean-themed educational content for children aged 3-8, including:
- **Stories** with cultural themes and Patois integration
- **Songs** with Caribbean musical styles (calypso, reggae, soca)
- **Illustrations** for all content (character-consistent)
- **Auto-posting** directly to Supabase database

## Architecture

```
lib/ai-content-generator/
├── config.ts                    # Configuration, character profiles, themes
├── core.ts                      # Core Gemini API integration
├── generators/
│   ├── story-generator.ts       # Story generation logic
│   └── song-generator.ts        # Song/rhyme generation
└── database-poster.ts           # Auto-save to Supabase

scripts/
└── generate-content.ts          # CLI tool

docs/
└── CONTENT_GENERATOR_GUIDE.md   # Full user guide
```

## Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env.local

# Add your API keys:
# - GEMINI_API_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Content

```bash
# Single story
npm run generate:stories

# 10 stories
npm run generate:stories -- --count 10

# Daily batch (1 story + 2 songs)
npm run generate:batch
```

## Features

### ✅ **Story Generator**
- Age-appropriate content (mini: 3-5, big: 6-8)
- 8 Caribbean islands supported
- 10+ cultural themes
- Automatic Patois word integration
- Character-driven narratives
- Safe content validation

### ✅ **Song Generator**
- 3 categories: nursery, educational, cultural
- Caribbean musical styles
- Interactive rhythm markers
- Educational value tracking
- Child-friendly lyrics

### ✅ **Smart Automation**
- Batch generation
- Rate limiting
- Content validation
- Database auto-posting
- Progress tracking

### ✅ **Character Consistency**
- Pre-defined character profiles
- Consistent visual descriptions
- Personality integration
- Cultural authenticity

## Configuration

### Content Settings (`lib/ai-content-generator/config.ts`)

- **Islands**: Jamaica, Trinidad, Barbados, Saint Lucia, +4 more
- **Themes**: Family, food, music, traditions, carnival, +5 more
- **Age Groups**: Mini (3-5) and Big (6-8) with word count limits
- **Characters**: Tanty Spice, Captain Calypso, Miss Melody, Rasta Ray

### Generation Quotas

```typescript
{
  storiesPerDay: 1,
  songsPerDay: 2,
  videosPerWeek: 2,  // Coming soon
  missionsPerWeek: 1 // Coming soon
}
```

## CLI Usage

### Generate Stories

```bash
# Basic
npm run generate:stories

# Specific island
npm run generate:stories -- --island Jamaica --count 5

# Age-specific
npm run generate:stories -- --age-track mini --count 3

# Dry run (no database posting)
npm run generate:stories -- --dry-run
```

### Generate Songs

```bash
# Basic
npm run generate:songs

# Multiple songs
npm run generate:songs -- --count 10

# Specific island
npm run generate:songs -- --island "Trinidad and Tobago" --count 5
```

### Batch Generation

```bash
# Recommended for daily automation
npm run generate:batch
```

## Database Integration

Content is automatically posted to:
- `storybooks` table (stories)
- `songs` table (songs/rhymes)
- `videos` table (coming soon)
- `missions` table (coming soon)

All content is set to `is_active: true` for immediate availability.

## Content Quality

### Validation Checks
- ✅ Age-appropriate language
- ✅ Safe content (no violence, inappropriate themes)
- ✅ Reading level verification
- ✅ Cultural authenticity
- ✅ Patois word accuracy

### Safety Features
- Forbidden word detection
- Sentence complexity analysis
- Content moderation
- Manual review queue support

## Automation

### Option 1: Cron Job (Server)

```bash
# Add to crontab (Linux/Mac)
0 6 * * * cd /path/to/likkle-legends && npm run generate:batch

# Windows Task Scheduler
# Action: npm run generate:batch
# Trigger: Daily at 6:00 AM
```

### Option 2: Vercel Cron

Create `/api/cron/generate-content/route.ts`:

```typescript
import { storyGenerator } from '@/lib/ai-content-generator/generators/story-generator';
import { databasePoster } from '@/lib/ai-content-generator/database-poster';

export async function GET() {
  const story = await storyGenerator.generateStory();
  await databasePoster.postStory(story);
  return Response.json({ success: true });
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/generate-content",
    "schedule": "0 6 * * *"
  }]
}
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Story generation
- [x] Song generation
- [x] Database auto-posting
- [x] CLI tool
- [x] Character profiles

### Phase 2 (Next)
- [ ] Real image generation (currently placeholder)
- [ ] Video lesson scripts
- [ ] Mission/activity generator
- [ ] Audio narration generation

### Phase 3 (Future)
- [ ] Custom character training
- [ ] Multi-language support
- [ ] Advanced content analytics
- [ ] A/B testing framework

## Troubleshooting

### API Rate Limits
Built-in 2-second delay between generations. Adjust in generators if needed.

### Environment Variables
Verify `.env.local` has all required keys. Check `.env.example` for template.

### Database Connection
Ensure Supabase credentials are correct and RLS policies allow service role access.

### Image Generation
Currently using placeholders. Implement real generation in `database-poster.ts`.

## Examples

### Populate Initial Library (Week 1)

```bash
# Day 1: Foundation stories
npm run generate:stories -- --age-track mini --count 5
npm run generate:stories -- --age-track big --count 5

# Day 2: Songs
npm run generate:songs -- --count 10

# Day 3-7: Island-specific content
npm run generate:stories -- --island Jamaica --count 2
npm run generate:stories -- --island Trinidad --count 2
npm run generate:songs -- --island Barbados --count 3
```

### Daily Maintenance

```bash
# Automated (cron)
npm run generate:batch

# Manual extras
npm run generate:stories -- --count 1
npm run generate:songs -- --count 2
```

## Performance

- Story generation: ~30-60 seconds each
- Song generation: ~20-40 seconds each
- Batch mode: ~3-5 minutes total
- Rate limit safe: 2-second delay between calls

## Support & Documentation

- **Full Guide**: `docs/CONTENT_GENERATOR_GUIDE.md`
- **CLI Help**: `npm run generate:content -- --help`
- **Code Documentation**: Inline comments in all files

## Contributing

To add new content types:

1. Create generator in `lib/ai-content-generator/generators/`
2. Add to `database-poster.ts`
3. Update CLI tool `scripts/generate-content.ts`
4. Add npm script to `package.json`

## License

Part of Likkle Legends platform. All generated content is owned by Likkle Legends.

---

**Built with ❤️ for Caribbean heritage education**
