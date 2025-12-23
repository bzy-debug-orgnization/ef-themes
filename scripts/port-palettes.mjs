import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const efThemesDir = path.join(root, "ef-themes");
const srcDir = path.join(root, "src");

function extractPaletteSection(text, themeId) {
  const startMarker = `(defconst ${themeId}-palette-partial`;
  const endMarker = `(defconst ${themeId}-palette-mappings-partial`;
  const start = text.indexOf(startMarker);
  if (start === -1) {
    throw new Error(`Missing palette partial for ${themeId}`);
  }
  const end = text.indexOf(endMarker, start);
  if (end === -1) {
    throw new Error(`Missing palette mappings partial for ${themeId}`);
  }
  return text.slice(start, end);
}

function parsePalettePairs(section) {
  const pairs = [];
  const regex = /\(\s*([a-z0-9-]+)\s+"(#[0-9a-fA-F]{6})"\s*\)/g;
  let match;
  while ((match = regex.exec(section)) !== null) {
    const name = match[1];
    const value = match[2];
    pairs.push([name.replace(/-/g, "_"), value]);
  }
  if (pairs.length === 0) {
    throw new Error("No palette entries found");
  }
  return pairs;
}

function formatPalette(pairs) {
  const lines = ["export const palette = {"];
  for (const [name, value] of pairs) {
    lines.push(`  ${name}: "${value}",`);
  }
  lines.push("};", "");
  return lines.join("\n");
}

async function main() {
  const entries = await fs.readdir(efThemesDir, { withFileTypes: true });
  const themeFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.startsWith("ef-") && name.endsWith("-theme.el"));

  await fs.mkdir(srcDir, { recursive: true });

  for (const fileName of themeFiles) {
    const themeId = fileName.replace(/-theme\.el$/, "");
    const filePath = path.join(efThemesDir, fileName);
    const text = await fs.readFile(filePath, "utf8");
    const section = extractPaletteSection(text, themeId);
    const pairs = parsePalettePairs(section);
    const output = formatPalette(pairs);
    const outPath = path.join(srcDir, `${themeId}-palette.mjs`);
    await fs.writeFile(outPath, output);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
