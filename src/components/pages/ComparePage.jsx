// @ts-nocheck
import { Link } from "@tanstack/react-router";
import { IconGlyph } from "@/components/icons/IconGlyph";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/data/categories";
import { packById, styleLabel } from "@/data/packs";
import { getIcon } from "@/lib/icon-registry";
import { librarySearch } from "@/lib/library-search";
import { useCompare } from "@/lib/compare";
import { useCatalog, useMarkup } from "@/lib/use-catalog";
import { toast } from "sonner";

const FORMATS = "SVG · HTML · React · Vue · CSS";

export function ComparePage() {
  const compare = useCompare();
  const { ready } = useCatalog();
  const markupReady = useMarkup(ready ? compare.ids : []);
  const icons = ready && markupReady ? compare.ids.map((id) => getIcon(id)).filter(Boolean) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Compare</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Up to 4 icons side by side. Pick candidates in the library, then compare style, pack, and metadata here.
          </p>
        </div>
        {compare.ready && compare.count ? (
          <Button
            variant="outline"
            onClick={() => {
              compare.clear();
              toast.success("Comparison cleared");
            }}
          >
            Clear all
          </Button>
        ) : null}
      </div>

      <div className="mt-8">
        {!compare.ready || !ready || (compare.count > 0 && !markupReady) ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
            {Array.from({ length: Math.max(compare.count, 2) }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : icons.length ? (
          <div className={`grid gap-4 ${icons.length === 1 ? "max-w-sm" : icons.length === 2 ? "sm:grid-cols-2" : icons.length === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4"}`}>
            {icons.map((icon) => (
              <CompareCard key={icon.id} icon={icon} onRemove={() => compare.remove(icon.id)} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <p className="text-base font-medium">Nothing to compare yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Add up to 4 icons from the library to compare them side by side.
            </p>
            <Link to="/library" search={librarySearch({})} className="mt-5 inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
              Browse icons
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function CompareCard({ icon, onRemove }) {
  const pack = packById(icon.pack);
  return (
    <article className="relative flex flex-col rounded-xl border border-border bg-card p-4 shadow-border">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${icon.name} from comparison`}
        className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
      >
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
      <div className="flex min-h-40 items-center justify-center rounded-lg bg-muted text-foreground">
        <IconGlyph icon={icon} size={72} title={icon.name} />
      </div>
      <h2 className="mt-3 truncate text-base font-medium">{icon.name}</h2>
      <dl className="mt-2 space-y-1 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Pack</dt>
          <dd className="truncate font-medium">{pack?.name ?? icon.pack}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Category</dt>
          <dd>{categoryLabel(icon.category)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Style</dt>
          <dd>{styleLabel(icon.style)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Formats</dt>
          <dd className="text-right text-xs text-muted-foreground">{FORMATS}</dd>
        </div>
      </dl>
      <div className="mt-4 flex gap-2">
        <Link
          to="/icons/$iconId"
          params={{ iconId: icon.id }}
          className="inline-flex h-9 flex-1 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
        >
          Open
        </Link>
      </div>
    </article>
  );
}
