// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodePreview } from "@/components/icons/CodePreview";
import { CopyButton } from "@/components/icons/CopyButton";
import { IconCustomizer } from "@/components/icons/IconCustomizer";
import { IconGrid } from "@/components/icons/IconGrid";
import { IconPreview } from "@/components/icons/IconPreview";
import { categoryLabel } from "@/data/categories";
import { packById, styleLabel } from "@/data/packs";
import { filterIcons, getIcon, randomIconId } from "@/lib/icon-registry";
import { librarySearch } from "@/lib/library-search";
import { useFavorites } from "@/lib/favorites";
import { useCollections } from "@/lib/collections";
import { useCatalog, useMarkup } from "@/lib/use-catalog";
import { buildCss, buildHtml, buildReact, buildSvg, buildVue, downloadPng, downloadText } from "@/lib/snippets";
import { toast } from "sonner";

const initial = {
  size: 64,
  color: "currentColor",
  strokeWidth: 1.75,
  rotate: 0,
  opacity: 1,
  background: "transparent",
  backgroundColor: "#ececea",
  scale: 1,
};

export function IconDetailPage({ iconId }) {
  const { ready, error } = useCatalog();
  const found = ready ? getIcon(iconId) : null;
  const markupReady = useMarkup(found ? [found.id] : []);
  const icon = found && markupReady ? getIcon(iconId) : found;
  const favorites = useFavorites();
  const collections = useCollections();
  const svgRef = useRef(null);
  const [options, setOptions] = useState(initial);

  const snippets = useMemo(() => {
    if (!icon?.markup) return null;
    const opts = {
      size: options.size,
      color: options.color,
      strokeWidth: options.strokeWidth,
      rotate: options.rotate,
      opacity: options.opacity,
    };
    const backgroundValue =
      options.background === "transparent"
        ? "transparent"
        : options.background === "custom"
          ? options.backgroundColor
          : options.background === "inverse"
            ? "var(--foreground)"
            : options.background === "muted"
              ? "var(--muted)"
              : "var(--background)";
    return {
      svg: buildSvg(icon, opts),
      html: buildHtml(icon, opts, backgroundValue),
      react: buildReact(icon, opts),
      vue: buildVue(icon, opts),
      css: buildCss(icon, { size: options.size, color: options.color }),
    };
  }, [icon, options]);

  if (!ready || (found && !markupReady)) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted-foreground lg:px-6">Loading icon…</div>;
  }

  if (error || !icon || !snippets) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Icon not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">That id is not in the current catalog.</p>
        <Link to="/library" search={librarySearch({})} className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Back to the library
        </Link>
      </div>
    );
  }

  const pack = packById(icon.pack);
  const saved = favorites.has(icon.id);

  function patch(partial) {
    setOptions((current) => ({ ...current, ...partial }));
  }

  function exportBackground() {
    if (options.background === "transparent") return "transparent";
    if (options.background === "custom") return options.backgroundColor;
    const probe = document.createElement("div");
    probe.className = options.background === "canvas" ? "bg-background" : options.background === "inverse" ? "bg-foreground" : "bg-muted";
    probe.style.position = "absolute";
    probe.style.left = "-9999px";
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <p className="text-sm text-muted-foreground">
        <Link to="/library" search={librarySearch({ category: icon.category })} className="hover:text-foreground">
          {categoryLabel(icon.category)}
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{icon.name}</span>
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <IconPreview
          icon={icon}
          svgRef={svgRef}
          size={options.size}
          color={options.color}
          strokeWidth={options.strokeWidth}
          rotate={options.rotate}
          opacity={options.opacity}
          background={options.background}
          backgroundColor={options.backgroundColor}
          scale={options.scale}
        />
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{icon.name}</h1>
              <p className="mt-2 max-w-prose text-sm text-muted-foreground">{icon.description}</p>
            </div>
            <Button
              variant={saved ? "default" : "outline"}
              aria-pressed={saved}
              onClick={() => {
                favorites.toggle(icon.id);
                toast.success(saved ? `Removed ${icon.name} from favorites` : `Saved ${icon.name} to favorites`);
              }}
            >
              {saved ? "Favorited" : "Favorite"}
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{categoryLabel(icon.category)}</Badge>
            <Badge>{styleLabel(icon.style)}</Badge>
            <Badge>{pack?.name ?? icon.pack}</Badge>
            {icon.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">License</dt>
              <dd>
                {pack?.licenseUrl ? (
                  <a href={pack.licenseUrl} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                    {pack.licenseName || pack.license}
                  </a>
                ) : (
                  pack?.license
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Source</dt>
              <dd>
                <a href={pack?.source} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                  {pack?.name}
                </a>
                <span className="text-muted-foreground"> · {icon.slug}</span>
              </dd>
            </div>
          </dl>
          {pack?.attributionRequired ? <p className="mt-3 text-sm text-muted-foreground">{pack.attribution}</p> : null}
          {icon.variants?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {icon.variants.map((id) => {
                const other = getIcon(id);
                if (!other) return null;
                return (
                  <Link key={id} to="/icons/$iconId" params={{ iconId: id }} className="inline-flex h-10 items-center rounded-md border border-border px-3 text-sm">
                    {styleLabel(other.style)}
                  </Link>
                );
              })}
            </div>
          ) : null}
          <div className="mt-6 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Customize</h2>
            <button type="button" onClick={() => setOptions(initial)} className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Reset
            </button>
          </div>
          <div className="mt-3">
            <IconCustomizer icon={icon} value={options} onChange={patch} />
          </div>
          <TryAnother icon={icon} />
          <section className="mt-6">
            <h2 className="text-sm font-medium">Your collections</h2>
            {!collections.ready ? (
              <p className="mt-2 text-sm text-muted-foreground">Loading collections…</p>
            ) : collections.items.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                <Link to="/collections" className="underline">
                  Create a collection
                </Link>{" "}
                to group icons on this device.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {collections.items.map((item) => {
                  const checked = item.iconIds.includes(icon.id);
                  return (
                    <li key={item.slug}>
                      <label className="flex min-h-11 items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={checked}
                          onChange={() => collections.toggleIcon(item.slug, icon.id)}
                        />
                        {item.name}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Integration</h2>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={snippets.svg} label="Copy SVG" />
            <CopyButton text={snippets.html} label="Copy HTML" />
            <CopyButton text={snippets.react} label="Copy React" />
            <CopyButton text={snippets.vue} label="Copy Vue" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  downloadText(`${icon.id}.svg`, snippets.svg, "image/svg+xml");
                  toast.success("SVG downloaded");
                } catch {
                  toast.error("Download failed");
                }
              }}
            >
              Download SVG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!svgRef.current) return;
                try {
                  downloadPng(svgRef.current, `${icon.id}.png`, exportBackground());
                  toast.success("PNG downloaded");
                } catch {
                  toast.error("PNG export failed");
                }
              }}
            >
              Download PNG
            </Button>
          </div>
        </div>
        <CodePreview snippets={snippets} />
        <p className="mt-3 text-xs text-muted-foreground">
          Snippets are standalone — paste them into your project. There is no IconVault runtime package to install; each icon is self-contained SVG.
        </p>
      </section>
      <RelatedIcons icon={icon} />
    </div>
  );
}

function TryAnother({ icon }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    const id = randomIconId(icon.id, icon.category);
    if (id) navigate({ to: "/icons/$iconId", params: { iconId: id } });
    setBusy(false);
  }
  return (
    <button
      type="button"
      disabled={busy}
      onClick={go}
      className="mt-4 inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium shadow-border hover:bg-accent disabled:opacity-50"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6" /><path d="M18 3v4h-4M6 21v-4h4" />
      </svg>
      Try another {categoryLabel(icon.category).toLowerCase()} icon
    </button>
  );
}

function RelatedIcons({ icon }) {
  const { ready } = useCatalog();
  const [related, setRelated] = useState([]);
  useEffect(() => {
    if (!ready) return undefined;
    let cancel = false;
    Promise.all([
      filterIcons({ category: icon.category, pack: "all", sort: "name" }),
      filterIcons({ category: "all", pack: icon.pack, sort: "name" }),
    ]).then(([sameCat, samePack]) => {
      if (cancel) return;
      const seen = new Set([icon.id]);
      const picked = [];
      for (const item of [...sameCat.slice(0, 40), ...samePack.slice(0, 40)]) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        picked.push(item);
        if (picked.length >= 12) break;
      }
      setRelated(picked);
    });
    return () => { cancel = true; };
  }, [ready, icon.id, icon.category, icon.pack]);
  const markupReady = useMarkup(related.map((item) => item.id));
  if (!related.length) return null;
  const icons = markupReady ? related.map((item) => getIcon(item.id)).filter(Boolean) : [];
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight">Related icons</h2>
      <p className="mt-1 text-sm text-muted-foreground">Same category and pack, straight from the catalog.</p>
      <div className="mt-4">
        {markupReady ? (
          <IconGrid icons={icons} />
        ) : (
          <IconGrid icons={[]} loading />
        )}
      </div>
    </section>
  );
}
