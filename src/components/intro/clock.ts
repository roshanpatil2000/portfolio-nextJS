import gsap from "gsap";

// One shared clock for the hero intro, so the wordmark, the galaxy and the
// hero copy all hit their beats in sync. Times are seconds since start.
export const introBeats = {
  wordAt: 0.2, // wordmark starts forming
  wordDur: 1.1, // how long the letters take to unroll
  cardsAt: 0.9, // galaxy reveal wave launches
  copyAt: 1.35, // headline, sub and CTAs reveal
};

export const introClock = { t: 0, running: false };

const listeners = new Set<() => void>();
let tick: (() => void) | null = null;

export function startIntro() {
  if (typeof window === "undefined" || introClock.running) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    introClock.t = 999;
    return;
  }
  introClock.running = true;
  introClock.t = 0;
  let last = performance.now();
  tick = () => {
    const now = performance.now();
    // Clamp so a backgrounded tab doesn't skip the whole intro at once.
    introClock.t += Math.min(0.05, (now - last) / 1000);
    last = now;
    if (introClock.t > 12 && tick) {
      gsap.ticker.remove(tick);
      introClock.running = false;
    }
  };
  gsap.ticker.add(tick);
}

export function replayIntro() {
  if (tick) gsap.ticker.remove(tick);
  introClock.running = false;
  startIntro();
  listeners.forEach((fn) => fn());
}

export function onIntroReplay(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
