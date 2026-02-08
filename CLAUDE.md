# CLAUDE.md - Pixel Grind: Monster Hunter

## Project Overview

A pixel-art idle/RPG browser game with turn-based combat, character progression, skill trees, and multiplayer friend invites. Players hunt monsters across progressively dangerous locations, collect loot, manage inventory, and develop characters through class-specific skill trees.

## Tech Stack

- **Frontend:** React 19 + Vite 7.2
- **Backend:** Node.js + Express 5.2
- **Database:** SQLite3 (better-sqlite3) with WAL mode
- **Auth:** bcryptjs password hashing, UUID-based sessions
- **Styling:** CSS with pixel-art aesthetic (Press Start 2P font)
- **Language:** JavaScript (ES modules throughout)

## Commands

```bash
npm run dev          # Vite dev server only (port 5173)
npm run server       # Express backend only (port 3001)
npm run dev:full     # Both server + Vite dev in parallel
npm run build        # Production build (Vite)
npm run start        # Build then serve (production)
npm run lint         # ESLint check
npm run preview      # Preview production build
```

No test framework is configured.

## Project Structure

```
server/                     # Express backend
  index.js                  # App entry, CORS, middleware (port 3001)
  db.js                     # SQLite init, WAL mode, foreign keys
  routes/
    auth.js                 # Register, login, logout, session verify
    save.js                 # Game save/load (authenticated)
    invites.js              # Friend invite system

src/                        # React frontend
  main.jsx                  # React entry point
  App.jsx                   # Root component, routing, state init
  api.js                    # Fetch wrapper for all /api calls
  index.css                 # Global styles
  components/
    GameCanvas.jsx          # 640x480 canvas background renderer
    SidePanel.jsx           # Left collapsible menu
    RightPanel.jsx          # Friends/status panel
    CharacterDock.jsx       # Character display widget
    screens/                # All game screens (15 components)
      AuthScreen.jsx        # Login/Register
      UsernameScreen.jsx    # Character name entry
      ClassSelectScreen.jsx # Class picker
      TownScreen.jsx        # Main hub (inn, navigate)
      LocationsScreen.jsx   # Location/zone selection
      ExploreScreen.jsx     # Exploration narrative
      BattleScreen.jsx      # Combat UI with floating damage
      BattleResultScreen.jsx # Victory/defeat summary
      BossConfirmScreen.jsx # Boss encounter confirmation
      InventoryScreen.jsx   # Item management & equipping
      ShopScreen.jsx        # Potion & featured gear shop
      SkillsScreen.jsx      # Skill tree UI
      ProfileScreen.jsx     # Character stats
      MenuScreen.jsx        # (unused/dead code)
  data/
    gameData.js             # All game constants (monsters, items, locations, skills)
    skillTrees.js           # 5 classes x 10 tiers of skills (100 skills total)
    sprites.js              # Pixel art sprite definitions
    randomConfig.js         # RNG configuration
  engine/                   # Pure game logic (no React dependencies)
    combat.js               # Damage calc, stat modifiers, dodge, pierce, execute
    passives.js             # Passive skill trigger system (attack, skill, turn-start, survival)
    skillEffects.js         # Data-driven effect registry (40+ handlers)
    loot.js                 # Item generation, shop logic
    scaling.js              # Monster/boss level scaling
    utils.js                # UID generation, weighted random picks
  hooks/
    useGameState.js         # Central game state reducer (~900 lines)

vite.config.js              # Vite config with /api proxy to :3001
eslint.config.js            # ESLint flat config (v9)
```

## Architecture

### Layered Separation of Concerns

1. **Data layer** (`src/data/`) — Static game constants and definitions. No logic.
2. **Engine layer** (`src/engine/`) — Pure functions for game mechanics. No React, no side effects. All inputs passed as arguments.
3. **State layer** (`src/hooks/useGameState.js`) — Single Redux-like reducer managing all game state. Dispatches actions, performs immutable updates.
4. **UI layer** (`src/components/`) — React presentation components. Receive state and dispatch from the hook.
5. **API layer** (`src/api.js`) — Thin fetch wrapper. All endpoints return JSON.
6. **Server layer** (`server/`) — Express routes with prepared SQLite statements.

### State Management

All game state flows through a single reducer in `useGameState.js`:

```javascript
// State shape
{
  screen,            // Current screen name (see Screen Flow below)
  player: {
    name,            // Character name
    characterClass,  // 'berserker' | 'warrior' | 'thief' | 'mage' | 'necromancer'
    level, exp, expToLevel,
    maxHp, hp, maxMana, mana,
    baseAtk, baseDef, gold,
    equipment,       // { weapon, shield, helmet, armor, boots, accessory }
    inventory,       // Array of item objects (max 20)
    maxInventory,    // 20
    skillTree,       // Array of unlocked skill IDs
  },
  battle: {          // null when not in combat
    monster,         // Scaled monster object
    isPlayerTurn,    // Boolean
    defending,       // Currently defending
    poisonTurns,     // Player poison duration
    atkDebuff, defDebuff,
    monsterPoisonTurns, monsterDoomTurns,
    undyingWillUsed, deathsEmbraceUsed,  // Once-per-battle flags
    defendedLastTurn, dodgeNextTurn, dodgeCharges,
    showSkillMenu, spellweaverActive,
    avatarTurns, armorBreakTurns, cursedBloodPoison,
  },
  battleLog,         // Array of { text, type } combat messages
  battleResult,      // Victory/defeat summary (null outside results)
  energy,            // 0-100 exploration energy
  lastEnergyUpdate,  // Timestamp for regen calculation
  currentLocation,   // Active zone object
  exploreText,       // Current exploration narrative
  message,           // UI toast/notification (auto-cleared)
  pendingBoss,       // Boss awaiting accept/decline
}
```

### Screen Flow

```
username-entry -> class-select -> town
                                   |-> locations -> explore -> battle -> battle-result -> explore
                                   |                        -> boss-confirm -> battle
                                   |-> inventory
                                   |-> shop
                                   |-> skills
                                   |-> profile
```

### Reducer Action Types

All 28 action types dispatched to `gameReducer`:

| Action | Payload | Description |
|--------|---------|-------------|
| `START_GAME` | — | Reset to initial state |
| `LOAD_SAVE` | `{ saveData }` | Restore saved game + regen energy |
| `SET_USERNAME` | `{ name }` | Set character name (min 2 chars) |
| `SELECT_CLASS` | `{ classId }` | Pick class, apply base stats |
| `GO_TO_TOWN` | — | Return to town, clear battle state |
| `SHOW_SCREEN` | `{ screen }` | Navigate to a screen |
| `ENTER_LOCATION` | `{ location }` | Spend 10 energy, enter explore |
| `EXPLORE_STEP` | — | Roll encounter/loot/gold/nothing |
| `BATTLE_PLAYER_ATTACK` | — | Normal attack + passives |
| `BATTLE_PLAYER_SKILL` | — | Class skill (costs mana) |
| `BATTLE_USE_TREE_SKILL` | `{ skillId }` | Skill tree active skill |
| `TOGGLE_SKILL_MENU` | — | Show/hide skill menu in battle |
| `BATTLE_DEFEND` | — | Brace (reduces damage) |
| `BATTLE_USE_POTION` | — | Use first potion in inventory |
| `BATTLE_RUN` | — | Attempt escape (50-100% chance) |
| `MONSTER_TURN` | — | Monster attack + DoT + passives |
| `BOSS_ACCEPT` | — | Start boss battle |
| `BOSS_DECLINE` | — | Retreat from boss |
| `CONTINUE_AFTER_BATTLE` | — | Leave battle result screen |
| `REST_AT_INN` | — | Full heal for 10 gold |
| `EQUIP_ITEM` | `{ item }` | Equip gear (swap if slot occupied) |
| `UNEQUIP_ITEM` | `{ slot }` | Move equipment to inventory |
| `USE_ITEM` | `{ item }` | Consume potion outside battle |
| `SELL_ITEM` | `{ item }` | Sell for item.sellPrice gold |
| `REORDER_INVENTORY` | `{ fromIndex, toIndex }` | Drag-reorder inventory |
| `BUY_ITEM` | `{ item }` | Purchase from shop |
| `UNLOCK_SKILL` | `{ skillId }` | Unlock skill tree node |
| `CLEAR_MESSAGE` | — | Dismiss toast notification |
| `ENERGY_TICK` | `{ now }` | Internal: periodic energy regen |

### Data-Driven Effect System

Skill effects use a registry pattern in `skillEffects.js`. New effects are added by registering a handler — no need to modify core battle logic:

```javascript
EFFECT_HANDLERS[effect_name] = (context) => ({ player, monster, battle, log });
```

**Effect categories (40+ handlers):**
- **Recoil:** `recoil_small` (5%), `recoil` (10%), `recoil_heavy` (20%), `recoil_extreme` (30%)
- **Enemy ATK reduction:** `war_cry` (25%), `weaken`/`weaken_15` (15%), `freeze` (20%), `frost_nova` (30%), `cheap_shot` (20%)
- **Enemy DEF reduction:** `shred_def` (40%), `quake` (30%), `chain_lightning` (25%)
- **Combined ATK+DEF reduction:** `blizzard` (15%/15%), `wither` (25%/25%)
- **Poison/DoT:** `apply_poison` (3t), `apply_poison_short` (2t), `strong_poison` (4t), `strong_poison_3` (3t), `doom` (3t)
- **Dodge grants:** `shadow_dance` (1 dodge), `shadow_dance_2` (2 dodges), `phantom_blade` (1 dodge)
- **Heal-on-hit:** `drain` (40%), `full_drain` (100%), `soul_harvest` (60%), `army_drain` (40%), `final_stand` (30%), `rally_heal` (20% max HP), `blood_nova` (25% heal - 10% recoil)
- **Mana effects:** `heroic_mana` (+5), `mana_refund` (50% refund)
- **Buffs/debuffs:** `armor_break` (DEF=0, 2t), `avatar` (+50% DEF, 3t)
- **Conditional:** `corpse_explode` (+50% if poisoned), `nec_apocalypse` (doom 4t + 30% heal)
- **No-op (handled in combat.js):** `true_damage`, `pierce_20`/`25`/`30`/`40`/`50`, `execute`, `execute_25`, `counter`, `shield_slam`

### Passive Skill System

Passives in `src/engine/passives.js` are triggered at specific battle phases:

**Post-attack passives** (`applyAttackPassives`):
- Necromancer Lifetap: heal 15% of damage dealt
- Vampiric Aura (`nec_t3a`): heal 10% of damage
- Soul Siphon (`nec_t1a`): 25% chance to restore 5 mana
- Bloodlust (`brs_t3a`): heal 20% of damage when below 30% HP
- Adrenaline Rush (`brs_t6a`): restore 3 mana per attack
- Necrotic Touch (`nec_t5a`): reduce enemy DEF by 1
- Opportunist (`thf_t6a`): +15% damage vs poisoned enemies

**Post-skill passives** (`applySkillPassives`): Vampiric Aura, Bloodlust, Soul Siphon

**Turn-start passives** (`applyTurnStartPassives`):
- Regeneration (`war_t6a`): heal 3% max HP
- Meditation (`mag_t5a`): restore 4 mana
- Mana Regeneration (`mag_t9a`): restore 8% max mana
- Dark Pact (`nec_t4a`): sacrifice 5% HP (tradeoff for +25% ATK)

**Damage reduction** (`applyDamageReduction`): Defend (50%), Fortify passive (70%), Bulwark (`war_t2a`, 85%), Iron Skin (`war_t1a`, -10%), Thick Skin (`brs_t5a`, -8%), Fortress (`war_t10a`, -20%)

**Mana Shield** (`applyManaShield`): 20% damage absorbed by mana (40% with `mag_t10a`)

**Dodge** (`checkDodge`): Shadow Step (`thf_t1a`, 15%), Evasion Mastery (`thf_t3a`, +10%), Aegis (`war_t4a`, 15% full block), plus guaranteed dodge from shadow dance charges

**Survival** (`applySurvivalPassives`): Undying Will (`brs_t2a`, survive at 1 HP once), Death's Embrace (`nec_t2a`, heal 15% when below 25% HP once)

**Other combat passives** (in `combat.js`):
- Blood Frenzy (`brs_t1a`): +3% ATK per 10% HP missing
- War Machine (`brs_t4a`): +15% ATK (+25% below 50% HP)
- Relentless (`brs_t9a`): +20% ATK above 80% HP
- Immortal Rage (`brs_t10a`): 2x ATK below 10% HP
- Arcane Overflow (`mag_t3a`): +1 ATK per 10 mana
- Spellweaver (`mag_t8a`): +50% ATK on normal attack after skill use
- Spell Echo (`mag_t2a`): 20% chance for 2x skill damage
- Mana Surge (`mag_t4a`): skills cost 25% less mana
- Lucky Strike (`thf_t4a`): 20% chance for 2x normal attack damage
- Blade Dance (`thf_t9a`): 10% chance for a second attack
- Cursed Blood (`nec_t8a`): 20% chance to poison attacker when hit

### Energy System

- **Max energy:** 100
- **Cost per exploration trip:** 10 energy
- **Regen rate:** 10% (10 energy) per 15-minute interval
- **Regen logic:** Calculated on-demand from `lastEnergyUpdate` timestamp, not real-time
- **Auto-tick:** `ENERGY_TICK` dispatched every 60 seconds via `setInterval`

### Auto-Save

- Debounced (500ms) auto-save to server on meaningful state changes
- Transient state (battle, battle-result, boss-confirm) saves as `town` screen
- Skips saving initial default state
- Silent fail on save errors (game continues locally)

## API Endpoints

All routes are prefixed with `/api`. Auth uses `x-session-id` header (UUID).

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account (username 2-20 chars, password 4+ chars) |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Verify session |
| POST | `/api/auth/logout` | Yes | End session |
| GET | `/api/save` | Yes | Load game save |
| POST | `/api/save` | Yes | Save game state (upsert) |
| DELETE | `/api/save` | Yes | Delete save (new game) |
| POST | `/api/invites/send` | Yes | Send friend invite (no self-invite, no duplicate) |
| GET | `/api/invites` | Yes | List received/sent invites & friends |
| POST | `/api/invites/:id/accept` | Yes | Accept invite |
| POST | `/api/invites/:id/decline` | Yes | Decline invite |

## Database Schema

SQLite with 4 tables:

- **users** — `id`, `username` (unique), `password_hash`, `created_at`
- **sessions** — `id` (UUID), `user_id` (FK), `created_at`
- **game_saves** — `id`, `user_id` (unique FK), `save_data` (JSON text), `updated_at`
- **invites** — `id`, `from_user_id`, `to_user_id`, `status` (pending/accepted/declined), `created_at`; unique constraint on (from, to)

All queries use prepared statements (`db.prepare()`) for safety and performance.

## Code Conventions

### Naming

- **Components:** PascalCase — `BattleScreen.jsx`, `GameCanvas.jsx`
- **Functions/hooks:** camelCase — `useGameState`, `calcDamage`
- **Constants:** UPPERCASE_SNAKE_CASE — `ENERGY_MAX`, `ANIM_MS`
- **Skill IDs:** `{class}_{tier}{choice}` — `brs_t1a`, `mag_t8a`
- **Monster IDs:** kebab-case — `alpha-rat`, `boss-king-rat`
- **Files:** PascalCase for components, camelCase for modules

### Patterns

- **Immutable state updates:** Always use spread operator (`{ ...state, field: value }`)
- **Early returns for validation:** `if (!condition) return state;`
- **Weighted random:** Use `pickWeighted(pool)` from `engine/utils.js`
- **Conditional spreads:** `{ ...player, mana: Math.min(maxMana, player.mana + restore) }`
- **Composition:** Engine functions compose into higher-level actions (damage -> passives -> effects -> victory check)
- **Damage formula:** `base = max(1, atk - def * 0.5)`, then variance `0.85-1.15`, minimum 1

### Adding New Content

- **New monster:** Add entry to `MONSTERS` in `src/data/gameData.js` with stats + skills + dropTable, add its ID to a location's `monsters` array
- **New item:** Add to relevant tier in `src/data/gameData.js` gear/potion tables
- **New skill:** Add node to class tree in `src/data/skillTrees.js`, implement effect handler in `src/engine/skillEffects.js` (or passive in `passives.js` / `combat.js`)
- **New screen:** Create component in `src/components/screens/`, add case to screen router in `App.jsx`, add navigation action to reducer
- **New API route:** Create route file in `server/routes/`, mount in `server/index.js`
- **New skill effect:** Add handler to `EFFECT_HANDLERS` in `src/engine/skillEffects.js` — no other files need changes

## Game Design Reference

### Classes (5)

| Class | Passive | Focus | Base HP | Base ATK | Base DEF | Base Mana |
|-------|---------|-------|---------|----------|----------|-----------|
| Berserker | Rage (+30% ATK below 40% HP) | High ATK, low DEF, HP scaling | 60 | 8 | 2 | 20 |
| Warrior | Fortify (70% block on defend) | Balanced, strong defense | 55 | 6 | 5 | 25 |
| Thief | Greed (+25% gold, 75% escape) | Dodge chance, gold bonus, speed | 45 | 7 | 3 | 25 |
| Mage | Arcane Mind (+40% skill damage) | High mana, true damage, fragile | 40 | 5 | 2 | 50 |
| Necromancer | Lifetap (heal 15% on attacks) | Lifesteal, poison, sustain | 50 | 6 | 3 | 35 |

### Locations (6)

| Location | Level | Encounter Rate | Monsters | Boss |
|----------|-------|---------------|----------|------|
| Neon Mile | 1 | 50% | 10 monsters | King Rat |
| Shadow Alley | 3 | 55% | 11 monsters | Shadow Lord |
| Metro Underpass | 6 | 60% | 11 monsters | The Conductor |
| Skyline Rooftops | 10 | 65% | 12 monsters | Storm Sentinel |
| Ironworks Yard | 14 | 70% | 12 monsters | Iron Titan |
| Midnight Terminal | 18 | 72% | 10 monsters | Void Overlord |

Each location has a 0.5% boss spawn rate per explore step.

### Skill Trees

10 tiers per class, 2 choices per tier (A/B), unlocked at levels 2, 4, 6, ... 20. Mix of passive stat boosts and active battle skills. 100 total skills across all classes. Previous tiers must be filled before unlocking later ones.

### Loot

| Rarity | Stat Multiplier | Drop Weight |
|--------|----------------|-------------|
| Common | 1.0x | 60% |
| Uncommon | 1.3x | 25% |
| Rare | 1.7x | 10% |
| Epic | 2.2x | 4% |
| Legendary | 3.0x | 1% |

6 gear slots (weapon, shield, helmet, armor, boots, accessory). 5 potion tiers (Small Medkit, Field Syringe, Combat Stims, Mega Infusion, Phoenix Serum). Daily featured shop items via seeded RNG.

### Battle Mechanics

- **Turn order:** Player -> Monster -> repeat
- **Actions:** Attack, Class Skill (mana), Tree Skills (mana), Defend, Potion, Run
- **Monster skills:** 30% chance per turn to use a skill (poison, lower_def, lower_atk, steal_gold, drain_hp)
- **Victory:** Gain exp + gold + chance for loot drop. Level up restores full HP/mana.
- **Defeat:** Lose 20% gold, respawn at 30% HP / 50% mana, return to town.

## Configuration

- **No `.env` file.** Port defaults to `process.env.PORT || 3001`.
- **Database path:** `game.db` in project root (gitignored).
- **Vite proxy:** `/api` requests forwarded to `http://localhost:3001` in dev.
- **Client storage:** `sessionId` and `username` in localStorage.

## Common Development Tasks

### Running locally

```bash
npm install
npm run dev:full    # Starts both backend and frontend
```

Frontend at `http://localhost:5173`, API at `http://localhost:3001`.

### Adding a new game feature

1. Define data constants in `src/data/`
2. Implement pure logic in `src/engine/`
3. Add reducer actions in `src/hooks/useGameState.js`
4. Create UI component in `src/components/screens/`
5. Wire screen routing in `App.jsx`

### Adding a new API endpoint

1. Create or extend route file in `server/routes/`
2. Add prepared statements for any new queries
3. Mount route in `server/index.js`
4. Add client function in `src/api.js`
