# AI Content Generator - User Guide

## Quick Start

The AI Content Generator automatically creates Caribbean-themed educational content for children ages 3-8.

### Installation

```bash
# Install dependencies
npm install

# Verify environment variables
cp .env.example .env.local
# Fill in your GEMINI_API_KEY and SUPABASE credentials
```

### Basic Usage

```bash
# Generate a single story
npm run generate:stories

# Generate 10 stories
npm run generate:stories -- --count 10

# Generate songs
npm run generate:songs -- --count 5

# Daily batch (1 story + 2 songs)
npm run generate:batch
```

## Advanced Options

### Generate for Specific Island

```bash
# Jamaica-themed stories
npm run generate:stories -- --island Jamaica --count 3

# Trinidad songs
npm run generate:songs -- --island "Trinidad and Tobago" --count 5
```

### Age-Specific Content

```bash
# Stories for ages 3-5 (mini)
npm run generate:stories -- --age-track mini --count 5

# Stories for ages 6-8 (big)
npm run generate:stories -- --age-track big --count 5
```

### Dry Run (Test Without Posting)

```bash
# Test story generation
npm run generate:stories -- --dry-run

# See output without saving to database
npm run generate:songs -- --count 3 --dry-run
```

## Content Types

### Stories
- **Mini (3-5 years)**: 250 words, 4-5 pages, simple vocabulary
- **Big (6-8 years)**: 650 words, 6-8 pages, more complex plots
- Includes Patois words with definitions
- Caribbean cultural elements
- Character-driven narratives

### Songs
- **Nursery Rhymes**: Counting, colors, animals
- **Educational**: Alphabet, numbers, manners
- **Cultural**: Carnival, traditions, food
- Includes rhythm markers [CLAP], [SNAP]
- Caribbean musical styles (reggae, calypso, soca)

## Automation

### Daily Content Generation

Set up a cron job or scheduled task:

```bash
# Linux/Mac crontab
0 6 * * * cd /path/to/likkle-legends && npm run generate:batch

# Windows Task Scheduler
# Run: npm run generate:batch
# Time: Daily at 6:00 AM
```

### Vercel Cron (Serverless)

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/generate-content",
    "schedule": "0 6 * * *"
  }]
}
```

## Content Library Stats

Check your content library:

```bash
npm run generate:content -- --help
```

Current database content is displayed before each generation.

## Troubleshooting

### Image Generation Placeholder

Currently using placeholder images. To enable real image generation:

1. Update `lib/ai-content-generator/database-poster.ts`
2. Implement Gemini image generation
3. Upload to Supabase Storage

### Rate Limiting

Built-in 2-second delay between generations to avoid API rate limits.

### Content Validation Failures

Stories are automatically validated for:
- Age appropriateness
- Safe content
- Reading level
- Cultural authenticity

Failed validations are logged but generation continues.

## Best Practices

1. **Start Small**: Generate 1-2 items first to test
2. **Review Content**: Use `--dry-run` to preview
3. **Mix Content**: Vary islands and age tracks
4. Use **Batch Mode** for daily automation
5. **Monitor Database**: Check content stats regularly

## Examples

### Populate Initial Library

```bash
# Week 1: Foundation (10 stories + 20 songs)
npm run generate:stories -- --count 5 --age-track mini
npm run generate:stories -- --count 5 --age-track big
npm run generate:songs -- --count 20

# Week 2: Island-Specific Content
npm run generate:stories -- --island Jamaica --count 3
npm run generate:stories -- --island Trinidad --count 3
npm run generate:stories -- --island Barbados --count 2

# Week 3: Themed Content
npm run generate:songs -- --count 5  # Mix of categories
```

### Ongoing Maintenance

```bash
# Daily automated generation
npm run generate:batch  # Runs via cron

# Weekly manual additions
npm run generate:stories -- --count 2
npm run generate:songs -- --count 3
```

## API Reference

### Story Generator Options
- `--type story`
- `--count <number>`
- `--island <name>`
- `--age-track <mini|big>`
- `--dry-run`
- `--no-post`

### Song Generator Options
- `--type song`
- `--count <number>`
- `--island <name>`
- `--age-track <mini|big|all>`
- `--dry-run`
- `--no-post`

### Batch Options
- `--batch` - Generate 1 story + 2 songs

## Support

For issues or questions:
1. Check console output for errors
2. Verify `.env.local` has all required keys
3. Test with `--dry-run` first
4. Review generated content in database

## Roadmap

- [ ] Video lesson script generation
- [ ] Mission/activity creation
- [ ] Real image generation integration
- [ ] Audio narration generation
- [ ] Multi-language support
- [ ] Custom character training
