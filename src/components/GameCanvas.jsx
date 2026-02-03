import { useRef, useEffect } from 'react';
import { SPRITES, drawBackground, drawSpriteCentered } from '../data/sprites';

export default function GameCanvas({ screen, location, battle, animTick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    switch (screen) {
      case 'menu':
        renderMenu(ctx, w, h, animTick);
        break;
      case 'town':
      case 'locations':
      case 'inventory':
      case 'shop':
        drawBackground(ctx, 'town', w, h);
        if (screen === 'town') {
          drawSpriteCentered(ctx, SPRITES.player.idle, w / 2, h * 0.55, 4);
        }
        break;
      case 'explore':
        if (location) {
          drawBackground(ctx, location.bgKey, w, h);
          const bobY = Math.sin(animTick * 0.1) * 2;
          drawSpriteCentered(ctx, SPRITES.player.idle, w * 0.25, h * 0.55 + bobY, 3);
        }
        break;
      case 'battle':
        renderBattle(ctx, w, h, location, battle, animTick);
        break;
      case 'battle-result':
        if (location) drawBackground(ctx, location.bgKey, w, h);
        break;
    }
  }, [screen, location, battle, animTick]);

  return <canvas ref={canvasRef} width={640} height={480} className="game-canvas" />;
}

function renderMenu(ctx, w, h, tick) {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#111128';
  for (let x = 0; x < w; x += 16) {
    for (let y = 0; y < h; y += 16) {
      if ((x + y) % 32 === 0) ctx.fillRect(x, y, 8, 8);
    }
  }
  drawSpriteCentered(ctx, SPRITES.player.idle, w / 2, h * 0.45, 5);
  drawSpriteCentered(ctx, SPRITES.monsters.rat, w * 0.2, h * 0.52, 3);
  drawSpriteCentered(ctx, SPRITES.monsters.slime, w * 0.8, h * 0.48, 3);
  drawSpriteCentered(ctx, SPRITES.monsters.vagrant, w * 0.65, h * 0.4, 2);
  drawSpriteCentered(ctx, SPRITES.monsters.rat, w * 0.35, h * 0.35, 2);
}

function renderBattle(ctx, w, h, location, battle, tick) {
  if (!location || !battle?.monster) return;
  drawBackground(ctx, location.bgKey, w, h);

  // Player
  const pBob = Math.sin(tick * 0.08) * 2;
  drawSpriteCentered(ctx, SPRITES.player.idle, w * 0.2, h * 0.45 + pBob, 4);

  // Monster
  const monsterSprite = SPRITES.monsters[battle.monster.sprite];
  if (monsterSprite) {
    const mBob = Math.sin(tick * 0.06 + 1) * 2;
    drawSpriteCentered(ctx, monsterSprite, w * 0.7, h * 0.4 + mBob, 4);
  }
}
