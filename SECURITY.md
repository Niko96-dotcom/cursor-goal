# Security Policy

`cursor-goal` can run shell verification commands in your workspace and is designed to pair with Cursor Agent chat, which can edit files and run tools. Treat it like a developer tool with real workspace access.

Install and scope: [`docs/install.md`](docs/install.md).

## Reporting issues

For non-sensitive bugs, open a [GitHub issue](https://github.com/Niko96-dotcom/cursor-goal/issues/new). Do not paste secrets, tokens, or private `.goal/` logs.

For sensitive reports, use [GitHub Security Advisories](https://github.com/Niko96-dotcom/cursor-goal/security/advisories/new) (private disclosure) or contact [@Niko96-dotcom](https://github.com/Niko96-dotcom) directly.

## Safety defaults

- Destructive verification commands are blocked unless `--allow-destructive` is used.
- Secrets are not intentionally logged.
- Goal state and run logs are local files under `.goal/`.
- Users should review diffs before committing or deploying agent changes.
