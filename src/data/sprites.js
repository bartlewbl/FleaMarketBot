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
    rat: [
      [_,_,_,'#312','#433','#433','#312',_,_],
      [_,_,'#312','#544','#655','#655','#433','#312',_],
      [_,'#433','#766','#988','#988','#877','#655','#433','#312'],
      [_,'#433','#988','#000','#766','#000','#766','#433','#312'],
      [_,'#433','#988','#988','#988','#988','#988','#433','#312'],
      [_,'#211','#433','#433','#433','#433','#433','#211',_],
      [_,_,'#211','#211','#211','#211','#211',_,_],
    ],
    slime: [
      [_,_,_,'#4caf50','#4caf50','#4caf50',_,_,_],
      [_,_,'#4caf50','#66bb6a','#66bb6a','#66bb6a','#4caf50',_,_],
      [_,'#4caf50','#66bb6a','#fff','#66bb6a','#fff','#66bb6a','#4caf50',_],
      [_,'#4caf50','#66bb6a','#000','#66bb6a','#000','#66bb6a','#4caf50',_],
      [_,'#4caf50','#66bb6a','#66bb6a','#66bb6a','#66bb6a','#66bb6a','#4caf50',_],
      [_,'#388e3c','#4caf50','#4caf50','#4caf50','#4caf50','#4caf50','#388e3c',_],
      [_,_,'#388e3c','#388e3c','#388e3c','#388e3c','#388e3c',_,_],
    ],
    vagrant: [
      [_,_,_,'#1f1f1f','#1f1f1f','#1f1f1f',_,_,_],
      [_,_,'#1f1f1f','#2a2a2a','#2a2a2a','#2a2a2a','#1f1f1f',_,_],
      [_,'#fcd5b0','#fcd5b0','#fcd5b0','#cfa17a','#fcd5b0','#fcd5b0','#fcd5b0',_],
      [_,'#fcd5b0','#000','#fcd5b0','#fcd5b0','#000','#fcd5b0','#fcd5b0',_],
      [_,_,'#3a2a1a','#3a2a1a','#3a2a1a','#3a2a1a','#3a2a1a',_,_],
      [_,_,'#2f4a5a','#4a6a7a','#4a6a7a','#4a6a7a','#2f4a5a',_,_],
      [_,'#2f4a5a','#4a6a7a','#4a6a7a','#4a6a7a','#4a6a7a','#4a6a7a','#2f4a5a',_],
      [_,_,'#4a6a7a','#4a6a7a','#2a2a2a','#4a6a7a','#4a6a7a',_,_],
      [_,_,'#2a2a2a','#2a2a2a','#2a2a2a','#2a2a2a','#2a2a2a',_,_],
      [_,_,'#2a2a2a','#2a2a2a',_,'#2a2a2a','#2a2a2a',_,_],
      [_,_,'#2a2a2a','#2a2a2a',_,'#2a2a2a','#2a2a2a',_,_],
      [_,_,'#1a1a1a','#1a1a1a',_,'#1a1a1a','#1a1a1a',_,_],
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
  town:       { sky: '#04050b', ground: '#151515', accent: '#2a2a2a' },
  street:     { sky: '#05060f', ground: '#181818', accent: '#313131' },
  alley:      { sky: '#040408', ground: '#111111', accent: '#242424' },
  station:    { sky: '#06070f', ground: '#10141b', accent: '#1f2a35' },
  rooftop:    { sky: '#070912', ground: '#0f0f13', accent: '#2c2f3e' },
  industrial: { sky: '#080707', ground: '#151313', accent: '#2b251f' },
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
    case 'street':
    case 'town': {
      const skylineHeights = [70, 110, 90, 120, 80, 130, 75];
      skylineHeights.forEach((height, idx) => {
        const width = 50 + (idx % 3) * 15;
        const x = idx * 90 + 20;
        const y = h * 0.6 - height;
        ctx.fillStyle = '#1b1f2d';
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = '#2b314a';
        for (let wy = y + 15; wy < y + height - 10; wy += 18) {
          for (let wx = x + 6; wx < x + width - 6; wx += 12) {
            ctx.fillRect(wx, wy, 4, 6);
          }
        }
      });
      ctx.fillStyle = '#101010';
      ctx.fillRect(0, h * 0.8, w, h * 0.05);
      ctx.fillStyle = '#c2b55c';
      for (let i = 0; i < w; i += 60) {
        ctx.fillRect(i + 10, h * 0.83, 35, 4);
      }
      break;
    }
    case 'alley': {
      ctx.fillStyle = '#1f1f1f';
      for (let i = 0; i < 8; i++) {
        const x = (i * 70 + 30) % w;
        const height = 60 + (i * 13) % 40;
        ctx.fillRect(x, h * 0.7 - height, 20, height);
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x - 5, h * 0.7 - height + 10, 30, 6);
        ctx.fillStyle = '#1f1f1f';
      }
      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(0, h * 0.76, w, 6);
      ctx.fillStyle = '#1b1b1b';
      for (let i = 0; i < 20; i++) {
        const bx = (i * 41 + 10) % w;
        ctx.fillRect(bx, h * 0.79 + (i % 3), 8, 2);
      }
      ctx.fillStyle = '#3b612f';
      ctx.fillRect(w * 0.65, h * 0.75, 20, 15);
      break;
    }
    case 'station': {
      ctx.fillStyle = '#1f2a35';
      for (let i = 0; i < 5; i++) {
        const x = i * 120 + 40;
        ctx.fillRect(x, h * 0.7 - 80, 20, 80);
        ctx.fillStyle = '#0d1016';
        ctx.fillRect(x - 10, h * 0.7 - 10, 40, 8);
        ctx.fillStyle = '#1f2a35';
      }
      ctx.fillStyle = '#353535';
      ctx.fillRect(0, h * 0.78, w, 4);
      ctx.fillStyle = '#777';
      for (let i = 0; i < w; i += 80) {
        ctx.fillRect(i, h * 0.82, 50, 3);
      }
      break;
    }
    case 'rooftop': {
      ctx.fillStyle = '#2c2f3e';
      ctx.fillRect(0, h * 0.7 - 15, w, 15);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, h * 0.7, w, 4);
      ctx.fillStyle = '#444';
      [80, 260, 420].forEach((x, idx) => {
        const towerHeight = 50 + idx * 10;
        ctx.fillRect(x, h * 0.7 - towerHeight, 30, towerHeight);
        ctx.fillStyle = '#777';
        ctx.fillRect(x + 5, h * 0.7 - towerHeight + 5, 20, towerHeight - 10);
        ctx.fillStyle = '#444';
      });
      break;
    }
    case 'industrial': {
      ctx.fillStyle = '#2b251f';
      for (let i = 0; i < 4; i++) {
        const containerWidth = 90;
        const x = i * 120 + 30;
        ctx.fillRect(x, h * 0.7 - 40, containerWidth, 40);
        ctx.fillStyle = '#3d332b';
        ctx.fillRect(x, h * 0.7 - 20, containerWidth, 5);
        ctx.fillStyle = '#2b251f';
      }
      ctx.fillStyle = '#914b2b';
      ctx.fillRect(w * 0.8, h * 0.7 - 60, 18, 60);
      ctx.fillStyle = '#222';
      ctx.fillRect(0, h * 0.78, w, 3);
      break;
    }
  }
}
