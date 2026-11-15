import { createFileRoute } from "@tanstack/react-router";
import { FavoritesPage } from "@/components/pages/FavoritesPage";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  head: () => ({
    meta: [{ title: "Favorites — IconVault" }],
  }),
});
