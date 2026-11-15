// @ts-nocheck
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const KEY = "iconvault.favorites";
const FavoritesContext = createContext(null);

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(read());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids, ready]);

  const value = useMemo(() => {
    const set = new Set(ids);
    return {
      ids,
      ready,
      count: ids.length,
      has: (id) => set.has(id),
      toggle: (id) => {
        setIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]));
      },
      clear: () => setIds([]),
    };
  }, [ids, ready]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error("useFavorites must be used within FavoritesProvider");
  return value;
}
