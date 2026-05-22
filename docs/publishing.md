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

Confirm the tarball includes:

- `dist/`, `scripts/install-skill.sh`, `.cursor/skills/goal/SKILL.md`
- `cursor-goal-install-skill` is listed under `bin` in `package.json`

Optional live smoke (temp directory): see [`smoke-test.md`](smoke-test.md).

## Version bump

1. Update `package.json` `version`.
2. Add a section to [`CHANGELOG.md`](../CHANGELOG.md).
3. Merge to `main` with green CI.
4. Tag and publish (below).

## GitHub release

Tag should point at `main` after CI is green:

```bash
gh release create v0.2.2 --title "v0.2.2" --notes-file - <<'EOF'
## Summary

- npm-first install docs and `cursor-goal-install-skill` for global skill setup.
- See [CHANGELOG.md](https://github.com/Niko96-dotcom/cursor-goal/blob/main/CHANGELOG.md) for full notes.

## Install

```bash
npm install -g cursor-goal
cursor-goal-install-skill --global
```

Then in Cursor Agent chat: `/goal <objective>`

Docs: https://github.com/Niko96-dotcom/cursor-goal/blob/main/docs/install.md
EOF
```

Publishing a GitHub release triggers `.github/workflows/publish-npm.yml` when Trusted Publisher is configured.

## npm

### First publish (local, one time)

```bash
npm login
npm publish --access public
```

### Automated publishes (recommended)

1. On [npmjs.com](https://www.npmjs.com/package/cursor-goal) → **Settings → Trusted Publishers** → add:
   - **Provider:** GitHub Actions
   - **Repository:** `Niko96-dotcom/cursor-goal`
   - **Workflow filename:** `publish-npm.yml`
   - **Environment:** (leave empty unless you use one)
2. Publish a GitHub release (`release: published`) — CI runs `npm publish` with OIDC (no `NPM_TOKEN` secret).

Workflow: [`.github/workflows/publish-npm.yml`](../.github/workflows/publish-npm.yml).

### Trusted Publisher troubleshooting

If **Publish npm** fails with `ENEEDAUTH` / `need auth`:

- Trusted Publisher is not linked yet, or workflow filename/repo do not match npm settings.
- Fix npm Trusted Publisher, then re-run the workflow or publish a new GitHub release.
- One-time fallback: `npm login` locally and `npm publish --access public` from a clean `main` checkout after `npm run build`.

Manual workflow dispatch also requires Trusted Publisher; it does not use a stored token.
