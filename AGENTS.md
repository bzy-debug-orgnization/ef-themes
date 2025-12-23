# AGENTS.md

## Project overview
- Ef themes for VS Code are generated from Emacs Ef palettes.
- Each Emacs theme defines a palette and then `modus-themes-generate-palette` expands it.
- In this repo we mirror the **final palette values** in `src/*-palette.mjs` and generate VS Code themes from those palettes.

## Sources of truth
- Emacs palettes live in `ef-themes/*.el` under `defconst ef-<name>-palette-partial`.
- VS Code palettes live in `src/ef-<name>-palette.mjs` and should match the Emacs palette values.
- VS Code color themes live in `themes/ef-<name>-color-theme.json` and are generated outputs.

## Generation workflow
1) Update/port palettes from Emacs to JS:
   - `npm run port:palettes`
   - This parses `ef-themes/*.el` and writes `src/*-palette.mjs`.
2) Generate VS Code themes:
   - `npm run build:themes`
   - This reads each `src/*-palette.mjs` and writes `themes/*-color-theme.json`.

## Editing rules
- Do not hand-edit `themes/*-color-theme.json`; always regenerate via `npm run build:themes`.
- Do not hand-edit `src/*-palette.mjs`; always regenerate via `npm run port:palettes`.
- If the Emacs palettes change, re-run both scripts and commit the regenerated files.

## Package registration
- `package.json` registers all themes in `contributes.themes`.
- Keep the list in sync with `themes/` output (light themes use `vs`, dark themes use `vs-dark`).

## Script locations
- Palette porting: `scripts/port-palettes.mjs`
- Theme generation: `scripts/build-themes.mjs`

## Quick sanity check
- Verify sample themes match expected colors by inspecting one or two outputs in `themes/`.
