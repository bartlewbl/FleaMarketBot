// Main game engine: state management, rendering, combat, UI

const Game = {
  // ---- STATE ----
  canvas: null,
  ctx: null,
  currentScreen: 'menu',
  animFrame: 0,
  animTimer: 0,

  player: {
    name: 'Hero',
    level: 1,
    exp: 0,
    expToLevel: 50,
    maxHp: 50,
    hp: 50,
    baseAtk: 5,
    baseDef: 2,
    gold: 30,
    equipment: {
      weapon: null,
      shield: null,
      helmet: null,
      armor: null,
      boots: null,
      accessory: null,
    },
    inventory: [],
    maxInventory: 20,
  },

  battle: {
    monster: null,
    isPlayerTurn: true,
    log: [],
    defending: false,
    poisonTurns: 0,
    atkDebuff: 0,
    defDebuff: 0,
    rewards: null,
    turnAnimating: false,
  },

  currentLocation: null,
  exploreSteps: 0,

  // ---- COMPUTED STATS ----
  getPlayerAtk() {
    let atk = this.player.baseAtk;
    for (const slot of Object.values(this.player.equipment)) {
      if (slot) atk += (slot.atk || 0);
    }
    return Math.max(1, atk - this.battle.atkDebuff);
  },

  getPlayerDef() {
    let def = this.player.baseDef;
    for (const slot of Object.values(this.player.equipment)) {
      if (slot) def += (slot.def || 0);
    }
    return Math.max(0, def - this.battle.defDebuff);
  },

  // ---- INIT ----
  init() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.gameLoop();
  },

  // ---- GAME LOOP ----
  gameLoop() {
    this.animTimer++;
    if (this.animTimer % 30 === 0) this.animFrame++;
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  },

  // ---- RENDERING ----
  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    switch (this.currentScreen) {
      case 'menu':
        this._renderMenu(ctx, w, h);
        break;
      case 'town':
        Sprites.drawBackground(ctx, 'town', w, h);
        Sprites.drawCentered(ctx, Sprites.player.idle, w / 2, h * 0.55, 4);
        break;
      case 'locations':
        Sprites.drawBackground(ctx, 'town', w, h);
        break;
      case 'explore':
        if (this.currentLocation) {
          Sprites.drawBackground(ctx, this.currentLocation.bgKey, w, h);
          // Player walking animation
          const bobY = Math.sin(this.animTimer * 0.1) * 2;
          Sprites.drawCentered(ctx, Sprites.player.idle, w * 0.25, h * 0.55 + bobY, 3);
        }
        break;
      case 'battle':
        this._renderBattle(ctx, w, h);
        break;
      case 'battle-result':
        if (this.currentLocation) {
          Sprites.drawBackground(ctx, this.currentLocation.bgKey, w, h);
        }
        break;
      case 'inventory':
        Sprites.drawBackground(ctx, 'town', w, h);
        break;
      case 'shop':
        Sprites.drawBackground(ctx, 'town', w, h);
        break;
    }
  },

  _renderMenu(ctx, w, h) {
    // Dark background with subtle pattern
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    // Decorative pixel pattern
    ctx.fillStyle = '#111128';
    for (let x = 0; x < w; x += 16) {
      for (let y = 0; y < h; y += 16) {
        if ((x + y) % 32 === 0) {
          ctx.fillRect(x, y, 8, 8);
        }
      }
    }

    // Draw player character
    Sprites.drawCentered(ctx, Sprites.player.idle, w / 2, h * 0.45, 5);

    // Draw some monsters around
    Sprites.drawCentered(ctx, Sprites.monsters.slime, w * 0.2, h * 0.5, 3);
    Sprites.drawCentered(ctx, Sprites.monsters.skeleton, w * 0.8, h * 0.48, 3);
    Sprites.drawCentered(ctx, Sprites.monsters.dragon, w * 0.65, h * 0.4, 2);
    Sprites.drawCentered(ctx, Sprites.monsters.bat, w * 0.35, h * 0.35, 2);
  },

  _renderBattle(ctx, w, h) {
    if (!this.currentLocation || !this.battle.monster) return;

    Sprites.drawBackground(ctx, this.currentLocation.bgKey, w, h);

    // Player (left side)
    const playerSprite = this.battle.turnAnimating && !this.battle.isPlayerTurn
      ? Sprites.player.attack
      : Sprites.player.idle;
    const pBob = Math.sin(this.animTimer * 0.08) * 2;
    Sprites.drawCentered(ctx, playerSprite, w * 0.2, h * 0.45 + pBob, 4);

    // Player HP bar under sprite
    this._drawEntityBar(ctx, w * 0.2 - 30, h * 0.58, 60, this.player.hp, this.player.maxHp, '#4caf50');

    // Monster (right side)
    const monsterSprite = Sprites.monsters[this.battle.monster.sprite];
    if (monsterSprite) {
      const mBob = Math.sin(this.animTimer * 0.06 + 1) * 2;
      const mShake = this.battle.turnAnimating && this.battle.isPlayerTurn ? (Math.random() - 0.5) * 6 : 0;
      Sprites.drawCentered(ctx, monsterSprite, w * 0.7 + mShake, h * 0.4 + mBob, 4);
    }
  },

  _drawEntityBar(ctx, x, y, width, current, max, color) {
    ctx.fillStyle = '#222';
    ctx.fillRect(x, y, width, 6);
    const pct = Math.max(0, current / max);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width * pct, 6);
    ctx.strokeStyle = '#555';
    ctx.strokeRect(x, y, width, 6);
  },

  // ---- SCREEN MANAGEMENT ----
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById('screen-' + screenId);
    if (screen) screen.classList.add('active');
    this.currentScreen = screenId;

    const topBar = document.getElementById('top-bar');
    if (screenId === 'menu') {
      topBar.classList.remove('visible');
    } else {
      topBar.classList.add('visible');
      this.updateTopBar();
    }
  },

  updateTopBar() {
    document.getElementById('player-name').textContent = this.player.name;
    document.getElementById('player-level').textContent = 'Lv. ' + this.player.level;

    const hpPct = (this.player.hp / this.player.maxHp) * 100;
    document.getElementById('hp-fill').style.width = hpPct + '%';
    document.getElementById('hp-text').textContent = this.player.hp + '/' + this.player.maxHp;

    const expPct = (this.player.exp / this.player.expToLevel) * 100;
    document.getElementById('exp-fill').style.width = expPct + '%';
    document.getElementById('exp-text').textContent = this.player.exp + '/' + this.player.expToLevel;

    document.getElementById('gold-amount').textContent = this.player.gold;
  },

  showMessage(text, duration) {
    const overlay = document.getElementById('message-overlay');
    const msgText = document.getElementById('message-text');
    msgText.textContent = text;
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('hidden'), duration || 1500);
  },

  // ---- GAME START ----
  startGame() {
    this.player = {
      name: 'Hero',
      level: 1,
      exp: 0,
      expToLevel: Data.expForLevel(1),
      maxHp: 50,
      hp: 50,
      baseAtk: 5,
      baseDef: 2,
      gold: 30,
      equipment: {
        weapon: null,
        shield: null,
        helmet: null,
        armor: null,
        boots: null,
        accessory: null,
      },
      inventory: [],
      maxInventory: 20,
    };
    this.goToTown();
  },

  // ---- TOWN ----
  goToTown() {
    this.currentLocation = null;
    this.showScreen('town');
  },

  restAtInn() {
    if (this.player.gold < 10) {
      this.showMessage('Not enough gold! (10g needed)');
      return;
    }
    this.player.gold -= 10;
    this.player.hp = this.player.maxHp;
    this.updateTopBar();
    this.showMessage('Rested at the inn. HP restored!');
  },

  // ---- LOCATIONS ----
  openLocations() {
    const list = document.getElementById('location-list');
    list.innerHTML = '';

    Data.locations.forEach(loc => {
      const locked = this.player.level < loc.levelReq;
      const div = document.createElement('div');
      div.className = 'location-item' + (locked ? ' locked' : '');
      div.innerHTML = `
        <div>
          <div class="location-name">${loc.name}</div>
          <div class="location-level">${loc.description}</div>
        </div>
        <div class="location-level">Lv. ${loc.levelReq}+</div>
      `;
      if (!locked) {
        div.onclick = () => this.enterLocation(loc);
      }
      list.appendChild(div);
    });

    this.showScreen('locations');
  },

  enterLocation(location) {
    this.currentLocation = location;
    this.exploreSteps = 0;
    this.showScreen('explore');
    document.getElementById('explore-location-name').textContent = location.name;
    document.getElementById('explore-text').textContent = 'You enter ' + location.name + '...';
  },

  // ---- EXPLORATION ----
  exploreStep() {
    this.exploreSteps++;
    const loc = this.currentLocation;

    // Random exploration text
    const texts = Data.exploreTexts[loc.bgKey] || Data.exploreTexts.forest;
    const text = texts[Math.floor(Math.random() * texts.length)];

    // Check for encounter
    if (Math.random() < loc.encounterRate) {
      const monsterId = loc.monsters[Math.floor(Math.random() * loc.monsters.length)];
      document.getElementById('explore-text').textContent = text + '\n\nA monster appears!';
      setTimeout(() => this.startBattle(monsterId), 800);
    } else {
      document.getElementById('explore-text').textContent = text;
      // Small chance to find gold
      if (Math.random() < 0.2) {
        const found = Math.floor(3 + Math.random() * this.player.level * 2);
        this.player.gold += found;
        document.getElementById('explore-text').textContent = text + '\n\nYou found ' + found + ' gold!';
        this.updateTopBar();
      }
    }
  },

  // ---- BATTLE SYSTEM ----
  startBattle(monsterId) {
    const areaLevel = this.currentLocation.levelReq;
    const monster = Data.scaleMonster(monsterId, areaLevel);

    this.battle = {
      monster: monster,
      isPlayerTurn: true,
      log: [],
      defending: false,
      poisonTurns: 0,
      atkDebuff: 0,
      defDebuff: 0,
      rewards: null,
      turnAnimating: false,
    };

    this._addBattleLog('A ' + monster.name + ' appears!', 'info');
    this.showScreen('battle');
    this._updateBattleUI();
  },

  battleAction(action) {
    if (!this.battle.isPlayerTurn || this.battle.turnAnimating) return;

    const monster = this.battle.monster;
    this.battle.defending = false;

    switch (action) {
      case 'attack': {
        this.battle.turnAnimating = true;
        const dmg = this._calcDamage(this.getPlayerAtk(), monster.def);
        monster.hp = Math.max(0, monster.hp - dmg);
        this._addBattleLog('You attack for ' + dmg + ' damage!', 'dmg-monster');
        setTimeout(() => {
          this.battle.turnAnimating = false;
          this._afterPlayerAction();
        }, 400);
        break;
      }

      case 'defend':
        this.battle.defending = true;
        this._addBattleLog('You brace for impact!', 'info');
        this._afterPlayerAction();
        break;

      case 'skill': {
        // Power Strike - 1.5x damage
        this.battle.turnAnimating = true;
        const dmg = this._calcDamage(Math.floor(this.getPlayerAtk() * 1.5), monster.def);
        monster.hp = Math.max(0, monster.hp - dmg);
        this._addBattleLog('Power Strike hits for ' + dmg + ' damage!', 'dmg-monster');
        setTimeout(() => {
          this.battle.turnAnimating = false;
          this._afterPlayerAction();
        }, 400);
        break;
      }

      case 'potion': {
        const potion = this.player.inventory.find(i => i.type === 'potion');
        if (!potion) {
          this.showMessage('No potions!');
          return;
        }
        const healed = Math.min(potion.healAmount, this.player.maxHp - this.player.hp);
        this.player.hp += healed;
        this.player.inventory = this.player.inventory.filter(i => i.id !== potion.id);
        this._addBattleLog('Used ' + potion.name + ', healed ' + healed + ' HP!', 'heal');
        this._afterPlayerAction();
        break;
      }

      case 'run': {
        if (Math.random() < 0.5) {
          this._addBattleLog('You fled successfully!', 'info');
          setTimeout(() => {
            this.showScreen('explore');
            document.getElementById('explore-text').textContent = 'You escaped the battle...';
          }, 600);
        } else {
          this._addBattleLog('Failed to escape!', 'info');
          this._afterPlayerAction();
        }
        break;
      }
    }

    this._updateBattleUI();
  },

  _afterPlayerAction() {
    const monster = this.battle.monster;

    // Check if monster is dead
    if (monster.hp <= 0) {
      this._battleVictory();
      return;
    }

    // Monster turn
    this.battle.isPlayerTurn = false;
    setTimeout(() => this._monsterTurn(), 500);
  },

  _monsterTurn() {
    const monster = this.battle.monster;

    // Pick action: regular attack or skill
    let useSkill = monster.skills.length > 0 && Math.random() < 0.3;
    let skillId = useSkill ? monster.skills[Math.floor(Math.random() * monster.skills.length)] : null;
    let skill = skillId ? Data.skills[skillId] : null;

    if (skill) {
      const rawDmg = Math.floor(monster.atk * skill.multiplier);
      let dmg = this._calcDamage(rawDmg, this.getPlayerDef());
      if (this.battle.defending) dmg = Math.floor(dmg * 0.5);

      this.player.hp = Math.max(0, this.player.hp - dmg);
      this._addBattleLog(monster.name + ' uses ' + skill.name + ' for ' + dmg + ' damage!', 'dmg-player');

      // Apply effects
      if (skill.effect === 'poison') {
        this.battle.poisonTurns = 3;
        this._addBattleLog('You are poisoned!', 'dmg-player');
      } else if (skill.effect === 'lower_def') {
        this.battle.defDebuff += 2;
        this._addBattleLog('Your defense dropped!', 'dmg-player');
      } else if (skill.effect === 'lower_atk') {
        this.battle.atkDebuff += 2;
        this._addBattleLog('Your attack dropped!', 'dmg-player');
      } else if (skill.effect === 'steal_gold') {
        const stolen = Math.floor(Math.random() * 10 + 1);
        this.player.gold = Math.max(0, this.player.gold - stolen);
        this._addBattleLog('Stole ' + stolen + ' gold from you!', 'dmg-player');
      }
    } else {
      let dmg = this._calcDamage(monster.atk, this.getPlayerDef());
      if (this.battle.defending) dmg = Math.floor(dmg * 0.5);
      this.player.hp = Math.max(0, this.player.hp - dmg);
      this._addBattleLog(monster.name + ' attacks for ' + dmg + ' damage!', 'dmg-player');
    }

    // Apply poison
    if (this.battle.poisonTurns > 0) {
      const poisonDmg = Math.floor(this.player.maxHp * 0.05);
      this.player.hp = Math.max(0, this.player.hp - poisonDmg);
      this.battle.poisonTurns--;
      this._addBattleLog('Poison deals ' + poisonDmg + ' damage!', 'dmg-player');
    }

    this._updateBattleUI();
    this.updateTopBar();

    // Check player death
    if (this.player.hp <= 0) {
      this._battleDefeat();
      return;
    }

    this.battle.isPlayerTurn = true;
  },

  _calcDamage(atk, def) {
    const base = Math.max(1, atk - def * 0.5);
    const variance = 0.85 + Math.random() * 0.3;
    return Math.max(1, Math.floor(base * variance));
  },

  _battleVictory() {
    const monster = this.battle.monster;
    const expGain = monster.exp;
    const goldGain = monster.gold;
    this.player.exp += expGain;
    this.player.gold += goldGain;

    // Item drops
    let droppedItem = null;
    if (monster.dropTable && monster.dropTable.length > 0) {
      const totalWeight = monster.dropTable.reduce((s, d) => s + d.weight, 0);
      // ~40% chance to get a drop
      if (Math.random() * 100 < totalWeight) {
        const drop = Data._pickWeighted(monster.dropTable);
        droppedItem = Data.generateItem(drop.type, monster.level);
        if (droppedItem && this.player.inventory.length < this.player.maxInventory) {
          this.player.inventory.push(droppedItem);
        } else {
          droppedItem = null;
        }
      }
    }

    // Check level up
    let leveledUp = false;
    let newStats = null;
    while (this.player.exp >= this.player.expToLevel) {
      this.player.exp -= this.player.expToLevel;
      this.player.level++;
      this.player.expToLevel = Data.expForLevel(this.player.level);

      // Stat increases
      const hpGain = 8 + Math.floor(Math.random() * 5);
      const atkGain = 1 + Math.floor(Math.random() * 2);
      const defGain = 1 + Math.floor(Math.random() * 2);
      this.player.maxHp += hpGain;
      this.player.hp = this.player.maxHp;
      this.player.baseAtk += atkGain;
      this.player.baseDef += defGain;

      leveledUp = true;
      newStats = { hpGain, atkGain, defGain };
    }

    // Show result screen
    const resultTitle = document.getElementById('result-title');
    resultTitle.textContent = 'VICTORY!';
    resultTitle.style.color = '#4caf50';

    let rewardsHtml = `+${expGain} EXP<br>+${goldGain} Gold`;
    if (droppedItem) {
      rewardsHtml += `<br><span class="${droppedItem.rarityClass}">Got: ${droppedItem.name} [${droppedItem.rarity}]</span>`;
    }
    document.getElementById('result-rewards').innerHTML = rewardsHtml;

    const levelUpDiv = document.getElementById('result-levelup');
    if (leveledUp) {
      levelUpDiv.classList.remove('hidden');
      levelUpDiv.innerHTML = `LEVEL UP! Lv.${this.player.level}<br>HP+${newStats.hpGain} ATK+${newStats.atkGain} DEF+${newStats.defGain}`;
    } else {
      levelUpDiv.classList.add('hidden');
    }

    this.updateTopBar();
    this.showScreen('battle-result');
  },

  _battleDefeat() {
    // Lose some gold, restore HP partially
    const goldLost = Math.floor(this.player.gold * 0.2);
    this.player.gold -= goldLost;
    this.player.hp = Math.floor(this.player.maxHp * 0.3);

    const resultTitle = document.getElementById('result-title');
    resultTitle.textContent = 'DEFEATED...';
    resultTitle.style.color = '#f44336';

    document.getElementById('result-rewards').innerHTML = `Lost ${goldLost} gold...<br>You barely escaped with your life.`;
    document.getElementById('result-levelup').classList.add('hidden');

    document.getElementById('result-continue-btn').textContent = 'Return to Town';
    this.battle.rewards = { defeated: true };
    this.updateTopBar();
    this.showScreen('battle-result');
  },

  continueAfterBattle() {
    document.getElementById('result-continue-btn').textContent = 'Continue';
    if (this.battle.rewards && this.battle.rewards.defeated) {
      this.goToTown();
    } else {
      this.showScreen('explore');
      document.getElementById('explore-text').textContent = 'You continue exploring ' + this.currentLocation.name + '...';
    }
    // Reset debuffs
    this.battle.atkDebuff = 0;
    this.battle.defDebuff = 0;
    this.battle.poisonTurns = 0;
  },

  _addBattleLog(text, cssClass) {
    this.battle.log.push({ text, cssClass });
    const log = document.getElementById('battle-log');
    const line = document.createElement('div');
    line.className = cssClass || '';
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  },

  _updateBattleUI() {
    const monster = this.battle.monster;
    if (!monster) return;

    document.getElementById('monster-name').textContent = monster.name + ' (Lv.' + monster.level + ')';
    const mHpPct = (monster.hp / monster.maxHp) * 100;
    document.getElementById('monster-hp-fill').style.width = mHpPct + '%';
    document.getElementById('monster-hp-text').textContent = monster.hp + '/' + monster.maxHp;
    this.updateTopBar();
  },

  // ---- INVENTORY ----
  openInventory() {
    this._renderInventoryScreen();
    this.showScreen('inventory');
  },

  _renderInventoryScreen() {
    // Equipment slots
    const eqDiv = document.getElementById('equipment-slots');
    eqDiv.innerHTML = '';
    const slotNames = { weapon: 'Weapon', shield: 'Shield', helmet: 'Helmet', armor: 'Armor', boots: 'Boots', accessory: 'Accessory' };

    for (const [slot, label] of Object.entries(slotNames)) {
      const item = this.player.equipment[slot];
      const div = document.createElement('div');
      div.className = 'equip-slot';
      div.innerHTML = `
        <div class="equip-slot-label">${label}</div>
        <div class="equip-slot-item ${item ? item.rarityClass : ''}">${item ? item.name : '-- Empty --'}</div>
        ${item ? `<div class="equip-slot-stats">${item.atk ? 'ATK+' + item.atk : ''} ${item.def ? 'DEF+' + item.def : ''}</div>` : ''}
      `;
      if (item) {
        const unequipBtn = document.createElement('button');
        unequipBtn.className = 'btn';
        unequipBtn.style.fontSize = '7px';
        unequipBtn.style.padding = '3px 6px';
        unequipBtn.style.marginTop = '3px';
        unequipBtn.textContent = 'Unequip';
        unequipBtn.onclick = () => this._unequipItem(slot);
        div.appendChild(unequipBtn);
      }
      eqDiv.appendChild(div);
    }

    // Inventory items
    const invDiv = document.getElementById('inventory-list');
    invDiv.innerHTML = '';

    if (this.player.inventory.length === 0) {
      invDiv.innerHTML = '<div style="font-size:8px;color:#666;padding:8px;">No items</div>';
    }

    this.player.inventory.forEach(item => {
      const div = document.createElement('div');
      div.className = 'inv-item';

      let statsText = '';
      if (item.slot) {
        if (item.atk) statsText += 'ATK+' + item.atk + ' ';
        if (item.def) statsText += 'DEF+' + item.def;
      } else {
        statsText = 'Heal ' + item.healAmount + ' HP';
      }

      div.innerHTML = `
        <div>
          <span class="inv-item-name ${item.rarityClass}">${item.name} [${item.rarity}]</span>
          <span class="inv-item-stats">${statsText}</span>
        </div>
        <div></div>
      `;

      const btnContainer = div.querySelector('div:last-child');

      if (item.slot) {
        const equipBtn = document.createElement('button');
        equipBtn.className = 'btn';
        equipBtn.textContent = 'Equip';
        equipBtn.onclick = () => this._equipItem(item);
        btnContainer.appendChild(equipBtn);
      } else {
        const useBtn = document.createElement('button');
        useBtn.className = 'btn';
        useBtn.textContent = 'Use';
        useBtn.onclick = () => this._useItem(item);
        btnContainer.appendChild(useBtn);
      }

      const sellBtn = document.createElement('button');
      sellBtn.className = 'btn btn-back';
      sellBtn.textContent = 'Sell ' + item.sellPrice + 'g';
      sellBtn.onclick = () => this._sellItem(item);
      btnContainer.appendChild(sellBtn);

      invDiv.appendChild(div);
    });

    // Player stats
    const statsDiv = document.getElementById('player-stats-display');
    statsDiv.innerHTML = `
      ATK: ${this.getPlayerAtk()} | DEF: ${this.getPlayerDef()} | Max HP: ${this.player.maxHp}<br>
      Level: ${this.player.level} | Items: ${this.player.inventory.length}/${this.player.maxInventory}
    `;
  },

  _equipItem(item) {
    const slot = item.slot;
    // Unequip current item in that slot
    if (this.player.equipment[slot]) {
      this.player.inventory.push(this.player.equipment[slot]);
    }
    // Equip new item
    this.player.equipment[slot] = item;
    this.player.inventory = this.player.inventory.filter(i => i.id !== item.id);
    this._renderInventoryScreen();
    this.updateTopBar();
  },

  _unequipItem(slot) {
    if (this.player.inventory.length >= this.player.maxInventory) {
      this.showMessage('Inventory full!');
      return;
    }
    const item = this.player.equipment[slot];
    if (item) {
      this.player.inventory.push(item);
      this.player.equipment[slot] = null;
      this._renderInventoryScreen();
      this.updateTopBar();
    }
  },

  _useItem(item) {
    if (item.type === 'potion') {
      const healed = Math.min(item.healAmount, this.player.maxHp - this.player.hp);
      if (healed === 0) {
        this.showMessage('HP is already full!');
        return;
      }
      this.player.hp += healed;
      this.player.inventory = this.player.inventory.filter(i => i.id !== item.id);
      this.showMessage('Healed ' + healed + ' HP!');
      this._renderInventoryScreen();
      this.updateTopBar();
    }
  },

  _sellItem(item) {
    this.player.gold += item.sellPrice;
    this.player.inventory = this.player.inventory.filter(i => i.id !== item.id);
    this.showMessage('Sold for ' + item.sellPrice + ' gold!');
    this._renderInventoryScreen();
    this.updateTopBar();
  },

  // ---- SHOP ----
  openShop() {
    const list = document.getElementById('shop-list');
    list.innerHTML = '';

    const shopItems = Data.getShopItems(this.player.level);
    shopItems.forEach(item => {
      const div = document.createElement('div');
      div.className = 'shop-item';
      div.innerHTML = `
        <div>
          <span class="shop-item-name">${item.name}</span>
          <span class="inv-item-stats"> - Heal ${item.healAmount} HP</span>
        </div>
        <div></div>
      `;
      const btnContainer = div.querySelector('div:last-child');
      const buyBtn = document.createElement('button');
      buyBtn.className = 'btn';
      buyBtn.textContent = 'Buy ' + item.buyPrice + 'g';
      buyBtn.onclick = () => this._buyItem(item);
      btnContainer.appendChild(buyBtn);
      list.appendChild(div);
    });

    this.showScreen('shop');
  },

  _buyItem(item) {
    if (this.player.gold < item.buyPrice) {
      this.showMessage('Not enough gold!');
      return;
    }
    if (this.player.inventory.length >= this.player.maxInventory) {
      this.showMessage('Inventory full!');
      return;
    }
    this.player.gold -= item.buyPrice;
    // Create a copy with new id
    const newItem = { ...item, id: Data._uid() };
    delete newItem.buyPrice;
    this.player.inventory.push(newItem);
    this.showMessage('Purchased ' + item.name + '!');
    this.updateTopBar();
  },
};

// Initialize on page load
window.addEventListener('load', () => Game.init());
