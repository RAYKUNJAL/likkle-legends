# 🧪 Likkle Legends - Complete Testing Guide

## Overview
This guide covers testing the complete story system with database-driven content, subscription access control, and upgrade modals.

---

## ✅ What Was Built

### 1. **Database-Driven Stories (24 templates)**
- 4 traditions: Anansi, Papa Bois, River Mumma, Chickcharney
- 3 reading levels: Emergent, Early, Transitional
- 16 Caribbean islands: Jamaica, Trinidad, Barbados, Bahamas, etc.
- Fast retrieval: <500ms (vs 6-8s with Gemini)

### 2. **Subscription Access Control**
- **Free Tier**: 3 stories/month limit
- **Mini Legend ($4.99/mo)**: Unlimited stories
- **Legends Plus ($9.99/mo)**: Unlimited + AI generation
- **Family Legacy ($14.99/mo)**: Full features + admin

### 3. **Story Format Transformation**
- Simple DB storage (lightweight)
- Automatic conversion to full StoryBook format
- Supports all reader requirements

---

## 📋 Pre-Test Checklist

### Database Migrations
- [ ] Run `supabase/manual_migration_v7_stories_library.sql`
- [ ] Run `supabase/manual_migration_v8_story_usage.sql`
- [ ] Seed stories with `supabase/seed_stories.sql`
- [ ] Verify: `SELECT COUNT(*) FROM stories_library;` → should show 24

### Dev Environment
- [ ] Dev server running: `npm run dev`
- [ ] Listening on: http://localhost:3000
- [ ] No build errors
- [ ] Browser cache disabled (DevTools → Network → Disable cache)

---

## 🧪 Test Cases

### TEST 1: Free Tier - Create First Story
**Objective**: Verify free tier users can create stories

**Setup**:
```sql
UPDATE profiles
SET subscription_tier = 'free'
WHERE email = 'your-email@gmail.com';

DELETE FROM story_usage
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com');
```

**Steps**:
1. Open: `http://localhost:3000/portal/story-studio?test=true`
2. Select: Anansi + Sprouts (Level 2) + Jamaica
3. Click: "Make Magic"
4. Time the load: ⏱️

**Expected Results**:
- ✅ No upgrade modal shown
- ✅ Loading animation appears
- ✅ Story loads in < 500ms
- ✅ Story displays with pages
- ✅ No console errors

**Pass/Fail**: ___

---

### TEST 2: Free Tier - Reach Limit (3 stories)
**Objective**: Verify limit enforcement after 3 stories

**Setup**:
```sql
INSERT INTO story_usage (user_id, child_id, date, count)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com'),
  (SELECT id FROM children LIMIT 1),
  CURRENT_DATE,
  3
);
```

**Steps**:
1. Refresh: `http://localhost:3000/portal/story-studio?test=true`
2. Observe modal appearance

**Expected Results**:
- ✅ Upgrade modal appears
- ✅ Shows: "You've used all 3 free stories"
- ✅ Displays Mini Legend plan info
- ✅ "Upgrade Now" button visible
- ✅ Click "Maybe Later" → redirects to /portal

**Pass/Fail**: ___

---

### TEST 3: Paid Tier - Unlimited Access
**Objective**: Verify paid users get unlimited stories

**Setup**:
```sql
UPDATE profiles
SET subscription_tier = 'starter_mailer'
WHERE email = 'your-email@gmail.com';

DELETE FROM story_usage
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com');
```

**Steps**:
1. Refresh: `http://localhost:3000/portal/story-studio?test=true`
2. Create 5 stories rapidly
3. Check story count in database

**Expected Results**:
- ✅ No upgrade modal shown
- ✅ Can create unlimited stories
- ✅ No limit errors
- ✅ All stories load successfully

**Pass/Fail**: ___

---

### TEST 4: Story Display Quality
**Objective**: Verify story renders correctly

**Steps**:
1. Create story (free or paid tier)
2. Verify story page shows:
   - [ ] Title displays correctly
   - [ ] All pages render
   - [ ] Text is readable
   - [ ] Navigation works (next/prev pages)
   - [ ] Close button returns to portal
   - [ ] No layout issues

**Pass/Fail**: ___

---

### TEST 5: All 16 Islands
**Objective**: Verify all Caribbean islands work

**Create stories for each**:
- [ ] Jamaica 🇯🇲
- [ ] Trinidad & Tobago 🇹🇹
- [ ] Barbados 🇧🇧
- [ ] Bahamas 🇧🇸
- [ ] Saint Lucia 🇱🇨
- [ ] Guyana 🇬🇾
- [ ] Grenada 🇬🇩
- [ ] St. Kitts & Nevis 🇰🇳
- [ ] St. Vincent 🇻🇨
- [ ] Antigua 🇦🇬
- [ ] Dominica 🇩🇲
- [ ] Puerto Rico 🇵🇷
- [ ] Cuba 🇨🇺
- [ ] Dominican Republic 🇩🇴
- [ ] Haiti 🇭🇹
- [ ] Suriname 🇸🇷

**Pass/Fail**: ___

---

### TEST 6: All 4 Traditions
**Objective**: Verify all folklore traditions work

**Create stories for each**:
- [ ] Anansi the Spider 🕷️
- [ ] Papa Bois 🌿
- [ ] River Mumma 🧜‍♀️
- [ ] Chickcharney 🦉

**Pass/Fail**: ___

---

### TEST 7: Upgrade Modal Flow
**Objective**: Test upgrade modal interactions

**Setup**: Free tier + reached limit

**Steps**:
1. Modal appears
2. Click "Upgrade to Mini Legend"
3. Verify URL: `/checkout?plan=starter_mailer`
4. Go back and click "Maybe Later"
5. Verify redirects to `/portal`

**Pass/Fail**: ___

---

### TEST 8: Performance Benchmark
**Objective**: Verify speed improvements

**Measure**:
- [ ] Database query time: < 100ms
- [ ] Story display time: < 500ms total
- [ ] No lag on story navigation
- [ ] Multiple tabs work smoothly

**Database Query Test** (in browser console):
```javascript
// Test direct query
const start = performance.now();
// Create a story
const end = performance.now();
console.log(`Query took ${end - start}ms`);
```

**Expected**: < 500ms total time

**Pass/Fail**: ___

---

### TEST 9: Error Handling
**Objective**: Verify graceful error handling

**Test Cases**:
- [ ] Invalid tradition selection
- [ ] Missing child data
- [ ] Network offline (DevTools → offline mode)
- [ ] Database connection error

**Expected**: Graceful error messages, no crashes

**Pass/Fail**: ___

---

### TEST 10: Console Logging
**Objective**: Verify no errors in console

**Steps**:
1. Open DevTools (F12)
2. Go to Console tab
3. Create 3 stories
4. Check for errors

**Expected**: No red error messages
**Warnings OK**: Yellow warnings are fine

**Pass/Fail**: ___

---

## 📊 Results Summary

### Overall Status
- [ ] All tests passed ✅
- [ ] Some tests failed ⚠️
- [ ] Ready for next phase 🚀

### Issues Found (if any)
1. Issue: _______________
   - Severity: High / Medium / Low
   - Resolution: _______________

2. Issue: _______________
   - Severity: High / Medium / Low
   - Resolution: _______________

### Performance Metrics
- Average story load time: ___ms
- Database query time: ___ms
- Fastest load: ___ms
- Slowest load: ___ms

### User Experience Rating
- [ ] Poor (0-40%)
- [ ] Fair (40-70%)
- [ ] Good (70-85%)
- [ ] Excellent (85-100%)

---

## 🐛 Troubleshooting

### Story Won't Load
```sql
-- Check migrations ran
SELECT * FROM information_schema.tables WHERE table_name = 'stories_library';
-- Should show stories_library table

-- Check story count
SELECT COUNT(*) FROM stories_library;
-- Should show 24
```

### Upgrade Modal Not Showing
```javascript
// In browser console:
hasFeatureAccess('free', 'story_builder')
// Should return: true
```

### Stories Loading Slowly
```sql
-- Check indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'stories_library';
-- Should show multiple indexes

-- Try restarting Postgres
-- Go to: Supabase → Settings → Database → Restart postgres
```

### Session Storage Empty
```javascript
// In browser console:
sessionStorage.getItem('current_story_draft')
// Should return JSON if story was created
```

---

## ✅ Sign-Off Checklist

After testing, confirm:
- [ ] All 10 test cases passed
- [ ] No critical errors
- [ ] Performance acceptable (< 500ms loads)
- [ ] All 16 islands working
- [ ] All 4 traditions working
- [ ] Upgrade modal functioning
- [ ] Free tier limit enforced
- [ ] Paid tier unlimited working
- [ ] Ready for production

---

## 📝 Notes

_Record any observations, improvements, or edge cases here:_

__________________________________________________________________

__________________________________________________________________

__________________________________________________________________

---

## 🎉 Next Steps After Testing

1. **Pass all tests**: Deploy to staging/production
2. **Fail tests**: Debug using troubleshooting guide above
3. **Integrate payments**: Wire PayPal/Stripe checkout
4. **Analytics**: Track which stories are popular
5. **Content**: Add 50+ more stories

---

**Last Updated**: 2026-02-24
**Version**: 1.0
**Status**: Ready for Testing
