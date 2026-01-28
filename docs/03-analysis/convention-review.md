# Convention Review Report

**Project**: Career Brew Tycoon
**Level**: Dynamic
**Review Date**: 2026-01-27

---

## Executive Summary

The project has **no formal CONVENTIONS.md document**, but it follows common React/TypeScript best practices. Consistency is generally good, with some minor deviations that should be standardized.

**Overall Convention Compliance**: 7/10

---

## 1. Naming Conventions

### ✅ Followed Conventions

#### 1.1 Components
- ✅ **PascalCase** for component files: `GameCanvas.tsx`, `StoreModal.tsx`
- ✅ Default exports for components
- ✅ Component names match file names

**Examples**:
```
✅ game-canvas.tsx → export default function GameCanvas()
✅ stats-panel.tsx → export default function StatsPanel()
✅ item-card.tsx → export default function ItemCard()
```

#### 1.2 Functions & Variables
- ✅ **camelCase** for functions: `saveToFirebase()`, `fetchMyRank()`
- ✅ **camelCase** for variables: `gameLoopRef`, `isFirstLoad`
- ✅ Boolean variables use `is`, `has`, `can` prefixes

**Examples**:
```typescript
✅ isSignedIn, isOwner, canAfford
✅ hasUser, showClickHint
```

#### 1.3 Constants
- ⚠️ **Mixed usage**: Some use UPPER_SNAKE_CASE, others don't
- ✅ `SAVE_KEY`, `GOLDEN_INTERVAL`, `CLICK_HINT_IDLE_TIME` (game-provider.tsx)
- ❌ `initialItems`, `levels` should be `INITIAL_ITEMS`, `LEVELS` (game-data.ts)

**Recommendation**: Standardize all constants to UPPER_SNAKE_CASE

#### 1.4 Types & Interfaces
- ✅ **PascalCase** for interfaces: `GameState`, `Item`, `Particle`
- ✅ Type exports in dedicated `types/` folder
- ✅ No `I` prefix (modern TypeScript style)

#### 1.5 File Names
- ✅ **kebab-case** for files: `game-provider.tsx`, `firebase-service.ts`
- ✅ Consistent across project
- **Score**: 5/5

---

## 2. Code Style Consistency

### 2.1 Indentation & Formatting
- ✅ **2 spaces** used consistently
- ✅ Semicolons at end of statements
- ✅ Single quotes for strings (except JSX attributes)
- ✅ Trailing commas in objects/arrays
- **Score**: 5/5

### 2.2 Import Organization
**Current pattern** (inconsistent):
```typescript
// Some files
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

// Other files
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
```

**Recommendation**: Standardize order:
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { getFirestore } from 'firebase/firestore';

// 3. Internal modules (absolute imports)
import { Button } from '@/components/ui/button';
import { GameState } from '@/types/game';

// 4. Relative imports
import './styles.css';
```

### 2.3 Component Structure
**Current** (mostly consistent):
```typescript
// ✅ Good pattern followed
"use client";                  // 1. Directives
import { ... } from '...';     // 2. Imports
                               // 3. Constants
const CONSTANT = 'value';
                               // 4. Component
export default function Component() {
  const [state, setState] = useState(); // Hooks first
  const handleClick = () => {}; // Event handlers
  return <div>...</div>; // JSX
}
```

**Score**: 4/5 (mostly consistent)

---

## 3. Folder Structure Conventions

### ✅ Current Structure Analysis

```
src/
├── app/                    ✅ Next.js 14 App Router convention
├── components/
│   ├── game/              ✅ Domain-specific components
│   └── ui/                ✅ Reusable UI primitives (shadcn/ui)
├── firebase/              ✅ Infrastructure layer
├── hooks/                 ✅ Custom React hooks
├── lib/                   ✅ Utilities & pure functions
├── locales/               ✅ i18n translations
└── types/                 ✅ TypeScript definitions
```

**Verdict**: Excellent structure, follows Next.js best practices

### ⚠️ Missing Folders

Consider adding:
```
src/
├── constants/             # Global constants (game config)
├── services/              # Business logic layer (GameService)
├── utils/                 # Pure utility functions
└── __tests__/             # Test files
```

---

## 4. Code Organization Patterns

### 4.1 File Length Guidelines

**Current state**:
```
✅ Most files < 100 lines (good)
⚠️ game-provider.tsx: 511 lines (too long)
⚠️ page.tsx: 124 lines (acceptable but could be split)
✅ firebase-service.ts: 101 lines (good)
```

**Recommended limits**:
- Components: < 200 lines
- Utilities: < 150 lines
- Types: < 100 lines

**Files exceeding limits**:
1. [game-provider.tsx:511](../src/components/game/game-provider.tsx) - Split into multiple files

### 4.2 Function Length

**Analysis**:
- ✅ Most functions < 30 lines
- ⚠️ `gameReducer`: 150+ lines (switch statement)
- ⚠️ `GameProviderContent`: 200+ lines (too many responsibilities)

**Recommendation**: Extract switch cases to separate reducer functions

### 4.3 Nesting Depth

**Current**: Max 3-4 levels (acceptable)
```typescript
// Example: game-provider.tsx:158-174
if (condition) {                    // Level 1
  const items = array.filter(item => { // Level 2
    const price = Math.floor(...);     // Level 3
    return beans >= price;
  });
}
```

**Verdict**: Acceptable, no excessive nesting

---

## 5. Documentation Conventions

### ❌ Missing Documentation

**Issues**:
1. No JSDoc comments on functions
2. No inline comments explaining complex logic
3. No README in `src/` folder

**Current state**:
```typescript
// ❌ No documentation
export async function saveToFirebase(
  db: Firestore | null,
  playerId: string,
  playerName: string,
  score: number
) { ... }
```

**Recommended**:
```typescript
/**
 * Saves player's game progress to Firestore leaderboard.
 * Uses non-blocking write to avoid blocking UI.
 *
 * @param db - Firestore instance
 * @param playerId - Unique player ID (Firebase Auth UID)
 * @param playerName - Display name for leaderboard
 * @param score - Current game score (baseBps + baseClick)
 * @returns Promise<void>
 * @throws {Error} If Firestore is not initialized
 */
export async function saveToFirebase(...) { ... }
```

**Score**: 1/5 (needs improvement)

---

## 6. TypeScript Conventions

### ✅ Good Practices

#### 6.1 Type Safety
- ✅ No `any` types used inappropriately
- ✅ Proper interface definitions
- ✅ Type guards where needed
- **Example**: `isOwner()` function in firestore.rules

#### 6.2 Type Exports
- ✅ Centralized in `types/` folder
- ✅ Named exports for types
- **Example**: `export type { GameState, GameAction }`

### ⚠️ Issues

#### 6.3 Type Assertions
```typescript
// game-provider.tsx:26
const adjectives = t('random_adjectives', { returnObjects: true }) as string[];
```
**Issue**: Type assertion instead of proper typing
**Better**: Type the i18n return value properly

#### 6.4 Optional Chaining Overuse
```typescript
// Some places
if (dispatch) { dispatch(...) } // Unnecessary check if context is properly typed
```

---

## 7. Git Conventions

### ✅ Good Practices
- Proper `.gitignore` file
- Excludes `node_modules/`, `.next/`, build artifacts

### ⚠️ Issues
```
M firebase.json
M package-lock.json
M package.json
M tsconfig.json
?? .firebase/
?? .vscode/
?? build-log.txt
```

**Problems**:
- `.vscode/` should be in `.gitignore` (IDE-specific)
- `build-log.txt` should be in `.gitignore`
- `.firebase/` should be in `.gitignore`

---

## 8. React/Next.js Conventions

### ✅ Followed

#### 8.1 Client Components
- ✅ `"use client"` directive at top of files
- ✅ Used only where necessary (interactive components)

#### 8.2 Hooks Usage
- ✅ Hooks only in functional components
- ✅ Proper dependency arrays
- ⚠️ Some missing exhaustive deps (ESLint warnings possible)

#### 8.3 Event Handlers
- ✅ Consistent `handle` prefix: `handleClick`, `handleSave`, `handleReset`

### ⚠️ Issues

#### 8.4 Props Destructuring
**Mixed patterns**:
```typescript
// Pattern 1 (preferred)
export default function ItemCard({ item, index }: ItemCardProps) {

// Pattern 2 (less common)
export default function Component(props: Props) {
  const { item } = props;
}
```

**Recommendation**: Always destructure in function signature

---

## 9. Styling Conventions

### ✅ Tailwind CSS
- ✅ Consistent use of Tailwind classes
- ✅ No inline styles (except dynamic styles)
- ✅ Custom theme in `tailwind.config.ts`

**Example**:
```tsx
<Button className="flex-shrink-0 min-w-[100px]">
```

### Design Tokens
- ✅ Uses CSS variables (shadcn/ui convention)
- ✅ Theme support via Tailwind
- **Score**: 5/5

---

## 10. Error Handling Conventions

### ⚠️ Inconsistent

**Current patterns**:
```typescript
// Pattern 1: Try-catch with console.error
try {
  await operation();
} catch (e) {
  console.error('Error:', e);
}

// Pattern 2: Try-catch with early return
try {
  await operation();
} catch (e) {
  console.error('Error:', e);
  return;
}

// Pattern 3: No error handling
await operation(); // May throw
```

**Recommendation**: Standardize error handling strategy
```typescript
// Recommended pattern
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', { error, context: {...} });
  toast({ title: 'Error', description: 'User-friendly message' });
  // Optional: throw or return error
}
```

---

## 11. Recommendations

### 🔴 Critical
1. **Create CONVENTIONS.md** with project standards
2. **Standardize constant naming** (UPPER_SNAKE_CASE)
3. **Add ESLint configuration** for consistent code style
4. **Update .gitignore** to exclude IDE files

### 🟡 High Priority
1. Add JSDoc comments to exported functions
2. Standardize import order
3. Extract large files (game-provider.tsx)
4. Add Prettier for automatic formatting

### 🟢 Medium Priority
1. Create component documentation
2. Add TypeScript strict mode
3. Document architecture in README
4. Add commit message conventions

### 🔵 Low Priority
1. Add Husky for pre-commit hooks
2. Set up Storybook for component docs
3. Add visual regression testing
4. Create coding standards guide

---

## 12. Proposed CONVENTIONS.md

Since the project lacks this document, here's a recommended structure:

```markdown
# Coding Conventions

## Naming
- Components: PascalCase (e.g., GameCanvas)
- Files: kebab-case (e.g., game-canvas.tsx)
- Functions: camelCase (e.g., handleClick)
- Constants: UPPER_SNAKE_CASE (e.g., SAVE_KEY)
- Types/Interfaces: PascalCase (e.g., GameState)

## File Structure
- Max 200 lines per component file
- Max 30 lines per function
- Extract complex logic to separate files

## Import Order
1. React imports
2. Third-party libraries
3. Internal modules (@/)
4. Relative imports

## TypeScript
- No `any` types
- Explicit return types for exported functions
- Proper null checks

## React
- "use client" at top of client components
- Destructure props in signature
- Use custom hooks for reusable logic

## Styling
- Tailwind CSS classes
- No inline styles (except dynamic)
- Use design tokens from theme

## Error Handling
- Try-catch for async operations
- Log errors with context
- Show user-friendly messages

## Comments
- JSDoc for exported functions
- Inline comments for complex logic
- TODO/FIXME tags for future work
```

---

## Conclusion

The project demonstrates **good consistency** in most areas but lacks formal documentation. With a CONVENTIONS.md file and some standardization, the codebase would be more maintainable for team collaboration.

**Key Actions**:
1. Create CONVENTIONS.md
2. Add ESLint + Prettier
3. Document complex functions
4. Split large files

**Next**: Review [refactoring-plan.md](./refactoring-plan.md)
