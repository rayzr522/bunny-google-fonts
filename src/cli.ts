import { consola } from "consola";
import { writeFile } from "node:fs/promises";
import { fetchFontInformation, generateBunnyFontSpec } from "./font-spec.js";

consola.options.formatOptions.depth = 10;

try {
  const [, , fontName] = process.argv;
  if (!fontName) {
    throw "usage: bunny-google-fonts <font name>";
  }
  const fontData = await fetchFontInformation(fontName);
  consola.info("fontData", fontData);
  const bunnySpec = await generateBunnyFontSpec(fontData);
  const serialized = JSON.stringify(bunnySpec, null, 2);
  consola.info("bunnySpec", serialized);
  const outPath = `./out/${fontName.replace(/\s+/g, "_")}.json`;
  await writeFile(outPath, serialized);
  consola.info(`wrote to ${outPath}`);
} catch (e) {
  consola.error(e);
  process.exit(1);
}
