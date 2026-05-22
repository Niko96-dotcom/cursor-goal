# Changelog

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.2] - 2026-05-23

### Added

- `cursor-goal-install-skill` npm binary for global and project skill installs
- [`docs/install.md`](docs/install.md) with npm, source, and troubleshooting paths
- `CHANGELOG.md` for release notes

### Changed

- README and publishing docs: npm-first install, skill install after `npm i -g`
- npm package `files` now includes `scripts/` so install helpers ship with the tarball
- CONTRIBUTING, smoke-test, and examples cross-link install documentation

## [0.2.1] - 2026-05-22

### Added

- npm publish workflow (OIDC) and publishing guide
- Model label helper folded into checkpoint audit trail
- Stricter persisted state validation and fail-closed checkpoint policy

### Changed

- Launch documentation and README polish

## [0.2.0] - 2026-05-22

### Added

- Initial public release: Codex-style `/goal` loop for Cursor Agent chat
- CLI for `.goal/` state, verification, and checkpoints
- Goal skill for in-chat loop (no Agent SDK)
