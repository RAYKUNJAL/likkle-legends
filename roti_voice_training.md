# 🤖 R.O.T.I. Voice Training Specification v2.0.0

## Overview

R.O.T.I. (Robotic Operational Teaching Interface) is the Island Learning Buddy for Likkle Legends. This document specifies how to configure R.O.T.I.'s voice to sound more **human-like** and includes a **kid voice mode** for enhanced engagement.

---

## 🎙️ Voice Engine Configuration

### Primary TTS Provider
- **Provider**: Google Gemini TTS (gemini-2.5-flash-preview-tts)
- **Fallback**: Browser Web Speech API

### Voice Modes

| Mode | Voice | Description | Best For |
|------|-------|-------------|----------|
| **Default** | Leda | Warm, articulate female educator | General learning & teaching |
| **Kid** | Fenrir | Bright, youthful, high-energy | Making learning feel like fun with a friend |
| **Playful** | Puck | Upbeat and mischievous | Games and quizzes |
| **Calm** | Aoede | Gentle and soothing | Anxious learners, bedtime stories |

---

## 🎯 Voice Direction Prompts

### Default Mode (Leda)
```
[Voice Direction: Friendly, clear, patient educator speaking to young children. 
Warm but slightly technological undertones like a kind AI friend.
Tone: Encouraging and patient.
Speaking to a child aged 6-9.
Pace: Slightly slower for clarity.
Personality: Friendly Caribbean robot who loves helping kids learn!]
```

### Kid Mode (Fenrir)
```
[Voice Direction: Excited young voice, enthusiastic and eager, 
like a smart kid friend who loves learning. 
Slightly faster, full of wonder.
Tone: Excited and curious.
Speaking to a child aged 6-9.
Pace: Energetic and dynamic.
Personality: Friendly Caribbean robot who loves helping kids learn!]
```

### Playful Mode (Puck)
```
[Voice Direction: Playful and upbeat, with slight robotic charm. 
Think friendly helper who loves making learning fun.
Tone: Cheerful and fun.
Speaking to a child aged 6-9.
Pace: Natural conversational.
Personality: Friendly Caribbean robot who loves helping kids learn!]
```

### Calm Mode (Aoede)
```
[Voice Direction: Calm, warm, and reassuring. 
Gentle voice for children who need extra patience and comfort.
Tone: Calm and reassuring.
Speaking to a child aged 6-9.
Pace: Slightly slower for clarity.
Personality: Friendly Caribbean robot who loves helping kids learn!]
```

---

## 📁 File Locations

| File | Purpose |
|------|---------|
| `lib/roti-voice.ts` | Core voice engine with TTS generation |
| `lib/rotiConfig.ts` | R.O.T.I. personality & technical config |
| `components/ROTIChat.tsx` | Chat UI with voice mode selector |
| `app/api/roti-voice/route.ts` | API endpoint for voice generation |
| `app/actions/roti-voice.ts` | Server action wrapper |

---

## 🔧 API Usage

### POST `/api/roti-voice`

Request:
```json
{
  "text": "Beep boop! Great question, little legend!",
  "voiceMode": "kid"  // "default" | "kid" | "playful" | "calm"
}
```

Response:
```json
{
  "success": true,
  "audio": "data:audio/wav;base64,..."
}
```

---

## 🚀 Implementation Checklist

- [x] Created `lib/roti-voice.ts` with Gemini TTS integration
- [x] Added 4 voice modes: default, kid, playful, calm
- [x] Updated `components/ROTIChat.tsx` with voice mode selector
- [x] Created `/api/roti-voice` endpoint
- [x] Updated `lib/rotiConfig.ts` with new voice settings
- [x] Added voice direction prompts for natural speech

---

## 🧪 Testing Voice Modes

To test different voice modes:

1. Open the R.O.T.I. chat on the landing page
2. Click the voice button (🎓 or current mode emoji)
3. Select a voice mode from the dropdown
4. Send a message or click "Read Aloud" on any bot message
5. Listen to the voice output

### Expected Results

| Mode | Expected Sound |
|------|----------------|
| Default | Clear, warm female voice like a patient teacher |
| Kid | Excited, youthful voice like an eager friend |
| Playful | Upbeat voice with fun energy |
| Calm | Gentle, soothing voice for comfort |

---

## 🔑 Required Environment Variables

```env
# At least one of these must be set for Gemini TTS:
GEMINI_API_KEY=your_api_key
# OR
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key
# OR  
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key (client-side fallback)
```

---

## 📝 Notes

- The kid voice mode (Fenrir) provides a more relatable experience for children
- Voice direction prompts help Gemini TTS produce more natural, expressive speech
- Browser TTS serves as a fallback when server-side TTS is unavailable
- Audio is returned as WAV format for broad browser compatibility
