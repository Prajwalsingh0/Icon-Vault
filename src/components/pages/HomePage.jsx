// @ts-nocheck
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CollectionCard } from "@/components/icons/CollectionCard";
import { IconGlyph } from "@/components/icons/IconGlyph";
import { SearchBar } from "@/components/icons/SearchBar";
import { categories } from "@/data/categories";
import { collections } from "@/data/collections";
import { iconCount, packs, styles } from "@/data/packs";
import { categoryCounts, styleCounts } from "@/data/stats";
import { showcase } from "@/data/showcase";
import { librarySearch } from "@/lib/library-search";

export function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const popular = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const publishedStyles = styles.filter((style) => (styleCounts[style.id] || 0) > 0).length;
  const headline = iconCount >= 100000 ? "100,000+ icons. One developer library." : `${iconCount.toLocaleString("en-US")} icons. One developer library.`;
  const samples = showcase.slice(0, 8);

  function go(value = query) {
    navigate({ to: "/library", search: librarySearch({ q: value.trim(), sort: value.trim() ? "name" : "name" }) });
  }

  return (
    <div>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:px-6 lg:py-20">
        <div>
          <p className="text-sm font-medium text-muted-foreground">SVG library for product teams</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            Search the local catalog, tune size and color, then copy SVG, HTML, React, or Vue. Nothing is fetched from an icon CDN.
          </p>
          <SearchBar id="home-search" value={query} onChange={setQuery} onSubmit={go} size="lg" className="mt-8 max-w-xl" />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => go()} className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
              Explore the library
            </button>
            <Link to="/licenses" className="inline-flex h-11 items-center rounded-md border border-border bg-card px-4 text-sm font-medium shadow-border">
              Credits and licenses
            </Link>
          </div>
          <dl className="mt-8 flex gap-6 font-mono text-sm tabular-nums text-muted-foreground">
            <div><dt className="text-xs uppercase tracking-wide">Icons</dt><dd className="mt-1 text-foreground">{iconCount.toLocaleString("en-US")}</dd></div>
            <div><dt className="text-xs uppercase tracking-wide">Packs</dt><dd className="mt-1 text-foreground">{packs.length}</dd></div>
            <div><dt className="text-xs uppercase tracking-wide">Categories</dt><dd className="mt-1 text-foreground">{Object.keys(categoryCounts).length}</dd></div>
            <div><dt className="text-xs uppercase tracking-wide">Styles</dt><dd className="mt-1 text-foreground">{publishedStyles}</dd></div>
          </dl>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 shadow-border">
          <div className="mb-3 flex items-center justify-between px-2 pt-1">
            <p className="text-sm font-medium">Specimen</p>
            <p className="font-mono text-xs text-muted-foreground">Open source</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {showcase.map((icon) => (
              <Link
                key={icon.id}
                to="/icons/$iconId"
                params={{ iconId: icon.id }}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg bg-muted text-foreground hover:bg-accent"
              >
                <IconGlyph icon={icon} size={28} />
                <span className="max-w-full truncate px-2 text-xs text-muted-foreground">{icon.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 lg:px-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Popular categories</h2>
          <Link to="/library" search={librarySearch({})} className="text-sm text-muted-foreground hover:text-foreground">
            All categories
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {popular.map(([id, count]) => {
            const category = categories.find((item) => item.id === id);
            return (
              <Link
                key={id}
                to="/library"
                search={librarySearch({ category: id })}
                className="rounded-xl border border-border bg-card px-4 py-4 shadow-border transition-[box-shadow] duration-150 hover:shadow-border-hover"
              >
                <p className="text-sm font-medium">{category?.label || id}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground tabular-nums">{count.toLocaleString("en-US")} icons</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 lg:px-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Featured collections</h2>
          <Link to="/collections" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.slice(0, 6).map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Start with these</h2>
          <Link to="/library" search={librarySearch({})} className="text-sm text-muted-foreground hover:text-foreground">
            Browse the library
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {samples.map((icon) => (
            <Link
              key={icon.id}
              to="/icons/$iconId"
              params={{ iconId: icon.id }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-border hover:shadow-border-hover"
            >
              <span className="flex size-11 items-center justify-center rounded-md bg-muted">
                <IconGlyph icon={icon} size={22} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{icon.name}</span>
                <span className="block truncate font-mono text-xs text-muted-foreground">{icon.pack}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
