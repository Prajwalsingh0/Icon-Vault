// @ts-nocheck
import { packs } from "@/data/packs";
import { iconCount } from "@/data/packs";

const excluded = [
  {
    name: "Remix Icon",
    reason: "Remix Icon License v1.0 forbids using the icons to create a competing icon library. IconVault is that kind of product, so the pack was not imported.",
  },
  {
    name: "Feather",
    reason: "Lucide already includes the Feather-derived artwork. Importing both would duplicate those icons.",
  },
  {
    name: "Heroicons mini and micro",
    reason: "They repeat the 24px outline and solid drawings on a smaller grid.",
  },
  {
    name: "Phosphor thin, light, and bold",
    reason: "Stroke-weight repeats of the regular drawings. Regular, fill, and duotone are included.",
  },
  {
    name: "Font Awesome Free",
    reason: "CC BY 4.0 would allow redistribution with attribution. It was left out because the catalog was already large enough, and its brand marks overlap Simple Icons.",
  },
  {
    name: "Material Symbols and Material Design Icons",
    reason: "Apache 2.0 would allow redistribution. They were left out to avoid thousands of extra weight variants and overlapping concepts.",
  },
];

export function LicensesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Credits and licenses</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        IconVault ships {iconCount.toLocaleString("en-US")} icons imported from the packs below. The count is the number of SVG files that survived import and exact-duplicate removal. IconVault does not claim authorship of these drawings.
      </p>
      <div className="mt-8 space-y-4">
        {packs.map((pack) => (
          <article key={pack.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">{pack.name}</h2>
              <p className="font-mono text-xs text-muted-foreground tabular-nums">{pack.count.toLocaleString("en-US")} icons</p>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="grid gap-1 sm:grid-cols-[8rem_1fr]">
                <dt className="text-muted-foreground">License</dt>
                <dd>
                  <a href={pack.licenseUrl} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                    {pack.licenseName}
                  </a>
                </dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[8rem_1fr]">
                <dt className="text-muted-foreground">Source</dt>
                <dd>
                  <a href={pack.source} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                    {pack.source.replace("https://", "")}
                  </a>
                </dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[8rem_1fr]">
                <dt className="text-muted-foreground">Website</dt>
                <dd>
                  <a href={pack.website} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                    {pack.website.replace("https://", "")}
                  </a>
                </dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[8rem_1fr]">
                <dt className="text-muted-foreground">Attribution</dt>
                <dd>{pack.attribution}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <h2 className="mt-10 text-xl font-semibold tracking-tight">Not included</h2>
      <ul className="mt-3 space-y-3">
        {excluded.map((item) => (
          <li key={item.name} className="rounded-xl border border-border px-4 py-3 text-sm">
            <p className="font-medium">{item.name}</p>
            <p className="mt-1 text-muted-foreground">{item.reason}</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 text-xl font-semibold tracking-tight">Add a pack</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Confirm the license allows redistribution inside an icon library. Put records in <code className="font-mono text-xs">src/icon-data/incoming/your-pack/</code> and run <code className="font-mono text-xs">npm run icons:compile</code>. The app reads only those local files. It does not download a dataset at startup.
      </p>
    </div>
  );
}
