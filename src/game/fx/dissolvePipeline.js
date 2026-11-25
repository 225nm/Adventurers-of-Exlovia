import Phaser from 'phaser'

// Defeated enemies burn away: 2x2 pixel blocks vanish in a noise pattern from the top down, and
// the blocks about to go glow in the edge color first. progress runs 0 (whole) to 1 (gone)
const FRAG = `
#define SHADER_NAME EXLOVIA_DISSOLVE
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 uResolution;
uniform float uProgress;
uniform vec3 uEdgeColor;
uniform vec2 uTop;

varying vec2 outTexCoord;

uniform float uScale;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// smooth value noise, two octaves, so the sprite burns away along soft organic edges
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec4 color = texture2D(uMainSampler, outTexCoord);
  if (color.a <= 0.0) { gl_FragColor = color; return; }
  vec2 pos = vec2(outTexCoord.x, 1.0 - outTexCoord.y) * uResolution;
  // uTop.x is the sprite's top edge, uTop.y its height: the top goes first
  float height = clamp((pos.y - uTop.x) / max(uTop.y, 1.0), 0.0, 1.0);
  vec2 q = pos / (uScale * 4.0);
  float n = (noise(q) * 0.7 + noise(q * 2.7) * 0.3) * 0.65 + height * 0.35;
  float p = uProgress * 1.15;
  if (n < p - 0.08) { gl_FragColor = vec4(0.0); return; }
  vec3 rgb = color.rgb;
  // the enemy blanches toward the edge color as it goes
  rgb = mix(rgb, uEdgeColor * color.a, uProgress * 0.5);
  if (n < p) rgb = uEdgeColor * color.a * 1.4;
  gl_FragColor = vec4(rgb, color.a);
}
`

export class DissolvePipeline
  extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
{
  constructor(game) {
    super({ game, name: 'Dissolve', fragShader: FRAG })
    this.progress = 0
    this.edgeColor = [1, 0.4, 0.8]
  }

  onPreRender() {
    this.set2f('uResolution', this.renderer.width, this.renderer.height)
    this.set1f('uScale', this.renderer.height / 240)
    this.set1f('uProgress', this.progress)
    this.set3f('uEdgeColor', ...this.edgeColor)
    const sprite = this.gameObject
    if (sprite) {
      const cam = sprite.scene.cameras.main
      const top = sprite.getTopLeft().y - cam.worldView.y
      this.set2f('uTop', top, sprite.displayHeight)
    }
  }
}
