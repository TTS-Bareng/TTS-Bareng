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

/**
 * Extracts a room code from scanned QR text, deep link URLs, or raw codes.
 * Supports:
 * - Full URLs: https://domain.com/?room=TTS-3314
 * - Param queries: room=TTS-3314
 * - Standard codes: TTS-3314 or TTS3314
 * - 4-character alphanumerics: 3314 or 8821
 */
export function extractRoomCodeFromText(rawText: string): string | null {
  if (!rawText || typeof rawText !== 'string') return null;
  const text = rawText.trim();

  // 1. Try URL parsing
  try {
    const url = new URL(text);
    const room =
      url.searchParams.get('room') ||
      url.searchParams.get('join') ||
      url.searchParams.get('kamar');
    if (room && room.trim()) {
      return room.trim().toUpperCase();
    }
  } catch {
    // Not a valid URL, continue to regex patterns
  }

  // 2. Query parameter fragment match: room=TTS-XXXX
  const queryMatch = text.match(/(?:room|join|kamar)=([a-zA-Z0-9_-]+)/i);
  if (queryMatch && queryMatch[1]) {
    return queryMatch[1].trim().toUpperCase();
  }

  // 3. Match standard TTS-XXXX or TTSXXXX
  const ttsMatch = text.match(/TTS-?([0-9A-Z]{4})/i);
  if (ttsMatch && ttsMatch[1]) {
    return `TTS-${ttsMatch[1].toUpperCase()}`;
  }

  // 4. Match 4-character code directly (digits or alphanumeric)
  const codeMatch = text.match(/^[0-9A-Z]{4}$/i);
  if (codeMatch) {
    return `TTS-${codeMatch[0].toUpperCase()}`;
  }

  return null;
}
