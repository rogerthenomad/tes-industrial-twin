import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FLOW_HELP, resolveTopic, SCENE_GUIDE, TEARDOWN_PARTS, topicNote } from "@/lib/tes/content";
import type { FlowId, SceneId, ViewId } from "@/lib/tes/store";
import { useTes } from "@/lib/tes/store";

const PATHS = {
  standard: "/unit",
  micro: "/facility",
  stack: "/teardown",
} as const;

const SCENES: { id: SceneId; label: string; title: string }[] = [
  { id: "standard", label: "Unit", title: "Standard 40-foot TES" },
  { id: "micro", label: "Facility", title: "TES microfacility" },
  { id: "stack", label: "Teardown", title: "Labeled hub break-apart" },
];

const VIEWS: Record<SceneId, { id: ViewId; label: string }[]> = {
  standard: [
    { id: "front", label: "Front" },
    { id: "back", label: "Back" },
    { id: "iso", label: "Full" },
    { id: "top", label: "Top" },
  ],
  micro: [
    { id: "iso", label: "Facility" },
    { id: "front", label: "Facade" },
    { id: "bank", label: "One bank" },
    { id: "top", label: "Top" },
  ],
  stack: [
    { id: "front", label: "Front" },
    { id: "iso", label: "Three-quarter" },
    { id: "top", label: "Top" },
  ],
};

const FLOWS: { id: FlowId; label: string }[] = [
  { id: "off", label: "Model" },
  { id: "power", label: "Power path" },
  { id: "water", label: "Water path" },
  { id: "fuel", label: "Fuel path" },
  { id: "carbon", label: "Carbon path" },
  { id: "oxygen", label: "Oxygen path" },
  { id: "thermal", label: "Thermal path" },
];

function stats(scene: SceneId) {
  if (scene === "micro") return "Seven 10-hub banks · illustrative";
  if (scene === "stack") return "25 labeled pieces · control board visible";
  return "150–200 kW · 350–400 gal/day";
}

export function Hud({ children }: { children: React.ReactNode }) {
  const scene = useTes((s) => s.scene);
  const view = useTes((s) => s.view);
  const audience = useTes((s) => s.audience);
  const flow = useTes((s) => s.flow);
  const explode = useTes((s) => s.explode);
  const selected = useTes((s) => s.selected);
  const isolatedHub = useTes((s) => s.isolatedHub);
  const quality = useTes((s) => s.quality);
  const light = useTes((s) => s.light);
  const xray = useTes((s) => s.xray);
  const roofOff = useTes((s) => s.roofOff);
  const present = useTes((s) => s.present);
  const panelOpen = useTes((s) => s.panelOpen);
  const setScene = useTes((s) => s.setScene);
  const navigate = useNavigate();
  const setView = useTes((s) => s.setView);
  const setAudience = useTes((s) => s.setAudience);
  const setFlow = useTes((s) => s.setFlow);
  const setExplode = useTes((s) => s.setExplode);
  const setSelected = useTes((s) => s.setSelected);
  const setIsolatedHub = useTes((s) => s.setIsolatedHub);
  const setQuality = useTes((s) => s.setQuality);
  const setLight = useTes((s) => s.setLight);
  const setXray = useTes((s) => s.setXray);
  const setRoofOff = useTes((s) => s.setRoofOff);
  const setPresent = useTes((s) => s.setPresent);
  const nudgeFrame = useTes((s) => s.nudgeFrame);
  const setPanelOpen = useTes((s) => s.setPanelOpen);
  const setStick = useTes((s) => s.setStick);
  const clearStick = useTes((s) => s.clearStick);
  const [playing, setPlaying] = useState(false);
  const [speech, setSpeech] = useState<"idle" | "playing" | "paused">("idle");
  const [railOpen, setRailOpen] = useState(true);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 800px)").matches;
    if (narrow) {
      setQuality("balanced");
      setPanelOpen(false);
      setRailOpen(false);
    }
  }, [setPanelOpen, setQuality]);

  useEffect(() => {
    if (scene !== "stack") {
      setPlaying(false);
      return;
    }
    setPlaying(true);
  }, [scene]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const next = useTes.getState().explode + dt * 0.28;
      if (next >= 1) {
        useTes.getState().setExplode(1);
        setPlaying(false);
        return;
      }
      useTes.getState().setExplode(next);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const topic = resolveTopic(selected, scene);
  const note = topicNote(topic, audience);
  const hubMatch = /^hub-(\d+)$/.exec(selected);
  const guide = SCENE_GUIDE[scene];

  const showPart = (id: string) => {
    setSelected(id);
    if (scene === "micro") {
      if (id === "overview" || id === "water-zone" || id === "power-zone" || id === "control-room") setView("iso");
      if (id === "bank-0" || id === "fhub-0-0" || id === "electrolyte-tank" || id === "fuel-tank" || id === "battery")
        setView("bank");
      return;
    }
    if (scene !== "standard") return;
    if (id === "electrolyte-tank" || id === "fuel-tank") {
      setView("back");
      return;
    }
    if (["anolyte", "oxygen", "thermal", "condenser", "power", "co2", "safety", "pump"].includes(id)) {
      setAudience("engineering");
      setView("iso");
      return;
    }
    if (id === "overview") setView("front");
  };

  const listen = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `${topic.title}. ${topic.body} Civis Tech Global. www.civistechglobal.com.`,
    );
    utterance.rate = 0.94;
    utterance.onend = () => setSpeech("idle");
    utterance.onerror = () => setSpeech("idle");
    synth.speak(utterance);
    setSpeech("playing");
  };

  const togglePause = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    if (speech === "playing") {
      synth.pause();
      setSpeech("paused");
      return;
    }
    if (speech === "paused") {
      synth.resume();
      setSpeech("playing");
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeech("idle");
  }, [selected, scene, audience]);

  return (
    <div className="studio-root" data-present={present} data-rail={railOpen}>
      {railOpen ? null : (
        <button type="button" className="rail-toggle" onClick={() => setRailOpen(true)}>
          Menu
        </button>
      )}
      <aside className="rail">
        <div className="rail-brand">
          <img src="/brand/civis-mark.svg" alt="" className="mark" />
          <div>
            <strong>CIVIS TECH GLOBAL</strong>
            <a href="https://www.civistechglobal.com/" target="_blank" rel="noreferrer">
              www.civistechglobal.com
            </a>
          </div>
          <button type="button" className="rail-hide" onClick={() => setRailOpen(false)}>
            Hide
          </button>
        </div>
        <nav className="rail-nav" aria-label="Model">
          <Link to="/">Home</Link>
          {SCENES.map((item) => (
            <button
              key={item.id}
              type="button"
              data-on={scene === item.id}
              title={item.title}
              onClick={() => {
                setScene(item.id);
                void navigate({ to: PATHS[item.id] });
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <details open>
          <summary>View</summary>
          <div className="rail-body">
            {VIEWS[scene].map((item) => (
              <button key={item.id} type="button" className="seg" data-on={view === item.id} onClick={() => setView(item.id)}>
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="seg"
              onClick={() => {
                setSelected("overview");
                setFlow("off");
                nudgeFrame();
              }}
            >
              Reset view
            </button>
          </div>
        </details>
        <details open>
          <summary>Display</summary>
          <div className="rail-body">
            <button type="button" className="seg" data-on={audience === "doe"} onClick={() => setAudience("doe")}>
              DOE view
            </button>
            <button type="button" className="seg" data-on={audience === "engineering"} onClick={() => setAudience("engineering")}>
              Engineering
            </button>
            <button type="button" className="seg" data-on={quality === "high"} onClick={() => setQuality(quality === "high" ? "balanced" : "high")}>
              {quality === "high" ? "High detail" : "Lite detail"}
            </button>
            <button type="button" className="seg" data-on={light === "studio"} onClick={() => setLight(light === "studio" ? "facility" : "studio")}>
              {light === "studio" ? "Studio light" : "Facility light"}
            </button>
            <button type="button" className="seg" data-on={xray} onClick={() => setXray(!xray)}>
              {xray ? "X-ray on" : "X-ray"}
            </button>
            {scene === "micro" ? (
              <button type="button" className="seg" data-on={roofOff} onClick={() => setRoofOff(!roofOff)}>
                {roofOff ? "Roof off" : "Remove roof"}
              </button>
            ) : null}
            <button type="button" className="seg" data-on={present} onClick={() => setPresent(!present)}>
              {present ? "Exit present" : "Present"}
            </button>
            <p className="statline">{stats(scene)}</p>
          </div>
        </details>
        <details open>
          <summary>{topic.kicker || "Record"}</summary>
          <div className="rail-body rail-record">
            <h2>{topic.title}</h2>
            <p className="panel-body">{topic.body}</p>
            <div className="chip-row">
              <button type="button" className="seg" data-on={speech === "playing"} onClick={listen}>
                Start
              </button>
              <button type="button" className="seg" data-on={speech === "paused"} disabled={speech === "idle"} onClick={togglePause}>
                {speech === "paused" ? "Resume" : "Pause"}
              </button>
              {selected !== "overview" ? (
                <button type="button" className="seg" onClick={() => showPart("overview")}>
                  Whole system
                </button>
              ) : null}
            </div>
            {note ? <p className="note">{note}</p> : null}
            {guide.length > 0 ? (
              <div className="note">
                <p className="kicker">Systems in this model</p>
                <div className="chip-row">
                  {guide.map((part) => (
                    <button
                      key={part.id}
                      type="button"
                      className="chip"
                      data-on={selected === part.id || (part.id === "hub-0" && Boolean(hubMatch))}
                      onClick={() => showPart(part.id)}
                    >
                      {part.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="note">
              <p className="kicker">Flow overlay</p>
              <div className="chip-row">
                {FLOWS.map((item) => (
                  <button key={item.id} type="button" className="chip" data-on={flow === item.id} onClick={() => setFlow(item.id)}>
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="panel-body mt-2">{FLOW_HELP[flow]}</p>
            </div>
            <label className="note block">
              <span className="kicker">{scene === "stack" ? "Break the hub apart" : "Pull equipment"}</span>
              <input
                className="explode-range"
                type="range"
                min={0}
                max={100}
                value={Math.round(explode * 100)}
                onChange={(e) => {
                  setPlaying(false);
                  setExplode(Number(e.target.value) / 100);
                }}
                aria-label="Explode amount"
              />
            </label>
            {scene === "stack" ? (
              <>
                <button
                  type="button"
                  className="seg"
                  onClick={() => {
                    setExplode(0);
                    setPlaying(true);
                  }}
                >
                  {playing ? "Opening…" : "Replay break-apart"}
                </button>
                <div className="note">
                  <p className="kicker">Every piece</p>
                  <div className="chip-row">
                    {TEARDOWN_PARTS.map((part) => (
                      <button key={part.id} type="button" className="chip" data-on={selected === part.id} onClick={() => setSelected(part.id)}>
                        {part.n} {part.title}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
            {hubMatch ? (
              <button
                type="button"
                className="seg"
                data-on={isolatedHub === Number(hubMatch[1])}
                onClick={() => setIsolatedHub(isolatedHub === Number(hubMatch[1]) ? null : Number(hubMatch[1]))}
              >
                {isolatedHub === Number(hubMatch[1]) ? "Restore hub" : "Isolate this hub"}
              </button>
            ) : null}
            {isolatedHub !== null && !hubMatch ? (
              <button type="button" className="seg" onClick={() => setIsolatedHub(null)}>
                Show all hubs
              </button>
            ) : null}
            <p className="disclaimer">
              Illustrative system model. Preliminary visual representation. Not a fabrication drawing or a released P&ID. Final equipment sizing and layout are project-specific.
            </p>
          </div>
        </details>
      </aside>
      {present ? (
        <button type="button" className="seg present-exit" onClick={() => setPresent(false)}>
          Exit presentation
        </button>
      ) : null}
      <div className="studio-stage">
        <div className="studio-canvas">{children}</div>
        <p className="gesture-hint">Hold an arrow to move the model. Drag still works.</p>
        {scene === "stack" ? (
          <label className="explode-dock">
            <span className="kicker">Break the hub apart</span>
            <input
              className="explode-range"
              type="range"
              min={0}
              max={100}
              value={Math.round(explode * 100)}
              onChange={(e) => {
                setPlaying(false);
                setExplode(Number(e.target.value) / 100);
              }}
              aria-label="Explode amount"
            />
          </label>
        ) : (
          <div className="flow-dock" aria-label="Animated flows">
            <button type="button" data-on={flow === "water"} onClick={() => setFlow(flow === "water" ? "off" : "water")}>
              Water
            </button>
            <button type="button" data-on={flow === "power"} onClick={() => setFlow(flow === "power" ? "off" : "power")}>
              Electricity
            </button>
          </div>
        )}
        <div className="navpad" aria-label="Move the model">
          <button type="button" aria-label="Turn left" {...hold({ x: 0, y: 0, zoom: 0, yaw: 1 }, setStick, clearStick)}>
            ↺
          </button>
          <button type="button" aria-label="Move forward" {...hold({ x: 0, y: 1, zoom: 0, yaw: 0 }, setStick, clearStick)}>
            ↑
          </button>
          <button type="button" aria-label="Turn right" {...hold({ x: 0, y: 0, zoom: 0, yaw: -1 }, setStick, clearStick)}>
            ↻
          </button>
          <button type="button" aria-label="Move left" {...hold({ x: -1, y: 0, zoom: 0, yaw: 0 }, setStick, clearStick)}>
            ←
          </button>
          <button type="button" aria-label="Move closer" {...hold({ x: 0, y: 0, zoom: 1, yaw: 0 }, setStick, clearStick)}>
            +
          </button>
          <button type="button" aria-label="Move right" {...hold({ x: 1, y: 0, zoom: 0, yaw: 0 }, setStick, clearStick)}>
            →
          </button>
          <span />
          <button type="button" aria-label="Move back" {...hold({ x: 0, y: -1, zoom: 0, yaw: 0 }, setStick, clearStick)}>
            ↓
          </button>
          <button type="button" aria-label="Move farther" {...hold({ x: 0, y: 0, zoom: -1, yaw: 0 }, setStick, clearStick)}>
            −
          </button>
        </div>
      </div>
    </div>
  );
}

function hold(
  stick: { x: number; y: number; zoom: number; yaw: number },
  setStick: (stick: { x: number; y: number; zoom: number; yaw: number }) => void,
  clearStick: () => void,
) {
  return {
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setStick(stick);
    },
    onPointerUp: () => clearStick(),
    onPointerCancel: () => clearStick(),
  };
}

export function StageFallback() {
  return (
    <div className="stage-fallback">
      <p className="kicker">Preparing the TES model</p>
    </div>
  );
}
