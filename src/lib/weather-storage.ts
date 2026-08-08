/**
 * Local Storage helpers for favourites, recent searches and user preferences.
 * All functions are safe to call during SSR (they no-op without `window`).
 */
const FAVORITES = "wx:favorites";
const RECENTS = "wx:recents";
const PREFS = "wx:prefs";

export interface SavedCity {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface Prefs {
  unit: "C" | "F";
  theme: "light" | "dark";
  lastCity?: SavedCity | undefined;
}

const hasWindow = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode — ignore */
  }
}

const sameCity = (a: SavedCity, b: SavedCity) =>
  a.name === b.name && a.country === b.country;

export const getFavorites = () => read<SavedCity[]>(FAVORITES, []);

export function toggleFavorite(city: SavedCity): SavedCity[] {
  const list = getFavorites();
  const next = list.some((c) => sameCity(c, city))
    ? list.filter((c) => !sameCity(c, city))
    : [city, ...list].slice(0, 12);
  write(FAVORITES, next);
  return next;
}

export const isFavorite = (city: SavedCity, list = getFavorites()) =>
  list.some((c) => sameCity(c, city));

export const getRecents = () => read<SavedCity[]>(RECENTS, []);

export function pushRecent(city: SavedCity): SavedCity[] {
  const next = [city, ...getRecents().filter((c) => !sameCity(c, city))].slice(0, 8);
  write(RECENTS, next);
  return next;
}

export function clearRecents(): SavedCity[] {
  write(RECENTS, []);
  return [];
}

export const getPrefs = (): Prefs =>
  read<Prefs>(PREFS, { unit: "C", theme: "dark" });

export function savePrefs(patch: Partial<Prefs>) {
  write(PREFS, { ...getPrefs(), ...patch });
}