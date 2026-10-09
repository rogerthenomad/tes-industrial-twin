import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, Outline, Selection, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { SceneId, ViewId } from "@/lib/tes/store";
import { useTes } from "@/lib/tes/store";
import { ExplodedStack } from "@/components/tes/exploded-stack";
import { Microfacility } from "@/components/tes/microfacility";
import { Skin } from "@/components/tes/primitives";
import { StandardTes } from "@/components/tes/standard-tes";

type Shot = {
  target: [number, number, number];
  dir: [number, number, number];
  span: number;
  tall: number;
};

const SHOTS: Record<SceneId, Partial<Record<ViewId, Shot>>> = {
  standard: {
    front: { target: [1.15, 1.45, 0.05], dir: [-0.22, 0.1, 1], span: 14.4, tall: 4.6 },
    back: { target: [0.9, 1.4, 0], dir: [-0.18, 0.1, -1], span: 14.4, tall: 4.6 },
    iso: { target: [0.8, 1.15, 0], dir: [1.05, 0.7, 0.92], span: 16.2, tall: 7.4 },
    top: { target: [0.4, 0, 0], dir: [0.22, 1, 0.16], span: 15.8, tall: 8 },
  },
  micro: {
    iso: { target: [0, 2.2, 0], dir: [0.85, 0.62, 1], span: 52, tall: 22 },
    front: { target: [0, 2.4, 2], dir: [0.02, 0.22, 1], span: 42, tall: 16 },
    top: { target: [0, 0, 0], dir: [0.12, 1, 0.1], span: 48, tall: 28 },
    bank: { target: [0.2, 1.15, 0.15], dir: [0.08, 0.28, 1], span: 15.2, tall: 4.8 },
  },
  stack: {
    front: { target: [0, 1.55, 0.2], dir: [0.02, 0.28, 1], span: 8.6, tall: 5.8 },
    iso: { target: [0, 1.45, 0.15], dir: [0.85, 0.52, 1], span: 9.4, tall: 6.2 },
    top: { target: [0, 0.8, 0.1], dir: [0.15, 1, 0.2], span: 8.8, tall: 5.4 },
  },
};

function focusShot(sceneId: SceneId, selected: string): Shot | null {
  if (selected === "overview") return null;
  if (sceneId === "standard") {
    const hub = /^hub-(\d+)$/.exec(selected);
    if (hub) {
      const x = [-4.72, -3.16, -1.6, -0.04][Number(hub[1])] ?? -2;
      return { target: [x, 1.45, 0.15], dir: [-0.15, 0.22, 1], span: 3.4, tall: 2.4 };
    }
    const shots: Record<string, Shot> = {
      ecr: { target: [-2.4, 1.7, 0.3], dir: [-0.1, 0.2, 1], span: 3.2, tall: 1.8 },
      "fuel-cell": { target: [-2.4, 1.15, 0.3], dir: [-0.1, 0.18, 1], span: 3.2, tall: 1.6 },
      battery: { target: [3.4, 1.1, 0.2], dir: [-0.05, 0.2, 1], span: 2.8, tall: 2.2 },
      trim: { target: [3.5, 1.1, -0.1], dir: [0.1, 0.2, -1], span: 2.6, tall: 2 },
      ems: { target: [4.55, 1.15, 0.2], dir: [-0.1, 0.18, 1], span: 2.4, tall: 2.1 },
      water: { target: [3.6, 0.55, 0.7], dir: [-0.1, 0.16, 1], span: 4.2, tall: 1.4 },
      "electrolyte-tank": { target: [-1.7, 1.7, -0.2], dir: [0.05, 0.18, -1], span: 8, tall: 2.2 },
      "fuel-tank": { target: [-1.7, 0.8, -0.2], dir: [0.05, 0.16, -1], span: 8, tall: 2 },
      condenser: { target: [2.3, 1.05, 0.35], dir: [-0.1, 0.2, 1], span: 2.6, tall: 1.6 },
      anolyte: { target: [-3.2, 1.4, 0.2], dir: [-0.15, 0.2, 1], span: 2.2, tall: 1.5 },
      oxygen: { target: [2.8, 3.1, 0], dir: [0.2, 0.45, 1], span: 3.4, tall: 1.4 },
      thermal: { target: [5.05, 3.05, 0], dir: [0.15, 0.4, 1], span: 2.8, tall: 1.3 },
      power: { target: [4.55, 0.6, 0.4], dir: [-0.1, 0.25, 1], span: 2.2, tall: 1.2 },
      co2: { target: [5.2, 1.55, 0.2], dir: [-0.4, 0.2, 1], span: 2.4, tall: 1.6 },
      pump: { target: [3.25, 0.6, 0.15], dir: [-0.1, 0.25, 1], span: 2, tall: 1.2 },
      safety: { target: [-5.3, 1.3, 0.7], dir: [0.2, 0.15, 1], span: 2.4, tall: 1.6 },
    };
    return shots[selected] ?? null;
  }
  if (sceneId === "micro") {
    if (selected.startsWith("bank-")) {
      const z = -8.55 + Number(selected.slice(5)) * 2.45;
      return { target: [-7, 1.1, z], dir: [0.15, 0.35, 1], span: 14, tall: 3.2 };
    }
    if (selected.startsWith("fhub-")) {
      const parts = selected.split("-");
      const x = -12.3 + Number(parts[2]) * 1.16;
      const z = -8.55 + Number(parts[1]) * 2.45;
      return { target: [x, 1.05, z], dir: [0.1, 0.28, 1], span: 3.2, tall: 2 };
    }
    const shots: Record<string, Shot> = {
      "water-zone": { target: [11.1, 1.6, -4.6], dir: [-0.4, 0.3, 1], span: 8, tall: 3.4 },
      "power-zone": { target: [11.2, 1.3, 1.3], dir: [-0.35, 0.28, 1], span: 6, tall: 3 },
      "control-room": { target: [11, 1.2, 6.5], dir: [-0.2, 0.3, 1], span: 7, tall: 2.8 },
      battery: { target: [-7.2, 0.9, 0.6], dir: [0.1, 0.25, 1], span: 4, tall: 2 },
      "fuel-tank": { target: [0.2, 0.8, -0.1], dir: [0.05, 0.22, 1], span: 14, tall: 2.2 },
      "electrolyte-tank": { target: [0.2, 1.5, -0.1], dir: [0.05, 0.22, 1], span: 14, tall: 2.2 },
    };
    return shots[selected] ?? null;
  }
  return null;
}

function frameShot(shot: Shot, aspect: number) {
  const vfov = (28 * Math.PI) / 180;
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
  const dist = Math.max(shot.span / 2 / Math.tan(hfov / 2), shot.tall / 2 / Math.tan(vfov / 2)) * 1.06;
  const dir = new THREE.Vector3(shot.dir[0], shot.dir[1], shot.dir[2]).normalize();
  const target = new THREE.Vector3(shot.target[0], shot.target[1], shot.target[2]);
  return { pos: target.clone().addScaledVector(dir, dist), target };
}

function EnvironmentRig() {
  const scene = useTes((s) => s.scene);
  const quality = useTes((s) => s.quality);
  const studio = useTes((s) => s.light) === "studio";
  const shine = scene === "stack" ? 1.5 : studio ? 1.05 : quality === "high" ? 1.25 : 0.9;
  return (
    <Environment
      files="/hdri/warehouse.hdr"
      environmentIntensity={shine}
      background={false}
    />
  );
}

function CameraRig() {
  const sceneId = useTes((s) => s.scene);
  const view = useTes((s) => s.view);
  const selected = useTes((s) => s.selected);
  const controls = useThree((s) => s.controls) as
    | { object: THREE.Camera; target: THREE.Vector3; update: () => void }
    | null;
  const size = useThree((s) => s.size);
  const flying = useRef(true);
  const userMoved = useRef(false);
  const frame = useTes((s) => s.frame);
  const manual = useTes((s) => s.manual);
  const stick = useTes((s) => s.stick);
  const clearStick = useTes((s) => s.clearStick);
  const basis = useRef({
    forward: new THREE.Vector3(),
    right: new THREE.Vector3(),
    pan: new THREE.Vector3(),
    offset: new THREE.Vector3(),
    up: new THREE.Vector3(0, 1, 0),
  });

  const preferFocus = useRef(false);

  useEffect(() => {
    preferFocus.current = false;
    userMoved.current = false;
    flying.current = true;
    clearStick();
    useTes.setState({ manual: false });
  }, [sceneId, view, frame, clearStick]);

  useEffect(() => {
    if (selected !== "overview") preferFocus.current = true;
    userMoved.current = false;
    flying.current = true;
    useTes.setState({ manual: false });
  }, [selected]);

  useEffect(() => {
    if (!userMoved.current) flying.current = true;
  }, [size.width, size.height]);

  useFrame((_, delta) => {
    if (!controls) return;
    const moving = stick.x !== 0 || stick.y !== 0 || stick.zoom !== 0 || stick.yaw !== 0;
    if (manual && moving) {
      flying.current = false;
      userMoved.current = true;
      const cam = controls.object;
      const speed = (sceneId === "micro" ? 7 : 1.8) * Math.min(delta, 0.05) * 10;
      cam.getWorldDirection(basis.current.forward);
      basis.current.forward.y = 0;
      if (basis.current.forward.lengthSq() < 0.0001) basis.current.forward.set(0, 0, -1);
      basis.current.forward.normalize();
      basis.current.right.crossVectors(basis.current.forward, basis.current.up).normalize();
      basis.current.pan.set(0, 0, 0);
      basis.current.pan.addScaledVector(basis.current.right, stick.x * speed);
      basis.current.pan.addScaledVector(basis.current.forward, stick.y * speed);
      cam.position.add(basis.current.pan);
      controls.target.add(basis.current.pan);
      cam.getWorldDirection(basis.current.forward);
      cam.position.addScaledVector(basis.current.forward, stick.zoom * speed);
      if (stick.yaw) {
        basis.current.offset.copy(cam.position).sub(controls.target);
        basis.current.offset.applyAxisAngle(basis.current.up, stick.yaw * Math.min(delta, 0.05) * 1.4);
        cam.position.copy(controls.target).add(basis.current.offset);
      }
      controls.update();
      return;
    }
    if (manual || !flying.current) return;
    const aspect = size.width / Math.max(size.height, 1);
    const shot =
      (preferFocus.current ? focusShot(sceneId, selected) : null) ??
      SHOTS[sceneId][view] ??
      SHOTS[sceneId].front ??
      SHOTS[sceneId].iso;
    if (!shot) return;
    const framed = frameShot(shot, aspect);
    const t = 1 - Math.pow(0.055, Math.min(delta, 0.1));
    controls.object.position.lerp(framed.pos, Math.min(1, t));
    controls.target.lerp(framed.target, Math.min(1, t));
    controls.update();
    if (controls.object.position.distanceTo(framed.pos) < 0.08) flying.current = false;
  });

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={size.width < 800 ? 0.55 : 0.8}
      zoomSpeed={size.width < 800 ? 0.62 : 0.85}
      panSpeed={0.5}
      zoomToCursor
      screenSpacePanning={false}
      enablePan
      maxPolarAngle={Math.PI / 2 - 0.04}
      minDistance={1.4}
      maxDistance={90}
      onStart={() => {
        userMoved.current = true;
        flying.current = false;
      }}
    />
  );
}

function Stage() {
  const sceneId = useTes((s) => s.scene);
  const view = useTes((s) => s.view);
  const quality = useTes((s) => s.quality);
  const light = useTes((s) => s.light);
  const setSelected = useTes((s) => s.setSelected);
  const studio = light === "studio";
  const reach = sceneId === "micro" && view !== "bank" ? 46 : 14;
  const floor = sceneId === "stack" ? 14 : sceneId === "micro" && view !== "bank" ? 80 : 36;
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.toneMappingExposure = studio ? 1.06 : 0.98;
  }, [gl, studio]);
  return (
    <Selection>
      <color attach="background" args={[studio ? "#e7edf2" : "#d5e2ee"]} />
      <EnvironmentRig />
      <hemisphereLight args={studio ? ["#f7f9fc", "#c5ccd3", 0.5] : ["#d5e6f6", "#b7a98f", 0.34]} />
      <ambientLight intensity={studio ? 0.14 : 0.08} />
      <directionalLight
        position={[14, 22, 12]}
        intensity={studio ? 1.2 : 1.55}
        color={studio ? "#f4f7fb" : "#fff4e4"}
        castShadow={quality === "high"}
        shadow-mapSize-width={quality === "high" ? 2048 : 1024}
        shadow-mapSize-height={quality === "high" ? 2048 : 1024}
        shadow-camera-far={80}
        shadow-camera-left={-reach}
        shadow-camera-right={reach}
        shadow-camera-top={reach}
        shadow-camera-bottom={-reach}
        shadow-bias={-0.00035}
      />
      <directionalLight position={[-12, 7, -8]} intensity={studio ? 0.62 : 0.38} color="#e7eef8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[floor, floor]} />
        {sceneId === "stack" ? (
          <meshStandardMaterial color="#b7c0c8" metalness={0.12} roughness={0.62} />
        ) : (
          <Skin kind="concrete" repeat={[floor / 4, floor / 4]} color={studio ? "#f3f5f7" : "#ffffff"} metalness={0.02} roughness={0.94} />
        )}
      </mesh>
      {quality === "high" ? (
        <ContactShadows position={[0, -0.01, 0]} opacity={studio ? 0.22 : 0.28} scale={floor} blur={2.4} far={reach > 20 ? 14 : 6} />
      ) : null}
      <group onPointerMissed={() => setSelected("overview")}>
        {sceneId === "standard" ? <StandardTes /> : null}
        {sceneId === "micro" ? <Microfacility /> : null}
        {sceneId === "stack" ? <ExplodedStack /> : null}
      </group>
      <CameraRig />
      {quality === "high" ? (
        <EffectComposer enableNormalPass={false} multisampling={0} autoClear={false}>
          <Outline
            edgeStrength={3}
            pulseSpeed={0}
            visibleEdgeColor={0x0c3f86}
            hiddenEdgeColor={0x1c7a45}
            blur
          />
          <Bloom mipmapBlur luminanceThreshold={1.35} intensity={studio ? 0.08 : 0.18} />
          <Vignette eskil={false} offset={0.18} darkness={studio ? 0.12 : 0.28} />
        </EffectComposer>
      ) : null}
    </Selection>
  );
}

export default function Studio() {
  const quality = useTes((s) => s.quality);
  return (
    <Canvas
      shadows={quality === "high"}
      dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
      camera={{ position: [-6, 4.2, 16], fov: 28, near: 0.08, far: 240 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.98;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <Stage />
    </Canvas>
  );
}
