export const cardVertex = /* glsl */ `
  uniform float uCurve;
  uniform float uWarp;
  uniform float uRipple;
  uniform vec2 uMouse;
  uniform vec2 uSize;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    // Bow the plane toward the camera: strongest at the centre, flat at the
    // edges. Applied in world space, so the numbers read as px.
    float d2 = dot(position.xy, position.xy);
    float bow = (0.25 - d2) * 2.0;
    world.z += (uCurve + uRipple) * bow;
    // The cursor's weight: a local bulge toward the camera at the point of
    // the card nearest the mouse.
    vec2 dpx = (position.xy - uMouse) * uSize;
    float rr = max(uSize.x, uSize.y) * 0.6;
    world.z += uWarp * exp(-dot(dpx, dpx) / (rr * rr));
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const cardFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uRepeat;
  uniform vec2 uOffset;
  uniform vec3 uBg;
  uniform float uBlur;
  uniform float uAlpha;
  uniform float uAber;
  uniform vec2 uSize;
  uniform float uRadius;
  uniform vec3 uFrameCol;
  uniform float uFrameA;
  uniform float uDrift;
  // Click punches: xy = ring centre (card UV), z = ring radius px,
  // w = displacement amplitude px (0 = unused slot).
  uniform vec4 uClick[4];
  uniform float uClickW;
  varying vec2 vUv;

  const vec2 TAPS[12] = vec2[12](
    vec2(-0.326, -0.406), vec2(-0.840, -0.074), vec2(-0.696, 0.457),
    vec2(-0.203, 0.621), vec2(0.962, -0.195), vec2(0.473, -0.480),
    vec2(0.519, 0.767), vec2(0.185, -0.893), vec2(0.507, 0.064),
    vec2(0.896, 0.412), vec2(-0.322, -0.933), vec2(-0.792, -0.598)
  );

  vec2 texUv(vec2 uv) {
    // Cover-fit plus a slow Ken Burns drift so stills feel alive.
    vec2 c = (uv - 0.5) * (1.0 - 0.06) + 0.5;
    c += vec2(sin(uDrift * 0.21), cos(uDrift * 0.17)) * 0.015;
    return c * uRepeat + uOffset;
  }

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    vec2 uvL = vUv;
    for (int k = 0; k < 4; k++) {
      if (uClick[k].w > 0.001) {
        vec2 q = (vUv - uClick[k].xy) * uSize;
        float d = length(q);
        float ring = exp(-pow((d - uClick[k].z) / uClickW, 2.0));
        uvL -= (q / max(d, 0.001)) / uSize * uClick[k].w * ring;
      }
    }

    vec2 tuv = texUv(uvL);
    vec2 fromC = uvL - 0.5;
    float edge = dot(fromC, fromC) * 4.0;
    vec2 ab = fromC * uAber * edge;

    // Textures are premultiplied, so transparent tiles (logos with no plate)
    // blur and disperse without dark fringes.
    vec4 sR = texture2D(uMap, tuv + ab);
    vec4 sG = texture2D(uMap, tuv);
    vec4 sB = texture2D(uMap, tuv - ab);
    vec4 sharp = vec4(sR.r, sG.g, sB.b, max(sG.a, max(sR.a, sB.a)));

    vec4 col = sharp;
    if (uBlur > 0.002) {
      vec4 acc = sharp;
      for (int i = 0; i < 12; i++) {
        acc += texture2D(uMap, tuv + TAPS[i] * uBlur * uRepeat);
      }
      col = mix(sharp, acc / 13.0, smoothstep(0.0, 0.03, uBlur));
    }

    // Rounded-corner mask in px, plus an optional hairline frame along the edge.
    vec2 p = (vUv - 0.5) * uSize;
    float sd = roundedBox(p, uSize * 0.5, uRadius);
    float mask = 1.0 - smoothstep(-0.75, 0.75, sd);
    float frame = (1.0 - smoothstep(0.0, 1.2, abs(sd + 0.6))) * uFrameA;
    col = col * (1.0 - frame) + vec4(uFrameCol, 1.0) * frame;

    gl_FragColor = col * (mask * uAlpha);
  }
`;
