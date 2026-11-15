// @ts-nocheck
import { Link } from "@tanstack/react-router";
import { IconGrid } from "@/components/icons/IconGrid";
import { Button } from "@/components/ui/button";
import { getIcon, loadMarkup } from "@/lib/icon-registry";
import { librarySearch } from "@/lib/library-search";
import { useFavorites } from "@/lib/favorites";
import { useCatalog, useMarkup } from "@/lib/use-catalog";
import { downloadIconsZip } from "@/lib/export-zip";
import { toast } from "sonner";

export function FavoritesPage() {
  const favorites = useFavorites();
  const { ready } = useCatalog();
  const ids = favorites.ids;
  const markupReady = useMarkup(ready ? ids : []);
  const icons = ready && markupReady ? ids.map((id) => getIcon(id)).filter(Boolean) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Favorites</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Saved on this device with local storage. Nothing is sent to an account.
          </p>
        </div>
        {favorites.ready && icons.length ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                downloadIconsZip("iconvault-favorites.zip", icons, {
                  name: "Favorites",
                  description: "Icons saved in this browser.",
                })
              }
            >
              Download ZIP
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                favorites.clear();
                toast.success("All favorites removed");
              }}
            >
              Remove all
            </Button>
          </div>
        ) : null}
      </div>
      <div className="mt-8">
        {!favorites.ready || !ready ? (
          <IconGrid icons={[]} loading />
        ) : icons.length ? (
          <IconGrid icons={icons} />
        ) : (
          <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <p className="text-base font-medium">No favorites yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Star an icon in the library. It will stay here after you refresh.
            </p>
            <Link to="/library" search={librarySearch({})} className="mt-5 inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
              Browse icons
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
