# Captions & Transcripts Accessibility Implementation Guide

## Overview

This document outlines the complete implementation of captions and transcripts for all video content in Likkle Legends. This work ensures compliance with accessibility standards (WCAG 2.1, ADA) and provides equal access to educational content for:

- Deaf and hard of hearing users
- Non-native English speakers
- Users in quiet or noisy environments
- Users with audio processing difficulties

## What Was Implemented

### 1. Component Updates

#### VideoPlayer.tsx
- Added `captionSrc` prop for caption file path
- Added `captionLabel` prop for language label
- Integrated HTML5 `<track>` element for captions
- Maintains backward compatibility (captions optional)

**Usage:**
```tsx
<VideoPlayer 
  src="video.mp4"
  captionSrc="/captions/video-en.vtt"
  captionLabel="English"
/>
```

#### VideoHero.tsx (Landing Page)
- Added dual-language captions for promotional trailer
- English (default) and Spanish options
- Placed in modal video player

**Captions Available:**
- `/public/captions/landing-promo-en.vtt` (English)
- `/public/captions/landing-promo-es.vtt` (Spanish)

#### PremiumVideoPlayer.tsx
- Added caption support for HTML5 videos
- YouTube videos have captions via YouTube's native system
- Dual-language support (English default, Spanish alternative)

**Implementation Pattern:**
```tsx
<video>
  <track kind="captions" src={`/captions/lesson-${video.id}-en.vtt`} srcLang="en" label="English" default />
  <track kind="captions" src={`/captions/lesson-${video.id}-es.vtt`} srcLang="es" label="Español" />
</video>
```

#### TantyRadio.tsx
- Added caption support for video content in radio player
- Dynamically references caption files based on track ID
- Supports both English and Spanish

**Implementation:**
```tsx
<video>
  <track kind="captions" src={`/captions/video-${trackId}-en.vtt`} srcLang="en" label="English" />
  <track kind="captions" src={`/captions/video-${trackId}-es.vtt`} srcLang="es" label="Español" />
</video>
```

### 2. Caption Files Created

#### Landing Page Videos
- `landing-promo-en.vtt` - English captions for promotional trailer
- `landing-promo-es.vtt` - Spanish captions for promotional trailer

#### Educational Videos (Placeholders with Instructions)
- `lesson-vc-coral-reef-en.vtt` & `-es.vtt`
- `lesson-vc-animals-en.vtt` & `-es.vtt`
- `lesson-vc-oceans-en.vtt` & `-es.vtt`
- `lesson-vc-fruits-veggies-en.vtt` & `-es.vtt`
- `lesson-vc-ackee-walk-en.vtt` & `-es.vtt`
- `lesson-vc-amazing-animals-en.vtt` & `-es.vtt`

All placeholders include:
- Video metadata and duration
- Content overview
- Instructions for caption creation
- Sound descriptions guideline

### 3. Documentation Created

#### `/public/captions/README.md`
Comprehensive guide covering:
- Current caption status
- Naming conventions for new videos
- Caption standards and requirements
- Implementation examples for each component
- Tools and services for caption creation
- Testing procedures
- Accessibility checklist

#### `/public/transcripts/VIDEO_TRANSCRIPTS.md`
Detailed transcript documentation including:
- Complete transcript for landing promo (English & Spanish)
- Content overview for each educational video
- Sound descriptions and accessibility notes
- Transcript creation status tracker
- How-to guide for creating transcripts
- Web accessibility standards compliance info

#### `/ACCESSIBILITY_CAPTIONS_GUIDE.md` (This File)
Implementation guide with:
- Component changes overview
- File structure and naming
- Workflow for adding new videos
- Testing procedures
- Standards compliance information

## File Structure

```
likkle-legends/
├── public/
│   ├── captions/
│   │   ├── README.md                          ← Caption guidelines
│   │   ├── landing-promo-en.vtt               ← Promotional video captions
│   │   ├── landing-promo-es.vtt
│   │   ├── lesson-vc-coral-reef-en.vtt        ← Placeholder captions (awaiting transcripts)
│   │   ├── lesson-vc-coral-reef-es.vtt
│   │   ├── lesson-vc-animals-en.vtt
│   │   ├── lesson-vc-animals-es.vtt
│   │   ├── lesson-vc-oceans-en.vtt
│   │   ├── lesson-vc-oceans-es.vtt
│   │   ├── lesson-vc-fruits-veggies-en.vtt
│   │   ├── lesson-vc-fruits-veggies-es.vtt
│   │   ├── lesson-vc-ackee-walk-en.vtt
│   │   ├── lesson-vc-ackee-walk-es.vtt
│   │   ├── lesson-vc-amazing-animals-en.vtt
│   │   └── lesson-vc-amazing-animals-es.vtt
│   └── transcripts/
│       └── VIDEO_TRANSCRIPTS.md               ← Transcript documentation
├── components/
│   ├── VideoPlayer.tsx                        ← Updated: caption props added
│   ├── PremiumVideoPlayer.tsx                 ← Updated: caption tracks added
│   ├── TantyRadio.tsx                         ← Updated: dynamic caption support
│   └── landing/
│       └── VideoHero.tsx                      ← Updated: caption tracks added
└── ACCESSIBILITY_CAPTIONS_GUIDE.md            ← This file
```

## Workflow for Adding New Videos

### When Adding a Video to the Portal

1. **Identify Video Source**
   - Get video URL
   - Determine video ID (use descriptive identifier)
   - Note duration and age group

2. **Create Caption Files**
   - Obtain transcript (auto-captions from YouTube or professional service)
   - Create English .vtt file: `/public/captions/lesson-{video-id}-en.vtt`
   - Create Spanish .vtt file: `/public/captions/lesson-{video-id}-es.vtt`
   - Test timing accuracy (±0.5 seconds)

3. **Update Component Code**
   
   For VideoPlayer component:
   ```tsx
   <VideoPlayer
     src={videoUrl}
     captionSrc="/captions/lesson-new-video-en.vtt"
     captionLabel="English"
   />
   ```

   For PremiumVideoPlayer (edit the component):
   ```tsx
   {video.id && (
     <>
       <track kind="captions" src={`/captions/lesson-${video.id}-en.vtt`} srcLang="en" label="English" default />
       <track kind="captions" src={`/captions/lesson-${video.id}-es.vtt`} srcLang="es" label="Español" />
     </>
   )}
   ```

4. **Update Documentation**
   - Add video to `/public/transcripts/VIDEO_TRANSCRIPTS.md`
   - Update caption status in README tables
   - Include transcript content

5. **Test**
   - Play video in browser
   - Toggle CC (closed captions)
   - Verify timing and accuracy
   - Test on mobile devices
   - Test with assistive technology if possible

6. **Commit Changes**
   - Include all caption files
   - Include component updates
   - Include documentation updates
   - Commit message: `feat: add captions for {video-title}`

## Naming Conventions

### For Lesson Videos
```
lesson-{video-id}-{language}.vtt
```
Examples:
- `lesson-vc-coral-reef-en.vtt`
- `lesson-story-anansi-001-es.vtt`

### For Music/Radio Videos
```
video-{track-id}-{language}.vtt
```
Examples:
- `video-calypso-song-001-en.vtt`
- `video-steelpan-music-es.vtt`

### For Special Content
```
{content-type}-{descriptive-name}-{language}.vtt
```
Examples:
- `game-island-trivia-en.vtt`
- `mission-caribbean-explorer-es.vtt`

## VTT File Format

All caption files use WebVTT format:

```vtt
WEBVTT

00:00:00.000 --> 00:00:03.000
First caption text

00:00:03.500 --> 00:00:07.000
[Sound effect in brackets]
Second caption with speaker or description

00:00:07.000 --> 00:00:10.000
Third caption
```

### Best Practices

- **Timing**: Accurate to ±0.5 seconds
- **Line Length**: 42-45 characters per line maximum
- **Duration**: 2-7 seconds per caption
- **Sound Descriptions**: Use brackets: `[music plays]`, `[children laugh]`
- **Speaker ID**: `SPEAKER: dialogue` for multiple speakers
- **Text on Screen**: `[Text: "Caribbean Islands"]`
- **Descriptions**: Keep simple and clear for ages 4-8

## Testing Procedures

### Browser Testing
1. Chrome/Edge (Chromium)
2. Firefox
3. Safari (iOS and macOS)
4. Mobile browsers

### Caption Verification
```
✓ Captions visible when CC button clicked
✓ Captions sync with audio (±0.5 seconds)
✓ Both language options available
✓ Text readable and legible
✓ Sound descriptions clear
✓ Speaker identification clear
```

### Accessibility Testing
- Test with screen reader (VoiceOver, NVDA)
- Test with closed caption-only (no audio)
- Test with audio-only (no visuals)
- Verify transcript is accessible via link

## Standards Compliance

### WCAG 2.1 Level AA
- **1.2.2 Captions (Prerecorded)**: Videos must include captions
- **1.2.3 Audio Description or Media Alternative**: Transcripts provide alternative
- **1.2.5 Audio Description (Prerecorded)**: Captions supplement audio

### ADA (Americans with Disabilities Act)
- All educational videos must include captions
- Captions must be accurate and synchronized
- Alternative text format (transcripts) must be available

### COPPA (Children's Online Privacy Protection)
- Safe, appropriate content for children 4-8
- No inappropriate audio/language
- Clear, child-friendly captions

### UK Equality Act 2010
- Equal access to video content
- Captions required for accessibility
- Reasonable adjustments provided

## Current Status

### Completed
- ✅ VideoPlayer component updated with caption support
- ✅ VideoHero component updated with landing promo captions
- ✅ PremiumVideoPlayer component updated with caption support
- ✅ TantyRadio component updated with dynamic captions
- ✅ Landing promo captions created (English & Spanish)
- ✅ Documentation framework created
- ✅ Placeholder captions for all videos
- ✅ Transcript documentation created

### Next Steps (Priority Order)

1. **Immediate**
   - [ ] Review placeholder captions for accuracy
   - [ ] Confirm video IDs match actual content

2. **Short-term (1-2 weeks)**
   - [ ] Create professional transcripts for all 6 educational videos
   - [ ] Generate captions from transcripts
   - [ ] Test all captions in browser

3. **Medium-term (1 month)**
   - [ ] Create captions for any new videos added to the system
   - [ ] Add audio descriptions for complex visual content
   - [ ] Create summary transcripts for accessibility pages

4. **Ongoing**
   - [ ] Maintain captions with video content updates
   - [ ] Monitor accessibility standards updates
   - [ ] Gather user feedback on caption quality

## Recommended Services

### Professional Transcription
- **Rev.com**: $1.50/minute, 24-hour turnaround, high accuracy
- **Descript**: AI-assisted, editor-friendly, $12-25/month
- **3PlayMedia**: Enterprise solution, 99%+ accuracy

### Free/Low-Cost Options
- **YouTube Auto-captions**: Free but less accurate
- **Google Cloud Speech-to-Text**: Pay-per-use, APIs available
- **Subtitle Edit**: Free open-source caption editor

## Maintenance

### Monthly
- Check that all captions still display correctly
- Verify no broken caption file links
- Monitor for accessibility complaints

### Quarterly
- Review caption accuracy and timing
- Update documentation as needed
- Check WCAG standard updates

### Annually
- Full accessibility audit
- User testing with assistive technology
- Standards compliance review

## Contact & Support

For questions about implementation:
1. Review `/public/captions/README.md` first
2. Check `/public/transcripts/VIDEO_TRANSCRIPTS.md`
3. Review component code in `components/`
4. Consult project CLAUDE.md for architecture details

For accessibility concerns:
- Test with automated tools (axe, WAVE)
- Use assistive technology for manual testing
- Gather feedback from users with disabilities

## Resources

- [WebVTT Standard](https://www.w3.org/TR/webvtt1/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Caption Standards](https://www.3playmedia.com/learn/guide-to-captioning/)
- [HTML5 Track Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track)
- [Descript Transcription](https://www.descript.com/)
- [Rev Transcription Service](https://www.rev.com/)
