import { createFileRoute } from "@tanstack/react-router";
import { Viewer } from "@/components/tes/viewer";

export const Route = createFileRoute("/teardown")({
  component: TeardownPage,
  head: () => ({ meta: [{ title: "TES Teardown | Civis Tech Global" }] }),
});

function TeardownPage() {
  return <Viewer scene="stack" />;
}
