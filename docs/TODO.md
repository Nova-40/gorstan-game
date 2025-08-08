# Gorstan Game - Issues, Risks & Improvements TODO

## ✅ COMPLETED (Baseline Fixes)

### Critical Fixes
- [x] **TypeScript Error** - Fixed missing NPC location property in Ayla helper
- [x] **ESLint Configuration** - Created v9 compatible config file
- [x] **NPC Modal Double-Echo** - Removed duplicate message logging in handleNPCMessage
- [x] **QuickActionsPanel Syntax Error** - Fixed malformed object in availableDirections
- [x] **Architecture Documentation** - Created comprehensive project overview
- [x] **NPCs Documentation** - Created NPC system flow documentation
- [x] **Visual Assets Documentation** - Created PNG→GIF upgrade guidelines

### Infrastructure Improvements
- [x] **Smoke Test Framework** - Created Playwright-based testing infrastructure
- [x] **Build Verification** - TypeScript and build process validation
- [x] **Debug Commands** - Added `status` and `test` commands for development
- [x] **Teleport Enhancement** - Improved zone-aware teleport animation triggering

## 🔴 HIGH PRIORITY (Critical Issues)

### Movement System Diagnostics
- [ ] **QuickActionsPanel Direction Not Firing** - Investigate why direction buttons show but don't execute
  - [x] Verified button rendering and click handlers
  - [x] Fixed syntax error in availableDirections object
  - [ ] Test if issue persists after fixes
  - [ ] Debug room loading and state initialization
  - [ ] Check if game stage affects button functionality

### Core Game Loop Issues
- [ ] **Duplicate Description on ControlNexus Arrival** - Fix double room-description print
  - [ ] Trace TeletypeIntro → ControlNexus transition
  - [ ] Identify duplicate dispatch source
  - [ ] Implement atomic console clear solution
  - [ ] Add unit test for single description assertion

### NPC System Verification
- [ ] **Wandering NPCs Movement** - Verify NPCs actually move when conditions permit
  - [ ] Check timer activation in wanderingNPCController
  - [ ] Validate movement scheduling logic
  - [ ] Test NPC location updates
  - [ ] Add regression tests for movement system

## 🟡 MEDIUM PRIORITY (Important Features)

### Death & Lives System
- [ ] **Implement Generalized Death System**
  - [ ] Create 9 lives per run system
  - [ ] Standardized 'Game Over' overlay
  - [ ] Special death handling (paradox, Polly, Mr. Wendell)
  - [ ] Persist "Dominic killed" flag across resets
  - [ ] Test death/respawn flow

### Polly Takeover Timer
- [ ] **Verify/Implement Polly Takeover Sequence**
  - [ ] 4m20s timer implementation
  - [ ] Morthos and Al warning system
  - [ ] "Ask Ayla" help integration during takeover
  - [ ] Reset room fast-track functionality
  - [ ] Success/failure path testing

### Schrödinger Coin Logic
- [ ] **Audit Schrödinger Coin & Library Extrapolator**
  - [ ] Validate coin state branches (visible vs. pickable)
  - [ ] Test extrapolator gating behavior
  - [ ] Document edge cases in /docs/items.md
  - [ ] Create integration tests for both branches

## 🟢 LOW PRIORITY (Quality of Life)

### Asset System Improvements
- [ ] **PNG → Animated GIF Safe Asset Swap**
  - [ ] Implement fallback system (GIF → PNG → fallback.png)
  - [ ] Add per-room animation config
  - [ ] Performance guardrails (lazy load, pause when hidden)
  - [ ] File size budget enforcement
  - [ ] Animation quality guidelines

### Performance & Accessibility
- [ ] **Performance Pass**
  - [ ] Profile rendering hotspots
  - [ ] Add beneficial memoization
  - [ ] Audio user-gesture gating and volume controls
  - [ ] Memory usage optimization

- [ ] **Accessibility Improvements**
  - [ ] High-contrast terminal option
  - [ ] Full keyboard navigation
  - [ ] Screen reader labels and aria-live regions
  - [ ] Respect prefers-reduced-motion

### Developer Experience
- [ ] **Logging & Debug Improvements**
  - [ ] Standardize user vs dev logging (DEV: prefix)
  - [ ] Collapse noisy logs behind debug flag
  - [ ] In-game dev panel toggle
  - [ ] Current room/zone/timer display
  - [ ] Last 20 console lines viewer

## 🔧 TESTING & QUALITY ASSURANCE

### Automated Testing
- [ ] **Jest Test Suite Creation**
  - [ ] Movement reducer and room adjacency tests
  - [ ] Teleport transitions and overlays tests
  - [ ] NPC modal send/clear tests
  - [ ] Death/respawn + lives decrement tests
  - [ ] Schrödinger coin branches + extrapolator gate tests
  - [ ] Ask Ayla "help to reset room" during PollyTakeover tests

### CI/CD Pipeline
- [ ] **GitHub Actions Integration**
  - [ ] TypeScript verification
  - [ ] ESLint checks
  - [ ] Automated test execution
  - [ ] Build verification
  - [ ] Fail CI on any errors

### Smoke Testing Enhancement
- [ ] **Improve Smoke Test Coverage**
  - [ ] Boot verification
  - [ ] Initial render validation
  - [ ] QuickActionsPanel direction testing
  - [ ] Console command execution (xyzzy, plugh)
  - [ ] Zone teleportation testing
  - [ ] NPC modal interaction testing
  - [ ] Inventory add/remove testing

## 🚨 RISK ASSESSMENT

### High Risk Areas
1. **State Management Complexity** - Large state object with many interdependencies
2. **Room Loading System** - Dynamic imports could fail on missing modules
3. **Memory Leaks** - Timer cleanup and effect dependencies need monitoring
4. **Asset Loading** - Missing images/audio could break immersion
5. **Mobile Compatibility** - Complex UI may not work well on small screens

### Technical Debt
1. **Large Components** - AppCore.tsx is 1,259 lines and needs refactoring
2. **Type Safety Gaps** - Some `any` types remain in the codebase
3. **Error Handling** - Inconsistent error handling patterns
4. **Performance** - No performance monitoring or optimization
5. **Browser Compatibility** - Modern features may not work in older browsers

### Game Logic Risks
1. **Save/Load System** - Complex state serialization could corrupt saves
2. **Flag Dependencies** - Interconnected flags could create impossible states
3. **NPC Logic** - Complex interaction patterns might have edge cases
4. **Achievement System** - Achievement triggers could fire incorrectly
5. **Timer Management** - Multiple concurrent timers could conflict

## 📋 PR & COMMIT STRATEGY

### Small, Focused PRs
1. **QuickActions Fix** - Movement button functionality + tests
2. **NPC Modal Improvements** - Input clearing + wandering verification
3. **Teleport Overlays** - Zone-aware effects + sound integration
4. **Death System** - Lives tracking + respawn flow
5. **Asset Swap System** - GIF fallback + performance guardrails
6. **Testing Infrastructure** - Jest setup + CI integration

### Each PR Must Include
- [ ] **Summary of Intent** - Clear description of changes
- [ ] **Risk Assessment** - Logic preserved, verification methods
- [ ] **Test Evidence** - Unit tests and/or smoke test results
- [ ] **Manual QA Steps** - Step-by-step testing instructions
- [ ] **Performance Impact** - Memory/speed considerations
- [ ] **Breaking Changes** - API or behavior changes noted

## 🎯 SUCCESS CRITERIA

### Immediate Goals (Week 1)
- [ ] All critical TypeScript/build errors resolved
- [ ] QuickActionsPanel movement buttons functional
- [ ] NPC modal input clearing working correctly
- [ ] Basic smoke test passing consistently

### Short Term Goals (Month 1)
- [ ] Complete death/lives system implemented
- [ ] Polly Takeover timer sequence verified
- [ ] Teleport animations fully functional
- [ ] Comprehensive test suite created

### Long Term Goals (Quarter 1)
- [ ] Performance optimized for production
- [ ] Full accessibility compliance
- [ ] Asset system upgraded with GIF support
- [ ] CI/CD pipeline fully operational

## 📝 DOCUMENTATION NEEDS

### User Documentation
- [ ] **Player Guide** - How to play the game
- [ ] **Command Reference** - Available commands and shortcuts
- [ ] **Troubleshooting** - Common issues and solutions

### Developer Documentation
- [ ] **Contributing Guide** - How to add rooms, NPCs, items
- [ ] **API Reference** - Hook and utility documentation
- [ ] **Testing Guide** - How to run and write tests
- [ ] **Deployment Guide** - Build and deployment instructions

### Technical Documentation
- [ ] **Performance Benchmarks** - Speed and memory baselines
- [ ] **Browser Support Matrix** - Tested browser versions
- [ ] **Asset Guidelines** - Image and audio requirements
- [ ] **Security Considerations** - XSS prevention and data safety
