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
    screens/                # All game screens (~19 components)
      AuthScreen.jsx        # Login/Register
      TownScreen.jsx        # Main hub
      BattleScreen.jsx      # Combat UI with floating damage
      InventoryScreen.jsx   # Item management & equipping
      ShopScreen.jsx        # Potion & featured gear shop
      SkillsScreen.jsx      # Skill tree UI
      LocationsScreen.jsx   # Location/zone selection
      ExploreScreen.jsx     # Exploration narrative
      ProfileScreen.jsx     # Character stats
      ClassSelectScreen.jsx # Class picker
      ...
  data/
    gameData.js             # All game constants (monsters, items, locations)
    skillTrees.js           # 5 classes x 10 tiers of skills
    sprites.js              # Pixel art sprite definitions
    randomConfig.js         # RNG configuration
  engine/                   # Pure game logic (no React dependencies)
    combat.js               # Damage calculation, stat modifiers
    passives.js             # Passive skill trigger system
    skillEffects.js         # Data-driven effect registry
    loot.js                 # Item generation, shop logic
    scaling.js              # Monster/boss level scaling
    utils.js                # UID generation, weighted random picks
  hooks/
    useGameState.js         # Central game state reducer (~1500 lines)

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
  screen,          // Current screen name
  player,          // Stats, equipment, inventory, skillTree
  battle,          // Active combat state
  battleLog,       // Combat message history
  energy,          // 0-100 exploration energy
  currentLocation, // Active zone
  message          // UI toast/notification
}
```

Actions are dispatched as `{ type: 'ACTION_NAME', ...payload }`. Each action is a case in the reducer with immutable spread-based updates.

### Data-Driven Effect System

Skill effects use a registry pattern in `skillEffects.js`. New effects are added by registering a handler — no need to modify core battle logic:

```javascript
EFFECT_HANDLERS[effect_name] = (state, params) => newState;
```

## API Endpoints

All routes are prefixed with `/api`. Auth uses `x-session-id` header (UUID).

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Verify session |
| POST | `/api/auth/logout` | Yes | End session |
| GET | `/api/save` | Yes | Load game save |
| POST | `/api/save` | Yes | Save game state |
| DELETE | `/api/save` | Yes | Delete save (new game) |
| POST | `/api/invites/send` | Yes | Send friend invite |
| GET | `/api/invites` | Yes | List invites & friends |
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
- **Files:** PascalCase for components, camelCase for modules

### Patterns

- **Immutable state updates:** Always use spread operator (`{ ...state, field: value }`)
- **Early returns for validation:** `if (!condition) return state;`
- **Weighted random:** Use `pickWeighted(pool)` from `engine/utils.js`
- **Conditional spreads:** `{ ...player, mana: Math.min(maxMana, player.mana + restore) }`
- **Composition:** Engine functions compose into higher-level actions (damage -> passives -> effects -> victory check)

### Adding New Content

- **New monster:** Add entry to `MONSTERS` in `src/data/gameData.js` with stats + location
- **New item:** Add to relevant tier in `src/data/gameData.js` gear/potion tables
- **New skill:** Add node to class tree in `src/data/skillTrees.js`, implement effect handler in `src/engine/skillEffects.js`
- **New screen:** Create component in `src/components/screens/`, add case to screen router in `App.jsx`, add navigation action to reducer
- **New API route:** Create route file in `server/routes/`, mount in `server/index.js`

## Game Design Reference

### Classes (5)

| Class | Focus |
|-------|-------|
| Berserker | High ATK, low DEF, HP scaling |
| Warrior | Balanced, strong defense |
| Thief | Dodge chance, gold bonus, speed |
| Mage | High mana, true damage, fragile |
| Necromancer | Lifesteal, poison, sustain |

### Locations (6)

Neon Mile (Lv1) -> Shadow Alley (Lv3) -> Metro Underpass (Lv6) -> Skyline Rooftops (Lv10) -> Ironworks Yard (Lv14) -> Midnight Terminal (Lv18)

Each location has unique monsters + 1 boss (0.5% spawn rate).

### Skill Trees

10 tiers per class, 2 choices per tier (A/B), unlocked at levels 2, 4, 6, ... 20. Mix of passive stat boosts and active battle skills.

### Loot

5 rarity tiers (Common -> Legendary), 6 gear slots (weapon, shield, helmet, armor, boots, accessory), daily featured shop items via seeded RNG.

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
