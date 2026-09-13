# Builds a versioned, self-contained snapshot from src/.
# Usage (from the dst-melbourne folder):
#   .\tools\New-Snapshot.ps1 -Bump patch -Note "rabbits +50% in grassland"
#   .\tools\New-Snapshot.ps1 -Bump minor -Note "new ruin zone"
#   .\tools\New-Snapshot.ps1 -Version 2.0.0 -Note "save format reset"
param(
  [string]$Bump = "",
  [string]$Version = "",
  [string]$Note = ""
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function Read-Norm([string]$path) {
  $t = [IO.File]::ReadAllText($path)
  $t = $t -replace "`r`n", "`n"
  return $t.TrimEnd("`n")
}

$verFile = Join-Path $root 'VERSION'
$current = (Read-Norm $verFile).Trim()
if ($Version) { $ver = $Version }
elseif ($Bump -eq 'major') { $p = $current.Split('.'); $ver = "$([int]$p[0]+1).0.0" }
elseif ($Bump -eq 'minor') { $p = $current.Split('.'); $ver = "$($p[0]).$([int]$p[1]+1).0" }
elseif ($Bump -eq 'patch') { $p = $current.Split('.'); $ver = "$($p[0]).$($p[1]).$([int]$p[2]+1)" }
else { $ver = $current }

$stamp = Get-Date -Format 'yyyyMMdd-HHmm'
$shell = Read-Norm (Join-Path $root 'src\shell.html')
$css = Read-Norm (Join-Path $root 'src\style.css')
$body = Read-Norm (Join-Path $root 'src\body.html')
$jsFiles = Get-ChildItem -LiteralPath (Join-Path $root 'src\js') -Filter '*.js' | Sort-Object Name
if ($jsFiles.Count -eq 0) { throw 'No JS modules found in src/js' }
$parts = foreach ($f in $jsFiles) { Read-Norm $f.FullName }
$js = $parts -join "`n"

$out = $shell.Replace('/*__STYLE__*/', $css)
$out = $out.Replace('<!--__BODY__-->', $body)
$out = $out.Replace('/*__APP__*/', $js)
$out = $out.Replace('__VERSION__', $ver)
$out = $out.Replace('__DATE__', $stamp)
if ($out -match '__[A-Z]+__') { throw "Unreplaced token left in build: $($Matches[0])" }
$out = $out + "`n"

$name = "dst-melbourne-v$ver-$stamp.html"
$dest = Join-Path $root ("builds\" + $name)
[IO.File]::WriteAllText($dest, $out, [Text.UTF8Encoding]::new($false))
Copy-Item -LiteralPath $dest -Destination (Join-Path $root 'builds\latest.html') -Force
[IO.File]::WriteAllText($verFile, $ver + "`n", [Text.UTF8Encoding]::new($false))

$log = Join-Path $root 'CHANGELOG.md'
$old = if (Test-Path -LiteralPath $log) { [IO.File]::ReadAllText($log) -replace "`r`n", "`n" } else { "# Changelog`n`n" }
$line = if ($Note) { $Note } else { 'Snapshot build.' }
$entry = "## v$ver - $stamp`n- $line`n`n"
[IO.File]::WriteAllText($log, $entry + $old, [Text.UTF8Encoding]::new($false))

$kb = [Math]::Round((Get-Item -LiteralPath $dest).Length / 1KB, 1)
"Built $name ($kb KB, $($jsFiles.Count) modules) - VERSION now $ver"
