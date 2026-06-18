$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$failures = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

function Require-File($path, $message) {
  if (-not (Test-Path -LiteralPath $path)) {
    $script:failures.Add($message)
  }
}

Require-File "app.json" "Missing app.json."
Require-File "eas.json" "Missing eas.json for EAS production builds."
Require-File "docs/privacy-policy.md" "Missing privacy policy draft."
Require-File "docs/terms.md" "Missing terms draft."
Require-File "docs/store-submission-checklist.md" "Missing store submission checklist."
Require-File "docs/privacy.html" "Missing public privacy policy page."
Require-File "docs/terms.html" "Missing public terms page."
Require-File "docs/support.html" "Missing public support page."

if (Test-Path -LiteralPath "app.json") {
  $app = Get-Content -LiteralPath "app.json" -Raw -Encoding UTF8 | ConvertFrom-Json
  if (-not $app.expo.name) { $failures.Add("Missing app name in app.json.") }
  if (-not $app.expo.ios.bundleIdentifier) { $failures.Add("Missing iOS bundleIdentifier.") }
  if (-not $app.expo.android.package) { $failures.Add("Missing Android package.") }
  if ($null -eq $app.expo.android.permissions) { $warnings.Add("Android permissions is undefined. Keep permissions minimal.") }
}

if ($env:EXPO_PUBLIC_LOCAL_PLAN_PREVIEW -eq "true") {
  $failures.Add("Do not submit with EXPO_PUBLIC_LOCAL_PLAN_PREVIEW=true. It enables local paid-plan preview.")
}

if ($failures.Count -gt 0) {
  Write-Host "Store readiness checks failed:" -ForegroundColor Red
  foreach ($failure in $failures) {
    Write-Host " - $failure" -ForegroundColor Red
  }
  exit 1
}

Write-Host "Store readiness local checks passed." -ForegroundColor Green
if ($warnings.Count -gt 0) {
  Write-Host "Warnings:" -ForegroundColor Yellow
  foreach ($warning in $warnings) {
    Write-Host " - $warning" -ForegroundColor Yellow
  }
}
Write-Host "Paid subscription release still requires App Store Connect and Google Play Billing products."
