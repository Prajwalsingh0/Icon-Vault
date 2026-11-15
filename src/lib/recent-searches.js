// @ts-nocheck
const KEY = "iconvault.recent-searches";
const MAX = 8;

export const POPULAR_SEARCHES = [
  "home",
  "arrow",
  "user",
  "settings",
  "search",
  "heart",
  "cart",
  "github",
];

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((q) => typeof q === "string" && q.trim()) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query) {
  const q = query.trim();
  if (!q) return;
  try {
    const next = [q, ...getRecentSearches().filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable
  }
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // storage unavailable
  }
}
