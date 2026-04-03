/**
 * Guest Game Session Manager
 * Handles session data for non-authenticated users playing games
 * Stores in localStorage and tracks conversion events
 */

import { trackEvent } from './analytics';

export interface GameSession {
  id: string;
  gameId: string;
  startTime: number;
  lastActivityTime: number;
  level: number;
  score: number;
  totalPlayTime: number; // milliseconds
  isConverted: boolean;
  conversionMethod?: 'cta' | 'paywall' | 'manual';
  gameState?: Record<string, any>;
}

const GUEST_SESSION_KEY = 'likkle_guest_session';
const GUEST_SESSIONS_KEY = 'likkle_guest_sessions_history';
const CONVERSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a unique guest session ID
 */
function generateSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Initialize a new game session for a guest
 */
export function initializeGuestSession(gameId: string): GameSession {
  const session: GameSession = {
    id: generateSessionId(),
    gameId,
    startTime: Date.now(),
    lastActivityTime: Date.now(),
    level: 1,
    score: 0,
    totalPlayTime: 0,
    isConverted: false,
    gameState: {},
  };

  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  }

  // Track game started event
  trackEvent('game_started', {
    user_type: 'guest',
    game_id: gameId,
    session_id: session.id,
  });

  return session;
}

/**
 * Get current guest session (or create one if not exists)
 */
export function getGuestSession(gameId?: string): GameSession | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(GUEST_SESSION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  if (gameId) {
    return initializeGuestSession(gameId);
  }

  return null;
}

/**
 * Update session level and score
 */
export function updateGuestSession(
  sessionId: string,
  updates: Partial<Omit<GameSession, 'id' | 'gameId' | 'startTime'>>
): GameSession | null {
  if (typeof window === 'undefined') return null;

  const session = getGuestSession();
  if (!session || session.id !== sessionId) return null;

  const updated: GameSession = {
    ...session,
    ...updates,
    lastActivityTime: Date.now(),
  };

  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(updated));

  // Track level completion
  if (updates.level && updates.level > session.level) {
    trackEvent('game_level_completed', {
      game_id: session.gameId,
      session_id: sessionId,
      level: updates.level,
    });
  }

  // Track score changes
  if (updates.score !== undefined && updates.score > session.score) {
    trackEvent('game_score', {
      game_id: session.gameId,
      session_id: sessionId,
      score: updates.score,
      points_earned: updates.score - session.score,
    });
  }

  return updated;
}

/**
 * Get session duration in minutes
 */
export function getSessionDuration(session: GameSession): number {
  const elapsed = Math.max(
    Date.now() - session.startTime,
    session.totalPlayTime
  );
  return Math.floor(elapsed / 1000 / 60); // Convert to minutes
}

/**
 * Check if conversion prompt should be shown
 * Shows after 5 minutes or when level > 1
 */
export function shouldShowConversionPrompt(session: GameSession): boolean {
  if (session.isConverted) return false;

  const durationMinutes = getSessionDuration(session);
  const hasPlayedLevel = session.level > 1;

  return durationMinutes >= 5 || hasPlayedLevel;
}

/**
 * Mark session as converted (user signed up/subscribed)
 */
export function markSessionConverted(
  sessionId: string,
  method: 'cta' | 'paywall' | 'manual' = 'cta'
): GameSession | null {
  if (typeof window === 'undefined') return null;

  const session = getGuestSession();
  if (!session || session.id !== sessionId) return null;

  const updated = {
    ...session,
    isConverted: true,
    conversionMethod: method,
  };

  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(updated));

  // Track conversion
  trackEvent('guest_converted', {
    game_id: session.gameId,
    session_id: sessionId,
    duration_minutes: getSessionDuration(session),
    final_level: session.level,
    final_score: session.score,
    conversion_method: method,
  });

  // Add to history
  addSessionToHistory(updated);

  return updated;
}

/**
 * End guest session and track quit event
 */
export function endGuestSession(sessionId: string): void {
  if (typeof window === 'undefined') return;

  const session = getGuestSession();
  if (!session || session.id !== sessionId) return;

  const duration = getSessionDuration(session);

  trackEvent('game_quit', {
    game_id: session.gameId,
    session_id: sessionId,
    time_played_minutes: duration,
    final_level: session.level,
    final_score: session.score,
    converted: session.isConverted,
  });

  // Clear session
  localStorage.removeItem(GUEST_SESSION_KEY);

  // Add to history
  addSessionToHistory(session);
}

/**
 * Add session to history for analytics
 */
function addSessionToHistory(session: GameSession): void {
  if (typeof window === 'undefined') return;

  try {
    const history = localStorage.getItem(GUEST_SESSIONS_KEY);
    const sessions: GameSession[] = history ? JSON.parse(history) : [];

    sessions.push(session);

    // Keep only last 50 sessions
    if (sessions.length > 50) {
      sessions.shift();
    }

    localStorage.setItem(GUEST_SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // Silently fail if storage is full
  }
}

/**
 * Get session history
 */
export function getSessionHistory(): GameSession[] {
  if (typeof window === 'undefined') return [];

  try {
    const history = localStorage.getItem(GUEST_SESSIONS_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

/**
 * Clear all guest sessions (for testing or privacy)
 */
export function clearGuestSessions(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(GUEST_SESSION_KEY);
  localStorage.removeItem(GUEST_SESSIONS_KEY);
}

/**
 * Get session summary for conversion CTA
 */
export function getSessionSummary(session: GameSession): {
  duration: number;
  level: number;
  score: number;
  achievements: string[];
} {
  const achievements: string[] = [];

  if (session.level >= 3) achievements.push('Level 3 Master');
  if (session.score >= 500) achievements.push('Score Milestone');
  if (getSessionDuration(session) >= 10) achievements.push('Dedicated Player');

  return {
    duration: getSessionDuration(session),
    level: session.level,
    score: session.score,
    achievements,
  };
}
