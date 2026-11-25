import Phaser from 'phaser'
import { HD } from './hd'

// The game's text: Nunito for menus and messages, Cinzel for big titles, drawn at the screen's
// resolution with a dark outline and a soft shadow, like the text in a painted JRPG.
// It keeps the API of the bitmap font text it replaced, so menus pick colors by the old font keys:
// setFont('pressstarty') turns the text gold, 'pressstartg' grey, 'pressstartb' blue, 'pressstartr' red
export const TEXT_COLORS = {
  pressstart: '#ffffff',
  pressstarty: '#ffe27a',
  pressstartg: '#9aa2c0',
  pressstartb: '#9fd4ff',
  pressstartr: '#ff8a7a',
}
export const FONTS = {
  body: 'Nunito, "Segoe UI", system-ui, sans-serif',
  title: 'Cinzel, Georgia, "Times New Roman", serif',
}

// sizes were written for the 8 px pixel font, whose letters are smaller than their size
const SCALE = 1.35

const styleFor = (size, color) => {
  const big = size >= 14
  return {
    fontFamily: big ? FONTS.title : FONTS.body,
    fontStyle: big ? '700' : '800',
    fontSize: `${size * SCALE}px`,
    color,
    stroke: '#0c1030',
    strokeThickness: big ? 3 : 2.2,
    resolution: HD.ZOOM,
    padding: { x: 2, y: 2 },
    shadow: {
      offsetX: 0,
      offsetY: 0.6 * HD.ZOOM,
      color: 'rgba(0, 0, 20, 0.55)',
      blur: 1.2 * HD.ZOOM,
      stroke: true,
      fill: true,
    },
  }
}

export const GameText = new Phaser.Class({
  Extends: Phaser.GameObjects.Text,

  initialize: function GameText(scene, x, y, text, size = 8, color) {
    Phaser.GameObjects.Text.call(
      this,
      scene,
      x,
      y,
      text,
      styleFor(size, color || TEXT_COLORS.pressstart)
    )
    this.font = 'pressstart'
  },

  // Colors the text by an old bitmap font key, or any CSS color
  setFont: function (key) {
    this.font = key
    this.setColor(TEXT_COLORS[key] || key)
    return this
  },

  setMaxWidth: function (width) {
    return this.setWordWrapWidth(width)
  },

  setCenterAlign: function () {
    return this.setAlign('center')
  },

  setLeftAlign: function () {
    return this.setAlign('left')
  },
})

// this.add.pixelText(x, y, text, size) and this.add.colorText(x, y, text, color, size): centered text
export const registerTextFactories = () => {
  Phaser.GameObjects.GameObjectFactory.register(
    'pixelText',
    function (x, y, text, size = 8) {
      return this.displayList
        .add(new GameText(this.scene, x, y, text, size))
        .setOrigin(0.5)
    }
  )
  Phaser.GameObjects.GameObjectFactory.register(
    'colorText',
    function (x, y, text, color = '#ffffff', size = 8) {
      return this.displayList
        .add(new GameText(this.scene, x, y, text, size, color))
        .setOrigin(0.5)
    }
  )
  // uncentered text with a font key, like the old bitmapText(x, y, font, text, size)
  Phaser.GameObjects.GameObjectFactory.register(
    'gameText',
    function (x, y, font, text, size = 8) {
      return this.displayList
        .add(new GameText(this.scene, x, y, text, size))
        .setFont(font)
    }
  )
}
