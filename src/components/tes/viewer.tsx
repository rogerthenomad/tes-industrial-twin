import { lazy, Suspense, useEffect, useState } from "react";
import { Hud, StageFallback } from "@/components/tes/hud";
import type { SceneId } from "@/lib/tes/store";
import { useTes } from "@/lib/tes/store";

const Studio = lazy(() => import("@/components/tes/studio"));

export function Viewer({ scene }: { scene: SceneId }) {
  const setScene = useTes((s) => s.setScene);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  useEffect(() => setScene(scene), [scene, setScene]);
  return (
    <Hud>
      {ready ? (
        <Suspense fallback={<StageFallback />}>
          <Studio />
        </Suspense>
      ) : (
        <StageFallback />
      )}
    </Hud>
  );
}
