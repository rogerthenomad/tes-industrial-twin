import * as THREE from "three";
import type { Quality } from "@/lib/tes/store";

export type SurfaceKind = "container" | "brushed" | "jacket" | "concrete" | "panel" | "roof";

export type SurfaceSet = {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture | null;
  roughnessMap: THREE.CanvasTexture;
};

export type SurfacePack = Record<SurfaceKind, SurfaceSet> & { normals: boolean };

const cache = new Map<Quality, SurfacePack>();

function hash(ix: number, iy: number) {
  let n = (ix * 374761393 + iy * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function noise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const n00 = hash(x0, y0);
  const n10 = hash(x0 + 1, y0);
  const n01 = hash(x0, y0 + 1);
  const n11 = hash(x0 + 1, y0 + 1);
  return n00 * (1 - sx) * (1 - sy) + n10 * sx * (1 - sy) + n01 * (1 - sx) * sy + n11 * sx * sy;
}

function canvas(size: number) {
  const el = document.createElement("canvas");
  el.width = size;
  el.height = size;
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("canvas");
  return { el, ctx, img: ctx.createImageData(size, size) };
}

function put(ctx: CanvasRenderingContext2D, img: ImageData) {
  ctx.putImageData(img, 0, 0);
}

function asTexture(el: HTMLCanvasElement, color: boolean) {
  const tex = new THREE.CanvasTexture(el);
  tex.colorSpace = color ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function normalsFrom(height: Float32Array, size: number, strength: number) {
  const { el, ctx, img } = canvas(size);
  const data = img.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const l = height[y * size + ((x - 1 + size) % size)];
      const r = height[y * size + ((x + 1) % size)];
      const u = height[((y - 1 + size) % size) * size + x];
      const d = height[((y + 1) % size) * size + x];
      const dx = (l - r) * strength;
      const dy = (u - d) * strength;
      const len = Math.hypot(dx, dy, 1) || 1;
      const p = (y * size + x) * 4;
      data[p] = (dx / len * 0.5 + 0.5) * 255;
      data[p + 1] = (dy / len * 0.5 + 0.5) * 255;
      data[p + 2] = (1 / len * 0.5 + 0.5) * 255;
      data[p + 3] = 255;
    }
  }
  put(ctx, img);
  return asTexture(el, false);
}

function packSet(map: HTMLCanvasElement, rough: HTMLCanvasElement, height: Float32Array | null, size: number, strength: number): SurfaceSet {
  return {
    map: asTexture(map, true),
    roughnessMap: asTexture(rough, false),
    normalMap: height ? normalsFrom(height, size, strength) : null,
  };
}

function build(size: number, withNormals: boolean): SurfacePack {
  const container = (() => {
    const color = canvas(size);
    const rough = canvas(size);
    const height = withNormals ? new Float32Array(size * size) : null;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const v = y / size;
        const grain = noise(u * 28, v * 28);
        const blot = noise(u * 4, v * 3);
        const seam = v % 0.22 < 0.012 || u % 0.5 < 0.008;
        const rivetU = Math.abs((u % 0.25) - 0.125);
        const rivetV = Math.abs((v % 0.22) - 0.11);
        const rivet = rivetU < 0.012 && rivetV < 0.012;
        const scuff = noise(u * 2.2 + 4, v * 9) > 0.72 && noise(u * 18, v * 6) > 0.55;
        let shade = 226 + blot * 18 + grain * 10;
        if (seam) shade -= 38;
        if (rivet) shade -= 28;
        if (scuff) shade += 16;
        const p = (y * size + x) * 4;
        color.img.data[p] = shade;
        color.img.data[p + 1] = shade + 2;
        color.img.data[p + 2] = shade + 6;
        color.img.data[p + 3] = 255;
        const rgh = seam ? 210 : scuff ? 90 : 130 + grain * 40;
        rough.img.data[p] = rough.img.data[p + 1] = rough.img.data[p + 2] = rgh;
        rough.img.data[p + 3] = 255;
        if (height) height[y * size + x] = (seam ? 0.15 : 0.55) + (rivet ? 0.45 : 0) + grain * 0.08;
      }
    }
    put(color.ctx, color.img);
    put(rough.ctx, rough.img);
    return packSet(color.el, rough.el, height, size, 2.4);
  })();

  const brushed = (() => {
    const color = canvas(size);
    const rough = canvas(size);
    const height = withNormals ? new Float32Array(size * size) : null;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const streak = Math.sin(u * Math.PI * 90) * 0.5 + 0.5;
        const grain = noise(u * 40, y / size * 6);
        const shade = 214 + streak * 22 + grain * 12;
        const p = (y * size + x) * 4;
        color.img.data[p] = shade;
        color.img.data[p + 1] = shade + 3;
        color.img.data[p + 2] = shade + 8;
        color.img.data[p + 3] = 255;
        const rgh = 70 + streak * 50 + grain * 30;
        rough.img.data[p] = rough.img.data[p + 1] = rough.img.data[p + 2] = rgh;
        rough.img.data[p + 3] = 255;
        if (height) height[y * size + x] = 0.5 + streak * 0.18;
      }
    }
    put(color.ctx, color.img);
    put(rough.ctx, rough.img);
    return packSet(color.el, rough.el, height, size, 1.6);
  })();

  const jacket = (() => {
    const color = canvas(size);
    const rough = canvas(size);
    const height = withNormals ? new Float32Array(size * size) : null;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cell = size / 8;
        const fx = (x % cell) / cell - 0.5;
        const fy = (y % cell) / cell - 0.5;
        const diamond = Math.abs(fx) + Math.abs(fy);
        const cloth = diamond < 0.42;
        const weave = noise(x / 3, y / 3);
        const shade = (cloth ? 232 : 188) + weave * 14;
        const p = (y * size + x) * 4;
        color.img.data[p] = color.img.data[p + 1] = color.img.data[p + 2] = shade;
        color.img.data[p + 3] = 255;
        const rgh = cloth ? 150 : 200;
        rough.img.data[p] = rough.img.data[p + 1] = rough.img.data[p + 2] = rgh;
        rough.img.data[p + 3] = 255;
        if (height) height[y * size + x] = cloth ? 0.75 : 0.25;
      }
    }
    put(color.ctx, color.img);
    put(rough.ctx, rough.img);
    return packSet(color.el, rough.el, height, size, 2.2);
  })();

  const concrete = (() => {
    const color = canvas(size);
    const rough = canvas(size);
    const height = withNormals ? new Float32Array(size * size) : null;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const v = y / size;
        const blot = noise(u * 6, v * 6);
        const grain = noise(u * 40, v * 40);
        const joint = u % 0.25 < 0.012 || v % 0.25 < 0.012;
        const stain = noise(u * 2 + 1.2, v * 2) > 0.66;
        let shade = 168 + blot * 28 + grain * 16;
        if (stain) shade -= 18;
        if (joint) shade = 92;
        const p = (y * size + x) * 4;
        color.img.data[p] = shade + 6;
        color.img.data[p + 1] = shade + 2;
        color.img.data[p + 2] = shade - 4;
        color.img.data[p + 3] = 255;
        rough.img.data[p] = rough.img.data[p + 1] = rough.img.data[p + 2] = joint ? 90 : 200;
        rough.img.data[p + 3] = 255;
        if (height) height[y * size + x] = joint ? 0.1 : 0.55 + grain * 0.15;
      }
    }
    put(color.ctx, color.img);
    put(rough.ctx, rough.img);
    return packSet(color.el, rough.el, height, size, 2.8);
  })();

  const panel = (() => {
    const color = canvas(size);
    const rough = canvas(size);
    const height = withNormals ? new Float32Array(size * size) : null;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const v = y / size;
        const seam = v % (1 / 5) < 0.018;
        const grain = noise(u * 16, v * 16);
        const dirt = seam ? 22 + noise(u * 10, v * 3) * 50 : noise(u * 2.4, v * 7) > 0.8 ? 26 : 0;
        const shade = 230 + grain * 12 - dirt;
        const p = (y * size + x) * 4;
        color.img.data[p] = shade;
        color.img.data[p + 1] = shade + 1;
        color.img.data[p + 2] = shade + 4;
        color.img.data[p + 3] = 255;
        rough.img.data[p] = rough.img.data[p + 1] = rough.img.data[p + 2] = seam ? 170 : 120;
        rough.img.data[p + 3] = 255;
        if (height) height[y * size + x] = seam ? 0.2 : 0.6 + grain * 0.05;
      }
    }
    put(color.ctx, color.img);
    put(rough.ctx, rough.img);
    return packSet(color.el, rough.el, height, size, 2.1);
  })();

  const roof = (() => {
    const color = canvas(size);
    const rough = canvas(size);
    const height = withNormals ? new Float32Array(size * size) : null;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const seam = u % 0.125 < 0.02;
        const grain = noise(u * 20, y / size * 8);
        const shade = seam ? 168 : 78 + grain * 14;
        const p = (y * size + x) * 4;
        color.img.data[p] = shade + 8;
        color.img.data[p + 1] = shade + 10;
        color.img.data[p + 2] = shade + 14;
        color.img.data[p + 3] = 255;
        rough.img.data[p] = rough.img.data[p + 1] = rough.img.data[p + 2] = seam ? 70 : 150;
        rough.img.data[p + 3] = 255;
        if (height) height[y * size + x] = seam ? 1 : 0.35;
      }
    }
    put(color.ctx, color.img);
    put(rough.ctx, rough.img);
    return packSet(color.el, rough.el, height, size, 3.2);
  })();

  return { container, brushed, jacket, concrete, panel, roof, normals: withNormals };
}

export function getSurfaces(quality: Quality) {
  const hit = cache.get(quality);
  if (hit) return hit;
  const pack = build(quality === "high" ? 512 : 256, true);
  cache.set(quality, pack);
  return pack;
}

export function tile(set: SurfaceSet, rx: number, ry: number): SurfaceSet {
  const clone = (tex: THREE.CanvasTexture | null) => {
    if (!tex) return null;
    const next = tex.clone();
    next.wrapS = THREE.RepeatWrapping;
    next.wrapT = THREE.RepeatWrapping;
    next.repeat.set(rx, ry);
    next.needsUpdate = true;
    return next;
  };
  return {
    map: clone(set.map) as THREE.CanvasTexture,
    normalMap: clone(set.normalMap),
    roughnessMap: clone(set.roughnessMap) as THREE.CanvasTexture,
  };
}

export function paintMaterial(
  set: SurfaceSet,
  repeat: [number, number],
  color: string,
  metalness: number,
  roughness: number,
  side: THREE.Side = THREE.FrontSide,
  clearcoat = 0,
  normalScale = 0.55,
) {
  const maps = tile(set, repeat[0], repeat[1]);
  return new THREE.MeshPhysicalMaterial({
    color,
    map: maps.map,
    normalMap: maps.normalMap ?? undefined,
    normalScale: maps.normalMap ? new THREE.Vector2(normalScale, normalScale) : undefined,
    roughnessMap: maps.roughnessMap,
    metalness,
    roughness,
    clearcoat,
    side,
    envMapIntensity: metalness > 0.5 ? 1.15 : 0.55,
  });
}

export function disposeMaterial(mat: THREE.Material) {
  const physical = mat as THREE.MeshPhysicalMaterial;
  physical.map?.dispose();
  physical.normalMap?.dispose();
  physical.roughnessMap?.dispose();
  physical.dispose();
}
