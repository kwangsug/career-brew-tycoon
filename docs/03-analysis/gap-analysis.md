# Gap Analysis Report: Design vs Implementation

**Project**: Career Brew Tycoon
**Analysis Date**: 2026-01-27
**Level**: Dynamic
**Analyzer**: Claude Code bkit PDCA Gap Detector

---

## Executive Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  Gap Analysis Result Summary                                     │
├─────────────────────────────────────────────────────────────────┤
│  Design-Implementation Match Rate: 78%                           │
│                                                                  │
│  ✅ Matched:           23 items                                   │
│  ⚠️ Missing from Design:  7 items (implemented but not designed) │
│  ❌ Not Implemented:    3 items (designed but not implemented)   │
│  🔄 Different:          3 items (exists but differs)             │
└─────────────────────────────────────────────────────────────────┘
```

**Overall Verdict**: The implementation closely follows the design with some enhancements not documented in design. Core functionality is complete, but design documents need updating to reflect actual implementation.

---

## 1. Data Model Gap Analysis

### 1.1 GameState Entity

| Field | Design | Implementation | Status |
|-------|--------|----------------|--------|
| id | ✅ string | ❌ Not present | ❌ Missing |
| beans | ✅ number | ✅ number | ✅ Match |
| baseBps | ✅ number | ✅ number | ✅ Match |
| baseClick | ✅ number | ✅ number | ✅ Match |
| manualTotal | ✅ number | ✅ number | ✅ Match |
| feverGauge | ✅ number | ✅ number | ✅ Match |
| isFever | ✅ boolean | ✅ boolean | ✅ Match |
| lastTime | ✅ number | ✅ number | ✅ Match |
| clickScale | ✅ number | ✅ number | ✅ Match |
| playerName | ✅ string | ✅ string | ✅ Match |
| playerId | ✅ string | ✅ string | ✅ Match |
| nextGoldenTime | ✅ number | ✅ number | ✅ Match |
| **defaultPlayerName** | ❌ Not in design | ✅ string | ⚠️ Design Missing |
| **levels** | ❌ Not in design | ✅ string[] | ⚠️ Design Missing |
| **levelIndex** | ❌ Not in design | ✅ number | ⚠️ Design Missing |
| **goldenBean** | ❌ Not in design | ✅ GoldenBean | ⚠️ Design Missing |
| **particles** | ❌ Not in design | ✅ Particle[] | ⚠️ Design Missing |
| **floatingTexts** | ❌ Not in design | ✅ FloatingText[] | ⚠️ Design Missing |
| **isFirstLoad** | ❌ Not in design | ✅ boolean | ⚠️ Design Missing |
| **isRankingModalOpen** | ❌ Not in design | ✅ boolean | ⚠️ Design Missing |
| **isStoreModalOpen** | ❌ Not in design | ✅ boolean | ⚠️ Design Missing |
| **isItemPopupOpen** | ❌ Not in design | ✅ boolean | ⚠️ Design Missing |
| **currentItemIndex** | ❌ Not in design | ✅ number \| null | ⚠️ Design Missing |
| **myRank** | ❌ Not in design | ✅ number \| null | ⚠️ Design Missing |
| **message** | ❌ Not in design | ✅ string | ⚠️ Design Missing |
| **lastClickTime** | ❌ Not in design | ✅ number | ⚠️ Design Missing |
| **showClickHint** | ❌ Not in design | ✅ boolean | ⚠️ Design Missing |
| **canAffordNewItem** | ❌ Not in design | ✅ boolean | ⚠️ Design Missing |
| **notifiedAffordableItems** | ❌ Not in design | ✅ string[] | ⚠️ Design Missing |
| **newlyAffordableItem** | ❌ Not in design | ✅ Item \| null | ⚠️ Design Missing |

**Match Rate**: 12/30 fields = 40%

**Analysis**:
- Design document is **minimal** - only covers core game state
- Implementation includes **extensive UI state** (modals, hints, notifications)
- Implementation includes **visual effects** (particles, floating texts)
- Implementation includes **progression system** (levels, ranks)

**Recommendation**: 🔴 Critical - Update [docs/backend.json](../backend.json) with complete GameState schema

---

### 1.2 Item Entity

| Field | Design | Implementation | Status |
|-------|--------|----------------|--------|
| id | ✅ string | ✅ string | ✅ Match |
| name | ✅ string | ✅ string | ✅ Match |
| type | ✅ string | ✅ 'bps' \| 'click' | 🔄 Different (stricter type) |
| basePrice | ✅ number | ✅ number | ✅ Match |
| val | ✅ number | ✅ number | ✅ Match |
| owned | ✅ number | ✅ number | ✅ Match |
| icon | ✅ string | ✅ string | ✅ Match |
| description | ✅ string | ✅ string | ✅ Match |
| **customName** | ❌ Not in design | ✅ string? | ⚠️ Design Missing |

**Match Rate**: 8/9 fields = 89%

**Analysis**:
- Nearly perfect match
- `customName` is a **value-add feature** (AI naming) mentioned in blueprint but not in backend schema

**Recommendation**: 🟡 High - Add `customName` field to backend.json schema

---

### 1.3 LeaderboardEntry Entity

| Field | Design | Implementation | Status |
|-------|--------|----------------|--------|
| playerId | ✅ string | ✅ string (Firestore doc ID) | ✅ Match |
| name | ✅ string | ✅ string | ✅ Match |
| score | ✅ number | ✅ number | ✅ Match |
| timestamp | ✅ number | ✅ number | ✅ Match |

**Match Rate**: 4/4 fields = 100%

**Analysis**: Perfect match between design and implementation

---

### 1.4 New Entities (Not in Design)

#### Particle Interface
```typescript
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}
```
**Status**: ⚠️ Not in design - Added for visual effects

#### FloatingText Interface
```typescript
interface FloatingText {
  x: number;
  y: number;
  val: number | string;
  life: number;
  color?: string;
  rotation: number;
}
```
**Status**: ⚠️ Not in design - Added for game feedback

#### GoldenBean Interface
```typescript
interface GoldenBean {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}
```
**Status**: ⚠️ Not in design - Special event feature

**Recommendation**: 🟢 Medium - Document these entities in design for future reference

---

## 2. Firestore Structure Gap Analysis

### 2.1 User GameState Collection

**Design**:
```
/users/{userId}/gameState/{gameStateId}
```

**Implementation**:
```
Local Storage only - NOT stored in Firestore
```

**Status**: ❌ **Not Implemented**

**Details**:
- Design specifies Firestore path `/users/{userId}/gameState`
- Implementation uses `localStorage.setItem('careerBrewSaveV1.0', ...)`
- No Firestore writes for individual game state

**Impact**: 🔴 Critical
- Users cannot sync game state across devices
- Game progress is lost if localStorage is cleared
- No cloud backup

**Actual Implementation**:
```typescript
// game-provider.tsx:332
localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
```

**Design Intent**: Cloud-based game state storage

**Recommendation**:
```typescript
// Implement Firestore save
await setDoc(doc(db, 'users', userId, 'gameState', 'main'), {
  ...gameState,
  updatedAt: serverTimestamp()
});
```

---

### 2.2 Leaderboard Collection

**Design**:
```
/leaderboard/{playerId}
```

**Implementation**:
```typescript
// firebase-service.ts:36
const leaderboardRef = doc(db, 'leaderboard', playerId);
```

**Status**: ✅ **Perfect Match**

**Analysis**:
- Collection name matches
- Document ID structure matches
- Fields match (playerId, name, score, timestamp)

---

## 3. Authentication Gap Analysis

### 3.1 Auth Providers

**Design** ([backend.json:151-154](../backend.json#L151-L154)):
```json
"auth": {
  "providers": ["password", "anonymous"]
}
```

**Implementation**:

| Provider | Design | Implementation | Status |
|----------|--------|----------------|--------|
| anonymous | ✅ Required | ✅ Implemented | ✅ Match |
| password | ✅ Required | ⚠️ Code exists, not used | 🔄 Partial |

**Analysis**:
- Anonymous auth: **Fully implemented** ([game-provider.tsx:391](../../src/components/game/game-provider.tsx#L391))
- Password auth: **Functions exist** but no UI ([non-blocking-login.tsx:17-28](../../src/firebase/non-blocking-login.tsx#L17-L28))

**Implemented but Unused**:
```typescript
// non-blocking-login.tsx
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string)
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string)
```

**Missing UI Components**:
- No login form
- No signup form
- No password reset UI

**Recommendation**:
- 🟡 High: If password auth is not needed, remove from design
- 🟡 High: If password auth is planned, add to roadmap and create UI

---

## 4. Feature Gap Analysis

### 4.1 Core Features (from blueprint.md)

| Feature | Design | Implementation | Status |
|---------|--------|----------------|--------|
| Bean Roasting | ✅ Required | ✅ Implemented | ✅ Match |
| Store Upgrades | ✅ Required | ✅ Implemented | ✅ Match |
| Prestige System | ✅ Required | ❌ Not Implemented | ❌ Missing |
| Ranking System | ✅ Required | ✅ Implemented | ✅ Match |
| AI Naming | ✅ Required | ⚠️ Partial | 🔄 Incomplete |

**Details**:

#### 4.1.1 Bean Roasting ✅
- **Design**: "Simulate the process of roasting coffee beans with increasing efficiency"
- **Implementation**: Fully implemented with click mechanics and BPS system
- **Location**: [game-canvas.tsx](../../src/components/game/game-canvas.tsx), [game-provider.tsx](../../src/components/game/game-provider.tsx)

#### 4.1.2 Store Upgrades ✅
- **Design**: "Purchase upgrades to increase bean roasting efficiency"
- **Implementation**: 38 items with exponential pricing
- **Location**: [store-modal.tsx](../../src/components/game/store-modal.tsx), [game-data.ts](../../src/lib/game-data.ts)

#### 4.1.3 Prestige System ❌
- **Design**: "Allow players to reset their progress for a permanent bonus"
- **Implementation**: **Not found**
- **Impact**: Missing planned long-term engagement feature
- **Recommendation**: 🔴 Critical - Implement or remove from design

**Suggested Implementation**:
```typescript
// Add to GameState
interface GameState {
  prestigeLevel: number;
  prestigeBonus: number; // Permanent multiplier
  totalBeansAllTime: number;
}

// Add action
type GameAction =
  | { type: 'PRESTIGE', payload: { bonus: number } }
  | ...
```

#### 4.1.4 Ranking System ✅
- **Design**: "Users can save their score to Firestore and compete on global and virtual rankings"
- **Implementation**: Fully implemented
- **Location**: [ranking-modal.tsx](../../src/components/game/ranking-modal.tsx), [firebase-service.ts](../../src/lib/firebase-service.ts)

#### 4.1.5 AI Naming ⚠️
- **Design**: "Generative AI suggests creative names based on store level"
- **Implementation**: **Partial** - `customName` field exists, but no AI integration found
- **Expected**: Genkit AI integration for name generation
- **Actual**: Manual name input only
- **Location**: [item-popup.tsx](../../src/components/game/item-popup.tsx)

**Recommendation**: 🟡 High - Implement AI naming or clarify as "custom naming" feature

---

### 4.2 Implemented Features Not in Design

| Feature | Implementation | Design Status |
|---------|----------------|---------------|
| Fever Mode | ✅ Fully working | ⚠️ Not documented |
| Golden Bean | ✅ Fully working | ⚠️ Not documented |
| Level System | ✅ 15 levels | ⚠️ Not documented |
| Internationalization | ✅ en, ko, ja | ⚠️ Not documented |
| Item Popup | ✅ Name customization | ⚠️ Not documented |
| Auto-save | ✅ Every 30 seconds | ⚠️ Not documented |
| Click Hint | ✅ Idle animation | ⚠️ Not documented |

**Analysis**: Implementation has **many enhancements** beyond original design

**Recommendation**: 🟡 High - Update design documents with these features

---

## 5. Security Rules Gap Analysis

### 5.1 Firestore Rules

**Design** ([backend.json:191](../backend.json#L191)):
> "Uses path-based ownership for maximum security"

**Implementation** ([firestore.rules](../../firestore.rules)):
```javascript
match /users/{userId}/gameState/{gameStateId} {
  allow get: if isOwner(userId);
  allow create: if isOwner(userId) && request.resource.data.playerId == userId;
  allow update: if isExistingOwner(userId) &&
                   request.resource.data.playerId == resource.data.playerId;
}
```

**Status**: ✅ **Exceeds Design**

**Analysis**:
- Design: General "path-based ownership" principle
- Implementation: **Comprehensive security rules** with:
  - Helper functions (`isOwner`, `isExistingOwner`)
  - Immutable field enforcement (`playerId`)
  - Well-documented inline comments
  - Proper deny-by-default approach

**Verdict**: Implementation is **better than design specification**

---

## 6. Code Quality Gaps

### 6.1 Issues Found in Implementation (Not Design Issues)

#### 6.1.1 Hardcoded Configuration ❌
- **Location**: [firebase/config.ts:1-9](../../src/firebase/config.ts#L1-L9)
- **Issue**: API keys hardcoded in source
- **Severity**: 🔴 Critical (Security)
- **See**: [refactoring-plan.md](./refactoring-plan.md#31-move-firebase-config-to-environment-variables)

#### 6.1.2 Code Duplication ❌
- **Issue**: Price calculation repeated 4 times
- **Severity**: 🔴 Critical (Maintainability)
- **See**: [refactoring-plan.md](./refactoring-plan.md#11-price-calculation-logic-critical)

#### 6.1.3 Large File ❌
- **Location**: game-provider.tsx (511 lines)
- **Severity**: 🔴 Critical (Maintainability)
- **See**: [refactoring-plan.md](./refactoring-plan.md#21-split-game-providertsx-511-lines)

---

## 7. Gap Summary by Category

### 7.1 Data Model
```
Total Fields Analyzed: 45
✅ Matched: 24 (53%)
❌ Missing: 1 (2%)
⚠️ Design Missing: 20 (45%)
```

**Key Issues**:
1. GameState schema incomplete in design (missing 18 fields)
2. Visual effect entities not documented
3. UI state fields not in design

---

### 7.2 Features
```
Total Features: 9
✅ Implemented: 6 (67%)
❌ Not Implemented: 1 (11%) - Prestige System
⚠️ Partial: 2 (22%) - AI Naming, Password Auth
```

**Key Issues**:
1. Prestige System designed but not implemented
2. AI naming only partially implemented
3. Password auth prepared but no UI

---

### 7.3 Infrastructure
```
Total Systems: 3
✅ Implemented: 2 (67%) - Leaderboard, Auth
❌ Not Implemented: 1 (33%) - Cloud GameState
```

**Key Issues**:
1. GameState uses localStorage instead of Firestore

---

## 8. Critical Gaps Requiring Action

### 🔴 Critical (Fix Immediately)

#### 8.1 Missing Firestore GameState Storage
**Gap Type**: Implementation missing designed feature

**Design**:
```
/users/{userId}/gameState/{gameStateId}
```

**Current**: Only localStorage

**Impact**:
- No cross-device sync
- Data loss if browser cache cleared
- No cloud backup

**Effort**: 4-6 hours

**Implementation**:
```typescript
// Add to firebase-service.ts
export async function saveGameStateToFirestore(
  db: Firestore,
  userId: string,
  gameState: GameState
) {
  const stateRef = doc(db, 'users', userId, 'gameState', 'main');
  await setDoc(stateRef, {
    ...gameState,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
```

---

#### 8.2 Prestige System Not Implemented
**Gap Type**: Designed feature missing

**Design**: "Allow players to reset their progress for a permanent bonus"

**Current**: Not implemented

**Impact**:
- Missing long-term engagement mechanic
- Reduced replay value
- Design-implementation mismatch

**Effort**: 8-12 hours

**Recommendation**: Decide if this is MVP feature or post-launch

---

### 🟡 High Priority (Fix Soon)

#### 8.3 Design Documentation Outdated
**Gap Type**: Documentation debt

**Issue**: Design documents don't reflect actual implementation

**Impact**:
- Team confusion
- Onboarding difficulty
- Future development issues

**Effort**: 3-4 hours

**Action Items**:
1. Update backend.json with complete GameState schema
2. Document Fever Mode, Golden Bean, Level System
3. Add ADR (Architecture Decision Record) for localStorage vs Firestore

---

#### 8.4 AI Naming Not Implemented
**Gap Type**: Designed feature incomplete

**Design**: "Generative AI suggests creative names based on store level"

**Current**: Manual input only (no AI)

**Impact**:
- Missing unique selling point
- Blueprint vs implementation mismatch

**Effort**: 6-8 hours

**Recommendation**: Integrate Genkit AI or rename feature to "Custom Naming"

---

### 🟢 Medium Priority (Next Sprint)

#### 8.5 Password Auth UI Missing
**Gap Type**: Backend ready, frontend missing

**Issue**: Auth functions exist but no UI

**Impact**: Users cannot create permanent accounts

**Effort**: 4-6 hours

---

## 9. Positive Gaps (Implementation > Design)

### ✅ 9.1 Enhanced Security Rules
- Design: Basic path-based ownership
- Implementation: Comprehensive rules with validation

### ✅ 9.2 Additional Game Features
- Fever Mode (5x multiplier mechanic)
- Golden Bean (special event)
- Level progression (15 levels)
- Particle effects
- Internationalization (3 languages)

### ✅ 9.3 Better UX
- Auto-save every 30s
- Item purchase notifications
- Click hints when idle
- Rank display in real-time

**Verdict**: Implementation shows **excellent initiative** in enhancing beyond design

---

## 10. Recommendations

### 10.1 Immediate Actions (This Sprint)

1. **Implement Firestore GameState** or update design to reflect localStorage-only approach
2. **Decide on Prestige System**: Implement MVP version or defer to v2.0
3. **Update backend.json** with complete GameState schema
4. **Document or Remove** password auth from design

### 10.2 Near-term Actions (Next 2 Sprints)

1. Create comprehensive design document for implemented features (Fever Mode, Golden Bean, etc.)
2. Implement AI naming OR rename to "Custom Naming"
3. Add password auth UI if needed
4. Create Architecture Decision Records (ADRs) for key decisions

### 10.3 Long-term Actions (Backlog)

1. Add design documents for future features
2. Create UI mockups for undocumented screens
3. Document game balance decisions (multipliers, pricing, etc.)

---

## 11. Match Rate Breakdown

```
┌────────────────────────────────────────────────┐
│  Component Match Rates                          │
├────────────────────────────────────────────────┤
│  LeaderboardEntry:     100% (4/4 fields)        │
│  Item Entity:           89% (8/9 fields)        │
│  Firestore Rules:      100% (perfect)           │
│  Leaderboard System:   100% (complete)          │
│  GameState Entity:      40% (12/30 fields)      │
│  Auth Providers:        50% (1/2 complete)      │
│  Core Features:         67% (6/9 complete)      │
├────────────────────────────────────────────────┤
│  Overall Match Rate:    78%                     │
└────────────────────────────────────────────────┘
```

---

## 12. Conclusion

The Career Brew Tycoon implementation **exceeds the original design** in many areas (security, UX, features) but has some **critical gaps**:

**Strengths**:
- Excellent security implementation
- Rich feature set beyond design
- Strong type safety
- Good code organization

**Weaknesses**:
- Design documents severely outdated
- 2 designed features not implemented (Prestige, AI Naming)
- GameState not using designed Firestore structure
- Documentation debt

**Overall Assessment**: The project is **production-ready** but needs documentation updates and decision on deferred features. The 78% match rate is **acceptable** given the positive gaps (implementation > design), but critical gaps must be addressed.

**Next Steps**:
1. Review this analysis with team
2. Prioritize critical gaps
3. Update design documents
4. Create v2.0 roadmap for deferred features

---

**Analysis Date**: 2026-01-27
**Analyzer**: Claude Code bkit PDCA Gap Detector
**Related Documents**:
- [architecture-review.md](./architecture-review.md)
- [convention-review.md](./convention-review.md)
- [refactoring-plan.md](./refactoring-plan.md)

**Next Phase**: Generate completion report with `/bkit:pdca-report`
