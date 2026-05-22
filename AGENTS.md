# Agent guidance for cursor-goal

This repository builds a small TypeScript CLI around local `.goal/` state for Codex-style `/goal` loops in Cursor Agent chat.

End-user install: `docs/install.md`. Releases: `docs/publishing.md`, `CHANGELOG.md`.

Rules:

- Keep dependencies minimal. No `@cursor/sdk`.
- The agent loop runs in Cursor chat on the user's subscription.
- The CLI manages state, verification, and checkpoint accounting only.
- Preserve the Codex-style command surface.
- Do not add telemetry.
- Do not log secrets.
- Treat verification as the source of truth when provided.
- Keep generated files out of source unless they are part of a release process.
- Prefer small, testable modules.
