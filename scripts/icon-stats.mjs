import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const catalog = JSON.parse(readFileSync("src/icon-data/catalog.json", "utf8"));
const ids = new Set();
let duplicateIds = 0;
const categories = new Set();
const styles = new Set();
const packs = new Set();
for (const icon of catalog) {
  if (ids.has(icon.id)) duplicateIds += 1;
  ids.add(icon.id);
  categories.add(icon.category);
  styles.add(icon.style);
  packs.add(icon.pack);
}

const shardDir = "src/icon-data/shards";
let bytes = 0;
let svgCount = 0;
for (const name of readdirSync(shardDir)) {
  if (!name.endsWith(".json")) continue;
  const data = JSON.parse(readFileSync(join(shardDir, name), "utf8"));
  for (const markup of Object.values(data)) {
    bytes += Buffer.byteLength(markup);
    svgCount += 1;
  }
}

const dataBytes = statSync("src/icon-data/catalog.json").size;
console.log(`Total icons: ${catalog.length}`);
console.log(`Unique icons: ${ids.size}`);
console.log(`Duplicate ids: ${duplicateIds}`);
console.log(`Categories: ${categories.size}`);
console.log(`Styles: ${[...styles].sort().join(", ")}`);
console.log(`Collections: ${packs.size} packs`);
console.log(`SVG records: ${svgCount}`);
console.log(`Average SVG size: ${svgCount ? Math.round(bytes / svgCount) : 0} bytes`);
console.log(`Metadata file: ${dataBytes} bytes`);
