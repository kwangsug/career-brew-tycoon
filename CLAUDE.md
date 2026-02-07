# CLAUDE.md — Career Brew Tycoon

## Project Overview

Career Brew Tycoon is a coffee-themed incremental/clicker game. Players click to earn coffee beans, purchase upgrades for passive and active production, progress through 15 career ranks (Intern → The Coffee God), and compete on real-time global leaderboards. The app supports English, Japanese, and Korean.

## Tech Stack

- **Framework:** Next.js 15 (App Router, static export)
- **Language:** TypeScript 5, strict mode
- **UI:** React 19, Tailwind CSS 3.4, shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **Backend:** Firebase 10 (Firestore for data, Anonymous Auth)
- **AI:** Google Genkit (Gemini 2.5 Flash) — disabled in static builds
- **i18n:** i18next + react-i18next (en, ja, ko)
- **Forms:** React Hook Form + Zod
- **Deployment:** Firebase Hosting (static HTML export to `out/`)

## Commands

```bash
npm run dev          # Dev server with Turbopack on port 9002
npm run build        # Production build (static export to out/)
npm run start        # Start production server
npm run lint         # Run Next.js ESLint (currently ignored during build)
npm run typecheck    # TypeScript type checking (tsc --noEmit)
npm run genkit:dev   # Start Genkit AI dev server
npm run genkit:watch # Start Genkit with file watching
```

**Deployment:**
```bash
npm run build && firebase deploy
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with Firebase provider
│   ├── page.tsx            # Main game page
│   ├── globals.css         # Global styles, Tailwind directives, CSS variables
│   └── actions.ts          # Server actions (AI, disabled in static export)
├── components/
│   ├── game/               # Game-specific components
│   │   ├── game-provider.tsx   # Central state management (Context + Reducer)
│   │   ├── game-canvas.tsx     # HTML5 Canvas: click input, particles, effects
│   │   ├── stats-panel.tsx     # Beans, BPS, click power, rank display
│   │   ├── store-modal.tsx     # Item purchase interface
│   │   ├── item-card.tsx       # Individual item display
│   │   ├── item-popup.tsx      # Item detail/rename view
│   │   ├── ranking-modal.tsx   # Leaderboard (National/Regional/Friends tabs)
│   │   ├── ai-suggester.tsx    # AI name generation (disabled in static builds)
│   │   └── footer.tsx          # Footer component
│   └── ui/                 # shadcn/ui components (42 files, do not edit manually)
├── firebase/               # Firebase integration layer
│   ├── config.ts           # Firebase project configuration
│   ├── provider.tsx        # Firebase context provider
│   ├── client-provider.tsx # Client-side provider
│   ├── non-blocking-login.tsx    # Async auth
│   ├── non-blocking-updates.tsx  # Async Firestore writes
│   ├── error-emitter.ts   # Error event system
│   ├── errors.ts           # Error types
│   ├── index.ts            # Main export
│   └── firestore/          # Firestore hooks
│       ├── use-collection.tsx
│       └── use-doc.tsx
├── hooks/                  # Custom React hooks
│   ├── use-mobile.tsx      # Mobile detection
│   └── use-toast.ts        # Toast notification hook
├── lib/                    # Utilities and game data
│   ├── game-data.ts        # 38 items, 15 career levels, pricing formulas
│   ├── firebase-service.ts # Firestore CRUD operations
│   ├── utils.ts            # cn(), formatNum() (K/M/B/T or Korean 만/억/조)
│   └── placeholder-images.ts
├── locales/                # i18n translation files
│   ├── client.tsx          # i18n provider and useTranslation hook
│   ├── en.json             # English strings
│   ├── ja.json             # Japanese strings
│   ├── ko.json             # Korean strings
│   └── resources.ts        # Resource aggregator
├── ai/                     # AI integration (Genkit)
│   ├── genkit.ts           # Genkit configuration
│   ├── dev.ts              # Dev server entry
│   └── flows/
│       └── suggest-ai-assisted-item-names.ts
└── types/
    └── game.d.ts           # GameState, Item, GameAction, Particle, etc.
```

## Architecture

### State Management

The game uses React Context + useReducer (no external state library). The central state lives in `src/components/game/game-provider.tsx`.

- **GameState** (`src/types/game.d.ts`): ~30 fields covering game logic, UI state, and visual effects
- **GameAction**: 17 action types dispatched via `useReducer`
- **Game loop**: `requestAnimationFrame` dispatches `GAME_TICK` at ~60fps for smooth animations
- State is persisted to localStorage under key `careerBrewSaveV1.0`
- Leaderboard data syncs to Firestore via non-blocking writes

### Key Action Types

`LOAD_STATE`, `NEW_GAME`, `SET_PLAYER_NAME`, `SET_DEFAULT_PLAYER_NAME`, `GAME_TICK`, `CANVAS_CLICK`, `BUY_ITEM`, `UPDATE_ITEM_NAME`, `SAVE_GAME`, `RESET_GAME`, `TOGGLE_ITEM_POPUP`, `TOGGLE_RANKING_MODAL`, `TOGGLE_STORE_MODAL`, `UPDATE_MY_RANK`, `UPDATE_MESSAGE`, `TOGGLE_CLICK_HINT`, `CLEAR_NEW_ITEM_NOTIFICATION`

### Game Mechanics

- **Click loop**: Click canvas → earn `baseClick` beans (5x during fever)
- **Passive income**: `baseBps` beans per second (5x during fever)
- **38 items**: Each increases `baseClick` or `baseBps`; prices scale exponentially (`basePrice * costMultiplier^owned`, BPS items: 1.18x, Click items: 1.6x)
- **Fever mode**: Triggered at 100 fever gauge points (2 per click) or by Golden Bean; lasts 6 seconds; 5x multiplier
- **Golden Bean**: Spawns every ~10 minutes, bounces around canvas, grants fever on click
- **15 career ranks**: Based on `Math.floor(Math.log10(max(baseBps, baseClick)))`, capped at index 14
- **Leaderboard**: Real-time Firestore, top 50, ranked by `baseBps` score

### Firebase

- **Auth**: Anonymous authentication
- **Firestore collections**:
  - `/users/{userId}/gameState/{gameStateId}` — private game saves
  - `/leaderboard/{playerId}` — public scores
- **Security rules**: Path-based ownership in `firestore.rules`
- **Config**: Hardcoded in `src/firebase/config.ts` (public Firebase keys)

## Coding Conventions

### File Naming
- **Component files**: kebab-case (`game-canvas.tsx`, `stats-panel.tsx`)
- **Component exports**: PascalCase default exports (`export default function GameCanvas()`)
- **Utility files**: kebab-case (`game-data.ts`, `firebase-service.ts`)

### TypeScript
- Strict mode enabled
- Path alias: `@/*` → `./src/*`
- Interface-based types (no `I` prefix): `Item`, `GameState`, `Particle`
- Props interfaces: `{ComponentName}Props` pattern

### React Patterns
- Functional components with hooks only
- Default exports for page/component files
- Context + useReducer for state (no Redux/Zustand)
- `useRef` for mutable values that shouldn't trigger re-renders (animation frames, interval IDs)
- `useCallback` with refs to avoid stale closures in animation loops
- Immutable state updates via object spread

### Styling
- Tailwind utility classes
- `cn()` helper from `@/lib/utils` for conditional class merging (clsx + tailwind-merge)
- CSS variables for theme colors (HSL values) in `globals.css`
- Dark mode: class-based (`darkMode: ['class']`)
- Custom fonts: Alegreya (body), Belleza (headlines)

### Constants
- Game constants use UPPER_SNAKE_CASE (`SAVE_KEY`, `GOLDEN_INTERVAL`)
- Item/level data defined as arrays in `src/lib/game-data.ts`

### Naming
- Functions: camelCase
- Booleans: `is*`, `has*`, `can*` prefixes (`isFever`, `isFirstLoad`, `canAffordNewItem`)
- Event handlers: `handle*` prefix

### i18n
- All user-facing strings go through `t()` from i18next
- Translation files in `src/locales/{en,ja,ko}.json`
- Language auto-detected from browser; no manual selector in UI

### Imports
- React/Next imports first
- Third-party imports next
- Local imports grouped by type (components, hooks, lib, types)
- Always use `@/` path alias

## Important Notes

- **Static export**: The app builds as static HTML (`output: 'export'` in `next.config.ts`). Server-side features like API routes and server actions are unavailable at runtime. The AI name suggestion feature is disabled in production.
- **Build tolerances**: TypeScript errors and ESLint warnings are ignored during build (`ignoreBuildErrors: true`, `ignoreDuringBuilds: true`). Always run `npm run typecheck` separately to verify type safety.
- **No test framework**: There are no tests configured. No Jest, Vitest, or testing libraries are installed.
- **No CI/CD**: No GitHub Actions or automated pipelines. Deployment is manual via Firebase CLI.
- **shadcn/ui components** in `src/components/ui/` are generated. Do not manually edit these files; use `npx shadcn@latest add <component>` to add new ones.
- **Number formatting**: `formatNum()` in `src/lib/utils.ts` handles both Western (K/M/B/T) and Korean (만/억/조) number abbreviations based on locale.
- **Canvas rendering**: `game-canvas.tsx` uses raw HTML5 Canvas API with `requestAnimationFrame` for the click area, particles, floating text, and golden bean animations.
- **Save system**: Game state auto-saves to localStorage. Leaderboard scores sync to Firestore. Avoid triggering double-saves — the reducer guards against concurrent save operations.

## Documentation

Additional design and analysis docs live in `docs/`:
- `docs/blueprint.md` — original design specification
- `docs/backend.json` — backend schema reference
- `docs/03-analysis/` — architecture review, convention review, gap analysis, ranking system iteration report
