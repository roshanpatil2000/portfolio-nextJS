"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { sectionIndex } from "@/content/home";
import { useLenis } from "@/components/SmoothScroll";
import { introBeats, introClock, onIntroReplay } from "@/components/intro/clock";
import { clamp01, easeOutExpo } from "@/components/intro/heroWordmark";
import SectionLabels, { StaticSectionLabels, type Geom, type RailSection } from "./SectionLabels";
import { rail, railLook, railMotion, railOccupancy, rulerMap } from "./railConfig";

type Mode = "full" | "static" | null;

// "full" on desktop with a fine pointer, "static" for reduced motion,
// nothing at all on touch / narrow screens.
const queries = ["(pointer: fine) and (hover: hover) and (min-width: 1024px)", "(prefers-reduced-motion: no-preference)"];
function subscribeMode(fn: () => void) {
  const mqs = queries.map((q) => window.matchMedia(q));
  mqs.forEach((m) => m.addEventListener("change", fn));
  return () => mqs.forEach((m) => m.removeEventListener("change", fn));
}
function readMode(): Mode {
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (mobile || !window.matchMedia(queries[0]).matches) return null;
  return window.matchMedia(queries[1]).matches ? "full" : "static";
}

// Fades the frosted rail out toward the page.
function frostMask(solid: number, gamma: number) {
  const stops = [`black ${solid.toFixed(0)}%`];
  for (let i = 1; i < 8; i++) {
    const f = i / 8;
    stops.push(`rgba(0,0,0,${Math.pow(1 - f, gamma).toFixed(3)}) ${(solid + f * (100 - solid)).toFixed(1)}%`);
  }
  stops.push("transparent 100%");
  return `linear-gradient(to left, ${stops.join(", ")})`;
}

export default function Rail() {
  const mode = useSyncExternalStore(subscribeMode, readMode, () => null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const [geom, setGeom] = useState<Geom>({ docH: 0, vh: 0, vw: 0 });
  const [sections, setSections] = useState<RailSection[]>([]);

  const root = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const needle = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const ghost = useRef<HTMLDivElement>(null);
  const tickEls = useRef<(HTMLSpanElement | null)[]>([]);
  const labelEls = useRef<(HTMLSpanElement | null)[]>([]);
  const digitEls = useRef<(HTMLSpanElement | null)[]>([]);
  const live = useRef({
    geom,
    vel: 0,
    lastY: 0,
    introDone: false,
    prevPct: -1,
    prevDigits: [-1, -1, -1],
    readoutAbove: false,
    ghostActive: false,
    ghostY: 0,
    dragging: false,
    dragStartY: 0,
    dragMoved: 0,
  });

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useEffect(() => {
    live.current.geom = geom;
  }, [geom]);

  // Hide the native scrollbar while the rail stands in for it.
  useEffect(() => {
    if (!mode) return;
    const html = document.documentElement;
    html.dataset.ruler = mode === "full" ? "on" : "static";
    return () => {
      delete html.dataset.ruler;
    };
  }, [mode]);

  // Track page geometry and where each section sits in the document.
  useEffect(() => {
    if (!mode) return;
    const update = () => {
      const next = { docH: document.documentElement.scrollHeight, vh: window.innerHeight, vw: window.innerWidth };
      setGeom((g) => (g.docH === next.docH && g.vh === next.vh && g.vw === next.vw ? g : next));
      const found: RailSection[] = [];
      for (const s of sectionIndex) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        found.push({ id: s.id, label: s.label, anchor: r.top + window.scrollY, bottom: r.bottom + window.scrollY, isHero: s.id === "hero" });
      }
      setSections((prev) =>
        prev.length === found.length && prev.every((p, i) => p.anchor === found[i].anchor && p.bottom === found[i].bottom) ? prev : found,
      );
    };
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    window.addEventListener("resize", update);
    document.fonts.ready.then(update).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [mode]);

  const ticks = useMemo(() => {
    if (!mode || !geom.docH) return [];
    const out: { pct: number; docY: number; major: boolean; alpha: number }[] = [];
    for (let p = 0; p <= 100 + 1e-6; p += rail.minorPct) {
      const pct = Math.round(p * 100) / 100;
      const major = Math.abs(pct % rail.labelPct) < 1e-6;
      out.push({ pct, docY: (pct / 100) * geom.docH, major, alpha: major ? railLook.majorAlpha : railLook.minorAlpha });
    }
    return out;
  }, [mode, geom.docH]);

  // Intro: ticks draw in, staggered top to bottom, after the hero copy lands.
  useEffect(() => {
    if (mode !== "full" || !ticks.length) return;
    const els = tickEls.current.filter((e): e is HTMLSpanElement => !!e);
    const st = live.current;
    let tl: gsap.core.Timeline | null = null;
    const run = () => {
      tl?.kill();
      const wait = introBeats.copyAt - introClock.t;
      if (wait < -2) {
        gsap.set(els, { scaleX: 1, opacity: (i: number) => ticks[i]?.alpha ?? 0.3 });
        st.introDone = true;
        return;
      }
      st.introDone = false;
      gsap.set(els, { scaleX: 0, opacity: 0 });
      tl = gsap.timeline({ delay: Math.max(0, wait) });
      tl.to(els, {
        scaleX: 1,
        opacity: (i: number) => ticks[i]?.alpha ?? 0.3,
        duration: railMotion.introDur,
        stagger: railMotion.introStagger,
        ease: "power3.out",
        overwrite: true,
        onComplete: () => {
          st.introDone = true;
        },
      });
    };
    run();
    const off = onIntroReplay(run);
    return () => {
      off();
      tl?.kill();
      st.introDone = true;
    };
  }, [mode, ticks]);

  // Per frame: move the tick strip with the page, park the needle at the
  // current progress, roll the readout digits, and stretch ticks with speed.
  useEffect(() => {
    if (!mode || !geom.docH) return;
    const full = mode === "full";
    const tick = (_t: number, deltaMs: number) => {
      const st = live.current;
      const { docH, vh } = st.geom;
      if (!vh) return;
      const dt = Math.min(deltaMs / 1000, 0.1) || 0.016;
      const s = window.scrollY;
      const maxScroll = Math.max(1, docH - vh);
      const f = clamp01(s / maxScroll);
      st.vel += ((s - st.lastY) / dt - st.vel) * (1 - Math.exp(-6 * dt));
      st.lastY = s;
      const map = rulerMap(vh, rail.edgePad);
      const drift = map.drift(f);
      if (strip.current) strip.current.style.transform = `translate3d(0, ${-s + drift}px, 0)`;

      const ny = map.base + f * map.span;
      if (needle.current) {
        needle.current.style.transform = `translate3d(0, ${ny}px, 0)`;
        needle.current.style.opacity = String(clamp01(f / Math.max(0.001, railLook.needleFadePct / 100)));
      }
      const above = ny > vh - 26;
      if (readout.current && above !== st.readoutAbove) {
        st.readoutAbove = above;
        readout.current.style.top = above ? "-14px" : "4px";
      }
      const pct = Math.round(f * 100);
      if (pct !== st.prevPct) {
        st.prevPct = pct;
        root.current?.setAttribute("aria-valuenow", String(pct));
        const digits = String(pct).padStart(3, "0");
        for (let i = 0; i < 3; i++) {
          const d = digits.charCodeAt(i) - 48;
          if (d !== st.prevDigits[i]) {
            st.prevDigits[i] = d;
            const col = digitEls.current[i];
            if (col) col.style.transform = `translateY(${-d}em)`;
          }
        }
      }

      if (ghost.current) {
        ghost.current.style.transform = `translate3d(0, ${st.ghostY}px, 0)`;
        ghost.current.style.opacity = st.ghostActive ? String(railLook.ghostAlpha * 0.35) : "0";
      }

      if (!full || !st.introDone) return;
      const here = f * docH;
      const speed = clamp01(Math.abs(st.vel) / 3000);
      for (let i = 0; i < ticks.length; i++) {
        const y = ticks[i].docY - s + drift;
        const label = labelEls.current[i];
        if (label) {
          // Numbers step aside for labels riding the rail.
          let keep = 1;
          for (const span of railOccupancy.spans) {
            const gap = y < span.top ? span.top - y : y > span.bottom ? y - span.bottom : 0;
            if (gap < railLook.yieldPad) keep = Math.min(keep, 1 - span.k * (1 - gap / railLook.yieldPad));
          }
          label.style.opacity = String(railLook.labelAlpha * keep);
        }
        const el = tickEls.current[i];
        if (!el) continue;
        const dist = Math.abs(ticks[i].docY - here);
        if (dist < railMotion.velRadius) {
          const k = 1 - dist / railMotion.velRadius;
          const amt = speed * k * k;
          el.style.transform = `scaleX(${1 + railMotion.velMax * amt})`;
          el.style.opacity = String(Math.min(1, ticks[i].alpha + 0.6 * amt));
        } else {
          el.style.transform = "scaleX(1)";
          el.style.opacity = String(ticks[i].alpha);
        }
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [mode, geom.docH, ticks]);

  if (!mode || !geom.docH) return null;

  const progressAt = (clientY: number) => {
    const { vh, docH } = live.current.geom;
    const map = rulerMap(vh, rail.edgePad);
    return clamp01((clientY - map.base) / map.span) * Math.max(1, docH - vh);
  };

  const jumpTo = (clientY: number) => {
    const target = progressAt(clientY);
    const l = lenisRef.current;
    if (!l) return window.scrollTo({ top: target });
    const dist = Math.abs(target - window.scrollY);
    l.scrollTo(target, {
      duration: railMotion.jumpDur * (0.4 + 0.6 * Math.min(1, dist / (2.5 * live.current.geom.vh))),
      easing: easeOutExpo,
    });
  };

  const full = mode === "full";

  return (
    <>
      <div
        ref={root}
        role="scrollbar"
        aria-controls="main"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-label="Page position"
        className="fixed inset-y-0 right-0 z-40 cursor-crosshair overflow-hidden"
        style={{ width: rail.railW }}
        onPointerMove={(e) => {
          const st = live.current;
          st.ghostActive = true;
          st.ghostY = e.clientY;
          if (st.dragging) {
            st.dragMoved = Math.max(st.dragMoved, Math.abs(e.clientY - st.dragStartY));
            lenisRef.current?.scrollTo(progressAt(e.clientY), { lerp: 0.18 });
          }
        }}
        onPointerLeave={() => {
          live.current.ghostActive = false;
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          const st = live.current;
          st.dragging = true;
          st.dragStartY = e.clientY;
          st.dragMoved = 0;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          const st = live.current;
          if (st.dragging && st.dragMoved <= 4) jumpTo(e.clientY);
          st.dragging = false;
        }}
        onPointerCancel={() => {
          live.current.dragging = false;
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(9px)",
            WebkitBackdropFilter: "blur(9px)",
            backgroundColor: "color-mix(in srgb, var(--bg) 55%, transparent)",
            maskImage: frostMask(railLook.frostSolid, railLook.frostGamma),
            WebkitMaskImage: frostMask(railLook.frostSolid, railLook.frostGamma),
          }}
        />
        <div ref={strip} aria-hidden className="absolute inset-x-0 top-0 will-change-transform" style={{ height: geom.docH }}>
          {ticks.map((t, i) => (
            <div key={t.pct} className="absolute inset-x-0" style={{ top: t.docY, height: 0 }}>
              <span
                ref={(el) => {
                  tickEls.current[i] = el;
                }}
                className="absolute right-0 top-0 block bg-ink"
                style={{
                  width: t.major ? railLook.majorLen : railLook.minorLen,
                  height: 1,
                  opacity: full ? 0 : t.alpha,
                  transformOrigin: "right center",
                }}
              />
              {t.major && (
                <span
                  ref={(el) => {
                    labelEls.current[i] = el;
                  }}
                  className="absolute top-0 -translate-y-1/2 font-mono text-ink"
                  style={{ right: railLook.majorLen + 4, fontSize: 9, letterSpacing: "0.08em", opacity: railLook.labelAlpha }}
                >
                  {t.pct}
                </span>
              )}
            </div>
          ))}
        </div>
        <div ref={needle} aria-hidden className="absolute inset-x-0 top-0" style={{ height: 0 }}>
          <span className="absolute inset-x-0 top-0 block bg-accent" style={{ height: 1, boxShadow: "0 0 6px var(--accent)" }} />
          <span ref={readout} className="absolute right-0.5 whitespace-nowrap font-mono text-accent-ink" style={{ top: 4, fontSize: 9, letterSpacing: "0.08em" }}>
            <span className="inline-flex h-[1em] overflow-hidden leading-none">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  ref={(el) => {
                    digitEls.current[d] = el;
                  }}
                  className="flex flex-col transition-transform duration-300 ease-out"
                >
                  {"0123456789".split("").map((ch) => (
                    <span key={ch} className="h-[1em]">
                      {ch}
                    </span>
                  ))}
                </span>
              ))}
            </span>
            <span style={{ marginLeft: 2 }}>%</span>
          </span>
        </div>
        <div ref={ghost} aria-hidden className="pointer-events-none absolute inset-x-0 top-0" style={{ height: 0, opacity: 0 }}>
          <div className="absolute right-0 block bg-ink" style={{ top: -railLook.ghostThick / 2, width: rail.railW, height: railLook.ghostThick }} />
        </div>
      </div>
      {mode === "full" ? <SectionLabels sections={sections} geom={geom} /> : <StaticSectionLabels sections={sections} />}
    </>
  );
}
