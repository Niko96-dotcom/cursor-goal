# cursor-goal

A Codex-style `/goal` loop for **Cursor Agent chat**, with durable local state in `.goal/`.

The agent loop runs in Cursor on your subscription — like Codex Goal mode. The CLI does not spawn a second agent via `@cursor/sdk`. It manages goal state, verification, and checkpoint accounting while **you** (or `/goal` in chat) do the work.

**Install (npm):** `npm install -g cursor-goal && cursor-goal-install-skill --global`

**Repo:** https://github.com/Niko96-dotcom/cursor-goal · **npm:** https://www.npmjs.com/package/cursor-goal

## What it copies from Codex Goal mode

- `/goal <objective>` sets or replaces the active goal.
- `/goal` / `cursor-goal` shows the current goal.
- `/goal pause`, `/goal resume`, `/goal clear`, and `/goal edit` manage lifecycle.
- Goal text is both the starting prompt and completion criteria.
- Durable state in `.goal/current.json` and audit logs in `.goal/runs/*.md`.
- Each checkpoint ends with `GOAL_STATUS` / `GOAL_REASON` and optional shell verification.
- Continuation is suppressed when verification fails with no tool calls.

## Requirements

- Node.js 22+
- Cursor Agent chat (for the loop itself)
- `cursor-goal` on PATH and the goal skill installed (see [Install](#install))

No API key. No Agent SDK.

## Install

### npm (recommended)

```bash
npm install -g cursor-goal
cursor-goal-install-skill --global
```

### From source

```bash
git clone https://github.com/Niko96-dotcom/cursor-goal.git
cd cursor-goal
npm install
npm run build
npm link
npm run install-skill:global
```

Full paths, uninstall, and troubleshooting: [`docs/install.md`](docs/install.md).

## Use `/goal` in Cursor (primary)

```text
/goal Make the auth test suite pass without changing public API behavior. Verify with npm test -- auth.
```

The skill runs the loop in the **current chat**:

1. Sets `.goal/current.json` via `cursor-goal` when needed.
2. Makes checkpoint progress with normal Cursor tools.
3. Ends each checkpoint with `GOAL_STATUS` / `GOAL_REASON`.
4. Records evidence with `cursor-goal checkpoint` (verification + state update).
5. Continues while status is `active` and budget remains.

## CLI (state + verification helpers)

```bash
cursor-goal                                         # status
cursor-goal "<objective>" --verify "npm test"       # set goal
cursor-goal pause | resume | clear | edit "<obj>"   # lifecycle
cursor-goal prompt                                  # print continuation contract
cursor-goal checkpoint --tool-calls 3 <<'EOF'       # after a checkpoint
...
GOAL_STATUS: CONTINUE
GOAL_REASON: two tests still failing
EOF
```

Setting or resuming a goal prints: `Continue in Cursor Agent chat with: /goal resume`

Alias: `cgoal` (same binary).

## Strong goal pattern

```text
/goal <desired end state>, verified by <specific command or artifact>, while preserving <constraints>. Use <allowed files/tools>. Between checkpoints, record what changed, what evidence was checked, and the next best action. If blocked, stop with the blocker and the input needed.
```

More examples: [`examples/goal-prompts.md`](examples/goal-prompts.md).

## How it works

```text
Cursor chat (/goal)  →  work + GOAL_STATUS lines
                     →  cursor-goal checkpoint  →  verify shell cmd  →  .goal/current.json
                     →  continue in chat if still active
```

## Verification

See [`docs/smoke-test.md`](docs/smoke-test.md). `npm test` is zero-token smoke for CLI lifecycle + checkpoint recording.

## Docs

| Doc | Purpose |
|-----|---------|
| [`docs/install.md`](docs/install.md) | Install, skill, uninstall, troubleshooting |
| [`docs/smoke-test.md`](docs/smoke-test.md) | Automated and manual verification |
| [`docs/publishing.md`](docs/publishing.md) | Releases and npm CI |
| [`docs/codex-goal-research.md`](docs/codex-goal-research.md) | Codex Goal-mode alignment notes |
| [`CHANGELOG.md`](CHANGELOG.md) | Version history |

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Disclaimer

This project is unofficial and not affiliated with, endorsed by, or sponsored by OpenAI (Codex) or Cursor. Codex and Cursor are trademarks of their respective owners. `cursor-goal` implements a similar workflow inspired by public Codex Goal-mode documentation.

## License

MIT
