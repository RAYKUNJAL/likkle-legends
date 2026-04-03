# LandingPageV4 - Quick Integration Guide

## 30-Second Setup

### 1. Import the Component

```typescript
// In your page or layout file
import { LandingPageV4 } from "@/components/landing-v4";

export default function LandingPage() {
  return <LandingPageV4 />;
}
```

### 2. Update Navigation Paths

In `LandingPageV4.tsx`, update these lines to match your routes:

```typescript
// Line ~55: Hero CTA
window.location.href = "/play";  // Change to your game path

// Line ~127: "Learn More" button
document.querySelector("#how-it-works")?.scrollIntoView()  // Already smooth scroll

// Line ~188: Game preview play
window.location.href = "/play";  // Same path

// Line ~290: Try game buttons
window.location.href = "/play";  // Same path

// Line ~340: Pricing CTAs
window.location.href = `/signup?plan=${tier.toLowerCase()}`;  // Change to your signup

// Line ~756: Final CTA
window.location.href = "/play";  // Same path
```

### 3. Verify Analytics Integration

Ensure these exports exist in `lib/analytics.ts`:

```typescript
// lib/analytics.ts
export const trackEvent = (eventName: string, params?: Record<string, any>) => { /* ... */ }
export const fireConversionEvent = (eventName: string, params?: Record<string, unknown>) => { /* ... */ }
export function useScrollTracking() { /* ... */ }
```

All three should already exist in your project. No changes needed.

### 4. Check ExitIntentModal Exists

The component imports `ExitIntentModal` dynamically:

```typescript
const ExitIntentModal = dynamic(
  () => import("@/components/ExitIntentModal"),
  { ssr: false }
);
```

**If this file doesn't exist:**
- Option A: Create a simple modal component
- Option B: Comment out the line: `{/* <ExitIntentModal /> */}`

### 5. Test the Page

```bash
npm run dev
# Visit http://localhost:3000/your-path
```

---

## What Gets Tracked (Analytics)

When users visit the landing page, these events are automatically tracked:

| When | Event | Data Sent |
|------|-------|-----------|
| Page loads | `landing_page_view` | version: "v4", timestamp |
| Scroll to 25% | `scroll_depth_25` | (none) |
| Scroll to 50% | `scroll_depth_50` | (none) |
| Scroll to 75% | `scroll_depth_75` | (none) |
| Scroll to 90% | `scroll_depth_90` | (none) |
| Click "Play Free Game" | `cta_click_hero` | section: "hero", button: "play_free_game" |
| Click "Learn More" | `cta_click_hero` | section: "hero", button: "learn_more" |
| Click game preview | `game_preview_play` | section: "game_preview" |
| Change testimonial | `testimonial_view` | index, name |
| Click "Try Free" (game) | `try_game_click` | game, ageRange |
| Click pricing CTA | `pricing_cta_click` | tier |
| Toggle FAQ | `faq_toggle` | question, open |
| Click "Start Free" (final) | `cta_click_final` | section: "final_cta" |

---

## Customization Examples

### Change Hero Headline

```typescript
// Find HeroSection component, around line 80
<h1 className="...">
  Your NEW headline here
  <br />
  <span className="...">Your gradient text here</span>
</h1>
```

### Change Game Names

Find `AgeBasedGameSection` (around line 520):

```typescript
const ageGroups = [
  {
    ageRange: "3-5 years",
    game: "NEW GAME NAME",  // Change this
    skills: ["Skill 1", "Skill 2"],
    time: "5-10 min",
    image: "🎮",  // Can change emoji
  },
  // ... more groups
];
```

### Change Testimonials

Find `SocialProofSection` (around line 230):

```typescript
const testimonials = [
  {
    name: "Parent Name",
    avatar: "https://your-image.jpg",
    rating: 5,
    quote: "Your testimonial text here",
  },
  // Add more testimonials
];
```

### Change Pricing Tiers

Find `PricingSection` (around line 700):

```typescript
const tiers = [
  {
    name: "FREE FOREVER",
    price: "$0",  // Change price
    priceNote: "",
    features: [
      "Feature 1",
      "Feature 2",
      "Feature 3",
    ],
    cta: "Start Free",
    highlight: false,
  },
  // ... more tiers
];
```

### Change FAQ Questions

Find `FAQSection` (around line 850):

```typescript
const faqs = [
  {
    question: "Your new question?",
    answer: "Your answer here with as much detail as needed.",
  },
  // ... more FAQs
];
```

---

## Testing Checklist

Before deploying to production:

### Functionality
- [ ] All buttons navigate to correct pages (check console for 404s)
- [ ] Testimonial carousel works (click the dots)
- [ ] FAQ accordion expands/collapses smoothly
- [ ] All CTAs have clear hover states

### Analytics
- [ ] Open DevTools → Network tab
- [ ] Look for `gtag`, `fbq`, `ttq` requests when clicking CTAs
- [ ] Check console for any "Analytics blocked" warnings
- [ ] Verify scroll depth events fire as user scrolls

### Mobile
- [ ] View on iPhone 12/13 (375px width)
- [ ] All text is readable without zooming
- [ ] Buttons are large enough (44px minimum)
- [ ] Touch targets don't overlap

### Desktop
- [ ] View on 1920x1080 monitor
- [ ] Pricing cards show 3-column layout
- [ ] Featured pricing tier is visually distinct (105% scale)
- [ ] No text overflow on any section

### Performance
- [ ] Lighthouse score > 90
- [ ] Page loads in < 3 seconds on 4G
- [ ] No console errors or warnings

---

## Common Customizations

### Add Your Logo to Hero

```typescript
// In HeroSection, before the h1
<div className="mb-4">
  <img src="/logo.svg" alt="Logo" className="h-12 w-auto" />
</div>
```

### Change Primary Color (Cyan to Your Brand)

Replace all `cyan-` Tailwind classes with your brand color:
- `cyan-600` → `blue-600` (or your primary)
- `emerald-600` → `green-600` (or your secondary)

### Add Background Video to Hero

```typescript
// In HeroSection, replace SVG background with video
<video 
  autoPlay 
  muted 
  loop 
  className="absolute inset-0 w-full h-full object-cover opacity-20"
>
  <source src="/hero-bg.mp4" type="video/mp4" />
</video>
```

### Make Countdown Timer Real

Replace the static countdown badge:

```typescript
// Instead of this static badge
<span className="text-sm font-bold">Limited time: 7-day free trial</span>

// Use the existing CountdownTimer component
import CountdownTimer from "@/components/CountdownTimer";
<CountdownTimer endDate="2026-04-15" />
```

---

## Troubleshooting

### Issue: Page is blank after deploying

**Solution:** Check browser console for errors. Most common:
1. Missing `ExitIntentModal` component → Comment it out
2. Navigation paths wrong → Check line 55, 127, 340, 756
3. Analytics script blocked → Check that `lib/analytics.ts` exists

### Issue: Styles look broken (no colors, weird layout)

**Solution:** Ensure Tailwind CSS is configured:
1. Check `tailwind.config.js` includes `/components/**/*.{tsx,ts}`
2. Rebuild: `npm run build`
3. Clear cache: `.next/` folder

### Issue: Analytics not showing up in GA4/Meta

**Solution:**
1. Check that tracking scripts (gtag, fbq) are installed in `_document.tsx`
2. Verify `lib/analytics.ts` has the correct event names
3. Check browser DevTools → Network to see if events are sent

### Issue: Mobile layout is broken (buttons overlapping, text cut off)

**Solution:**
1. Check responsive classes (sm:, md:, lg: prefixes)
2. Verify container max-width doesn't overflow on mobile
3. Check `px-4 sm:px-6` padding classes

---

## File Structure

```
components/
  landing-v4/
    LandingPageV4.tsx          ← Main component (1,065 lines)
    index.ts                   ← Export
    LANDING_V4_README.md       ← Full documentation
    INTEGRATION_GUIDE.md       ← This file
```

---

## Next Steps

1. **Copy the component** to your project
2. **Update navigation paths** to match your app
3. **Test locally** with `npm run dev`
4. **Deploy and monitor** analytics in GA4/Meta Pixel
5. **A/B test variants** using `data-test-variant` attributes

---

## Questions?

Refer to `LANDING_V4_README.md` for:
- Full component documentation
- Analytics event reference
- Customization guide
- Accessibility notes
- Performance optimizations

---

## Version Info

- **Component Version:** v4
- **Created:** April 2026
- **Status:** Production Ready
- **Last Updated:** April 2026

---

## Quick Links

- Main Component: `./LandingPageV4.tsx`
- Full Docs: `./LANDING_V4_README.md`
- Analytics Guide: See `LANDING_V4_README.md` → "Analytics Integration"
- Accessibility: See `LANDING_V4_README.md` → "Accessibility (WCAG 2.1 AA)"
