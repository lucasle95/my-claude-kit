# my-claude-kit

My personal Claude Code setup, so any new machine gets the same skills and preferences.

## What's inside

| Piece | What it does |
|---|---|
| `plain-english` skill | Short, plain-English replies. Turn on with `/lucas-kit:plain-english`, off with "normal mode". |
| [i-have-adhd](https://github.com/ayghri/i-have-adhd) | Action-first, scannable replies. Installed from its own repo. Turn on with `/i-have-adhd`. |
| Guard hook | Checks every Bash/PowerShell command before it runs. Blocks catastrophic ones, asks you first for risky ones. See below. |
| `claude-md/CLAUDE.md` | Always-on preferences, added to `~/.claude/CLAUDE.md`. |
| [RTK](https://github.com/rtk-ai/rtk) | Shrinks command output Claude reads, to save tokens. Optional. |

## Guard hook

A `PreToolUse` hook (`hooks/`) that runs before Claude executes any Bash or PowerShell command.

| Result | Examples |
|---|---|
| **Blocked** | `rm -rf /`, `rm -rf ~`, `Remove-Item -Recurse C:\`, `mkfs`, `format D:`, `dd of=/dev/...` |
| **Asks you first** | `rm -rf <folder>`, `Remove-Item -Recurse`, `rd /s`, `git push --force`, `git reset --hard`, `git clean -f`, `git branch -D`, `curl ... \| sh`, `shutdown` |
| **Runs normally** | Everything else, e.g. `rm file.txt`, `git push origin main` |

Edit the rules in `hooks/guard-rules.mjs`, then run the tests:

```bash
node --test tests/
```

The guard is pattern-based. It catches common forms of these commands, not every possible way to write them, so treat it as a seatbelt, not a guarantee.

## Set up a new machine

Needs Git, Node.js (for the guard hook) and Claude Code installed.

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
