"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { brand } from "@/content/home";
import { LOGO_VIEWBOX, LogoMark } from "@/components/ui";
import { introBeats, introClock, onIntroReplay, startIntro } from "@/components/intro/clock";
import { heroWordmark } from "@/components/intro/heroWordmark";

const LETTERS = brand.wordmark;
const WEIGHT = 800;
const STRETCH = 125;
const LOGO_CAP = 0.74; // glyph height in em
const LOGO_PAD = 0.08; // gap after the glyph in em
const LOGO_W = LOGO_CAP * (LOGO_VIEWBOX.w / LOGO_VIEWBOX.h);
const TUCK = 0.1; // how far (em) letters hide behind the glyph before unrolling

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

const shadow =
  "0 0 0.6vw color-mix(in srgb, var(--bg) 92%, transparent), 0 0.25vw 2.4vw color-mix(in srgb, var(--bg) 78%, transparent), 0 0.4vw 5vw color-mix(in srgb, var(--bg) 55%, transparent)";

export default function Wordmark() {
  const wrap = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLSpanElement | null)[]>([]);
  const [fontPx, setFontPx] = useState(0);

  // Fit the wordmark to the container width once fonts are ready.
  useLayoutEffect(() => {
    const box = wrap.current;
    if (!box) return;
    let dead = false;
    const fit = () => {
      if (dead) return;
      const probe = document.createElement("span");
      probe.style.cssText =
        "position:absolute;left:-9999px;top:0;visibility:hidden;white-space:pre;font-size:100px;line-height:1;";
      probe.style.fontFamily = "var(--font-archivo)";
      probe.style.fontWeight = String(WEIGHT);
      probe.style.fontStretch = `${STRETCH}%`;
      probe.textContent = LETTERS;
      document.body.appendChild(probe);
      const textW = probe.getBoundingClientRect().width / 100;
      probe.remove();
      const w = box.clientWidth;
      if (textW > 0 && w > 0) setFontPx(Math.floor((w / (textW + LOGO_W + LOGO_PAD)) * 10) / 10);
    };
    document.fonts?.ready.then(fit).catch(fit);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => {
      dead = true;
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    startIntro();
  }, []);

  // Publish each letter's resting geometry for the section rail. Widths are
  // pinned so the rail can morph weight/stretch without reflowing the word.
  useEffect(() => {
    if (!fontPx) return;
    const nodes = els.current.filter((n): n is HTMLSpanElement => !!n);
    if (nodes.length !== LETTERS.length + 1) return;
    const publish = () => {
      nodes.forEach((n) => {
        n.style.transform = "";
        n.style.fontWeight = "";
        n.style.fontStretch = "";
        n.style.width = "";
      });
      const rects = nodes.map((n) => n.getBoundingClientRect());
      nodes.forEach((n, i) => (n.style.width = `${rects[i].width}px`));
      const adv = rects.map((r) => r.width / fontPx);
      const cum: number[] = [];
      let total = 0;
      for (const a of adv) {
        cum.push(total);
        total += a;
      }
      Object.assign(heroWordmark, {
        els: nodes,
        baseX: rects.map((r) => r.left + r.width / 2),
        baseDocY: rects.map((r) => r.top + r.height / 2 + window.scrollY),
        fontPx,
        metrics: { adv, cum, total },
        ready: true,
      });
    };
    publish();
    window.addEventListener("resize", publish);
    return () => {
      window.removeEventListener("resize", publish);
      heroWordmark.ready = false;
      heroWordmark.els = [];
    };
  }, [fontPx]);

  // Intro: the glyph slides from the word's centre into its slot while the
  // letters unroll out from behind its trailing edge (clip-path reveal).
  useEffect(() => {
    if (!fontPx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = els.current.filter((n): n is HTMLSpanElement => !!n);
    if (nodes.length !== LETTERS.length + 1) return;

    const reset = () => nodes.forEach((n) => ((n.style.transform = ""), (n.style.clipPath = ""), (n.style.opacity = "")));
    reset();
    let baseL = nodes.map((n) => n.offsetLeft);
    let baseW = nodes.map((n) => n.offsetWidth);
    const measure = () => {
      reset();
      baseL = nodes.map((n) => n.offsetLeft);
      baseW = nodes.map((n) => n.offsetWidth);
    };
    window.addEventListener("resize", measure);

    const last = nodes.length - 1;
    const frame = () => {
      const t = introClock.t;
      const { wordAt, wordDur } = introBeats;
      const wordL = baseL[0];
      const wordR = baseL[last] + baseW[last];
      const glyphW = baseW[0];
      const p = easeInOutCubic(clamp01((t - wordAt) / wordDur));
      const glyphStart = (wordL + wordR) / 2 - glyphW / 2;
      const glyphX = glyphStart + (wordL - glyphStart) * p;
      nodes[0].style.transform = `translate3d(${(glyphX - wordL).toFixed(1)}px,0,0)`;
      nodes[0].style.opacity = String(clamp01(t / 0.3));

      const glyphEdge = glyphX + glyphW;
      const travel = -(wordR - (wordL + glyphW)) - TUCK * fontPx;
      const w = clamp01((t - wordAt) / wordDur);
      const shift = travel * (1 - easeOutCubic(w));
      for (let i = 1; i < nodes.length; i++) {
        const left = baseL[i] + shift;
        const hide = glyphEdge - left;
        nodes[i].style.transform = `translate3d(${shift.toFixed(1)}px,0,0)`;
        nodes[i].style.opacity = "1";
        nodes[i].style.clipPath = hide > 0.5 ? `inset(-20% 0 -20% ${hide.toFixed(1)}px)` : "";
      }
      if (p >= 1 && w >= 1) {
        reset();
        heroWordmark.forming = false;
        gsap.ticker.remove(frame);
      }
    };

    const arm = () => {
      gsap.ticker.remove(frame);
      if (introClock.t > introBeats.wordAt + introBeats.wordDur + 0.5) return;
      heroWordmark.forming = true;
      nodes.forEach((n) => (n.style.opacity = "0"));
      gsap.ticker.add(frame);
    };
    arm();
    const off = onIntroReplay(arm);
    return () => {
      off();
      gsap.ticker.remove(frame);
      window.removeEventListener("resize", measure);
      heroWordmark.forming = false;
      reset();
    };
  }, [fontPx]);

  return (
    <div ref={wrap} className="pointer-events-none relative z-40 w-full" style={{ containerType: "inline-size" }}>
      {/* Frosted pocket that keeps the letters legible over the galaxy. */}
      <div
        aria-hidden
        className="absolute -inset-x-[6%] -inset-y-[34%]"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          maskImage: "radial-gradient(closest-side, black 45%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(closest-side, black 45%, transparent 100%)",
        }}
      />
      <div
        role="img"
        aria-label={brand.wordmark}
        className="relative whitespace-pre text-center text-ink-strong"
        style={{
          fontFamily: "var(--font-archivo)",
          fontWeight: WEIGHT,
          fontStretch: `${STRETCH}%`,
          fontSize: fontPx || "14cqw",
          lineHeight: 1,
          visibility: fontPx ? "visible" : "hidden",
        }}
      >
        <span
          aria-hidden
          ref={(n) => {
            els.current[0] = n;
          }}
          className="inline-block"
          style={{ paddingRight: `${LOGO_PAD}em`, willChange: "transform, opacity" }}
        >
          <LogoMark
            style={{
              display: "inline-block",
              width: `${LOGO_W}em`,
              height: `${LOGO_CAP}em`,
              verticalAlign: "-0.02em",
              filter:
                "drop-shadow(0 0 0.3vw color-mix(in srgb, var(--bg) 85%, transparent)) drop-shadow(0 0.2vw 1.6vw color-mix(in srgb, var(--bg) 60%, transparent))",
            }}
          />
        </span>
        {LETTERS.split("").map((ch, i) => (
          <span
            key={i}
            aria-hidden
            ref={(n) => {
              els.current[i + 1] = n;
            }}
            className="inline-block"
            style={{ willChange: "transform, opacity", textShadow: shadow }}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  );
}

// Radial scrim behind the hero copy; fades in with the galaxy so cards
// passing underneath never fight the text.
export function HeroScrim() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tick = () => {
      const o = clamp01((introClock.t - introBeats.cardsAt) / 0.9);
      if (ref.current) ref.current.style.opacity = String(o);
      if (o >= 1) gsap.ticker.remove(tick);
    };
    gsap.ticker.add(tick);
    const off = onIntroReplay(() => gsap.ticker.add(tick));
    return () => {
      off();
      gsap.ticker.remove(tick);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="absolute -inset-x-[12%] -inset-y-[30%]"
      style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--bg) 82%, transparent), transparent)" }}
    />
  );
}
