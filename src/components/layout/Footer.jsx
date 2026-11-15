// @ts-nocheck
import { Link } from "@tanstack/react-router";
import { iconCount, packs } from "@/data/packs";
import { categoryCounts } from "@/data/stats";
import { librarySearch } from "@/lib/library-search";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div>
          <p className="font-medium">IconVault</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            A searchable catalog of open-source SVG icons. Preview, tune, and copy them into your own UI.
          </p>
        </div>
        <FooterCol title="Library">
          <Link to="/library" search={librarySearch({})}>Browse all</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/packs">Packs</Link>
        </FooterCol>
        <FooterCol title="Product">
          <Link to="/collections">Collections</Link>
          <Link to="/docs">Catalog notes</Link>
          <Link to="/credits">Credits</Link>
          <Link to="/licenses">Licenses</Link>
        </FooterCol>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Catalog</p>
          <dl className="mt-3 space-y-1 font-mono text-sm tabular-nums">
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Icons</dt><dd>{iconCount.toLocaleString("en-US")}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Packs</dt><dd>{packs.length}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Categories</dt><dd>{Object.keys(categoryCounts).length}</dd></div>
          </dl>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground lg:px-6">
          Icons remain under their upstream licenses. <Link to="/licenses" className="underline-offset-4 hover:underline">Credits & licenses</Link>
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
      <div className="mt-3 flex flex-col gap-2 text-sm [&_a]:w-fit [&_a]:text-foreground/80 [&_a]:hover:text-foreground">{children}</div>
    </div>
  );
}