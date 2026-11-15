// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { IconGlyph } from "@/components/icons/IconGlyph";
import { cn } from "@/lib/utils";
import { getIcon, isCatalogReady, loadMarkup, suggestIcons } from "@/lib/icon-registry";
import { addRecentSearch, clearRecentSearches, getRecentSearches, POPULAR_SEARCHES } from "@/lib/recent-searches";

export function SearchBar({
  id,
  value,
  onChange,
  onSubmit,
  placeholder = "Search icons, tags, or categories",
  className,
  autoFocus = false,
  size = "md",
}) {
  const tall = size === "lg";
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState([]);
  const [icons, setIcons] = useState([]);
  const iconsReady = useRef(false);

  useEffect(() => {
    if (open) setRecent(getRecentSearches());
  }, [open, value]);

  useEffect(() => {
    const q = value.trim();
    if (!open || !q || !isCatalogReady()) {
      setIcons([]);
      return undefined;
    }
    let cancel = false;
    const timer = window.setTimeout(() => {
      suggestIcons(q, 6).then(async (stubs) => {
        if (cancel) return;
        await loadMarkup(stubs.map((icon) => icon.id));
        if (!cancel) {
          iconsReady.current = true;
          setIcons(stubs.map((icon) => getIcon(icon.id)).filter((icon) => icon?.markup));
        }
      });
    }, 140);
    return () => {
      cancel = true;
      window.clearTimeout(timer);
    };
  }, [value, open]);

  useEffect(() => {
    function onDoc(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const q = value.trim();
  const recents = recent.filter((item) => item.toLowerCase() !== q.toLowerCase());
  const popular = POPULAR_SEARCHES.filter(
    (item) => !q || item.includes(q.toLowerCase()) || q.toLowerCase().includes(item),
  ).slice(0, 5);
  const suggestions = q ? [] : recents.slice(0, 5);
  const totalRows = suggestions.length + popular.length + icons.length;

  function pick(text) {
    addRecentSearch(text);
    onChange(text);
    onSubmit?.(text);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (!open || !totalRows) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % totalRows);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i <= 0 ? totalRows - 1 : i - 1));
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      const idx = active;
      if (idx < suggestions.length) pick(suggestions[idx]);
      else if (idx < suggestions.length + popular.length) pick(popular[idx - suggestions.length]);
      else {
        const icon = icons[idx - suggestions.length - popular.length];
        if (icon) {
          addRecentSearch(q);
          setOpen(false);
          navigate({ to: "/icons/$iconId", params: { iconId: icon.id } });
        }
      }
    }
  }

  let row = -1;
  const rowClass = (i) =>
    cn("flex w-full items-center gap-3 px-3 py-2 text-left text-sm", i === active && "bg-accent");

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          addRecentSearch(value);
          onSubmit?.(value);
          setOpen(false);
        }}
      >
        <label htmlFor={id} className="sr-only">
          Search icons
        </label>
        <span className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground", tall ? "left-4" : "left-3")}>
          <svg viewBox="0 0 24 24" width={tall ? 20 : 18} height={tall ? 20 : 18} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16.5 20 20.5" />
          </svg>
        </span>
        <input
          id={id}
          data-search-input=""
          value={value}
          autoFocus={autoFocus}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          role="combobox"
          aria-expanded={open && totalRows > 0}
          aria-controls={`${id}-suggestions`}
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          className={cn(
            "w-full rounded-lg border border-border bg-card text-foreground shadow-border outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring",
            tall ? "h-12 pr-24 pl-11 text-base" : "h-11 pr-20 pl-10 text-sm",
          )}
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
          {value ? (
            <button
              type="button"
              className="rounded-sm px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => {
                onChange("");
                setOpen(true);
              }}
            >
              Clear
            </button>
          ) : (
            <kbd className="hidden rounded-sm border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:inline">
              /
            </kbd>
          )}
        </div>
      </form>

      {open && totalRows > 0 ? (
        <div
          id={`${id}-suggestions`}
          role="listbox"
          className="absolute top-full right-0 left-0 z-40 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          {suggestions.length ? (
            <>
              <p className="px-3 pt-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Recent</p>
              {suggestions.map((item, i) => {
                row += 1;
                const idx = row;
                return (
                  <button key={item} id={`${id}-opt-${idx}`} type="button" role="option" aria-selected={idx === active} className={rowClass(idx)}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => pick(item)}>
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                      <circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" />
                    </svg>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
              <button type="button" className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => { clearRecentSearches(); setRecent([]); }}>
                Clear recent searches
              </button>
            </>
          ) : null}
          {popular.length ? (
            <>
              <p className="px-3 pt-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{q ? "Popular" : "Popular searches"}</p>
              {popular.map((item) => {
                row += 1;
                const idx = row;
                return (
                  <button key={item} id={`${id}-opt-${idx}`} type="button" role="option" aria-selected={idx === active} className={rowClass(idx)}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => pick(item)}>
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1M7.7 16.3l-2.1 2.1" />
                    </svg>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </>
          ) : null}
          {icons.length ? (
            <>
              <p className="px-3 pt-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Icons</p>
              {icons.map((icon, i) => {
                row += 1;
                const idx = row;
                return (
                  <Link key={icon.id} id={`${id}-opt-${idx}`} role="option" aria-selected={idx === active}
                    to="/icons/$iconId" params={{ iconId: icon.id }}
                    className={rowClass(idx)}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => { addRecentSearch(q); setOpen(false); }}>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                      <IconGlyph icon={icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{icon.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{icon.pack}</span>
                    </span>
                  </Link>
                );
              })}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
