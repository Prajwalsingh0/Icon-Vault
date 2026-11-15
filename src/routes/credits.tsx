import { createFileRoute } from "@tanstack/react-router";
import { CreditsPage } from "@/components/pages/CreditsPage";

export const Route = createFileRoute("/credits")({
  component: CreditsPage,
  head: () => ({ meta: [{ title: "Credits — IconVault" }] }),
});
