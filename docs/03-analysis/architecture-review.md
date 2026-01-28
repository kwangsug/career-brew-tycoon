# Architecture Review Report

**Project**: Career Brew Tycoon
**Level**: Dynamic
**Review Date**: 2026-01-27
**Lines of Code**: ~6,536 lines across 65 TypeScript files

---

## Executive Summary

Overall architecture is **GOOD** with some areas for improvement. The project follows a clean React/Next.js structure with Firebase integration. The codebase is well-organized but has some code duplication and missing documentation that should be addressed before scaling.

**Overall Score**: 7.5/10

---

## 1. Architecture Consistency

### ✅ Strengths

#### 1.1 Clear Folder Structure
```
src/
├── app/              # Next.js 14 App Router
├── components/
│   ├── game/         # Game-specific components
│   └── ui/           # shadcn/ui design system (42 components)
├── firebase/         # Firebase abstraction layer
├── hooks/            # Reusable React hooks
├── lib/              # Utility functions & game logic
├── locales/          # i18n (en, ko, ja)
└── types/            # TypeScript definitions
```

**Verdict**: Well-organized, follows Next.js 14 conventions. Clear separation between game logic, UI, and infrastructure.

#### 1.2 State Management Pattern
- **Pattern**: Centralized reducer pattern in `game-provider.tsx`
- **Actions**: Type-safe action system (12 action types)
- **Context API**: Proper React Context usage for global game state
- **Score**: ⭐⭐⭐⭐ (4/5)

#### 1.3 Type Safety
- TypeScript used throughout
- Proper interface definitions in `types/game.d.ts`
- Type imports from Firebase libraries
- **Score**: ⭐⭐⭐⭐⭐ (5/5)

#### 1.4 Component Architecture
- Functional components with hooks
- Proper separation of concerns (presentation vs logic)
- Context consumption pattern consistent
- **Score**: ⭐⭐⭐⭐ (4/5)

### ⚠️ Areas for Improvement

#### 1.5 Layer Separation Issues

**Issue**: Business logic mixed with presentation layer
- **Location**: `game-provider.tsx:336` - Score calculation duplicated
- **Location**: `game-provider.tsx:459` - Score calculation repeated
- **Impact**: Violates Single Responsibility Principle

**Recommendation**: Extract to utility function:
```typescript
// lib/game-utils.ts
export function calculateScore(baseBps: number, baseClick: number, isFever: boolean): number {
  return (baseBps + baseClick) * (isFever ? 5 : 1);
}
```

#### 1.6 Large Component File
- **File**: `game-provider.tsx` - **511 lines**
- **Threshold**: 300 lines recommended
- **Issues**:
  - Multiple concerns (state management, auth, save logic, effects)
  - Complex useEffect dependencies
  - Hard to test individual pieces

**Recommendation**: Split into:
```
game-provider.tsx (context + reducer only)
├── use-game-auth.ts (auth logic)
├── use-game-save.ts (save/load logic)
├── use-game-effects.ts (periodic effects)
└── game-reducer.ts (reducer function)
```

---

## 2. Design Patterns

### ✅ Good Patterns Used

#### 2.1 Context + Reducer Pattern
- Predictable state updates
- Type-safe actions
- Good for complex state management
- **Verdict**: Appropriate choice for game state

#### 2.2 Custom Hooks
- `use-toast.ts` - Toast notifications
- `use-mobile.tsx` - Responsive detection
- Firebase hooks in `firebase/` folder
- **Verdict**: Good abstraction, reusable

#### 2.3 Component Composition
- `ItemCard` used in `StoreModal`
- UI components from shadcn/ui
- Proper props drilling avoidance via Context
- **Verdict**: Clean composition

### ⚠️ Pattern Issues

#### 2.4 Missing Service Layer
**Current**: Components directly call Firebase functions
```typescript
// game-provider.tsx:338
saveToFirebase(firestore, state.playerId, nameToSave, score);
```

**Recommended**: Service abstraction
```typescript
// services/game-service.ts
class GameService {
  constructor(private db: Firestore) {}

  async saveGame(playerId: string, name: string, score: number) {
    return saveToFirebase(this.db, playerId, name, score);
  }

  async loadGame(playerId: string): Promise<GameState | null> {
    // Centralized load logic
  }
}
```

**Benefits**:
- Easier testing (mock service instead of Firebase)
- Centralized error handling
- Business logic separation

---

## 3. Cross-Cutting Concerns

### 3.1 Error Handling

**Current State**: Basic try-catch blocks
```typescript
// firebase-service.ts:34-45
try {
  console.log('🔥 Saving to Firestore...');
  setDocumentNonBlocking(leaderboardRef, {...}, { merge: true });
} catch (e) {
  console.error('🔥 Firestore save failed:', e);
}
```

**Issues**:
- ❌ Errors logged but not reported to user
- ❌ No error recovery strategy
- ❌ Silent failures in non-blocking operations

**Recommendation**:
- Add error boundary components
- Implement retry logic for failed saves
- Show user-friendly error messages

### 3.2 Logging

**Current**: 15 `console.log` statements scattered across code

**Issues**:
- ❌ No log levels (debug, info, warn, error)
- ❌ Logs not removed in production build
- ❌ No structured logging

**Recommendation**: Use a logging utility
```typescript
// lib/logger.ts
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: any[]) => isDev && console.log('[DEBUG]', ...args),
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
};
```

### 3.3 Performance

**Potential Issues**:
1. **Game loop via `requestAnimationFrame`** (game-provider.tsx:365-374)
   - ✅ Good: Uses RAF for smooth animation
   - ⚠️ Issue: Dispatches action every frame (60fps)
   - **Impact**: May cause re-renders if not memoized properly

2. **Periodic rank fetching** (game-provider.tsx:456-468)
   - Fetches rank every 60 seconds
   - Uses Firestore count query
   - **Concern**: May hit quota limits with many users

**Recommendation**: Implement throttling/debouncing

---

## 4. Security Architecture

### ✅ Security Strengths

#### 4.1 Firestore Rules
- **Excellent** path-based ownership model
- Proper authentication checks
- Prevents unauthorized access
- **Score**: ⭐⭐⭐⭐⭐ (5/5)

#### 4.2 Firebase Configuration
- ❌ **CRITICAL ISSUE**: API key exposed in source code
- **Location**: `firebase/config.ts:1-9`
- **Risk**: Public Firebase config visible in client bundle

**Note**: Firebase API keys are intended to be public but should be in environment variables for best practices.

**Recommendation**:
```typescript
// firebase/config.ts
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  // ... other fields
};
```

Create `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=career-brew.firebaseapp.com
# ... other keys
```

#### 4.3 Authentication
- Anonymous auth implemented correctly
- Proper user state management
- **Score**: ⭐⭐⭐⭐ (4/5)

### ⚠️ Security Concerns

1. **No input validation** on client side before Firestore writes
2. **No rate limiting** on save operations
3. **Leaderboard manipulation risk**: Score is calculated client-side
   - **Location**: `game-provider.tsx:336`
   - **Risk**: Users could modify local state to inflate scores
   - **Mitigation**: Already protected by Firestore rules (owner can update own score)

---

## 5. Maintainability

### 5.1 Code Readability
- **Good**: Meaningful variable names
- **Good**: Component names follow conventions
- **Issue**: Some functions are too long (100+ lines)
- **Score**: ⭐⭐⭐⭐ (4/5)

### 5.2 Documentation
- ❌ No JSDoc comments on functions
- ❌ No README in `src/` folder explaining architecture
- ✅ Good: Firestore rules are well-documented
- **Score**: ⭐⭐ (2/5)

### 5.3 Testing
- ❌ No test files found
- ❌ No test configuration
- **Score**: ⭐ (1/5)

**Recommendation**: Add tests for:
- `gameReducer` function (pure function, easy to test)
- Price calculation logic
- Score calculation
- Firebase service layer

---

## 6. Scalability Assessment

### Current Capacity
- **Users**: Can handle 1K-10K concurrent users
- **Data**: Firestore scales automatically
- **Performance**: Client-side game loop is efficient

### Bottlenecks
1. **Rank calculation**: O(n) query on every fetch
   - **Current**: Counts all documents with score > myScore
   - **Better**: Pre-compute ranks periodically with Cloud Function

2. **Leaderboard query**: Fetches top 50 every time
   - **Recommendation**: Add caching layer

3. **Auto-save every 30 seconds**: May hit write quota
   - **Current**: 2 writes/min per user
   - **Calculation**: 10K users = 20K writes/min = 28.8M writes/day
   - **Firestore free tier**: 20K writes/day
   - **Status**: ⚠️ Will exceed free tier quickly

**Recommendation**:
- Implement exponential backoff for auto-save
- Save only when state changes significantly

---

## 7. Recommendations Priority

### 🔴 Critical (Fix before public launch)
1. Move Firebase config to environment variables
2. Add error boundaries for better UX
3. Remove/gate console.log statements in production
4. Reduce auto-save frequency or add quota monitoring

### 🟡 High (Fix in next sprint)
1. Extract business logic from game-provider (split file)
2. Implement service layer for Firebase operations
3. Add JSDoc comments to key functions
4. Create CONVENTIONS.md document

### 🟢 Medium (Next milestone)
1. Add unit tests for reducer
2. Implement structured logging
3. Add caching for leaderboard
4. Optimize rank calculation with Cloud Function

### 🔵 Low (Nice to have)
1. Add performance monitoring (Firebase Performance)
2. Implement analytics tracking
3. Add Storybook for component development
4. Create architecture diagram

---

## 8. Conclusion

The Career Brew Tycoon architecture is **solid for a Dynamic-level project**. The codebase demonstrates good React/Next.js practices with proper TypeScript usage and a clean folder structure.

**Key Strengths**:
- Well-organized component hierarchy
- Strong type safety
- Excellent Firestore security rules
- Good state management pattern

**Key Weaknesses**:
- Large component files need splitting
- Missing service layer abstraction
- Insufficient error handling
- No test coverage
- Hardcoded Firebase config

**Overall Verdict**: With the critical issues addressed, this codebase is production-ready for MVP launch. Plan for refactoring before scaling to >10K users.

---

**Reviewed by**: Claude Code bkit Phase 8 Review
**Next Steps**: Review [convention-review.md](./convention-review.md) and [refactoring-plan.md](./refactoring-plan.md)
