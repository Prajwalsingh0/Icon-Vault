// @ts-nocheck
import { IconCard, IconCardSkeleton } from "@/components/icons/IconCard";
import { cn } from "@/lib/utils";

export function IconGrid({ icons, view = "grid", loading = false, onClear }) {
  if (loading) {
    return (
      <div className={cn(view === "list" ? "flex flex-col gap-2" : "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4")} aria-busy="true" aria-live="polite">
        {Array.from({ length: view === "list" ? 6 : 8 }).map((_, index) => (
          <IconCardSkeleton key={index} view={view} />
        ))}
      </div>
    );
  }

  if (!icons.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <p className="text-base font-medium">No icons match</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Try a shorter query, or clear the category, style, and pack filters.
        </p>
        {onClear ? (
          <button type="button" onClick={onClear} className="mt-5 h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Clear filters
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn(view === "list" ? "flex flex-col gap-2" : "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4")}>
      {icons.map((icon) => (
        <IconCard key={icon.id} icon={icon} view={view} />
      ))}
    </div>
  );
}
