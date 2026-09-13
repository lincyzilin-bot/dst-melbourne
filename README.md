# Don't Starve: Melbourne — Three.js survival clone

Single-file Three.js game, developed as versioned snapshots.

## Play
Open the newest file in `builds/` (or `builds/latest.html`) in a browser.
Needs internet on first load (Three.js CDN). Saves live in the browser
(localStorage key `dst_melbourne_zoned_v1`) — they carry across versions.

## Project layout
- `src/` — source of truth. Edit THESE, never `builds/`.
  - `shell.html` — page skeleton with `/*__STYLE__*/`, `<!--__BODY__-->`, `/*__APP__*/` slots
  - `style.css`, `body.html` — UI styles + markup
  - `js/` — game code in load order (`00-config` … `90-loop-menu`)
- `tools/New-Snapshot.ps1` — bundles `src/` into a new self-contained file in `builds/`
- `builds/` — one new playable file per update, e.g. `dst-melbourne-v1.0.1-20260911-1930.html`
- `VERSION` / `CHANGELOG.md` — current version + per-release notes

## Workflow (every update = one new file)
1. Edit files in `src/` (one feature at a time).
2. Run: `.\tools\New-Snapshot.ps1 -Bump patch -Note "what changed"`
   - `-Bump patch|minor|major`, or `-Version 2.0.0` to pin one.
3. Play `builds/latest.html`, check the game boots and the feature works.
4. Commit with the version in the message: `git commit -am "v1.0.1: what changed"`.

See `docs/WORKFLOW.md` for the full professional routine.
See `tools/Install-Git.ps1` if git isn't installed yet.
