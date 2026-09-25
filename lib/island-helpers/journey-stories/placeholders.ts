/**
 * Local Journey Stories page art. Not a hosted library image.
 */
import { JOURNEY_PAGE_ROLES, type JourneyPageRole } from './types';

const PLACEHOLDER_BASE = '/images/island-helpers';

export function placeholderForRole(role: string): string {
  const safe = JOURNEY_PAGE_ROLES.includes(role as JourneyPageRole) ? role : 'intro';
  return `${PLACEHOLDER_BASE}/journey-${safe}.svg`;
}

export function isLocalPlaceholder(url: string | null | undefined): boolean {
  return typeof url === 'string' && url.startsWith(`${PLACEHOLDER_BASE}/journey-`) && url.endsWith('.svg');
}
