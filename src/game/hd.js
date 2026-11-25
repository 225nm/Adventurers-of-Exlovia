import Phaser from 'phaser'

// The game is laid out in a small coordinate space (320 wide, 240 high, from the pixel art days) but
// drawn at 1920x1080: every camera is zoomed in 4.5 times, and the art is painted at that scale.
// The screen is wider than the layout (16:9), so a camera shows 426.67 x 240 units. Menus and
// battles keep their 320 wide layout, centered by scrolling the camera OFFSET_X to the left;
// backdrops and the map fill the whole width.
const WIDTH = 1920
const HEIGHT = 1080
const ZOOM = HEIGHT / 240

export const HD = {
  WIDTH,
  HEIGHT,
  ZOOM,
  // what a camera shows, in layout units
  VIEW_W: WIDTH / ZOOM,
  VIEW_H: HEIGHT / ZOOM,
  // the width menus and battles are laid out for
  LAYOUT_W: 320,
  // how far left of the layout the screen starts
  OFFSET_X: (WIDTH / ZOOM - 320) / 2,
}

// Every camera zooms from its top left corner (origin 0, 0), so screen position is simply
// (world - scroll) * zoom, also for objects pinned to the screen (scroll factor 0). Phaser computes
// the camera's view rectangle as if it zoomed around its center, which this corrects. New cameras
// start zoomed in, scrolled to center the 320 wide layout
export const installCameras = () => {
  const Camera = Phaser.Cameras.Scene2D.Camera
  const preRender = Camera.prototype.preRender
  Camera.prototype.preRender = function () {
    preRender.call(this)
    if (this.originX === 0 && this.originY === 0) {
      const w = this.width / this.zoomX
      const h = this.height / this.zoomY
      this.worldView.setTo(this.scrollX, this.scrollY, w, h)
      this.midPoint.set(this.scrollX + w / 2, this.scrollY + h / 2)
    }
  }
  const Manager = Phaser.Cameras.Scene2D.CameraManager
  const add = Manager.prototype.add
  Manager.prototype.add = function (...args) {
    const cam = add.apply(this, args)
    cam.setOrigin(0, 0).setZoom(ZOOM).setScroll(-HD.OFFSET_X, 0)
    return cam
  }
}

// Marks a texture as painted at `res` times its size in layout units: a 189 px wide image with res
// 4.5 is 42 units wide in the game, and shows all 189 pixels on screen. Works for loaded images and
// canvas textures (call it after drawing)
export const hdTexture = (texture, res = ZOOM) => {
  if (texture.hdRes) return texture
  texture.hdRes = res
  texture.source.forEach((source) => {
    source.resolution = res
    source.width /= res
    source.height /= res
  })
  Object.values(texture.frames).forEach((frame) => {
    frame.setSize(
      frame.cutWidth / res,
      frame.cutHeight / res,
      frame.cutX / res,
      frame.cutY / res
    )
  })
  return texture
}

// A canvas texture painted at HD scale: draw(ctx, w, h) gets a context scaled so it can draw in
// layout units. Returns the texture key
export const hdCanvas = (scene, key, width, height, draw, res = ZOOM) => {
  if (scene.textures.exists(key)) return key
  const texture = scene.textures.createCanvas(
    key,
    Math.ceil(width * res),
    Math.ceil(height * res)
  )
  const ctx = texture.getContext()
  ctx.save()
  ctx.scale(res, res)
  draw(ctx, width, height)
  ctx.restore()
  texture.refresh()
  hdTexture(texture, res)
  return key
}
