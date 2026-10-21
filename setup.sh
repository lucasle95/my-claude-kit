#!/usr/bin/env bash
# Sets up my Claude Code kit on macOS or Linux.
# Run from the cloned repo:  bash setup.sh
# Add --skip-rtk to leave RTK out.
set -u
cd "$(dirname "$0")"

step() { echo; echo "==> $1"; shift; "$@" || echo "warning: '$*' did not finish cleanly (it may already be done)."; }

command -v claude >/dev/null || { echo "Claude Code is not installed. Install it first: https://claude.com/claude-code"; exit 1; }

# 1. My own plugin (reply-style skills)
step "Add lucas-kit marketplace" claude plugin marketplace add lucasle95/my-claude-kit
step "Install lucas-kit plugin" claude plugin install lucas-kit@lucas-kit

# 2. i-have-adhd, installed from its original repo so it stays up to date
step "Add i-have-adhd marketplace" claude plugin marketplace add ayghri/i-have-adhd
step "Install i-have-adhd plugin" claude plugin install i-have-adhd@i-have-adhd

# 3. Global CLAUDE.md preferences (read at the start of every session)
echo; echo "==> Update global CLAUDE.md"
target="$HOME/.claude/CLAUDE.md"
mkdir -p "$HOME/.claude"
if [ -f "$target" ]; then
  cp "$target" "$target.bak"
  # Drop any previous kit block, then append the current one
  sed '/<!-- my-claude-kit:start -->/,/<!-- my-claude-kit:end -->/d' "$target.bak" > "$target"
  printf '\n' >> "$target"
  cat claude-md/CLAUDE.md >> "$target"
  echo "Updated $target (backup saved as CLAUDE.md.bak)"
else
  cp claude-md/CLAUDE.md "$target"
  echo "Created $target"
fi

# 4. RTK (shrinks command output Claude reads)
if [ "${1:-}" != "--skip-rtk" ]; then
  if ! command -v rtk >/dev/null; then
    if command -v brew >/dev/null; then
      step "Install RTK" brew install rtk
    else
      echo "Install RTK manually: https://github.com/rtk-ai/rtk#installation"
    fi
  fi
  command -v rtk >/dev/null && step "Connect RTK to Claude Code" rtk init -g
fi

echo; echo "Done. Restart Claude Code to load everything."
