// Live geometry of the hero wordmark's letters, published by <Wordmark/> so
// the section rail can fly those same letters into its top stack on scroll.
export const NAV_H = 48;

export const heroWordmark = {
  ready: false,
  forming: false, // true while the intro animation owns the letters
  els: [] as HTMLElement[],
  baseX: [] as number[], // letter centres, viewport x
  baseDocY: [] as number[], // letter centres, document y
  fontPx: 0,
  metrics: { adv: [] as number[], cum: [] as number[], total: 0 }, // in em
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const easeOutExpo = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
