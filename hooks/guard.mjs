// PreToolUse hook: checks Bash and PowerShell commands before Claude runs them.
//   deny -> blocked outright (wiping a drive root or home folder, formatting disks)
//   ask  -> Claude Code stops and asks you to approve first (recursive deletes, force pushes, ...)
// Anything else passes through untouched. Any error lets the command through
// rather than breaking Claude Code. Rules live in guard-rules.mjs.

import fs from "node:fs";
import { evaluate } from "./guard-rules.mjs";

try {
  const input = JSON.parse(fs.readFileSync(0, "utf8"));
  const command = input?.tool_input?.command;
  const verdict = typeof command === "string" ? evaluate(command) : null;

  if (verdict) {
    const reason =
      verdict.decision === "deny"
        ? `Blocked by lucas-kit guard: this command ${verdict.reason}. Do not retry it or work around it; tell the user what you wanted to do so they can decide.`
        : `lucas-kit guard: this command ${verdict.reason}. Approve only if you meant to.`;
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: verdict.decision,
          permissionDecisionReason: reason,
        },
      }),
    );
  }
} catch {
  // Never break Claude Code.
}
