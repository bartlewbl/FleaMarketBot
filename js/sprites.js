// Pixel art sprite definitions and rendering
// Each sprite is a 2D array of hex color values (null = transparent)

const Sprites = {
  // Scale factor for rendering
  SCALE: 3,

  // Draw a sprite on the canvas at position (x, y)
  draw(ctx, spriteData, x, y, scale) {
    scale = scale || this.SCALE;
    for (let row = 0; row < spriteData.length; row++) {
      for (let col = 0; col < spriteData[row].length; col++) {
        const color = spriteData[row][col];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
        }
      }
    }
  },

  // Draw sprite centered at x, y
  drawCentered(ctx, spriteData, cx, cy, scale) {
    scale = scale || this.SCALE;
    const w = spriteData[0].length * scale;
    const h = spriteData.length * scale;
    this.draw(ctx, spriteData, cx - w / 2, cy - h / 2, scale);
  },

  // Flip sprite horizontally
  flipH(spriteData) {
    return spriteData.map(row => [...row].reverse());
  },

  // ---- PLAYER SPRITES ----
  player: {
    idle: [
      [null,null,null,'#4a3728','#4a3728','#4a3728',null,null,null],
      [null,null,'#4a3728','#4a3728','#4a3728','#4a3728','#4a3728',null,null],
      [null,null,'#fcd5b0','#fcd5b0','#fcd5b0','#fcd5b0','#fcd5b0',null,null],
      [null,'#fcd5b0','#000','#fcd5b0','#fcd5b0','#000','#fcd5b0','#fcd5b0',null],
      [null,null,'#fcd5b0','#fcd5b0','#d4956a','#fcd5b0','#fcd5b0',null,null],
      [null,null,null,'#fcd5b0','#fcd5b0','#fcd5b0',null,null,null],
      [null,null,'#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5',null,null],
      [null,'#fcd5b0','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#fcd5b0',null],
      [null,null,'#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5',null,null],
      [null,null,'#3a6bc5','#3a6bc5',null,'#3a6bc5','#3a6bc5',null,null],
      [null,null,'#3a6bc5','#3a6bc5',null,'#3a6bc5','#3a6bc5',null,null],
      [null,null,'#5a3a1a','#5a3a1a',null,'#5a3a1a','#5a3a1a',null,null],
    ],
    attack: [
      [null,null,null,'#4a3728','#4a3728','#4a3728',null,null,null,null,null,null],
      [null,null,'#4a3728','#4a3728','#4a3728','#4a3728','#4a3728',null,null,null,null,null],
      [null,null,'#fcd5b0','#fcd5b0','#fcd5b0','#fcd5b0','#fcd5b0',null,null,null,null,null],
      [null,'#fcd5b0','#000','#fcd5b0','#fcd5b0','#000','#fcd5b0','#fcd5b0',null,null,null,null],
      [null,null,'#fcd5b0','#fcd5b0','#d4956a','#fcd5b0','#fcd5b0',null,null,null,null,null],
      [null,null,null,'#fcd5b0','#fcd5b0','#fcd5b0',null,null,null,null,null,null],
      [null,null,'#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5',null,null,null,null,null],
      [null,null,'#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#fcd5b0','#888','#888','#aaa','#ddd'],
      [null,null,'#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5',null,null,null,null,null],
      [null,null,'#3a6bc5','#3a6bc5',null,'#3a6bc5','#3a6bc5',null,null,null,null,null],
      [null,null,'#3a6bc5','#3a6bc5',null,'#3a6bc5','#3a6bc5',null,null,null,null,null],
      [null,null,'#5a3a1a','#5a3a1a',null,'#5a3a1a','#5a3a1a',null,null,null,null,null],
    ],
  },

  // ---- MONSTER SPRITES ----
  monsters: {
    slime: [
      [null,null,null,'#4caf50','#4caf50','#4caf50',null,null,null],
      [null,null,'#4caf50','#66bb6a','#66bb6a','#66bb6a','#4caf50',null,null],
      [null,'#4caf50','#66bb6a','#fff','#66bb6a','#fff','#66bb6a','#4caf50',null],
      [null,'#4caf50','#66bb6a','#000','#66bb6a','#000','#66bb6a','#4caf50',null],
      [null,'#4caf50','#66bb6a','#66bb6a','#66bb6a','#66bb6a','#66bb6a','#4caf50',null],
      [null,'#388e3c','#4caf50','#4caf50','#4caf50','#4caf50','#4caf50','#388e3c',null],
      [null,null,'#388e3c','#388e3c','#388e3c','#388e3c','#388e3c',null,null],
    ],
    wolf: [
      [null,null,'#666',null,null,null,'#666',null,null,null],
      [null,'#666','#888',null,null,null,'#888','#666',null,null],
      [null,'#888','#aaa','#aaa','#aaa','#aaa','#aaa','#888',null,null],
      ['#888','#aaa','#000','#aaa','#aaa','#000','#aaa','#aaa','#888',null],
      [null,'#aaa','#aaa','#aaa','#aaa','#aaa','#aaa','#aaa',null,null],
      [null,'#888','#aaa','#aaa','#d44','#aaa','#aaa','#888',null,null],
      [null,null,'#888','#aaa','#aaa','#aaa','#888','#888','#888','#666'],
      [null,null,null,'#888','#888','#888',null,null,'#888',null],
      [null,null,'#666',null,null,null,'#666',null,null,null],
    ],
    bat: [
      ['#333',null,null,null,null,null,null,null,'#333'],
      ['#555','#333',null,null,null,null,null,'#333','#555'],
      ['#555','#555','#333','#555','#555','#555','#333','#555','#555'],
      [null,'#555','#555','#f00','#555','#f00','#555','#555',null],
      [null,null,'#555','#555','#555','#555','#555',null,null],
      [null,null,null,'#333','#555','#333',null,null,null],
    ],
    skeleton: [
      [null,null,'#ddd','#ddd','#ddd','#ddd','#ddd',null,null],
      [null,'#ddd','#000','#ddd','#ddd','#000','#ddd','#ddd',null],
      [null,null,'#ddd','#ddd','#ddd','#ddd','#ddd',null,null],
      [null,null,'#ddd','#333','#333','#333','#ddd',null,null],
      [null,null,null,'#bbb','#bbb','#bbb',null,null,null],
      [null,'#bbb','#bbb','#bbb','#bbb','#bbb','#bbb','#bbb',null],
      [null,null,null,'#bbb','#bbb','#bbb',null,null,null],
      [null,null,null,'#bbb','#bbb','#bbb',null,null,null],
      [null,null,'#bbb','#bbb',null,'#bbb','#bbb',null,null],
      [null,null,'#999',null,null,null,'#999',null,null],
    ],
    goblin: [
      [null,null,'#5a5',null,null,null,'#5a5',null,null],
      [null,null,'#6b6','#6b6','#6b6','#6b6','#6b6',null,null],
      [null,'#6b6','#f00','#6b6','#6b6','#f00','#6b6','#6b6',null],
      [null,null,'#6b6','#6b6','#6b6','#6b6','#6b6',null,null],
      [null,null,'#6b6','#6b6','#3a3','#6b6','#6b6',null,null],
      [null,null,null,'#6b6','#6b6','#6b6',null,null,null],
      [null,'#742','#742','#742','#742','#742','#742','#742',null],
      [null,null,'#742','#742','#742','#742','#742',null,null],
      [null,null,'#742','#742',null,'#742','#742',null,null],
      [null,null,'#531',null,null,null,'#531',null,null],
    ],
    golem: [
      [null,null,'#666','#777','#777','#777','#666',null,null],
      [null,'#666','#888','#888','#888','#888','#888','#666',null],
      [null,'#888','#ff0','#888','#888','#ff0','#888','#888',null],
      [null,'#888','#888','#888','#888','#888','#888','#888',null],
      [null,null,'#888','#888','#666','#888','#888',null,null],
      ['#888','#888','#777','#777','#777','#777','#777','#888','#888'],
      ['#888',null,'#777','#777','#777','#777','#777',null,'#888'],
      [null,null,'#666','#666','#666','#666','#666',null,null],
      [null,'#666','#666',null,null,null,'#666','#666',null],
      [null,'#555','#555',null,null,null,'#555','#555',null],
    ],
    snake: [
      [null,null,null,null,null,null,null,'#2a6','#2a6'],
      [null,null,null,null,null,null,'#2a6','#3b7','#3b7'],
      [null,null,null,null,'#2a6','#2a6','#3b7',null,null],
      [null,null,'#2a6','#2a6','#3b7','#3b7',null,null,null],
      ['#f00','#2a6','#3b7','#3b7',null,null,null,null,null],
      ['#2a6','#d00','#2a6','#3b7',null,null,null,null,null],
      [null,'#2a6','#3b7','#3b7','#2a6',null,null,null,null],
      [null,null,null,'#2a6','#3b7','#2a6','#2a6',null,null],
      [null,null,null,null,'#2a6','#3b7','#3b7','#2a6',null],
    ],
    dragon: [
      [null,null,'#c30',null,null,null,null,null,'#c30',null,null],
      [null,null,'#d44','#c30',null,null,null,'#c30','#d44',null,null],
      [null,null,'#d44','#d44','#d44','#d44','#d44','#d44','#d44',null,null],
      [null,'#d44','#ff0','#d44','#d44','#d44','#ff0','#d44','#d44','#d44',null],
      [null,null,'#d44','#d44','#d44','#d44','#d44','#d44','#d44',null,null],
      [null,null,'#d44','#d44','#fff','#fff','#d44','#d44',null,null,null],
      ['#c30','#d44','#d44','#d44','#d44','#d44','#d44','#d44','#d44','#c30',null],
      [null,'#c30','#d44','#d44','#d44','#d44','#d44','#d44','#c30',null,null],
      [null,null,'#c30','#d44',null,null,null,'#d44','#c30',null,null],
      [null,null,'#a20',null,null,null,null,null,'#a20',null,null],
    ],
    ghost: [
      [null,null,'#aaf','#aaf','#aaf','#aaf','#aaf',null,null],
      [null,'#aaf','#ccf','#ccf','#ccf','#ccf','#ccf','#aaf',null],
      ['#aaf','#ccf','#000','#ccf','#ccf','#000','#ccf','#ccf','#aaf'],
      ['#aaf','#ccf','#ccf','#ccf','#ccf','#ccf','#ccf','#ccf','#aaf'],
      ['#aaf','#ccf','#ccf','#ccf','#ccf','#ccf','#ccf','#ccf','#aaf'],
      [null,'#aaf','#ccf','#ccf','#ccf','#ccf','#ccf','#aaf',null],
      [null,'#aaf','#ccf','#aaf','#ccf','#aaf','#ccf','#aaf',null],
      [null,null,'#aaf',null,'#aaf',null,'#aaf',null,null],
    ],
    mushroom: [
      [null,null,'#d22','#d22','#d22','#d22','#d22',null,null],
      [null,'#d22','#fff','#d22','#d22','#d22','#fff','#d22',null],
      ['#d22','#d22','#d22','#d22','#d22','#d22','#d22','#d22','#d22'],
      [null,null,'#da8','#da8','#da8','#da8','#da8',null,null],
      [null,null,null,'#da8','#000','#da8',null,null,null],
      [null,null,'#da8','#da8','#da8','#da8','#da8',null,null],
      [null,null,null,'#c97','#c97','#c97',null,null,null],
    ],
  },

  // ---- BACKGROUND SCENES ----
  backgrounds: {
    town: { sky: '#1a1a3a', ground: '#2d5a1e', accent: '#3a7a2e' },
    forest: { sky: '#0d1a0d', ground: '#1a3a0e', accent: '#2d5a1e' },
    cave: { sky: '#0a0a14', ground: '#1a1a2a', accent: '#2a2a3a' },
    desert: { sky: '#2a2010', ground: '#c4a03a', accent: '#a08030' },
    swamp: { sky: '#0a1a0a', ground: '#1a2a1a', accent: '#2a3a2a' },
    volcano: { sky: '#1a0a0a', ground: '#3a1a0a', accent: '#5a2a0a' },
    ruins: { sky: '#0d0d1a', ground: '#2a2a3a', accent: '#3a3a4a' },
  },

  // Draw a scene background
  drawBackground(ctx, locationKey, width, height) {
    const bg = this.backgrounds[locationKey] || this.backgrounds.town;

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, bg.sky);
    gradient.addColorStop(0.6, bg.sky);
    gradient.addColorStop(1, bg.ground);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Ground
    ctx.fillStyle = bg.ground;
    ctx.fillRect(0, height * 0.7, width, height * 0.3);

    // Accent details
    ctx.fillStyle = bg.accent;
    for (let i = 0; i < 8; i++) {
      const bx = ((i * 97 + 23) % width);
      const by = height * 0.68 + ((i * 37) % 30);
      const bw = 20 + ((i * 13) % 40);
      const bh = 4 + ((i * 7) % 8);
      ctx.fillRect(bx, by, bw, bh);
    }

    // Location-specific decorations
    if (locationKey === 'forest') {
      this._drawTrees(ctx, width, height);
    } else if (locationKey === 'cave') {
      this._drawCaveStalactites(ctx, width, height);
    } else if (locationKey === 'desert') {
      this._drawDunes(ctx, width, height);
    } else if (locationKey === 'volcano') {
      this._drawLava(ctx, width, height);
    } else if (locationKey === 'town') {
      this._drawBuildings(ctx, width, height);
    } else if (locationKey === 'swamp') {
      this._drawSwampDetails(ctx, width, height);
    } else if (locationKey === 'ruins') {
      this._drawRuins(ctx, width, height);
    }

    // Stars (for darker scenes)
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 20; i++) {
      const sx = (i * 137 + 47) % width;
      const sy = (i * 89 + 13) % (height * 0.5);
      ctx.fillRect(sx, sy, 2, 2);
    }
  },

  _drawTrees(ctx, w, h) {
    const treePositions = [60, 180, 380, 520];
    treePositions.forEach(tx => {
      const th = 60 + (tx % 30);
      const ty = h * 0.7 - th;
      // Trunk
      ctx.fillStyle = '#4a3520';
      ctx.fillRect(tx - 4, ty + th * 0.5, 8, th * 0.5);
      // Leaves
      ctx.fillStyle = '#1a5a1a';
      ctx.fillRect(tx - 16, ty, 32, th * 0.35);
      ctx.fillStyle = '#2a7a2a';
      ctx.fillRect(tx - 12, ty + 5, 24, th * 0.25);
    });
  },

  _drawCaveStalactites(ctx, w, h) {
    ctx.fillStyle = '#2a2a3a';
    for (let i = 0; i < 12; i++) {
      const sx = (i * 61 + 10) % w;
      const sh = 20 + (i * 17) % 40;
      ctx.beginPath();
      ctx.moveTo(sx - 8, 0);
      ctx.lineTo(sx + 8, 0);
      ctx.lineTo(sx, sh);
      ctx.fill();
    }
    // Ground stalagmites
    ctx.fillStyle = '#1a1a2a';
    for (let i = 0; i < 8; i++) {
      const sx = (i * 83 + 30) % w;
      const sh = 10 + (i * 13) % 25;
      ctx.beginPath();
      ctx.moveTo(sx - 6, h);
      ctx.lineTo(sx + 6, h);
      ctx.lineTo(sx, h - sh);
      ctx.fill();
    }
  },

  _drawDunes(ctx, w, h) {
    ctx.fillStyle = '#b89030';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    for (let x = 0; x <= w; x += 2) {
      ctx.lineTo(x, h * 0.72 + Math.sin(x * 0.02) * 15 + Math.sin(x * 0.005) * 20);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
  },

  _drawLava(ctx, w, h) {
    ctx.fillStyle = '#ff4400';
    for (let i = 0; i < 6; i++) {
      const lx = (i * 107 + 20) % w;
      const ly = h * 0.8 + (i * 23) % 30;
      ctx.fillRect(lx, ly, 30 + (i * 11) % 20, 6);
    }
    ctx.fillStyle = '#ff8800';
    for (let i = 0; i < 4; i++) {
      const lx = (i * 167 + 50) % w;
      const ly = h * 0.82 + (i * 31) % 20;
      ctx.fillRect(lx, ly, 20, 4);
    }
  },

  _drawBuildings(ctx, w, h) {
    const buildings = [
      { x: 50, w: 80, h: 90, color: '#3a2a1a' },
      { x: 200, w: 60, h: 70, color: '#2a3a4a' },
      { x: 400, w: 100, h: 100, color: '#3a3a2a' },
      { x: 530, w: 70, h: 60, color: '#4a2a2a' },
    ];
    buildings.forEach(b => {
      const by = h * 0.7 - b.h;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, by, b.w, b.h);
      // Roof
      ctx.fillStyle = '#5a3a2a';
      ctx.beginPath();
      ctx.moveTo(b.x - 5, by);
      ctx.lineTo(b.x + b.w + 5, by);
      ctx.lineTo(b.x + b.w / 2, by - 20);
      ctx.fill();
      // Windows
      ctx.fillStyle = '#ff9';
      for (let wx = b.x + 10; wx < b.x + b.w - 10; wx += 20) {
        ctx.fillRect(wx, by + 15, 8, 8);
        ctx.fillRect(wx, by + 35, 8, 8);
      }
    });
  },

  _drawSwampDetails(ctx, w, h) {
    ctx.fillStyle = '#1a3a1a';
    for (let i = 0; i < 10; i++) {
      const px = (i * 71 + 15) % w;
      const py = h * 0.68 + (i * 19) % 40;
      ctx.fillRect(px, py, 2, -20 - (i * 7) % 15);
      ctx.fillStyle = '#2a4a2a';
      ctx.fillRect(px - 3, py - 20 - (i * 7) % 15, 8, 6);
      ctx.fillStyle = '#1a3a1a';
    }
    // Water patches
    ctx.fillStyle = 'rgba(30, 80, 50, 0.4)';
    for (let i = 0; i < 5; i++) {
      const px = (i * 131 + 40) % w;
      const py = h * 0.75 + (i * 23) % 30;
      ctx.fillRect(px, py, 40 + (i * 17) % 30, 8);
    }
  },

  _drawRuins(ctx, w, h) {
    ctx.fillStyle = '#3a3a4a';
    const pillars = [80, 200, 350, 480, 560];
    pillars.forEach((px, i) => {
      const ph = 40 + (i * 23) % 50;
      ctx.fillRect(px, h * 0.7 - ph, 12, ph);
      ctx.fillRect(px - 4, h * 0.7 - ph, 20, 6);
    });
    // Broken blocks
    ctx.fillStyle = '#2a2a3a';
    for (let i = 0; i < 6; i++) {
      const bx = (i * 113 + 30) % w;
      const by = h * 0.72 + (i * 17) % 20;
      ctx.fillRect(bx, by, 16 + (i * 7) % 12, 10 + (i * 5) % 8);
    }
  },

  // Draw item icon
  drawItemIcon(ctx, type, x, y, scale) {
    scale = scale || 2;
    const sprite = this.items[type] || this.items.potion;
    this.draw(ctx, sprite, x, y, scale);
  },

  items: {
    sword: [
      [null,null,null,null,null,'#ddd'],
      [null,null,null,null,'#ddd','#aaa'],
      [null,null,null,'#ddd','#aaa',null],
      [null,'#a60','#ddd','#aaa',null,null],
      [null,'#a60','#aaa',null,null,null],
      ['#530','#a60',null,null,null,null],
    ],
    shield: [
      [null,'#44a','#44a','#44a','#44a',null],
      ['#44a','#66c','#66c','#66c','#66c','#44a'],
      ['#44a','#66c','#ff0','#ff0','#66c','#44a'],
      ['#44a','#66c','#66c','#66c','#66c','#44a'],
      [null,'#44a','#66c','#66c','#44a',null],
      [null,null,'#44a','#44a',null,null],
    ],
    helmet: [
      [null,'#888','#888','#888','#888',null],
      ['#888','#aaa','#aaa','#aaa','#aaa','#888'],
      ['#888','#aaa','#aaa','#aaa','#aaa','#888'],
      ['#666','#888','#888','#888','#888','#666'],
      [null,null,null,null,null,null],
    ],
    armor: [
      [null,'#555','#555','#555','#555',null],
      ['#555','#777','#777','#777','#777','#555'],
      ['#888','#777','#999','#999','#777','#888'],
      [null,'#777','#777','#777','#777',null],
      [null,'#555','#555','#555','#555',null],
      [null,'#555',null,null,'#555',null],
    ],
    potion: [
      [null,null,'#aaa','#aaa',null,null],
      [null,null,'#aaa','#aaa',null,null],
      [null,'#f44','#f44','#f44','#f44',null],
      ['#f44','#f66','#f88','#f66','#f44','#f44'],
      [null,'#f44','#f44','#f44','#f44',null],
    ],
    ring: [
      [null,'#fd0','#fd0','#fd0',null],
      ['#fd0',null,null,null,'#fd0'],
      ['#fd0',null,'#f44',null,'#fd0'],
      ['#fd0',null,null,null,'#fd0'],
      [null,'#fd0','#fd0','#fd0',null],
    ],
    boots: [
      ['#630',null,null,'#630',null],
      ['#630',null,null,'#630',null],
      ['#840','#630',null,'#840','#630'],
      ['#840','#840',null,'#840','#840'],
    ],
  },
};
