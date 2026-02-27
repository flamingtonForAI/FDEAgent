# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Delivery export mode switch in `DeliverableGenerator`:
  - `Internal Draft`
  - `Client Delivery`
- Hard delivery gate in client mode:
  - blocks export when `runQualityCheck(project)` has any `error` issue
  - blocks export when any action three-layer status is `minimal`
- Delivery package metadata form:
  - client name
  - designer name
  - delivery version
  - release notes
- Required metadata check in `Client Delivery` mode:
  - client name required
  - designer name required
- One-click ZIP package export (frontend-only, zero-dependency ZIP implementation):
  - `00-cover.md` (client mode only)
  - `01-api-spec.yaml`
  - `02-data-model.md`
  - `03-agent-tools.json`
  - `04-brd.md`
  - `05-integration-guide.md`
  - `delivery-metadata.json`
- New centralized model capability map in `lib/llmCapabilities.ts` for consistent UI and file-compatibility behavior.
- Dynamic model registry system:
  - `lib/modelRegistry.ts` with memory + sessionStorage cache
  - cache key uses SHA-256 hash of API key prefix (no plain key stored)
  - provider-level TTL (OpenRouter 30m, others 10m)
- `hooks/useModelRegistry.ts`:
  - auto-refresh on provider/API key change (800ms debounce)
  - request cancellation via `AbortController`
  - fallback state exposed for no-key mode

### Changed
- README updated to include:
  - delivery gate behavior
  - delivery packaging capability
- ZIP packaging behavior updated:
  - draft mode includes no cover page
  - draft mode still has ZIP download entry
- Object URL cleanup in downloads now uses delayed revoke (`setTimeout`) to avoid browser async download race issues.
- YAML export serialization switched from custom formatter to `yaml` package (`YAML.stringify`) for better compatibility with special characters.
- Chat send UX after file upload improved in `GlobalChatBar`:
  - send button now disabled when uploaded files are provider-blocked
  - blocking reason is shown inline near the input area
  - per-file compatibility warning is shown in uploaded file list
- Model configuration warning added:
  - `UnifiedSettings` and `Settings` now show Office compatibility warning when selected provider/model may block `.docx/.xlsx/.pptx`.
- Model selection UX upgrades in `UnifiedSettings` and `Settings`:
  - searchable model list (name/ID keyword)
  - recommended Office-capable latest models highlighted with `★` + bold + `Recommended`
  - per-model capability tags (`Office`, `PDF`) and selected-model capability summary (`Office/PDF/Image`)
- `UnifiedSettings` model panel upgraded:
  - real-time model list fetch + manual refresh
  - quick filters (`Recommended` / `Vision` / `Office` / `Long Context`)
  - OpenRouter default collapsed view (recommended + search matches)
- `AIService.fetchAvailableModels()` now returns enriched model metadata when available:
  - modalities, context length, tools support, structured-output support, pricing

### Fixed
- File compatibility rules aligned with current multimodal implementation:
  - Gemini provider now treated as Office/PDF supported for uploads
  - Office blocking warnings now explicitly guide users to Gemini models
- Unified capability source:
  - `FileUpload` compatibility checks now reuse `llmCapabilities` logic
  - fixed prior over-permissive assumption where image support was effectively treated as universal

## [0.4.1] - 2026-02-26

### Added
- Project rename capability in project cards.
- Login/session isolation hardening:
  - register flow now persists `ontology-auth-session`
  - auth change listener clears stale session when unauthenticated

### Changed
- Authentication behavior aligned to product decision:
  - unauthenticated users can browse tutorials/templates/cases
  - project creation remains login-required
- Project write operations guarded in context layer:
  - create/switch/delete/update blocked without authentication

### Fixed
- Resolved "project not saved after creation" caused by missing auth session persistence in register flow.
- README version badge and release notes synchronized to `0.4.1`.

### Commits
- `99f5728` fix: enforce auth on project writes and add project rename
- `dedc036` docs: update README version to 0.4.1

## [0.4.0]

See `CHANGE_NOTES.md` for earlier architecture/security details. See `RELEASE_NOTES_v0.4.1.md` for cumulative release notes covering 0.4.0+.
