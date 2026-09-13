# Workflow

How updates to this game are supposed to run. The rule is simple:
**source in `src/`, one new playable file per update in `builds/`, history in git.**

## 1. Making a change
- Pick ONE feature/fix per update (e.g. "rabbits 50% more in grassland").
- Edit the relevant module in `src/js/` (see header comments for which file owns what).
- Keep player-save compatibility: never rename the localStorage key
  (`dst_melbourne_zoned_v1`) or the save shape without a migration in `00-config.js`.

## 2. Stamping a snapshot (new file every time)
From the `dst-melbourne/` folder in PowerShell:

```powershell
.\tools\New-Snapshot.ps1 -Bump patch -Note "rabbits +50% in grassland"
```

- `-Bump patch` → 1.0.0 → 1.0.1 (fixes/tuning)
- `-Bump minor` → new zones/items/mechanics
- `-Bump major` → save-breaking or full reworks
- `-Version x.y.z` pins an exact version instead of bumping
- Output: `builds/dst-melbourne-v<ver>-<date>.html` + refreshed `builds/latest.html`
- `VERSION` and `CHANGELOG.md` update automatically. Never edit `builds/` by hand.

## 3. Testing before calling it done
- Open `builds/latest.html`, click through: start → walk → E/Space/Q/C → die → respawn.
- Open DevTools console (F12): zero red errors is the bar.
- Play one full day cycle if you touched day/night, spawns, or balance.

## 4. Committing (once git is installed)
```powershell
git add -A
git commit -m "v1.0.1: rabbits +50% in grassland"
git log --oneline -5   # sanity check
```
Push to GitHub when you have a remote. Tag releases: `git tag v1.0.1`.

## 5. Asking the AI for the next update
Good prompt shape: what to change, which module, what NOT to touch,
how to verify. Example:

> In `src/js/50-resources.js`, raise grassland rabbit spawns 50%.
> Don't touch save format. Stamp v1.0.1 snapshot and verify it boots.

## 6. OneDrive note
Code repos and OneDrive sync don't mix well (file locks, sync churn).
Long term, move `dst-melbourne/` out of OneDrive into `Documents\games\`
and keep a GitHub remote as the backup. Old experiments
(`dont-starve-*.html` next to this folder) can move to an `archive/` folder
once you're happy the new setup works.
