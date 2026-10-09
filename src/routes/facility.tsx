import { createFileRoute } from "@tanstack/react-router";
import { Viewer } from "@/components/tes/viewer";

export const Route = createFileRoute("/facility")({
  component: FacilityPage,
  head: () => ({ meta: [{ title: "TES Facility | Civis Tech Global" }] }),
});

function FacilityPage() {
  return <Viewer scene="micro" />;
}
