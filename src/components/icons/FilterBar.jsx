// @ts-nocheck
import { styles, packs } from "@/data/packs";
import { styleCounts } from "@/data/stats";

export function FilterBar({ style, pack, sort, view, total, onChange }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">{total}</span> {total === 1 ? "icon" : "icons"}
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Style" value={style} onChange={(value) => onChange({ style: value })}>
          <option value="all">All styles</option>
          {styles.filter((item) => (styleCounts[item.id] || 0) > 0).map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </Field>
        <Field label="Pack" value={pack} onChange={(value) => onChange({ pack: value })}>
          <option value="all">All packs</option>
          {packs.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name.replace("IconVault ", "")}
            </option>
          ))}
        </Field>
        <Field label="Sort" value={sort} onChange={(value) => onChange({ sort: value })}>
          <option value="name">Name</option>
          <option value="recent">Recently added</option>
          <option value="category">Category</option>
        </Field>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">View</span>
          <div className="flex h-11 rounded-md border border-border bg-card p-1" role="group" aria-label="View">
            <Toggle pressed={view === "grid"} onClick={() => onChange({ view: "grid" })} label="Grid" />
            <Toggle pressed={view === "list"} onClick={() => onChange({ view: "list" })} label="List" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, children }) {
  const id = `filter-${label.toLowerCase()}`;
  return (
    <div className="flex min-w-32 flex-1 flex-col gap-1 sm:flex-none">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border border-border bg-card px-3 text-sm text-foreground"
      >
        {children}
      </select>
    </div>
  );
}

function Toggle({ pressed, onClick, label }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`h-9 rounded-sm px-3 text-sm ${pressed ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
    >
      {label}
    </button>
  );
}
