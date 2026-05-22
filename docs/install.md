# Install

`cursor-goal` has two parts:

1. **CLI** (`cursor-goal` / `cgoal`) — `.goal/` state, verification, checkpoints
2. **Cursor skill** — enables `/goal` in Agent chat

Both are required for the full experience.

## Quick start (npm, recommended)

```bash
npm install -g cursor-goal
cursor-goal-install-skill --global
```

Confirm:

```bash
cursor-goal --version
ls ~/.cursor/skills/goal/SKILL.md
```

In any project workspace, open Cursor Agent chat and run:

```text
/goal <your objective>
```

## From source (contributors)

```bash
git clone https://github.com/Niko96-dotcom/cursor-goal.git
cd cursor-goal
npm install
npm run build
npm link
npm run install-skill:global
```

Project-local skill only (this repo):

```bash
npm run install-skill
```

## Skill install options

| Method | Command | Installs to |
|--------|---------|-------------|
| Global (all workspaces) | `cursor-goal-install-skill --global` | `~/.cursor/skills/goal/` |
| Project | `cursor-goal-install-skill` | `./.cursor/skills/goal/` |
| From clone | `npm run install-skill:global` | same as global |
| Manual copy | see below | your choice |

Manual copy after a global npm install:

```bash
PKG="$(npm root -g)/cursor-goal"
mkdir -p ~/.cursor/skills
rm -rf ~/.cursor/skills/goal
cp -R "$PKG/.cursor/skills/goal" ~/.cursor/skills/goal
```

## Requirements

- **Node.js 22+** — for the CLI
- **Cursor Agent chat** — the agent loop runs in chat on your subscription
- **No API key** — does not use `@cursor/sdk`

Optional env (see `.env.example`):

```bash
export CURSOR_GOAL_MODEL=composer-2.5
```

Recorded in goal state for audit only; the model you select in Cursor chat is what runs.

## Uninstall

```bash
npm uninstall -g cursor-goal
rm -rf ~/.cursor/skills/goal
```

Remove per-project skills with `rm -rf .cursor/skills/goal` if you installed locally.

## Troubleshooting

**`/goal` does nothing or is unknown**

- Install the skill: `cursor-goal-install-skill --global`
- Restart Cursor or open a new Agent chat
- Confirm `~/.cursor/skills/goal/SKILL.md` exists

**`cursor-goal: command not found`**

- Reinstall: `npm install -g cursor-goal`
- Check PATH includes your global npm bin directory (`npm bin -g`)

**Skill works but checkpoints fail**

- Run `cursor-goal` from the project root (where `.goal/` should live)
- Pass `--verify` with a safe, repo-specific command when setting the goal
