// @ts-nocheck
import { Link } from "@tanstack/react-router";
import { packs, iconCount } from "@/data/packs";

export function CreditsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Credits</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {iconCount.toLocaleString("en-US")} icons are stored in this repository. IconVault did not draw the third-party packs below. Full license text is on the <Link to="/licenses" className="underline">licenses page</Link>.
      </p>
      <ul className="mt-8 space-y-3">
        {packs.map((pack) => (
          <li key={pack.id} className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="font-medium">{pack.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{pack.attribution}</p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">{pack.count.toLocaleString("en-US")} icons · {pack.license}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
