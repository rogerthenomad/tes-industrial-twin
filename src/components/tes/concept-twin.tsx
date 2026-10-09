import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { Ink } from "@/components/tes/primitives";

const BLUE = "#1a4e9c";
const ORANGE = "#d06a28";
const PIPE_BLUE = "#2f6fad";
const STEEL = "#d5dee6";
const PAINT = "#e7edf2";
const DARK = "#2c333b";

export type TwinView = "front" | "back";

const SHOTS: Record<TwinView, { pos: [number, number, number]; target: [number, number, number] }> = {
  front: { pos: [0.35, 1.85, -7.1], target: [0.35, 1.35, 0.1] },
  back: { pos: [0.15, 1.8, 7.2], target: [0.1, 1.25, 0] },
};

function Steel({
  color = STEEL,
  metalness = 0.78,
  roughness = 0.28,
}: {
  color?: string;
  metalness?: number;
  roughness?: number;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      clearcoat={0.35}
      clearcoatRoughness={0.45}
      envMapIntensity={1.15}
    />
  );
}

function Pipe({
  a,
  b,
  radius = 0.045,
  color = ORANGE,
}: {
  a: [number, number, number];
  b: [number, number, number];
  radius?: number;
  color?: string;
}) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const delta = end.clone().sub(start);
  const length = Math.max(delta.length(), radius * 2);
  const mid = start.clone().addScaledVector(delta, 0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
  return (
    <group>
      <mesh position={mid} quaternion={q} castShadow>
        <cylinderGeometry args={[radius, radius, length, 16]} />
        <Steel color={color} metalness={0.7} roughness={0.32} />
      </mesh>
      {[0, 1].map((t) => (
        <mesh key={t} position={start.clone().lerp(end, t)} quaternion={q} castShadow>
          <cylinderGeometry args={[radius * 1.55, radius * 1.55, 0.03, 16]} />
          <Steel color="#b7c3ce" metalness={0.86} roughness={0.22} />
        </mesh>
      ))}
    </group>
  );
}

function Elbow({
  position,
  rotation,
  radius = 0.045,
  color = ORANGE,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  radius?: number;
  color?: string;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <torusGeometry args={[radius * 2.2, radius, 10, 16, Math.PI / 2]} />
      <Steel color={color} metalness={0.7} roughness={0.32} />
    </mesh>
  );
}

function Valve({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <sphereGeometry args={[0.055, 16, 12]} />
        <Steel color="#c5d0da" metalness={0.84} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
        <Steel color={PIPE_BLUE} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.045, 0.01, 8, 16]} />
        <Steel color={PIPE_BLUE} metalness={0.35} roughness={0.45} />
      </mesh>
    </group>
  );
}

function Bolts({ width, height, z }: { width: number; height: number; z: number }) {
  const pts: [number, number][] = [
    [-width / 2, -height / 2],
    [width / 2, -height / 2],
    [-width / 2, height / 2],
    [width / 2, height / 2],
  ];
  return (
    <group position={[0, 0, z]}>
      {pts.map(([x, y]) => (
        <mesh key={`${x}${y}`} position={[x, y, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.02, 8]} />
          <Steel color="#9aa6b2" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Name({
  text,
  position,
  rotation,
  width = 0.9,
  height = 0.16,
  color = BLUE,
}: {
  text: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  color?: string;
}) {
  return <Ink text={text} position={position} rotation={rotation} width={width} height={height} fg={color} bg={null} />;
}

function Hub({ x, n }: { x: number; n: number }) {
  return (
    <group position={[x, 0, -0.15]}>
      {[
        [-0.72, -0.28],
        [0.72, -0.28],
        [-0.72, 0.28],
        [0.72, 0.28],
      ].map(([px, pz]) => (
        <mesh key={`${px}${pz}`} position={[px, 1.15, pz]} castShadow>
          <boxGeometry args={[0.06, 2.2, 0.06]} />
          <Steel color="#c5ced6" metalness={0.82} roughness={0.26} />
        </mesh>
      ))}
      <mesh position={[0, 2.22, 0]} castShadow>
        <boxGeometry args={[1.55, 0.05, 0.66]} />
        <Steel color="#d7e0e8" />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.55, 0.06, 0.7]} />
        <Steel color="#b7c2cc" metalness={0.6} roughness={0.4} />
      </mesh>
      <Name text={`HUB ${n}`} position={[0, 2.38, 0.34]} width={0.7} height={0.14} />

      <group position={[0, 1.72, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.28, 0.72, 0.5]} />
          <Steel color={PAINT} metalness={0.55} roughness={0.38} />
        </mesh>
        <mesh position={[0, 0, 0.252]}>
          <boxGeometry args={[1.18, 0.02, 0.008]} />
          <meshStandardMaterial color="#c5d0da" metalness={0.4} roughness={0.45} />
        </mesh>
        <mesh position={[0.42, -0.12, 0.26]}>
          <boxGeometry args={[0.22, 0.16, 0.01]} />
          <meshStandardMaterial color="#b7c3ce" metalness={0.3} roughness={0.5} />
        </mesh>
        <Bolts width={1.16} height={0.6} z={0.26} />
        <Name text="ECR" position={[0, 0.02, 0.27]} width={0.55} height={0.16} />
      </group>

      <group position={[0, 0.62, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.28, 0.62, 0.46]} />
          <Steel color={DARK} metalness={0.62} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.236]}>
          <boxGeometry args={[1.1, 0.015, 0.008]} />
          <meshStandardMaterial color="#4a545e" metalness={0.5} roughness={0.4} />
        </mesh>
        {[-0.28, 0, 0.28].map((y) => (
          <mesh key={y} position={[0.46, y, 0.24]}>
            <boxGeometry args={[0.16, 0.02, 0.012]} />
            <meshStandardMaterial color="#1c2228" metalness={0.4} roughness={0.5} />
          </mesh>
        ))}
        <Bolts width={1.16} height={0.5} z={0.24} />
        <Name text="DFFC" position={[0, 0, 0.26]} width={0.6} height={0.14} color="#d7e2ee" />
      </group>

      <Pipe a={[0.78, 2.15, 0.05]} b={[0.78, 1.15, 0.05]} radius={0.032} color={ORANGE} />
      <Pipe a={[0.62, 2.05, 0.2]} b={[0.62, 0.95, 0.2]} radius={0.026} color={PIPE_BLUE} />
      <Elbow position={[0.78, 2.15, 0.05]} rotation={[0, 0, 0]} radius={0.032} color={ORANGE} />
      <Valve position={[0.78, 1.35, 0.22]} />
      <mesh position={[0.95, 1.55, 0.16]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
        <meshStandardMaterial color="#f4f7fa" metalness={0.2} roughness={0.35} />
      </mesh>
    </group>
  );
}

function FrontFitout() {
  const hubs = [-4.55, -2.85, -1.15, 0.55];
  return (
    <group>
      {hubs.map((x, i) => (
        <Hub key={x} x={x} n={i + 1} />
      ))}
      <Pipe a={[-5.3, 2.28, 0.05]} b={[2.3, 2.28, 0.05]} radius={0.04} color={ORANGE} />
      <Pipe a={[-5.3, 2.08, 0.22]} b={[2.3, 2.08, 0.22]} radius={0.032} color={PIPE_BLUE} />
      <Pipe a={[-5.1, 1.15, -0.05]} b={[2.1, 1.15, -0.05]} radius={0.028} color={ORANGE} />
      <Pipe a={[-5.1, 0.95, 0.18]} b={[2.1, 0.95, 0.18]} radius={0.024} color={PIPE_BLUE} />

      <group position={[3.15, 1.55, -0.05]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.34, 0.34, 1.15, 28]} />
          <Steel color="#e4ebf1" metalness={0.62} roughness={0.32} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <sphereGeometry args={[0.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Steel color="#e4ebf1" metalness={0.62} roughness={0.32} />
        </mesh>
        {[-0.22, 0.22].map((x) =>
          [-0.22, 0.22].map((z) => (
            <mesh key={`${x}${z}`} position={[x, -0.7, z]}>
              <cylinderGeometry args={[0.03, 0.03, 0.28, 8]} />
              <Steel color="#9aa6b2" />
            </mesh>
          )),
        )}
        <Name text="Trim Reservoir" position={[0, 0.05, 0.36]} width={0.7} height={0.22} />
      </group>

      <group position={[4.25, 1.15, -0.08]}>
        <mesh castShadow>
          <boxGeometry args={[0.78, 1.35, 0.55]} />
          <Steel color="#e8eef3" metalness={0.5} roughness={0.4} />
        </mesh>
        {[-0.28, -0.08, 0.12, 0.32].map((y) => (
          <mesh key={y} position={[0.28, y, 0.28]}>
            <boxGeometry args={[0.16, 0.03, 0.01]} />
            <meshStandardMaterial color="#9aa7b4" metalness={0.45} roughness={0.4} />
          </mesh>
        ))}
        <Bolts width={0.66} height={1.2} z={0.28} />
        <Name text="Battery" position={[0, 0.15, 0.3]} width={0.62} height={0.14} />
      </group>

      <group position={[5.25, 1.35, -0.02]}>
        <mesh castShadow>
          <boxGeometry args={[0.95, 1.85, 0.48]} />
          <Steel color="#eef3f7" metalness={0.48} roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.35, 0.25]}>
          <boxGeometry args={[0.42, 0.28, 0.02]} />
          <meshStandardMaterial color="#14304f" emissive="#1d4e89" emissiveIntensity={0.35} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.15, 0.25]}>
          <boxGeometry args={[0.5, 0.18, 0.015]} />
          <meshStandardMaterial color="#c5d0da" metalness={0.3} roughness={0.45} />
        </mesh>
        <Bolts width={0.82} height={1.68} z={0.25} />
        <Name text="AI/EMS" position={[0, 0.72, 0.27]} width={0.55} height={0.14} />
      </group>

      <group position={[4.15, 0.32, 0.42]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 3.1, 18]} />
          <Steel color="#d5dee6" metalness={0.88} roughness={0.18} />
        </mesh>
        {[-1.1, -0.35, 0.4, 1.15].map((x) => (
          <Valve key={x} position={[x, 0.1, 0]} />
        ))}
        <mesh position={[1.7, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.06, 18]} />
          <Steel color="#c5d0da" metalness={0.9} roughness={0.16} />
        </mesh>
        <Name text="Water Outlet Manifold" position={[0, -0.22, 0.08]} width={1.7} height={0.14} />
        <Name text="To External Collection" position={[1.15, 0.28, 0.08]} width={1.35} height={0.12} />
      </group>
    </group>
  );
}

function BackFitout() {
  return (
    <group>
      <group position={[-1.15, 1.62, 0.35]}>
        <mesh castShadow>
          <boxGeometry args={[7.4, 0.95, 0.72]} />
          <Steel color="#e7eef3" metalness={0.58} roughness={0.34} />
        </mesh>
        {[-2.4, -0.8, 0.8, 2.4].map((x) => (
          <mesh key={x} position={[x, 0, 0.365]}>
            <boxGeometry args={[0.02, 0.95, 0.008]} />
            <meshStandardMaterial color="#b7c3ce" metalness={0.4} roughness={0.45} />
          </mesh>
        ))}
        <Bolts width={7.1} height={0.78} z={0.37} />
        <Name text="Electrolyte Storage Tank" position={[0, 0.02, 0.39]} width={3.2} height={0.22} />
      </group>
      <group position={[-1.15, 0.55, 0.38]}>
        <mesh castShadow>
          <boxGeometry args={[7.4, 0.72, 0.68]} />
          <Steel color="#e4ebf1" metalness={0.58} roughness={0.34} />
        </mesh>
        {[-2.4, -0.8, 0.8, 2.4].map((x) => (
          <mesh key={x} position={[x, 0, 0.345]}>
            <boxGeometry args={[0.02, 0.72, 0.008]} />
            <meshStandardMaterial color="#b7c3ce" metalness={0.4} roughness={0.45} />
          </mesh>
        ))}
        <Name text="Fuel Storage Tank" position={[0, 0, 0.37]} width={2.4} height={0.18} />
      </group>

      {[-5.4, -3.2, -1.0, 1.2].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.1, 0.82]}>
            <boxGeometry args={[0.08, 0.9, 0.08]} />
            <Steel color="#c5ced6" />
          </mesh>
        </group>
      ))}
      <Pipe a={[-4.8, 1.95, 0.78]} b={[2.4, 1.95, 0.78]} radius={0.04} color={ORANGE} />
      <Pipe a={[-4.8, 1.72, 0.9]} b={[2.4, 1.72, 0.9]} radius={0.032} color={PIPE_BLUE} />
      <Pipe a={[-4.8, 1.22, 0.78]} b={[2.4, 1.22, 0.78]} radius={0.036} color={ORANGE} />
      <Pipe a={[-4.8, 0.95, 0.92]} b={[2.2, 0.95, 0.92]} radius={0.028} color={PIPE_BLUE} />

      <group position={[3.55, 1.35, 0.45]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.95, 24]} />
          <Steel color="#e4ebf1" metalness={0.64} roughness={0.3} />
        </mesh>
        <Name text="Trim Reservoir" position={[0, 0, 0.32]} rotation={[0, Math.PI, 0]} width={0.62} height={0.2} />
        <Pipe a={[0.2, 0.7, 0]} b={[0.7, 1.7, 0.2]} radius={0.03} color={PIPE_BLUE} />
        <Pipe a={[-0.15, 0.2, 0.1]} b={[-0.5, 0.9, 0.35]} radius={0.028} color={ORANGE} />
      </group>

      <group position={[4.55, 0.38, 0.55]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 2.2, 18]} />
          <Steel color="#d7e0e8" metalness={0.9} roughness={0.16} />
        </mesh>
        {[-0.7, 0, 0.7].map((x) => (
          <Valve key={x} position={[x, 0.12, 0]} />
        ))}
        <mesh position={[1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.08, 18]} />
          <Steel color="#c5d0da" metalness={0.92} roughness={0.14} />
        </mesh>
        <Name text="Water Outlet Manifold" position={[0.1, -0.24, 0]} rotation={[0, Math.PI, 0]} width={1.6} height={0.14} />
      </group>
    </group>
  );
}

function Shell() {
  return (
    <group>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[12.3, 0.08, 2.5]} />
        <Steel color="#d5dee4" metalness={0.45} roughness={0.42} />
      </mesh>
      {[-5.8, -4.2, -2.6, -1, 0.6, 2.2, 3.8, 5.4].map((x) => (
        <mesh key={x} position={[x, 2.55, 0]}>
          <boxGeometry args={[0.9, 0.04, 2.35]} />
          <Steel color="#eceff2" metalness={0.4} roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0, 2.72, 0]}>
        <boxGeometry args={[12.3, 0.08, 2.55]} />
        <Steel color="#e6ebf0" metalness={0.35} roughness={0.48} />
      </mesh>
      {[-0.9, 0.9].map((z) => (
        <mesh key={z} position={[0, 2.35, z]}>
          <boxGeometry args={[11.6, 0.06, 0.08]} />
          <Steel color="#f4f7fa" metalness={0.2} roughness={0.4} />
        </mesh>
      ))}
      {[-4, -1.2, 1.6, 4.2].map((x) => (
        <mesh key={x} position={[x, 2.42, 0]}>
          <boxGeometry args={[1.4, 0.03, 0.12]} />
          <meshStandardMaterial color="#f7f1df" emissive="#fff4d2" emissiveIntensity={0.7} />
        </mesh>
      ))}
      {[-6.15, 6.15].map((x) => (
        <mesh key={x} position={[x, 1.4, 0]} castShadow>
          <boxGeometry args={[0.08, 2.7, 2.5]} />
          <Steel color="#e8eef3" metalness={0.42} roughness={0.4} />
        </mesh>
      ))}
      <Name text="TES" position={[-6.02, 1.7, 0]} rotation={[0, Math.PI / 2, 0]} width={1.1} height={0.42} />
      <Name
        text="Trinium Energy System"
        position={[-6.02, 1.28, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={1.3}
        height={0.16}
      />
      <mesh position={[0, 0.12, -1.22]}>
        <boxGeometry args={[12.2, 0.08, 0.08]} />
        <Steel color="#c5ced6" />
      </mesh>
      <mesh position={[0, 0.12, 1.22]}>
        <boxGeometry args={[12.2, 0.08, 0.08]} />
        <Steel color="#c5ced6" />
      </mesh>
    </group>
  );
}

function Rig({ view }: { view: TwinView }) {
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const camera = useThree((s) => s.camera);
  const goal = useRef(new THREE.Vector3(...SHOTS.front.pos));
  const look = useRef(new THREE.Vector3(...SHOTS.front.target));
  useEffect(() => {
    const shot = SHOTS[view];
    goal.current.set(...shot.pos);
    look.current.set(...shot.target);
  }, [view]);
  useFrame(() => {
    camera.position.lerp(goal.current, 0.08);
    if (controls) {
      controls.target.lerp(look.current, 0.08);
      controls.update();
    }
  });
  return null;
}

function Scene({ view }: { view: TwinView }) {
  return (
    <>
      <color attach="background" args={["#eef3f7"]} />
      <hemisphereLight args={["#f4f8fc", "#8d98a4", 0.55]} />
      <directionalLight position={[4, 8, -6]} intensity={1.6} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-4, 5, 6]} intensity={0.45} />
      <Environment files="/hdri/warehouse.hdr" environmentIntensity={0.85} background={false} />
      <Shell />
      {view === "front" ? <FrontFitout /> : <BackFitout />}
      <ContactShadows position={[0, 0, 0]} opacity={0.28} scale={16} blur={2.2} far={4} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[30, 18]} />
        <meshPhysicalMaterial color="#f3f6f8" metalness={0.08} roughness={0.18} clearcoat={0.4} />
      </mesh>
      <Rig view={view} />
      <OrbitControls makeDefault enablePan maxPolarAngle={Math.PI / 2.05} minDistance={3.5} maxDistance={16} />
    </>
  );
}

export function ConceptTwin({ view }: { view: TwinView }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: SHOTS.front.pos, fov: 30, near: 0.08, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.02;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <Scene view={view} />
    </Canvas>
  );
}
