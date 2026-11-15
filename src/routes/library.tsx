import { createFileRoute } from "@tanstack/react-router";
import { LibraryPage } from "@/components/pages/LibraryPage";
import { parseLibrarySearch } from "@/lib/library-search";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
  validateSearch: parseLibrarySearch,
  head: () => ({
    meta: [{ title: "Library — IconVault" }],
  }),
});
