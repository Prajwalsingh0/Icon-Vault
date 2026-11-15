// @ts-nocheck
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const KEY = "iconvault.compare";
const MAX = 4;
const CompareContext = createContext(null);

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }) {
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
      full: ids.length >= MAX,
      toggle: (id) => {
        setIds((current) => {
          if (current.includes(id)) return current.filter((item) => item !== id);
          if (current.length >= MAX) return current;
          return [...current, id];
        });
      },
      remove: (id) => setIds((current) => current.filter((item) => item !== id)),
      clear: () => setIds([]),
    };
  }, [ids, ready]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const value = useContext(CompareContext);
  if (!value) throw new Error("useCompare must be used within CompareProvider");
  return value;
}
