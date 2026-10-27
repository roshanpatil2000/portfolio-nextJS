"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { brand, sectionIndex } from "@/content/home";
import { useActiveSection } from "@/lib/useActiveSection";

const ids = sectionIndex.map((s) => s.id);
const pad = (n: number) => String(n).padStart(2, "0");

// Mobile stand-in for the desktop ruler: "02 / EXPERIENCE" in the nav's empty
// middle, rolling to the next label as sections change. Below `lg` only.
export function SectionIndicator() {
  const active = useActiveSection(ids);
  const i = ids.indexOf(active);

  return (
    <div className="flex min-w-0 flex-1 items-center overflow-hidden px-4 lg:hidden" aria-live="polite">
      <span key={active} className="hud-label animate-[indicator-in_0.35s_cubic-bezier(0.22,1,0.36,1)] truncate text-muted">
        {i <= 0 ? (
          brand.name
        ) : (
          <>
            <span className="text-faint">{pad(i)}</span>
            <span className="mx-1.5 text-faint">/</span>
            {sectionIndex[i].label}
          </>
        )}
      </span>
    </div>
  );
}

// A 1px accent line along the nav's bottom edge showing how far down the page you are.
export function ScrollProgress() {
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    tick();
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <span
      ref={bar}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left bg-accent lg:hidden"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
