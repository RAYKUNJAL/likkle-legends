---
description: Verify the project builds correctly and monitor for common Vercel failures
---

### Build Integrity Framework
This workflow ensures the project complies with the [Build Integrity Rules](.agent/rules/build-integrity.md) and prevents common failures like 'Dynamic Server Usage' or RLS recursion.

### 1. Run Lint Check
// turbo
Run the linter to catch React Hook violations or type errors.
```powershell
npm run lint
```

### 2. Run Pre-Build Check (Dry Run)
// turbo
Check for potential build-time dynamic errors without generating full output.
```powershell
npm run build -- --no-lint --debug
```

### 3. Check for specific failure patterns
Search the build output for common issues like "Dynamic server usage" or "infinite recursion".

### 4. Verify Static Route Mapping
Ensure all critical pages (Hero, Checkout, Signup) are generated as Static (○) or SSG (●) if intended, and not incorrectly forced to Dynamic (ƒ) unless required.
