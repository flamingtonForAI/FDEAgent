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
- One-click ZIP package export (frontend-only implementation, no extra dependency):
  - `00-cover.md` (client mode only)
  - `01-api-spec.yaml`
  - `02-data-model.md`
  - `03-agent-tools.json`
  - `04-brd.md`
  - `05-integration-guide.md`
  - `delivery-metadata.json`

### Changed
- README updated to include:
  - delivery gate behavior
  - delivery packaging capability
- ZIP packaging behavior updated:
  - draft mode includes no cover page
  - draft mode still has ZIP download entry
- Object URL cleanup in downloads now uses delayed revoke (`setTimeout`) to avoid browser async download race issues.
- YAML export serialization switched from custom formatter to `yaml` package (`YAML.stringify`) for better compatibility with special characters.

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
