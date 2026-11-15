// @ts-nocheck
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { IconGlyph } from "@/components/icons/IconGlyph";
import { CopyButton } from "@/components/icons/CopyButton";
import { categoryLabel } from "@/data/categories";
import { packById, styleLabel } from "@/data/packs";
import { useFavorites } from "@/lib/favorites";
import { useCompare } from "@/lib/compare";
import { buildSvg } from "@/lib/snippets";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function IconCard({ icon, view = "grid" }) {
  const favorites = useFavorites();
  const compare = useCompare();
  const saved = favorites.has(icon.id);
  const inCompare = compare.has(icon.id);
  const packName = packById(icon.pack)?.name || icon.pack;
  const svg = () => buildSvg(icon, { size: 24, color: "currentColor", strokeWidth: 1.75, rotate: 0 });
  function toggleFavorite() {
    favorites.toggle(icon.id);
    toast.success(saved ? `Removed ${icon.name} from favorites` : `Saved ${icon.name} to favorites`);
  }
  function toggleCompare() {
    const was = compare.has(icon.id);
    compare.toggle(icon.id);
    if (!was && compare.full) toast.error("Comparison is full — remove one first (max 4)");
    else toast.success(was ? `Removed ${icon.name} from comparison` : `Added ${icon.name} to comparison`);
  }

  if (view === "list") {
    return (
      <article className="relative flex items-center gap-4 rounded-lg border border-border bg-card px-3 py-2 shadow-border transition-[box-shadow] duration-150 hover:shadow-border-hover">
        <Link
          to="/icons/$iconId"
          params={{ iconId: icon.id }}
          className="absolute inset-0 rounded-lg"
          aria-label={`${icon.name}, ${categoryLabel(icon.category)}`}
        />
        <span className="relative flex size-11 items-center justify-center rounded-md bg-muted text-foreground">
          <IconGlyph icon={icon} size={22} />
        </span>
        <div className="relative min-w-0 flex-1 pointer-events-none">
          <p className="truncate text-sm font-medium">{icon.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {packName} · {styleLabel(icon.style)}
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-1">
          <FavoriteButton saved={saved} onToggle={toggleFavorite} name={icon.name} />
          <CompareButton active={inCompare} onToggle={toggleCompare} name={icon.name} />
          <CopyButton text={svg} label={`Copy ${icon.name} SVG`} iconOnly />
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col rounded-xl border border-border bg-card p-2 shadow-border transition-[box-shadow,transform] duration-150 hover:shadow-border-hover">
      <Link
        to="/icons/$iconId"
        params={{ iconId: icon.id }}
        className="absolute inset-0 rounded-xl"
        aria-label={`${icon.name}, ${categoryLabel(icon.category)}`}
      />
      <div className="pointer-events-none relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground">
        <span className="transition-transform duration-200 ease-out group-hover:scale-[1.45]">
          <IconGlyph icon={icon} size={28} />
        </span>
        <div className="absolute inset-x-1 bottom-1 z-10 flex items-center justify-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          <span className="pointer-events-auto inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium shadow-sm">
            <CopyButton text={svg} label={`Copy ${icon.name} SVG`} iconOnly />
            <FavoriteButton saved={saved} onToggle={toggleFavorite} name={icon.name} compact />
            <CompareButton active={inCompare} onToggle={toggleCompare} name={icon.name} compact />
          </span>
        </div>
      </div>
      <div className="relative mt-2 flex items-start justify-between gap-2 px-1 pb-1">
        <div className="pointer-events-none min-w-0">
          <p className="truncate text-sm font-medium">{icon.name}</p>
          <p className="truncate text-xs text-muted-foreground">{packName}</p>
        </div>
        <Badge className="pointer-events-none hidden sm:inline-flex">{styleLabel(icon.style)}</Badge>
      </div>
      <div className="relative z-10 flex items-center justify-end gap-1 px-1 pb-1">
        <FavoriteButton saved={saved} onToggle={toggleFavorite} name={icon.name} />
        <CompareButton active={inCompare} onToggle={toggleCompare} name={icon.name} />
        <CopyButton text={svg} label={`Copy ${icon.name} SVG`} iconOnly />
      </div>
    </article>
  );
}

function FavoriteButton({ saved, onToggle, name, compact = false }) {
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from favorites` : `Save ${name} to favorites`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-accent",
        compact ? "size-7" : "size-10",
        saved && "text-foreground",
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="m12 3.6 2.2 4.6 5 .7-3.6 3.5.9 5.1L12 15.2 7.5 17.5l.9-5.1L4.8 8.9l5-.7L12 3.6z" />
      </svg>
    </button>
  );
}

function CompareButton({ active, onToggle, name, compact = false }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from comparison` : `Add ${name} to comparison`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
        compact ? "size-7" : "size-10",
        active && "border-foreground bg-foreground text-background hover:bg-foreground",
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </svg>
    </button>
  );
}

export function IconCardSkeleton({ view = "grid" }) {
  if (view === "list") {
    return <div className="h-16 animate-pulse rounded-lg bg-muted" />;
  }
  return (
    <div className="rounded-xl border border-border bg-card p-2">
      <div className="aspect-square animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-3 w-2/3 animate-pulse rounded-sm bg-muted" />
      <div className="mt-2 h-3 w-1/3 animate-pulse rounded-sm bg-muted" />
    </div>
  );
}
