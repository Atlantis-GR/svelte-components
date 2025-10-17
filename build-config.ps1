<#
.SYNOPSIS
Builds the configuration library and installs it in the sample application.

.DESCRIPTION
This script builds the Svelte.Config library, packages it, and installs it
into the sample application for development testing.

.EXAMPLE
pwsh -File .\build-config.ps1
#>

$ErrorActionPreference = 'Stop'

Write-Host "Starting dev bootstrap..." -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$libDir = Join-Path $root 'Svelte.Config'
$sampleDir = Join-Path $root 'Svelte.Sample'

function Run($cmd, $cwd) {
    Write-Host "-> Running: $cmd`n  in $cwd" -ForegroundColor Yellow
    Push-Location $cwd
    try {
        Invoke-Expression $cmd
    } finally {
        Pop-Location
    }
}

# Build library
Run 'npm run build' $libDir

# Pack library
Push-Location $libDir
$tgz = (npm pack) -split "`n" | Select-Object -Last 1
Pop-Location

if (-not $tgz) {
    Write-Error "npm pack failed to produce tarball"
    exit 1
}

$tgzPath = Join-Path $libDir $tgz
Write-Host "Packed library: $tgzPath" -ForegroundColor Green

# Install into sample app
Run "npm install --no-audit --no-fund `"$tgzPath`"" $sampleDir

# Install sample app deps
Run 'npm install --no-audit --no-fund' $sampleDir

Write-Host "Starting sample dev server..." -ForegroundColor Cyan
Push-Location $sampleDir
try {
    # Use start-process so the script doesn't block and console remains visible
    Start-Process -NoNewWindow -FilePath 'npm' -ArgumentList 'run dev' -WorkingDirectory $sampleDir
} finally {
    Pop-Location
}

Write-Host "Bootstrap finished. Open http://localhost:5173 in your browser." -ForegroundColor Green
