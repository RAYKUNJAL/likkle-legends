# Likkle Legends Build & Deployment Rules

To prevent recurring build failures and database inconsistencies, all development must adhere to the following rules:

### RULE 1: API & CRON Route Integrity
- **Mandatory Dynamic Tag**: Any API route using `request.headers`, `request.cookies`, or `searchParams` MUST export `const dynamic = 'force-dynamic';`. Failure to do this will crash Vercel builds.
- **No Client Directives**: Never use `'use server'` or `'use client'` at the top of an API `route.ts` file. API routes are server-side by default.

### RULE 2: Database Migration Standard
- **Self-Healing SQL**: All manual migration scripts MUST use `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, and `DROP POLICY IF EXISTS`.
- **Recursion Prevention**: Never use `EXISTS (SELECT 1 FROM table)` inside a policy for that SAME table. Always use JWT email checks or narrow user ID filters.
- **Bootstrap First**: When adding a new feature that uses a table, ensure the `manual_migration_v5.sql` (or latest) is updated so the table exists before the app tries to fetch from it during build.

### RULE 3: Build Verification
- **Pre-Push Build**: Always run `npm run build` locally before pushing to GitHub.
- **Log Audit**: Check the build log for "Dynamic server usage" or "relation does not exist" warnings.

### RULE 4: CMS Fallbacks
- **Universal Fallback**: All CMS fetch functions (`lib/services/cms.ts`) must have a `try/catch` that returns static JSON content if the database is uninitialized or the table is missing.
