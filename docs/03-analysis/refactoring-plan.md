# Refactoring Plan

**Project**: Career Brew Tycoon
**Level**: Dynamic
**Created**: 2026-01-27

---

## Executive Summary

This document outlines specific refactoring tasks identified during Phase 8 Review. Tasks are prioritized by urgency and impact. Estimated effort is provided for sprint planning.

**Total Issues Identified**: 23
**Critical**: 4
**High**: 7
**Medium**: 8
**Low**: 4

---

## 1. Code Duplication Issues

### 🔴 1.1 Price Calculation Logic (Critical)

**Duplication Count**: 4 occurrences

**Locations**:
1. `game-provider.tsx:160`
2. `game-provider.tsx:238`
3. `item-card.tsx:28`
4. `item-popup.tsx:28`

**Current Code**:
```typescript
const costMultiplier = item.type === 'bps' ? 1.18 : 1.6;
const price = Math.floor(item.basePrice * Math.pow(costMultiplier, item.owned));
```

**Refactoring**:
```typescript
// lib/game-utils.ts
export function calculateItemPrice(item: Item): number {
  const costMultiplier = item.type === 'bps' ? 1.18 : 1.6;
  return Math.floor(item.basePrice * Math.pow(costMultiplier, item.owned));
}

// Usage
import { calculateItemPrice } from '@/lib/game-utils';
const price = calculateItemPrice(item);
```

**Effort**: 30 minutes
**Priority**: 🔴 Critical
**Risk**: Low
**Testing**: Unit test the function with various item types

---

### 🔴 1.2 Fever Multiplier Logic (Critical)

**Duplication Count**: 3 occurrences

**Locations**:
1. `game-provider.tsx:111`
2. `game-provider.tsx:204`
3. `stats-panel.tsx:27`

**Current Code**:
```typescript
const multiplier = state.isFever ? 5 : 1;
```

**Refactoring**:
```typescript
// lib/game-constants.ts
export const FEVER_MULTIPLIER = 5;
export const NORMAL_MULTIPLIER = 1;

// lib/game-utils.ts
export function getFeverMultiplier(isFever: boolean): number {
  return isFever ? FEVER_MULTIPLIER : NORMAL_MULTIPLIER;
}
```

**Effort**: 20 minutes
**Priority**: 🔴 Critical
**Risk**: Low
**Benefits**: Easier to balance game mechanics (single source of truth)

---

### 🟡 1.3 Score Calculation Logic (High)

**Duplication Count**: 2 occurrences

**Locations**:
1. `game-provider.tsx:336` (save logic)
2. `game-provider.tsx:459` (rank fetch logic)

**Current Code**:
```typescript
const score = (state.baseBps + state.baseClick) * (state.isFever ? 5 : 1);
```

**Refactoring**:
```typescript
// lib/game-utils.ts
export function calculateScore(
  baseBps: number,
  baseClick: number,
  isFever: boolean
): number {
  const multiplier = getFeverMultiplier(isFever);
  return (baseBps + baseClick) * multiplier;
}

// Usage
const score = calculateScore(state.baseBps, state.baseClick, state.isFever);
```

**Effort**: 20 minutes
**Priority**: 🟡 High
**Risk**: Low
**Additional Benefit**: Makes score calculation testable

---

## 2. Large File Splitting

### 🔴 2.1 Split game-provider.tsx (511 lines)

**Current Structure**:
```
game-provider.tsx (511 lines)
├── Imports & Constants
├── getInitialState() helper
├── gameReducer() (150 lines)
├── GameContext creation
├── GameProviderContent component (200 lines)
│   ├── State & hooks
│   ├── handleSave logic
│   ├── handleReset logic
│   ├── Auth effect
│   ├── Save effect
│   ├── Rank fetch effect
│   ├── Message update effect
│   └── Item notification effect
└── GameProvider wrapper
```

**Proposed Structure**:
```
components/game/
├── game-provider.tsx (100 lines)
│   └── Context + Provider wrapper
├── game-reducer.ts (150 lines)
│   ├── gameReducer function
│   └── Action handlers
├── hooks/
│   ├── use-game-auth.ts (80 lines)
│   │   └── Auth & load logic
│   ├── use-game-save.ts (50 lines)
│   │   └── Save/reset handlers
│   ├── use-game-effects.ts (100 lines)
│   │   ├── Periodic save
│   │   ├── Rank fetch
│   │   ├── Message update
│   │   └── Item notifications
│   └── use-game-loop.ts (30 lines)
│       └── requestAnimationFrame loop
└── game-utils.ts (50 lines)
    └── Helper functions
```

**Implementation Steps**:
1. Extract `gameReducer` to `game-reducer.ts`
2. Create `use-game-loop.ts` with RAF logic
3. Create `use-game-auth.ts` for auth/load
4. Create `use-game-save.ts` for save/reset
5. Create `use-game-effects.ts` for periodic effects
6. Refactor `game-provider.tsx` to use new hooks
7. Update imports in consuming components

**Effort**: 4 hours
**Priority**: 🔴 Critical
**Risk**: Medium (requires careful testing)
**Testing**:
- Verify game still works
- Test save/load
- Test auth flow
- Test all periodic effects

---

## 3. Security Improvements

### 🔴 3.1 Move Firebase Config to Environment Variables

**Current**: Hardcoded in `firebase/config.ts`

**Refactoring**:

**Step 1**: Create `.env.local`
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD3mv9F87KSAJzuk0VYReg7aQfCQ7ak7ko
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=career-brew.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=career-brew
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=career-brew.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=48722044572
NEXT_PUBLIC_FIREBASE_APP_ID=1:48722044572:web:858470248dee6aab42ef59
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-5MLYRT46P4
```

**Step 2**: Update `firebase/config.ts`
```typescript
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};
```

**Step 3**: Add validation
```typescript
// lib/env.ts
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
```

**Step 4**: Create `.env.example`
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# ... other fields
```

**Effort**: 1 hour
**Priority**: 🔴 Critical
**Risk**: Low
**Deployment Note**: Update Vercel/Firebase hosting env vars

---

### 🟡 3.2 Implement Error Boundaries

**Purpose**: Graceful error handling for component crashes

**Implementation**:

**Create** `components/error-boundary.tsx`:
```typescript
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
          <p className="text-muted-foreground">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Game
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage** in `app/layout.tsx`:
```typescript
export default function RootLayout({ children }: Props) {
  return (
    <html suppressHydrationWarning>
      <body>
        <FirebaseClientProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
```

**Effort**: 1 hour
**Priority**: 🟡 High
**Risk**: Low

---

## 4. Performance Optimizations

### 🟡 4.1 Reduce Auto-Save Frequency

**Current**: Saves every 30 seconds unconditionally

**Issue**: Will exceed Firestore free tier with >1000 users
- Current: 2 writes/min per user
- 1K users = 2K writes/min = 2.88M writes/day
- Firestore free tier: 50K writes/day

**Refactoring**:

**Strategy 1**: Save only on significant changes
```typescript
// use-game-save.ts
const [lastSavedScore, setLastSavedScore] = useState(0);

useEffect(() => {
  const currentScore = calculateScore(state.baseBps, state.baseClick, state.isFever);
  const scoreDelta = Math.abs(currentScore - lastSavedScore) / lastSavedScore;

  // Save if score changed by >10% or 5 minutes elapsed
  const shouldSave = scoreDelta > 0.1 || timeSinceLastSave > 300000;

  if (shouldSave) {
    handleSave(false);
    setLastSavedScore(currentScore);
  }
}, [state, lastSavedScore]);
```

**Strategy 2**: Exponential backoff
```typescript
// Save immediately, then 30s, 1m, 2m, 5m intervals
const intervals = [30000, 60000, 120000, 300000];
```

**Effort**: 2 hours
**Priority**: 🟡 High
**Risk**: Medium (test save reliability)

---

### 🟢 4.2 Implement Rank Calculation Caching

**Current**: Queries Firestore every 60 seconds

**Issue**: O(n) query for each user

**Refactoring**:

**Client-side caching**:
```typescript
// lib/rank-cache.ts
const CACHE_TTL = 60000; // 1 minute
const cache = new Map<string, { rank: number; timestamp: number }>();

export function getCachedRank(playerId: string): number | null {
  const cached = cache.get(playerId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.rank;
  }
  return null;
}

export function setCachedRank(playerId: string, rank: number) {
  cache.set(playerId, { rank, timestamp: Date.now() });
}
```

**Future**: Cloud Function for pre-computed ranks
```typescript
// functions/src/update-ranks.ts
export const updateRanks = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    // Fetch all scores, compute ranks, update documents
  });
```

**Effort**: 2 hours (client) + 4 hours (Cloud Function)
**Priority**: 🟢 Medium
**Risk**: Low

---

## 5. Code Quality Improvements

### 🟡 5.1 Remove/Gate Console Logs

**Current**: 15 console.log statements in production

**Refactoring**:

**Create logging utility**:
```typescript
// lib/logger.ts
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) console.log('[DEBUG]', ...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.log('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};
```

**Replace all console.log**:
```bash
# Find and replace
console.log → logger.debug
console.warn → logger.warn
console.error → logger.error
```

**Effort**: 1 hour
**Priority**: 🟡 High
**Risk**: Low

---

### 🟢 5.2 Add JSDoc Comments

**Target**: All exported functions

**Example**:
```typescript
/**
 * Calculates the purchase price for an item based on owned quantity.
 * Uses exponential scaling: BPS items scale at 1.18x, Click items at 1.6x.
 *
 * @param item - The item to calculate price for
 * @returns The current purchase price in beans
 *
 * @example
 * const item = { basePrice: 100, type: 'bps', owned: 5 };
 * const price = calculateItemPrice(item); // ~206 beans
 */
export function calculateItemPrice(item: Item): number {
  const costMultiplier = item.type === 'bps' ? 1.18 : 1.6;
  return Math.floor(item.basePrice * Math.pow(costMultiplier, item.owned));
}
```

**Files to document**:
1. `lib/game-utils.ts` (all functions)
2. `lib/firebase-service.ts` (all functions)
3. `lib/utils.ts` (formatNum)
4. `hooks/use-*.ts` (custom hooks)

**Effort**: 3 hours
**Priority**: 🟢 Medium
**Risk**: None

---

### 🟢 5.3 Standardize Constants

**Current**: Mixed naming conventions

**Refactoring**:

**Create** `lib/game-constants.ts`:
```typescript
// Game Configuration
export const SAVE_KEY = 'careerBrewSaveV1.0';
export const GOLDEN_INTERVAL = 10 * 60 * 1000; // 10 minutes
export const CLICK_HINT_IDLE_TIME = 4000; // 4 seconds
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
export const RANK_UPDATE_INTERVAL = 60000; // 60 seconds
export const MESSAGE_UPDATE_INTERVAL = 7000; // 7 seconds

// Game Mechanics
export const FEVER_MULTIPLIER = 5;
export const NORMAL_MULTIPLIER = 1;
export const FEVER_THRESHOLD = 100;
export const FEVER_GAIN_PER_CLICK = 2;
export const FEVER_DECAY_RATE = 0.5;

// Item Pricing
export const BPS_COST_MULTIPLIER = 1.18;
export const CLICK_COST_MULTIPLIER = 1.6;

// Golden Bean
export const GOLDEN_BEAN_LIFETIME = 6.0; // seconds
export const GOLDEN_BEAN_CLICK_RADIUS = 60; // pixels
```

**Rename in** `game-data.ts`:
```typescript
// Before
export const initialItems: Item[] = [...];
export const levels = [...];

// After
export const INITIAL_ITEMS: Item[] = [...];
export const LEVEL_NAMES: string[] = [...];
```

**Effort**: 1 hour
**Priority**: 🟢 Medium
**Risk**: Low

---

## 6. Testing Infrastructure

### 🟢 6.1 Add Unit Tests for Pure Functions

**Priority Functions**:
1. `gameReducer()` - Most critical
2. `calculateItemPrice()` - After refactoring
3. `calculateScore()` - After refactoring
4. `getFeverMultiplier()` - After refactoring

**Setup**:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

**Example Test**:
```typescript
// lib/__tests__/game-utils.test.ts
import { describe, it, expect } from 'vitest';
import { calculateItemPrice } from '../game-utils';

describe('calculateItemPrice', () => {
  it('calculates BPS item price correctly', () => {
    const item = {
      id: 'test',
      basePrice: 100,
      type: 'bps' as const,
      owned: 0,
      val: 1,
      name: 'Test',
      icon: 'test',
      description: 'test',
    };

    expect(calculateItemPrice(item)).toBe(100);
    expect(calculateItemPrice({ ...item, owned: 1 })).toBe(118);
    expect(calculateItemPrice({ ...item, owned: 2 })).toBe(139);
  });

  it('calculates Click item price correctly', () => {
    const item = {
      id: 'test',
      basePrice: 100,
      type: 'click' as const,
      owned: 0,
      val: 1,
      name: 'Test',
      icon: 'test',
      description: 'test',
    };

    expect(calculateItemPrice(item)).toBe(100);
    expect(calculateItemPrice({ ...item, owned: 1 })).toBe(160);
    expect(calculateItemPrice({ ...item, owned: 2 })).toBe(256);
  });
});
```

**Effort**: 6 hours (setup + tests)
**Priority**: 🟢 Medium
**Risk**: Low

---

## 7. Documentation

### 🟢 7.1 Create CONVENTIONS.md

**Content**: See [convention-review.md](./convention-review.md) section 12

**Effort**: 1 hour
**Priority**: 🟢 Medium
**Risk**: None

---

### 🔵 7.2 Create Architecture Diagram

**Tool**: Draw.io, Mermaid, or Excalidraw

**Diagram showing**:
1. Component hierarchy
2. Data flow (Redux-like pattern)
3. Firebase integration
4. State management

**Example (Mermaid)**:
```mermaid
graph TD
    A[App Layout] --> B[GameProvider]
    B --> C[GameUI]
    C --> D[StatsPanel]
    C --> E[GameCanvas]
    C --> F[StoreModal]
    F --> G[ItemCard]
    B --> H[Firebase Auth]
    B --> I[Firestore]
    I --> J[Leaderboard]
    I --> K[User GameState]
```

**Effort**: 2 hours
**Priority**: 🔵 Low
**Risk**: None

---

## 8. Tooling Improvements

### 🟡 8.1 Add ESLint + Prettier

**Install**:
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

**Create** `.eslintrc.json`:
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "no-console": "warn"
  }
}
```

**Create** `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Effort**: 1 hour
**Priority**: 🟡 High
**Risk**: Low

---

### 🔵 8.2 Add Husky for Pre-commit Hooks

**Install**:
```bash
npm install --save-dev husky lint-staged
npx husky install
```

**Create** `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**Update** `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**Effort**: 30 minutes
**Priority**: 🔵 Low
**Risk**: Low

---

## 9. Sprint Planning

### Sprint 1: Critical Fixes (1 week)

**Focus**: Code duplication + security

| Task | Priority | Effort | Owner |
|------|----------|--------|-------|
| 1.1 Price calculation util | 🔴 Critical | 0.5h | Dev |
| 1.2 Fever multiplier constant | 🔴 Critical | 0.5h | Dev |
| 1.3 Score calculation util | 🟡 High | 0.5h | Dev |
| 2.1 Split game-provider | 🔴 Critical | 4h | Dev |
| 3.1 Move config to env vars | 🔴 Critical | 1h | Dev |
| 3.2 Error boundaries | 🟡 High | 1h | Dev |
| 5.1 Logger utility | 🟡 High | 1h | Dev |
| 8.1 ESLint + Prettier | 🟡 High | 1h | Dev |

**Total**: ~10 hours

---

### Sprint 2: Performance + Quality (1 week)

**Focus**: Performance + documentation

| Task | Priority | Effort | Owner |
|------|----------|--------|-------|
| 4.1 Smart auto-save | 🟡 High | 2h | Dev |
| 5.2 JSDoc comments | 🟢 Medium | 3h | Dev |
| 5.3 Standardize constants | 🟢 Medium | 1h | Dev |
| 6.1 Unit tests | 🟢 Medium | 6h | Dev |
| 7.1 CONVENTIONS.md | 🟢 Medium | 1h | Dev |

**Total**: ~13 hours

---

### Sprint 3: Advanced Improvements (1 week)

**Focus**: Scalability + tooling

| Task | Priority | Effort | Owner |
|------|----------|--------|-------|
| 4.2 Rank caching | 🟢 Medium | 2h | Dev |
| 4.2 Cloud Function ranks | 🟢 Medium | 4h | Dev |
| 7.2 Architecture diagram | 🔵 Low | 2h | Dev |
| 8.2 Husky hooks | 🔵 Low | 0.5h | Dev |

**Total**: ~8.5 hours

---

## 10. Testing Strategy

### After Each Refactoring:

1. **Manual Testing**:
   - Save/load game works
   - Leaderboard displays correctly
   - Item purchases calculate correctly
   - Fever mode works
   - All modals open/close

2. **Regression Testing**:
   - Check git status for unintended changes
   - Test on different browsers (Chrome, Safari, Firefox)
   - Test on mobile devices

3. **Performance Testing**:
   - Verify no FPS drops
   - Check network tab for excessive requests

---

## 11. Rollback Plan

For each major refactoring:
1. Create feature branch: `refactor/task-name`
2. Commit frequently with clear messages
3. Test thoroughly before merging
4. Keep previous version for 1 week
5. Monitor error logs after deployment

---

## 12. Success Metrics

**After refactoring**:
- [ ] Game-provider.tsx < 200 lines
- [ ] No code duplication for price/score calculations
- [ ] All secrets in environment variables
- [ ] 0 console.log statements in production
- [ ] >50% test coverage for utilities
- [ ] ESLint passes with 0 errors
- [ ] Build time < 30 seconds
- [ ] Lighthouse score > 90

---

## Conclusion

This refactoring plan addresses all critical issues identified in the Phase 8 review. Prioritized execution over 3 sprints will significantly improve code quality, maintainability, and scalability without disrupting current functionality.

**Next Step**: Review with team and schedule Sprint 1 kickoff.

---

**Created by**: Claude Code bkit Phase 8 Review
**Related Documents**:
- [architecture-review.md](./architecture-review.md)
- [convention-review.md](./convention-review.md)
