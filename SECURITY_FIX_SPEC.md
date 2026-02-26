# Multi-Tenant Security Fix - Implementation Spec

## Background
FDEAgent has critical multi-tenancy vulnerabilities where:
1. localStorage keys are not user-scoped (data leaks between users on same browser)
2. Cloud sync lacks user ownership verification

## Task
Implement P0 security fixes in `lib/storage.ts` and related files.

## Requirements

### 1. User-Scoped localStorage Keys

Modify `lib/storage.ts`:

```typescript
// Add to class HybridStorage
private getUserId(): string | null {
  // Get current user ID from auth context or localStorage
  try {
    const authData = localStorage.getItem('ontology-auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.user?.id || null;
    }
  } catch {
    // ignore
  }
  return null;
}

private getScopedKey(key: string): string {
  const userId = this.getUserId();
  if (userId) {
    return `user:${userId}:${key}`;
  }
  // For anonymous users, use session-based isolation
  let anonId = sessionStorage.getItem('ontology-anon-id');
  if (!anonId) {
    anonId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('ontology-anon-id', anonId);
  }
  return `${anonId}:${key}`;
}
```

Update all localStorage operations to use `getScopedKey()`:
- `STORAGE_KEYS.PROJECTS_INDEX` → `getScopedKey('projects-index')`
- `STORAGE_KEYS.ACTIVE_PROJECT_ID` → `getScopedKey('active-project')`
- `STORAGE_KEYS.PROJECT_PREFIX` → scoped version

### 2. Cloud Sync Ownership Verification

Add to `lib/storage.ts`:

```typescript
private async verifyProjectOwnership(cloudProjectId: string): Promise<boolean> {
  try {
    const project = await projectService.getProject(cloudProjectId);
    const currentUserId = this.getUserId();
    return project.userId === currentUserId;
  } catch {
    return false;
  }
}
```

Update `loadProjectState()` to verify ownership before using cloud data:
```typescript
if (cloudData) {
  // Verify ownership before using cloud data
  const isOwner = await this.verifyProjectOwnership(cloudProjectId);
  if (!isOwner) {
    console.warn('Project ownership verification failed');
    return localData?.state || null;
  }
  // ... proceed with merge
}
```

### 3. Update AuthContext to Store User ID

Modify `contexts/AuthContext.tsx`:
- After login, store user data in localStorage with key `ontology-auth`
- On logout, clear the scoped localStorage keys for that user

### 4. Race Condition Mitigation

Add to `contexts/ProjectContext.tsx`:
```typescript
// Add to switchProject
const switchingLock = useRef<string | null>(null);

const switchProject = useCallback(async (projectId: string) => {
  if (projectId === activeProjectId) return;
  
  // Prevent concurrent switches
  if (switchingLock.current) {
    console.warn('Project switch already in progress');
    return;
  }
  
  switchingLock.current = projectId;
  
  try {
    // Cancel pending saves
    if (saveDebounceTimer.current) {
      clearTimeout(saveDebounceTimer.current);
    }
    // ... rest of switch logic
  } finally {
    switchingLock.current = null;
  }
}, [activeProjectId, currentOntology, currentChat]);
```

## Deliverables
1. Modified `lib/storage.ts` with user-scoped keys
2. Modified `lib/storage.ts` with ownership verification
3. Modified `contexts/AuthContext.tsx` to store user ID
4. Modified `contexts/ProjectContext.tsx` with race condition fix
5. Test plan: verify data isolation between users

## Constraints
- Maintain backward compatibility (migrate existing data)
- Do not change external API signatures
- Add console warnings for security events
- Keep all existing functionality working

## Files to Modify
1. `/root/clawd/FDEAgent/lib/storage.ts`
2. `/root/clawd/FDEAgent/contexts/AuthContext.tsx`
3. `/root/clawd/FDEAgent/contexts/ProjectContext.tsx`

## Success Criteria
- [ ] Different users on same browser see only their own projects
- [ ] Cloud sync verifies ownership before using data
- [ ] Rapid project switching doesn't cause data corruption
- [ ] Existing projects are migrated to user-scoped keys
