"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { galaxyMedia, type Media } from "@/content/home";
import { sceneFrame } from "@/lib/generative";
import { introBeats, introClock } from "@/components/intro/clock";
import { layout, look, mobile, motion, pointer } from "./galaxyConfig";
import { cardFragment, cardVertex } from "./shaders";

const TAU = Math.PI * 2;
const MAX_CARDS = layout.cardN;
const TEX_ASPECT = 16 / 9;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const frac = (v: number) => v - Math.floor(v);
const ease = (current: number, target: number, tau: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-dt / Math.max(tau, 1e-3)));

type Card = {
  mesh: THREE.Mesh;
  mat: THREE.ShaderMaterial;
  hold: number; // 0 → 1 as the card brakes under the cursor
  offset: number; // journey offset accumulated while held
  boost: number; // current scale multiplier
  boostOn: boolean;
  flare: number; // sweep dispersion picked up from the cursor
  wob: number; // wobble phase
  cycle: number; // which lap of the conveyor it's on (picks media)
  clicks: { u: number; v: number; born: number }[];
  // Per-frame scratch
  x: number;
  y: number;
  j: number;
  aspect: number;
  h: number;
  visible: boolean;
};

type Ripple = { x: number; y: number; born: number };

function readColors() {
  const s = getComputedStyle(document.documentElement);
  const dark = document.documentElement.dataset.theme !== "light";
  return {
    dark,
    ink: s.getPropertyValue("--ink").trim() || "#f2f1ee",
    bg: s.getPropertyValue("--bg").trim() || "#121316",
    accent: s.getPropertyValue("--accent").trim() || "#2d81ff",
  };
}

function makeTexture(media: Media): THREE.Texture {
  if (media.kind === "video") {
    const v = document.createElement("video");
    v.src = media.src;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.crossOrigin = "anonymous";
    v.play().catch(() => {});
    return new THREE.VideoTexture(v);
  }
  const tex = new THREE.CanvasTexture(sceneFrame(media.seed));
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function Field({
  underlay,
  reduced,
}: {
  underlay: React.RefObject<HTMLCanvasElement | null>;
  reduced: boolean;
}) {
  const { size, gl, invalidate } = useThree();
  const group = useMemo(() => new THREE.Group(), []);
  const texturesRef = useRef<THREE.Texture[]>([]);
  const cardsRef = useRef<Card[]>([]);
  const colors = useRef<ReturnType<typeof readColors> | null>(null);

  const state = useRef({
    phase: 0,
    spin: 0,
    flow: 1,
    time: 0,
    lastScroll: 0,
    mouse: { x: -1e5, y: -1e5, inside: false },
    target: -1,
    ripples: [] as Ripple[],
    active: MAX_CARDS,
    fps: 60,
    slowFor: 0,
    fastFor: 0,
  });

  // Build every card once; how many are active depends on the viewport.
  useEffect(() => {
    colors.current = readColors();
    const textures = galaxyMedia.map(makeTexture);
    texturesRef.current = textures;
    const geo = new THREE.PlaneGeometry(1, 1, 24, 24);
    const cards: Card[] = Array.from({ length: MAX_CARDS }, (_, i) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: cardVertex,
        fragmentShader: cardFragment,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uMap: { value: textures[i % textures.length] },
          uRepeat: { value: new THREE.Vector2(1, 1) },
          uOffset: { value: new THREE.Vector2(0, 0) },
          uBg: { value: new THREE.Color() },
          uBlur: { value: 0 },
          uAlpha: { value: 0 },
          uAber: { value: look.aberration },
          uSize: { value: new THREE.Vector2(100, 100) },
          uRadius: { value: look.cornerPx },
          uFrameCol: { value: new THREE.Color("#ffffff") },
          uFrameA: { value: look.frameAlpha },
          uDrift: { value: i * 1.7 },
          uCurve: { value: look.curvePx },
          uWarp: { value: 0 },
          uRipple: { value: 0 },
          uMouse: { value: new THREE.Vector2(9, 9) },
          uClick: { value: Array.from({ length: 4 }, () => new THREE.Vector4()) },
          uClickW: { value: 10 },
        },
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      group.add(mesh);
      return {
        mesh,
        mat,
        hold: 0,
        offset: 0,
        boost: 1,
        boostOn: false,
        flare: 0,
        wob: Math.random() * TAU,
        cycle: -1,
        clicks: [],
        x: 0,
        y: 0,
        j: 0,
        aspect: 1,
        h: 0,
        visible: false,
      };
    });
    cardsRef.current = cards;
    invalidate();
    return () => {
      cards.forEach((c) => {
        group.remove(c.mesh);
        c.mat.dispose();
      });
      geo.dispose();
      textures.forEach((t) => t.dispose());
      cardsRef.current = [];
    };
  }, [group, invalidate]);

  useEffect(() => invalidate(), [size, invalidate]);

  // Theme colours feed the frame hairline and the line underlay.
  useEffect(() => {
    // The tokens transition for 0.4s, so read again once they've settled.
    let settle = 0;
    const update = () => {
      colors.current = readColors();
      invalidate();
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        colors.current = readColors();
        invalidate();
      }, 450);
    };
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      mo.disconnect();
      window.clearTimeout(settle);
    };
  }, [invalidate]);

  // Pointer: tracked on window so the copy layer above never blocks it.
  useEffect(() => {
    const el = gl.domElement;
    const s = state.current;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      s.mouse.x = e.clientX - r.left - r.width / 2;
      s.mouse.y = r.height / 2 - (e.clientY - r.top);
      s.mouse.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    };
    const leave = () => {
      s.mouse.inside = false;
    };
    const down = (e: PointerEvent) => {
      move(e);
      if (!s.mouse.inside || (e.target as HTMLElement).closest("a,button")) return;
      s.ripples.push({ x: s.mouse.x, y: s.mouse.y, born: s.time });
      if (s.ripples.length > 6) s.ripples.shift();
      const c = cardsRef.current[s.target];
      if (c) {
        const w = c.h * c.aspect * c.boost;
        const h = c.h * c.boost;
        c.clicks.push({ u: (s.mouse.x - c.x) / w + 0.5, v: (s.mouse.y - c.y) / h + 0.5, born: s.time });
        if (c.clicks.length > 4) c.clicks.shift();
        c.boostOn = !c.boostOn;
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerleave", leave);
    };
  }, [gl]);

  useFrame(({ camera }, delta) => {
    const s = state.current;
    const cards = cardsRef.current;
    const textures = texturesRef.current;
    if (!cards.length || !colors.current) return;

    // Camera that maps one world unit to one CSS px on the z = 0 plane.
    const cam = camera as THREE.PerspectiveCamera;
    const camZ = size.height / 2 / Math.tan((30 * Math.PI) / 360);
    if (cam.fov !== 30 || cam.position.z !== camZ || cam.aspect !== size.width / size.height) {
      cam.fov = 30;
      cam.aspect = size.width / size.height;
      cam.position.set(0, 0, camZ);
      cam.near = 1;
      cam.far = camZ * 3;
      cam.updateProjectionMatrix();
    }
    const dt = Math.min(delta, 0.05);
    s.time += dt;

    const W = size.width;
    const H = size.height;
    const mpx = (W * H) / 1e6;
    const isMobile = mpx < mobile.belowMpx;
    const arms = isMobile ? mobile.arms : layout.arms;
    const turns = isMobile ? mobile.turns : layout.turns;
    const rMaxFrac = isMobile ? mobile.rMaxFrac : layout.rMaxFrac;
    const birth = isMobile ? mobile.birthFrac : layout.birthFrac;
    const capH = (isMobile ? mobile.cardHFrac : layout.cardHFrac) * H;
    const density = look.density * (isMobile ? mobile.densityX : 1);
    const wanted = isMobile
      ? mobile.cardN
      : Math.max(8, Math.min(layout.cardN, Math.round((layout.cardN * mpx) / layout.tunedMpx)));
    const count = Math.min(wanted, Math.round(s.active));
    const perArm = Math.ceil(count / arms);

    const halfDiag = Math.hypot(W, H) / 2;
    const R = rMaxFrac * halfDiag;
    const uMax = (halfDiag + capH * 1.2) / R;

    // Intro beats from the shared clock.
    const it = reduced ? 999 : introClock.t - introBeats.cardsAt;
    const burst = it < 0 ? motion.burstX : 1 + (motion.burstX - 1) * (1 - smooth(0, motion.burstDur, it));
    const waveR = it < 0 ? -1 : (it / motion.introDur) * (halfDiag + motion.waveBand);
    const flareR = ((it - motion.waveLag) / motion.introDur) * (halfDiag + motion.waveBand);

    // Conveyor: idle drift, slowed to a stop while a card is held, plus scroll scrub.
    const holding = s.target >= 0;
    s.flow = ease(s.flow, holding || reduced ? 0 : 1, pointer.restTau, dt);
    const scrollY = window.scrollY;
    const scrollD = reduced ? 0 : scrollY - s.lastScroll;
    s.lastScroll = scrollY;
    const dPhase = it < 0 ? 0 : (dt * motion.idleSpeed * s.flow * burst) / 60 + (scrollD / 1000) * motion.scrub;
    s.phase += dPhase;
    s.spin += ((dt * motion.spinDeg) / 60) * (Math.PI / 180) * (reduced ? 0 : Math.max(s.flow, 0.15));

    // Positions.
    for (let k = 0; k < MAX_CARDS; k++) {
      const c = cards[k];
      c.visible = k < count;
      if (!c.visible) {
        c.mesh.visible = false;
        continue;
      }
      const arm = k % arms;
      const idx = Math.floor(k / arms);
      const slot = (idx + layout.armJitter * arm) / perArm;

      c.hold = ease(c.hold, s.target === k ? 1 : 0, pointer.holdTau, dt);
      c.offset -= dPhase * c.hold;
      if (c.hold < 0.01) c.offset = ease(c.offset, Math.round(c.offset), 3, dt);

      const raw = s.phase + slot + c.offset;
      const cycle = Math.floor(raw);
      let j = frac(raw);
      if (cycle !== c.cycle) {
        c.cycle = cycle;
        const m = Math.abs((cycle * 7 + k * 13 + arm * 5) % textures.length);
        c.mat.uniforms.uMap.value = textures[m];
        c.clicks.length = 0;
        c.boostOn = false;
      }

      const u0 = birth + j * (uMax - birth);
      const dist0 = u0 * R;
      const reveal = it < 0 ? 0 : smooth(waveR, waveR - motion.waveBand, dist0);
      j = Math.max(0, j - motion.rollChunk * (1 - reveal));
      c.j = j;

      const u = birth + j * (uMax - birth);
      const r = u * R;
      const ang = (arm / arms) * TAU + s.spin + turns * TAU * u;
      const wobAmp = motion.wobbleAmp * (holding && s.target !== k ? pointer.holdWobble : 1) * (1 - c.hold);
      const wt = s.time * motion.wobbleFreq * TAU + c.wob;
      let x = Math.cos(ang) * r + Math.sin(wt) * wobAmp;
      let y = Math.sin(ang) * r + Math.cos(wt * 1.3) * wobAmp;

      // Tug toward the cursor.
      if (s.mouse.inside) {
        const dx = s.mouse.x - x;
        const dy = s.mouse.y - y;
        const d = Math.hypot(dx, dy);
        if (d < pointer.fieldPx && d > 0.01) {
          const f = (1 - d / pointer.fieldPx) ** 2;
          x += (dx / d) * pointer.tugPx * f;
          y += (dy / d) * pointer.tugPx * f;
          c.flare = Math.max(c.flare, pointer.flareAdd * f);
        }
      }
      c.flare *= Math.exp(-dt * pointer.flareDecay);
      c.x = x;
      c.y = y;
      c.aspect = 1 + (TEX_ASPECT - 1) * smooth(0, look.aspectEnd, j);
    }

    // Collision-safe sizing: each card may fill `density` of the gap to its
    // nearest neighbour along whichever axis separates them.
    for (let a = 0; a < count; a++) {
      const A = cards[a];
      let h = capH;
      for (let b = 0; b < count; b++) {
        if (a === b) continue;
        const B = cards[b];
        const asp = (A.aspect + B.aspect) / 2;
        const fit = Math.max(Math.abs(A.y - B.y), Math.abs(A.x - B.x) / asp) * density;
        if (fit < h) h = fit;
      }
      const ramp = look.innerCap + (1 - look.innerCap) * smooth(0, 0.55, A.j);
      A.h = Math.max(4, Math.min(h, capH * ramp));
    }

    // Hit-test the cursor (outermost first, matching paint order).
    let target = -1;
    if (s.mouse.inside && !reduced) {
      let best = -1;
      for (let k = 0; k < count; k++) {
        const c = cards[k];
        const w = c.h * c.aspect * c.boost;
        const h = c.h * c.boost;
        if (Math.abs(s.mouse.x - c.x) < w / 2 && Math.abs(s.mouse.y - c.y) < h / 2 && c.j > 0.1) {
          const z = c.j + (k === s.target ? 1 : 0);
          if (z > best) {
            best = z;
            target = k;
          }
        }
      }
    }
    if (target !== s.target && s.target >= 0) cards[s.target].boostOn = false;
    s.target = target;
    s.ripples = s.ripples.filter((rp) => s.time - rp.born < pointer.rippleLife);

    const { ink, dark } = colors.current;
    const frameCol = dark ? "#ffffff" : ink;

    for (let k = 0; k < count; k++) {
      const c = cards[k];
      const m = c.mat.uniforms;
      c.boost = ease(c.boost, c.boostOn ? pointer.boostScale : 1, pointer.boostTau, dt);
      const w = c.h * c.aspect * c.boost;
      const h = c.h * c.boost;
      c.mesh.visible = true;
      c.mesh.position.set(c.x, c.y, 0);
      c.mesh.scale.set(w, h, 1);
      c.mesh.renderOrder = k === s.target ? 1000 : Math.round(c.j * 100);

      const dist = Math.hypot(c.x, c.y);
      const reveal = it < 0 ? 0 : smooth(waveR, waveR - motion.waveBand, dist);
      const waveFlare = it < 0 ? 0 : motion.waveAber * Math.exp(-(((dist - flareR) / motion.waveBand) ** 2)) * 0.1;

      let ripAber = 0;
      let ripWarp = 0;
      for (const rp of s.ripples) {
        const age = s.time - rp.born;
        const ring = age * pointer.rippleSpeed;
        const d = Math.hypot(c.x - rp.x, c.y - rp.y);
        const kk = Math.exp(-(((d - ring) / pointer.rippleWidth) ** 2)) * (1 - age / pointer.rippleLife);
        ripAber += pointer.rippleAmp * kk;
        ripWarp += pointer.rippleWarp * kk;
      }

      // Cover-fit the 16:9 texture into the card's current aspect.
      const cover = c.aspect / TEX_ASPECT;
      m.uRepeat.value.set(Math.min(1, cover), Math.min(1, 1 / cover));
      m.uOffset.value.set((1 - m.uRepeat.value.x) / 2, (1 - m.uRepeat.value.y) / 2);

      const birthFade = smooth(0, look.fadeBand, c.j);
      const focus = 1 - c.hold;
      m.uAlpha.value = birthFade * reveal;
      m.uBlur.value = (look.blurMax * (1 - smooth(0, look.blurEnd, c.j)) + 0.08 * (1 - reveal)) * focus;
      m.uAber.value = (look.aberration + c.flare + waveFlare + ripAber) * focus;
      m.uSize.value.set(w, h);
      m.uRadius.value = Math.min(look.cornerPx, h / 4);
      m.uFrameCol.value.set(frameCol);
      m.uFrameA.value = look.frameAlpha;
      m.uDrift.value += dt * (reduced ? 0 : 1);
      m.uRipple.value = ripWarp;
      m.uCurve.value = look.curvePx * (h / 160);

      if (s.mouse.inside && !reduced) {
        m.uMouse.value.set((s.mouse.x - c.x) / w, (s.mouse.y - c.y) / h);
        const d = Math.hypot(s.mouse.x - c.x, s.mouse.y - c.y);
        m.uWarp.value = pointer.mouseWarp * 0.1 * Math.max(0, 1 - d / pointer.fieldPx);
      } else {
        m.uWarp.value = ease(m.uWarp.value, 0, 0.2, dt);
      }

      m.uClickW.value = pointer.clickWidth * Math.max(w, h);
      c.clicks = c.clicks.filter((cl) => s.time - cl.born < pointer.clickDur);
      for (let i = 0; i < 4; i++) {
        const cl = c.clicks[i];
        const v = m.uClick.value[i] as THREE.Vector4;
        if (!cl) {
          v.w = 0;
          continue;
        }
        const p = (s.time - cl.born) / pointer.clickDur;
        v.set(cl.u, cl.v, p * Math.max(w, h) * 1.2, pointer.clickAmp * (1 - p));
      }
    }

    // Frame-rate governor: shed cards when we can't hold the floor, regrow slowly.
    if (!reduced && motion.perfFloor > 0 && it > motion.introDur) {
      s.fps = s.fps * 0.95 + (1 / Math.max(delta, 1e-3)) * 0.05;
      if (s.fps < motion.perfFloor) {
        s.slowFor += dt;
        s.fastFor = 0;
        if (s.slowFor > 1.5) {
          s.active = Math.max(8, Math.min(s.active, wanted) * 0.85);
          s.slowFor = 0;
        }
      } else if (s.fps > 52) {
        s.fastFor += dt;
        s.slowFor = 0;
        if (s.fastFor > 4 && s.active < MAX_CARDS) {
          s.active += 1;
          s.fastFor = 0;
        }
      }
    }

    drawUnderlay(underlay.current, W, H, {
      arms,
      turns,
      R,
      birth,
      uMax,
      spin: s.spin,
      time: reduced ? 0 : s.time,
      reveal: it < 0 ? 0 : clamp01(waveR / halfDiag),
      colors: colors.current,
    });
  });

  return <primitive object={group} />;
}

function drawUnderlay(
  canvas: HTMLCanvasElement | null,
  W: number,
  H: number,
  o: {
    arms: number;
    turns: number;
    R: number;
    birth: number;
    uMax: number;
    spin: number;
    time: number;
    reveal: number;
    colors: ReturnType<typeof readColors>;
  },
) {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio, 2);
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.translate(W / 2, H / 2);
  ctx.scale(1, -1);
  ctx.globalAlpha = o.reveal;

  const { ink, dark, accent } = o.colors;
  const steps = 160;
  const pointAt = (arm: number, u: number) => {
    const a = (arm / o.arms) * TAU + o.spin + o.turns * TAU * u;
    return [Math.cos(a) * u * o.R, Math.sin(a) * u * o.R, a] as const;
  };

  // Arm guide curves.
  ctx.lineCap = "round";
  ctx.strokeStyle = ink;
  ctx.lineWidth = look.lineW * 0.5;
  ctx.globalAlpha = o.reveal * look.lineAlpha;
  for (let arm = 0; look.lineAlpha > 0 && arm < o.arms; arm++) {
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const u = o.birth + (i / steps) * (o.uMax - o.birth);
      const [x, y] = pointAt(arm, u);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Dashed construction circle.
  if (look.lineAlpha > 0) {
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, layout.circFrac * o.R, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Ticks straddling each arm's outer half.
  ctx.globalAlpha = o.reveal * look.tickAlpha;
  ctx.lineWidth = 1;
  for (let arm = 0; look.tickAlpha > 0 && arm < o.arms; arm++) {
    for (let t = 0; t < layout.ticksPerArm; t++) {
      const u = 0.5 + (t / layout.ticksPerArm) * (o.uMax - 0.5);
      const [x, y, a] = pointAt(arm, u);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      const len = t % 4 === 0 ? 7 : 3.5;
      ctx.beginPath();
      ctx.moveTo(x - nx * len, y - ny * len);
      ctx.lineTo(x + nx * len, y + ny * len);
      ctx.stroke();
    }
  }

  // Comet pulses travelling outward along the arms.
  const accentHsl = hexToHsl(accent);
  const segs = 24;
  for (let arm = 0; arm < o.arms; arm++) {
    const color = dark
      ? `hsl(${(accentHsl[0] + (arm / o.arms) * 360 * look.pulseHue) % 360}, 90%, 62%)`
      : `color-mix(in srgb, ${ink} ${Math.round(look.pulseDark * 100)}%, transparent)`;
    ctx.strokeStyle = color;
    for (let p = 0; p < look.pulseCount; p++) {
      const head = frac(o.time * look.pulseSpeed * 0.35 + p / look.pulseCount + arm * 0.137);
      for (let sgi = 0; sgi < segs; sgi++) {
        const f0 = sgi / segs;
        const f1 = (sgi + 1) / segs;
        const p0 = head - look.pulseWidth * 2 * (1 - f0);
        const p1 = head - look.pulseWidth * 2 * (1 - f1);
        if (p0 < 0) continue;
        const u0 = o.birth + p0 * (o.uMax - o.birth);
        const u1 = o.birth + p1 * (o.uMax - o.birth);
        const [x0, y0] = pointAt(arm, u0);
        const [x1, y1] = pointAt(arm, u1);
        ctx.globalAlpha = o.reveal * look.pulseAlpha * f1 * f1;
        ctx.lineWidth = look.lineW * 0.5 + look.pulseW * f1;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
}

function hexToHsl(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.replace(/./g, "$&$&") : m.slice(0, 6), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
}

export default function Galaxy() {
  const underlay = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  // Client-only component (loaded with ssr: false), so window is safe here.
  const [reduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0 overflow-hidden" aria-hidden>
      <canvas ref={underlay} className="absolute inset-0 h-full w-full" />
      <Canvas
        className="!absolute inset-0"
        style={{ pointerEvents: "none" }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={reduced ? "demand" : onScreen ? "always" : "never"}
        flat
        linear
      >
        <Field underlay={underlay} reduced={reduced} />
      </Canvas>
    </div>
  );
}
