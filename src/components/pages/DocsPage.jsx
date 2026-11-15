// @ts-nocheck
import { useEffect, useState } from "react";
import { categories } from "@/data/categories";
import { filterIcons, getIcon, initCatalog, loadMarkup } from "@/lib/icon-registry";
import { buildSvg } from "@/lib/snippets";
import { useCatalog } from "@/lib/use-catalog";

const fieldClass = "h-11 rounded-md border border-border bg-card px-3 outline-none focus:ring-2 focus:ring-ring";

export function DocsPage() {
  const { ready } = useCatalog();
  const [category, setCategory] = useState("programming");
  const [name, setName] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancel = false;
    initCatalog().then(async () => {
      if (cancel) return;
      const typed = name.trim();
      const exact = typed ? getIcon(typed) || getIcon(`lucide-${typed}`) : null;
      const list = exact ? [exact] : (await filterIcons({ q: typed, category: category === "all" ? "all" : category })).slice(0, 8);
      if (list[0]) await loadMarkup([list[0].id]);
      if (!cancel) setRows(list.map((icon) => getIcon(icon.id)));
    });
    return () => {
      cancel = true;
    };
  }, [ready, category, name]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <p className="text-sm font-medium text-muted-foreground">Local catalog</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Use the icons from this repo</h1>
      <p className="mt-3 text-sm text-pretty text-muted-foreground">
        IconVault does not call an icon API. Search runs against metadata shipped in the repository. SVG markup stays in shards and loads only when a result is opened or copied.
      </p>
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Where the files live</h2>
        <ul className="mt-3 space-y-2 font-mono text-sm">
          <li className="rounded-md border border-border bg-card px-3 py-2">src/icon-data/catalog.json</li>
          <li className="rounded-md border border-border bg-card px-3 py-2">src/icon-data/shards/*.json</li>
          <li className="rounded-md border border-border bg-card px-3 py-2">src/icon-data/incoming/</li>
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          Add artwork by dropping JSON records into <span className="font-mono">src/icon-data/incoming/your-pack/</span>, then run <span className="font-mono">npm run icons:compile</span>. <span className="font-mono">npm run dev</span> does not download or rebuild the catalog.
        </p>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Try a local query</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Name or id</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="terminal" className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass}>
              <option value="all">All</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-border bg-card p-4 font-mono text-xs leading-relaxed">
          {JSON.stringify(rows.map((icon) => ({ id: icon.id, name: icon.name, category: icon.category, style: icon.style, pack: icon.pack, license: icon.license })), null, 2)}
        </pre>
        {rows[0]?.markup ? (
          <pre className="mt-3 overflow-auto rounded-xl border border-border bg-card p-4 font-mono text-xs">{buildSvg(rows[0])}</pre>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Open a result from the library to copy a full SVG. This query lists metadata only until a shard is already cached.</p>
        )}
      </section>
    </div>
  );
}
