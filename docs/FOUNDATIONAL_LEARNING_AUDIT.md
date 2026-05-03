# Likkle Legends Foundational Learning Audit

This is the product standard for turning Likkle Legends into a Caribbean-first education franchise, not only a content app.

## What Is Already Strong

- Character-led brand world with Tanty Spice, R.O.T.I., Dilly Doubles, Mango Moko, and Scorcha Pepper.
- Parent signup, child profile creation, island picker, and portal flow.
- AI story generation, story reading, games, songs, printables, and content automation foundation.
- PayPal checkout and entitlement unlock path.
- Admin surfaces for content, media, costs, approvals, YouTube, and revenue.
- Google/Firebase migration foundation and Paperclip operating model.

## Foundational Gaps To Close

1. Curriculum alignment
   - Every lesson, story, game, song, and printable needs a learning objective, age band, and literacy pillar.
   - Use CPEA literacies, Trinidad and Tobago primary curriculum themes, and OECS Essential Learning Outcomes as the first alignment layer.

2. Assessment evidence
   - Add mastery signals for completion, accuracy, read-aloud minutes, vocabulary learned, retry count, reflection, and teacher notes.
   - Parent and teacher dashboards must show what the child learned, not just what they clicked.

3. School licensing module
   - Build teacher accounts, class rosters, student invites, term reports, printable lesson plans, classroom mode, and school admin billing.

4. Child safety and COPPA-grade trust
   - Keep character chat locked to safe age-banded prompts.
   - Add parent-visible chat summaries, moderation logs, and school-safe mode.
   - Never request private child data.

5. Accessibility
   - Voice-first navigation for ages 3 to 5.
   - Storybooks need word highlighting, manual page turns, auto-turn, captions/transcripts, and keyboard controls.

6. Character franchise bible
   - Each character needs a written persona, voice, teaching domain, forbidden behaviors, catchphrases, visual rules, and curriculum ownership.

7. Teacher proof
   - Add exports that a principal can understand: standards map, weekly plan, learning evidence, and child-safe AI policy.

8. Research and cultural accuracy
   - Island facts, folklore, food, music, language, and geography need source notes and review status.

## Curriculum Foundation Added

Code now includes:

- `lib/education/caribbean-curriculum.ts`
- `/admin/curriculum`

This defines:

- Age bands: 3-5, 6-7, 8-9.
- Curriculum pillars: language, mathematics, science, civic/cultural literacy, creative expression, wellbeing/identity.
- Character ownership by pillar.
- Evidence targets for parent/teacher reporting.
- School readiness build list.

## Near-Term Build Priorities

1. Attach every content item to a curriculum pillar and age band.
2. Add learning evidence writes when a child finishes a story/game/song/printable.
3. Add parent dashboard learning reports.
4. Build teacher/classroom accounts.
5. Add school pilot package: Trinidad and Tobago first, then OECS/CPEA-aligned regional version.

## Official Alignment Sources

- CXC CPEA: https://www.cxc.org/examinations/cpea/
- Trinidad and Tobago Ministry of Education primary curriculum: https://moe.gov.tt/primary/
- OECS Learning Hub ELO guide: https://www.oecslearning.org/elo-guide.html
