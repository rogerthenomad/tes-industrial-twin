import { create } from "zustand";

export type SceneId = "standard" | "micro" | "stack";
export type ViewId = "front" | "back" | "iso" | "top" | "bank";
export type Audience = "doe" | "engineering";
export type FlowId = "off" | "power" | "water" | "fuel" | "carbon" | "oxygen" | "thermal";
export type Quality = "high" | "balanced";
export type LightId = "studio" | "facility";

type TesState = {
  scene: SceneId;
  view: ViewId;
  audience: Audience;
  flow: FlowId;
  explode: number;
  selected: string;
  isolatedHub: number | null;
  quality: Quality;
  light: LightId;
  xray: boolean;
  roofOff: boolean;
  present: boolean;
  frame: number;
  panelOpen: boolean;
  manual: boolean;
  stick: { x: number; y: number; zoom: number; yaw: number };
  setScene: (scene: SceneId) => void;
  setView: (view: ViewId) => void;
  setAudience: (audience: Audience) => void;
  setFlow: (flow: FlowId) => void;
  setExplode: (explode: number) => void;
  setSelected: (selected: string) => void;
  setIsolatedHub: (isolatedHub: number | null) => void;
  setQuality: (quality: Quality) => void;
  setLight: (light: LightId) => void;
  setXray: (xray: boolean) => void;
  setRoofOff: (roofOff: boolean) => void;
  setPresent: (present: boolean) => void;
  nudgeFrame: () => void;
  setPanelOpen: (panelOpen: boolean) => void;
  setStick: (stick: { x: number; y: number; zoom: number; yaw: number }) => void;
  clearStick: () => void;
};

export const useTes = create<TesState>((set) => ({
  scene: "standard",
  view: "front",
  audience: "doe",
  flow: "off",
  explode: 0,
  selected: "overview",
  isolatedHub: null,
  quality: "high",
  light: "facility",
  xray: false,
  roofOff: false,
  present: false,
  frame: 0,
  panelOpen: true,
  manual: false,
  stick: { x: 0, y: 0, zoom: 0, yaw: 0 },
  setScene: (scene) =>
    set({
      scene,
      selected: "overview",
      isolatedHub: null,
      explode: 0,
      view: scene === "micro" ? "iso" : "front",
      flow: "off",
    }),
  setView: (view) => set({ view }),
  setAudience: (audience) => set({ audience }),
  setFlow: (flow) => set({ flow }),
  setExplode: (explode) => set({ explode }),
  setSelected: (selected) => set({ selected, panelOpen: true }),
  setIsolatedHub: (isolatedHub) => set({ isolatedHub }),
  setQuality: (quality) => set({ quality }),
  setLight: (light) => set({ light }),
  setXray: (xray) => set({ xray }),
  setRoofOff: (roofOff) => set({ roofOff }),
  setPresent: (present) => set({ present }),
  nudgeFrame: () => set((state) => ({ frame: state.frame + 1 })),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setStick: (stick) => set({ stick, manual: true }),
  clearStick: () => set({ stick: { x: 0, y: 0, zoom: 0, yaw: 0 } }),
}));
