# Contributing

Thanks for helping make `cursor-goal` less janky and more useful.

## Local setup

```bash
git clone https://github.com/Niko96-dotcom/cursor-goal.git
cd cursor-goal
npm install
npm run typecheck
npm test
npm run build
npm link
npm run install-skill:global   # or: npm run install-skill for project-only
```

Install paths for end users: [`docs/install.md`](docs/install.md).

## Development loop

```bash
npm run dev -- "Inspect this repo and write a short architecture note" --verify "test -f docs/architecture.md" --once
```

Use `/goal` in Cursor Agent chat for the actual agent loop. The CLI records state and checkpoints only.

## Before a PR

```bash
npm run typecheck
npm test
```

Add tests for parser, lifecycle, checkpoint policy, and validation safety changes.

## Pull request expectations

- Keep the CLI small and dependency-light.
- Add tests for parser, lifecycle, and safety behavior.
- Do not add telemetry.
- Preserve the Codex-like command surface unless there is a clear reason to diverge.
- Document any divergence from Codex Goal mode in `docs/codex-goal-research.md`.
- Update `CHANGELOG.md` under **Unreleased** or the target version when user-facing behavior changes.

## Releases

Maintainers: [`docs/publishing.md`](docs/publishing.md).
