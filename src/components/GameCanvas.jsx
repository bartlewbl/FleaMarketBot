import { useRef, useEffect } from 'react';
import { SPRITES, drawBackground, drawSpriteCentered } from '../data/sprites';

// Animation durations in milliseconds
const ANIM_DURATIONS = {
  'player-attack': 500,
  'player-defend': 400,
  'player-skill': 600,
  'player-heal': 450,
  'monster-attack': 500,
  'dodge': 450,
};

function easeOut(t) { return 1 - (1 - t) * (1 - t); }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; }

export default function GameCanvas({ screen, location, battle, animTick, battleAnim }) {
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
        renderBattle(ctx, w, h, location, battle, animTick, battleAnim);
        break;
      case 'battle-result':
        if (location) drawBackground(ctx, location.bgKey, w, h);
        break;
    }
  }, [screen, location, battle, animTick, battleAnim]);

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

function renderBattle(ctx, w, h, location, battle, tick, battleAnim) {
  if (!location || !battle?.monster) return;

  // Get animation state
  const now = performance.now();
  let animType = null;
  let progress = 0;

  if (battleAnim) {
    const elapsed = now - battleAnim.startTime;
    const duration = ANIM_DURATIONS[battleAnim.type] || 500;
    progress = Math.min(1, elapsed / duration);
    if (progress < 1) animType = battleAnim.type;
  }

  // Base positions
  const basePlayerX = w * 0.22;
  const basePlayerY = h * 0.5;
  const baseMonsterX = w * 0.72;
  const baseMonsterY = h * 0.42;

  // Animation offsets
  let playerX = basePlayerX;
  let playerY = basePlayerY;
  let monsterX = baseMonsterX;
  let monsterY = baseMonsterY;
  let playerAlpha = 1;
  let monsterAlpha = 1;
  let shakeX = 0, shakeY = 0;
  let useAttackSprite = false;

  switch (animType) {
    case 'player-attack': {
      // Player lunges toward monster
      const lunge = progress < 0.35
        ? easeOut(progress / 0.35)
        : progress < 0.55 ? 1
        : 1 - easeOut((progress - 0.55) / 0.45);
      playerX += lunge * w * 0.18;
      useAttackSprite = progress > 0.15 && progress < 0.7;
      // Monster hit flash
      if (progress > 0.3 && progress < 0.65) {
        const flashT = (progress - 0.3) / 0.35;
        monsterAlpha = Math.sin(flashT * Math.PI * 3) > 0 ? 0.3 : 1;
      }
      break;
    }

    case 'player-defend': {
      // Player braces - slight backward shift
      const braceT = progress < 0.3 ? easeOut(progress / 0.3) : progress < 0.7 ? 1 : 1 - easeOut((progress - 0.7) / 0.3);
      playerX -= braceT * 8;
      break;
    }

    case 'player-skill': {
      // Player charges, then magic projectile flies
      if (progress < 0.25) {
        // Charge-up - slight float
        const chargeT = easeOut(progress / 0.25);
        playerY -= chargeT * 6;
      } else if (progress < 0.5) {
        playerY -= 6;
      } else {
        const returnT = easeOut((progress - 0.5) / 0.5);
        playerY -= 6 * (1 - returnT);
      }
      // Monster hit flash on impact
      if (progress > 0.45 && progress < 0.75) {
        const flashT = (progress - 0.45) / 0.3;
        monsterAlpha = Math.sin(flashT * Math.PI * 4) > 0 ? 0.25 : 1;
      }
      break;
    }

    case 'player-heal': {
      // Player glows - slight bob up
      const healT = progress < 0.3 ? easeOut(progress / 0.3) : progress < 0.7 ? 1 : 1 - easeOut((progress - 0.7) / 0.3);
      playerY -= healT * 8;
      break;
    }

    case 'monster-attack': {
      // Monster lunges toward player
      const lunge = progress < 0.35
        ? easeOut(progress / 0.35)
        : progress < 0.55 ? 1
        : 1 - easeOut((progress - 0.55) / 0.45);
      monsterX -= lunge * w * 0.18;
      // Player hit shake
      if (progress > 0.3 && progress < 0.75) {
        const shakeT = (progress - 0.3) / 0.45;
        shakeX = Math.sin(shakeT * Math.PI * 8) * 4 * (1 - shakeT);
        shakeY = Math.cos(shakeT * Math.PI * 6) * 3 * (1 - shakeT);
        playerAlpha = Math.sin(shakeT * Math.PI * 5) > 0 ? 0.5 : 1;
      }
      break;
    }

    case 'dodge': {
      // Monster lunges but player dodges
      const mLunge = progress < 0.4
        ? easeOut(progress / 0.4)
        : 1 - easeOut((progress - 0.4) / 0.6);
      monsterX -= mLunge * w * 0.15;
      // Player dodge - quick shift down and back
      const dodgeT = progress < 0.25
        ? easeOut(progress / 0.25)
        : progress < 0.6 ? 1
        : 1 - easeOut((progress - 0.6) / 0.4);
      playerY += dodgeT * 35;
      playerX -= dodgeT * 25;
      playerAlpha = 0.5 + (1 - dodgeT) * 0.5;
      break;
    }
  }

  // Apply screen shake
  const hasShake = shakeX !== 0 || shakeY !== 0;
  if (hasShake) {
    ctx.save();
    ctx.translate(shakeX, shakeY);
  }

  // Draw background
  drawBackground(ctx, location.bgKey, w, h);

  // Draw battle ground plane - subtle arena
  drawBattleArena(ctx, w, h);

  // Draw player
  const pBob = animType ? 0 : Math.sin(tick * 0.08) * 2;
  ctx.globalAlpha = playerAlpha;
  const playerSprite = useAttackSprite ? SPRITES.player.attack : SPRITES.player.idle;
  drawSpriteCentered(ctx, playerSprite, playerX, playerY + pBob, 4);
  ctx.globalAlpha = 1;

  // Draw monster
  const monsterSprite = SPRITES.monsters[battle.monster.sprite];
  if (monsterSprite) {
    const mBob = animType ? 0 : Math.sin(tick * 0.06 + 1) * 2;
    ctx.globalAlpha = monsterAlpha;
    drawSpriteCentered(ctx, monsterSprite, monsterX, monsterY + mBob, 4);
    ctx.globalAlpha = 1;
  }

  // Draw battle effects on top
  drawBattleEffects(ctx, w, h, animType, progress, playerX, playerY, monsterX, monsterY, tick, battle);

  if (hasShake) {
    ctx.restore();
  }
}

function drawBattleArena(ctx, w, h) {
  // Subtle ground highlight under the battle area
  const gradient = ctx.createLinearGradient(0, h * 0.65, 0, h * 0.72);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(w * 0.05, h * 0.65, w * 0.9, h * 0.07);

  // Ground line
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fillRect(w * 0.08, h * 0.68, w * 0.84, 1);
}

function drawBattleEffects(ctx, w, h, animType, progress, px, py, mx, my, tick, battle) {
  switch (animType) {
    case 'player-attack':
      drawSlashEffect(ctx, mx, my, progress);
      break;

    case 'player-defend':
      drawShieldEffect(ctx, px, py, progress);
      break;

    case 'player-skill':
      drawMagicEffect(ctx, px, py, mx, my, progress, w, h);
      break;

    case 'player-heal':
      drawHealEffect(ctx, px, py, progress);
      break;

    case 'monster-attack':
      drawImpactEffect(ctx, px, py, progress);
      break;

    case 'dodge':
      drawDodgeEffect(ctx, px, py, mx, my, progress);
      break;
  }
}

// ---- SLASH EFFECT (Player Attack) ----
function drawSlashEffect(ctx, mx, my, progress) {
  if (progress < 0.25 || progress > 0.75) return;

  const t = (progress - 0.25) / 0.5;
  const alpha = t < 0.3 ? t / 0.3 : 1 - ((t - 0.3) / 0.7);

  ctx.save();
  ctx.globalAlpha = alpha * 0.9;

  // Three diagonal slash lines
  const slashOffsets = [
    { x: -15, y: -20, angle: -0.6 },
    { x: 0, y: -8, angle: -0.5 },
    { x: 12, y: 4, angle: -0.7 },
  ];

  for (const slash of slashOffsets) {
    ctx.save();
    ctx.translate(mx + slash.x, my + slash.y);
    ctx.rotate(slash.angle);

    const len = 30 * easeOut(Math.min(1, t * 2));

    // Bright white core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -len / 2, 2, len);

    // Yellow glow
    ctx.fillStyle = 'rgba(255, 255, 100, 0.6)';
    ctx.fillRect(-3, -len / 2 - 2, 6, len + 4);

    ctx.restore();
  }

  // Impact sparks
  if (t > 0.2) {
    const sparkT = (t - 0.2) / 0.8;
    const sparkAlpha = 1 - sparkT;
    ctx.globalAlpha = sparkAlpha * 0.8;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + t * 3;
      const dist = sparkT * 25;
      const sx = mx + Math.cos(angle) * dist;
      const sy = my + Math.sin(angle) * dist;
      ctx.fillStyle = i % 2 === 0 ? '#fff' : '#ffd700';
      ctx.fillRect(sx - 1, sy - 1, 3, 3);
    }
  }

  ctx.restore();
}

// ---- SHIELD EFFECT (Defend) ----
function drawShieldEffect(ctx, px, py, progress) {
  const t = progress < 0.25 ? easeOut(progress / 0.25) : progress < 0.75 ? 1 : 1 - easeOut((progress - 0.75) / 0.25);

  ctx.save();
  ctx.globalAlpha = t * 0.7;

  // Shield shape - pixel art style shield outline
  const shieldX = px + 18;
  const shieldY = py - 10;
  const size = t * 20;

  // Outer glow
  ctx.fillStyle = 'rgba(100, 180, 255, 0.3)';
  ctx.fillRect(shieldX - size - 4, shieldY - size - 4, size * 2 + 8, size * 2 + 8);

  // Shield body
  ctx.fillStyle = 'rgba(60, 140, 255, 0.5)';
  ctx.fillRect(shieldX - size, shieldY - size, size * 2, size * 2);

  // Shield cross
  ctx.fillStyle = 'rgba(200, 230, 255, 0.7)';
  ctx.fillRect(shieldX - 2, shieldY - size + 3, 4, size * 2 - 6);
  ctx.fillRect(shieldX - size + 3, shieldY - 2, size * 2 - 6, 4);

  // Bright border
  ctx.fillStyle = 'rgba(180, 220, 255, 0.6)';
  // Top
  ctx.fillRect(shieldX - size, shieldY - size, size * 2, 2);
  // Bottom
  ctx.fillRect(shieldX - size, shieldY + size - 2, size * 2, 2);
  // Left
  ctx.fillRect(shieldX - size, shieldY - size, 2, size * 2);
  // Right
  ctx.fillRect(shieldX + size - 2, shieldY - size, 2, size * 2);

  // Pulse rings
  if (progress > 0.15 && progress < 0.85) {
    const pulseT = ((progress - 0.15) * 2) % 1;
    ctx.globalAlpha = (1 - pulseT) * 0.3;
    const ringSize = size + pulseT * 15;
    ctx.strokeStyle = '#88ccff';
    ctx.lineWidth = 2;
    ctx.strokeRect(shieldX - ringSize, shieldY - ringSize, ringSize * 2, ringSize * 2);
  }

  ctx.restore();
}

// ---- MAGIC EFFECT (Skill) ----
function drawMagicEffect(ctx, px, py, mx, my, progress, w, h) {
  ctx.save();

  // Phase 1: Magic circle at player (0-0.35)
  if (progress < 0.4) {
    const circleT = easeOut(Math.min(1, progress / 0.35));
    ctx.globalAlpha = circleT * 0.7;

    // Spinning magic circle
    const radius = circleT * 28;
    const angle = progress * 15;

    // Outer ring of dots
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + angle;
      const dotX = px + Math.cos(a) * radius;
      const dotY = py + Math.sin(a) * radius;
      ctx.fillStyle = i % 2 === 0 ? '#aa66ff' : '#6644ff';
      ctx.fillRect(dotX - 2, dotY - 2, 4, 4);
    }

    // Inner glow
    ctx.globalAlpha = circleT * 0.3;
    ctx.fillStyle = '#8844ff';
    const glowSize = radius * 0.7;
    ctx.fillRect(px - glowSize, py - glowSize, glowSize * 2, glowSize * 2);
  }

  // Phase 2: Projectile travels (0.25-0.55)
  if (progress > 0.2 && progress < 0.6) {
    const projT = easeInOut((progress - 0.2) / 0.4);
    const projX = px + (mx - px) * projT;
    const projY = py + (my - py) * projT;

    // Energy orb
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#bb88ff';
    ctx.fillRect(projX - 5, projY - 5, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(projX - 3, projY - 3, 6, 6);

    // Trail
    ctx.globalAlpha = 0.4;
    for (let i = 1; i <= 4; i++) {
      const trailT = Math.max(0, projT - i * 0.06);
      const trailX = px + (mx - px) * trailT;
      const trailY = py + (my - py) * trailT;
      ctx.fillStyle = `rgba(170, 100, 255, ${0.5 - i * 0.1})`;
      ctx.fillRect(trailX - 3 + i, trailY - 3 + i, 6 - i, 6 - i);
    }
  }

  // Phase 3: Impact explosion (0.45-1.0)
  if (progress > 0.45) {
    const impactT = (progress - 0.45) / 0.55;
    const alpha = impactT < 0.3 ? impactT / 0.3 : 1 - ((impactT - 0.3) / 0.7);

    // Explosion burst
    ctx.globalAlpha = alpha * 0.8;
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + impactT * 4;
      const dist = easeOut(impactT) * 35;
      const sx = mx + Math.cos(angle) * dist;
      const sy = my + Math.sin(angle) * dist;
      const size = 4 * (1 - impactT);
      ctx.fillStyle = i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#bb88ff' : '#6644ff';
      ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
    }

    // Central flash
    if (impactT < 0.3) {
      ctx.globalAlpha = (1 - impactT / 0.3) * 0.5;
      ctx.fillStyle = '#ffffff';
      const flashSize = 20 * (1 - impactT / 0.3);
      ctx.fillRect(mx - flashSize, my - flashSize, flashSize * 2, flashSize * 2);
    }
  }

  ctx.restore();
}

// ---- HEAL EFFECT (Potion) ----
function drawHealEffect(ctx, px, py, progress) {
  ctx.save();

  const t = progress;

  // Green glow around player
  const glowT = t < 0.3 ? easeOut(t / 0.3) : t < 0.7 ? 1 : 1 - easeOut((t - 0.7) / 0.3);
  ctx.globalAlpha = glowT * 0.25;
  ctx.fillStyle = '#44ff88';
  ctx.fillRect(px - 24, py - 28, 48, 56);

  // Rising heal particles
  ctx.globalAlpha = 1;
  for (let i = 0; i < 10; i++) {
    const particleDelay = i * 0.08;
    const pt = Math.max(0, t - particleDelay);
    if (pt <= 0 || pt > 0.8) continue;

    const normalT = pt / 0.8;
    const alpha = normalT < 0.2 ? normalT / 0.2 : 1 - ((normalT - 0.2) / 0.8);
    ctx.globalAlpha = alpha * 0.85;

    const xOffset = Math.sin(i * 1.7 + normalT * 4) * 18;
    const yOffset = -normalT * 55;
    const particleX = px + xOffset;
    const particleY = py + yOffset;

    // Green plus signs
    ctx.fillStyle = i % 2 === 0 ? '#66ff99' : '#44dd77';
    ctx.fillRect(particleX - 1, particleY - 3, 2, 6);
    ctx.fillRect(particleX - 3, particleY - 1, 6, 2);
  }

  // Flash pulse
  if (t > 0.2 && t < 0.5) {
    const flashT = (t - 0.2) / 0.3;
    ctx.globalAlpha = (1 - flashT) * 0.3;
    ctx.fillStyle = '#88ffaa';
    const flashSize = 30 + flashT * 15;
    ctx.fillRect(px - flashSize, py - flashSize, flashSize * 2, flashSize * 2);
  }

  ctx.restore();
}

// ---- IMPACT EFFECT (Monster Attack) ----
function drawImpactEffect(ctx, px, py, progress) {
  if (progress < 0.3 || progress > 0.8) return;

  const t = (progress - 0.3) / 0.5;
  ctx.save();

  // Red impact flash
  if (t < 0.3) {
    ctx.globalAlpha = (1 - t / 0.3) * 0.4;
    ctx.fillStyle = '#ff2222';
    const flashSize = 25;
    ctx.fillRect(px - flashSize, py - flashSize, flashSize * 2, flashSize * 2);
  }

  // Impact sparks radiating from player
  ctx.globalAlpha = (1 - t) * 0.9;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + t * 2;
    const dist = easeOut(t) * 30;
    const sx = px + Math.cos(angle) * dist;
    const sy = py + Math.sin(angle) * dist;
    const size = 3 * (1 - t);
    ctx.fillStyle = i % 2 === 0 ? '#ff6644' : '#ffaa33';
    ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
  }

  // Hit lines radiating outward
  if (t < 0.5) {
    ctx.globalAlpha = (1 - t * 2) * 0.6;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.4;
      const innerDist = 8;
      const outerDist = 8 + easeOut(t * 2) * 20;
      const x1 = px + Math.cos(angle) * innerDist;
      const y1 = py + Math.sin(angle) * innerDist;
      const x2 = px + Math.cos(angle) * outerDist;
      const y2 = py + Math.sin(angle) * outerDist;
      ctx.strokeStyle = '#ffcc44';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ---- DODGE EFFECT ----
function drawDodgeEffect(ctx, px, py, mx, my, progress) {
  ctx.save();

  // Afterimage of player at original position
  if (progress > 0.1 && progress < 0.6) {
    const ghostT = (progress - 0.1) / 0.5;
    ctx.globalAlpha = (1 - ghostT) * 0.3;
    drawSpriteCentered(ctx, SPRITES.player.idle, px + 25, py - 35, 4);
  }

  // "MISS" text near where monster struck
  if (progress > 0.35 && progress < 0.9) {
    const missT = (progress - 0.35) / 0.55;
    ctx.globalAlpha = missT < 0.2 ? missT / 0.2 : 1 - ((missT - 0.2) / 0.8);
    ctx.font = 'bold 18px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffcc00';
    ctx.textAlign = 'center';
    const missY = py - 50 - missT * 25;
    ctx.fillText('MISS', px + 20, missY);
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillText('MISS', px + 22, missY + 2);
    // Draw text again on top for clarity
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('MISS', px + 20, missY);
  }

  // Speed lines behind player dodge direction
  if (progress > 0.15 && progress < 0.55) {
    const lineT = (progress - 0.15) / 0.4;
    ctx.globalAlpha = (1 - lineT) * 0.5;
    ctx.strokeStyle = '#aaccff';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const lineY = py - 15 + i * 10;
      const lineLen = 15 + i * 5;
      ctx.beginPath();
      ctx.moveTo(px + 15 + lineT * 10, lineY);
      ctx.lineTo(px + 15 + lineLen + lineT * 20, lineY);
      ctx.stroke();
    }
  }

  ctx.restore();
}
