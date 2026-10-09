import type { Audience, FlowId, SceneId } from "@/lib/tes/store";

export type Topic = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  engineering?: string;
};

export const TOPICS: Record<string, Topic> = {
  overview: {
    id: "overview",
    kicker: "Standard TES · 40 ft",
    title: "Four hubs, shared inventories",
    body: "A modular, containerized, drop-and-go energy platform for reliable power, recoverable water, and CO2 utilization. One Standard TES unit targets 150 to 200 kW net power and 350 to 400 gallons per day of recoverable water. Four hubs share the fuel and electrolyte tanks. The battery covers startup and transients. It is not the energy product.",
    engineering:
      "Full interior shows both long walls at once: hubs and power equipment on one side, stacked fuel and electrolyte tanks on the other. Pipe runs are representative. Released CAD overrides this geometry.",
  },
  hub: {
    id: "hub",
    kicker: "Repeatable module",
    title: "Hub",
    body: "A repeatable TES module with the primary conversion and power equipment: one electrochemical reactor and one fuel cell, plus local valves and sensors. Isolate any hub and the other three stay available. Hubs do not have to run in lockstep.",
    engineering:
      "Frame clearance is there for plate, gasket, and sensor access. Local junction boxes stand in for hub I/O. Final stack height is not frozen to this model.",
  },
  ecr: {
    id: "ecr",
    kicker: "Regeneration",
    title: "Electrochemical reactor",
    body: "The electrochemical reactor receives the managed electrolyte and produces the liquid fuel used by TES. A controlled CO2 feed joins that regeneration path. Regeneration is batched. The reactor is not drawn as permanently rate-matched to the fuel cell.",
    engineering:
      "Cathode and anode ports stay separate. The anode liquid is the dedicated anolyte loop and does not tie into fuel or electrolyte storage. Open the stack scene for a representative plate explode.",
  },
  "fuel-cell": {
    id: "fuel-cell",
    kicker: "Power and water",
    title: "Fuel cell",
    body: "The fuel cell electrochemically converts TES liquid fuel into electricity and recoverable water. Carbon-bearing liquid returns to electrolyte storage. Water leaves with the cathode exhaust. It is not drained out of the fuel tank.",
    engineering:
      "Liquid fuel and oxygen gas use separate manifolds. Product water is condensed outside the stack. Terminals feed the DC collection path.",
  },
  "fuel-tank": {
    id: "fuel-tank",
    kicker: "TK-101",
    title: "Liquid fuel storage",
    body: "The liquid fuel storage tank holds TES liquid fuel for the fuel cells and accepts regenerated fuel, so power generation and regeneration do not have to happen at the same time.",
    engineering:
      "One tank for the container, with feed and return for every hub, plus level, temperature, and sample points. Nozzle locations are illustrative.",
  },
  "electrolyte-tank": {
    id: "electrolyte-tank",
    kicker: "TK-102",
    title: "Electrolyte storage",
    body: "The electrolyte storage tank holds the working fluid for the electrochemical reactor, including water, dissolved CO2, and the managed chemical blend. It stays separate from liquid fuel storage, and it is not the customer water supply.",
    engineering:
      "Controlled feed leaves toward the reactor cathode side. A slipstream can be shown in richer views. Do not combine this vessel with TK-101.",
  },
  trim: {
    id: "trim",
    kicker: "Continuity",
    title: "Trim and reserve",
    body: "The trim reservoir holds concentrated chemical stock used to correct chemistry drift and keep the managed electrolyte in range. A protected fuel-continuity reserve can share this compact module. Concentrate is metered before it enters a main tank. Recipes are not shown.",
    engineering:
      "Two duties can live in one compact module: chemistry trim, and fuel-continuity reserve, each with its own metering path. Recipes and setpoints are not shown.",
  },
  battery: {
    id: "battery",
    kicker: "DC buffer",
    title: "Onboard battery",
    body: "The onboard battery supports startup and critical auxiliary loads, short transients, regeneration windows, and output smoothing. The fuel cells make the exported energy. This cabinet is not a grid-scale battery.",
  },
  ems: {
    id: "ems",
    kicker: "Supervision",
    title: "AI / energy management",
    body: "The AI-enabled energy management system monitors conditions, coordinates subsystems, manages operating states and power demand, and helps keep performance efficient and safe. Safety trips stay with the deterministic controller. The supervisory layer does not override a hard interlock.",
    engineering:
      "Cabinet stands in for PLC, safety controller, I/O, historian, and an edge computer. The screen is a status mock, not a live plant HMI.",
  },
  water: {
    id: "water",
    kicker: "Recovery",
    title: "Water outlet manifold",
    body: "The water outlet manifold collects recoverable water from the system and routes it for external collection and use. That water comes from fuel-cell cathode exhaust, not from draining the electrolyte tanks. It is not labeled potable.",
    engineering:
      "Condenser, collection, polishing, and quality points sit upstream of this manifold when the richer interior is on. Two destinations exist in the architecture: export, and a limited internal reconstitution use.",
  },
  anolyte: {
    id: "anolyte",
    kicker: "Isolated loop",
    title: "Dedicated reactor anolyte",
    body: "A closed liquid circuit for the reactor only, with its own reservoir and gas disengagement. This liquid is not routed into fuel storage or the electrolyte tank.",
    engineering:
      "Only conditioned gas may leave the anolyte boundary. Reservoir volume and shared-versus-per-hub layout are still design variables.",
  },
  oxygen: {
    id: "oxygen",
    kicker: "Cathode supply",
    title: "Oxygen support",
    body: "Filters ambient air, enriches it, and feeds the fuel-cell cathodes through a header. This is a compact membrane skid, not stored cryogenic oxygen and not a large air-separation plant.",
    engineering:
      "Reactor oxygen may join the header only after conditioning, and only when quality and timing allow. It is not drawn as a guaranteed full-time supply. Isolation valves let a path be serviced.",
  },
  thermal: {
    id: "thermal",
    kicker: "Heat rejection",
    title: "Thermal management",
    body: "A moderate-temperature coolant loop keeps stacks and selected power equipment in range, then rejects heat. No large chiller is part of this concept.",
    engineering:
      "Supply and return can be isolated per hub. Any heat-reuse branch is secondary and is not required for the overview.",
  },
  power: {
    id: "power",
    kicker: "Export boundary",
    title: "Power collection",
    body: "Fuel-cell DC is collected, buffered with the onboard battery, used for internal loads and regeneration, then converted at the export boundary. Voltage and grid package are project-specific and are not invented here.",
  },
  condenser: {
    id: "condenser",
    kicker: "Water train",
    title: "Water recovery",
    body: "Cools and separates water from fuel-cell cathode exhaust before polishing and the outlet manifold. The electrolyte tanks are not the source of this water.",
  },
  co2: {
    id: "co2",
    kicker: "Carbon feed",
    title: "CO2 delivery",
    body: "A controlled carbon-dioxide feed joins the reactor cathode side during regeneration, with valves and flow monitoring. Rates, pressures, and sequencing are not shown.",
    engineering:
      "The line is a functional connection, not a released nozzle or a control narrative. Gas handling stays low-pressure and serviceable.",
  },
  safety: {
    id: "safety",
    kicker: "Protection",
    title: "Safety and isolation",
    body: "E-stops, ventilation, and hub isolation are part of the layout so a person can stop or service equipment without exposing proprietary controls. Hard trips stay with the safety system. This model is not a hazard study or a code drawing.",
    engineering:
      "Relief, gas detection, containment, and electrical disconnects are implied by placement. Final fire, ventilation, and pressure-safety layout needs formal review.",
  },
  "micro-overview": {
    id: "micro-overview",
    kicker: "Microfacility · 4 MW example",
    title: "Banks, not containers",
    body: "The TES Industrial Facility places repeated 10-hub banks in one process hall, with water handling, power conversion, and operations along a side wing. This view shows seven banks inside a 120 by 100 foot building. That count is a presentation choice, not a fixed plant size. The example shown is about 4 MW and about 9,200+ gallons per day. The product starts at 1 MW and above, at about 2,300+ gallons per day per MW. It is not a row of shipping containers.",
    engineering:
      "Shared headers are segmented so a hub or a bank can be isolated. Corridors carry pipe and cable trays. Drill path: facility, bank, hub, stack.",
  },
  bank: {
    id: "bank",
    kicker: "Ten hubs",
    title: "Bank",
    body: "Each TES bank contains ten hubs on larger shared electrolyte and liquid fuel storage, with bank-level piping, a battery, and an isolation point. Walkways stay open for service.",
    engineering:
      "Stacked tanks are shared by the row. Headers branch to each hub. Electrically driven shunt paths in conductive liquid are a reason the headers are segmented, not one plant-wide manifold.",
  },
  "water-zone": {
    id: "water-zone",
    kicker: "Facility zone",
    title: "Water storage and handling",
    body: "This area collects recoverable water from the Microfacility and routes it for external use. The planning picture is 2,300+ gallons per day per MW, about 9,200+ gallons per day in this 4 MW example, subject to validation and the site.",
  },
  "power-zone": {
    id: "power-zone",
    kicker: "Facility zone",
    title: "Power collection and conversion",
    body: "This area combines, conditions, and manages electrical output from the TES banks for the site load. Hub DC also supports internal loads and regeneration. Inverter and grid hardware stay project-specific.",
  },
  "control-room": {
    id: "control-room",
    kicker: "Facility zone",
    title: "Operations and AI supervision",
    body: "The AI-enabled energy management system coordinates the banks and supporting systems, monitors conditions, manages states and power demand, and helps keep the facility efficient and safe. Hard trips remain with the deterministic safety system.",
  },
  "stack-overview": {
    id: "stack-overview",
    kicker: "Labeled teardown",
    title: "Hub break-apart",
    body: "One hub opens the way a product teardown does. The cover lifts on a straight axis, then the control board, both stacks, and the hardware around them hold in an aligned exploded layout. Every piece is numbered. Drag the slider or press Break apart. This is a teaching model, not a fabrication drawing.",
    engineering:
      "Plate order follows the modeling reference: end plate, flow field, electrode, membrane, and the matching fuel-cell faces. The board is a representative hub I/O card. Channel geometry, catalyst identity, and the real netlist are not shown.",
  },
  "ecr-end": {
    id: "ecr-end",
    kicker: "Reactor stack",
    title: "End plate",
    body: "Rigid plate and compression hardware clamp the cell repeat. Tie rods in this view are schematic.",
  },
  "ecr-flow": {
    id: "ecr-flow",
    kicker: "Reactor stack",
    title: "Flow-field plate",
    body: "Moves liquid across one side of the cell. Grooves are a generic stand-in so the part reads as a flow field. Final channel geometry is release-controlled and is not reproduced.",
  },
  "ecr-electrode": {
    id: "ecr-electrode",
    kicker: "Reactor stack",
    title: "Porous electrode",
    body: "Electrode layer on a porous support. Catalyst chemistry and loadings are internal and are not labeled on this model.",
  },
  "ecr-membrane": {
    id: "ecr-membrane",
    kicker: "Reactor stack",
    title: "Membrane",
    body: "Separates the reactor's two liquid sides. The anode-side liquid stays in the dedicated anolyte loop.",
  },
  "fc-end": {
    id: "fc-end",
    kicker: "Fuel-cell stack",
    title: "End plate",
    body: "Compression boundary for the fuel-cell repeat. Hardware is representative.",
  },
  "fc-liquid": {
    id: "fc-liquid",
    kicker: "Fuel-cell stack",
    title: "Liquid flow field",
    body: "Fuel-side plate. Liquid fuel enters here. Carbon-bearing liquid leaves toward electrolyte storage.",
  },
  "fc-anode": {
    id: "fc-anode",
    kicker: "Fuel-cell stack",
    title: "Porous anode",
    body: "Liquid-fed anode on a porous support. Catalyst identity is omitted.",
  },
  "fc-mesh": {
    id: "fc-mesh",
    kicker: "Fuel-cell stack",
    title: "Interface mesh",
    body: "Conductive interface between the membrane and the porous anode.",
  },
  "fc-membrane": {
    id: "fc-membrane",
    kicker: "Fuel-cell stack",
    title: "Membrane",
    body: "Separates the oxygen gas side from the liquid-fuel side.",
  },
  "fc-gde": {
    id: "fc-gde",
    kicker: "Fuel-cell stack",
    title: "Gas diffusion electrode",
    body: "Oxygen-reduction side. Gas stays on this face. It is not manifolded together with the liquid fuel.",
  },
  "fc-gas": {
    id: "fc-gas",
    kicker: "Fuel-cell stack",
    title: "Cathode gas flow field",
    body: "Oxygen-enriched gas distribution. Exhaust from this side leads to external water recovery, not to a drain inside the plate.",
  },
  cover: {
    id: "cover",
    kicker: "01 · Enclosure",
    title: "Service cover",
    body: "The outer cover lifts straight up and stays aligned with the hub. It is the first piece to leave so the board and stacks can be read.",
  },
  fastener: {
    id: "fastener",
    kicker: "02 · Hardware",
    title: "Cover fasteners",
    body: "Corner fasteners leave with the cover, then float just above it. They are schematic hardware, not a released bolt callout.",
  },
  pcb: {
    id: "pcb",
    kicker: "03 · Electronics",
    title: "Hub control board",
    body: "The hub I/O board sits under the cover. Traces, the controller, the power stage, and the edge connector are visible once the cover lifts. It reports to the cabinet controller. It does not replace a hard safety trip.",
    engineering:
      "Silkscreen regions stand in for sensing, valve outputs, and the DC sense input. This is not a released schematic and it does not show firmware.",
  },
  harness: {
    id: "harness",
    kicker: "04 · Electronics",
    title: "Cable harness",
    body: "Short looms leave the board toward the stacks and the valve manifold. They move with the board so the electrical path stays obvious in the exploded layout.",
  },
  frame: {
    id: "frame",
    kicker: "05 · Structure",
    title: "Service frame",
    body: "The skid frame stays put. Every other piece separates from it on a straight axis, the way a teardown keeps the chassis as the reference.",
  },
  pump: {
    id: "pump",
    kicker: "21 · Fluids",
    title: "Circulation pump",
    body: "Moves fuel, electrolyte, anolyte, or recoverable water on its own circuit. Pumps are sized for low loss and can be variable-speed. This model does not freeze a vendor or a final piping diagram.",
  },
  valves: {
    id: "valves",
    kicker: "22 · Fluids",
    title: "Isolation valves",
    body: "Local valves let this hub be closed off while the other hubs stay in service. Handles and bodies separate forward with the manifold.",
  },
  bus: {
    id: "bus",
    kicker: "24 · Power",
    title: "DC bus bar",
    body: "Collects fuel-cell DC at the hub before it joins the container bus and the battery buffer. Copper bar with insulated boots. Export voltage is not specified here.",
  },
  sensor: {
    id: "sensor",
    kicker: "25 · Instrumentation",
    title: "Sensor cluster",
    body: "Local pressure and temperature taps. They are drawn as instrument stubs, not as a specific vendor transmitter.",
  },
};

export const TEARDOWN_PARTS: { id: string; n: number; title: string; tag: string }[] = [
  { id: "cover", n: 1, title: "Service cover", tag: "Service cover" },
  { id: "fastener", n: 2, title: "Cover fasteners", tag: "Fasteners" },
  { id: "pcb", n: 3, title: "Hub control board", tag: "Control board" },
  { id: "harness", n: 4, title: "Cable harness", tag: "Harness" },
  { id: "frame", n: 5, title: "Service frame", tag: "Frame" },
  { id: "ecr-end", n: 6, title: "ECR end plate", tag: "End plate" },
  { id: "ecr-flow", n: 7, title: "ECR flow field", tag: "Flow field" },
  { id: "ecr-electrode", n: 8, title: "ECR electrode", tag: "Electrode" },
  { id: "ecr-membrane", n: 9, title: "ECR membrane", tag: "Membrane" },
  { id: "ecr-electrode-2", n: 10, title: "ECR electrode", tag: "Electrode" },
  { id: "ecr-flow-2", n: 11, title: "ECR flow field", tag: "Flow field" },
  { id: "ecr-end-2", n: 12, title: "ECR end plate", tag: "End plate" },
  { id: "fc-end", n: 13, title: "Fuel-cell end plate", tag: "End plate" },
  { id: "fc-liquid", n: 14, title: "Liquid flow field", tag: "Liquid field" },
  { id: "fc-anode", n: 15, title: "Porous anode", tag: "Anode" },
  { id: "fc-mesh", n: 16, title: "Interface mesh", tag: "Mesh" },
  { id: "fc-membrane", n: 17, title: "Fuel-cell membrane", tag: "Membrane" },
  { id: "fc-gde", n: 18, title: "Gas diffusion electrode", tag: "Gas side" },
  { id: "fc-gas", n: 19, title: "Cathode gas flow field", tag: "Gas field" },
  { id: "fc-end-2", n: 20, title: "Fuel-cell end plate", tag: "End plate" },
  { id: "pump", n: 21, title: "Circulation pump", tag: "Pump" },
  { id: "valves", n: 22, title: "Isolation valves", tag: "Valves" },
  { id: "anolyte", n: 23, title: "Anolyte reservoir", tag: "Anolyte" },
  { id: "bus", n: 24, title: "DC bus bar", tag: "DC bus" },
  { id: "sensor", n: 25, title: "Sensor cluster", tag: "Sensors" },
];

export const FLOW_HELP: Record<FlowId, string> = {
  off: "Orange piping is liquid fuel. Blue piping is electrolyte and water, matching the concept image. Overlays split those paths.",
  power:
    "Fuel-cell DC feeds the managed bus, the battery buffer, internal loads, and export. Regeneration draws from that same electrical system when it is scheduled.",
  water:
    "Cathode exhaust to recovery, then the outlet manifold. This path is not a drain of either storage tank.",
  fuel: "Liquid fuel leaves TK-101 for the fuel cells. Accepted regenerated fuel can return toward TK-101.",
  carbon:
    "Carbon-bearing liquid leaves the fuel cells for TK-102, then feeds reactor regeneration batches.",
  oxygen: "Ambient air is enriched and delivered to the fuel-cell cathodes. Not a compressed-gas store.",
  thermal: "Coolant serves the stacks and selected power equipment, then rejects heat.",
};

export const SCENE_GUIDE: Record<SceneId, { id: string; label: string }[]> = {
  standard: [
    { id: "overview", label: "Whole unit" },
    { id: "hub-0", label: "Hub" },
    { id: "ecr", label: "Reactor" },
    { id: "fuel-cell", label: "Fuel cell" },
    { id: "battery", label: "Battery" },
    { id: "trim", label: "Trim" },
    { id: "electrolyte-tank", label: "Electrolyte" },
    { id: "fuel-tank", label: "Fuel tank" },
    { id: "water", label: "Water outlet" },
    { id: "ems", label: "AI / EMS" },
    { id: "condenser", label: "Water recovery" },
    { id: "anolyte", label: "Anolyte" },
    { id: "oxygen", label: "Oxygen" },
    { id: "thermal", label: "Thermal" },
    { id: "power", label: "Power" },
    { id: "co2", label: "CO2 feed" },
    { id: "pump", label: "Pumps" },
    { id: "safety", label: "Safety" },
  ],
  micro: [
    { id: "overview", label: "Whole facility" },
    { id: "bank-0", label: "Bank" },
    { id: "fhub-0-0", label: "Hub" },
    { id: "electrolyte-tank", label: "Shared electrolyte" },
    { id: "fuel-tank", label: "Shared fuel" },
    { id: "water-zone", label: "Water handling" },
    { id: "power-zone", label: "Power conversion" },
    { id: "control-room", label: "Operations / AI" },
    { id: "battery", label: "Battery" },
  ],
  stack: [],
};

export function resolveTopic(id: string, scene: SceneId): Topic {
  if (id === "overview") {
    if (scene === "micro") return TOPICS["micro-overview"];
    if (scene === "stack") return TOPICS["stack-overview"];
    return TOPICS.overview;
  }
  if (scene === "micro" && id === "electrolyte-tank") {
    return {
      ...TOPICS["electrolyte-tank"],
      kicker: "Shared by the bank",
      title: "Shared electrolyte storage",
      body: "The shared electrolyte storage system supplies and receives the working fluid used across the TES bank. It is not ten separate tanks, and it is not the customer water supply.",
    };
  }
  if (scene === "micro" && id === "fuel-tank") {
    return {
      ...TOPICS["fuel-tank"],
      kicker: "Shared by the bank",
      title: "Shared liquid fuel storage",
      body: "The shared liquid fuel storage system holds managed fuel for coordinated power generation across the hubs in the bank.",
    };
  }
  if (scene === "micro" && id === "battery") {
    return {
      ...TOPICS.battery,
      title: "Battery and auxiliary power",
      body: "The facility battery systems support startup and critical auxiliary loads across the TES Microfacility. They are not the exported energy source.",
    };
  }
  if (/^hub-\d+$/.test(id)) {
    return { ...TOPICS.hub, title: `Hub ${Number(id.slice(4)) + 1}` };
  }
  if (id.startsWith("fhub-")) {
    const parts = id.split("-");
    return {
      ...TOPICS.hub,
      title: `Bank ${Number(parts[1]) + 1} · Hub ${Number(parts[2]) + 1}`,
    };
  }
  if (id.startsWith("bank-")) {
    return { ...TOPICS.bank, title: `Bank ${Number(id.slice(5)) + 1}` };
  }
  const prefix = [
    "ecr-end",
    "ecr-flow",
    "ecr-electrode",
    "ecr-membrane",
    "fc-end",
    "fc-liquid",
    "fc-anode",
    "fc-mesh",
    "fc-membrane",
    "fc-gde",
    "fc-gas",
  ];
  for (const key of prefix) {
    if (id === key || id.startsWith(`${key}-`)) return TOPICS[key];
  }
  return TOPICS[id] ?? TOPICS.overview;
}

export function topicNote(topic: Topic, audience: Audience): string | undefined {
  return audience === "engineering" ? topic.engineering : undefined;
}
