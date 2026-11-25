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

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 color = texture2D(uMainSampler, outTexCoord);
  if (color.a <= 0.0) { gl_FragColor = color; return; }
  vec2 pos = vec2(outTexCoord.x, 1.0 - outTexCoord.y) * uResolution;
  // uTop.x is the sprite's top edge, uTop.y its height: the top goes first
  float height = clamp((pos.y - uTop.x) / max(uTop.y, 1.0), 0.0, 1.0);
  float n = hash(floor(pos / 2.0)) * 0.65 + height * 0.35;
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
