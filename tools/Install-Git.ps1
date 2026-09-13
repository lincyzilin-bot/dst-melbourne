# Installs Git via winget, then run the init commands it prints.
# You only need to do this once per machine.
winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
Write-Output ''
Write-Output 'If that succeeded, restart your terminal, then run:'
Write-Output '  cd "<this-folder>"'
Write-Output '  git init'
Write-Output '  git add -A'
Write-Output '  git commit -m "v1.0.0: modular project setup with versioned snapshots"'
