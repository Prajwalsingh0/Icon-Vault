// Merges local JSON icon records into the committed catalog.
// Nothing is downloaded. `npm run dev` does not run this.
//
// Add files at src/icon-data/incoming/<pack-id>/<slug>.json
// {
//   "name": "Home",
//   "slug": "home",
//   "category": "home",
//   "tags": ["house"],
//   "style": "outline",
//   "render": "stroke",
//   "viewBox": "0 0 24 24",
//   "svg": "<path d=\"...\" />"
// }
// A file may also contain an array of such records (bundle form).
// Optional src/icon-data/incoming/<pack-id>/pack.json describes the pack.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = "src/icon-data";
const incoming = join(root, "incoming");
const SHARD_SIZE = 2500;

function walk(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (name.endsWith(".json") && name !== "pack.json") files.push(path);
  }
  return files;
}

function packOf(file) {
  const parts = file.split(/[\\/]/);
  return parts.at(-2);
}

function baseName(file) {
  return file.split(/[\\/]/).at(-1).replace(/\.json$/, "");
}

const files = walk(incoming);
const catalog = JSON.parse(readFileSync(join(root, "catalog.json"), "utf8"));
if (!files.length) {
  console.log(`Local catalog is ready. ${catalog.length} icons. No files in src/icon-data/incoming.`);
  process.exit(0);
}

function hash(markup) {
  return createHash("sha1").update(String(markup).replace(/\s+/g, "")).digest("hex");
}

const seen = new Map();
const shardDir = join(root, "shards");
for (const name of readdirSync(shardDir)) {
  if (!name.endsWith(".json")) continue;
  const data = JSON.parse(readFileSync(join(shardDir, name), "utf8"));
  for (const markup of Object.values(data)) seen.set(hash(markup), true);
}
const ids = new Set(catalog.map((icon) => icon.id));
const additions = [];
let skipped = 0;

for (const file of files) {
  const pack = packOf(file);
  const data = JSON.parse(readFileSync(file, "utf8"));
  const records = Array.isArray(data) ? data : [data];
  for (const record of records) {
    const slug = record.slug || baseName(file);
    const id = record.id || `${pack}-${slug}`;
    const markup = record.svg || record.markup;
    if (!markup || !record.name) {
      skipped += 1;
      continue;
    }
    if (ids.has(id) || seen.has(hash(markup))) {
      skipped += 1;
      continue;
    }
    ids.add(id);
    seen.set(hash(markup), true);
    additions.push({
      id,
      name: record.name,
      slug,
      category: record.category || "ui",
      tags: record.tags || [],
      style: record.style || "outline",
      pack,
      render: record.render || "fill",
      viewBox: record.viewBox || "0 0 24 24",
      markup,
    });
  }
}

if (!additions.length) {
  console.log(`No new icons. Skipped ${skipped} duplicate or incomplete records.`);
  process.exit(0);
}

// Group additions by pack and chunk so each lazy-loaded shard stays small.
const byPack = new Map();
for (const icon of additions) {
  if (!byPack.has(icon.pack)) byPack.set(icon.pack, []);
  byPack.get(icon.pack).push(icon);
}

const shardNames = new Map();
for (const [pack, icons] of byPack) {
  for (let i = 0; i < icons.length; i += SHARD_SIZE) {
    const shardName = `${pack}-${Date.now().toString(36)}-${Math.floor(i / SHARD_SIZE)}`;
    shardNames.set(shardName, icons.slice(i, i + SHARD_SIZE));
  }
}

for (const [shardName, icons] of shardNames) {
  const body = {};
  for (const icon of icons) {
    body[icon.id] = icon.markup;
    catalog.push({
      id: icon.id,
      name: icon.name,
      slug: icon.slug,
      category: icon.category,
      tags: icon.tags,
      style: icon.style,
      pack: icon.pack,
      render: icon.render,
      viewBox: icon.viewBox,
      shard: shardName,
    });
  }
  writeFileSync(join(shardDir, `${shardName}.json`), JSON.stringify(body));
}
writeFileSync(join(root, "catalog.json"), JSON.stringify(catalog));
console.log(`Added ${additions.length} icons into ${shardNames.size} shards. Skipped ${skipped}.`);
console.log("Update src/data/packs.js and src/data/stats.js if this pack is new, then run npm run icon-stats.");
