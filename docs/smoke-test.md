# Smoke verification

Zero-token proof that `cursor-goal` behaves correctly without any Agent SDK.

## Prerequisites

CLI on PATH from either:

```bash
npm install -g cursor-goal
```

or a source checkout with `npm link` after `npm run build`.

Skill install is **not** required for `npm test` (CLI-only). For manual `/goal` in Cursor, install the skill first — see [`install.md`](install.md).

## Default

```bash
npm test
```

| Test | What it proves |
|------|----------------|
| `test/smoke.test.ts` | CLI set/status/pause/clear lifecycle |
| `test/smoke.test.ts` | `recordCheckpoint()` with real shell verification |
| `test/smoke.test.ts` | `cursor-goal checkpoint` via stdin |
| `test/loopPolicy.test.ts` | Completion vs validation vs spin-loop blocking |
| parser/args/validation tests | Codex-style parsing and safety |

## CLI live smoke (no Cursor UI)

Automated E2E in a temp directory: set goal → create artifact → `checkpoint` CONTINUE → `checkpoint` COMPLETE → verify `status: complete`. Same flow as the manual steps below, runnable via `tsx src/index.ts`.

## Manual `/goal` proof in Cursor

1. Install skill: `cursor-goal-install-skill --global` (or `npm run install-skill:global` from clone).
2. In Agent chat:

```text
/goal Create live-smoke.txt containing ok. Verify with: test -f live-smoke.txt && grep -qx ok live-smoke.txt
```

3. After the agent finishes, confirm:

```bash
cursor-goal
cat .goal/current.json
```

Uses your Cursor subscription. No API key.
