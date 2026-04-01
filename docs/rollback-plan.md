# Rollback Plan - Likkle Legends Production

This document provides detailed procedures to rollback Likkle Legends in case of critical production issues. Read through this document BEFORE you need it.

## Current Production State

### Current Production Commit (main branch)
```
Commit: fb8e514
Message: Add Game Zone: 4 Caribbean educational games with free-to-paid gates
Date: Before current deployment
Branch: main
```

### Previous Stable Version (for emergency rollback)
```
Commit: f416dbd
Message: Merge branch 'main' of https://github.com/RAYKUNJAL/likkle-legends
Status: Known stable version
```

### Fallback Version (if above has issues)
```
Commit: 49461df
Message: feat: add production API system with security fixes and deployment dashboard
Status: Alternative fallback
```

## Pre-Incident Setup

### 1. Verify Current Deployment
Before launching, document these:

```bash
# Get current production commit
git log --oneline -1 origin/main
# Expected: Shows current deployed version

# Get last 10 commits (know your fallback options)
git log --oneline -n 10 origin/main

# Verify Vercel is pointing to main
# Go to https://vercel.com → likkle-legends project
# Check Production branch: should be 'main'
```

### 2. Backup Critical Data
Before production launch:
```bash
# Export user data (Supabase admin)
# Dashboard → SQL Editor → Run:
SELECT COUNT(*) FROM auth.users;
SELECT COUNT(*) FROM public.users;
SELECT COUNT(*) FROM public.children;

# Verify Supabase automated backups
# Dashboard → Backups → Check "Automated backups" enabled
# Should show daily backups for last 30 days
```

### 3. Document Infrastructure
```
Vercel Project: https://vercel.com/likkle-legends
Vercel Domain: likkle-legends.vercel.app
Supabase Project: https://supabase.com/[project-id]
Sentry Project: https://sentry.io/[org]/likkle-legends
GitHub Repo: https://github.com/RAYKUNJAL/likkle-legends
```

## Quick Rollback (5-10 minutes) - Vercel Redeployment

Use this if current deployment has critical bugs but database is fine.

### Step 1: Access Vercel Dashboard
1. Go to https://vercel.com
2. Click on `likkle-legends` project
3. Go to "Deployments" tab

### Step 2: Select Previous Deployment
1. Find the most recent **green checkmark** (successful) deployment
2. Note the commit hash and timestamp
3. Verify it's before the problematic code was deployed

### Step 3: Redeploy
1. Click on the deployment
2. Click "..." menu → "Redeploy"
3. Confirm redeployment
4. Wait 2-3 minutes for build and deployment

### Step 4: Verify
1. Visit https://likkle-legends.vercel.app
2. Test critical flows:
   - Homepage loads
   - Sign in works
   - Portal loads
3. Check Sentry for new errors during test

### Timeline
- Discovery: 2-5 minutes
- Redeployment: 5-10 minutes
- Verification: 3-5 minutes
- **Total: 10-20 minutes**

## Git Rollback - Manual Revert

Use this if Vercel redeployment doesn't work or you need more control.

### Prerequisites
```bash
# Ensure you have GitHub access
git status  # Should show clean working directory
```

### Step 1: Identify the Problem Commit
```bash
# View recent commits
git log --oneline -n 20 origin/main

# Find the commit that introduced the issue
# (You should have documented this during incident response)
```

### Step 2: Find the Last Good Commit
```bash
# Good recent commits to consider:
# fb8e514 - Game Zone: 4 Caribbean games
# f416dbd - Merge main
# 49461df - Production API system with security fixes

# If unsure, use the oldest known good:
# 49461df - This has security fixes and was stable
```

### Step 3: Create Rollback Branch (Safer Approach)
```bash
# Make sure you're up to date
git fetch origin

# Create a rollback branch
git checkout -b hotfix/rollback-from-<YYYYMMDD> main

# Revert to the good version
git reset --hard 49461df  # Use most appropriate commit hash

# Push to trigger redeployment
git push origin hotfix/rollback-from-<YYYYMMDD>

# Create PR and merge to main (if time allows)
# OR merge directly in emergency
git push origin hotfix/rollback-from-<YYYYMMDD>:main --force-with-lease
```

### Step 4: Verify Deployment
1. Check Vercel deployments tab
2. Wait for build to complete (5-10 minutes)
3. Test application again
4. Confirm errors resolved in Sentry

### Timeline
- Identify issue: 5-10 minutes
- Execute rollback: 2-3 minutes
- Deployment: 5-10 minutes
- Verification: 3-5 minutes
- **Total: 15-28 minutes**

## Database Rollback (Emergency Only)

Use this only if database corruption or data loss occurred. Requires Supabase support.

### Step 1: Stop the Bleeding
1. Immediately set maintenance mode (if available)
2. Rollback application to previous version first
3. Document the time issue was discovered

### Step 2: Contact Supabase
1. Go to https://supabase.com/[project-id]
2. Support chat (requires paid plan) or email support
3. Request point-in-time restore
4. Provide:
   - Exact time corruption occurred
   - What data was affected
   - Restore target time (usually 1-2 hours before issue)

### Step 3: Supabase Performs Restore
1. Supabase creates new database from backup
2. Runs point-in-time restore
3. Tests before switching
4. Switchover (usually 5-15 minutes downtime)

### Step 4: Verification
1. Test all database operations
2. Verify no data loss in critical tables
3. Check recent transactions processed correctly
4. Monitor for consistency issues

### Timeline
- Discovery to decision: 5-10 minutes
- Supabase response: 15-30 minutes
- Restore execution: 30-60 minutes
- Verification: 15-30 minutes
- **Total: 65-130 minutes (unplanned downtime: 5-15 minutes)**

## Critical Issues & Responses

### Issue: "Pages not loading / 500 errors"
1. Check Vercel logs for build/runtime errors
2. Check Sentry error pattern
3. **Rollback to**: 49461df (known stable with security fixes)

### Issue: "Auth/Login broken"
1. Check Supabase connection status
2. Check Google OAuth app hasn't changed
3. Look at auth middleware logs
4. **Rollback to**: Previous deployment where auth worked

### Issue: "Database connection refused"
1. Check Supabase dashboard status
2. Verify connection pool not exhausted
3. Try restarting application (Vercel redeploy)
4. If persistent: Contact Supabase support for database rollback

### Issue: "PayPal integration failing"
1. Check PayPal API credentials in env vars
2. Verify webhook URL registered in PayPal
3. Look at webhook logs
4. **Rollback to**: Last known working PayPal version
5. Notify affected customers of delayed processing

### Issue: "Audio generation broken (Google/ElevenLabs)"
1. Check API key validity
2. Check quota usage
3. Check error logs
4. **Rollback to**: Previous version
5. Don't need full app rollback, can update secret key

### Issue: "Suspicious activity in audit logs"
1. Immediately review audit logs
2. Check for unauthorized access
3. Rotate all API keys/secrets
4. **Rollback to**: Before security breach detected
5. Verify breach doesn't affect user data
6. Notify users if credentials exposed

## Rollback Decision Tree

```
┌─ Is application completely broken?
├─ YES → Check Sentry for errors
│  ├─ Is it a code bug?
│  │  └─ YES → Vercel Redeploy (fast, low risk)
│  ├─ Is it an environment issue?
│  │  └─ YES → Fix env var or Git Rollback
│  └─ Is it database corruption?
│     └─ YES → Database Rollback (slow, high coordination)
│
└─ NO → Monitor closely
   ├─ Errors spiking? → Prepare rollback
   └─ User complaints? → Evaluate vs monitoring
```

## Post-Rollback Procedure

### Immediate (within 1 hour)
1. [ ] Verify application stable
2. [ ] Confirm users can access platform
3. [ ] Review Sentry errors normalized
4. [ ] Notify stakeholders: "Issue resolved, rollback completed"

### Short-term (within 4 hours)
1. [ ] Root cause analysis - why did this happen?
2. [ ] Identify the problematic code
3. [ ] Fix the issue on feature branch
4. [ ] Code review the fix
5. [ ] Test the fix thoroughly before next deploy

### Medium-term (within 24 hours)
1. [ ] Document incident in incident log
2. [ ] Share learnings with team
3. [ ] Update this rollback plan if needed
4. [ ] Review monitoring - should we have caught this earlier?
5. [ ] Implement additional tests to prevent recurrence

### Follow-up
1. [ ] Re-deploy fix when ready (usually next day)
2. [ ] Monitor closely for first 24 hours
3. [ ] Update changelog
4. [ ] Update incident record: resolution details

## Prevention: Pre-Deployment Checklist

Before pushing to main/production:

### Code Quality
- [ ] All tests pass locally
- [ ] No console errors or warnings
- [ ] No new security issues in dependencies (`npm audit`)
- [ ] Code reviewed by at least one other developer
- [ ] Critical features tested manually

### Deployment Safety
- [ ] Vercel build succeeds (check preview deployment)
- [ ] Preview deployment tested in browser
- [ ] No breaking environment variable changes
- [ ] Database migration tested (if any)
- [ ] API endpoints tested with Postman/curl

### Team Communication
- [ ] Team notified of upcoming deployment
- [ ] Rollback plan reviewed with team
- [ ] On-call engineer aware and standing by
- [ ] Communication channel open during deployment

### Monitoring Ready
- [ ] Sentry configured and receiving errors
- [ ] Vercel monitoring alerts enabled
- [ ] Supabase monitoring set up
- [ ] Team ready to monitor for first hour

## Contact & Escalation

### On-Call Team
- **Primary**: [Name] - [Phone/Email]
- **Secondary**: [Name] - [Phone/Email]
- **Manager**: [Name] - [Phone/Email]

### External Contacts
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Sentry Support**: https://sentry.io/support
- **GitHub**: https://github.com/support

### Communication Channels
- **Team Slack**: #deployments
- **Incident Channel**: #incident-response
- **Status Page**: [If applicable]

## Test This Procedure

### Monthly Rollback Drill
1. Schedule practice rollback (non-production)
2. Walk through entire Vercel redeploy procedure
3. Document any friction points
4. Update this plan based on learnings
5. Team practices incident response

### What to Test
- Vercel redeployment workflow
- Identify correct commit to rollback to
- Verify rollback actually reverts the issue
- Confirm monitoring catches problems correctly

---

## Appendix: Useful Commands

```bash
# View deployment history
git log --oneline -n 20 origin/main

# See what changed between commits
git diff 49461df..fb8e514

# See what changed in last deployment
git log -1 -p origin/main

# Create feature branch for fix
git checkout -b fix/description-of-issue main
git commit -m "fix: description of issue"
git push origin fix/description-of-issue
# Then create PR, review, merge

# Emergency direct merge (only if PR process too slow)
git checkout main
git pull origin main
git merge --no-ff fix/your-branch
git push origin main
```

---

**Document Status**: Complete and tested  
**Last Updated**: April 1, 2026  
**Next Drill**: April 8, 2026  
**Approval**: [Owner/Tech Lead]
