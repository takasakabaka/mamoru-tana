$ErrorActionPreference = "Stop"

$nodeHome = Join-Path $env:USERPROFILE ".local\nodejs\node-v20.20.2-win-x64"
$node = Join-Path $nodeHome "node.exe"

if (-not (Test-Path $node)) {
  throw "Node 20.20.2 was not found at $nodeHome"
}

$env:Path = "$nodeHome;$env:Path"
Write-Host "Using Node $(node -v)"
npm run release:check
