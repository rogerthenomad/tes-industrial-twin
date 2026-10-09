import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { CT, HUB_X } from "@/lib/tes/layout";
import { useTes } from "@/lib/tes/store";
import { Beads, Cage, FlowMark, Ink, Pickable, Pipe, Placard, RibWall, Skin, Valve } from "@/components/tes/primitives";
import { CableTray, CabinetFace, Gauge, PanelButtons, SkidPost } from "@/components/tes/hardware";

const BASE = 0.2;
const FUEL = "#d07a3a";
const BLUE = "#3d7ec4";
const STEEL = "#b7c3ce";

function Logo() {
  const [map, setMap] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let alive = true;
    loader.load("/brand/civis-mark.png", (tex) => {
      if (!alive) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.needsUpdate = true;
      setMap(tex);
    });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => () => map?.dispose(), [map]);
  return (
    <group>
      <mesh position={[-CT.L / 2 - 0.025, 1.62, 0.62]} castShadow>
        <boxGeometry args={[0.03, 1.45, 0.09]} />
        <meshStandardMaterial color="#1c7a45" roughness={0.35} metalness={0.15} />
      </mesh>
      {map ? (
        <mesh position={[-CT.L / 2 - 0.032, 1.88, -0.12]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.78, 0.78]} />
          <meshBasicMaterial map={map} transparent alphaTest={0.04} toneMapped={false} />
        </mesh>
      ) : null}
      <Ink
        text="CIVIS TECH GLOBAL"
        position={[-CT.L / 2 - 0.03, 0.7, -0.12]}
        rotation={[0, -Math.PI / 2, 0]}
        width={1.45}
        height={0.14}
        fg="#0c3f86"
        bg={null}
      />
      <Ink
        text="TES"
        position={[-CT.L / 2 - 0.03, 1.28, -0.12]}
        rotation={[0, -Math.PI / 2, 0]}
        width={1.05}
        height={0.32}
        fg="#0c3f86"
        bg={null}
      />
      <Ink
        text="Trinium Energy System"
        position={[-CT.L / 2 - 0.03, 0.95, -0.12]}
        rotation={[0, -Math.PI / 2, 0]}
        width={1.7}
        height={0.22}
        fg="#10233f"
        bg={null}
      />
    </group>
  );
}

function Shell({ open }: { open: "front" | "back" | "both" }) {
  const yMid = CT.H / 2;
  return (
    <group>
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[CT.L, 0.16, CT.W]} />
        <Skin kind="brushed" repeat={[8, 2]} color="#3e4852" metalness={0.78} roughness={0.38} />
      </mesh>
      <mesh position={[0, BASE - 0.04, 0]} receiveShadow>
        <boxGeometry args={[CT.L - 0.16, 0.08, CT.W - 0.18]} />
        <Skin kind="panel" repeat={[8, 2]} color="#d5dee6" metalness={0.32} roughness={0.55} />
      </mesh>
      <RibWall width={CT.W} height={CT.H} ribs={8} position={[-CT.L / 2 + 0.02, yMid, 0]} rotation={[0, Math.PI / 2, 0]} />
      <RibWall width={CT.W} height={CT.H} ribs={8} position={[CT.L / 2 - 0.02, yMid, 0]} rotation={[0, -Math.PI / 2, 0]} />
      {open !== "back" && open !== "both" ? (
        <RibWall width={CT.L} height={CT.H} ribs={34} position={[0, yMid, -CT.W / 2 + 0.02]} />
      ) : null}
      {open === "back" ? (
        <RibWall width={CT.L} height={CT.H} ribs={34} position={[0, yMid, CT.W / 2 - 0.02]} rotation={[0, Math.PI, 0]} />
      ) : null}
      {open !== "both" ? (
        <RibWall width={CT.L} height={CT.W} ribs={34} position={[0, CT.H - 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      ) : (
        [-4.2, -1.4, 1.4, 4.2].map((x) => (
          <mesh key={x} position={[x, CT.H - 0.06, 0]}>
            <boxGeometry args={[0.08, 0.08, CT.W]} />
            <meshStandardMaterial color="#8d9aaa" metalness={0.7} roughness={0.3} />
          </mesh>
        ))
      )}
      {([-1, 1] as const).map((z) => (
        <group key={z}>
          <mesh position={[0, 0.22, (z * CT.W) / 2]}>
            <boxGeometry args={[CT.L, 0.1, 0.08]} />
            <meshStandardMaterial color="#4a5562" metalness={0.65} roughness={0.35} />
          </mesh>
          <mesh position={[0, CT.H - 0.08, (z * CT.W) / 2]}>
            <boxGeometry args={[CT.L, 0.1, 0.08]} />
            <meshStandardMaterial color="#d5dee6" metalness={0.6} roughness={0.32} />
          </mesh>
        </group>
      ))}
      {(
        [
          [-1, -1, 0.12],
          [1, -1, 0.12],
          [-1, 1, 0.12],
          [1, 1, 0.12],
          [-1, -1, CT.H - 0.12],
          [1, -1, CT.H - 0.12],
          [-1, 1, CT.H - 0.12],
          [1, 1, CT.H - 0.12],
        ] as const
      ).map(([x, z, y], i) => (
        <mesh key={i} position={[(x * CT.L) / 2, y, (z * CT.W) / 2]} castShadow>
          <boxGeometry args={[0.18, 0.24, 0.18]} />
          <meshStandardMaterial color="#2f3842" metalness={0.55} roughness={0.4} />
        </mesh>
      ))}
      <Logo />
      {[-3.6, -0.8, 2, 4.4].map((x) => (
        <mesh key={x} position={[x, CT.H - 0.22, 0]}>
          <boxGeometry args={[1.15, 0.035, 0.08]} />
          <meshBasicMaterial color="#f4f8ff" toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[-2, 2.3, 0.2]} intensity={2.2} distance={8} color="#f3f7ff" />
      <pointLight position={[3, 2.2, 0.1]} intensity={1.6} distance={7} color="#f3f7ff" />
    </group>
  );
}

function Hmi({ position }: { position: [number, number, number] }) {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return { canvas, texture, ctx: canvas.getContext("2d") };
  }, []);
  const acc = useRef(0);
  useFrame((_, delta) => {
    acc.current += Math.min(delta, 0.1);
    if (acc.current < 0.25 || !map.ctx) return;
    acc.current = 0;
    const g = map.ctx;
    const t = performance.now() / 1000;
    g.fillStyle = "#07182e";
    g.fillRect(0, 0, 512, 320);
    g.fillStyle = "#9fd0ff";
    g.font = "600 28px Arial, Helvetica, sans-serif";
    g.fillText("TES  ·  DISCHARGE", 24, 40);
    g.font = "500 18px Arial, Helvetica, sans-serif";
    g.fillStyle = "#7f9bb8";
    g.fillText("Hubs online", 24, 78);
    for (let i = 0; i < 4; i++) {
      const h = 70 + Math.sin(t * 1.4 + i) * 18;
      g.fillStyle = i === 2 ? "#c56a2d" : "#1c7a45";
      g.fillRect(28 + i * 70, 210 - h, 42, h);
      g.fillStyle = "#d5e6f5";
      g.fillText(String(i + 1), 40 + i * 70, 236);
    }
    g.strokeStyle = "#7ec8ff";
    g.lineWidth = 3;
    g.beginPath();
    for (let x = 0; x <= 160; x++) {
      const y = 92 + Math.sin(x * 0.08 + t * 2) * 16 + Math.sin(x * 0.02) * 8;
      if (x === 0) g.moveTo(300 + x, y);
      else g.lineTo(300 + x, y);
    }
    g.stroke();
    g.fillStyle = "#d5e6f5";
    g.fillText("Power", 300, 150);
    g.fillText("Water", 300, 190);
    map.texture.needsUpdate = true;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[0.5, 0.32, 0.03]} />
        <meshStandardMaterial color="#101820" />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.44, 0.26]} />
        <meshBasicMaterial map={map.texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Hub({ index, x, rich }: { index: number; x: number; rich: boolean }) {
  const explode = useTes((s) => s.explode);
  const isolated = useTes((s) => s.isolatedHub);
  const selected = useTes((s) => s.selected);
  const dim = isolated !== null && isolated !== index;
  const hot = selected === `hub-${index}` || isolated === index;
  const lift = explode * 0.48;
  return (
    <group position={[x, BASE, 0]}>
      <Pickable id={`hub-${index}`}>
        {[-0.62, 0.62].map((px) =>
          [-0.26, 0.26].map((pz) => (
            <SkidPost key={`${px}-${pz}`} position={[px, 0, pz]} height={2.1} />
          )),
        )}
        <mesh position={[0, 2.12, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 1.28, 12]} />
          <meshStandardMaterial color="#b7c3ce" metalness={0.75} roughness={0.3} />
        </mesh>
        <Placard text={`HUB ${index + 1}`} position={[0, 2.08, 0.16]} width={0.42} height={0.12} />
      </Pickable>
      <group position={[0, lift, 0]}>
        <Pickable id="ecr">
          <RoundedBox args={[1.22, 0.86, 0.4]} radius={0.04} smoothness={3} position={[0, 1.48, 0]} castShadow>
            <Skin kind="panel" repeat={[1, 1]} color="#e7eef3" metalness={0.42} roughness={0.4} clearcoat={0.22} />
          </RoundedBox>
          <mesh position={[0, 1.48, 0.21]}>
            <boxGeometry args={[0.9, 0.02, 0.012]} />
            <meshStandardMaterial color="#b7c4d0" metalness={0.4} roughness={0.45} />
          </mesh>
          <Placard text="ECR" position={[0, 1.72, 0.23]} width={0.36} height={0.12} />
        </Pickable>
        {rich ? (
          <Pickable id="anolyte">
            <mesh position={[-0.78, 1.35, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.32, 16]} />
              <meshPhysicalMaterial color="#d5dde4" metalness={0.8} roughness={0.22} />
            </mesh>
            <mesh position={[-0.78, 1.56, 0]}>
              <sphereGeometry args={[0.1, 16, 12]} />
              <meshStandardMaterial color="#cfd8e0" metalness={0.7} roughness={0.25} />
            </mesh>
          </Pickable>
        ) : null}
      </group>
      <Pickable id="fuel-cell">
        <RoundedBox args={[1.12, 0.71, 0.38]} radius={0.04} smoothness={3} position={[0, 0.58, 0]} castShadow>
          <meshPhysicalMaterial color="#1c2430" metalness={0.45} roughness={0.38} />
        </RoundedBox>
        <Placard text="FUEL CELL" position={[0, 0.72, 0.22]} width={0.52} height={0.12} />
        <mesh position={[0.42, 0.82, 0.2]}>
          <boxGeometry args={[0.12, 0.08, 0.04]} />
          <meshStandardMaterial color="#1a222c" />
        </mesh>
        <mesh position={[0.42, 0.82, 0.22]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          <meshBasicMaterial color="#1c7a45" toneMapped={false} />
        </mesh>
      </Pickable>
      <Pipe a={[0, 2.28, 0.12]} b={[0, 1.95 + lift, 0.12]} radius={0.028} color={BLUE} />
      <Pipe a={[0.18, 2.42, 0.02]} b={[0.18, 1.05, 0.02]} radius={0.03} color={FUEL} />
      <Valve position={[0.18, 1.25, 0.02]} />
      {rich ? <Valve position={[0, 1.9 + lift * 0.2, 0.12]} /> : null}
      {dim ? (
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[1.45, 2.35, 0.85]} />
          <meshBasicMaterial color="#0d1b2e" transparent opacity={0.42} depthWrite={false} />
        </mesh>
      ) : null}
      {hot ? <Cage width={1.4} height={2.25} depth={0.72} y={1.15} /> : null}
    </group>
  );
}

function FrontFitout({ rich }: { rich: boolean }) {
  const flow = useTes((s) => s.flow);
  return (
    <group>
      {HUB_X.map((x, i) => (
        <Hub key={x} index={i} x={x} rich={rich} />
      ))}
      <Pipe a={[-5.4, 2.48, 0.08]} b={[5.5, 2.48, 0.08]} radius={0.045} color={FUEL} flange />
      <Pipe a={[-5.4, 2.3, 0.2]} b={[5.5, 2.3, 0.2]} radius={0.04} color={BLUE} flange />
      <Pipe a={[-5.4, 2.14, -0.05]} b={[5.3, 2.14, -0.05]} radius={0.032} color={STEEL} flange finish="bare" />
      <Pipe a={[-5.2, 2.7, -0.02]} b={[5.2, 2.7, -0.02]} radius={0.03} color="#f6f3ec" finish="jacket" flange />
      <Placard text="FUEL" position={[0.2, 2.66, 0.08]} width={0.46} height={0.14} tone="caution" />
      <Placard text="WATER" position={[0.2, 2.46, 0.2]} width={0.58} height={0.13} fg="#0c3f86" />
      <Placard text="RETURN" position={[1.7, 2.7, 0.14]} width={0.58} height={0.12} />
      <FlowMark position={[-2.4, 2.56, 0.16]} color="#c45a1a" />
      <FlowMark position={[-2.4, 2.38, 0.28]} color="#1d4e89" />
      <Placard text="ISOLATE TO SERVICE" position={[4.7, 0.46, 1.16]} width={1.42} height={0.16} tone="caution" />
      {HUB_X.map((x) => (
        <group key={`drop-${x}`}>
          <mesh position={[x + 0.18, 2.48, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.03, 12]} />
            <meshStandardMaterial color="#9aa6b2" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[x, 2.3, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.03, 12]} />
            <meshStandardMaterial color="#9aa6b2" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
      ))}
      {flow === "fuel"
        ? HUB_X.map((x) => (
            <Beads key={`f-${x}`} a={[x + 0.18, 2.48, 0.08]} b={[x + 0.18, 1.05, 0.08]} color="#ffb15a" />
          ))
        : null}
      {flow === "fuel" ? <Beads a={[-5.2, 2.48, 0.08]} b={[5.2, 2.48, 0.08]} color="#ffb15a" count={14} /> : null}
      {flow === "carbon" ? <Beads a={[-5.2, 2.3, 0.22]} b={[5.2, 2.3, 0.22]} color="#7ee0d6" count={14} /> : null}
      {flow === "water" ? (
        <>
          <Beads a={[-5.2, 2.3, 0.2]} b={[5.2, 2.3, 0.2]} color="#8ec6ff" count={16} speed={0.1} />
          {HUB_X.map((x) => (
            <Beads key={`w-${x}`} a={[x, 2.3, 0.2]} b={[x, 1.15, 0.2]} color="#8ec6ff" count={8} speed={0.12} />
          ))}
          <Beads a={[1.2, 0.42, 0.7]} b={[5.5, 0.42, 0.7]} color="#8ec6ff" count={14} speed={0.12} />
        </>
      ) : null}
      {flow === "power" ? (
        <>
          <Beads a={[-5.2, 1.92, 0.95]} b={[5.2, 1.92, 0.95]} color="#7dff9a" count={16} speed={0.16} />
          {HUB_X.map((x) => (
            <Beads key={`p-${x}`} a={[x, 1.92, 0.95]} b={[x + 0.2, 1.05, 0.35]} color="#5dff9a" count={7} speed={0.18} />
          ))}
        </>
      ) : null}
      {flow === "oxygen" ? <Beads a={[-5, 2.14, -0.05]} b={[4.2, 2.14, -0.05]} color="#d5f6ff" count={12} /> : null}
      {flow === "thermal" ? <Beads a={[-4.5, 2.55, -0.2]} b={[5.2, 2.55, -0.2]} color="#ff8d73" count={12} /> : null}

      <Pickable id="trim">
        <group position={[1.85, BASE, 0]}>
          {[-0.22, 0.22].map((x) =>
            [-0.16, 0.16].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, 0.28, z]}>
                <boxGeometry args={[0.04, 0.56, 0.04]} />
                <meshStandardMaterial color="#9aa7b4" metalness={0.7} roughness={0.3} />
              </mesh>
            )),
          )}
          <mesh position={[0, 0.95, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.7, 20]} />
            <meshPhysicalMaterial color="#e7eef3" metalness={0.72} roughness={0.22} clearcoat={0.35} />
          </mesh>
          <mesh position={[0, 0.52, 0]}>
            <cylinderGeometry args={[0.28, 0.1, 0.22, 20]} />
            <meshStandardMaterial color="#d5dee6" metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh position={[0, 1.32, 0]}>
            <sphereGeometry args={[0.28, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#e7eef3" metalness={0.7} roughness={0.22} />
          </mesh>
          <Placard text="TRIM" position={[0, 0.95, 0.3]} width={0.38} height={0.11} />
        </group>
      </Pickable>

      <Pickable id="battery">
        <group position={[3.2, BASE + 0.78, 0]}>
          <RoundedBox args={[0.78, 1.5, 0.52]} radius={0.03} smoothness={2} castShadow>
            <meshPhysicalMaterial color="#e4eaef" metalness={0.45} roughness={0.4} />
          </RoundedBox>
          {[0.35, 0.15, -0.05, -0.25].map((y) => (
            <mesh key={y} position={[0, y, 0.27]}>
              <boxGeometry args={[0.5, 0.035, 0.012]} />
              <meshStandardMaterial color="#8b97a3" />
            </mesh>
          ))}
          <group position={[0, 0, 0.27]}>
            <CabinetFace width={0.78} height={1.5} />
          </group>
          <Placard text="BATTERY" position={[0, 0.58, 0.29]} width={0.4} height={0.1} />
        </group>
      </Pickable>

      <Pickable id="ems">
        <group position={[4.55, BASE + 0.95, 0]}>
          <RoundedBox args={[0.9, 1.85, 0.5]} radius={0.03} smoothness={2} castShadow>
            <meshPhysicalMaterial color="#e6ebf0" metalness={0.4} roughness={0.42} />
          </RoundedBox>
          <Hmi position={[0, 0.35, 0.27]} />
          <group position={[0, 0, 0.26]}>
            <CabinetFace width={0.9} height={1.85} />
          </group>
          <Placard text="EMS" position={[0, 0.72, 0.29]} width={0.32} height={0.1} />
          <PanelButtons position={[0, -0.45, 0.28]} />
          <mesh position={[0.28, 0.72, 0.27]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#1c7a45" toneMapped={false} />
          </mesh>
        </group>
      </Pickable>

      <Pickable id="water">
        <group>
          <Pipe a={[1.05, BASE + 0.22, 0.62]} b={[5.55, BASE + 0.22, 0.62]} radius={0.055} color="#d5dee6" flange finish="bare" />
          <mesh position={[5.62, BASE + 0.22, 0.62]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
            <meshStandardMaterial color="#c5d0da" metalness={0.75} roughness={0.25} />
          </mesh>
          <mesh position={[5.78, BASE + 0.22, 0.62]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.06, 0.12, 12]} />
            <meshStandardMaterial color="#2f6fad" />
          </mesh>
          <FlowMark position={[4.15, BASE + 0.36, 0.7]} color="#1d4e89" />
          <Placard text="WATER OUTLET" position={[5.2, BASE + 0.48, 0.78]} width={0.7} height={0.14} />
        </group>
      </Pickable>

      <CableTray from={[-5.2, 1.92, 0.95]} to={[5.4, 1.92, 0.95]} />
      {[0, 0.12, -0.12, 0.24].map((z, i) => (
        <Pipe
          key={z}
          a={[5.25, BASE + 0.3, z]}
          b={[5.25, 2.35, z]}
          radius={0.028}
          color={i % 2 === 0 ? BLUE : FUEL}
        />
      ))}

      {rich ? (
        <>
          <Pickable id="condenser">
            <group position={[2.3, BASE + 0.85, 0.35]}>
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.16, 0.16, 0.7, 16]} />
                <meshPhysicalMaterial color="#dfe6ec" metalness={0.75} roughness={0.25} />
              </mesh>
              <Placard text="WATER RECOVERY" position={[0, 0.24, 0]} width={0.62} height={0.12} />
            </group>
          </Pickable>
          <Pickable id="power">
            <mesh position={[4.55, BASE + 0.28, 0.42]}>
              <boxGeometry args={[0.7, 0.22, 0.28]} />
              <meshStandardMaterial color="#2c3440" metalness={0.5} roughness={0.4} />
            </mesh>
            <Placard text="POWER" position={[4.55, BASE + 0.48, 0.56]} width={0.4} height={0.1} />
          </Pickable>
          <Pickable id="pump">
            <group position={[3.25, BASE + 0.38, 0.12]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 0.18, 16]} />
                <meshStandardMaterial color="#8e99a3" metalness={0.62} roughness={0.34} />
              </mesh>
              <mesh position={[0, 0, 0.14]}>
                <boxGeometry args={[0.16, 0.14, 0.12]} />
                <meshStandardMaterial color="#2c3440" metalness={0.45} roughness={0.4} />
              </mesh>
              <Placard text="PUMP" position={[0, 0.18, 0.22]} width={0.28} height={0.09} />
            </group>
          </Pickable>
          <Pickable id="co2">
            <group position={[5.55, 1.45, 0.2]}>
              <mesh castShadow>
                <boxGeometry args={[0.28, 0.42, 0.22]} />
                <meshStandardMaterial color="#5e6d68" metalness={0.35} roughness={0.48} />
              </mesh>
              <Pipe a={[0, 0.2, 0]} b={[-1.1, 0.55, -0.05]} radius={0.018} color="#8aa097" finish="bare" />
              <Placard text="CO2" position={[0, 0.28, 0.14]} width={0.24} height={0.09} />
            </group>
          </Pickable>
          <Pickable id="safety">
            <group position={[-5.55, 1.25, 0.95]}>
              <mesh castShadow>
                <boxGeometry args={[0.22, 0.22, 0.06]} />
                <meshStandardMaterial color="#c44732" roughness={0.45} />
              </mesh>
              <mesh position={[0, 0, 0.04]}>
                <cylinderGeometry args={[0.045, 0.045, 0.03, 12]} />
                <meshStandardMaterial color="#f2d36b" />
              </mesh>
              <mesh position={[0.45, 0.55, -0.15]}>
                <boxGeometry args={[0.7, 0.28, 0.04]} />
                <meshStandardMaterial color="#243246" metalness={0.4} roughness={0.5} />
              </mesh>
              <Placard text="E-STOP" position={[0.45, 0.55, -0.1]} width={0.36} height={0.1} tone="caution" />
            </group>
          </Pickable>
        </>
      ) : null}
    </group>
  );
}

function BackFitout({ rich }: { rich: boolean }) {
  const flow = useTes((s) => s.flow);
  return (
    <group>
      <Pickable id="electrolyte-tank">
        <group position={[-1.7, BASE + 1.55, 0.05]}>
          <RoundedBox args={[7.01, 0.81, 0.91]} radius={0.06} smoothness={3} castShadow>
            <Skin kind="brushed" repeat={[4, 1]} color="#e7eef3" metalness={0.74} roughness={0.26} clearcoat={0.35} />
          </RoundedBox>
          {[-2.6, 2.6].map((x) => (
            <mesh key={x} position={[x, -0.46, 0]} castShadow>
              <boxGeometry args={[0.08, 0.1, 0.95]} />
              <meshPhysicalMaterial color="#8d98a4" metalness={0.82} roughness={0.28} />
            </mesh>
          ))}
          <mesh position={[3.45, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.16, 12]} />
            <meshPhysicalMaterial color="#d5dee6" metalness={0.9} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0, 0.49]}>
            <boxGeometry args={[6.4, 0.015, 0.01]} />
            <meshStandardMaterial color="#b7c4d0" />
          </mesh>
          <Placard
            text="ELECTROLYTE"
            position={[0, 0.08, 0.48]}
            width={1.15}
            height={0.16}
          />
          <Gauge position={[2.6, 0.2, 0.5]} rotation={[Math.PI / 2, 0, 0]} />
          <Gauge position={[-2.6, 0.2, 0.5]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      </Pickable>
      <Pickable id="fuel-tank">
        <group position={[-1.7, BASE + 0.62, 0.05]}>
          <RoundedBox args={[7.01, 0.81, 0.91]} radius={0.06} smoothness={3} castShadow>
            <Skin kind="brushed" repeat={[4, 1]} color="#f3f1ea" metalness={0.7} roughness={0.3} clearcoat={0.28} />
          </RoundedBox>
          {[-2.6, 2.6].map((x) => (
            <mesh key={x} position={[x, -0.46, 0]} castShadow>
              <boxGeometry args={[0.08, 0.1, 0.95]} />
              <meshPhysicalMaterial color="#8d98a4" metalness={0.82} roughness={0.28} />
            </mesh>
          ))}
          <mesh position={[3.45, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.16, 12]} />
            <meshPhysicalMaterial color="#e7eef3" metalness={0.9} roughness={0.18} />
          </mesh>
          <Placard text="FUEL" position={[0, 0.08, 0.48]} width={0.7} height={0.16} />
          <Gauge position={[2.4, 0.15, 0.5]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      </Pickable>
      <Pipe a={[-5.2, 1.15, -0.62]} b={[2.2, 1.15, -0.62]} radius={0.04} color={FUEL} flange />
      <Pipe a={[-5.2, 2.05, -0.62]} b={[2.2, 2.05, -0.62]} radius={0.038} color={BLUE} flange />
      <Pipe a={[-5.1, 1.7, -0.5]} b={[1.6, 1.7, -0.5]} radius={0.028} color={STEEL} finish="bare" />
      {flow === "fuel" ? <Beads a={[-5, 1.15, -0.62]} b={[2, 1.15, -0.62]} color="#ffb15a" count={12} /> : null}
      {flow === "carbon" ? <Beads a={[-5, 2.05, -0.62]} b={[2, 2.05, -0.62]} color="#7ee0d6" count={12} /> : null}
      <Pickable id="trim">
        <group position={[3.55, BASE, -0.05]}>
          <mesh position={[0, 1.05, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.85, 20]} />
            <meshPhysicalMaterial color="#e7eef3" metalness={0.72} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.32, 0.12, 0.28, 20]} />
            <meshStandardMaterial color="#d5dee6" metalness={0.7} roughness={0.25} />
          </mesh>
          <Ink
            text={"TRIM\nRESERVOIR"}
            position={[0, 1.05, -0.36]}
            rotation={[0, Math.PI, 0]}
            width={0.55}
            height={0.32}
            fg="#0c3f86"
            bg={null}
          />
        </group>
      </Pickable>
      {[0, 0.14, -0.14].map((z, i) => (
        <Pipe
          key={z}
          a={[4.7, BASE + 0.35, -0.55 + z]}
          b={[4.7, 2.3, -0.55 + z]}
          radius={0.03}
          color={i === 1 ? FUEL : BLUE}
        />
      ))}
      <Pickable id="water">
        <group>
          <Pipe a={[2.4, BASE + 0.24, -0.7]} b={[5.6, BASE + 0.24, -0.7]} radius={0.07} color="#d5dee6" flange finish="bare" />
          <mesh position={[5.7, BASE + 0.24, -0.7]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.11, 0.11, 0.05, 16]} />
            <meshStandardMaterial color="#c5d0da" metalness={0.75} roughness={0.25} />
          </mesh>
          <Placard
            text="WATER OUTLET"
            position={[3.8, BASE + 0.52, -0.7]}
            rotation={[0, Math.PI, 0]}
            width={1.2}
            height={0.18}
            fg="#0c3f86"
          />
        </group>
      </Pickable>
      {rich
        ? [-2.8, -0.6].map((x) => (
            <mesh key={x} position={[x, BASE + 1.95, -0.42]}>
              <cylinderGeometry args={[0.04, 0.04, 0.12, 10]} />
              <meshStandardMaterial color="#8aa0b3" metalness={0.6} roughness={0.3} />
            </mesh>
          ))
        : null}
    </group>
  );
}

function RoofKit() {
  return (
    <group position={[0, CT.H, 0]}>
      <Pickable id="oxygen">
        <group position={[2.8, 0.28, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.3, 0.28, 0.7]} />
            <meshPhysicalMaterial color="#e6ecf1" metalness={0.5} roughness={0.35} />
          </mesh>
          {[-0.28, 0, 0.28].map((x) => (
            <mesh key={x} position={[x, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, 0.85, 12]} />
              <meshStandardMaterial color="#d0d8e0" metalness={0.75} roughness={0.25} />
            </mesh>
          ))}
          <Placard text="OXYGEN" position={[0, 0.28, 0.38]} width={0.46} height={0.12} />
        </group>
      </Pickable>
      <Pickable id="thermal">
        <group position={[5.05, 0.24, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.36, 0.7]} />
            <meshStandardMaterial color="#c5ced6" metalness={0.65} roughness={0.32} />
          </mesh>
          <mesh position={[0, 0.02, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.06, 16]} />
            <meshStandardMaterial color="#2c3440" />
          </mesh>
          <Placard text="THERMAL" position={[0, 0.28, 0.38]} width={0.46} height={0.12} />
        </group>
      </Pickable>
    </group>
  );
}

function Dimension({ side }: { side: "front" | "back" }) {
  const z = side === "front" ? 1.7 : -1.7;
  const rot: [number, number, number] = side === "back" ? [0, Math.PI, 0] : [0, 0, 0];
  return (
    <group position={[0, 0.12, z]} rotation={rot}>
      <mesh>
        <boxGeometry args={[CT.L, 0.012, 0.012]} />
        <meshBasicMaterial color="#0c3f86" />
      </mesh>
      {[-CT.L / 2, CT.L / 2].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.015, 0.16, 0.015]} />
          <meshBasicMaterial color="#0c3f86" />
        </mesh>
      ))}
      <Ink
        text="40 FEET  ·  STANDARD SHIPPING CONTAINER"
        position={[0, -0.18, 0]}
        width={4.4}
        height={0.22}
        fg="#0c3f86"
        bg={null}
      />
    </group>
  );
}

export function StandardTes() {
  const view = useTes((s) => s.view);
  const audience = useTes((s) => s.audience);
  const both = view === "iso" || view === "top";
  const xray = useTes((s) => s.xray);
  const rich = audience === "engineering" || both || xray;
  const open = xray || both ? "both" : view === "back" ? "back" : "front";
  return (
    <group>
      <Shell open={open} />
      {xray ? (
        <mesh position={[0, CT.H / 2, 0]}>
          <boxGeometry args={[CT.L, CT.H, CT.W]} />
          <meshPhysicalMaterial
            color="#d5dee8"
            transparent
            opacity={0.14}
            roughness={0.15}
            metalness={0.05}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {view !== "back" || xray ? (
        <group position={[0, 0, both || xray ? 0.46 : 0.02]}>
          <FrontFitout rich={rich} />
        </group>
      ) : null}
      {view === "back" || both || xray ? (
        <group position={[0, 0, both || xray ? -0.46 : -0.02]}>
          <BackFitout rich={rich} />
        </group>
      ) : null}
      {rich ? <RoofKit /> : null}
      {view === "front" || view === "back" ? <Dimension side={view} /> : null}
    </group>
  );
}
