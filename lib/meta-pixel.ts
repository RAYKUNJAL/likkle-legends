/**
 * Meta Pixel (Facebook Pixel) Integration
 * Handles frontend pixel tracking for Likkle Legends
 * Critical for cold traffic campaigns and $10k+/month scaling
 */

// Types for Meta Pixel events
export interface MetaPixelEventData {
  value?: number;
  currency?: string;
  contentType?: string;
  contentId?: string;
  contentName?: string;
  level?: string | number;
  gameId?: string;
  planId?: string;
  [key: string]: any;
}

// Declare fbq globally to satisfy TypeScript
declare global {
  interface Window {
    fbq?: (action: string, event: string, data?: any) => void;
  }
}

/**
 * Initialize Meta Pixel script
 * Must be called once at app startup (in layout or root component)
 */
export function initializeMetaPixel(pixelId: string): void {
  if (!pixelId) {
    console.warn('[Meta Pixel] No pixel ID provided');
    return;
  }

  // Prevent double initialization
  if (window.fbq) {
    console.log('[Meta Pixel] Already initialized');
    return;
  }

  // Create fbq function
  function fbq(...args: any[]) {
    if ((fbq as any).callMethod) {
      (fbq as any).callMethod.apply(fbq, args);
    } else {
      (fbq as any).queue.push(args);
    }
  }

  (fbq as any).push = fbq;
  (fbq as any).loaded = true;
  (fbq as any).version = '2.0';
  (fbq as any).queue = [];

  window.fbq = fbq as any;

  // Insert Meta Pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://connect.facebook.net/en_US/fbevents.js`;

  script.onload = () => {
    // Initialize pixel
    window.fbq?.('init', pixelId);
    // Track page view
    window.fbq?.('track', 'PageView');
    console.log(`[Meta Pixel] Initialized with pixel ID: ${pixelId}`);
  };

  script.onerror = () => {
    console.error('[Meta Pixel] Failed to load pixel script');
  };

  document.head.appendChild(script);
}

/**
 * Track page view (fires on every page navigation)
 */
export function trackPageView(): void {
  if (!window.fbq) {
    console.warn('[Meta Pixel] Pixel not initialized');
    return;
  }

  window.fbq?.('track', 'PageView');
  console.log('[Meta Pixel] PageView tracked');
}

/**
 * Track ViewContent - when user views a game or product
 * Critical for funnel: cold traffic sees game content
 */
export function trackViewContent(
  contentType: string,
  contentId: string,
  additionalData?: MetaPixelEventData
): void {
  if (!window.fbq) {
    console.warn('[Meta Pixel] Pixel not initialized');
    return;
  }

  const eventData = {
    content_type: contentType, // e.g., "game", "product", "checkout"
    content_id: contentId, // e.g., game ID or product ID
    content_name: contentId,
    ...additionalData,
  };

  window.fbq?.('track', 'ViewContent', eventData);
  console.log('[Meta Pixel] ViewContent tracked:', contentType, contentId);
}

/**
 * Track InitiateCheckout - when user selects a plan
 * Middle funnel: engaged user ready to purchase
 */
export function trackInitiateCheckout(
  value: number,
  currency: string = 'USD',
  additionalData?: MetaPixelEventData
): void {
  if (!window.fbq) {
    console.warn('[Meta Pixel] Pixel not initialized');
    return;
  }

  const eventData = {
    value,
    currency,
    ...additionalData,
  };

  window.fbq?.('track', 'InitiateCheckout', eventData);
  console.log('[Meta Pixel] InitiateCheckout tracked:', value, currency);
}

/**
 * Track Purchase - subscription completed (MOST IMPORTANT EVENT)
 * Bottom funnel: conversion tracking for ROAS optimization
 */
export function trackPurchase(
  value: number,
  currency: string = 'USD',
  contentName: string = 'subscription',
  additionalData?: MetaPixelEventData
): void {
  if (!window.fbq) {
    console.warn('[Meta Pixel] Pixel not initialized');
    return;
  }

  const eventData = {
    value,
    currency,
    content_type: 'product',
    content_name: contentName,
    ...additionalData,
  };

  window.fbq?.('track', 'Purchase', eventData);
  console.log('[Meta Pixel] Purchase tracked:', value, currency, contentName);
}

/**
 * Track Signup - new parent account created
 * Important conversion event for funnel optimization
 */
export function trackSignup(additionalData?: MetaPixelEventData): void {
  if (!window.fbq) {
    console.warn('[Meta Pixel] Pixel not initialized');
    return;
  }

  const eventData = {
    content_type: 'account',
    ...additionalData,
  };

  window.fbq?.('track', 'CompleteRegistration', eventData);
  console.log('[Meta Pixel] CompleteRegistration (Signup) tracked');
}

/**
 * Track AddToCart - game trial started
 * Secondary funnel event (can also be used for trial/freemium engagement)
 */
export function trackAddToCart(
  value: number,
  contentType: string = 'game_trial',
  additionalData?: MetaPixelEventData
): void {
  if (!window.fbq) {
    console.warn('[Meta Pixel] Pixel not initialized');
    return;
  }

  const eventData = {
    value,
    content_type: contentType,
    ...additionalData,
  };

  window.fbq?.('track', 'AddToCart', eventData);
  console.log('[Meta Pixel] AddToCart tracked:', contentType);
}

/**
 * Track AddPaymentInfo - user added payment information
 * Important mid-funnel event for Conversions API matching
 */
export function trackAddPaymentInfo(
  cardBrand?: string,
  additionalData?: MetaPixelEventData
): void {
  if (!window.fbq) {
    console.warn('[Meta Pixel] Pixel not initialized');
    return;
  }

  const eventData = {
    content_type: 'payment',
    ...(cardBrand && { card_brand: cardBrand }),
    ...additionalData,
  };

  window.fbq?.('track', 'AddPaymentInfo', eventData);
  console.log('[Meta Pixel] AddPaymentInfo tracked');
}

/**
 * Track custom events - for game progress and engagement metrics
 * Used for: game_level_complete, game_completed, etc.
 */
export function trackCustom(
  eventName: string,
  eventData?: MetaPixelEventData
): void {
  if (!window.fbq) {
    console.warn('[Meta Pixel] Pixel not initialized');
    return;
  }

  window.fbq?.('track', eventName, eventData || {});
  console.log('[Meta Pixel] Custom event tracked:', eventName);
}

/**
 * Set user data for hashed matching (for Conversions API)
 * Sends email/phone data to Meta for lookalike and matching audiences
 */
export function setUserData(email?: string, phone?: string): void {
  if (!window.fbq) {
    console.warn('[Meta Pixel] Pixel not initialized');
    return;
  }

  // Note: Client-side pixel does basic hashing
  // Server-side Conversions API provides more reliable hashing
  const userData: any = {};

  if (email) {
    userData.em = email;
  }
  if (phone) {
    userData.ph = phone;
  }

  if (Object.keys(userData).length === 0) {
    console.warn('[Meta Pixel] No user data provided');
    return;
  }

  // Use setUserData method if available (newer pixel version)
  if ((window.fbq as any).setUserData) {
    (window.fbq as any).setUserData(userData);
  } else {
    // Fallback: track as custom event with user data
    window.fbq?.('setUserData', userData);
  }

  console.log('[Meta Pixel] User data set');
}

/**
 * Track Donate event (placeholder - not applicable for Likkle Legends)
 * Included for completeness in tracking taxonomy
 */
export function trackDonate(
  value: number,
  currency: string = 'USD',
  additionalData?: MetaPixelEventData
): void {
  if (!window.fbq) {
    console.warn('[Meta Pixel] Pixel not initialized');
    return;
  }

  const eventData = {
    value,
    currency,
    content_type: 'donation',
    ...additionalData,
  };

  window.fbq?.('track', 'Donate', eventData);
  console.log('[Meta Pixel] Donate tracked:', value, currency);
}

/**
 * Get the current pixel ID from environment
 */
export function getPixelID(): string | null {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID || null;
}

/**
 * Check if pixel is loaded and ready
 */
export function isPixelLoaded(): boolean {
  return !!window.fbq && !!(window.fbq as any).loaded;
}

export default {
  initializeMetaPixel,
  trackPageView,
  trackViewContent,
  trackInitiateCheckout,
  trackPurchase,
  trackSignup,
  trackAddToCart,
  trackAddPaymentInfo,
  trackCustom,
  setUserData,
  trackDonate,
  getPixelID,
  isPixelLoaded,
};
