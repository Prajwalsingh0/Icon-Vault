import { createFileRoute } from "@tanstack/react-router";
import { LicensesPage } from "@/components/pages/LicensesPage";

export const Route = createFileRoute("/licenses")({
  component: LicensesPage,
  head: () => ({
    meta: [{ title: "Credits and licenses — IconVault" }],
  }),
});
