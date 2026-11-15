// @ts-nocheck
import { Link } from "@tanstack/react-router";
import { collectionPreviews } from "@/data/collection-previews";
import { IconGlyph } from "@/components/icons/IconGlyph";
import { getIcon, isCatalogReady } from "@/lib/icon-registry";
import { useMarkup } from "@/lib/use-catalog";

export function CollectionCard({ collection, badge }) {
  const ids = (collection.iconIds || []).slice(0, 4);
  const missing = isCatalogReady() ? ids.filter((id) => !collectionPreviews[id]) : [];
  const markupReady = useMarkup(missing);
  const preview = ids
    .map((id) => collectionPreviews[id] || (markupReady ? getIcon(id) : null))
    .filter((icon) => icon?.markup);
  return (
    <Link
      to="/collections/$slug"
      params={{ slug: collection.slug }}
      className="flex flex-col rounded-xl border border-border bg-card p-3 shadow-border transition-[box-shadow] duration-150 hover:shadow-border-hover"
    >
      <div className="grid grid-cols-4 gap-2 rounded-lg bg-muted p-3">
        {preview.length ? (
          preview.map((icon) => (
            <span key={icon.id} className="flex aspect-square items-center justify-center text-foreground">
              <IconGlyph icon={icon} size={22} />
            </span>
          ))
        ) : (
          <span className="col-span-4 flex aspect-[4/1] items-center justify-center text-xs text-muted-foreground">{collection.terms?.length ? "Live from catalog" : "Empty"}</span>
        )}
      </div>
      <div className="mt-3 px-1 pb-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-medium">{collection.name}</h3>
          {badge ? <span className="text-xs font-medium text-muted-foreground">{badge}</span> : null}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{collection.description}</p>
        <p className="mt-3 font-mono text-xs text-muted-foreground tabular-nums">
          {collection.iconIds?.length ? `${collection.iconIds.length} icons` : collection.terms?.length ? "Live search" : "0 icons"}
        </p>
      </div>
    </Link>
  );
}
