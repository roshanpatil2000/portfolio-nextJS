"use client";

import { useEffect, useRef } from "react";
import type { Media } from "@/content/home";
import { paintScene } from "@/lib/generative";

const fill = "absolute inset-0 h-full w-full object-cover";

export default function MediaView({ media }: { media: Media }) {
  if (media.kind === "video") {
    return <video className={fill} src={media.src} poster={media.poster} autoPlay muted loop playsInline preload="metadata" />;
  }
  return <GenerativeCanvas seed={media.seed} />;
}

// Animates only while on screen, at ~30fps and a capped resolution.
function GenerativeCanvas({ seed }: { seed: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = Math.min(960, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.round((canvas.width * 9) / 16);
      paintScene(ctx, canvas.width, canvas.height, seed, seed * 3.1);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (still) return () => ro.disconnect();

    let raf = 0;
    let visible = false;
    let last = 0;
    const start = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return;
      last = now;
      paintScene(ctx, canvas.width, canvas.height, seed, seed * 3.1 + (now - start) / 1000);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        visible = true;
        raf = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [seed]);

  return <canvas ref={ref} className={fill} aria-hidden />;
}
