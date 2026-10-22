// Procedural placeholder "footage": small cinematic scenes painted on a 2D
// canvas from a seed. Used wherever real video hasn't been supplied yet.

export function rng(seed: number) {
  let a = seed * 2654435761;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hsl = (h: number, s: number, l: number, a = 1) => `hsla(${h % 360},${s}%,${l}%,${a})`;

type Ctx = CanvasRenderingContext2D;

function ridge(ctx: Ctx, w: number, h: number, base: number, amp: number, r: () => number, phase: number) {
  const f1 = 1 + r() * 2;
  const f2 = 3 + r() * 5;
  const o1 = r() * 10;
  const o2 = r() * 10;
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += w / 60) {
    const u = x / w;
    const y =
      base +
      Math.sin(u * Math.PI * f1 + o1 + phase) * amp +
      Math.sin(u * Math.PI * f2 + o2 + phase * 1.7) * amp * 0.35;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
}

function landscape(ctx: Ctx, w: number, h: number, r: () => number, t: number) {
  const hue = r() * 360;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, hsl(hue + 200, 45, 18));
  sky.addColorStop(0.55, hsl(hue + 20, 70, 62));
  sky.addColorStop(1, hsl(hue + 35, 80, 78));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const sx = w * (0.25 + r() * 0.5);
  const sy = h * (0.42 + Math.sin(t * 0.15) * 0.03);
  const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.5);
  sun.addColorStop(0, hsl(hue + 40, 100, 92, 1));
  sun.addColorStop(0.08, hsl(hue + 40, 100, 80, 0.9));
  sun.addColorStop(1, hsl(hue + 40, 100, 70, 0));
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);

  const layers = 4;
  for (let i = 0; i < layers; i++) {
    const k = i / (layers - 1);
    ctx.fillStyle = hsl(hue + 220 - k * 30, 25 + k * 10, 48 - k * 38);
    ridge(ctx, w, h, h * (0.5 + k * 0.14), h * (0.09 - k * 0.02), r, t * 0.04 * (i + 1));
  }
}

function orbs(ctx: Ctx, w: number, h: number, r: () => number, t: number) {
  const hue = r() * 360;
  ctx.fillStyle = hsl(hue + 230, 30, 7);
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  const n = 5;
  for (let i = 0; i < n; i++) {
    const px = r();
    const py = r();
    const sp = 0.1 + r() * 0.2;
    const x = w * (px + Math.sin(t * sp + i) * 0.12);
    const y = h * (py + Math.cos(t * sp * 1.3 + i) * 0.12);
    const rad = Math.max(w, h) * (0.25 + r() * 0.3);
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, hsl(hue + i * 47, 85, 55, 0.65));
    g.addColorStop(1, hsl(hue + i * 47, 85, 40, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = "source-over";
}

function gridWorld(ctx: Ctx, w: number, h: number, r: () => number, t: number) {
  const hue = r() * 360;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, hsl(hue + 240, 35, 10));
  bg.addColorStop(0.5, hsl(hue + 280, 40, 22));
  bg.addColorStop(1, hsl(hue + 240, 30, 6));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const horizon = h * 0.52;
  ctx.strokeStyle = hsl(hue + 180, 90, 65, 0.5);
  ctx.lineWidth = Math.max(1, w / 400);
  const scroll = (t * 0.25) % 1;
  for (let i = 0; i < 14; i++) {
    const z = (i + scroll) / 14;
    const y = horizon + (h - horizon) * z * z;
    ctx.globalAlpha = z;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (let i = -10; i <= 10; i++) {
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * w * 0.02, horizon);
    ctx.lineTo(w / 2 + i * w * 0.18, h);
    ctx.stroke();
  }

  // A floating monolith with a soft glow.
  const cx = w * (0.35 + r() * 0.3);
  const cy = horizon - h * 0.12 + Math.sin(t * 0.8) * h * 0.02;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 0.45);
  glow.addColorStop(0, hsl(hue + 20, 100, 70, 0.55));
  glow.addColorStop(1, hsl(hue + 20, 100, 50, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = hsl(hue + 240, 20, 4);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(t * 0.3) * 0.08);
  ctx.fillRect(-h * 0.05, -h * 0.17, h * 0.1, h * 0.34);
  ctx.restore();
}

function interior(ctx: Ctx, w: number, h: number, r: () => number, t: number) {
  const hue = r() * 360;
  ctx.fillStyle = hsl(hue + 30, 18, 14);
  ctx.fillRect(0, 0, w, h);

  // Window light spilling across the room.
  const wx = w * (0.1 + r() * 0.3);
  const ww = w * 0.32;
  const light = ctx.createLinearGradient(wx, 0, wx + ww * 1.8, h);
  light.addColorStop(0, hsl(hue + 40, 70, 82, 0.95));
  light.addColorStop(1, hsl(hue + 40, 70, 60, 0));
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.moveTo(wx, h * 0.12);
  ctx.lineTo(wx + ww, h * 0.12);
  ctx.lineTo(wx + ww * 2.2, h);
  ctx.lineTo(wx + ww * 0.6, h);
  ctx.closePath();
  ctx.fill();

  // A figure in silhouette, breathing gently.
  const fx = w * (0.55 + r() * 0.25);
  const fy = h * 0.58 + Math.sin(t * 1.2) * h * 0.005;
  ctx.fillStyle = hsl(hue + 200, 20, 6);
  ctx.beginPath();
  ctx.arc(fx, fy - h * 0.2, h * 0.075, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(fx, fy + h * 0.15, h * 0.16, h * 0.27, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(fx - h * 0.16, fy + h * 0.15, h * 0.32, h);

  // Dust motes drifting through the beam.
  ctx.fillStyle = hsl(hue + 40, 80, 90, 0.6);
  for (let i = 0; i < 24; i++) {
    const x = (r() * w + t * 6 * (0.5 + r())) % w;
    const y = (r() * h + t * 3) % h;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
}

const styles = [landscape, orbs, gridWorld, interior];

export function paintScene(ctx: Ctx, w: number, h: number, seed: number, t = 0) {
  const r = rng(seed);
  ctx.save();
  styles[seed % styles.length](ctx, w, h, r, t);
  ctx.restore();

  // Vignette for a lensed, filmic finish.
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

const cache = new Map<number, HTMLCanvasElement>();

// A static frame for a seed, cached. The galaxy uses these as textures.
export function sceneFrame(seed: number, w = 512, h = 288) {
  const key = seed * 10000 + w;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  paintScene(c.getContext("2d")!, w, h, seed, seed * 3.1);
  cache.set(key, c);
  return c;
}
