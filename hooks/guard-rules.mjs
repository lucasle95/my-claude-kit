// Rules for the guard hook. evaluate(command) returns null (let it run),
// { decision: "ask", reason } (you approve first) or { decision: "deny", reason } (blocked).

const DENY_RULES = [
  [/\b(mkfs(\.\w+)?|diskpart|format-volume|clear-disk|initialize-disk)\b/i, "formats or wipes a disk"],
  [/\bformat\s+[a-z]:/i, "formats a drive"],
  [/\bdd\b[^\n]*\bof=\/dev\//i, "writes directly to a disk device"],
  [/:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/, "is a fork bomb"],
];

const ASK_RULES = [
  [/\bgit\s+push\b[^\n]*(\s--force\b|\s--force-with-lease\b|\s-f\b|\s\+\S)/i, "force-pushes, which can overwrite history on GitHub"],
  [/\bgit\s+reset\s+--hard\b/i, "discards uncommitted changes (git reset --hard)"],
  [/\bgit\s+clean\b[^\n]*\s-[a-z]*f/i, "permanently deletes untracked files (git clean)"],
  [/\bgit\s+branch\b[^\n]*\s-D\b/, "force-deletes a branch"],
  [/\bgit\s+(checkout|restore)\s+(--\s+)?\.(\s|$)/i, "discards all local edits"],
  [/\b(chmod|chown)\s+(-\S*\s+)*-\S*R/, "changes permissions recursively"],
  [/\b(shutdown|reboot|restart-computer|stop-computer)\b/i, "shuts down or restarts the computer"],
  [/\b(curl|wget)\b[^\n|]*\|\s*(sudo\s+)?(ba|z)?sh\b/i, "downloads a script and runs it immediately"],
  [/\b(iwr|irm|invoke-webrequest|invoke-restmethod)\b[^\n|]*\|\s*(iex|invoke-expression)\b/i, "downloads a script and runs it immediately"],
  [/\bdrop\s+(table|database|schema)\b/i, "deletes a database table or database"],
  [/\b(rd|rmdir|del|erase)\s+(\S+\s+)*\/s\b/i, "deletes a folder and everything in it"],
];

// Locations that must never be wiped: drive roots, system folders, your home folder.
const PROTECTED_TARGET =
  /^(\/|\/\*|~|~\/\*|\$home(\/\*)?|\$\{home\}(\/\*)?|\$env:userprofile([\\/]\*)?|[a-z]:([\\/]\*?)?|\/[a-z](\/\*)?|\/(bin|boot|dev|etc|home|lib|opt|root|sbin|srv|sys|usr|var|users|windows)(\/\*)?|[a-z]:[\\/](windows|users|program files)([\\/]\*)?)$/i;

const DELETE_COMMANDS = new Set(["rm", "remove-item", "ri", "del", "erase", "rd", "rmdir"]);

// rm -r / -rf / -fr / --recursive, and PowerShell -Recurse (or any prefix of it, e.g. -r, -rec)
function isRecursiveFlag(flag) {
  return (
    /^--recursive$/i.test(flag) ||
    /^-r(e(c(u(r(s(e)?)?)?)?)?)?$/i.test(flag) ||
    /^-[fivdI]*[rR][rRfivdI]*$/.test(flag)
  );
}

// Find recursive deletes and check what they target.
function checkDeletes(command) {
  const segments = command.replace(/["'`]/g, " ").split(/[;&|\n(){}]+|\$\(/);
  let result = null;
  for (const segment of segments) {
    const tokens = segment.trim().split(/\s+/).filter(Boolean);
    for (let i = 0; i < tokens.length; i++) {
      const name = tokens[i].toLowerCase().replace(/^.*[\\/]/, "").replace(/\.exe$/, "");
      if (!DELETE_COMMANDS.has(name)) continue;
      const args = tokens.slice(i + 1);
      if (!args.filter((a) => a.startsWith("-")).some(isRecursiveFlag)) continue;
      const targets = args.filter((a) => !a.startsWith("-"));
      const isProtected = (t) => PROTECTED_TARGET.test(t === "/" ? t : t.replace(/[\\/]+$/, ""));
      if (targets.some(isProtected)) {
        return { decision: "deny", reason: `recursively deletes a protected location (${targets.join(" ")})` };
      }
      result = { decision: "ask", reason: `recursively deletes ${targets.join(" ") || "files"}` };
    }
  }
  return result;
}

export function evaluate(command) {
  for (const [pattern, reason] of DENY_RULES) {
    if (pattern.test(command)) return { decision: "deny", reason };
  }
  const del = checkDeletes(command);
  if (del?.decision === "deny") return del;
  for (const [pattern, reason] of ASK_RULES) {
    if (pattern.test(command)) return { decision: "ask", reason };
  }
  return del;
}
