// Builds the runtime search index + metadata shards from catalog.json.
// Output (all committed, all local, no runtime server):
//   src/icon-data/search/directory.json  - ids/names + numeric cat/style/pack codes
//   src/icon-data/search/vocab.json      - sorted unique search terms
//   src/icon-data/search/filters.json    - category/style/pack -> sorted idx lists
//   src/icon-data/search/postings-XX.json- term -> sorted idx lists (16 shards)
//   src/icon-data/meta/meta-XX.json      - full icon records, ~3000 per shard
import { writeFileSync, mkdirSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = "C:/Users/Prateek Singh/Downloads/IconVault";
const DATA = join(ROOT, "src/icon-data");
const SEARCH = join(DATA, "search");
const META = join(DATA, "meta");
const META_SIZE = 3000;
const POSTING_SHARDS = 16;

const catalog = JSON.parse(readFileSync(join(DATA, "catalog.json"), "utf8"));
const cats = [...new Set(catalog.map((i) => i.category))].sort();
const styles = [...new Set(catalog.map((i) => i.style))].sort();
const packs = [...new Set(catalog.map((i) => i.pack))].sort();
const catCode = new Map(cats.map((c, i) => [c, i]));
const styCode = new Map(styles.map((c, i) => [c, i]));
const packCode = new Map(packs.map((c, i) => [c, i]));

const ids = [];
const names = [];
const catArr = [];
const styArr = [];
const packArr = [];
const filters = { category: Object.create(null), style: Object.create(null), pack: Object.create(null) };
const vocabSet = new Set();
const postings = Array.from({ length: POSTING_SHARDS }, () => Object.create(null));
const shardOf = (term) => {
  let h = 0;
  for (let i = 0; i < term.length; i++) h = (h * 31 + term.charCodeAt(i)) >>> 0;
  return h % POSTING_SHARDS;
};

mkdirSync(SEARCH, { recursive: true });
mkdirSync(META, { recursive: true });
for (const old of readdirSync(META)) if (old.endsWith(".json")) writeFileSync(join(META, old), "[]");

const metaShards = [];
for (let i = 0; i < catalog.length; i += META_SIZE) metaShards.push([]);

catalog.forEach((icon, idx) => {
  ids.push(icon.id);
  names.push(icon.name);
  catArr.push(catCode.get(icon.category));
  styArr.push(styCode.get(icon.style));
  packArr.push(packCode.get(icon.pack));
  const push = (map, key, list) => {
    (map[key] = map[key] || []).push(idx);
  };
  push(filters.category, icon.category, null);
  push(filters.style, icon.style, null);
  push(filters.pack, icon.pack, null);
  const terms = new Set(`${icon.name} ${icon.slug} ${(icon.tags || []).join(" ")} ${icon.category} ${icon.pack} ${icon.style}`.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1));
  for (const term of terms) {
    vocabSet.add(term);
    const sh = postings[shardOf(term)]; (sh[term] = sh[term] || []).push(idx);
  }
  const { search: _s, ...record } = icon;
  metaShards[Math.floor(idx / META_SIZE)].push(record);
});

// directory: ids + names + numeric codes + vocab tables
writeFileSync(join(SEARCH, "directory.json"), JSON.stringify({
  count: catalog.length,
  ids,
  names,
  category: cats,
  cat: catArr,
  style: styles,
  sty: styArr,
  pack: packs,
  packId: packArr,
}));
writeFileSync(join(SEARCH, "vocab.json"), JSON.stringify([...vocabSet].sort()));
writeFileSync(join(SEARCH, "filters.json"), JSON.stringify(filters));
postings.forEach((shard, i) => {
  if (Object.keys(shard).length) writeFileSync(join(SEARCH, `postings-${String(i).padStart(2, "0")}.json`), JSON.stringify(shard));
});
metaShards.forEach((records, i) => {
  writeFileSync(join(META, `meta-${String(i).padStart(3, "0")}.json`), JSON.stringify(records));
});
console.log(`directory: ${catalog.length} icons, ${vocabSet.size} terms, ${metaShards.length} meta shards, ${POSTING_SHARDS} posting shards`);
