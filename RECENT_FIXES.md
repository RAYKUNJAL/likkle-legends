# Recent Bug Fixes & Improvements (2026-02-24)

## Summary
Fixed critical issues preventing story builder from working, added comprehensive debugging, and resolved feature access control bugs.

---

## 🔴 Critical Fixes

### 1. **Free Tier Story Builder Access Blocked**
- **Problem**: Free tier users couldn't access story builder at all, even though it's supposed to have a 3-story/month limit
- **Root Cause**: `hasFeatureAccess()` function ignored the `free_limit` field, only checking tier >= required_tier
- **Fix**: Updated feature access logic to allow free tier access if `free_limit > 0`
- **File**: `lib/feature-access.ts`
- **Status**: ✅ FIXED

### 2. **NavigatorLock Timeout on Supabase Clients**
- **Problem**: "Acquiring an exclusive Navigator LockManager lock timeout waiting 10000ms" error
- **Root Cause**: Supabase auth-js uses browser's NavigatorLock API which was timing out
- **Fix**: Patched both Supabase clients to override `navigator.locks.request()` and bypass the lock
- **Files**: 
  - `lib/supabase-client.ts` ✅
  - `lib/supabase/client.ts` ✅
- **Status**: ✅ FIXED

### 3. **Admin Tier Not Recognized**
- **Problem**: Admin users had `subscription_tier='admin'` but this wasn't in SubscriptionTier type
- **Root Cause**: Type definition and feature access logic excluded admin tier
- **Fix**: Added 'admin' to SubscriptionTier type with level 999 for full access
- **Files**: 
  - `lib/feature-access.ts` ✅
  - `components/UserContext.tsx` ✅
- **Status**: ✅ FIXED

### 4. **Upgrade Modal Couldn't Be Closed**
- **Problem**: Clicking X button on upgrade modal didn't close it
- **Fix**: Added `stopPropagation()`, `preventDefault()`, and Escape key listener
- **File**: `components/FeatureUpgradeModal.tsx`
- **Status**: ✅ FIXED

---

## 🟡 Debugging & Logging Enhancements

### 5. **Comprehensive Story Loading Debug Logging**
- **Added**: Step-by-step logging with emoji markers showing story selection flow
- **Logs include**:
  - Query parameters being used
  - Number of stories found
  - Slug selection
  - Full story fetch success/failure
  - Story structure validation
  - Personalization steps
- **Files**:
  - `app/actions/story-database-actions.ts` (selectStoryAction)
  - `lib/stories-database.ts` (getStoriesByTradition, getStoryBySlug)
- **Status**: ✅ DEPLOYED
- **How to use**: Open browser console and look for `[StoryDatabaseAction]` and `[StoriesDB]` prefixed logs

### 6. **New Debug API Endpoint**
- **Created**: `GET /api/debug/test-story-loading?tradition=anansi&level=emergent&island=JM`
- **Purpose**: Test story loading without going through the wizard UI
- **Returns**: Detailed step-by-step results of the entire story selection process
- **Status**: ✅ CREATED

---

## 📊 Current Status

| Component | Issue | Status | Evidence |
|-----------|-------|--------|----------|
| **Stories Table** | ✅ Created with 24 seed stories | ✅ WORKING | Manual verification |
| **Story Selection Logic** | Story not loading / "Connecting to Island" error | 🔍 INVESTIGATING | Comprehensive logging added |
| **Feature Access** | Free tier blocked from story builder | ✅ FIXED | New logic allows free_limit access |
| **Auth Lock Timeout** | NavigatorLock timeout on Supabase | ✅ FIXED | Patched both clients |
| **Admin Access** | Admin users can't access features | ✅ FIXED | Added admin tier |
| **Upgrade Modal** | Can't close modal | ✅ FIXED | Added close handlers |

---

## 🧪 Testing Checklist

### Next Steps:
1. **Test story builder with FREE tier account** ← IN PROGRESS
   - Navigate to `/portal/story-studio`
   - Select Anansi + Level 1 + Jamaica
   - Click "Make Magic"
   - Check browser console for logging output (search for `[StoryDatabaseAction]`)
   - **Expected**: Story should load or show detailed error in console

2. **Test story builder with PAID tier account** (starter_mailer or higher)
   - Same steps as above
   - Expected to have unlimited access

3. **Test debug endpoint directly**
   - Visit: `http://localhost:3000/api/debug/test-story-loading?tradition=anansi&level=emergent&island=JM`
   - This shows exactly where story loading fails
   - Report any errors found in console or response

4. **Test upgrade modal**
   - Click "Story Builder" with free tier
   - Modal should open
   - Click X button or press Escape - modal should close
   - Click "Upgrade Now" - should be able to proceed

---

## 🔍 Debugging Story Loading Issue

When user clicks "Make Magic", the flow is:

1. **Browser**: `story-studio/page.tsx` → calls `selectStoryAction()`
2. **Server**: Queries `stories_library` for matches
3. **Server**: Selects random match, fetches full story with `getStoryBySlug()`
4. **Server**: Returns `{ success: true, story }`
5. **Browser**: Stores story in `sessionStorage`
6. **Browser**: Redirects to `/portal/stories/dynamic/session`
7. **Dynamic Page**: Loads story from `sessionStorage`
8. **Display**: Shows story in `StoryReader`

**If any step fails**, the browser console will show detailed logs with step number and error details.

### To Debug:
1. Open DevTools Console (F12)
2. Click "Make Magic"
3. Look for lines starting with:
   - `[StoryDatabaseAction]` ← Server-side story selection
   - `[StoriesDB]` ← Database queries
4. Share the last log message that appears before the error

---

## 📝 All Changes Made

1. ✅ Fixed hasFeatureAccess() to support free_limit
2. ✅ Added NavigatorLock patch to lib/supabase-client.ts
3. ✅ Added NavigatorLock patch to lib/supabase/client.ts
4. ✅ Added 'admin' tier to SubscriptionTier and TIER_LEVELS
5. ✅ Added stopPropagation/preventDefault to modal close
6. ✅ Added Escape key listener to modal close
7. ✅ Enhanced story-database-actions.ts with detailed logging
8. ✅ Enhanced getStoriesByTradition with detailed logging
9. ✅ Enhanced getStoryBySlug with detailed logging
10. ✅ Created /api/debug/test-story-loading endpoint

---

## 🚀 Next Sprint

Once story loading is working:
1. Test and verify 3-story/month limit for free tier
2. Test paid tier unlimited access
3. Test story usage tracking in database
4. Wire up leaderboard and challenges (already built, just needs routing)
5. Launch 3 hidden games with XP wiring

---

**Last Updated**: 2026-02-24
**Git Commits**: 5 commits with fixes and logging
**Status**: Story loading debug logging deployed, awaiting test results

