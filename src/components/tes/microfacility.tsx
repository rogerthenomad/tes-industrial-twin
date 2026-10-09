import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { BANKS, HUBS_PER_BANK } from "@/lib/tes/layout";
import { useTes } from "@/lib/tes/store";
import { getSurfaces } from "@/lib/tes/surfaces";
import { Beads, Ink, Pickable, Pipe, Skin, Valve } from "@/components/tes/primitives";
import { Gauge, PanelButtons, Person } from "@/components/tes/hardware";

const PITCH = 3.15;
const bankZ = (i: number) => -6.2 + i * PITCH;
const hubX = (i: number) => -7.2 + i * 1.6;

function Walker({
  path,
  face,
  speed = 1.1,
  pause = 2.4,
}: {
  path: [number, number, number][];
  face: number[];
  speed?: number;
  pause?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const leg = useRef(0);
  const dwell = useRef(0.4);
  const [pose, setPose] = useState<"stand" | "point" | "notes">("stand");
  useFrame((_, delta) => {
    const group = ref.current;
    if (!group || path.length < 2) return;
    const step = Math.min(delta, 0.05);
    const i = leg.current;
    const here = path[i];
    const next = path[(i + 1) % path.length];
    if (dwell.current > 0) {
      dwell.current -= step;
      group.position.set(here[0], 0.16, here[2]);
      group.rotation.y = face[i] ?? 0;
      const checking = i % 2 === 0 ? "point" : "notes";
      if (pose !== checking) setPose(checking);
      return;
    }
    const dx = next[0] - group.position.x;
    const dz = next[2] - group.position.z;
    const dist = Math.hypot(dx, dz) || 0.0001;
    const move = speed * step;
    if (dist <= move) {
      group.position.set(next[0], 0.16, next[2]);
      leg.current = (i + 1) % path.length;
      dwell.current = pause;
      return;
    }
    group.position.x += (dx / dist) * move;
    group.position.z += (dz / dist) * move;
    group.position.y = 0.16 + Math.abs(Math.sin(performance.now() * 0.012)) * 0.035;
    group.rotation.y = Math.atan2(dx, dz);
    if (pose !== "stand") setPose("stand");
  });
  return (
    <group ref={ref} position={path[0]}>
      <Person position={[0, 0, 0]} yaw={0} pose={pose} />
    </group>
  );
}

function Workers() {
  const aisle = (bank: number, x: number): [number, number, number] => [x, 0.16, bankZ(bank) + 1.55];
  const look = Math.PI;
  return (
    <group>
      <Walker
        path={[aisle(1, -5), aisle(1, -1), aisle(1, 3), aisle(1, 6)]}
        face={[look, look, look, look]}
        pause={2.6}
      />
      <Walker
        path={[aisle(3, 5.5), aisle(3, 2), aisle(3, -2), aisle(3, -5.5)]}
        face={[look, look, look, look]}
        speed={0.95}
        pause={2.1}
      />
      <Walker
        path={[aisle(5, -4), aisle(5, 0), aisle(5, 4), aisle(4, 4), aisle(4, -4)]}
        face={[look, look, look, look, look]}
        speed={1.05}
        pause={2.3}
      />
      <Walker
        path={[
          [-6.2, 0.16, bankZ(0) - 0.4],
          [-2, 0.16, bankZ(0) - 0.4],
          [2, 0.16, bankZ(0) - 0.4],
          [6, 0.16, bankZ(0) - 0.4],
        ]}
        face={[0.4, 0.2, -0.2, -0.4]}
        speed={0.85}
        pause={2.8}
      />
    </group>
  );
}

function HubField() {
  const top = useRef<THREE.InstancedMesh>(null);
  const bot = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const quality = useTes((s) => s.quality);
  const topGeo = useMemo(() => new THREE.BoxGeometry(1.28, 0.78, 0.42), []);
  const botGeo = useMemo(() => new THREE.BoxGeometry(1.16, 0.64, 0.38), []);
  const topMat = useMemo(() => {
    const panel = getSurfaces(quality).panel;
    return new THREE.MeshPhysicalMaterial({
      color: "#e7edf2",
      map: panel.map,
      normalMap: panel.normalMap ?? undefined,
      roughnessMap: panel.roughnessMap,
      metalness: 0.34,
      roughness: 0.48,
    });
  }, [quality]);
  const botMat = useMemo(() => {
    const brushed = getSurfaces(quality).brushed;
    return new THREE.MeshPhysicalMaterial({
      color: "#2a313b",
      map: brushed.map,
      normalMap: brushed.normalMap ?? undefined,
      roughnessMap: brushed.roughnessMap,
      metalness: 0.55,
      roughness: 0.4,
    });
  }, [quality]);
  useLayoutEffect(
    () => () => {
      topMat.dispose();
      botMat.dispose();
    },
    [topMat, botMat],
  );
  const count = BANKS * HUBS_PER_BANK;
  useLayoutEffect(() => {
    let i = 0;
    for (let b = 0; b < BANKS; b++) {
      for (let h = 0; h < HUBS_PER_BANK; h++) {
        const x = hubX(h);
        const z = bankZ(b);
        dummy.position.set(x, 1.55, z + 0.55);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        top.current?.setMatrixAt(i, dummy.matrix);
        dummy.position.set(x, 0.62, z + 0.55);
        dummy.updateMatrix();
        bot.current?.setMatrixAt(i, dummy.matrix);
        i++;
      }
    }
    if (top.current) top.current.instanceMatrix.needsUpdate = true;
    if (bot.current) bot.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  const select = (instanceId: number) => {
    const b = Math.floor(instanceId / HUBS_PER_BANK);
    const h = instanceId % HUBS_PER_BANK;
    useTes.getState().setSelected(`fhub-${b}-${h}`);
  };

  return (
    <group>
      <instancedMesh
        ref={top}
        args={[topGeo, topMat, count]}
        onClick={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined) select(e.instanceId);
        }}
      />
      <instancedMesh
        ref={bot}
        args={[botGeo, botMat, count]}
        onClick={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined) select(e.instanceId);
        }}
      />
    </group>
  );
}

function Hall() {
  const wide = useThree((s) => s.size.width > 800);
  const xray = useTes((s) => s.xray);
  const roofOff = useTes((s) => s.roofOff);
  const flow = useTes((s) => s.flow);
  return (
    <group>
      <mesh position={[0, 0.02, 16.9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 4]} />
        <Skin kind="concrete" repeat={[12, 2]} color="#cfc4b4" metalness={0.02} roughness={0.97} />
      </mesh>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[40, 0.16, 34]} />
        <Skin kind="concrete" repeat={[10, 8]} color="#ffffff" metalness={0.02} roughness={0.94} />
      </mesh>
      {[-12, -6, 0, 6, 12].map((x) => (
        <mesh key={`jx-${x}`} position={[x, 0.17, 0]}>
          <boxGeometry args={[0.035, 0.012, 28]} />
          <meshStandardMaterial color="#8a8178" roughness={0.9} />
        </mesh>
      ))}
      {[-8, -2, 4, 10].map((z) => (
        <mesh key={`jz-${z}`} position={[0, 0.17, z]}>
          <boxGeometry args={[34, 0.012, 0.035]} />
          <meshStandardMaterial color="#8a8178" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.175, 14.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.4, 0.16]} />
        <meshStandardMaterial color="#d7a441" roughness={0.55} />
      </mesh>
      {roofOff ? null : (
        <mesh position={[0, 6.7, 0]}>
          <boxGeometry args={[36.6, 0.22, 30.5]} />
          <Skin kind="roof" repeat={[14, 10]} color="#ffffff" metalness={0.72} roughness={0.38} />
        </mesh>
      )}
      <mesh position={[0, 5.9, 15.4]}>
        <boxGeometry args={[8, 0.12, 0.04]} />
        <meshStandardMaterial color="#1c7a45" />
      </mesh>
      {xray ? null : (
        <>
      <mesh position={[-18.29, 3.35, 0]} castShadow>
        <boxGeometry args={[0.2, 6.7, 30.5]} />
        <Skin kind="panel" repeat={[8, 2]} color="#e7eef3" metalness={0.38} roughness={0.5} />
      </mesh>
      <mesh position={[18.29, 3.35, 0]} castShadow>
        <boxGeometry args={[0.2, 6.7, 30.5]} />
        <Skin kind="panel" repeat={[8, 2]} color="#e7eef3" metalness={0.38} roughness={0.5} />
      </mesh>
      <mesh position={[0, 3.35, -15.24]} castShadow>
        <boxGeometry args={[36.6, 6.7, 0.2]} />
        <Skin kind="panel" repeat={[10, 2]} color="#e7eef3" metalness={0.38} roughness={0.5} />
      </mesh>
      <mesh position={[-10.4, 3.35, 15.24]} castShadow>
        <boxGeometry args={[15.6, 6.7, 0.2]} />
        <Skin kind="panel" repeat={[4, 2]} color="#e7eef3" metalness={0.38} roughness={0.48} />
      </mesh>
      <mesh position={[10.4, 3.35, 15.24]} castShadow>
        <boxGeometry args={[15.6, 6.7, 0.2]} />
        <Skin kind="panel" repeat={[4, 2]} color="#e7eef3" metalness={0.38} roughness={0.48} />
      </mesh>
      <mesh position={[0, 5.85, 15.24]}>
        <boxGeometry args={[5.6, 1.7, 0.22]} />
        <Skin kind="panel" repeat={[2, 1]} color="#e7eef3" metalness={0.38} roughness={0.48} />
      </mesh>
      <mesh position={[0, 2.15, 15.32]}>
        <boxGeometry args={[5.2, 4.1, 0.08]} />
        <meshStandardMaterial color="#b7c2cc" metalness={0.5} roughness={0.4} />
      </mesh>
      {[-1.4, -0.5, 0.4, 1.3].map((y) => (
        <mesh key={y} position={[0, 2.15 + y * 0.2, 15.4]}>
          <boxGeometry args={[5, 0.04, 0.02]} />
          <meshStandardMaterial color="#8d9aaa" />
        </mesh>
      ))}
      <Ink text={"TRINIUM\nENERGY SYSTEMS"} position={[-12, 3.4, 15.42]} width={6} height={1.2} fg="#10233f" bg={null} />
      {[-2.2, 2.2].map((dx) => (
        <mesh key={dx} position={[dx, 0.55, 16.05]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 0.9, 12]} />
          <meshStandardMaterial color="#f0c14d" />
        </mesh>
      ))}
        </>
      )}

      <HubField />
      {Array.from({ length: BANKS }, (_, b) => {
        const z = bankZ(b);
        return (
          <group key={b}>
            <Pickable id={`bank-${b}`}>
              <RoundedBox args={[14, 1.02, 1.37]} radius={0.06} smoothness={2} position={[0, 0.62, z - 1.15]} castShadow>
                <Skin kind="brushed" repeat={[6, 1]} color="#d7dee6" metalness={0.72} roughness={0.28} clearcoat={0.25} />
              </RoundedBox>
              <RoundedBox args={[14, 1.02, 1.37]} radius={0.06} smoothness={2} position={[0, 1.84, z - 1.15]} castShadow>
                <Skin kind="brushed" repeat={[6, 1]} color="#eef3f7" metalness={0.68} roughness={0.3} clearcoat={0.22} />
              </RoundedBox>
            </Pickable>
            <Pipe a={[-7.2, 2.35, z + 0.85]} b={[7.4, 2.35, z + 0.85]} radius={0.04} color="#2f6fad" flange />
            <Pipe a={[-7.2, 2.1, z + 0.7]} b={[7.4, 2.1, z + 0.7]} radius={0.032} color="#c56a2d" flange />
            <Valve position={[6.2, 2.28, z + 0.85]} />
            <Gauge position={[5.2, 2.48, z + 0.85]} />
            <mesh position={[6.85, 0.62, z - 1.15]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.14, 10]} />
              <meshPhysicalMaterial color="#d5dee6" metalness={0.9} roughness={0.18} />
            </mesh>
            <mesh position={[0, 0.18, z + 1.35]} receiveShadow>
              <boxGeometry args={[13.2, 0.025, 0.62]} />
              <meshStandardMaterial color="#4e5963" metalness={0.62} roughness={0.42} />
            </mesh>
            {[-4, 0, 4].map((x) => (
              <mesh key={x} position={[x, 0.2, z + 1.35]}>
                <boxGeometry args={[0.04, 0.02, 0.62]} />
                <meshStandardMaterial color="#2c3440" metalness={0.5} roughness={0.45} />
              </mesh>
            ))}
            <mesh position={[8.15, 1.55, z + 0.15]}>
              <boxGeometry args={[0.02, 0.28, 0.7]} />
              <meshStandardMaterial color="#f4f7fb" roughness={0.45} />
            </mesh>
            <Ink
              text={`BANK ${b + 1}`}
              position={[8.18, 1.55, z + 0.15]}
              rotation={[0, Math.PI / 2, 0]}
              width={0.62}
              height={0.18}
              fg="#10233f"
              bg={null}
            />
            <Pickable id="battery">
              <RoundedBox args={[1.22, 2.13, 1.22]} radius={0.04} smoothness={2} position={[-9.2, 1.16, z + 0.2]} castShadow>
                <meshStandardMaterial color="#e4eaef" metalness={0.4} roughness={0.42} />
              </RoundedBox>
            </Pickable>
          </group>
        );
      })}

      {Array.from({ length: BANKS - 1 }, (_, i) => {
        const z = (bankZ(i) + bankZ(i + 1)) / 2;
        return (
          <mesh key={`aisle-${i}`} position={[0, 0.175, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[15.5, 0.07]} />
            <meshStandardMaterial color="#d7a441" roughness={0.55} />
          </mesh>
        );
      })}

      {[-12, -6, 0, 6, 12].map((x) =>
        [-1.5, 7.5].map((z) => (
          <group key={`bay-${x}-${z}`} position={[x, 6.35, z]}>
            <mesh>
              <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
              <meshStandardMaterial color="#8d98a4" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.32, 0]} castShadow>
              <cylinderGeometry args={[0.26, 0.16, 0.07, 12]} />
              <meshStandardMaterial color="#e7eef3" metalness={0.55} roughness={0.32} />
            </mesh>
            <mesh position={[0, -0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.14, 12]} />
              <meshBasicMaterial color="#f7fbff" toneMapped={false} />
            </mesh>
          </group>
        )),
      )}
      {[
        [-6, -1.5],
        [6, 7.5],
        [0, -1.5],
        [0, 7.5],
      ].map(([x, z]) => (
        <pointLight key={`L${x}${z}`} position={[x, 5.7, z]} intensity={4.5} distance={14} decay={2} color="#f4f7fb" />
      ))}

      <mesh position={[0, 4.35, 1.2]}>
        <boxGeometry args={[16, 0.05, 0.26]} />
        <meshStandardMaterial color="#c5d0da" metalness={0.78} roughness={0.3} />
      </mesh>
      <mesh position={[2, 4.35, -5.2]}>
        <boxGeometry args={[0.26, 0.05, 12.8]} />
        <meshStandardMaterial color="#c5d0da" metalness={0.78} roughness={0.3} />
      </mesh>
      {[-6, 0, 6].map((x) => (
        <mesh key={`drop-${x}`} position={[x, 3.25, 1.2]}>
          <cylinderGeometry args={[0.025, 0.025, 2.1, 8]} />
          <meshStandardMaterial color="#8d98a4" metalness={0.7} roughness={0.32} />
        </mesh>
      ))}
      {flow === "water"
        ? Array.from({ length: BANKS }, (_, b) => (
            <Beads
              key={`w-${b}`}
              a={[-6.5, 2.35, bankZ(b) + 0.85]}
              b={[6.5, 2.35, bankZ(b) + 0.85]}
              color="#8ec6ff"
              count={12}
              speed={0.1}
            />
          ))
        : null}
      {flow === "power" ? (
        <>
          <Beads a={[-7, 4.42, 1.2]} b={[7, 4.42, 1.2]} color="#7dff9a" count={14} speed={0.16} />
          {[0, 2, 4, 6].map((b) => (
            <Beads
              key={`p-${b}`}
              a={[0, 4.42, 1.2]}
              b={[0, 2.4, bankZ(b) + 0.85]}
              color="#7dff9a"
              count={6}
              speed={0.18}
            />
          ))}
        </>
      ) : null}

      <mesh position={[-4.2, 2.3, -9.6]}>
        <boxGeometry args={[0.08, 3.6, 0.08]} />
        <meshStandardMaterial color="#8d98a4" metalness={0.7} roughness={0.32} />
      </mesh>
      <mesh position={[-4.2, 2.3, -12]}>
        <boxGeometry args={[0.08, 3.6, 0.08]} />
        <meshStandardMaterial color="#8d98a4" metalness={0.7} roughness={0.32} />
      </mesh>
      <mesh position={[-4.2, 3.5, -10.8]}>
        <boxGeometry args={[0.08, 0.08, 2.4]} />
        <meshStandardMaterial color="#8d98a4" metalness={0.7} roughness={0.32} />
      </mesh>
      <Pipe a={[-5.4, 2.55, -12]} b={[-5.4, 2.55, -6.5]} radius={0.045} color="#3d7ec4" flange />
      <Pipe a={[-5.4, 2.55, -6.5]} b={[-7.2, 2.35, bankZ(0)]} radius={0.04} color="#3d7ec4" />

      <Pickable id="water-zone">
        <group position={[-8, 2.2, -12]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[1.15, 1.15, 6.2, 28]} />
            <Skin kind="brushed" repeat={[6, 1]} color="#f4f7fa" metalness={0.82} roughness={0.28} clearcoat={0.3} />
          </mesh>
          {[-2.2, 2.2].map((x) => (
            <mesh key={x} position={[x, -0.85, 0]}>
              <boxGeometry args={[0.15, 0.7, 1.5]} />
              <meshStandardMaterial color="#8d9aaa" metalness={0.6} roughness={0.35} />
            </mesh>
          ))}
          <mesh position={[-3.4, -0.3, 2]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 1.2, 10]} />
            <meshStandardMaterial color="#3d7ec4" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      </Pickable>

      <Pickable id="power-zone">
        <group position={[2, 1.4, -12]}>
          {[-1.15, 0, 1.15].map((x) => (
            <RoundedBox key={x} args={[0.82, 2.05, 0.62]} radius={0.06} smoothness={3} position={[x, 0, 0]} castShadow>
              <Skin kind="panel" repeat={[1, 2]} color="#dfe6ec" metalness={0.4} roughness={0.46} />
            </RoundedBox>
          ))}
          <PanelButtons position={[0, 0.35, 0.34]} />
        </group>
      </Pickable>

      <Pickable id="control-room">
        <group position={[12, 0.16, -12]}>
          <mesh position={[0, 0.75, -1.15]}>
            <boxGeometry args={[5.5, 1.5, 0.06]} />
            <meshStandardMaterial color="#9bb4c8" transparent opacity={0.25} />
          </mesh>
          <mesh position={[-0.4, 0.72, 0.2]} castShadow>
            <boxGeometry args={[1.6, 0.08, 0.7]} />
            <meshStandardMaterial color="#d5dde4" />
          </mesh>
          <mesh position={[-0.4, 0.38, 0.2]}>
            <boxGeometry args={[0.08, 0.6, 0.08]} />
            <meshStandardMaterial color="#8d9aaa" />
          </mesh>
          {[-0.9, -0.4, 0.1].map((x) => (
            <group key={x} position={[x, 1.15, -0.15]}>
              <mesh>
                <boxGeometry args={[0.42, 0.28, 0.04]} />
                <meshStandardMaterial color="#10233f" />
              </mesh>
              <mesh position={[0, 0, 0.03]}>
                <planeGeometry args={[0.36, 0.22]} />
                <meshBasicMaterial color={x === -0.4 ? "#123a66" : "#0e2a4a"} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      </Pickable>

      <Workers />
      {wide ? (
        <>
          <Html position={[-8, 4.6, -12]} center zIndexRange={[10, 0]}>
            <div className="callout">Water storage</div>
          </Html>
          <Html position={[2, 4.2, -12]} center zIndexRange={[10, 0]}>
            <div className="callout">Power conversion</div>
          </Html>
          <Html position={[12, 3.2, -12]} center zIndexRange={[10, 0]}>
            <div className="callout">Operations / AI</div>
          </Html>
        </>
      ) : null}
      <pointLight position={[0, 5.4, 2]} intensity={3.5} distance={36} color="#f4f8ff" />
    </group>
  );
}

function MiniHub({ x }: { x: number }) {
  return (
    <group position={[x, 0.16, 0.85]}>
      {[-0.55, 0.55].map((px) => (
        <mesh key={px} position={[px, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.7, 8]} />
          <meshStandardMaterial color="#c5d0da" metalness={0.78} roughness={0.28} />
        </mesh>
      ))}
      <RoundedBox args={[1.2, 0.72, 0.4]} radius={0.03} smoothness={2} position={[0, 1.35, 0]} castShadow>
        <meshPhysicalMaterial color="#e7eef3" metalness={0.4} roughness={0.38} />
      </RoundedBox>
      <RoundedBox args={[1.1, 0.58, 0.36]} radius={0.03} smoothness={2} position={[0, 0.58, 0]} castShadow>
        <meshPhysicalMaterial color="#1c2430" metalness={0.45} roughness={0.4} />
      </RoundedBox>
      <Ink text="ECR" position={[0, 1.35, 0.22]} width={0.5} height={0.16} fg="#10233f" bg={null} />
    </group>
  );
}

function SingleBank() {
  const wide = useThree((s) => s.size.width > 700);
  const hubs = Array.from({ length: HUBS_PER_BANK }, (_, i) => -7.2 + i * 1.6);
  return (
    <group>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[20, 0.1, 4.6]} />
        <Skin kind="concrete" repeat={[4, 1]} color="#ffffff" metalness={0.02} roughness={0.92} />
      </mesh>
      <Pickable id="fuel-tank">
        <RoundedBox args={[14, 1.02, 1.37]} radius={0.05} smoothness={2} position={[0, 0.62, -0.85]} castShadow>
          <meshPhysicalMaterial color="#d5dee6" metalness={0.72} roughness={0.26} clearcoat={0.3} />
        </RoundedBox>
        <Ink text="Fuel Storage" position={[0, 0.62, -0.1]} width={2.6} height={0.24} fg="#0c3f86" bg={null} />
      </Pickable>
      <Pickable id="electrolyte-tank">
        <RoundedBox args={[14, 1.02, 1.37]} radius={0.05} smoothness={2} position={[0, 1.84, -0.85]} castShadow>
          <meshPhysicalMaterial color="#eef3f7" metalness={0.68} roughness={0.28} clearcoat={0.25} />
        </RoundedBox>
        <Ink text="Electrolyte Storage" position={[0, 1.84, -0.1]} width={3.4} height={0.22} fg="#0c3f86" bg={null} />
      </Pickable>
      <Pipe a={[-6, 1.95, -0.25]} b={[6.4, 1.95, -0.25]} radius={0.045} color="#e39b32" flange />
      <Pickable id="battery">
        <group position={[-7.55, 0.2, 0.7]}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[1.15, 1.35, 0.85]} />
            <meshStandardMaterial color="#e6ebf0" metalness={0.35} roughness={0.42} />
          </mesh>
          <Ink text="BATTERY" position={[0, 0.75, 0.45]} width={0.9} height={0.18} fg="#10233f" bg={null} />
        </group>
      </Pickable>
      {hubs.map((x) => (
        <MiniHub key={x} x={x} />
      ))}
      {/* rails */}
      {[1.55, -0.95].map((z) => (
        <mesh key={z} position={[0, 1.15, z]}>
          <boxGeometry args={[15.2, 0.06, 0.06]} />
          <meshStandardMaterial color="#e39b32" metalness={0.45} roughness={0.35} />
        </mesh>
      ))}
      {[-7.4, 7.4].map((x) => (
        <mesh key={x} position={[x, 0.7, 0.3]}>
          <boxGeometry args={[0.06, 1.2, 2.5]} />
          <meshStandardMaterial color="#e39b32" metalness={0.45} roughness={0.35} />
        </mesh>
      ))}
      {wide ? (
        <Html position={[0.4, 0.7, 1.7]} center zIndexRange={[10, 0]}>
          <div className="callout">ECR / fuel-cell hubs</div>
        </Html>
      ) : null}
    </group>
  );
}

export function Microfacility() {
  const view = useTes((s) => s.view);
  if (view === "bank") return <SingleBank />;
  return <Hall />;
}
