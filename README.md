# my-claude-kit

My personal Claude Code setup, so any new machine gets the same skills and preferences.

## What's inside

| Piece | What it does |
|---|---|
| `plain-english` skill | Short, plain-English replies. Turn on with `/lucas-kit:plain-english`, off with "normal mode". |
| [i-have-adhd](https://github.com/ayghri/i-have-adhd) | Action-first, scannable replies. Installed from its own repo. Turn on with `/i-have-adhd`. |
| `claude-md/CLAUDE.md` | Always-on preferences, added to `~/.claude/CLAUDE.md`. |
| [RTK](https://github.com/rtk-ai/rtk) | Shrinks command output Claude reads, to save tokens. Optional. |

## Set up a new machine

Needs Git and Claude Code installed.

```bash
git clone https://github.com/lucasle95/my-claude-kit.git
cd my-claude-kit
```

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup.ps1
```

macOS / Linux:

```bash
bash setup.sh
```

Add `-SkipRtk` (Windows) or `--skip-rtk` (macOS/Linux) to leave RTK out. Restart Claude Code afterwards.

## Just the plugin

```bash
claude plugin marketplace add lucasle95/my-claude-kit
claude plugin install lucas-kit@lucas-kit
```

## Updating

Edit the files here, bump `version` in `.claude-plugin/plugin.json`, commit and push. On each machine:

```bash
claude plugin marketplace update lucas-kit
```

## Removing

```bash
claude plugin uninstall lucas-kit
claude plugin uninstall i-have-adhd
```

Delete the block between the `my-claude-kit` markers in `~/.claude/CLAUDE.md`.
