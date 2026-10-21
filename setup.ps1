# Sets up my Claude Code kit on a Windows machine.
# Run from the cloned repo:  powershell -ExecutionPolicy Bypass -File .\setup.ps1
# Add -SkipRtk to leave RTK out.
param([switch]$SkipRtk)

function Invoke-Step($Label, [scriptblock]$Action) {
    Write-Host "`n==> $Label" -ForegroundColor Cyan
    & $Action
    if ($LASTEXITCODE -ne 0) { Write-Warning "$Label did not finish cleanly (it may already be done)." }
}

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Error "Claude Code is not installed. Install it first: https://claude.com/claude-code"
    exit 1
}

# 1. My own plugin (reply-style skills)
Invoke-Step "Add lucas-kit marketplace" { claude plugin marketplace add lucasle95/my-claude-kit }
Invoke-Step "Install lucas-kit plugin" { claude plugin install lucas-kit@lucas-kit }

# 2. i-have-adhd, installed from its original repo so it stays up to date
Invoke-Step "Add i-have-adhd marketplace" { claude plugin marketplace add ayghri/i-have-adhd }
Invoke-Step "Install i-have-adhd plugin" { claude plugin install i-have-adhd@i-have-adhd }

# 3. Global CLAUDE.md preferences (read at the start of every session)
Write-Host "`n==> Update global CLAUDE.md" -ForegroundColor Cyan
$claudeDir = Join-Path $env:USERPROFILE ".claude"
$target = Join-Path $claudeDir "CLAUDE.md"
$block = (Get-Content (Join-Path $PSScriptRoot "claude-md\CLAUDE.md") -Raw).Trim()
New-Item -ItemType Directory -Force $claudeDir | Out-Null
if (Test-Path $target) {
    Copy-Item $target "$target.bak" -Force
    $current = Get-Content $target -Raw
    $pattern = '(?s)<!-- my-claude-kit:start -->.*?<!-- my-claude-kit:end -->'
    if ($current -match $pattern) {
        $updated = [regex]::Replace($current, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $block })
    } else {
        $updated = $current.TrimEnd() + "`r`n`r`n" + $block + "`r`n"
    }
    Set-Content $target $updated -Encoding utf8 -NoNewline
    Write-Host "Updated $target (backup saved as CLAUDE.md.bak)"
} else {
    Set-Content $target ($block + "`r`n") -Encoding utf8 -NoNewline
    Write-Host "Created $target"
}

# 4. RTK (shrinks command output Claude reads)
if (-not $SkipRtk) {
    if (-not (Get-Command rtk -ErrorAction SilentlyContinue)) {
        Invoke-Step "Install RTK" { winget install rtk-ai.rtk }
        # Pick up the new PATH without reopening the terminal
        $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
    }
    if (Get-Command rtk -ErrorAction SilentlyContinue) {
        Invoke-Step "Connect RTK to Claude Code" { rtk init -g }
    } else {
        Write-Warning "RTK isn't on PATH yet. Open a new terminal and run: rtk init -g"
    }
}

Write-Host "`nDone. Restart Claude Code (or VS Code) to load everything." -ForegroundColor Green
