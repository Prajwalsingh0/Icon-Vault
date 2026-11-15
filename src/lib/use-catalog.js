// @ts-nocheck
import { useEffect, useState } from "react";
import { initCatalog, isCatalogReady, loadMarkup, markupFor } from "@/lib/icon-registry";

export function useCatalog() {
  const [ready, setReady] = useState(isCatalogReady);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancel = false;
    initCatalog()
      .then(() => {
        if (!cancel) setReady(true);
      })
      .catch(() => {
        if (!cancel) setError(true);
      });
    return () => {
      cancel = true;
    };
  }, []);

  return { ready, error };
}

export function useMarkup(ids) {
  const key = ids.join("|");
  const [ready, setReady] = useState(() => ids.every((id) => !id || markupFor(id)));

  useEffect(() => {
    let cancel = false;
    if (!ids.length) {
      setReady(true);
      return undefined;
    }
    setReady(ids.every((id) => markupFor(id)));
    loadMarkup(ids).then(() => {
      if (!cancel) setReady(true);
    });
    return () => {
      cancel = true;
    };
  }, [key]);

  return ready;
}
