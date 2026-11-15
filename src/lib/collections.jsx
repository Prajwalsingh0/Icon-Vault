// @ts-nocheck
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const KEY = "iconvault.collections";
const CollectionsContext = createContext(null);

function isCollection(item) {
  return (
    item &&
    typeof item.slug === "string" &&
    item.slug.startsWith("custom-") &&
    typeof item.name === "string" &&
    typeof item.description === "string" &&
    Array.isArray(item.iconIds) &&
    item.iconIds.every((id) => typeof id === "string")
  );
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isCollection) : [];
  } catch {
    return [];
  }
}

export function CollectionsProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo(
    () => ({
      items,
      ready,
      get: (slug) => items.find((item) => item.slug === slug) ?? null,
      create: (name, description) => {
        const slug = `custom-${Date.now().toString(36)}`;
        const next = {
          slug,
          name: name.trim().slice(0, 48),
          description: description.trim().slice(0, 160),
          iconIds: [],
        };
        setItems((current) => [next, ...current]);
        return slug;
      },
      remove: (slug) => {
        setItems((current) => current.filter((item) => item.slug !== slug));
      },
      toggleIcon: (slug, iconId) => {
        setItems((current) =>
          current.map((item) => {
            if (item.slug !== slug) return item;
            const has = item.iconIds.includes(iconId);
            return {
              ...item,
              iconIds: has ? item.iconIds.filter((id) => id !== iconId) : [...item.iconIds, iconId],
            };
          }),
        );
      },
    }),
    [items, ready],
  );

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}

export function useCollections() {
  const value = useContext(CollectionsContext);
  if (!value) throw new Error("useCollections must be used within CollectionsProvider");
  return value;
}
