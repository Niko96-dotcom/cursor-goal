# Publishing

## Release checklist

Before tagging a release:

```bash
npm install
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

Optional live smoke (temp directory):

```bash
# See docs/smoke-test.md — full CLI + verification + checkpoint flow
```

## GitHub release

Tag should point at `main` after CI is green:

```bash
gh release create v0.2.1 --title "v0.2.1" --notes-file - <<'EOF'
## Summary

- Cursor Agent chat runs the goal loop; CLI manages `.goal/` state and verification only (no Agent SDK).
- Stricter persisted state validation and fail-closed checkpoint policy.
- CLI version reads from package.json.

## Install

git clone https://github.com/Niko96-dotcom/cursor-goal.git
cd cursor-goal && npm install && npm run build && npm link
npm run install-skill:global
EOF
```

## npm (optional)

```bash
npm publish --access public
```

Confirm package name `cursor-goal` is available on your npm account before publishing.
