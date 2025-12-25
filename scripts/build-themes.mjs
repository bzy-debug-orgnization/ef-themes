import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const srcDir = path.join(root, "src");
const themesDir = path.join(root, "themes");
const efThemesIndex = path.join(root, "ef-themes", "ef-themes.el");

function extractThemeList(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) {
    throw new Error(`Missing marker: ${startMarker}`);
  }
  const end = endMarker ? text.indexOf(endMarker, start) : text.length;
  const section = text.slice(start, end);
  return Array.from(new Set(section.match(/ef-[a-z0-9-]+/g) || []));
}

function toTitleCase(themeId) {
  const words = themeId.replace(/^ef-/, "").split("-");
  return `Ef ${words
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ")}`;
}

function withAlpha(hex, alpha) {
  if (!hex || !hex.startsWith("#") || hex.length !== 7) {
    throw new Error(`Expected 6-digit hex color, got ${hex}`);
  }
  return `${hex}${alpha}`;
}

function buildTheme(palette, themeName) {
  const c = (key) => {
    const value = palette[key];
    if (!value) {
      throw new Error(`Missing palette key: ${key}`);
    }
    return value;
  };
  const ca = (key, alpha) => withAlpha(c(key), alpha);

  const colors = {
    "editor.background": c("bg_main"),
    "editor.foreground": c("fg_main"),
    "editorCursor.foreground": c("cursor"),
    "editorLineNumber.foreground": c("fg_dim"),
    "editorLineNumber.activeForeground": c("fg_main"),
    "editor.selectionBackground": c("bg_region"),
    "editor.inactiveSelectionBackground": ca("bg_blue_subtle", "99"),
    "editor.selectionHighlightBackground": ca("bg_completion", "99"),
    "editor.wordHighlightBackground": ca("bg_info", "99"),
    "editor.wordHighlightStrongBackground": ca("bg_hover_secondary", "99"),
    "editor.findMatchBackground": c("bg_yellow_intense"),
    "editor.findMatchHighlightBackground": ca("bg_blue_intense", "99"),
    "editor.findRangeHighlightBackground": ca("bg_warning", "99"),
    "editor.hoverHighlightBackground": ca("bg_hover", "99"),
    "editor.lineHighlightBackground": c("bg_hl_line"),
    "editorWhitespace.foreground": c("border"),
    "editorIndentGuide.background1": c("border"),
    "editorIndentGuide.activeBackground1": c("bg_active"),
    "editorRuler.foreground": c("bg_alt"),
    "editorBracketMatch.background": c("bg_paren_match"),
    "editorBracketMatch.border": c("magenta"),
    "editorError.foreground": c("red_warmer"),
    "editorWarning.foreground": c("yellow_warmer"),
    "editorInfo.foreground": c("green"),
    "editorHint.foreground": c("fg_dim"),
    "editorGutter.background": c("bg_inactive"),
    "editorGutter.modifiedBackground": c("yellow_warmer"),
    "editorGutter.addedBackground": c("green"),
    "editorGutter.deletedBackground": c("red_warmer"),
    "editorOverviewRuler.border": c("border"),
    "editorOverviewRuler.addedForeground": c("green"),
    "editorOverviewRuler.modifiedForeground": c("yellow_warmer"),
    "editorOverviewRuler.deletedForeground": c("red_warmer"),
    "sideBar.background": c("bg_dim"),
    "sideBar.foreground": c("fg_main"),
    "sideBar.border": c("border"),
    "sideBarSectionHeader.background": c("bg_alt"),
    "sideBarSectionHeader.foreground": c("fg_main"),
    "sideBarTitle.foreground": c("fg_main"),
    "activityBar.background": c("bg_dim"),
    "activityBar.foreground": c("fg_main"),
    "activityBar.border": c("border"),
    "activityBarBadge.background": c("blue_warmer"),
    "activityBarBadge.foreground": c("bg_main"),
    "statusBar.background": c("bg_mode_line_active"),
    "statusBar.foreground": c("fg_mode_line_active"),
    "statusBar.border": c("border"),
    "statusBar.debuggingBackground": c("bg_magenta_intense"),
    "statusBar.debuggingForeground": c("fg_mode_line_active"),
    "statusBar.noFolderBackground": c("bg_alt"),
    "statusBar.noFolderForeground": c("fg_main"),
    "titleBar.activeBackground": c("bg_alt"),
    "titleBar.activeForeground": c("fg_main"),
    "titleBar.inactiveBackground": c("bg_inactive"),
    "titleBar.inactiveForeground": c("fg_dim"),
    "titleBar.border": c("border"),
    "tab.activeBackground": c("bg_main"),
    "tab.activeForeground": c("fg_main"),
    "tab.inactiveBackground": c("bg_dim"),
    "tab.inactiveForeground": c("fg_dim"),
    "tab.unfocusedActiveBackground": c("bg_inactive"),
    "tab.unfocusedActiveForeground": c("fg_dim"),
    "tab.border": c("border"),
    "tab.activeBorder": c("blue_warmer"),
    "tab.unfocusedActiveBorder": c("border"),
    "tab.hoverBackground": c("bg_hl_line"),
    "tab.hoverBorder": c("border"),
    "panel.background": c("bg_main"),
    "panel.border": c("border"),
    "panelTitle.activeForeground": c("fg_main"),
    "panelTitle.inactiveForeground": c("fg_dim"),
    "panelTitle.activeBorder": c("blue_warmer"),
    "badge.background": c("bg_completion"),
    "badge.foreground": c("fg_mode_line_active"),
    "button.background": c("bg_completion"),
    "button.foreground": c("fg_mode_line_active"),
    "button.hoverBackground": c("bg_hover"),
    "input.background": c("bg_main"),
    "input.foreground": c("fg_main"),
    "input.border": c("border"),
    "input.placeholderForeground": c("fg_dim"),
    "inputOption.activeBackground": c("bg_completion"),
    "inputOption.activeBorder": c("blue_warmer"),
    "inputValidation.errorBackground": c("bg_err"),
    "inputValidation.warningBackground": c("bg_warning"),
    "inputValidation.infoBackground": c("bg_info"),
    "inputValidation.errorBorder": c("red_warmer"),
    "inputValidation.warningBorder": c("yellow_warmer"),
    "inputValidation.infoBorder": c("green"),
    "dropdown.background": c("bg_main"),
    "dropdown.foreground": c("fg_main"),
    "dropdown.border": c("border"),
    "list.activeSelectionBackground": c("bg_completion"),
    "list.activeSelectionForeground": c("fg_mode_line_active"),
    "list.inactiveSelectionBackground": c("bg_blue_subtle"),
    "list.hoverBackground": c("bg_hover"),
    "list.focusBackground": c("bg_completion"),
    "list.highlightForeground": c("blue_warmer"),
    "list.activeSelectionIconForeground": c("blue_warmer"),
    "notificationCenterHeader.background": c("bg_alt"),
    "notificationCenterHeader.foreground": c("fg_main"),
    "progressBar.background": c("blue_warmer"),
    "terminal.background": c("bg_main"),
    "terminal.foreground": c("fg_main"),
    "terminalCursor.foreground": c("cursor"),
    "terminal.ansiBlack": c("fg_main"),
    "terminal.ansiRed": c("red"),
    "terminal.ansiGreen": c("green"),
    "terminal.ansiYellow": c("yellow"),
    "terminal.ansiBlue": c("blue"),
    "terminal.ansiMagenta": c("magenta"),
    "terminal.ansiCyan": c("cyan"),
    "terminal.ansiWhite": c("bg_dim"),
    "terminal.ansiBrightBlack": c("fg_dim"),
    "terminal.ansiBrightRed": c("red_warmer"),
    "terminal.ansiBrightGreen": c("green_warmer"),
    "terminal.ansiBrightYellow": c("yellow_warmer"),
    "terminal.ansiBrightBlue": c("blue_warmer"),
    "terminal.ansiBrightMagenta": c("magenta_warmer"),
    "terminal.ansiBrightCyan": c("cyan_warmer"),
    "terminal.ansiBrightWhite": c("bg_main"),
    "gitDecoration.addedResourceForeground": c("green"),
    "gitDecoration.modifiedResourceForeground": c("fg_changed"),
    "gitDecoration.deletedResourceForeground": c("fg_removed"),
    "gitDecoration.untrackedResourceForeground": c("green_cooler"),
    "gitDecoration.ignoredResourceForeground": c("fg_dim"),
    "gitDecoration.conflictingResourceForeground": c("red_cooler"),
    "gitDecoration.submoduleResourceForeground": c("fg_alt"),
    "diffEditor.insertedTextBackground": ca("bg_added", "99"),
    "diffEditor.removedTextBackground": ca("bg_removed", "99"),
    "diffEditor.insertedLineBackground": ca("bg_added_faint", "99"),
    "diffEditor.removedLineBackground": ca("bg_removed_faint", "99"),
    "diffEditor.border": c("border"),
  };

  const tokenColors = [
    {
      name: "Comments",
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        fontStyle: "italic",
        foreground: c("yellow_faint"),
      },
    },
    {
      name: "Docstrings",
      scope: [
        "comment.documentation",
        "comment.block.documentation",
        "string.quoted.docstring",
      ],
      settings: {
        foreground: c("cyan_faint"),
      },
    },
    {
      name: "Keywords",
      scope: ["keyword", "storage", "storage.modifier"],
      settings: {
        foreground: c("magenta_cooler"),
      },
    },
    {
      name: "Operators",
      scope: "keyword.operator",
      settings: {
        foreground: c("fg_dim"),
      },
    },
    {
      name: "Types",
      scope: [
        "storage.type",
        "support.type",
        "entity.name.type",
        "entity.other.inherited-class",
      ],
      settings: {
        foreground: c("green_cooler"),
      },
    },
    {
      name: "Functions",
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call",
        "variable.function",
      ],
      settings: {
        foreground: c("magenta_warmer"),
      },
    },
    {
      name: "Variables",
      scope: ["variable", "support.variable", "variable.other"],
      settings: {
        foreground: c("cyan_cooler"),
      },
    },
    {
      name: "Constants and Numbers",
      scope: [
        "constant",
        "constant.numeric",
        "constant.character",
        "constant.language",
        "support.constant",
      ],
      settings: {
        foreground: c("blue_cooler"),
      },
    },
    {
      name: "Strings",
      scope: ["string", "constant.other.symbol"],
      settings: {
        foreground: c("blue_warmer"),
      },
    },
    {
      name: "Strings: Escape and Regex",
      scope: ["constant.character.escape", "string.regexp"],
      settings: {
        foreground: c("magenta"),
      },
    },
    {
      name: "Punctuation",
      scope: "punctuation",
      settings: {
        foreground: c("fg_dim"),
      },
    },
    {
      name: "Invalid",
      scope: ["invalid", "invalid.illegal"],
      settings: {
        foreground: c("red_warmer"),
      },
    },
    {
      name: "Markup: Headings",
      scope: "markup.heading",
      settings: {
        foreground: c("red"),
        fontStyle: "bold",
      },
    },
    {
      name: "Markup: Emphasis",
      scope: ["markup.bold", "markup.italic"],
      settings: {
        foreground: c("blue_warmer"),
        fontStyle: "bold italic",
      },
    },
    {
      name: "Markup: Links",
      scope: ["meta.link", "markup.underline.link"],
      settings: {
        foreground: c("blue_warmer"),
        fontStyle: "underline",
      },
    },
    {
      name: "Markup: Lists and Quotes",
      scope: ["markup.list", "markup.quote"],
      settings: {
        foreground: c("fg_alt"),
      },
    },
    {
      name: "Markup: Inline Code",
      scope: "markup.inline.raw",
      settings: {
        foreground: c("magenta_warmer"),
      },
    },
    {
      name: "Diff: Inserted",
      scope: ["markup.inserted", "meta.diff.header.to-file"],
      settings: {
        foreground: c("fg_added"),
      },
    },
    {
      name: "Diff: Deleted",
      scope: ["markup.deleted", "meta.diff.header.from-file"],
      settings: {
        foreground: c("fg_removed"),
      },
    },
    {
      name: "Diff: Changed",
      scope: ["markup.changed", "meta.diff.range"],
      settings: {
        foreground: c("fg_changed"),
      },
    },
  ];

  const semanticTokenColors = {
    namespace: c("cyan_cooler"),
    class: c("green_cooler"),
    struct: c("green_warmer"),
    enum: c("yellow"),
    interface: {
      foreground: c("cyan"),
      fontStyle: "italic",
    },
    typeParameter: c("magenta_faint"),
    type: c("blue_cooler"),
    typeAlias: c("blue_warmer"),
    function: c("magenta_warmer"),
    method: c("magenta"),
    property: c("blue"),
    parameter: c("cyan_warmer"),
    variable: c("cyan_faint"),
    enumMember: c("yellow_cooler"),
    constant: c("blue_faint"),
    macro: c("red"),
    keyword: c("magenta_cooler"),
    modifier: c("red_cooler"),
    string: c("fg_alt"),
    number: c("yellow_warmer"),
    regexp: c("red_faint"),
    operator: c("fg_dim"),
    comment: {
      foreground: c("yellow_faint"),
      fontStyle: "italic",
    },
    decorator: {
      foreground: c("red_warmer"),
      fontStyle: "underline",
    },
    label: c("green"),
    event: c("green_faint"),
    boolean: c("cursor"),
    "function.declaration": {
      foreground: c("magenta_warmer"),
      fontStyle: "bold",
    },
    "method.declaration": {
      foreground: c("magenta"),
      fontStyle: "bold",
    },
    "variable.readonly": {
      foreground: c("cyan_faint"),
      fontStyle: "italic",
    },
    "property.readonly": {
      foreground: c("blue"),
      fontStyle: "italic",
    },
    "parameter.declaration": {
      foreground: c("cyan_warmer"),
      fontStyle: "underline",
    },
    "enumMember.declaration": {
      foreground: c("yellow_cooler"),
      fontStyle: "bold",
    },
    "class.defaultLibrary": {
      foreground: c("green_cooler"),
      fontStyle: "italic",
    },
    "type.defaultLibrary": {
      foreground: c("blue_cooler"),
      fontStyle: "italic",
    },
    "namespace.defaultLibrary": {
      foreground: c("cyan_cooler"),
      fontStyle: "italic",
    },
    "keyword.async": {
      foreground: c("magenta_cooler"),
      fontStyle: "italic",
    },
    "function.async": {
      foreground: c("magenta_warmer"),
      fontStyle: "italic",
    },
  };

  return {
    name: themeName,
    colors,
    tokenColors,
    semanticTokenColors,
  };
}

async function main() {
  const efThemesText = await fs.readFile(efThemesIndex, "utf8");
  const lightThemes = extractThemeList(
    efThemesText,
    "defconst ef-themes-light-themes",
    "defconst ef-themes-dark-themes",
  );
  const darkThemes = extractThemeList(
    efThemesText,
    "defconst ef-themes-dark-themes",
    "defvaralias 'ef-themes-collection",
  );
  const themeType = new Map();
  for (const theme of lightThemes) {
    themeType.set(theme, "light");
  }
  for (const theme of darkThemes) {
    themeType.set(theme, "dark");
  }

  await fs.mkdir(themesDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  const paletteFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith("-palette.mjs"))
    .sort();

  for (const fileName of paletteFiles) {
    const themeId = fileName.replace(/-palette\.mjs$/, "");
    const filePath = path.join(srcDir, fileName);
    const moduleUrl = `${pathToFileURL(filePath).href}?v=${Date.now()}`;
    const { palette } = await import(moduleUrl);
    const themeName = toTitleCase(themeId);
    const theme = buildTheme(palette, themeName);
    const outPath = path.join(themesDir, `${themeId}-color-theme.json`);
    const json = `${JSON.stringify(theme, null, 2)}\n`;
    await fs.writeFile(outPath, json);

    if (!themeType.has(themeId)) {
      console.warn(`Warning: theme type not found for ${themeId}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
