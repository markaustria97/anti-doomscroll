export const APP_STATE_SESSION_COOKIE = "anti_doomscroll_session";
export const APP_STATE_USER_COOKIE = "anti_doomscroll_user";
export const APP_STATE_SESSION_MAX_AGE = 60 * 60 * 24 * 365;
export const LAST_VISITED_STATE_KEY = "lastVisited";

export interface AppStateEntry {
  key: string;
  value: unknown;
}

export function isValidAppStateKey(key: string): boolean {
  const normalizedKey = key.trim();
  return normalizedKey.length > 0 && normalizedKey.length <= 200;
}

export function normalizeAppStateKeys(keys: string[]): string[] {
  return Array.from(
    new Set(keys.map((key) => key.trim()).filter(isValidAppStateKey))
  );
}
