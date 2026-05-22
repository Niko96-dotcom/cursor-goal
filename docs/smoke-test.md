# Smoke verification

Zero-token proof that `cursor-goal` behaves correctly without any Agent SDK.

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

```text
/goal Create live-smoke.txt containing ok. Verify with: test -f live-smoke.txt && grep -qx ok live-smoke.txt
```

After the agent finishes, confirm:

```bash
cursor-goal
cat .goal/current.json
```

Uses your Cursor subscription. No API key.
