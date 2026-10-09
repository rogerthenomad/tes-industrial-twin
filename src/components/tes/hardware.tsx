import { Skin } from "@/components/tes/primitives";
import * as THREE from "three";

const STEEL = "#c5d0da";
const DARK = "#2c3440";

export function SkidPost({
  position,
  height,
}: {
  position: [number, number, number];
  height: number;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.015, 0]} castShadow>
        <boxGeometry args={[0.16, 0.03, 0.16]} />
        <meshStandardMaterial color="#8d98a3" metalness={0.78} roughness={0.32} />
      </mesh>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[0.04, height, 0.075]} />
        <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.28} />
      </mesh>
      <mesh position={[0, height / 2, 0.028]} castShadow>
        <boxGeometry args={[0.078, height, 0.012]} />
        <meshStandardMaterial color="#b7c3ce" metalness={0.78} roughness={0.3} />
      </mesh>
      {[
        [0.045, 0.045],
        [0.045, -0.045],
        [-0.045, 0.045],
        [-0.045, -0.045],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.028, z]}>
          <cylinderGeometry args={[0.008, 0.008, 0.016, 6]} />
          <meshStandardMaterial color="#6d7782" metalness={0.82} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

let gaugeDial: THREE.CanvasTexture | null = null;

function gaugeFace() {
  if (gaugeDial) return gaugeDial;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext("2d");
  if (!g) return new THREE.CanvasTexture(canvas);
  g.fillStyle = "#f4f7fb";
  g.beginPath();
  g.arc(128, 128, 122, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#10233f";
  g.lineWidth = 4;
  for (let i = 0; i < 16; i++) {
    const a = Math.PI * 0.75 + (i / 15) * Math.PI * 1.5;
    const inner = i % 5 === 0 ? 78 : 96;
    g.beginPath();
    g.moveTo(128 + Math.cos(a) * inner, 128 + Math.sin(a) * inner);
    g.lineTo(128 + Math.cos(a) * 110, 128 + Math.sin(a) * 110);
    g.stroke();
  }
  g.strokeStyle = "#0c3f86";
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(128, 128);
  g.lineTo(172, 108);
  g.stroke();
  g.fillStyle = "#10233f";
  g.beginPath();
  g.arc(128, 128, 7, 0, Math.PI * 2);
  g.fill();
  gaugeDial = new THREE.CanvasTexture(canvas);
  gaugeDial.colorSpace = THREE.SRGBColorSpace;
  return gaugeDial;
}

export function Gauge({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const face = gaugeFace();
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.058, 0.028, 18]} />
        <meshPhysicalMaterial color="#e7eef3" metalness={0.94} roughness={0.16} clearcoat={0.45} envMapIntensity={1.35} />
      </mesh>
      <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.038, 18]} />
        <meshStandardMaterial map={face} roughness={0.3} metalness={0.04} />
      </mesh>
      <mesh position={[0, -0.028, 0]}>
        <cylinderGeometry args={[0.01, 0.014, 0.03, 8]} />
        <meshPhysicalMaterial color="#c5d0da" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function CableTray({
  from,
  to,
}: {
  from: [number, number, number];
  to: [number, number, number];
}) {
  const length = Math.abs(to[0] - from[0]);
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, from[1], from[2]];
  return (
    <group position={mid}>
      <mesh castShadow>
        <boxGeometry args={[length, 0.012, 0.16]} />
        <Skin kind="brushed" repeat={[Math.max(2, length / 1.5), 1]} color="#b7c2cc" metalness={0.72} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.02, 0.07]}>
        <boxGeometry args={[length, 0.04, 0.01]} />
        <meshStandardMaterial color={STEEL} metalness={0.75} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.02, -0.07]}>
        <boxGeometry args={[length, 0.04, 0.01]} />
        <meshStandardMaterial color={STEEL} metalness={0.75} roughness={0.32} />
      </mesh>
    </group>
  );
}

export function CabinetFace({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const slots = Math.max(3, Math.round(height * 4));
  return (
    <group>
      <mesh position={[0, 0, 0.004]}>
        <boxGeometry args={[0.008, height * 0.92, 0.006]} />
        <meshStandardMaterial color="#8e99a4" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[width * 0.32, 0, 0.012]}>
        <boxGeometry args={[0.02, 0.16, 0.02]} />
        <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.4} />
      </mesh>
      {Array.from({ length: slots }, (_, i) => (
        <mesh key={i} position={[-width * 0.28, height * 0.28 - i * 0.07, 0.01]}>
          <boxGeometry args={[width * 0.28, 0.012, 0.01]} />
          <meshStandardMaterial color="#243040" metalness={0.35} roughness={0.5} />
        </mesh>
      ))}
      {[-width * 0.18, width * 0.18].map((x) => (
        <mesh key={x} position={[x, -height * 0.42, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.02, 0.028, 6]} />
          <meshPhysicalMaterial color="#c5d0da" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[-width * 0.48, 0, 0.01]}>
        <boxGeometry args={[0.012, height * 0.86, 0.02]} />
        <meshStandardMaterial color="#8e99a4" metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  );
}

const UP = new THREE.Vector3(0, 1, 0);

function Bone({
  from,
  to,
  radius,
  color,
}: {
  from: [number, number, number];
  to: [number, number, number];
  radius: number;
  color: string;
}) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const delta = end.clone().sub(start);
  const length = Math.max(delta.length(), radius * 2 + 0.02);
  const mid = start.clone().addScaledVector(delta, 0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(UP, delta.clone().normalize());
  return (
    <mesh position={mid} quaternion={q} castShadow>
      <capsuleGeometry args={[radius, Math.max(0.02, length - radius * 2), 5, 10]} />
      <meshStandardMaterial color={color} roughness={0.58} metalness={0.02} />
    </mesh>
  );
}

export function Person({
  position,
  yaw,
  pose = "stand",
}: {
  position: [number, number, number];
  yaw: number;
  pose?: "stand" | "point" | "hips" | "notes";
}) {
  const cloth = "#243044";
  const skin = "#c49a78";
  const vest = "#e2b423";
  const right: [number, number, number][] =
    pose === "point"
      ? [
          [0.22, 1.42, 0],
          [0.38, 1.4, 0.16],
          [0.58, 1.38, 0.34],
        ]
      : pose === "hips"
        ? [
            [0.22, 1.42, 0],
            [0.32, 1.16, 0.08],
            [0.18, 1.02, 0.1],
          ]
        : pose === "notes"
          ? [
              [0.2, 1.42, 0],
              [0.24, 1.18, 0.12],
              [0.16, 1.02, 0.22],
            ]
          : [
              [0.22, 1.42, 0],
              [0.3, 1.12, 0.04],
              [0.24, 0.84, 0.06],
            ];
  const left: [number, number, number][] =
    pose === "notes"
      ? [
          [-0.2, 1.42, 0],
          [-0.16, 1.16, 0.14],
          [-0.02, 1.02, 0.22],
        ]
      : pose === "hips"
        ? [
            [-0.22, 1.42, 0],
            [-0.32, 1.16, 0.08],
            [-0.18, 1.02, 0.1],
          ]
        : [
            [-0.22, 1.42, 0],
            [-0.3, 1.14, 0.02],
            [-0.22, 0.86, 0.04],
          ];
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <Bone from={[-0.09, 0.92, 0]} to={[-0.1, 0.48, 0.02]} radius={0.07} color={cloth} />
      <Bone from={[0.09, 0.92, 0]} to={[0.1, 0.48, 0.01]} radius={0.07} color={cloth} />
      <Bone from={[-0.1, 0.48, 0.02]} to={[-0.1, 0.08, 0.03]} radius={0.055} color={cloth} />
      <Bone from={[0.1, 0.48, 0.01]} to={[0.11, 0.08, 0.02]} radius={0.055} color={cloth} />
      {[-0.1, 0.11].map((x) => (
        <mesh key={x} position={[x, 0.05, 0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.05, 0.12, 4, 8]} />
          <meshStandardMaterial color="#1a1e24" roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 1.16, 0]} scale={[1.15, 1, 0.82]} castShadow>
        <capsuleGeometry args={[0.15, 0.36, 6, 12]} />
        <meshStandardMaterial color={vest} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color={cloth} roughness={0.7} />
      </mesh>
      <Bone from={[-0.22, 1.42, 0]} to={left[1]} radius={0.048} color={cloth} />
      <Bone from={left[1]} to={left[2]} radius={0.04} color={skin} />
      <Bone from={[0.22, 1.42, 0]} to={right[1]} radius={0.048} color={cloth} />
      <Bone from={right[1]} to={right[2]} radius={0.04} color={skin} />
      <mesh position={left[2]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.5} />
      </mesh>
      <mesh position={right[2]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.08, 10]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.64, 0.01]} scale={[0.9, 1.08, 0.86]} castShadow>
        <sphereGeometry args={[0.105, 20, 16]} />
        <meshStandardMaterial color={skin} roughness={0.48} />
      </mesh>
      {[-0.038, 0.038].map((x) => (
        <group key={x} position={[x, 1.66, 0.09]}>
          <mesh>
            <sphereGeometry args={[0.014, 10, 8]} />
            <meshStandardMaterial color="#f7f4ef" roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <sphereGeometry args={[0.007, 8, 8]} />
            <meshStandardMaterial color="#1c2430" roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.62, 0.1]} rotation={[1.2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.012, 0.028, 3, 6]} />
        <meshStandardMaterial color="#b88868" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.575, 0.095]}>
        <boxGeometry args={[0.04, 0.006, 0.01]} />
        <meshStandardMaterial color="#8d5b4c" roughness={0.45} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.1, 1.63, 0]} castShadow>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 1.74, 0]} castShadow>
        <sphereGeometry args={[0.12, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f0c14a" roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.73, 0.02]} rotation={[0.35, 0, 0]} castShadow>
        <torusGeometry args={[0.115, 0.012, 6, 16]} />
        <meshStandardMaterial color="#e6b325" roughness={0.4} metalness={0.15} />
      </mesh>
      {pose === "notes" ? (
        <mesh position={[0.08, 1.0, 0.26]} rotation={[-0.4, 0.2, 0]} castShadow>
          <boxGeometry args={[0.16, 0.22, 0.012]} />
          <meshStandardMaterial color="#dfe6ee" roughness={0.4} metalness={0.1} />
        </mesh>
      ) : null}
    </group>
  );
}

export function Elbow({
  position,
  rotation,
  radius = 0.16,
  tube = 0.04,
  color = "#c5ced6",
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  radius?: number;
  tube?: number;
  color?: string;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <torusGeometry args={[radius, tube, 12, 18, Math.PI / 2]} />
      <meshStandardMaterial color={color} metalness={0.84} roughness={0.22} />
    </mesh>
  );
}

export function Hangers({ y, z, xs }: { y: number; z: number; xs: number[] }) {
  return (
    <group>
      {xs.map((x) => (
        <group key={x} position={[x, y, z]}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.36, 6]} />
            <meshStandardMaterial color="#8e99a4" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.07, 0.008, 6, 14]} />
            <meshStandardMaterial color="#9aa6b2" metalness={0.75} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function PanelButtons({ position }: { position: [number, number, number] }) {
  const keys = [
    ["#c44732", -0.045, 0.02],
    ["#1c7a45", 0.0, 0.02],
    ["#f2f5f8", 0.045, 0.02],
    ["#1c2430", -0.022, -0.025],
    ["#24598f", 0.022, -0.025],
  ] as const;
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.16, 0.1, 0.016]} />
        <meshStandardMaterial color="#121820" metalness={0.45} roughness={0.4} />
      </mesh>
      {keys.map(([color, x, y]) => (
        <mesh key={`${color}-${x}`} position={[x, y, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.014, 0.01, 12]} />
          <meshStandardMaterial color={color} metalness={0.25} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}
