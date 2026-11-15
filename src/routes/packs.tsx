import { createFileRoute } from "@tanstack/react-router";
import { PacksPage } from "@/components/pages/PacksPage";

export const Route = createFileRoute("/packs")({
  component: PacksPage,
  head: () => ({
    meta: [{ title: "Packs — IconVault" }],
  }),
});
