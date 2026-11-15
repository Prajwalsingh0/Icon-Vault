import { createFileRoute } from "@tanstack/react-router";
import { CollectionDetailPage } from "@/components/pages/CollectionDetailPage";

export const Route = createFileRoute("/collections/$slug")({
  component: CollectionRoute,
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — IconVault` }],
  }),
});

function CollectionRoute() {
  const { slug } = Route.useParams();
  return <CollectionDetailPage slug={slug} />;
}
