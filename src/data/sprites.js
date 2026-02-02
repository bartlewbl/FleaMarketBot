// Pixel art sprite definitions and rendering utilities

const _ = null;

export const SPRITES = {
  player: {
    idle: [
      [_,_,_,'#4a3728','#4a3728','#4a3728',_,_,_],
      [_,_,'#4a3728','#4a3728','#4a3728','#4a3728','#4a3728',_,_],
      [_,_,'#fcd5b0','#fcd5b0','#fcd5b0','#fcd5b0','#fcd5b0',_,_],
      [_,'#fcd5b0','#000','#fcd5b0','#fcd5b0','#000','#fcd5b0','#fcd5b0',_],
      [_,_,'#fcd5b0','#fcd5b0','#d4956a','#fcd5b0','#fcd5b0',_,_],
      [_,_,_,'#fcd5b0','#fcd5b0','#fcd5b0',_,_,_],
      [_,_,'#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5',_,_],
      [_,'#fcd5b0','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#fcd5b0',_],
      [_,_,'#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5',_,_],
      [_,_,'#3a6bc5','#3a6bc5',_,'#3a6bc5','#3a6bc5',_,_],
      [_,_,'#3a6bc5','#3a6bc5',_,'#3a6bc5','#3a6bc5',_,_],
      [_,_,'#5a3a1a','#5a3a1a',_,'#5a3a1a','#5a3a1a',_,_],
    ],
    attack: [
      [_,_,_,'#4a3728','#4a3728','#4a3728',_,_,_,_,_,_],
      [_,_,'#4a3728','#4a3728','#4a3728','#4a3728','#4a3728',_,_,_,_,_],
      [_,_,'#fcd5b0','#fcd5b0','#fcd5b0','#fcd5b0','#fcd5b0',_,_,_,_,_],
      [_,'#fcd5b0','#000','#fcd5b0','#fcd5b0','#000','#fcd5b0','#fcd5b0',_,_,_,_],
      [_,_,'#fcd5b0','#fcd5b0','#d4956a','#fcd5b0','#fcd5b0',_,_,_,_,_],
      [_,_,_,'#fcd5b0','#fcd5b0','#fcd5b0',_,_,_,_,_,_],
      [_,_,'#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5',_,_,_,_,_],
      [_,_,'#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#fcd5b0','#888','#888','#aaa','#ddd'],
      [_,_,'#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5','#3a6bc5',_,_,_,_,_],
      [_,_,'#3a6bc5','#3a6bc5',_,'#3a6bc5','#3a6bc5',_,_,_,_,_],
      [_,_,'#3a6bc5','#3a6bc5',_,'#3a6bc5','#3a6bc5',_,_,_,_,_],
      [_,_,'#5a3a1a','#5a3a1a',_,'#5a3a1a','#5a3a1a',_,_,_,_,_],
    ],
  },

  monsters: {
    slime: [
      [_,_,_,'#4caf50','#4caf50','#4caf50',_,_,_],
      [_,_,'#4caf50','#66bb6a','#66bb6a','#66bb6a','#4caf50',_,_],
      [_,'#4caf50','#66bb6a','#fff','#66bb6a','#fff','#66bb6a','#4caf50',_],
      [_,'#4caf50','#66bb6a','#000','#66bb6a','#000','#66bb6a','#4caf50',_],
      [_,'#4caf50','#66bb6a','#66bb6a','#66bb6a','#66bb6a','#66bb6a','#4caf50',_],
      [_,'#388e3c','#4caf50','#4caf50','#4caf50','#4caf50','#4caf50','#388e3c',_],
      [_,_,'#388e3c','#388e3c','#388e3c','#388e3c','#388e3c',_,_],
    ],
    wolf: [
      [_,_,'#666',_,_,_,'#666',_,_,_],
      [_,'#666','#888',_,_,_,'#888','#666',_,_],
      [_,'#888','#aaa','#aaa','#aaa','#aaa','#aaa','#888',_,_],
      ['#888','#aaa','#000','#aaa','#aaa','#000','#aaa','#aaa','#888',_],
      [_,'#aaa','#aaa','#aaa','#aaa','#aaa','#aaa','#aaa',_,_],
      [_,'#888','#aaa','#aaa','#d44','#aaa','#aaa','#888',_,_],
      [_,_,'#888','#aaa','#aaa','#aaa','#888','#888','#888','#666'],
      [_,_,_,'#888','#888','#888',_,_,'#888',_],
      [_,_,'#666',_,_,_,'#666',_,_,_],
    ],
    bat: [
      ['#333',_,_,_,_,_,_,_,'#333'],
      ['#555','#333',_,_,_,_,_,'#333','#555'],
      ['#555','#555','#333','#555','#555','#555','#333','#555','#555'],
      [_,'#555','#555','#f00','#555','#f00','#555','#555',_],
      [_,_,'#555','#555','#555','#555','#555',_,_],
      [_,_,_,'#333','#555','#333',_,_,_],
    ],
    skeleton: [
      [_,_,'#ddd','#ddd','#ddd','#ddd','#ddd',_,_],
      [_,'#ddd','#000','#ddd','#ddd','#000','#ddd','#ddd',_],
      [_,_,'#ddd','#ddd','#ddd','#ddd','#ddd',_,_],
      [_,_,'#ddd','#333','#333','#333','#ddd',_,_],
      [_,_,_,'#bbb','#bbb','#bbb',_,_,_],
      [_,'#bbb','#bbb','#bbb','#bbb','#bbb','#bbb','#bbb',_],
      [_,_,_,'#bbb','#bbb','#bbb',_,_,_],
      [_,_,_,'#bbb','#bbb','#bbb',_,_,_],
      [_,_,'#bbb','#bbb',_,'#bbb','#bbb',_,_],
      [_,_,'#999',_,_,_,'#999',_,_],
    ],
    goblin: [
      [_,_,'#5a5',_,_,_,'#5a5',_,_],
      [_,_,'#6b6','#6b6','#6b6','#6b6','#6b6',_,_],
      [_,'#6b6','#f00','#6b6','#6b6','#f00','#6b6','#6b6',_],
      [_,_,'#6b6','#6b6','#6b6','#6b6','#6b6',_,_],
      [_,_,'#6b6','#6b6','#3a3','#6b6','#6b6',_,_],
      [_,_,_,'#6b6','#6b6','#6b6',_,_,_],
      [_,'#742','#742','#742','#742','#742','#742','#742',_],
      [_,_,'#742','#742','#742','#742','#742',_,_],
      [_,_,'#742','#742',_,'#742','#742',_,_],
      [_,_,'#531',_,_,_,'#531',_,_],
    ],
    golem: [
      [_,_,'#666','#777','#777','#777','#666',_,_],
      [_,'#666','#888','#888','#888','#888','#888','#666',_],
      [_,'#888','#ff0','#888','#888','#ff0','#888','#888',_],
      [_,'#888','#888','#888','#888','#888','#888','#888',_],
      [_,_,'#888','#888','#666','#888','#888',_,_],
      ['#888','#888','#777','#777','#777','#777','#777','#888','#888'],
      ['#888',_,'#777','#777','#777','#777','#777',_,'#888'],
      [_,_,'#666','#666','#666','#666','#666',_,_],
      [_,'#666','#666',_,_,_,'#666','#666',_],
      [_,'#555','#555',_,_,_,'#555','#555',_],
    ],
    snake: [
      [_,_,_,_,_,_,_,'#2a6','#2a6'],
      [_,_,_,_,_,_,'#2a6','#3b7','#3b7'],
      [_,_,_,_,'#2a6','#2a6','#3b7',_,_],
      [_,_,'#2a6','#2a6','#3b7','#3b7',_,_,_],
      ['#f00','#2a6','#3b7','#3b7',_,_,_,_,_],
      ['#2a6','#d00','#2a6','#3b7',_,_,_,_,_],
      [_,'#2a6','#3b7','#3b7','#2a6',_,_,_,_],
      [_,_,_,'#2a6','#3b7','#2a6','#2a6',_,_],
      [_,_,_,_,'#2a6','#3b7','#3b7','#2a6',_],
    ],
    dragon: [
      [_,_,'#c30',_,_,_,_,_,'#c30',_,_],
      [_,_,'#d44','#c30',_,_,_,'#c30','#d44',_,_],
      [_,_,'#d44','#d44','#d44','#d44','#d44','#d44','#d44',_,_],
      [_,'#d44','#ff0','#d44','#d44','#d44','#ff0','#d44','#d44','#d44',_],
      [_,_,'#d44','#d44','#d44','#d44','#d44','#d44','#d44',_,_],
      [_,_,'#d44','#d44','#fff','#fff','#d44','#d44',_,_,_],
      ['#c30','#d44','#d44','#d44','#d44','#d44','#d44','#d44','#d44','#c30',_],
      [_,'#c30','#d44','#d44','#d44','#d44','#d44','#d44','#c30',_,_],
      [_,_,'#c30','#d44',_,_,_,'#d44','#c30',_,_],
      [_,_,'#a20',_,_,_,_,_,'#a20',_,_],
    ],
    ghost: [
      [_,_,'#aaf','#aaf','#aaf','#aaf','#aaf',_,_],
      [_,'#aaf','#ccf','#ccf','#ccf','#ccf','#ccf','#aaf',_],
      ['#aaf','#ccf','#000','#ccf','#ccf','#000','#ccf','#ccf','#aaf'],
      ['#aaf','#ccf','#ccf','#ccf','#ccf','#ccf','#ccf','#ccf','#aaf'],
      ['#aaf','#ccf','#ccf','#ccf','#ccf','#ccf','#ccf','#ccf','#aaf'],
      [_,'#aaf','#ccf','#ccf','#ccf','#ccf','#ccf','#aaf',_],
      [_,'#aaf','#ccf','#aaf','#ccf','#aaf','#ccf','#aaf',_],
      [_,_,'#aaf',_,'#aaf',_,'#aaf',_,_],
    ],
    mushroom: [
      [_,_,'#d22','#d22','#d22','#d22','#d22',_,_],
      [_,'#d22','#fff','#d22','#d22','#d22','#fff','#d22',_],
      ['#d22','#d22','#d22','#d22','#d22','#d22','#d22','#d22','#d22'],
      [_,_,'#da8','#da8','#da8','#da8','#da8',_,_],
      [_,_,_,'#da8','#000','#da8',_,_,_],
      [_,_,'#da8','#da8','#da8','#da8','#da8',_,_],
      [_,_,_,'#c97','#c97','#c97',_,_,_],
    ],
  },
};

export const BACKGROUNDS = {
  town:    { sky: '#1a1a3a', ground: '#2d5a1e', accent: '#3a7a2e' },
  forest:  { sky: '#0d1a0d', ground: '#1a3a0e', accent: '#2d5a1e' },
  cave:    { sky: '#0a0a14', ground: '#1a1a2a', accent: '#2a2a3a' },
  desert:  { sky: '#2a2010', ground: '#c4a03a', accent: '#a08030' },
  swamp:   { sky: '#0a1a0a', ground: '#1a2a1a', accent: '#2a3a2a' },
  volcano: { sky: '#1a0a0a', ground: '#3a1a0a', accent: '#5a2a0a' },
  ruins:   { sky: '#0d0d1a', ground: '#2a2a3a', accent: '#3a3a4a' },
};

export function drawSprite(ctx, spriteData, x, y, scale = 3) {
  for (let row = 0; row < spriteData.length; row++) {
    for (let col = 0; col < spriteData[row].length; col++) {
      const color = spriteData[row][col];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
      }
    }
  }
}

export function drawSpriteCentered(ctx, spriteData, cx, cy, scale = 3) {
  const w = spriteData[0].length * scale;
  const h = spriteData.length * scale;
  drawSprite(ctx, spriteData, cx - w / 2, cy - h / 2, scale);
}

export function drawBackground(ctx, locationKey, width, height) {
  const bg = BACKGROUNDS[locationKey] || BACKGROUNDS.town;

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, bg.sky);
  gradient.addColorStop(0.6, bg.sky);
  gradient.addColorStop(1, bg.ground);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = bg.ground;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);

  ctx.fillStyle = bg.accent;
  for (let i = 0; i < 8; i++) {
    const bx = (i * 97 + 23) % width;
    const by = height * 0.68 + ((i * 37) % 30);
    const bw = 20 + ((i * 13) % 40);
    const bh = 4 + ((i * 7) % 8);
    ctx.fillRect(bx, by, bw, bh);
  }

  // Location-specific decorations
  drawLocationDetails(ctx, locationKey, width, height);

  // Stars
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 20; i++) {
    const sx = (i * 137 + 47) % width;
    const sy = (i * 89 + 13) % (height * 0.5);
    ctx.fillRect(sx, sy, 2, 2);
  }
}

function drawLocationDetails(ctx, key, w, h) {
  switch (key) {
    case 'forest': {
      const positions = [60, 180, 380, 520];
      positions.forEach(tx => {
        const th = 60 + (tx % 30);
        const ty = h * 0.7 - th;
        ctx.fillStyle = '#4a3520';
        ctx.fillRect(tx - 4, ty + th * 0.5, 8, th * 0.5);
        ctx.fillStyle = '#1a5a1a';
        ctx.fillRect(tx - 16, ty, 32, th * 0.35);
        ctx.fillStyle = '#2a7a2a';
        ctx.fillRect(tx - 12, ty + 5, 24, th * 0.25);
      });
      break;
    }
    case 'cave': {
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
      break;
    }
    case 'desert': {
      ctx.fillStyle = '#b89030';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.72);
      for (let x = 0; x <= w; x += 2) {
        ctx.lineTo(x, h * 0.72 + Math.sin(x * 0.02) * 15 + Math.sin(x * 0.005) * 20);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();
      break;
    }
    case 'volcano': {
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
      break;
    }
    case 'town': {
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
        ctx.fillStyle = '#5a3a2a';
        ctx.beginPath();
        ctx.moveTo(b.x - 5, by);
        ctx.lineTo(b.x + b.w + 5, by);
        ctx.lineTo(b.x + b.w / 2, by - 20);
        ctx.fill();
        ctx.fillStyle = '#ff9';
        for (let wx = b.x + 10; wx < b.x + b.w - 10; wx += 20) {
          ctx.fillRect(wx, by + 15, 8, 8);
          ctx.fillRect(wx, by + 35, 8, 8);
        }
      });
      break;
    }
    case 'swamp': {
      for (let i = 0; i < 10; i++) {
        const px = (i * 71 + 15) % w;
        const py = h * 0.68 + (i * 19) % 40;
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(px, py, 2, -20 - (i * 7) % 15);
        ctx.fillStyle = '#2a4a2a';
        ctx.fillRect(px - 3, py - 20 - (i * 7) % 15, 8, 6);
      }
      ctx.fillStyle = 'rgba(30, 80, 50, 0.4)';
      for (let i = 0; i < 5; i++) {
        const px = (i * 131 + 40) % w;
        const py = h * 0.75 + (i * 23) % 30;
        ctx.fillRect(px, py, 40 + (i * 17) % 30, 8);
      }
      break;
    }
    case 'ruins': {
      ctx.fillStyle = '#3a3a4a';
      [80, 200, 350, 480, 560].forEach((px, i) => {
        const ph = 40 + (i * 23) % 50;
        ctx.fillRect(px, h * 0.7 - ph, 12, ph);
        ctx.fillRect(px - 4, h * 0.7 - ph, 20, 6);
      });
      break;
    }
  }
}
