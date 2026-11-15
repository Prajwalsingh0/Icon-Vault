import { createFileRoute } from "@tanstack/react-router";
import { CollectionsPage } from "@/components/pages/CollectionsPage";

export const Route = createFileRoute("/collections/")({
  component: CollectionsPage,
  head: () => ({
    meta: [{ title: "Collections — IconVault" }],
  }),
});
