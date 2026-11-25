import Phaser from 'phaser'

// Most point lights a camera can show at once, the nearest/brightest are picked each frame
export const MAX_LIGHTS = 8

// The game's "look": one full screen pass over a camera's picture that adds
//  - lighting: an ambient level and color (dark on deep floors) plus point lights, falling off in
//    dithered bands so the light keeps the pixel art look instead of a smooth airbrushed gradient
//  - bloom: bright pixels (spells, the moon, glowing eyes) bleed light into their neighbors
//  - color grading: contrast, saturation, and split toning (cool shadows, warm highlights)
//  - tilt shift: the top and bottom of the screen go slightly soft, like a miniature diorama
//  - vignette and a full screen flash
// The values are set through LookPipeline#settings (see Fx.look), the shader only reads them
const FRAG = `
#define SHADER_NAME EXLOVIA_LOOK
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 uResolution;
uniform float uTime;

uniform float uAmbient;
uniform vec3 uAmbientColor;
uniform vec4 uLights[${MAX_LIGHTS}];
uniform vec3 uLightColors[${MAX_LIGHTS}];
uniform float uLightBands;

uniform float uBloom;
uniform float uThreshold;
uniform float uContrast;
uniform float uSaturation;
uniform float uExposure;
uniform vec3 uShadowTint;
uniform vec3 uHighlightTint;
uniform float uTiltShift;
uniform float uVignette;
uniform vec4 uFlash;

varying vec2 outTexCoord;

// ordered dither threshold, 0..1, repeating every 4 pixels
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

vec3 bright(vec2 uv) {
  vec3 c = texture2D(uMainSampler, uv).rgb;
  float l = max(c.r, max(c.g, c.b));
  return c * max(l - uThreshold, 0.0) / max(1.0 - uThreshold, 0.001);
}

void main() {
  vec2 px = 1.0 / uResolution;
  vec2 uv = outTexCoord;
  // screen pixel position, y down like the game's coordinates
  vec2 pos = vec2(uv.x, 1.0 - uv.y) * uResolution;

  vec3 color = texture2D(uMainSampler, uv).rgb;

  // tilt shift: a small blur that grows toward the top and bottom edges
  if (uTiltShift > 0.0) {
    float edge = abs(uv.y * 2.0 - 1.0);
    float amount = smoothstep(0.62, 1.0, edge) * uTiltShift;
    if (amount > 0.01) {
      vec3 sum = color;
      float r = 1.0 + amount * 0.6;
      sum += texture2D(uMainSampler, uv + vec2(r, 0.0) * px).rgb;
      sum += texture2D(uMainSampler, uv - vec2(r, 0.0) * px).rgb;
      sum += texture2D(uMainSampler, uv + vec2(0.0, r) * px).rgb;
      sum += texture2D(uMainSampler, uv - vec2(0.0, r) * px).rgb;
      sum += texture2D(uMainSampler, uv + vec2(r, r) * px).rgb;
      sum += texture2D(uMainSampler, uv - vec2(r, r) * px).rgb;
      sum += texture2D(uMainSampler, uv + vec2(r, -r) * px).rgb;
      sum += texture2D(uMainSampler, uv - vec2(r, -r) * px).rgb;
      color = mix(color, sum / 9.0, min(amount, 1.0));
    }
  }

  // lighting: ambient plus point lights, each light's falloff stepped into dithered bands
  vec3 light = uAmbientColor * uAmbient;
  // lights matter less in daylight, where they have no darkness to push back
  float gain = 0.3 + 0.7 * clamp((1.0 - uAmbient) / 0.6, 0.0, 1.0);
  float dither = bayer4(pos) - 0.5;
  for (int i = 0; i < ${MAX_LIGHTS}; i++) {
    vec4 l = uLights[i];
    if (l.z <= 0.0) continue;
    float d = length((pos - l.xy) * vec2(1.0, 1.15));
    float f = clamp(1.0 - d / l.z, 0.0, 1.0);
    f = f * f;
    if (uLightBands > 0.0) {
      f = clamp(floor(f * uLightBands + dither * 0.9 + 0.5) / uLightBands, 0.0, 1.0);
    }
    light += uLightColors[i] * l.w * f * gain;
  }
  color *= light;

  // bloom: a ring of samples around the pixel, only the bright part of each counts
  if (uBloom > 0.0) {
    vec3 glow = vec3(0.0);
    for (int ring = 1; ring <= 3; ring++) {
      float r = float(ring) * 2.0 - 0.5;
      float w = 1.0 / float(ring);
      for (int k = 0; k < 8; k++) {
        float a = float(k) * 0.7853982 + float(ring) * 0.39;
        glow += bright(uv + vec2(cos(a), sin(a)) * r * px) * w;
      }
    }
    // the light falling on a pixel also lights its glow, so spells glow brighter at night
    glow *= max(light, vec3(0.6));
    color += glow * uBloom / 14.7;
  }

  color *= uExposure;

  // grading: contrast around mid grey, saturation, then cool shadows and warm highlights
  color = (color - 0.5) * uContrast + 0.5;
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(luma), color, uSaturation);
  float lit = clamp(luma, 0.0, 1.0);
  color += uShadowTint * (1.0 - lit) * (1.0 - lit) + uHighlightTint * lit * lit;

  // vignette: darker corners, stepped like the lights so it stays crisp
  if (uVignette > 0.0) {
    vec2 c = uv - 0.5;
    float v = dot(c, c) * 2.2;
    float shade = clamp(v * uVignette + dither * 0.04, 0.0, 1.0);
    color *= 1.0 - shade;
  }

  color = mix(color, uFlash.rgb, uFlash.a);
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`

export const DEFAULT_LOOK = {
  ambient: 1,
  ambientColor: [1, 1, 1],
  lightBands: 5,
  bloom: 0.9,
  threshold: 0.72,
  contrast: 1.06,
  saturation: 1.1,
  exposure: 1,
  shadowTint: [-0.012, 0, 0.035],
  highlightTint: [0.03, 0.015, -0.02],
  tiltShift: 0,
  vignette: 0.35,
}

export class LookPipeline
  extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
{
  constructor(game) {
    super({ game, name: 'Look', fragShader: FRAG })
    this.settings = { ...DEFAULT_LOOK }
    // [{ x, y, radius, intensity, color: [r, g, b] }] in screen pixels, set by Fx each frame
    this.lights = []
    this.flash = [1, 1, 1, 0]
    this.lightData = new Float32Array(MAX_LIGHTS * 4)
    this.lightColors = new Float32Array(MAX_LIGHTS * 3)
  }

  onPreRender() {
    const s = this.settings
    this.set2f('uResolution', this.renderer.width, this.renderer.height)
    this.set1f('uTime', this.game.loop.time / 1000)
    this.set1f('uAmbient', s.ambient)
    this.set3f('uAmbientColor', ...s.ambientColor)
    this.set1f('uLightBands', s.lightBands)
    this.set1f('uBloom', s.bloom)
    this.set1f('uThreshold', s.threshold)
    this.set1f('uContrast', s.contrast)
    this.set1f('uSaturation', s.saturation)
    this.set1f('uExposure', s.exposure)
    this.set3f('uShadowTint', ...s.shadowTint)
    this.set3f('uHighlightTint', ...s.highlightTint)
    this.set1f('uTiltShift', s.tiltShift)
    this.set1f('uVignette', s.vignette)
    this.set4f('uFlash', ...this.flash)

    this.lightData.fill(0)
    this.lightColors.fill(0)
    this.lights.slice(0, MAX_LIGHTS).forEach((l, i) => {
      this.lightData.set([l.x, l.y, l.radius, l.intensity], i * 4)
      this.lightColors.set(l.color, i * 3)
    })
    this.set4fv('uLights', this.lightData)
    this.set3fv('uLightColors', this.lightColors)
  }
}
