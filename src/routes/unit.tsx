import { createFileRoute } from "@tanstack/react-router";
import { Viewer } from "@/components/tes/viewer";

export const Route = createFileRoute("/unit")({
  component: UnitPage,
  head: () => ({ meta: [{ title: "TES Unit | Civis Tech Global" }] }),
});

function UnitPage() {
  return <Viewer scene="standard" />;
}
