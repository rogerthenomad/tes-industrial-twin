import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ConceptTwin, type TwinView } from "@/components/tes/concept-twin";

export const Route = createFileRoute("/concept")({
  component: ConceptPage,
  head: () => ({ meta: [{ title: "TES Concept Twin | Civis Tech Global" }] }),
});

function ConceptPage() {
  const [view, setView] = useState<TwinView>("front");
  return (
    <div className="twin">
      <header className="twin-bar">
        <div>
          <strong>TES</strong>
          <span>Trinium Energy System</span>
        </div>
        <nav>
          <button type="button" data-on={view === "front"} onClick={() => setView("front")}>
            Front view
          </button>
          <button type="button" data-on={view === "back"} onClick={() => setView("back")}>
            Back view
          </button>
        </nav>
      </header>
      <ConceptTwin view={view} />
    </div>
  );
}
