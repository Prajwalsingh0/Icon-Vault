import { createFileRoute } from "@tanstack/react-router";
import { IconDetailPage } from "@/components/pages/IconDetailPage";

export const Route = createFileRoute("/icons/$iconId")({
  component: IconRoute,
  head: ({ params }) => ({
    meta: [{ title: `${params.iconId} — IconVault` }],
  }),
});

function IconRoute() {
  const { iconId } = Route.useParams();
  return <IconDetailPage iconId={iconId} />;
}
