// Skill tiles for the hero galaxy: a brand logo (from simple-icons, CC0) on a
// tinted blueprint card, painted to a canvas so WebGL can use it as a texture.
import {
  siAntdesign,
  siBootstrap,
  siCss,
  siExpo,
  siHtml5,
  siJavascript,
  siNextdotjs,
  siReact,
  siRedux,
  siTailwindcss,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";

export const skillIcons = {
  javascript: siJavascript,
  typescript: siTypescript,
  html5: siHtml5,
  css: siCss,
  react: siReact,
  nextjs: siNextdotjs,
  expo: siExpo,
  tailwind: siTailwindcss,
  bootstrap: siBootstrap,
  antdesign: siAntdesign,
  redux: siRedux,
} satisfies Record<string, SimpleIcon>;

export type SkillIconKey = keyof typeof skillIcons;

// A skill with no logo in the set falls back to a lettered monogram.
export type Skill = { name: string; icon?: SkillIconKey; mono?: string; color?: string };

export type TileTheme = { dark: boolean; ink: string; bg: string };

export const TILE_W = 768;
export const TILE_H = 432;

// Normalises any CSS colour (registered custom properties compute to rgb())
// to #rrggbb, using the canvas colour parser.
let parser: CanvasRenderingContext2D | null = null;
export function toHex(color: string, fallback = "#888888") {
  parser ??= document.createElement("canvas").getContext("2d");
  if (!parser || !color) return fallback;
  parser.fillStyle = fallback;
  parser.fillStyle = color;
  const out = String(parser.fillStyle);
  if (out.startsWith("#")) return out;
  const m = out.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return fallback;
  return `#${m.slice(0, 3).map((v) => Math.round(+v).toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

// Relative luminance, used to swap near-black logos for the theme's ink.
function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const rgba = (hex: string, a: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

export function paintSkillTile(canvas: HTMLCanvasElement, skill: Skill, theme: TileTheme) {
  canvas.width = TILE_W;
  canvas.height = TILE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = TILE_W;
  const H = TILE_H;
  const ink = toHex(theme.ink);
  theme = { ...theme, ink };
  const icon = skill.icon ? skillIcons[skill.icon] : null;
  const brand = `#${icon?.hex ?? skill.color ?? "2d81ff"}`;
  // Logos that vanish against the background are drawn in ink instead.
  const lum = luminance(brand);
  const glyph = (theme.dark && lum < 0.06) || (!theme.dark && lum > 0.75) ? theme.ink : brand;

  // Transparent tile: just the logo floating in a soft brand-coloured glow
  // that fades out well before the edges, so no card shape shows.
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2;
  const cy = H / 2;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.48);
  glow.addColorStop(0, rgba(brand, theme.dark ? 0.28 : 0.16));
  glow.addColorStop(1, rgba(brand, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Logo, centred so it survives the square crop young cards use.
  const size = H * 0.56;
  ctx.save();
  ctx.shadowColor = rgba(brand, theme.dark ? 0.6 : 0.35);
  ctx.shadowBlur = 36;
  ctx.fillStyle = glyph;
  if (icon) {
    ctx.translate(cx - size / 2, cy - size / 2);
    ctx.scale(size / 24, size / 24);
    ctx.fill(new Path2D(icon.path));
  } else {
    // No logo in the set: a bold monogram instead.
    ctx.font = `800 ${size * 0.62}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(skill.mono ?? skill.name.slice(0, 2).toUpperCase(), cx, cy + size * 0.04);
  }
  ctx.restore();
}
