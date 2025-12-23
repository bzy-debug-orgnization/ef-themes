# Ef (εὖ) themes for VSCode

## Build themes

VS Code theme JSON files do not support color variables. To keep colors
maintainable, the source of truth is:

- `ef-theme/themes-src/*-palette.mjs`: named palette entries (auto-discovered).
- `ef-theme/themes-src/theme-template.mjs`: the shared color arrangement.
- `ef-theme/themes/*.json`: generated theme files.

Run:

```sh
npm run build:themes
```

To port all Emacs palettes into `themes-src`:

```sh
npm run port:palettes
```
