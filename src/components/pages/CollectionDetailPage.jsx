// @ts-nocheck
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { IconGlyph } from "@/components/icons/IconGlyph";
import { IconGrid } from "@/components/icons/IconGrid";
import { Button } from "@/components/ui/button";
import { collectionIcons, filterIcons, getCollection } from "@/data";
import { getIcon, loadMarkup } from "@/lib/icon-registry";
import { useCollections } from "@/lib/collections";
import { useCatalog, useMarkup } from "@/lib/use-catalog";
import { downloadIconsZip } from "@/lib/export-zip";
import { librarySearch } from "@/lib/library-search";

export function CollectionDetailPage({ slug }) {
  const curated = getCollection(slug);
  const mine = useCollections();
  const custom = mine.get(slug);
  const navigate = useNavigate();
  const catalog = useCatalog();
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const collection = curated || custom;
  const isTerms = Boolean(collection?.terms?.length);
  const [liveIcons, setLiveIcons] = useState([]);
  useEffect(() => {
    if (!catalog.ready || !collection?.terms?.length) { setLiveIcons([]); return undefined; }
    let cancel = false;
    Promise.all(collection.terms.map((term) => filterIcons({ q: term }))).then((lists) => {
      if (cancel) return;
      const seen = new Set();
      const picked = [];
      const perTerm = Math.max(4, Math.ceil(48 / collection.terms.length));
      for (const list of lists) {
        let taken = 0;
        for (const icon of list) {
          if (seen.has(icon.id)) continue;
          seen.add(icon.id);
          picked.push(icon);
          if (++taken >= perTerm || picked.length >= 48) break;
        }
        if (picked.length >= 48) break;
      }
      setLiveIcons(picked.slice(0, 48));
    });
    return () => { cancel = true; };
  }, [catalog.ready, collection?.terms]);
  const base = catalog.ready && collection ? (isTerms ? liveIcons : collectionIcons(collection)) : [];
  const [results, setResults] = useState([]);
  useEffect(() => {
    if (!catalog.ready || !custom || !query.trim()) { setResults([]); return undefined; }
    let cancel = false;
    filterIcons({ q: query }).then((list) => { if (!cancel) setResults(list.slice(0, 8)); });
    return () => { cancel = true; };
  }, [catalog.ready, custom, query]);
  const markupReady = useMarkup([...base, ...results].map((icon) => icon.id));
  const icons = markupReady ? base.map((icon) => getIcon(icon.id)).filter(Boolean) : [];
  const resultIcons = markupReady ? results.map((icon) => getIcon(icon.id)).filter(Boolean) : results;

  if (!curated && slug.startsWith("custom-") && !mine.ready) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <IconGrid icons={[]} loading />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Collection not found</h1>
        <Link to="/collections" className="mt-6 inline-flex h-11 items-center text-sm underline">
          All collections
        </Link>
      </div>
    );
  }

  const yours = Boolean(custom);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <Link to="/collections" className="text-sm text-muted-foreground hover:text-foreground">
        Collections
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{collection.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {collection.description || (yours ? "A collection saved in this browser." : "")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={icons.length === 0}
            onClick={async () => {
              await loadMarkup(icons.map((icon) => icon.id));
              downloadIconsZip(
                `iconvault-${collection.slug}.zip`,
                icons.map((icon) => getIcon(icon.id)),
                collection,
              );
            }}
          >
            Download ZIP
          </Button>
          {yours ? (
            confirmDelete ? (
              <>
                <Button
                  variant="default"
                  onClick={() => {
                    mine.remove(collection.slug);
                    navigate({ to: "/collections" });
                  }}
                >
                  Delete
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setConfirmDelete(true)}>
                Delete collection
              </Button>
            )
          ) : null}
        </div>
      </div>

      {yours ? (
        <form
          className="mt-6"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="collection-add" className="text-sm font-medium">
            Add icons
          </label>
          <input
            id="collection-add"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the catalog"
            className="mt-2 h-11 w-full max-w-md rounded-lg border border-border bg-card px-3 text-sm shadow-border outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          {query.trim() && catalog.ready && resultIcons.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No icons match.</p> : null}
          {resultIcons.length ? (
            <ul className="mt-3 max-w-xl divide-y divide-border rounded-xl border border-border bg-card">
              {resultIcons.map((icon) => {
                const added = collection.iconIds.includes(icon.id);
                return (
                  <li key={icon.id} className="flex items-center gap-3 px-3 py-2">
                    <IconGlyph icon={icon} size={20} />
                    <span className="min-w-0 flex-1 truncate text-sm">{icon.name}</span>
                    <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{icon.id}</span>
                    <Button size="sm" variant={added ? "secondary" : "outline"} onClick={() => mine.toggleIcon(collection.slug, icon.id)}>
                      {added ? "Added" : "Add"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </form>
      ) : null}

      <div className="mt-8">
        {!catalog.ready || (base.length > 0 && !markupReady) ? (
          <IconGrid icons={[]} loading />
        ) : icons.length ? (
          <IconGrid icons={icons} />
        ) : (
          <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <p className="text-base font-medium">{yours ? "This collection is empty" : "Nothing in this collection"}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {yours ? "Search above to add icons from the catalog." : "This curated set has no icons yet."}
            </p>
            <Link to="/library" search={librarySearch({})} className="mt-5 inline-flex h-11 items-center text-sm underline">
              Browse the library
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
