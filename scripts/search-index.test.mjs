// Validates the generated search index against catalog.json and shards.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DATA = "src/icon-data";
const SEARCH = join(DATA, "search");
const META = join(DATA, "meta");
const SHARDS = join(DATA, "shards");
const META_SIZE = 3000;

const catalog = JSON.parse(readFileSync(join(DATA, "catalog.json"), "utf8"));
const directory = JSON.parse(readFileSync(join(SEARCH, "directory.json"), "utf8"));
const vocab = JSON.parse(readFileSync(join(SEARCH, "vocab.json"), "utf8"));
const filters = JSON.parse(readFileSync(join(SEARCH, "filters.json"), "utf8"));
const postings = {};
for (const name of readdirSync(SEARCH)) {
  if (name.startsWith("postings-")) Object.assign(postings, JSON.parse(readFileSync(join(SEARCH, name), "utf8")));
}

test("directory covers every catalog icon exactly once", () => {
  assert.equal(directory.count, catalog.length);
  assert.equal(directory.ids.length, catalog.length);
  assert.equal(new Set(directory.ids).size, directory.ids.length);
  const catalogIds = new Set(catalog.map((i) => i.id));
  for (const id of directory.ids) assert.ok(catalogIds.has(id), `directory id missing from catalog: ${id}`);
});

test("directory codes resolve to known category/style/pack", () => {
  for (const code of directory.cat) assert.ok(code >= 0 && code < directory.category.length);
  for (const code of directory.sty) assert.ok(code >= 0 && code < directory.style.length);
  for (const code of directory.packId) assert.ok(code >= 0 && code < directory.pack.length);
});

test("every indexed icon resolves to metadata", () => {
  const metaFiles = readdirSync(META).filter((n) => n.endsWith(".json"));
  assert.equal(metaFiles.length, Math.ceil(catalog.length / META_SIZE));
  const seen = new Set();
  for (const file of metaFiles) {
    const records = JSON.parse(readFileSync(join(META, file), "utf8"));
    for (const record of records) {
      assert.ok(record.id && record.name && record.shard, `incomplete meta record ${record.id}`);
      seen.add(record.id);
      const shardFile = join(SHARDS, `${record.shard}.json`);
      assert.ok(existsSync(shardFile), `missing svg shard for ${record.id}: ${record.shard}`);
    }
  }
  assert.equal(seen.size, catalog.length);
});

test("every metadata entry resolves to an svg and no orphans", () => {
  const shardFiles = readdirSync(SHARDS).filter((n) => n.endsWith(".json"));
  const referenced = new Set();
  for (const file of readdirSync(META).filter((n) => n.endsWith(".json"))) {
    for (const record of JSON.parse(readFileSync(join(META, file), "utf8"))) referenced.add(record.shard);
  }
  for (const shard of referenced) {
    const data = JSON.parse(readFileSync(join(SHARDS, `${shard}.json`), "utf8"));
    for (const [id, markup] of Object.entries(data)) {
      assert.ok(typeof markup === "string" && markup.includes("<"), `empty svg for ${id}`);
    }
  }
  // every shard file should be referenced by at least one meta record
  for (const file of shardFiles) {
    const shard = file.replace(/\.json$/, "");
    assert.ok(referenced.has(shard), `orphan shard file: ${file}`);
  }
});

test("postings and filters only contain valid indexes", () => {
  const vocabSet = new Set(vocab);
  for (const term of Object.keys(postings)) assert.ok(vocabSet.has(term), `posting term missing from vocab: ${term}`);
  const check = (list) => {
    for (const idx of list) assert.ok(Number.isInteger(idx) && idx >= 0 && idx < directory.count, `bad idx ${idx}`);
    for (let i = 1; i < list.length; i++) assert.ok(list[i - 1] < list[i], "posting list not sorted/unique");
  };
  for (const list of Object.values(postings)) check(list);
  for (const group of Object.values(filters)) for (const list of Object.values(group)) check(list);
});

test("search index resolves sample queries", () => {
  const hit = (term) => (postings[term] || []).length;
  assert.ok(hit("home") > 0);
  assert.ok(hit("github") > 0);
  assert.ok(hit("arrow") > 100);
  assert.ok(filters.category.emoji.length === 19929);
});
