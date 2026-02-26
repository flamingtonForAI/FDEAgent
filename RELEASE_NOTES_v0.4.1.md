# FDEAgent v0.4.1 - Security & Architecture Update

> Release Date: 2026-02-26

## Summary

This release includes critical multi-tenant security fixes and code architecture improvements.

## Changes

### Security Fixes (Critical)

#### Multi-Tenant Data Isolation
- **User-scoped localStorage keys**: All data now stored with `u:{userId}:{key}` prefix
- **Anonymous user isolation**: Non-authenticated users get session-based IDs
- **Automatic migration**: Legacy data migrated to user-scoped keys on login

#### Cloud Sync Ownership Verification
- All cloud operations now verify `project.userId === currentUser.id`
- Rejects unauthorized data before local storage
- Console security warnings for failed verifications

#### Race Condition Fixes
- Added `switchingLockRef` to prevent concurrent project switches
- Cancel pending saves before switching projects
- Double-check state before executing debounced saves

### Architecture Improvements

#### Code Organization
- Extracted 8 page components to `pages/` directory
- Added `ErrorBoundary` component for graceful error handling
- Reduced App.tsx complexity

#### Import Cleanup
- Removed 8 unused component imports
- Removed unused types (`OntologyObject`, `OntologyLink`)
- Removed unused icons

### Files Changed

```
lib/storage.ts              | 304 +++++++--  (user isolation + ownership verification)
contexts/ProjectContext.tsx |  39 +++- (race condition fixes)
contexts/AuthContext.tsx    |  13 ++   (user session storage)
App.tsx                     | 169 +------ (refactored with pages/)
components/ErrorBoundary.tsx| 127 ++++  (new error boundary)
pages/                      |  9 new files (page components)
```

## Security Audit Results

### Before
- ❌ localStorage keys shared across users
- ❌ No cloud ownership verification
- ❌ Race conditions in project switching

### After
- ✅ User-scoped storage keys
- ✅ Ownership verified on all cloud operations
- ✅ Race conditions mitigated with locks

### Issues Found & Fixed
1. **High**: Cross-account data exposure during migration → Fixed by requiring auth
2. **Medium**: Ownership check bypass → Fixed in fetchCloudProjectState
3. **Medium**: Mixed scoped/unscoped keys → Fixed throughout

## Testing Recommendations

- [ ] User A creates project, logs out
- [ ] User B logs in same browser, should NOT see User A's data
- [ ] User A logs back in, should see original projects
- [ ] Cloud sync rejects unauthorized data
- [ ] Rapid project switching doesn't corrupt data

## Migration Notes

Existing users will have their data automatically migrated to user-scoped keys on next login. Legacy keys are cleared after successful migration.

## Credits

Security review: Shadow (Kimi) + Codex  
Implementation: Shadow (Kimi)  
Architecture review: Shadow (Kimi) + Codex
