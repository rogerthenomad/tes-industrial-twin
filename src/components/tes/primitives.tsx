import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";
import * as THREE from "three";
import { useTes } from "@/lib/tes/store";
import { disposeMaterial, getSurfaces, paintMaterial, tile, type SurfaceKind } from "@/lib/tes/surfaces";

const UP = new THREE.Vector3(0, 1, 0);

export function Pickable({ id, children }: { id: string; children: React.ReactNode }) {
  const setSelected = useTes((s) => s.setSelected);
  const selected = useTes((s) => s.selected);
  const [over, setOver] = useState(false);
  return (
    <Select enabled={over || selected === id}>
      <group
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          setSelected(id);
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setOver(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setOver(false);
          document.body.style.cursor = "default";
        }}
      >
        {children}
      </group>
    </Select>
  );
}

export function useInk(text: string, fg: string, bg: string | null) {
  const tex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const g = canvas.getContext("2d");
    if (!g) return new THREE.CanvasTexture(canvas);
    if (bg) {
      g.fillStyle = bg;
      g.fillRect(0, 0, 1024, 256);
    } else {
      g.clearRect(0, 0, 1024, 256);
    }
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const lines = text.split("\n");
    let size = lines.length > 1 ? 96 : 120;
    const longest = lines.reduce((m, line) => (line.length > m.length ? line : m), "");
    for (; size > 28; size -= 4) {
      g.font = `700 ${size}px Arial, Helvetica, sans-serif`;
      if (g.measureText(longest).width < 960 && size * lines.length * 1.15 < 230) break;
    }
    g.font = `700 ${size}px Arial, Helvetica, sans-serif`;
    const gap = size * 1.15;
    const y0 = 128 - ((lines.length - 1) * gap) / 2;
    for (let i = 0; i < lines.length; i++) g.fillText(lines[i], 512, y0 + i * gap);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }, [text, fg, bg]);

  useLayoutEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

export function Ink({
  text,
  position,
  rotation,
  width = 0.9,
  height = 0.24,
  fg = "#f7fafc",
  bg = "#1b2430",
}: {
  text: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  fg?: string;
  bg?: string | null;
}) {
  const map = useInk(text, fg, bg);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={map}
        transparent
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}

export function Pipe({
  a,
  b,
  radius = 0.04,
  color = "#c56a2d",
  finish,
  flange = false,
}: {
  a: readonly [number, number, number];
  b: readonly [number, number, number];
  radius?: number;
  color?: string;
  finish?: "bare" | "jacket";
  flange?: boolean;
}) {
  const quality = useTes((s) => s.quality);
  const span = useMemo(() => {
    const start = new THREE.Vector3(a[0], a[1], a[2]);
    const end = new THREE.Vector3(b[0], b[1], b[2]);
    const dir = end.clone().sub(start);
    const len = Math.max(dir.length(), 0.001);
    const mid = start.clone().addScaledVector(dir, 0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
    return { len, pos: [mid.x, mid.y, mid.z] as [number, number, number], q };
  }, [a, b]);
  const kind = finish ?? (color.toLowerCase() === "#c5d0da" || color.toLowerCase() === "#d5dee6" || color.toLowerCase() === "#b7c3ce" ? "bare" : "jacket");
  const mat = useMemo(() => {
    const set = getSurfaces(quality)[kind === "jacket" ? "jacket" : "brushed"];
    return paintMaterial(
      set,
      [2, Math.max(1, span.len / 0.35)],
      color,
      kind === "jacket" ? 0.08 : 0.84,
      kind === "jacket" ? 0.82 : 0.32,
      THREE.FrontSide,
      kind === "jacket" ? 0.04 : 0.22,
    );
  }, [quality, kind, color, span.len]);
  useLayoutEffect(() => () => disposeMaterial(mat), [mat]);
  const seg = quality === "high" ? 20 : 12;

  return (
    <group>
      <mesh position={span.pos} quaternion={span.q} material={mat} castShadow>
        <cylinderGeometry args={[radius, radius, span.len, seg]} />
      </mesh>
      {flange
        ? ([-1, 1] as const).map((s) => (
            <group key={s} position={span.pos} quaternion={span.q}>
              <group position={[0, s * (span.len * 0.5 + radius * 0.22), 0]}>
                <mesh>
                  <cylinderGeometry args={[radius * 1.85, radius * 1.85, Math.max(0.016, radius * 0.36), seg]} />
                  <meshPhysicalMaterial color="#e7eef3" metalness={0.94} roughness={0.16} clearcoat={0.55} envMapIntensity={1.4} />
                </mesh>
                {Array.from({ length: 6 }, (_, i) => {
                  const ang = (i / 6) * Math.PI * 2;
                  const bolt = radius * 1.32;
                  return (
                    <mesh key={i} position={[Math.cos(ang) * bolt, 0, Math.sin(ang) * bolt]}>
                      <cylinderGeometry args={[radius * 0.18, radius * 0.18, radius * 0.62, 6]} />
                      <meshStandardMaterial color="#8e99a4" metalness={0.8} roughness={0.32} />
                    </mesh>
                  );
                })}
              </group>
            </group>
          ))
        : null}
    </group>
  );
}

export function Beads({
  a,
  b,
  color,
  count = 8,
  speed = 0.3,
}: {
  a: readonly [number, number, number];
  b: readonly [number, number, number];
  color: string;
  count?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const phase = useRef(0);
  const reduce = useRef(false);
  const scratch = useRef({
    dir: new THREE.Vector3(),
    up: new THREE.Vector3(0, 1, 0),
    aim: new THREE.Quaternion(),
  });
  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const step = Math.min(delta, 0.033);
    if (!reduce.current) phase.current = (phase.current + speed * step) % 1;
    const { dir, up, aim } = scratch.current;
    dir.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    if (dir.lengthSq() < 1e-8) dir.set(0, 1, 0);
    else dir.normalize();
    aim.setFromUnitVectors(up, dir);
    for (let i = 0; i < count; i++) {
      const t = (phase.current + i / count) % 1;
      const fade = Math.sin(Math.PI * t);
      const scale = 0.45 + 0.55 * fade;
      dummy.position.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
      dummy.quaternion.copy(aim);
      dummy.scale.set(scale * 0.72, scale * 1.6, scale * 0.72);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  const geo = useMemo(() => new THREE.SphereGeometry(0.032, 10, 8), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color, toneMapped: false }), [color]);
  useLayoutEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  return <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} />;
}

export function Valve({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.034, 14, 12]} />
        <meshPhysicalMaterial color="#e4ebf1" metalness={0.94} roughness={0.16} clearcoat={0.5} envMapIntensity={1.35} />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.016, 0.04, 10]} />
        <meshPhysicalMaterial color="#c5d0da" metalness={0.9} roughness={0.2} envMapIntensity={1.3} />
      </mesh>
      <mesh position={[0, 0.058, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.008, 12]} />
        <meshPhysicalMaterial color="#d5dee6" metalness={0.92} roughness={0.18} envMapIntensity={1.3} />
      </mesh>
      <mesh position={[0.045, 0.07, 0]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[0.1, 0.008, 0.01]} />
        <meshPhysicalMaterial color="#b7c3ce" metalness={0.88} roughness={0.22} envMapIntensity={1.2} />
      </mesh>
    </group>
  );
}

export function RibWall({
  width,
  height,
  ribs,
  position,
  rotation,
}: {
  width: number;
  height: number;
  ribs: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const quality = useTes((s) => s.quality);
  const step = width / ribs;
  const plate = useMemo(
    () =>
      paintMaterial(
        getSurfaces(quality).container,
        [Math.max(1, width / 1.15), Math.max(1, height / 0.85)],
        "#e4ebf1",
        0.62,
        0.42,
        THREE.DoubleSide,
        0.12,
        1.45,
      ),
    [quality, width, height],
  );
  const rib = useMemo(
    () =>
      paintMaterial(
        getSurfaces(quality).container,
        [1.2, Math.max(1, height / 0.7)],
        "#d5dee6",
        0.7,
        0.36,
        THREE.DoubleSide,
        0.16,
        1.45,
      ),
    [quality, height],
  );
  useLayoutEffect(
    () => () => {
      disposeMaterial(plate);
      disposeMaterial(rib);
    },
    [plate, rib],
  );
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow material={plate}>
        <boxGeometry args={[width, height, 0.045]} />
      </mesh>
      {Array.from({ length: ribs }, (_, i) => (
        <mesh key={i} position={[-width / 2 + step * (i + 0.5), 0, 0.062]} castShadow material={rib}>
          <boxGeometry args={[step * 0.42, height, 0.09]} />
        </mesh>
      ))}
    </group>
  );
}

export function Skin({
  kind,
  repeat = [1, 1],
  color = "#ffffff",
  metalness = 0.45,
  roughness = 0.5,
  clearcoat = 0,
  side = THREE.FrontSide,
}: {
  kind: SurfaceKind;
  repeat?: [number, number];
  color?: string;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
  side?: THREE.Side;
}) {
  const quality = useTes((s) => s.quality);
  const [rx, ry] = repeat;
  const maps = useMemo(() => tile(getSurfaces(quality)[kind], rx, ry), [quality, kind, rx, ry]);
  useLayoutEffect(
    () => () => {
      maps.map.dispose();
      maps.normalMap?.dispose();
      maps.roughnessMap.dispose();
    },
    [maps],
  );
  return (
    <meshPhysicalMaterial
      color={color}
      map={maps.map}
      normalMap={maps.normalMap ?? undefined}
      roughnessMap={maps.roughnessMap}
      metalness={metalness}
      roughness={roughness}
      clearcoat={clearcoat}
      side={side}
      envMapIntensity={metalness > 0.5 ? 1.45 : 0.7}
      normalScale={maps.normalMap ? (metalness > 0.55 ? [0.9, 0.9] : [0.65, 0.65]) : [0, 0]}
    />
  );
}

export function Placard({
  text,
  position,
  rotation,
  width = 1.1,
  height = 0.22,
  fg = "#0c3f86",
  tone = "white",
}: {
  text: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  fg?: string;
  tone?: "white" | "caution";
}) {
  const plate = tone === "caution" ? "#e2b143" : "#f4f7fa";
  const ink = tone === "caution" ? "#1a1408" : fg;
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[width, height, 0.016]} />
        <meshStandardMaterial color={plate} metalness={0.12} roughness={0.58} />
      </mesh>
      <Ink text={text} position={[0, 0, 0.01]} width={width * 0.9} height={height * 0.7} fg={ink} bg={null} />
    </group>
  );
}

export function FlowMark({
  position,
  rotation,
  color = "#1d4e89",
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}) {
  const map = useMemo(() => {
    const el = document.createElement("canvas");
    el.width = 256;
    el.height = 64;
    const g = el.getContext("2d");
    if (!g) return new THREE.CanvasTexture(el);
    g.clearRect(0, 0, 256, 64);
    g.strokeStyle = color;
    g.fillStyle = color;
    g.lineWidth = 10;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(16, 32);
    g.lineTo(176, 32);
    g.stroke();
    g.beginPath();
    g.moveTo(168, 14);
    g.lineTo(236, 32);
    g.lineTo(168, 50);
    g.closePath();
    g.fill();
    const tex = new THREE.CanvasTexture(el);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [color]);
  useLayoutEffect(() => () => map.dispose(), [map]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[0.42, 0.1]} />
      <meshBasicMaterial map={map} transparent toneMapped={false} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

export function Cage({
  width,
  height,
  depth,
  y,
  color = "#1c7a45",
}: {
  width: number;
  height: number;
  depth: number;
  y: number;
  color?: string;
}) {
  const t = 0.018;
  const posts: [number, number, number][] = [
    [-width / 2, y, -depth / 2],
    [width / 2, y, -depth / 2],
    [-width / 2, y, depth / 2],
    [width / 2, y, depth / 2],
  ];
  return (
    <group>
      {posts.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[t, height, t]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
