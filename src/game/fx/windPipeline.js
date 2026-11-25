import Phaser from 'phaser'

// Plants sway in the wind: the top edge of each image slides sideways while its base stays put, so
// trees, bushes and grass lean and spring back. Gusts roll across the map as a wave.
// Each image's place in the wave is passed in its tint as a grey level (see Fx.sway), since the
// vertex shader can't see world positions, and the color is reset to white here
const VERT = `
#define SHADER_NAME EXLOVIA_WIND_VS
precision mediump float;

uniform mat4 uProjectionMatrix;
uniform vec2 uResolution;
uniform float uTime;
uniform float uStrength;

attribute vec2 inPosition;
attribute vec2 inTexCoord;
attribute float inTexId;
attribute float inTintEffect;
attribute vec4 inTint;

varying vec2 outTexCoord;
varying float outTintEffect;
varying vec4 outTint;

void main () {
  vec2 pos = inPosition;
  float phase = inTint.r * 6.2831853;
  // gusts: a slow swell that travels across the map, with a quicker flutter on top
  float gust = 0.55 + 0.45 * sin(uTime * 0.7 - phase);
  float sway = sin(uTime * 2.1 - phase * 2.0) * gust + sin(uTime * 4.3 + phase * 3.0) * 0.18;
  // only the top edge moves, texture v is 0 there
  float top = 1.0 - inTexCoord.y;
  pos.x += sway * top * uStrength;
  gl_Position = uProjectionMatrix * vec4(pos, 1.0, 1.0);

  outTexCoord = inTexCoord;
  outTint = vec4(1.0, 1.0, 1.0, inTint.a);
  outTintEffect = inTintEffect;
}
`

export class WindPipeline
  extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline
{
  constructor(game) {
    super({ game, name: 'Wind', vertShader: VERT })
    // how far the top of a plant leans, in pixels
    this.strength = 1.2
  }

  onBoot() {
    // the shader works in screen pixels, the strength is in layout units
    this.strength = 1.2 * (this.renderer.height / 240)
  }

  onPreRender() {
    this.set1f('uTime', this.game.loop.time / 1000)
    this.set1f('uStrength', this.strength)
  }
}
