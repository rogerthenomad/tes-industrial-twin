import { useMemo } from "react";
import { Billboard, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { TEARDOWN_PARTS } from "@/lib/tes/content";
import { useTes } from "@/lib/tes/store";
import { Ink, Pickable, Pipe, Beads } from "@/components/tes/primitives";

type Kind = "end" | "flow" | "porous" | "membrane" | "mesh" | "gas";
type Layer = { id: string; n: number; tag: string; thick: number; kind: Kind };

const tagOf = (id: string) => TEARDOWN_PARTS.find((part) => part.id === id)?.tag ?? id;

const ECR: Layer[] = [
  { id: "ecr-end", n: 6, tag: tagOf("ecr-end"), thick: 0.07, kind: "end" },
  { id: "ecr-flow", n: 7, tag: tagOf("ecr-flow"), thick: 0.045, kind: "flow" },
  { id: "ecr-electrode", n: 8, tag: tagOf("ecr-electrode"), thick: 0.032, kind: "porous" },
  { id: "ecr-membrane", n: 9, tag: tagOf("ecr-membrane"), thick: 0.018, kind: "membrane" },
  { id: "ecr-electrode-2", n: 10, tag: tagOf("ecr-electrode-2"), thick: 0.032, kind: "porous" },
  { id: "ecr-flow-2", n: 11, tag: tagOf("ecr-flow-2"), thick: 0.045, kind: "flow" },
  { id: "ecr-end-2", n: 12, tag: tagOf("ecr-end-2"), thick: 0.07, kind: "end" },
];

const FC: Layer[] = [
  { id: "fc-end", n: 13, tag: tagOf("fc-end"), thick: 0.064, kind: "end" },
  { id: "fc-liquid", n: 14, tag: tagOf("fc-liquid"), thick: 0.042, kind: "flow" },
  { id: "fc-anode", n: 15, tag: tagOf("fc-anode"), thick: 0.03, kind: "porous" },
  { id: "fc-mesh", n: 16, tag: tagOf("fc-mesh"), thick: 0.016, kind: "mesh" },
  { id: "fc-membrane", n: 17, tag: tagOf("fc-membrane"), thick: 0.016, kind: "membrane" },
  { id: "fc-gde", n: 18, tag: tagOf("fc-gde"), thick: 0.03, kind: "porous" },
  { id: "fc-gas", n: 19, tag: tagOf("fc-gas"), thick: 0.042, kind: "gas" },
  { id: "fc-end-2", n: 20, tag: tagOf("fc-end-2"), thick: 0.064, kind: "end" },
];

const Y_AXIS = new THREE.Vector3(0, 1, 0);

function paintBoard() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const g = canvas.getContext("2d");
  if (!g) return new THREE.CanvasTexture(canvas);
  g.fillStyle = "#0b6a3c";
  g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    g.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)";
    g.fillRect(x, y, 2, 2);
  }
  g.strokeStyle = "#d7c36a";
  g.lineWidth = 3;
  g.lineCap = "round";
  g.lineJoin = "round";
  const traces = [
    [80, 860, 240, 860, 240, 640, 420, 640, 420, 420],
    [160, 200, 380, 200, 380, 480, 700, 480],
    [620, 180, 620, 340, 860, 340],
    [200, 760, 560, 760, 560, 300, 820, 300],
    [500, 880, 500, 700, 780, 700],
    [120, 520, 300, 520, 300, 360],
  ];
  for (const path of traces) {
    g.beginPath();
    g.moveTo(path[0], path[1]);
    for (let i = 2; i < path.length; i += 2) g.lineTo(path[i], path[i + 1]);
    g.stroke();
  }
  g.fillStyle = "#e6c56a";
  for (let i = 0; i < 26; i++) {
    g.beginPath();
    g.arc(90 + (i % 13) * 22, i < 13 ? 940 : 78, 6, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#c8b15a";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 10; col++) {
      g.fillRect(250 + col * 18, 300 + row * 16, 8, 8);
    }
  }
  g.strokeStyle = "rgba(255,255,255,0.85)";
  g.lineWidth = 2;
  g.strokeRect(230, 270, 220, 170);
  g.strokeRect(620, 220, 160, 110);
  g.strokeRect(640, 520, 140, 90);
  g.fillStyle = "#f2f6f4";
  g.font = "600 28px Arial, Helvetica, sans-serif";
  g.fillText("TES HUB I/O", 78, 150);
  g.font = "500 18px Arial, Helvetica, sans-serif";
  g.fillText("U1", 236, 262);
  g.fillText("U2  DC SENSE", 620, 210);
  g.fillText("J1", 78, 900);
  g.fillText("C12", 80, 430);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = "rgba(20,20,20,0.45)";
    g.beginPath();
    g.arc(140 + (i % 10) * 70, 180 + Math.floor(i / 10) * 160, 3, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function paintFlow() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const g = canvas.getContext("2d");
  if (!g) return new THREE.CanvasTexture(canvas);
  g.fillStyle = "#d5dde6";
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#6d7c8b";
  g.lineWidth = 16;
  g.lineCap = "round";
  g.beginPath();
  let y = 64;
  let dir = 1;
  g.moveTo(70, y);
  for (let i = 0; i < 6; i++) {
    const x = dir > 0 ? 442 : 70;
    g.lineTo(x, y);
    y += 64;
    g.lineTo(x, y);
    dir *= -1;
  }
  g.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function paintMesh() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext("2d");
  if (!g) return new THREE.CanvasTexture(canvas);
  g.fillStyle = "#c5ced6";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#6d7c8b";
  g.lineWidth = 3;
  for (let i = 0; i <= 256; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 256);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i);
    g.lineTo(256, i);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function paintDial() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext("2d");
  if (!g) return new THREE.CanvasTexture(canvas);
  g.fillStyle = "#f4f7fb";
  g.beginPath();
  g.arc(128, 128, 120, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#1c2430";
  g.lineWidth = 6;
  g.stroke();
  g.strokeStyle = "#10233f";
  g.lineWidth = 3;
  for (let i = 0; i < 21; i++) {
    const a = Math.PI * 0.75 + (i / 20) * Math.PI * 1.5;
    const inner = i % 5 === 0 ? 78 : 92;
    g.beginPath();
    g.moveTo(128 + Math.cos(a) * inner, 128 + Math.sin(a) * inner);
    g.lineTo(128 + Math.cos(a) * 108, 128 + Math.sin(a) * 108);
    g.stroke();
  }
  g.strokeStyle = "#0c3f86";
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(128, 128);
  g.lineTo(168, 96);
  g.stroke();
  g.fillStyle = "#10233f";
  g.beginPath();
  g.arc(128, 128, 8, 0, Math.PI * 2);
  g.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Steel({
  color = "#e4ebf1",
  rough = 0.14,
  emissive = "#000000",
  emissiveIntensity = 0,
}: {
  color?: string;
  rough?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={0.96}
      roughness={rough}
      clearcoat={0.72}
      clearcoatRoughness={0.16}
      envMapIntensity={1.55}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  );
}

function Flange({ radius = 0.055 }: { radius?: number }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[radius * 1.72, radius * 1.72, 0.016, 20]} />
        <Steel rough={0.1} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * radius * 1.22, 0.012, Math.sin(a) * radius * 1.22]}>
            <cylinderGeometry args={[radius * 0.13, radius * 0.16, 0.018, 6]} />
            <Steel color="#c5d0da" rough={0.22} />
          </mesh>
        );
      })}
    </group>
  );
}

function ProcessValve() {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.026, 0.026, 0.18, 16]} />
        <Steel />
      </mesh>
      <group position={[-0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <Flange radius={0.034} />
      </group>
      <group position={[0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <Flange radius={0.034} />
      </group>
      <mesh castShadow>
        <sphereGeometry args={[0.046, 18, 14]} />
        <Steel rough={0.1} />
      </mesh>
      <mesh position={[0, 0.055, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.018, 0.05, 12]} />
        <Steel color="#d5dee6" rough={0.16} />
      </mesh>
      <mesh position={[0.04, 0.086, 0]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[0.16, 0.012, 0.014]} />
        <Steel color="#b7c3ce" rough={0.2} />
      </mesh>
      <mesh position={[0.11, 0.1, 0]}>
        <sphereGeometry args={[0.012, 10, 8]} />
        <Steel color="#8e99a4" rough={0.18} />
      </mesh>
    </group>
  );
}

function Gauge() {
  const dial = useMemo(() => paintDial(), []);
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.058, 0.028, 20]} />
        <Steel />
      </mesh>
      <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 20]} />
        <meshStandardMaterial map={dial} roughness={0.28} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.01, 0.014, 0.04, 10]} />
        <Steel />
      </mesh>
    </group>
  );
}

function Bracket({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.09, 0.012, 0.07]} />
        <Steel color="#9aa6b2" rough={0.28} />
      </mesh>
      <mesh position={[0, 0.04, -0.028]}>
        <boxGeometry args={[0.09, 0.08, 0.012]} />
        <Steel color="#9aa6b2" rough={0.28} />
      </mesh>
      {[-0.025, 0.025].map((x) => (
        <mesh key={x} position={[x, 0.012, 0.01]}>
          <cylinderGeometry args={[0.006, 0.008, 0.012, 6]} />
          <Steel color="#6d7782" rough={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Leader({ a, b }: { a: [number, number, number]; b: [number, number, number] }) {
  const start = new THREE.Vector3(a[0], a[1], a[2]);
  const end = new THREE.Vector3(b[0], b[1], b[2]);
  const dir = end.clone().sub(start);
  const len = Math.max(dir.length(), 0.001);
  dir.multiplyScalar(1 / len);
  const mid = start.clone().addScaledVector(dir, len / 2);
  const q = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir);
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[0.005, 0.005, len, 5]} />
      <meshBasicMaterial color="#0c3f86" />
    </mesh>
  );
}

function Tag({
  n,
  title,
  at,
  side,
  dy = 0,
  reach = 1.62,
}: {
  n: number;
  title: string;
  at: [number, number, number];
  side: -1 | 1;
  dy?: number;
  reach?: number;
}) {
  const explode = useTes((s) => s.explode);
  if (explode < 0.34) return null;
  const label: [number, number, number] = [at[0] + side * reach, at[1] + dy, at[2] + 0.04];
  return (
    <group>
      <Leader a={at} b={[label[0] - side * 0.55, label[1], label[2]]} />
      <Billboard position={label}>
        <Ink text={title} position={[0, 0, 0]} width={0.78} height={0.09} fg="#10233f" bg="#f7fafc" />
      </Billboard>
    </group>
  );
}

function Plate({
  layer,
  y,
  maps,
}: {
  layer: Layer;
  y: number;
  maps: { flow: THREE.Texture; mesh: THREE.Texture };
}) {
  const selected = useTes((s) => s.selected);
  const on = selected === layer.id;
  const map = layer.kind === "mesh" ? maps.mesh : layer.kind === "flow" || layer.kind === "gas" ? maps.flow : null;
  const color =
    layer.kind === "end"
      ? "#e7eef3"
      : layer.kind === "membrane"
        ? "#d7eef2"
        : layer.kind === "porous"
          ? "#2c3542"
          : layer.kind === "mesh"
            ? "#c5ced6"
            : "#d5dee6";
  const metal = layer.kind === "porous" ? 0.35 : layer.kind === "membrane" ? 0.15 : 0.92;
  return (
    <Pickable id={layer.id}>
      <RoundedBox args={[0.78, Math.max(layer.thick, 0.02), 0.52]} radius={0.008} smoothness={2} position={[0, y, 0]} castShadow>
        <meshPhysicalMaterial
          color={on ? "#f7fbff" : color}
          map={map}
          metalness={metal}
          roughness={layer.kind === "membrane" ? 0.18 : layer.kind === "end" ? 0.16 : 0.28}
          clearcoat={layer.kind === "end" || layer.kind === "flow" ? 0.55 : 0.08}
          clearcoatRoughness={0.2}
          envMapIntensity={1.3}
          transparent={layer.kind === "membrane"}
          opacity={layer.kind === "membrane" ? 0.82 : 1}
          emissive={on ? "#163e86" : "#000000"}
          emissiveIntensity={on ? 0.2 : 0}
        />
      </RoundedBox>
      {layer.kind === "end"
        ? [
            [-0.32, -0.2],
            [0.32, -0.2],
            [-0.32, 0.2],
            [0.32, 0.2],
          ].map(([bx, bz]) => (
            <mesh key={`${bx}${bz}`} position={[bx, y + layer.thick * 0.55, bz]}>
              <cylinderGeometry args={[0.012, 0.014, 0.012, 6]} />
              <Steel color="#8e99a4" rough={0.2} />
            </mesh>
          ))
        : null}
    </Pickable>
  );
}

function StackColumn({
  side,
  title,
  layers,
  maps,
}: {
  side: -1 | 1;
  title: string;
  layers: Layer[];
  maps: { flow: THREE.Texture; mesh: THREE.Texture };
}) {
  const explode = useTes((s) => s.explode);
  const gap = 0.01 + explode * 0.2;
  let cursor = 0.2;
  const placed = layers.map((layer) => {
    const y = cursor + layer.thick / 2;
    cursor += layer.thick + gap;
    return { layer, y };
  });
  const x = side * (0.4 + explode * 1.02);
  return (
    <group position={[x, 0, 0]}>
      <Ink
        text={title}
        position={[0, placed[placed.length - 1].y + 0.34, 0]}
        width={1.15}
        height={0.14}
        fg="#0c3f86"
        bg={null}
      />
      {placed.map(({ layer, y }) => (
        <Plate key={layer.id} layer={layer} y={y} maps={maps} />
      ))}
      {explode > 0.42
        ? placed.map(({ layer, y }, i) => (
            <Tag
              key={layer.id}
              n={layer.n}
              title={layer.tag}
              at={[side * 0.42, y, 0.28]}
              side={side}
              reach={Math.max(0.7, 2.05 - Math.abs(x))}
              dy={0.18 + i * 0.16 - y}
            />
          ))
        : null}
      {[-0.3, 0.3].map((cx) =>
        [-0.18, 0.18].map((cz) => (
          <group key={`${cx}${cz}`}>
            <mesh position={[cx, (placed[0].y + placed[placed.length - 1].y) / 2, cz]}>
              <cylinderGeometry args={[0.01, 0.01, cursor - 0.16, 12]} />
              <Steel color="#c5d0da" rough={0.18} />
            </mesh>
            <mesh position={[cx, placed[0].y - 0.03, cz]}>
              <cylinderGeometry args={[0.016, 0.018, 0.012, 6]} />
              <Steel color="#8e99a4" rough={0.22} />
            </mesh>
          </group>
        )),
      )}
    </group>
  );
}

function ControlBoard({ map }: { map: THREE.Texture }) {
  const explode = useTes((s) => s.explode);
  const selected = useTes((s) => s.selected);
  const on = selected === "pcb";
  const y = 0.72 + explode * 0.85;
  const z = 0.12 + explode * 1.2;
  return (
    <group position={[0, y, z]} rotation={[explode * 0.72, 0, 0]}>
      <Pickable id="pcb">
        <mesh position={[0, -0.008, 0]} castShadow>
          <boxGeometry args={[1.28, 0.012, 0.78]} />
          <meshStandardMaterial color="#c6a15a" roughness={0.72} metalness={0.15} />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[1.26, 0.008, 0.76]} />
          <meshStandardMaterial color="#0b6a3c" roughness={0.55} metalness={0.08} />
        </mesh>
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.22, 0.72]} />
          <meshStandardMaterial
            map={map}
            roughness={0.62}
            metalness={0.08}
            emissive={on ? "#163e86" : "#000000"}
            emissiveIntensity={on ? 0.12 : 0}
          />
        </mesh>
        {[
          [-0.58, -0.32],
          [0.58, -0.32],
          [-0.58, 0.32],
          [0.58, 0.32],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, 0.004, z]}>
            <cylinderGeometry args={[0.018, 0.018, 0.02, 12]} />
            <meshStandardMaterial color="#1a1e16" roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[-0.18, 0.02, -0.02]} castShadow>
          <boxGeometry args={[0.28, 0.02, 0.28]} />
          <meshStandardMaterial color="#14181c" roughness={0.42} metalness={0.35} />
        </mesh>
        {[-0.125, 0.125].map((z) =>
          Array.from({ length: 10 }, (_, i) => (
            <mesh key={`${z}${i}`} position={[-0.3 + i * 0.026, 0.012, z]}>
              <boxGeometry args={[0.008, 0.012, 0.02]} />
              <meshStandardMaterial color="#d7dde4" metalness={0.85} roughness={0.25} />
            </mesh>
          )),
        )}
        <mesh position={[0.22, 0.016, -0.12]} castShadow>
          <boxGeometry args={[0.16, 0.014, 0.1]} />
          <meshStandardMaterial color="#1c2228" roughness={0.4} metalness={0.4} />
        </mesh>
        {[0.08, 0.16, 0.24].map((x) => (
          <group key={x} position={[x, 0.02, 0.08]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.028, 10]} />
              <meshStandardMaterial color="#2a3138" roughness={0.35} metalness={0.55} />
            </mesh>
            <mesh position={[0, 0.016, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.006, 8]} />
              <meshStandardMaterial color="#c5ced6" metalness={0.8} roughness={0.25} />
            </mesh>
          </group>
        ))}
        {[-0.46, -0.38, -0.3].map((x) => (
          <mesh key={x} position={[x, 0.01, 0.16]}>
            <boxGeometry args={[0.04, 0.01, 0.02]} />
            <meshStandardMaterial color="#c4a574" metalness={0.35} roughness={0.45} />
          </mesh>
        ))}
        <mesh position={[0.02, 0.014, 0.32]} castShadow>
          <boxGeometry args={[0.62, 0.02, 0.08]} />
          <meshStandardMaterial color="#111418" roughness={0.4} metalness={0.45} />
        </mesh>
        {Array.from({ length: 16 }, (_, i) => (
          <mesh key={i} position={[-0.26 + i * 0.034, 0.02, 0.32]}>
            <boxGeometry args={[0.008, 0.02, 0.03]} />
            <meshStandardMaterial color="#e4c98a" metalness={0.82} roughness={0.22} />
          </mesh>
        ))}
      </Pickable>
      <group position={[0.52, 0.05, -0.05]}>
        <Pickable id="harness">
          {["#1c7a45", "#d07a3a", "#3d7ec4"].map((color, i) => (
            <mesh key={color} position={[0.12 + i * 0.05, 0, i * 0.06]} rotation={[0.4, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.34, 8]} />
              <meshStandardMaterial color={color} roughness={0.45} metalness={0.15} />
            </mesh>
          ))}
        </Pickable>
        <Tag n={4} title="Harness" at={[0.28, 0.05, 0.08]} side={1} reach={0.95} dy={-0.22} />
      </group>
      <Tag n={3} title="Board" at={[0, 0.16, -0.05]} side={1} reach={0.05} dy={0.48} />
    </group>
  );
}

export function ExplodedStack() {
  const explode = useTes((s) => s.explode);
  const selected = useTes((s) => s.selected);
  const flow = useTes((s) => s.flow);
  const maps = useMemo(() => ({ flow: paintFlow(), mesh: paintMesh(), board: paintBoard() }), []);
  const coverY = 0.72 + explode * 1.7;
  const glow = (id: string) => (selected === id ? 0.18 : 0);

  return (
    <group>
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[3.6, 0.06, 2.3]} />
        <meshStandardMaterial color="#8d96a0" metalness={0.35} roughness={0.55} />
      </mesh>
      <Pickable id="frame">
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[2.4, 0.045, 1.5]} />
          <Steel color="#d5dee6" rough={0.18} emissive="#163e86" emissiveIntensity={glow("frame")} />
        </mesh>
        {[
          [-1.12, -0.68],
          [1.12, -0.68],
          [-1.12, 0.68],
          [1.12, 0.68],
        ].map(([x, z]) => (
          <group key={`${x}${z}`}>
            <mesh position={[x, 0.42, z]} castShadow>
              <cylinderGeometry args={[0.028, 0.028, 0.62, 12]} />
              <Steel color="#c5d0da" rough={0.16} />
            </mesh>
            <Bracket position={[x, 0.08, z]} />
          </group>
        ))}
      </Pickable>
      <Tag n={5} title="Frame" at={[0.05, 0.16, 0.82]} side={1} reach={1.55} dy={-0.55} />

      <StackColumn side={-1} title="REACTOR" layers={ECR} maps={maps} />
      <StackColumn side={1} title="FUEL CELL" layers={FC} maps={maps} />
      <ControlBoard map={maps.board} />

      <group position={[0, 0.22, 0.95 + explode * 0.72]}>
        <Pipe a={[-0.85, 0.08, 0]} b={[0.85, 0.08, 0]} radius={0.028} color="#d5dee6" finish="bare" flange />
        <Pipe a={[-0.55, 0.22, -0.15]} b={[-0.55, 0.08, 0]} radius={0.016} color="#c5d0da" finish="bare" />
        <Pipe a={[0.35, 0.22, -0.12]} b={[0.35, 0.08, 0]} radius={0.016} color="#c5d0da" finish="bare" />
        {flow === "water" ? (
          <>
            <Beads a={[-0.8, 0.08, 0]} b={[0.8, 0.08, 0]} color="#8ec6ff" count={12} speed={0.14} />
            <Beads a={[-0.55, 0.22, -0.15]} b={[-0.55, 0.08, 0]} color="#8ec6ff" count={6} speed={0.14} />
            <Beads a={[0.35, 0.08, 0]} b={[0.35, 0.22, -0.12]} color="#8ec6ff" count={6} speed={0.14} />
          </>
        ) : null}
      </group>

      <group position={[-0.55 - explode * 0.35, 0.28, 0.95 + explode * 0.72]}>
        <Pickable id="pump">
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.1, 0.12, 20]} />
            <Steel color="#e8eef3" rough={0.1} emissive="#163e86" emissiveIntensity={glow("pump")} />
          </mesh>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.12, 16]} />
            <Steel color="#9aa6b2" rough={0.2} />
          </mesh>
          <mesh position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
            <Steel color="#6d7782" rough={0.25} />
          </mesh>
          <group position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <Flange radius={0.032} />
          </group>
          <group position={[-0.1, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <Flange radius={0.028} />
          </group>
        </Pickable>
        <Tag n={21} title="Pump" at={[0, 0.2, 0]} side={-1} reach={0.85} dy={-0.15} />
      </group>

      <group position={[0.15 + explode * 0.15, 0.32, 0.95 + explode * 0.72]}>
        <Pickable id="valves">
          {[0, 0.28, 0.56].map((x) => (
            <group key={x} position={[x - 0.28, 0, 0]}>
              <ProcessValve />
            </group>
          ))}
        </Pickable>
        <Tag n={22} title="Valves" at={[0.28, 0.16, 0]} side={1} reach={1.15} dy={-0.35} />
      </group>

      <group position={[-1.35 - explode * 0.55, 0.28, 0.55 + explode * 0.15]}>
        <Pickable id="anolyte">
          <mesh castShadow>
            <cylinderGeometry args={[0.11, 0.11, 0.26, 24]} />
            <meshPhysicalMaterial
              color="#d5e7ea"
              transparent
              opacity={0.55}
              roughness={0.08}
              metalness={0.05}
              transmission={0.55}
              thickness={0.25}
              envMapIntensity={1.2}
              emissive="#163e86"
              emissiveIntensity={glow("anolyte")}
            />
          </mesh>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.05, 0.04, 16]} />
            <Steel />
          </mesh>
          <group position={[0, 0.18, 0]}>
            <Flange radius={0.03} />
          </group>
          <mesh position={[0.12, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.08, 10]} />
            <Steel />
          </mesh>
        </Pickable>
        <Tag n={23} title="Anolyte" at={[0, 0.22, 0]} side={-1} reach={0.55} />
      </group>

      <group position={[1.45 + explode * 0.55, 1.05 + explode * 0.1, 0.1]}>
        <Pickable id="bus">
          <mesh castShadow>
            <boxGeometry args={[0.045, 0.32, 0.55]} />
            <meshPhysicalMaterial color="#c56a2d" metalness={0.92} roughness={0.18} clearcoat={0.45} envMapIntensity={1.3} emissive="#163e86" emissiveIntensity={glow("bus")} />
          </mesh>
          {[-0.08, 0.08].map((y) => (
            <mesh key={y} position={[0.04, y, 0]}>
              <boxGeometry args={[0.03, 0.06, 0.18]} />
              <Steel color={y > 0 ? "#d7e7df" : "#1c2430"} rough={0.3} />
            </mesh>
          ))}
        </Pickable>
        <Tag n={24} title="DC bus" at={[0, 0.22, 0]} side={1} reach={0.7} />
        {flow === "power" ? (
          <>
            <Beads a={[0, -0.55, 0]} b={[0, 0.18, 0]} color="#7dff9a" count={8} speed={0.2} />
            <Beads a={[-0.9, -0.15, 0]} b={[0.05, 0, 0]} color="#7dff9a" count={8} speed={0.16} />
          </>
        ) : null}
      </group>

      <group position={[0.85 + explode * 0.25, 0.62, 0.95 + explode * 0.72]}>
        <Pickable id="sensor">
          {[-0.16, 0, 0.16].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <Gauge />
            </group>
          ))}
          <mesh position={[0, -0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.42, 10]} />
            <Steel />
          </mesh>
        </Pickable>
        <Tag n={25} title="Sensors" at={[0.16, 0.08, 0]} side={1} reach={0.85} dy={0.05} />
      </group>

      <group position={[0, coverY, 0]}>
        <Pickable id="cover">
          <RoundedBox args={[1.96, 0.028, 1.16]} radius={0.02} smoothness={3} castShadow>
            <meshPhysicalMaterial
              color={selected === "cover" ? "#f7fbff" : "#eef3f7"}
              metalness={0.94}
              roughness={0.12}
              clearcoat={0.8}
              clearcoatRoughness={0.12}
              envMapIntensity={1.6}
              emissive="#163e86"
              emissiveIntensity={glow("cover")}
            />
          </RoundedBox>
          {[-0.55, 0.55].map((x) => (
            <mesh key={x} position={[x, 0.02, 0]}>
              <boxGeometry args={[0.03, 0.012, 1.02]} />
              <Steel color="#c5d0da" rough={0.16} />
            </mesh>
          ))}
        </Pickable>
        {[
          [-0.86, -0.48],
          [0.86, -0.48],
          [-0.86, 0.48],
          [0.86, 0.48],
        ].map(([x, z]) => (
          <Pickable key={`${x}${z}`} id="fastener">
            <group position={[x, 0.06 + explode * 0.42, z]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.022, 0.026, 0.016, 6]} />
                <Steel color="#8e99a4" rough={0.18} emissive="#163e86" emissiveIntensity={glow("fastener")} />
              </mesh>
              <mesh position={[0, -0.02, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.03, 8]} />
                <Steel color="#6d7782" rough={0.3} />
              </mesh>
            </group>
          </Pickable>
        ))}
        <Tag n={1} title="Cover" at={[0, 0.08, 0]} side={-1} reach={1.7} dy={0.35} />
        <Tag n={2} title="Fasteners" at={[0.86, 0.16 + explode * 0.42, 0.48]} side={1} reach={1.15} dy={0.45} />
      </group>
    </group>
  );
}
