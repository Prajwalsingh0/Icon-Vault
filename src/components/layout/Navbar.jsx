// @ts-nocheck
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mark } from "@/components/icons/Mark";
import { Button } from "@/components/ui/button";
import { librarySearch } from "@/lib/library-search";
import { useFavorites } from "@/lib/favorites";
import { useCompare } from "@/lib/compare";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const links = [
  { to: "/library", label: "Library", fuzzy: true },
  { to: "/collections", label: "Collections", fuzzy: true },
  { to: "/packs", label: "Packs", fuzzy: false },
  { to: "/favorites", label: "Favorites", fuzzy: false },
  { to: "/compare", label: "Compare", fuzzy: false },
  { to: "/docs", label: "Docs", fuzzy: false },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const favorites = useFavorites();
  const compare = useCompare();
  const { theme, cycle, ready } = useTheme();
  const themeLabel = theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight" onClick={() => setOpen(false)}>
          <Mark />
          <span>IconVault</span>
        </Link>
        <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} {...link} />
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/compare"
            className="hidden h-10 items-center rounded-md px-3 text-sm text-muted-foreground tabular-nums hover:text-foreground sm:inline-flex"
            aria-label={`${compare.count} icons in comparison`}
          >
            {compare.count}/4 compare
          </Link>
          <Link
            to="/favorites"
            className="hidden h-10 items-center rounded-md px-3 text-sm text-muted-foreground tabular-nums hover:text-foreground sm:inline-flex"
            aria-label={`${favorites.count} favorites`}
          >
            {favorites.count} saved
          </Link>
          <Button variant="ghost" size="icon" aria-label={`Theme is ${themeLabel}. Change theme.`} onClick={cycle} disabled={!ready}>
            <ThemeGlyph theme={ready ? theme : "system"} />
          </Button>
          <Link to="/library" search={librarySearch({ sort: "recent" })} className="hidden h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground sm:inline-flex">
            Browse icons
          </Link>
          <Button variant="outline" size="icon" className="lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>
            <MenuGlyph open={open} />
          </Button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border px-4 py-3 lg:hidden">
          <div className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                search={link.to === "/library" ? librarySearch({}) : undefined}
                onClick={() => setOpen(false)}
                className="flex h-11 items-center rounded-md px-2 text-base"
                activeProps={{ className: "bg-accent" }}
              >
                {link.label}
                {link.to === "/favorites" ? <span className="ml-auto font-mono text-xs tabular-nums">{favorites.count}</span> : null}
                {link.to === "/compare" ? <span className="ml-auto font-mono text-xs tabular-nums">{compare.count}/4</span> : null}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function NavLink({ to, label, fuzzy }) {
  return (
    <Link
      to={to}
      search={to === "/library" ? librarySearch({}) : undefined}
      activeOptions={{ exact: !fuzzy }}
      className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
      activeProps={{ className: "bg-accent text-foreground" }}
    >
      {label}
    </Link>
  );
}

function ThemeGlyph({ theme }) {
  if (theme === "dark") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M16 14.8A6.4 6.4 0 0 1 9.2 6 6.6 6.6 0 1 0 16 14.8z" />
      </svg>
    );
  }
  if (theme === "light") {
    return (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 4v1.8M12 18.2V20M4 12h1.8M18.2 12H20M6.4 6.4l1.3 1.3M16.3 16.3l1.3 1.3M17.6 6.4l-1.3 1.3M7.7 16.3 6.4 17.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="4" y="5" width="16" height="11" rx="1.5" />
      <path d="M9 19.5h6M12 16v3.5" />
    </svg>
  );
}

function MenuGlyph({ open }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4")} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}
