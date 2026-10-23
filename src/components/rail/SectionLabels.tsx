"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type Lenis from "lenis";
import { useLenis } from "@/components/SmoothScroll";
import { NAV_H, clamp01, easeInOutCubic, easeOutExpo, heroWordmark } from "@/components/intro/heroWordmark";
import { DISPLAY_STRETCH, DISPLAY_WEIGHT, rail, railLook, railMotion, railOccupancy, rulerMap } from "./railConfig";

export type RailSection = { id: string; label: string; anchor: number; bottom: number; isHero: boolean };
export type Geom = { docH: number; vh: number; vw: number };
type Metrics = { adv: number[]; cum: number[]; total: number };
type Pose = { x: number; y: number; rot: number; scale: number; alpha: number };

const WORDMARK_WEIGHT = 800;
const WORDMARK_STRETCH = 125;

// Measure every label letter by letter at 100px so poses can be laid out in em.
function measure(labels: string[]): Record<string, Metrics> {
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;white-space:pre;font-size:100px;line-height:1;";
  probe.style.fontFamily = "var(--font-archivo)";
  probe.style.fontWeight = String(DISPLAY_WEIGHT);
  probe.style.fontStretch = `${DISPLAY_STRETCH}%`;
  document.body.appendChild(probe);
  const out: Record<string, Metrics> = {};
  for (const label of labels) {
    probe.textContent = "";
    const spans = label.split("").map((ch) => {
      const s = document.createElement("span");
      s.textContent = ch;
      probe.appendChild(s);
      return s;
    });
    const adv = spans.map((s) => s.getBoundingClientRect().width / 100);
    const cum: number[] = [];
    let total = 0;
    for (const a of adv) {
      cum.push(total);
      total += a;
    }
    out[label] = { adv, cum, total };
  }
  probe.remove();
  return out;
}

const poolMask = (at: string) =>
  `radial-gradient(100% 100% at 100% ${at}, black 38%, rgba(0,0,0,0.82) 56%, rgba(0,0,0,0.48) 72%, rgba(0,0,0,0.2) 86%, rgba(0,0,0,0.05) 94%, transparent 97%)`;

// Each section's label lives in one of three places, and every letter flies
// between them on its own staggered, bowed path:
//   queued  – small and faint, stacked at the bottom right
//   riding  – vertical on the ruler rail, pinned to where its section starts
//   flipped – horizontal in the top-right stack once the section takes over
// The hero's label is the wordmark itself, lifted out of the hero.
export default function SectionLabels({ sections, geom }: { sections: RailSection[]; geom: Geom }) {
  const lenis = useLenis();
  const lenisRef = useRef<Lenis | null>(lenis);
  const [metrics, setMetrics] = useState<Record<string, Metrics> | null>(null);
  const nodes = useRef<{ letters: (HTMLSpanElement | null)[]; hit: HTMLAnchorElement | null }[]>([]);
  const topPool = useRef<HTMLDivElement>(null);
  const bottomPool = useRef<HTMLDivElement>(null);
  const hovered = useRef(-1);
  const motion = useRef({
    lastY: 0,
    vel: 0,
    snapSince: null as number | null,
    snapping: false,
    armed: true,
    jumping: false,
    hover: [] as number[],
    flash: [] as number[],
  });

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  const labelKey = sections.map((s) => s.label).join("|");
  useEffect(() => {
    let dead = false;
    const run = () => !dead && setMetrics(measure(labelKey.split("|")));
    document.fonts.ready.then(run).catch(run);
    return () => {
      dead = true;
    };
  }, [labelKey]);

  useEffect(() => {
    if (!metrics || !sections.length || !geom.docH) return;
    const st = motion.current;
    let last = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.1) || 0.016;
      last = now;
      const { docH, vh, vw } = geom;
      const C = window.scrollY;
      const maxScroll = Math.max(1, docH - vh);
      const T = rulerMap(vh, rail.edgePad).drift(clamp01(C / maxScroll));
      st.vel += ((C - st.lastY) / dt - st.vel) * (1 - Math.exp(-6 * dt));
      st.lastY = C;

      const L = (rail.thresholdPct / 100) * vh; // flip line
      const A = NAV_H + rail.topPad; // top of the flipped stack
      const I = vh - rail.queuePad; // bottom of the queue
      const D = rail.headingPx;
      const rideS = rail.ridingPx / D;
      const queueS = rail.queuePx / D;
      const railX = vw - rail.railW / 2;
      const heroReady = heroWordmark.ready;

      // Where each section stands: how far it has flipped into the top stack,
      // and how far it has detached from the bottom queue to ride the rail.
      const state = sections.map((sec) => {
        const m = sec.isHero && heroReady ? heroWordmark.metrics : metrics[sec.label];
        const rideLen = (m?.total ?? 0) * D * rideS;
        const v = sec.anchor - C + T;
        let flipP: number;
        let scrollFlip: { start: number; end: number } | null = null;
        let detachP = 0;
        if (sec.isHero) {
          detachP = 1;
          const top = heroReady ? Math.min(...heroWordmark.baseDocY) - 0.5 * heroWordmark.fontPx : 0;
          const start = Math.max(0, top - NAV_H - railMotion.heroLead);
          flipP = clamp01((C - start) / railMotion.heroZone);
          scrollFlip = { start, end: start + railMotion.heroZone };
        } else {
          flipP = clamp01((L + railMotion.flipZone - v) / railMotion.flipZone);
          // A section near the page end may never reach the flip line; flip it
          // over the last stretch of scroll instead.
          if (sec.anchor - maxScroll > L) {
            const s0 = Math.min(sec.bottom - vh, maxScroll - 24);
            const len = Math.max(24, maxScroll - s0);
            flipP = Math.max(flipP, clamp01((C - s0) / len));
            scrollFlip = { start: s0, end: maxScroll };
          }
        }
        return { v, rideLen, flipP, scrollFlip, detachP, yq: I };
      });

      // Queue slots fill from the bottom up, compacting as labels detach.
      let used = 0;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].isHero) continue;
        const s = state[i];
        s.yq = I - rail.queueSlot * used;
        s.detachP = clamp01((s.yq + railMotion.detachZone - (s.v + s.rideLen)) / railMotion.detachZone);
        used += 1 - s.detachP;
      }

      railOccupancy.spans.length = 0;
      let fullyFlipped = 0;
      let partialFlip = 0;
      for (const s of state) {
        if (s.flipP >= 1) fullyFlipped++;
        else if (s.flipP > 0) partialFlip += s.flipP;
      }
      let maxFlip = 0;
      let maxQueued = 0;
      state.forEach((s, i) => {
        maxFlip = Math.max(maxFlip, s.flipP);
        if (!sections[i].isHero) maxQueued = Math.max(maxQueued, 1 - s.detachP);
      });
      if (topPool.current) topPool.current.style.opacity = String(railLook.poolAlpha * maxFlip);
      if (bottomPool.current) bottomPool.current.style.opacity = String(railLook.poolAlpha * maxQueued);

      // Horizontal, right-aligned against the rail.
      const flat = (m: Metrics, i: number, y: number, scale: number, alpha: number): Pose => {
        const s = (m.cum[i] + m.adv[i] / 2) * D * scale;
        const a = rail.railW + rail.textPad + (m.total * D * scale - s);
        return { x: vw - a, y, rot: 0, scale, alpha };
      };
      // Vertical on the rail, reading bottom to top from the section's start.
      const riding = (m: Metrics, i: number, y0: number): Pose => ({
        x: railX,
        y: y0 + (m.total - m.cum[i] - m.adv[i] / 2) * D * rideS,
        rot: -90,
        scale: rideS,
        alpha: railLook.queueAlpha,
      });

      for (let e = 0; e < sections.length; e++) {
        const sec = sections[e];
        const isHero = sec.isHero && heroReady;
        const m = isHero ? heroWordmark.metrics : metrics[sec.label];
        const node = nodes.current[e];
        if (!m || !node || (sec.isHero && !isHero) || (sec.isHero && heroWordmark.forming)) continue;
        const { v, rideLen, flipP, detachP, yq } = state[e];
        const N = m.adv.length;
        const home = (i: number): Pose => ({
          x: heroWordmark.baseX[i],
          y: heroWordmark.baseDocY[i] - C,
          rot: 0,
          scale: heroWordmark.fontPx / D,
          alpha: 1,
        });

        let t: number;
        let from: (i: number) => Pose;
        let to: (i: number) => Pose;
        let reverse = false;
        if (flipP > 0) {
          t = flipP;
          reverse = true;
          from = isHero ? home : (i) => riding(m, i, v);
          if (flipP >= 1) {
            // The newest settled label stays big until the next one arrives.
            const k = e === fullyFlipped - 1 ? partialFlip : 1;
            const y = A + e * rail.queueSlot + rail.currentGap * (1 - k);
            const sc = 1 - (1 - queueS) * k;
            const al = 1 - (1 - railLook.queueAlpha) * k;
            to = (i) => flat(m, i, y, sc, al);
          } else {
            to = (i) => flat(m, i, A + e * rail.queueSlot + rail.currentGap, 1, 1);
          }
        } else if (detachP < 1) {
          t = detachP;
          reverse = true;
          from = (i) => flat(m, i, yq, queueS, railLook.queueAlpha);
          to = (i) => riding(m, i, yq - rideLen);
        } else {
          t = 1;
          from = to = isHero ? home : (i) => riding(m, i, v);
        }

        const span = 1 + (N - 1) * railMotion.stagger;
        const toHeroScale = isHero ? D / heroWordmark.fontPx : 1;
        st.hover[e] = (st.hover[e] ?? 0) + ((hovered.current === e ? 1 : 0) - (st.hover[e] ?? 0)) * (1 - Math.exp(-dt / 0.08));
        const flash = clamp01(((st.flash[e] ?? 0) - now) / 350);
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        let peakAlpha = 0;

        for (let i = 0; i < N; i++) {
          const el = isHero ? heroWordmark.els[i] : node.letters[i];
          if (!el) continue;
          const order = reverse ? N - 1 - i : i;
          const p = easeInOutCubic(clamp01(t * span - order * railMotion.stagger));
          const a = from(i);
          const b = to(i);
          // Quadratic bezier bowed away from the rail.
          const cx = (a.x + b.x) / 2 - railMotion.arc;
          const cy = (a.y + b.y) / 2;
          const q = 1 - p;
          const x = q * q * a.x + 2 * q * p * cx + p * p * b.x;
          const y = q * q * a.y + 2 * q * p * cy + p * p * b.y;
          const rot = a.rot + (b.rot - a.rot) * p;
          const scale = a.scale + (b.scale - a.scale) * p;
          const alpha = a.alpha + (b.alpha - a.alpha) * p;

          if (isHero) {
            el.style.transform = `translate3d(${x - heroWordmark.baseX[i]}px, ${y - (heroWordmark.baseDocY[i] - C)}px, 0) rotate(${rot}deg) scale(${scale * toHeroScale})`;
            const morph = flipP > 0 ? p : 0;
            el.style.fontWeight = String(Math.round(WORDMARK_WEIGHT - (WORDMARK_WEIGHT - DISPLAY_WEIGHT) * morph));
            el.style.fontStretch = `${(WORDMARK_STRETCH - (WORDMARK_STRETCH - DISPLAY_STRETCH) * morph).toFixed(1)}%`;
          } else {
            el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`;
          }
          el.style.opacity = "1";
          const lit = alpha + (1 - alpha) * st.hover[e];
          const base =
            lit >= 0.995
              ? "var(--ink-strong)"
              : `color-mix(in srgb, var(--ink-strong) ${(100 * clamp01(lit)).toFixed(1)}%, var(--bg))`;
          el.style.color = flash > 0.01 ? `color-mix(in srgb, var(--accent-ink) ${(70 * flash).toFixed(0)}%, ${base})` : base;
          if (alpha > peakAlpha) peakAlpha = alpha;

          const hw = (m.adv[i] * D * scale) / 2 + 2;
          const hh = (D * scale) / 2 + 2;
          const vertical = Math.abs(rot) > 45;
          const bx = vertical ? hh : hw;
          const by = vertical ? hw : hh;
          minX = Math.min(minX, x - bx);
          maxX = Math.max(maxX, x + bx);
          minY = Math.min(minY, y - by);
          maxY = Math.max(maxY, y + by);
        }

        const occupy = sec.isHero ? 0 : detachP * (1 - flipP);
        if (occupy > 0.02) railOccupancy.spans.push({ top: v, bottom: v + rideLen, k: occupy });
        if (node.hit && Number.isFinite(minX)) {
          node.hit.style.left = `${minX - 2}px`;
          node.hit.style.top = `${minY - 2}px`;
          node.hit.style.width = `${maxX - minX + 4}px`;
          node.hit.style.height = `${maxY - minY + 4}px`;
          node.hit.style.pointerEvents = peakAlpha > 0.05 && (!sec.isHero || flipP > 0.05) ? "auto" : "none";
        }
      }

      // Never rest half-flipped: once scrolling stops, finish or undo the flip.
      const lenis = lenisRef.current;
      const mid = state.findIndex((s) => s.flipP > 0.04 && s.flipP < 0.96);
      if (st.snapping) {
        if (mid < 0) st.snapping = false;
      } else if (mid >= 0 && st.armed && !st.jumping && Math.abs(st.vel) < 30 && lenis) {
        if (st.snapSince === null) st.snapSince = now;
        else if (now - st.snapSince > railMotion.snapDelay) {
          const s = state[mid];
          const sec = sections[mid];
          const flipLines = (sc: RailSection, ss: (typeof state)[number]) => {
            const yFlip = sc.anchor + T - L - 0.04 * railMotion.flipZone;
            const yUnflip = sc.anchor + T - L - 0.96 * railMotion.flipZone;
            if (!ss.scrollFlip) return { yFlip, yUnflip };
            const len = ss.scrollFlip.end - ss.scrollFlip.start;
            const f = ss.scrollFlip.start + 0.96 * len;
            const u = ss.scrollFlip.start + 0.04 * len;
            return sc.isHero ? { yFlip: f, yUnflip: u } : { yFlip: Math.min(yFlip, f), yUnflip: Math.min(yUnflip, u) };
          };
          let goal: number;
          if (s.scrollFlip) goal = s.flipP >= 0.5 ? s.scrollFlip.end + 4 : s.scrollFlip.start - 4;
          else goal = sec.anchor + T - (s.flipP >= 0.5 ? L - 4 : L + railMotion.flipZone + 4);
          // Don't let the snap knock any other label out of its settled state.
          let target = goal;
          for (let k = 0; k < state.length; k++) {
            if (k === mid) continue;
            const lines = flipLines(sections[k], state[k]);
            if (state[k].flipP >= 0.96) target = Math.max(target, lines.yFlip + 2);
            else if (state[k].flipP <= 0.04) target = Math.min(target, lines.yUnflip - 2);
          }
          const own = flipLines(sec, s);
          const ok = s.flipP >= 0.5 ? target >= own.yFlip : target <= own.yUnflip;
          const dest = Math.max(0, Math.min(maxScroll, ok ? target : goal));
          st.snapping = true;
          st.armed = false;
          st.snapSince = null;
          lenis.scrollTo(dest, {
            duration: railMotion.snapDur,
            easing: easeInOutCubic,
            onComplete: () => {
              st.snapping = false;
            },
          });
        }
      } else st.snapSince = null;
    };

    const arm = () => {
      st.armed = true;
    };
    window.addEventListener("wheel", arm, { passive: true });
    window.addEventListener("touchmove", arm, { passive: true });
    window.addEventListener("keydown", arm);
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener("wheel", arm);
      window.removeEventListener("touchmove", arm);
      window.removeEventListener("keydown", arm);
      gsap.ticker.remove(tick);
      for (const el of heroWordmark.els) {
        el.style.transform = "";
        el.style.fontWeight = "";
        el.style.fontStretch = "";
        el.style.color = "";
      }
    };
  }, [metrics, sections, geom]);

  if (!metrics) return null;

  const widest = Math.max(260, ...sections.map((s) => (metrics[s.label]?.total ?? 0) * rail.headingPx));
  const poolW = widest + rail.railW + rail.textPad + railLook.poolPad;
  const n = sections.length;
  const topH = NAV_H + rail.topPad + Math.max(0, n - 1) * rail.queueSlot + rail.currentGap + rail.headingPx + railLook.poolPad;
  const bottomH = rail.queuePad + n * rail.queueSlot + railLook.poolPad;
  const frost = {
    backdropFilter: "blur(9px)",
    WebkitBackdropFilter: "blur(9px)",
    backgroundColor: "color-mix(in srgb, var(--bg) 80%, transparent)",
  };

  const jump = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    const st = motion.current;
    st.flash[i] = e.timeStamp + 350; // same clock as performance.now()
    st.armed = false;
    st.jumping = true;
    const sec = sections[i];
    const el = document.getElementById(sec.id);
    const top = sec.isHero ? 0 : el ? el.getBoundingClientRect().top + window.scrollY - NAV_H : sec.anchor - NAV_H;
    const l = lenisRef.current;
    if (l) {
      l.scrollTo(top, {
        duration: railMotion.jumpDur,
        easing: easeOutExpo,
        onComplete: () => {
          st.jumping = false;
        },
      });
    } else {
      window.scrollTo({ top });
      st.jumping = false;
    }
  };

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[39]">
        <div
          ref={topPool}
          className="absolute top-0 right-0"
          style={{ width: poolW, height: topH, opacity: 0, ...frost, maskImage: poolMask("0%"), WebkitMaskImage: poolMask("0%") }}
        />
        <div
          ref={bottomPool}
          className="absolute right-0 bottom-0"
          style={{ width: poolW, height: bottomH, opacity: 0, ...frost, maskImage: poolMask("100%"), WebkitMaskImage: poolMask("100%") }}
        />
      </div>
      <div data-track-location="rail" className="pointer-events-none fixed inset-0 z-[45]">
        {sections.map((sec, i) => {
          const node = (nodes.current[i] ??= { letters: [], hit: null });
          return (
            <Fragment key={sec.id}>
              <a
                href={`#${sec.id}`}
                ref={(el) => {
                  node.hit = el;
                }}
                onClick={(e) => jump(e, i)}
                onPointerEnter={() => (hovered.current = i)}
                onPointerLeave={() => {
                  if (hovered.current === i) hovered.current = -1;
                }}
                aria-label={`Jump to ${sec.isHero ? "top" : sec.label.toLowerCase()}`}
                className="pointer-events-auto absolute cursor-pointer"
              />
              {!sec.isHero &&
                sec.label.split("").map((ch, j) => (
                  <span
                    key={j}
                    ref={(el) => {
                      node.letters[j] = el;
                    }}
                    aria-hidden
                    className="absolute top-0 left-0 whitespace-pre text-ink-strong"
                    style={{
                      fontFamily: "var(--font-archivo)",
                      fontWeight: DISPLAY_WEIGHT,
                      fontStretch: `${DISPLAY_STRETCH}%`,
                      fontSize: rail.headingPx,
                      lineHeight: 1,
                      opacity: 0,
                      willChange: "transform, opacity",
                      textShadow: "0 0 4px var(--bg), 0 0 10px var(--bg)",
                    }}
                  >
                    {ch}
                  </span>
                ))}
            </Fragment>
          );
        })}
      </div>
    </>
  );
}

// Reduced-motion fallback: a plain list in the bottom-right corner.
export function StaticSectionLabels({ sections }: { sections: RailSection[] }) {
  return (
    <nav aria-label="Sections" className="fixed z-40 text-right" style={{ bottom: rail.queuePad, right: rail.railW + rail.textPad }}>
      <ul className="relative flex flex-col gap-1.5">
        {sections
          .filter((s) => !s.isHero)
          .map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="font-display text-ink hover:text-ink-strong" style={{ fontSize: rail.queuePx + 2 }}>
                {s.label}
              </a>
            </li>
          ))}
      </ul>
    </nav>
  );
}
