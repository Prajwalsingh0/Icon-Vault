// @ts-nocheck
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

export function CategorySidebar({ value, counts, onChange }) {
  const items = [{ id: "all", label: "All" }, ...categories];
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <nav aria-label="Categories" className="lg:sticky lg:top-20 lg:w-52 lg:shrink-0 lg:self-start">
      <p className="mb-2 hidden text-xs font-medium tracking-wide text-muted-foreground uppercase lg:block">Categories</p>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:max-h-[calc(100vh-8rem)] lg:flex-col lg:gap-0.5 lg:overflow-auto lg:px-0 lg:pb-0">
        {items.filter((item) => item.id === "all" || item.id === value || (counts[item.id] || 0) > 0).map((item) => {
          const active = value === item.id;
          const count = item.id === "all" ? total : counts[item.id] || 0;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(item.id)}
              className={cn(
                "flex h-10 shrink-0 items-center justify-between gap-3 rounded-md px-3 text-left text-sm lg:w-full",
                active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <span className="whitespace-nowrap">{item.label}</span>
              <span className={cn("font-mono text-xs tabular-nums", active ? "text-background/70" : "text-muted-foreground")}>{count}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
