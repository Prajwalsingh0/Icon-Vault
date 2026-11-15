// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CategorySidebar } from "@/components/icons/CategorySidebar";
import { FilterBar } from "@/components/icons/FilterBar";
import { IconGrid } from "@/components/icons/IconGrid";
import { SearchBar } from "@/components/icons/SearchBar";
import { iconCount, PAGE_SIZE } from "@/data";
import { countByCategory, filterIcons, getIcon } from "@/lib/icon-registry";
import { searchFocus } from "@/lib/search-focus";
import { useCatalog, useMarkup } from "@/lib/use-catalog";

export function LibraryPage() {
  const search = useSearch({ from: "/library" });
  const navigate = useNavigate({ from: "/library" });
  const { ready, error } = useCatalog();
  const [draft, setDraft] = useState(search.q);

  useEffect(() => {
    setDraft(search.q);
  }, [search.q]);

  useEffect(() => {
    const field = document.getElementById("library-search");
    if (searchFocus.pending && field) {
      field.focus();
      searchFocus.pending = false;
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (draft !== search.q) {
        navigate({ search: (prev) => ({ ...prev, q: draft, page: 1 }) });
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [draft, navigate, search.q]);

  const counts = useMemo(() => (ready ? countByCategory() : {}), [ready]);
  const [filtered, setFiltered] = useState([]);
  const [filtering, setFiltering] = useState(false);
  useEffect(() => {
    if (!ready) return undefined;
    let cancel = false;
    setFiltering(true);
    filterIcons({ q: search.q, category: search.category, style: search.style, pack: search.pack, sort: search.sort }).then((list) => {
      if (!cancel) { setFiltered(list); setFiltering(false); }
    });
    return () => { cancel = true; };
  }, [ready, search.q, search.category, search.style, search.pack, search.sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(search.page, totalPages);
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const markupReady = useMarkup(slice.map((icon) => icon.id));
  const visible = markupReady ? slice.map((icon) => getIcon(icon.id)) : [];

  function update(partial) {
    navigate({
      search: (prev) => ({
        ...prev,
        ...partial,
        page: partial.page ?? 1,
      }),
    });
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6 lg:py-8">
      <CategorySidebar value={search.category} counts={counts} onChange={(category) => update({ category })} />
      <div className="min-w-0 flex-1">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{iconCount.toLocaleString("en-US")}</span> icons across open-source packs. Search does not render the full set at once.
          </p>
        </div>
        <SearchBar id="library-search" value={draft} onChange={setDraft} onSubmit={(value) => update({ q: value })} className="mb-4" />
        <FilterBar
          style={search.style}
          pack={search.pack}
          sort={search.sort}
          view={search.view}
          total={ready ? filtered.length : 0}
          onChange={update}
        />
        <div className="mt-4">
          {error ? (
            <p className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">The catalog could not be loaded.</p>
          ) : (
            <IconGrid
              icons={visible}
              view={search.view}
              loading={!ready || filtering || !markupReady}
              onClear={() => {
                setDraft("");
                update({ q: "", category: "all", style: "all", pack: "all", sort: "name", view: "grid" });
              }}
            />
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onPage={(next) => update({ page: next })} />
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <button type="button" className="h-11 rounded-md border border-border px-3 text-sm disabled:opacity-40" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <p className="text-sm text-muted-foreground tabular-nums">
        Page {page.toLocaleString("en-US")} of {totalPages.toLocaleString("en-US")}
      </p>
      <button type="button" className="h-11 rounded-md border border-border px-3 text-sm disabled:opacity-40" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </nav>
  );
}
