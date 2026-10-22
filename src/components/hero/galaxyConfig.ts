// Every knob for the hero galaxy in one place. Distances are CSS px unless
// noted; "journey" is a card's 0→1 trip from birth at the centre to offscreen.

export const layout = {
  arms: 6,
  turns: 1.05, // revolutions per arm from birth to the outer radius
  rMaxFrac: 0.7, // outer radius as a fraction of the viewport half-diagonal
  birthFrac: 0.08, // birth radius as a fraction of the outer radius
  cardN: 64, // card count at the reference viewport area
  tunedMpx: 1.65, // reference viewport area in CSS megapixels
  cardHFrac: 0.25, // card height ceiling as a fraction of viewport height
  armJitter: 0.76, // per-arm conveyor stagger, in slot gaps
  ticksPerArm: 16,
  circFrac: 0.56, // dashed construction circle radius / outer radius
};

export const mobile = {
  belowMpx: 0.6,
  arms: 3,
  turns: 0.7,
  cardN: 14,
  rMaxFrac: 0.8,
  cardHFrac: 0.3,
  birthFrac: 0.08,
  densityX: 1.15,
};

export const motion = {
  idleSpeed: 0.57, // journeys per minute
  scrub: 0.2, // journeys per 1000px of scroll
  spinDeg: -50, // global rotation, degrees per minute
  wobbleAmp: 6,
  wobbleFreq: 0.25,
  introDur: 4, // reveal wave duration, seconds
  rollChunk: 0.12, // journey cards slide outward while revealing
  burstX: 3, // conveyor speed multiplier at intro start
  burstDur: 2.5,
  waveBand: 220,
  waveAber: 0.2,
  waveLag: 0.4,
  perfFloor: 30,
};

export const pointer = {
  fieldPx: 320,
  tugPx: 8,
  mouseWarp: 200,
  flareAdd: 0.032,
  flareDecay: 3,
  holdTau: 0.15,
  restTau: 1,
  holdWobble: 1.2,
  rippleSpeed: 900,
  rippleWidth: 140,
  rippleAmp: 0.016,
  rippleWarp: 22,
  rippleLife: 1.8,
  clickAmp: 20,
  clickDur: 0.75,
  clickWidth: 0.14,
  boostScale: 3,
  boostTau: 0.18,
};

export const look = {
  density: 0.82,
  cornerPx: 10,
  innerCap: 0.45,
  aspectEnd: 0.3,
  blurMax: 0.12,
  blurEnd: 0.18,
  fadeBand: 0.15,
  aberration: 0.019,
  curvePx: 32,
  frameAlpha: 0.22,
  lineAlpha: 0, // arm guide curves and dashed circle (0 = hidden)
  tickAlpha: 0, // tick marks along the arms (0 = hidden)
  lineW: 2,
  pulseAlpha: 0.72,
  pulseSpeed: 0.19,
  pulseWidth: 0.05,
  pulseW: 3.5,
  pulseCount: 3,
  pulseHue: 0.4,
  pulseDark: 0.62,
};
