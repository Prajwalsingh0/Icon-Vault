import { createFileRoute } from "@tanstack/react-router";
import { ComparePage } from "@/components/pages/ComparePage";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
  head: () => ({
    meta: [{ title: "Compare — IconVault" }],
  }),
});
