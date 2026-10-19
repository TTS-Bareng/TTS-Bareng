/**
 * Deep Link & Native Web Share Engine for TTS Quest
 * Handles URL query parameters parsing, link generation, and native share sheets.
 */

export interface ParsedDeepLink {
  roomCode?: string;
  levelIndex?: number;
}

/**
 * Returns current base URL origin safely (works in browser and SSR)
 */
export function getBaseOrigin(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://tts-quest.web.app';
}

/**
 * Generates an absolute shareable link with query parameters
 */
export function createDeepLink(params: { room?: string; level?: number }): string {
  const origin = getBaseOrigin();
  const url = new URL(origin);

  if (params.room) {
    url.searchParams.set('room', params.room.trim().toUpperCase());
  } else if (typeof params.level === 'number' && !isNaN(params.level)) {
    url.searchParams.set('level', String(params.level));
  }

  return url.toString();
}

/**
 * Parses current URL search parameters for room codes or level numbers
 */
export function parseDeepLink(totalLevels: number = 220): ParsedDeepLink {
  if (typeof window === 'undefined') return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('join') || params.get('kamar');
    const levelParam = params.get('level') || params.get('bab') || params.get('lvl');

    const result: ParsedDeepLink = {};

    if (roomParam && roomParam.trim()) {
      result.roomCode = roomParam.trim().toUpperCase();
    }

    if (levelParam) {
      const num = parseInt(levelParam, 10);
      if (!isNaN(num) && num >= 1 && num <= totalLevels) {
        // Convert 1-based level parameter to 0-based index
        result.levelIndex = num - 1;
      }
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Cleanly removes query parameters from the browser address bar without a page reload
 */
export function clearUrlParams(): void {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;
  try {
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);
  } catch {
    // Ignore history replace state errors
  }
}

/**
 * Triggers native OS share sheet (WhatsApp, Telegram, etc.) with clipboard fallback
 */
export async function shareOrCopy(options: {
  title: string;
  text: string;
  url: string;
}): Promise<'shared' | 'copied' | 'cancelled'> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: options.title,
        text: options.text,
        url: options.url,
      });
      return 'shared';
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  // Fallback to clipboard copy
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${options.text} ${options.url}`.trim());
      return 'copied';
    } catch {
      // Fall through
    }
  }

  return 'cancelled';
}
