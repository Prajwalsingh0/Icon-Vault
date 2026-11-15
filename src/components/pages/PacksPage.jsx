// @ts-nocheck
import { Link } from "@tanstack/react-router";
import { IconGlyph } from "@/components/icons/IconGlyph";
import { Button } from "@/components/ui/button";
import { getIcon, filterIcons, initCatalog, loadMarkup } from "@/lib/icon-registry";
import { packs, styleLabel } from "@/data/packs";
import { firstPartyCollections } from "@/data/first-party";
import { librarySearch } from "@/lib/library-search";
import { useCatalog, useMarkup } from "@/lib/use-catalog";
import { downloadIconsZip } from "@/lib/export-zip";
import { useState } from "react";

export function PacksPage() {
  const { ready } = useCatalog();
  const [busy, setBusy] = useState("");
  const previewIds = packs.flatMap((pack) => pack.preview || []);
  const markupReady = useMarkup(ready ? previewIds : []);

  async function downloadPack(pack) {
    setBusy(pack.id);
    try {
      await initCatalog();
      const members = await filterIcons({ pack: pack.id });
      await loadMarkup(members.map((icon) => icon.id));
      downloadIconsZip(
        `iconvault-${pack.id}.zip`,
        members.map((icon) => getIcon(icon.id)),
        pack,
      );
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Icon packs</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Each pack keeps its original license. Add another pack in the ingest script, then rebuild the catalog. The library, filters, and this page pick it up from the registry.
      </p>
      <div className="mt-8 grid gap-3 lg:grid-cols-2">
        {packs.map((pack) => {
          const members = markupReady ? (pack.preview || []).map((id) => getIcon(id)).filter(Boolean) : [];
          return (
            <article key={pack.id} className="rounded-xl border border-border bg-card p-4 shadow-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{pack.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{pack.description}</p>
                </div>
                <p className="font-mono text-xs text-muted-foreground tabular-nums">{pack.count.toLocaleString("en-US")}</p>
              </div>
              <p className="mt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {(pack.styles || []).map((style) => styleLabel(style)).join(" · ")} · {pack.license}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {members.map((icon) => (
                  <Link
                    key={icon.id}
                    to="/icons/$iconId"
                    params={{ iconId: icon.id }}
                    className="flex size-12 items-center justify-center rounded-md bg-muted"
                    aria-label={icon.name}
                  >
                    <IconGlyph icon={icon} size={22} />
                  </Link>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link to="/library" search={librarySearch({ pack: pack.id })} className="inline-flex h-10 items-center text-sm font-medium underline-offset-4 hover:underline">
                  Open pack
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pack.count === 0}
                  onClick={() => downloadPack(pack)}
                >
                  {busy === pack.id ? "Preparing ZIP…" : "Download ZIP"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      <h2 className="mt-12 text-xl font-semibold tracking-tight">First-party collections</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        These names are reserved for original IconVault artwork. None are published, so they add nothing to the icon count and are not mixed in with third-party packs.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {firstPartyCollections.map((collection) => (
          <li key={collection.id} className="rounded-xl border border-dashed border-border px-4 py-3">
            <p className="font-medium">{collection.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">0 icons</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
