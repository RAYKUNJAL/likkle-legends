# Video Captions & Transcripts

This directory contains captions and transcripts for all video content in Likkle Legends. Captions are essential for accessibility, supporting deaf and hard of hearing users, non-native English speakers, and users in quiet or noisy environments.

## Current Caption Files

### Landing Page Videos

#### landing-promo-en.vtt
English captions for the promotional trailer shown on the landing page.
- **Duration**: ~59 seconds
- **Language**: English
- **Content**: Introduction to Likkle Legends, describing the service, age group (4-8), and benefits
- **Speaker**: Narrator (unseen)
- **Sound descriptions**: [Tropical island music], [Music increases], [Children laughing], [Music swells]

#### landing-promo-es.vtt
Spanish captions for the promotional trailer.
- **Duration**: ~59 seconds
- **Language**: Spanish
- **Content**: Spanish translation of promotional trailer content
- **Speaker**: Narrator (unseen)

### Video Component Captions

Video captions should be created for each video added to the system. Use the following naming convention:

#### For Lesson Videos (PremiumVideoPlayer)
```
lesson-{video-id}-en.vtt  (English)
lesson-{video-id}-es.vtt  (Spanish)
```

Example: `lesson-story-anansi-001-en.vtt`

#### For Radio/Music Videos (TantyRadio)
```
video-{track-id}-en.vtt   (English)
video-{track-id}-es.vtt   (Spanish)
```

Example: `video-calypso-song-001-en.vtt`

## Caption Standards

All caption files must follow these guidelines:

### Format
- Use WebVTT format (.vtt extension)
- Start with `WEBVTT` header
- Include timestamps in format: `HH:MM:SS.mmm --> HH:MM:SS.mmm`

### Accuracy Requirements
- Timing must be accurate within 0.5 seconds
- Complete dialogue must be transcribed
- Sound descriptions in brackets: `[door slams]`, `[music playing]`
- Visual descriptions for important context
- Speaker identification when multiple speakers present

### Language-Specific Guidelines

#### English Captions
- Use clear, simple language (appropriate for ages 4-8)
- Include Caribbean dialect/accent terms with context
- Explain cultural references when needed

#### Spanish Captions
- Use Latin American Spanish unless otherwise specified
- Maintain cultural authenticity in translations
- Include relevant Caribbean Spanish terms

## Implementation in Components

### VideoPlayer Component
```tsx
<VideoPlayer 
  src="video.mp4"
  captionSrc="/captions/video-en.vtt"
  captionLabel="English"
/>
```

### Landing VideoHero Component
```tsx
<video controls>
  <track kind="captions" src="/captions/landing-promo-en.vtt" srcLang="en" label="English" default />
  <track kind="captions" src="/captions/landing-promo-es.vtt" srcLang="es" label="Español" />
</video>
```

### PremiumVideoPlayer Component
```tsx
<video>
  <track kind="captions" src="/captions/lesson-{id}-en.vtt" srcLang="en" label="English" default />
  <track kind="captions" src="/captions/lesson-{id}-es.vtt" srcLang="es" label="Español" />
</video>
```

### TantyRadio Component
```tsx
{isVideo && (
  <video>
    <track kind="captions" src={`/captions/video-${trackId}-en.vtt`} srcLang="en" label="English" />
    <track kind="captions" src={`/captions/video-${trackId}-es.vtt`} srcLang="es" label="Español" />
  </video>
)}
```

## Placeholder Captions

For videos that exist in the system but don't have actual captions yet, create placeholder VTT files:

```vtt
WEBVTT

00:00:00.000 --> 00:00:05.000
[Captions pending - content description will follow]

NOTE This video describes: [specific content/topic]
NOTE Language: English
NOTE Duration: [estimated length]
NOTE Status: Awaiting caption creation
```

## Creating New Captions

### Steps to Add Captions for New Video Content

1. Obtain or create the video file
2. Create a detailed transcript with:
   - Exact dialogue
   - Sound descriptions in brackets
   - Visual descriptions important for understanding
   - Any text shown in the video
3. Generate timing information (manually or with speech-to-text tools)
4. Create .vtt files for English and Spanish
5. Place files in `/public/captions/`
6. Update relevant component with `<track>` element
7. Test captions display correctly in all browsers

### Tools for Caption Creation

Recommended services for caption creation:
- **Rev.com**: Professional transcription and caption service
- **Descript**: AI-powered transcription with easy editing
- **YouTube's Auto-captioning**: Basic captions (review for accuracy)
- **Manual tools**: Subtitle Edit (open source), Aegisub

## Testing Captions

1. Open video in browser
2. Click CC button (closed caption toggle) in video player
3. Verify captions appear and sync with audio
4. Test on different browsers: Chrome, Firefox, Safari, Edge
5. Test on mobile devices
6. Verify Spanish captions display correctly
7. Check timing accuracy (±0.5 seconds)

## Accessibility Checklist

- [ ] English captions created and tested
- [ ] Spanish captions created and tested
- [ ] Timing verified for accuracy
- [ ] Sound descriptions included
- [ ] Speaker identification clear (if multiple speakers)
- [ ] `<track>` elements added to video component
- [ ] Default language set to English
- [ ] Alternative languages available
- [ ] Captions tested in multiple browsers
- [ ] Mobile playback verified

## Resources

- WebVTT Specification: https://www.w3.org/TR/webvtt1/
- WCAG Video Content Guidelines: https://www.w3.org/WAI/media/av/
- HTML5 Track Element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track
- Captioning Standards: https://www.3playmedia.com/learn/guide-to-captioning/

## Contact

For questions about caption standards or implementation:
- Check this README
- Refer to component files in `/components/`
- Review the main project CLAUDE.md for architecture details
