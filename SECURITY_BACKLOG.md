# Security Backlog

Remaining security items for future releases, prioritized by real-world risk.

## Next Version (Should Fix)

### 1. API Key Storage: Backend Proxy or Explicit Risk Disclosure
**Risk:** HIGH — XSS can steal all provider API keys from sessionStorage
**Current state:** Keys stored in `sessionStorage` (plain JSON), cleared on tab close
**Options (pick one):**
- **A) Backend proxy** — Frontend sends requests to own backend, backend holds API keys server-side. Eliminates client-side key exposure entirely.
- **B) Explicit UI disclosure** — Add a clear notice in UnifiedSettings: "API keys are stored locally in your browser. Do not use on shared or untrusted machines." Acceptable if this is a single-user tool.
- **C) Encrypt at rest** — Wrap sessionStorage with a passphrase-derived key (e.g. `crypto.subtle`). Raises the bar for casual theft but does not stop a determined XSS attacker with access to the encryption key in JS memory.

**Recommendation:** Option B for now (honest, zero-effort), Option A as a stretch goal.

### 2. Demo Account: Server-Side Seed with Environment Toggle
**Risk:** MEDIUM — Current offline demo checks email only (no password validation)
**Current state:** Demo password removed from frontend. Offline fallback accepts any password with the demo email.
**Fix:** Add `DEMO_ENABLED=true/false` env var to backend. When disabled, demo login returns 403. Seed demo account via Prisma seed script instead of hardcoded constants.

### 3. Content Security Policy (CSP)
**Risk:** MEDIUM — No CSP header means XSS has unrestricted access to DOM and storage
**Fix:** Add `Content-Security-Policy` header in Helmet config. Start with `script-src 'self'`, iterate as needed for inline styles and external fonts.

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
