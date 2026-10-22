// Knobs for the right-edge ruler and the section labels that ride it.

export const rail = {
  edgePad: 12, // px kept clear at the top and bottom of the ruler's travel
  railW: 60,
  minorPct: 1, // a tick every 1% of the page
  labelPct: 5, // a numbered tick every 5%
  thresholdPct: 12, // flip line, as % of viewport height
  headingPx: 34, // current section label size in the top stack
  ridingPx: 20, // label size while riding the rail vertically
  queuePx: 16, // label size in the queues
  topPad: 28,
  currentGap: 26,
  queueSlot: 20,
  queuePad: 36,
  textPad: 0,
};

export const railMotion = {
  flipZone: 200, // px of scroll over which a label swings into the top stack
  detachZone: 240, // px over which a label leaves the bottom queue to ride
  stagger: 0.16, // per-letter delay, as a fraction of the move
  arc: 28, // sideways bow of each letter's flight path
  jumpDur: 1.25,
  snapDelay: 400, // ms of stillness before a half-flipped label settles
  snapDur: 0.7,
  introDur: 1,
  introStagger: 0.01,
  velRadius: 180, // ticks this close to the needle stretch with scroll speed
  velMax: 0.6,
  heroLead: 100,
  heroZone: 320, // px of scroll over which the wordmark flies to the stack
};

export const railLook = {
  minorAlpha: 0.4,
  majorAlpha: 0.8,
  labelAlpha: 0.5,
  minorLen: 10,
  majorLen: 20,
  ghostAlpha: 1,
  ghostThick: 3,
  queueAlpha: 0.35,
  yieldPad: 24,
  needleFadePct: 3,
  poolAlpha: 1,
  frostSolid: 40,
  frostGamma: 2.2,
  poolPad: 64,
};

// Display face used for the labels once they settle.
export const DISPLAY_WEIGHT = 620;
export const DISPLAY_STRETCH = 118;

// Maps scroll progress onto the rail: ticks drift slightly so the needle at
// 0% and 100% lands exactly on the first and last tick.
export function rulerMap(vh: number, edgePad: number) {
  const base = 48 + edgePad;
  return {
    base,
    span: Math.max(1, vh - 48 - 2 * edgePad),
    drift: (p: number) => base - p * (48 + 2 * edgePad),
  };
}

// Spans of the rail currently covered by riding labels; ruler numbers fade
// out of their way.
export const railOccupancy = { spans: [] as { top: number; bottom: number; k: number }[] };
