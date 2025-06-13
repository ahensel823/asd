export class PPU {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.screenBuffer = new Uint8Array(width * height);
    this.paletteTable = new Uint8Array(0x20);   // $3F00–$3F1F
    this.patternTable = new Uint8Array(0x2000); // $0000–$1FFF
    this.nameTable = new Uint8Array(0x1000);    // $2000–$2FFF
    this.oam = new Uint8Array(256); // 64 sprites * 4 bytes
  }

  writeRegister(addr, value) {
    if (addr >= 0x2000 && addr < 0x3000) {
      this.nameTable[addr & 0x0FFF] = value;
    }
  }

  readRegister(addr) {
    if (addr >= 0x2000 && addr < 0x3000) {
      return this.nameTable[addr & 0x0FFF];
    }
    return 0;
  }

  loadPattern(data, offset = 0) {
    this.patternTable.set(data, offset);
  }

  renderToCanvas(ctx) {
    const imgData = ctx.createImageData(this.width, this.height);
    for (let row = 0; row < 30; row++) {
      for (let col = 0; col < 32; col++) {
        const tileIndex = this.nameTable[row * 32 + col];
        this.drawTile(imgData, col * 8, row * 8, tileIndex);
      }
    }
    this.renderSprites(imgData);
    ctx.putImageData(imgData, 0, 0);
  }

  drawTile(imgData, x0, y0, tileIndex, flipH = false, flipV = false, paletteOffset = 0) {
    const base = tileIndex * 16;
    for (let y = 0; y < 8; y++) {
        const row = flipV ? 7 - y : y;
        const lo = this.patternTable[base + row];
        const hi = this.patternTable[base + row + 8];
        for (let x = 0; x < 8; x++) {
        const bit = flipH ? x : 7 - x;
        const colorLow = (lo >> bit) & 1;
        const colorHigh = (hi >> bit) & 1;
        const paletteIndex = ((colorHigh << 1) | colorLow) + paletteOffset;
        const color = this.getColorFromPalette(paletteIndex);
        const idx = ((y0 + y) * this.width + (x0 + x)) * 4;
        imgData.data[idx + 0] = color[0];
        imgData.data[idx + 1] = color[1];
        imgData.data[idx + 2] = color[2];
        imgData.data[idx + 3] = 255;
        }
    }
}

    renderSprites(imgData) {
    for (let i = 0; i < 64; i++) {
        const base = i * 4;
        const y = this.oam[base];
        const tileIndex = this.oam[base + 1];
        const attr = this.oam[base + 2];
        const x = this.oam[base + 3];

        const flipH = (attr & 0x40) !== 0;
        const flipV = (attr & 0x80) !== 0;
        const palette = attr & 0x03; // 2 bits bajos

        this.drawTile(imgData, x, y, tileIndex, flipH, flipV, palette);
    }
    }

  getColorFromPalette(pIndex) {
    const palettes = [
      [84, 84, 84],
      [0, 30, 116],
      [8, 16, 144],
      [48, 0, 136]
    ];
    return palettes[pIndex % palettes.length];
  }
}
