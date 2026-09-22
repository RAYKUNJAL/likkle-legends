# Weekly Caribbean picture books

One new original kids picture book can be added each week. The book is not a folktale claim. It is new fiction set in the Caribbean, using an existing Likkle Legends character. It goes on the kids shelf only after every page has a real illustration.

## Monday routine for a Grok bot

Run this from the repo every Monday. A scheduler, a Grok bot routine, or a person can use the same commands. Nothing here publishes a cover-only book.

1. Create the week's manuscript (text only, not published):

```bash
npx tsx scripts/weekly-picture-book.ts --draft
```

2. Read `content/weekly-drafts/week-YYYY-MM-DD.json`. Check that it is kind, original, and does not say it is a traditional story.

3. Generate cover and page art, then publish only if every file exists:

```bash
npx tsx scripts/weekly-picture-book.ts --publish content/weekly-drafts/week-YYYY-MM-DD.json
npx tsx scripts/verify-kids-library.ts
```

4. If verify passes, commit `lib/data/live-library-stories.json` and the new files under `public/images/story-covers/` and `public/images/story-pages/`.

If `GEMINI_API_KEY` is missing, `--draft` still writes a safe original template and `--publish` refuses to add the book. If art files are missing, publish exits with an error and leaves the live catalog alone.

## What the script checks

- Title, summary, and pages are present.
- `originality` is `original_fiction`.
- The title is not framed as "the legend of" or a traditional folktale.
- Kid-safety screen rejects violent or romantic wording.
- 8–12 pages, each with text and an illustration note.
- Cover PNG and every page PNG exist on disk before the catalog JSON changes.

## Optional HTTP trigger

`POST /api/cron/weekly-picture-book` with `Authorization: Bearer $CRON_SECRET`.

- `{ "mode": "draft" }` writes a manuscript and does not publish.
- `{ "mode": "publish", "manuscript": "content/weekly-drafts/week-YYYY-MM-DD.json" }` publishes only when the art files are already there.

The route is fail-closed when `CRON_SECRET` is unset. Paths outside `content/weekly-drafts/` are rejected.

## Narration

New books are published without the old robotic recordings. After a book is in the catalog, warm narration is a separate step:

```bash
npx tsx scripts/regenerate-story-narration.ts
```

That script needs `ELEVENLABS_API_KEY` (preferred) or `GEMINI_API_KEY`. It does not write audio or change `narrated_by` when both keys are missing.
