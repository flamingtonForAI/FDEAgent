# Security Backlog

Remaining security items for future releases, prioritized by real-world risk.

## Next Version (Should Fix)

### 1. API Key Storage: Backend Proxy (Stretch Goal)
**Risk:** HIGH — XSS can steal all provider API keys from sessionStorage
**Current state:** Keys stored in `sessionStorage` (plain JSON), cleared on tab close. UI risk disclosure added in UnifiedSettings (Option B completed).
**Remaining:** Option A — backend proxy to eliminate client-side key exposure entirely.

## Later (Nice to Have)

### 4. Rate Limit on AI Proxy Calls
**Risk:** LOW — If backend proxy is implemented (#1A), unauthenticated/abusive users could burn API quota
**Fix:** Rate limit AI-related endpoints per user, separate from auth rate limits.

### 5. Audit Log for Sensitive Operations
**Risk:** LOW — No server-side log of who accessed/modified what projects
**Fix:** Add audit trail for project create/delete/export and auth events. Already have `audit` table in Prisma schema — wire it up.

## Completed (This Release)

- [x] Remove demo password from frontend bundle (authService, LoginForm, locales, README)
- [x] JWT fallback secret: production fail-fast enforced
- [x] `.env.example` placeholder hardening
- [x] Demo scope ID documented
- [x] `.env` files verified not in git history
- [x] API key storage: UI risk disclosure in UnifiedSettings (5 languages)
- [x] Demo account: `DEMO_ENABLED` env toggle + Prisma seed script (`prisma/seed.ts`)
- [x] Demo: remove offline fallback — all auth goes through backend, no client-side bypass
- [x] Demo: seed password read from `DEMO_PASSWORD` env var (no hardcoded credentials in repo)
- [x] CSP: `Content-Security-Policy` meta tag in `index.html` (whitelists known CDNs + API providers)
