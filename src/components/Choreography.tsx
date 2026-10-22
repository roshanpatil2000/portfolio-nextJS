"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { introBeats, introClock, onIntroReplay } from "@/components/intro/clock";

gsap.registerPlugin(ScrollTrigger);

const hidden = { autoAlpha: 0, y: 28, filter: "blur(8px)" };
const shown = {
  autoAlpha: 1,
  y: 0,
  filter: "blur(0px)",
  duration: 0.9,
  ease: "power3.out",
  overwrite: true,
  clearProps: "all",
};

// Scroll choreography, driven entirely by data attributes:
//   [data-choreo]       section: draws its top rule, eyebrow and corner ticks
//   [data-reveal]       fades up out of a blur when it enters the viewport
//   [data-reveal-group] children reveal staggered left-to-right
export default function Choreography() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cleanups: (() => void)[] = [];

      gsap.utils.toArray<HTMLElement>("[data-choreo]").forEach((section) => {
        const rule = section.querySelector("[data-draw-rule]");
        const ticks = section.querySelectorAll("[data-draw-tick]");
        const eyebrow = section.querySelector("[data-draw-eyebrow]");
        if (rule) gsap.set(rule, { scaleX: 0 });
        if (ticks.length) gsap.set(ticks, { scale: 0, opacity: 0 });
        if (eyebrow) gsap.set(eyebrow, hidden);

        ScrollTrigger.create({
          trigger: section,
          start: "top 88%",
          once: true,
          onEnter: () => {
            const tl = gsap.timeline();
            if (rule) tl.to(rule, { scaleX: 1, duration: 0.7, ease: "power2.out", clearProps: "all" }, 0);
            if (eyebrow) tl.to(eyebrow, { ...shown }, 0.15);
            if (ticks.length)
              tl.to(
                ticks,
                { scale: 1, opacity: 1, duration: 0.35, ease: "power3.out", stagger: 0.06, clearProps: "all" },
                0.35,
              );
          },
        });
      });

      gsap.utils
        .toArray<HTMLElement>("[data-reveal]:not([data-reveal-group] [data-reveal])")
        .forEach((el) => {
          gsap.set(el, hidden);
          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            once: true,
            onEnter: () => gsap.to(el, shown),
          });
        });

      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const items = Array.from(group.querySelectorAll<HTMLElement>("[data-reveal]"));
        if (!items.length) return;
        gsap.set(items, hidden);

        // The hero copy waits for its beat on the intro clock instead of scroll.
        if (group.closest("#hero")) {
          let waiter: (() => void) | null = null;
          const arm = () => {
            if (waiter) gsap.ticker.remove(waiter);
            gsap.set(items, hidden);
            const w = () => {
              if (introClock.t < introBeats.copyAt) return;
              gsap.to(items, { ...shown, stagger: 0.08 });
              gsap.ticker.remove(w);
              if (waiter === w) waiter = null;
            };
            waiter = w;
            gsap.ticker.add(w);
          };
          arm();
          cleanups.push(onIntroReplay(arm));
          cleanups.push(() => {
            if (waiter) gsap.ticker.remove(waiter);
          });
          return;
        }

        // Delay each child by its horizontal position so a row sweeps left to right.
        const box = group.getBoundingClientRect();
        items.forEach((el) => {
          const delay = box.width > 0 ? ((el.getBoundingClientRect().left - box.left) / box.width) * 0.18 : 0;
          ScrollTrigger.create({
            trigger: el,
            start: "top 88%",
            once: true,
            onEnter: () => gsap.to(el, { ...shown, delay }),
          });
        });
      });

      return () => cleanups.forEach((fn) => fn());
    });
    return () => mm.revert();
  }, []);

  return null;
}
