# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Office document support across all AI providers (docx, xlsx, pptx):
  - New `lib/documentParser.ts` module for client-side text extraction
  - `parseDocx` via mammoth, `parseXlsx` via SheetJS, `parsePptx` via JSZip XML extraction
  - Dual-channel design: native API for supported providers + extractedText fallback for others
- Provider-specific Office file handling:
  - Gemini: File API upload (`ai.files.upload()` → `fileData` URI), with extractedText fallback on failure
  - OpenRouter: `type:'file'` base64 data URI (auto-parsed by OpenRouter for all models)
  - OpenAI: `type:'file'` base64 data URI (native 2025 support)
  - Zhipu / Moonshot / Custom: client-side extracted text as text attachment
- `UploadedFile` and `FileAttachment` interfaces extended with `extractedText` field
- Word document branch in `getFileTypeConfig` (previously fell through to Default)
- New dependencies: `mammoth` (docx), `xlsx` (spreadsheets), `jszip` (pptx ZIP extraction)

### Changed
- Office file upload no longer hard-blocks (`blockSend: false`); all providers now have some level of support
- Office compatibility warnings updated to reflect actual provider capability (native API vs text extraction)
- `callGeminiMultimodal`: Office files use File API instead of unreliable `inlineData`
- `callOpenAIMultimodal`: simplified provider branching — OpenRouter and OpenAI both use `type:'file'` for all document types
- `callZhipuMultimodal`: Office files use `extractedText` instead of placeholder message

### Previously Added
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
- Test connection button in `UnifiedSettings`:
  - reuses `AIService.testConnection()` with a temporary service instance carrying the latest key
  - disabled when no API key or test in progress
  - shows success (green) with model response preview, or failure (red) with error message
- Confirm / Cancel footer buttons in `UnifiedSettings`:
  - Confirm flushes pending API key changes then closes the panel
  - Cancel closes without persisting un-blurred key edits

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
- API key not persisted when user closes settings without blurring input field:
  - added `flushApiKey()` that syncs `localApiKey` → `aiSettings` on close/confirm
  - X close button and confirm button both call `flushApiKey()` before closing
- `loadAISettingsAsync` in `App.tsx` now checks `apiKeys[provider]` (not just `apiKey`) to decide whether to apply loaded config, fixing cases where multi-provider keys were silently discarded on startup.
- Provider key isolation: `aiService.getApiKey()`, `App.tsx` `activeProviderApiKey`, and `UnifiedSettings` `currentProviderKey` no longer fall back to the generic `apiKey` field when `apiKeys` map exists — prevents cross-provider key leakage on provider switch.
- File compatibility rules aligned with current multimodal implementation:
  - Gemini provider now treated as Office/PDF supported for uploads
  - Office blocking warnings now explicitly guide users to Gemini models
- Unified capability source:
  - `FileUpload` compatibility checks now reuse `llmCapabilities` logic
  - fixed prior over-permissive assumption where image support was effectively treated as universal
- Multi-provider API key isolation closed-loop (code review P1/P2):
  - `flushApiKey` and `handleProviderChange` now explicitly clear legacy `apiKey` field (`apiKey: ''`) on every write — eliminates the stale global key that caused cross-provider 401 errors
  - `loadAISettingsAsync` (App.tsx) replaced `apiKeys?.[provider] || apiKey` with `apiKeys`-existence check (`Object.values(apiKeys).some(...)`) — prevents legacy `apiKey` from leaking as fallback for a different provider
  - `handleProviderChange` flushes current provider key before switching, preventing loss of un-blurred input
  - `loadLocalConfig` checks `apiKeys` map (not just legacy `apiKey`) when deciding whether to apply saved config
- Template import connector mapping in `NewProjectDialog`:
  - connector-to-integration mapping now supports both Pattern A (`sourceSystem`, `mappedObjects`, `sync`) and Pattern B (`name`, `targetObjects`, `syncFrequency`, `configuration`) — previously only Pattern A was handled, causing empty integration names and "Unknown Object" for templates like healthcare-fhir
  - uses `flatMap` to correctly flatten one-to-many connector→target relationships
  - same dual-pattern logic also applied in `handleApplyArchetype` (App.tsx) for ArchetypeBrowser imports
- Template import object normalization in `NewProjectDialog`:
  - objects loaded from archetypes are now normalized with default empty arrays (`actions`, `properties`, `aiFeatures`) — previously raw archetype objects with missing optional fields caused `TypeError: Cannot read properties of undefined (reading 'length')` across multiple pages
- Defensive null guards on `obj.actions`, `obj.properties`, `obj.aiFeatures` across 7 files:
  - `OntologyVisualizer`, `AIPLogicMatrix`, `ProjectOverview`, `ToolSpecViewer`, `StructuringWorkbench`, `DeliverableGenerator`, `aiAnalysisService` — prevents crashes when objects have undefined optional array fields
- AI Analysis state lost on tab switch:
  - `isAnalyzing` and `error` states lifted from local `AIAnalyzer` state to App.tsx level — previously, switching tabs during analysis unmounted the component, losing the loading spinner and error state; the user would see "Ready to Analyze" with no indication that analysis was still running in the background
  - `hasApiKey` check in `AIAnalyzer` now also checks `apiKeys[provider]` map (not just legacy `apiKey` field), consistent with multi-provider key isolation

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
