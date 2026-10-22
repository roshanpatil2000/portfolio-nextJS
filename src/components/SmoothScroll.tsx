"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// The live Lenis instance, shared through a tiny external store.
let current: Lenis | null = null;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
const setCurrent = (l: Lenis | null) => {
  current = l;
  listeners.forEach((fn) => fn());
};

export function useLenis() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // anchors: in-page #links glide instead of jumping, landing below the nav.
    const instance = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: -48 } });
    instance.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setCurrent(instance);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      setCurrent(null);
    };
  }, []);

  return children;
}
