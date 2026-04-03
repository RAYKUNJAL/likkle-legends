/**
 * Meta Pixel Testing & Debugging Utilities
 * Use these functions to verify pixel is working correctly
 */

import { getPixelID, isPixelLoaded } from './meta-pixel';

/**
 * Log a pixel event to console for debugging
 * Useful for testing without sending data to Meta
 */
export function logPixelEvent(eventName: string, eventData?: any): void {
  const timestamp = new Date().toISOString();
  const pixelID = getPixelID();

  console.group(`[Meta Pixel Event] ${eventName}`);
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Pixel ID: ${pixelID}`);
  console.log(`Event Name: ${eventName}`);
  if (eventData) {
    console.log(`Event Data:`, eventData);
  }
  console.log(`Pixel Loaded: ${isPixelLoaded()}`);
  console.groupEnd();
}

/**
 * Check if Meta Pixel script is loaded
 * Returns true if fbq is available and loaded
 */
export function checkPixelLoaded(): boolean {
  const loaded = isPixelLoaded();

  if (loaded) {
    console.log('[Meta Pixel] Pixel is loaded and ready');
  } else {
    console.warn('[Meta Pixel] Pixel is NOT loaded');
  }

  return loaded;
}

/**
 * Get the current pixel ID from environment variables
 * Used for verification and debugging
 */
export function getPixelIDForTesting(): string | null {
  const pixelID = getPixelID();

  if (pixelID) {
    console.log(`[Meta Pixel] Pixel ID: ${pixelID}`);
  } else {
    console.warn('[Meta Pixel] No pixel ID configured');
  }

  return pixelID;
}

/**
 * Verify Meta Pixel integration status
 * Returns a status object with all relevant info
 */
export function verifyPixelIntegration(): {
  pixelID: string | null;
  isLoaded: boolean;
  fbqExists: boolean;
  status: 'ready' | 'not-initialized' | 'no-pixel-id';
} {
  const pixelID = getPixelID();
  const isLoaded = isPixelLoaded();
  const fbqExists = typeof window !== 'undefined' && !!window.fbq;

  let status: 'ready' | 'not-initialized' | 'no-pixel-id' = 'ready';

  if (!pixelID) {
    status = 'no-pixel-id';
  } else if (!isLoaded && !fbqExists) {
    status = 'not-initialized';
  }

  const result = {
    pixelID,
    isLoaded,
    fbqExists,
    status,
  };

  console.log('[Meta Pixel] Integration Status:', result);

  return result;
}

/**
 * Get detailed pixel debug info
 * Useful for troubleshooting
 */
export function getPixelDebugInfo(): {
  fbqType: string;
  pixelID: string | null;
  isLoaded: boolean;
  window: {
    fbqExists: boolean;
    fbqType: string;
  };
} {
  const pixelID = getPixelID();
  const isLoaded = isPixelLoaded();

  const debugInfo = {
    fbqType: typeof window.fbq,
    pixelID,
    isLoaded,
    window: {
      fbqExists: typeof window !== 'undefined' && !!window.fbq,
      fbqType: typeof window?.fbq,
    },
  };

  console.log('[Meta Pixel] Debug Info:', debugInfo);

  return debugInfo;
}

export default {
  logPixelEvent,
  checkPixelLoaded,
  getPixelIDForTesting,
  verifyPixelIntegration,
  getPixelDebugInfo,
};
