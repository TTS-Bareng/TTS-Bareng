/**
 * Deep Link & Native Web Share Engine for TTS Bareng
 * Handles URL query parameters parsing, link generation, and native share sheets.
 */

export interface DecodedCustomCrossword {
  title: string;
  category: string;
  wordsList: { word: string; answer: string; clue: string }[];
}

export interface ParsedDeepLink {
  roomCode?: string;
  tournamentCode?: string;
  levelIndex?: number;
  vip?: boolean;
  customCrossword?: DecodedCustomCrossword;
}

/**
 * Returns current base URL origin safely (works in browser and SSR)
 */
export function getBaseOrigin(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin;
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.startsWith('capacitor:') ||
      origin.startsWith('ionic:') ||
      origin.startsWith('file:')
    ) {
      return 'https://tts-bareng-web.akashaaa-id.workers.dev';
    }
    return origin;
  }
  return 'https://tts-bareng-web.akashaaa-id.workers.dev';
}

/**
 * Generates an absolute shareable link with query parameters
 */
export function createDeepLink(params: { room?: string; level?: number; tourney?: string }): string {
  const origin = getBaseOrigin();
  const url = new URL(origin);

  if (params.tourney) {
    url.searchParams.set('tourney', params.tourney.trim().toUpperCase());
  } else if (params.room) {
    url.searchParams.set('room', params.room.trim().toUpperCase());
  } else if (typeof params.level === 'number' && !isNaN(params.level)) {
    url.searchParams.set('level', String(params.level));
  }

  return url.toString();
}

/**
 * Generates an absolute shareable link for a tournament room
 */
export function createTournamentDeepLink(code: string): string {
  return createDeepLink({ tourney: code });
}

interface CustomCrosswordWireFormat {
  t: string;
  c: string;
  w: { a: string; c: string }[];
}

/**
 * URL-safe Base64 encoder for Custom Crossword payloads
 */
export function encodeCustomCrosswordPayload(item: {
  title: string;
  category?: string;
  wordsList: Array<{ word?: string; answer?: string; clue: string }>;
}): string {
  const minified: CustomCrosswordWireFormat = {
    t: item.title,
    c: item.category || 'Kreasi Komunitas',
    w: item.wordsList.map((w) => ({
      a: (w.answer || w.word || '').trim().toUpperCase(),
      c: w.clue.trim(),
    })),
  };
  const json = JSON.stringify(minified);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * URL-safe Base64 decoder for Custom Crossword payloads
 */
export function decodeCustomCrosswordParam(param: string): DecodedCustomCrossword | null {
  try {
    if (!param || typeof param !== 'string') return null;
    let base64 = param.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const data = JSON.parse(json) as CustomCrosswordWireFormat;
    if (!data.t || !Array.isArray(data.w) || data.w.length < 2) return null;
    return {
      title: data.t,
      category: data.c || 'Kreasi Komunitas',
      wordsList: data.w.map((w) => {
        const val = w.a.trim().toUpperCase();
        return {
          word: val,
          answer: val,
          clue: w.c.trim(),
        };
      }),
    };
  } catch {
    return null;
  }
}

/**
 * Generates an absolute playable deep link for custom crosswords
 */
export function createCustomCrosswordDeepLink(item: {
  title: string;
  category?: string;
  wordsList: Array<{ word?: string; answer?: string; clue: string }>;
}): string {
  const origin = getBaseOrigin();
  const url = new URL(origin);
  const payload = encodeCustomCrosswordPayload(item);
  url.searchParams.set('custom', payload);
  return url.toString();
}

/**
 * Parses current URL search parameters for room codes, tournament codes, or level numbers
 */
export function parseDeepLink(totalLevels: number = 500): ParsedDeepLink {
  if (typeof window === 'undefined') return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('join') || params.get('kamar');
    const tourneyParam = params.get('tourney') || params.get('cup');
    const levelParam = params.get('level') || params.get('bab') || params.get('lvl');
    const vipParam = params.get('vip') || params.get('paywall');
    const customParam = params.get('custom') || params.get('tts');

    const result: ParsedDeepLink = {};

    if (customParam) {
      const decoded = decodeCustomCrosswordParam(customParam);
      if (decoded) {
        result.customCrossword = decoded;
      }
    }

    if (vipParam === '1' || vipParam === 'true') {
      result.vip = true;
    }

    if (tourneyParam && tourneyParam.trim()) {
      result.tournamentCode = tourneyParam.trim().toUpperCase();
    }

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

import { shareNative } from './nativeShare';

/**
 * Triggers native OS share sheet (WhatsApp, Telegram, etc.) with clipboard fallback
 */
export async function shareOrCopy(options: {
  title: string;
  text: string;
  url: string;
}): Promise<'shared' | 'copied' | 'cancelled'> {
  return shareNative(options);
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
    const tourney = url.searchParams.get('tourney') || url.searchParams.get('cup');
    if (tourney && tourney.trim()) {
      return tourney.trim().toUpperCase();
    }
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

  // 2. Query parameter fragment match: room=TTS-XXXX or tourney=CUP-XXXX
  const queryMatch = text.match(/(?:room|join|kamar|tourney|cup)=([a-zA-Z0-9_-]+)/i);
  if (queryMatch && queryMatch[1]) {
    return queryMatch[1].trim().toUpperCase();
  }

  // 3. Match tournament CUP-XXXX or CUPXXXX
  const cupMatch = text.match(/CUP-?([0-9A-Z]{4})/i);
  if (cupMatch && cupMatch[1]) {
    return `CUP-${cupMatch[1].toUpperCase()}`;
  }

  // 4. Match standard TTS-XXXX or TTSXXXX
  const ttsMatch = text.match(/TTS-?([0-9A-Z]{4})/i);
  if (ttsMatch && ttsMatch[1]) {
    return `TTS-${ttsMatch[1].toUpperCase()}`;
  }

  // 5. Match 4-character code directly (digits or alphanumeric)
  const codeMatch = text.match(/^[0-9A-Z]{4}$/i);
  if (codeMatch) {
    return `TTS-${codeMatch[0].toUpperCase()}`;
  }

  return null;
}

/**
 * Extracts specifically a tournament code (CUP-XXXX)
 */
export function extractTournamentCodeFromText(rawText: string): string | null {
  const code = extractRoomCodeFromText(rawText);
  if (code && code.startsWith('CUP-')) {
    return code;
  }
  return null;
}
