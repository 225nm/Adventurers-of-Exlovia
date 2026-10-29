// Builds textures that don't come straight from an image file:
// pixel art drawn in code, and frames cut out of the ogre/wizard/wisp sprite sheet

// Pixel art is written as the left half of each row and mirrored, so sprites are symmetric.
// Each character is a color from the palette, '.' is transparent
const PIXEL_SPRITES = {
  slime: {
    palette: {
      o: '#1d4d1d',
      g: '#5bd65b',
      l: '#aaf5aa',
      w: '#ffffff',
      k: '#111111',
    },
    half: [
      '........',
      '........',
      '........',
      '........',
      '.....ooo',
      '...ooggg',
      '..oglggg',
      '.oglgggg',
      '.oggwkgg',
      'ogggwkgg',
      'oggggggg',
      'oggggggk',
      'oggggggg',
      '.ogggggg',
      '..oooooo',
      '........',
    ],
  },
  bat: {
    palette: { o: '#2b1640', p: '#7a4fc0', r: '#ff4040', f: '#ffffff' },
    half: [
      '........',
      '........',
      '........',
      'o.......',
      'oo......',
      'o....oo.',
      'oo..oppp',
      'opo.oppp',
      'oppooprp',
      'opppoppp',
      'oppppppp',
      'o.opppfp',
      '....oppp',
      '.....ooo',
      '........',
      '........',
    ],
  },
}

// Frames on ogrewizardwisp.png: [x, y, width, height]
const SHEET_FRAMES = {
  wizard: [70, 134, 20, 26],
  goblin: [396, 35, 32, 29],
  wispFire: [392, 228, 16, 27],
  wispIce: [424, 288, 16, 30],
}
// The sheet's checkerboard background is opaque, these two greys are made transparent
const SHEET_BACKGROUNDS = [
  [157, 142, 135],
  [142, 129, 122],
]

export const Sprites = {
  createAll: function (scene) {
    Object.entries(PIXEL_SPRITES).forEach(([key, sprite]) =>
      this.createPixelSprite(scene, key, sprite)
    )
    this.createSheetFrames(scene, 'monsterSheet', 'monsters')
  },

  createPixelSprite: function (scene, key, sprite) {
    const rows = sprite.half.map((half) => half + [...half].reverse().join(''))
    const texture = scene.textures.createCanvas(
      key,
      rows[0].length,
      rows.length
    )
    const ctx = texture.getContext()
    rows.forEach((row, y) =>
      [...row].forEach((char, x) => {
        if (sprite.palette[char]) {
          ctx.fillStyle = sprite.palette[char]
          ctx.fillRect(x, y, 1, 1)
        }
      })
    )
    texture.refresh()
  },

  // Copies the loaded sheet into a new texture with the background removed, then adds the named frames
  createSheetFrames: function (scene, sheetKey, key) {
    const source = scene.textures.get(sheetKey).getSourceImage()
    const texture = scene.textures.createCanvas(
      key,
      source.width,
      source.height
    )
    const ctx = texture.getContext()
    ctx.drawImage(source, 0, 0)

    const image = ctx.getImageData(0, 0, source.width, source.height)
    const px = image.data
    for (let i = 0; i < px.length; i += 4) {
      const isBackground = SHEET_BACKGROUNDS.some(
        ([r, g, b]) =>
          Math.abs(px[i] - r) +
            Math.abs(px[i + 1] - g) +
            Math.abs(px[i + 2] - b) <
          18
      )
      if (isBackground) px[i + 3] = 0
    }
    ctx.putImageData(image, 0, 0)
    texture.refresh()

    Object.entries(SHEET_FRAMES).forEach(([name, [x, y, w, h]]) =>
      texture.add(name, 0, x, y, w, h)
    )
  },
}
