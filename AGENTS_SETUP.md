# AI Agents Setup Guide

## Overview
Likkle Legends uses autonomous AI agents to generate educational content including stories, videos, printables, and songs. This guide explains how to configure and deploy these agents.

## Required Environment Variables

### Gemini API (Required for all agents)
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

OR

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

**Get your API key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key to your `.env.local` file

## Available Agents

### 1. Module Manager Agent
Orchestrates complete educational module generation

### 2. Story Generator
Creates engaging educational narratives

### 3. Video Script Generator  
Generates video scripts for visual storytelling

### 4. Printable Generator
Creates educational worksheets and activities

### 5. Song Generator
Generates educational songs

## Health Check Endpoint

Visit `/api/health/agents` to verify agent configuration.

## Production Deployment

1. Set `GEMINI_API_KEY` in Vercel Environment Variables
2. Monitor agent health at `/api/health/agents`
3. Check Google Cloud Console for API quotas

## Support

- **Gemini API Docs**: https://ai.google.dev/docs
- **Google AI Studio**: https://aistudio.google.com/

Last updated: 2026-04-09