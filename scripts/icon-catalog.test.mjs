import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { isCategory } from "../src/data/categories.js";
import { iconCount } from "../src/data/stats.js";
import { attachSearch, queryIcons } from "../src/lib/icon-search.js";
import { buildSvg } from "../src/lib/snippets.js";

const catalog = JSON.parse(readFileSync("src/icon-data/catalog.json", "utf8"));
const shards = new Map();

function shard(name) {
  if (!shards.has(name)) shards.set(name, JSON.parse(readFileSync(join("src/icon-data/shards", `${name}.json`), "utf8")));
  return shards.get(name);
}

test("icon count is the local catalog", () => {
  assert.equal(catalog.length, iconCount);
  assert.ok(catalog.length >= 10000);
  assert.ok(catalog.length < 200000);
});

test("ids are unique and metadata is present", () => {
  const ids = new Set();
  for (const icon of catalog) {
    assert.equal(ids.has(icon.id), false, icon.id);
    ids.add(icon.id);
    assert.ok(icon.name && icon.slug && icon.pack && icon.style && icon.viewBox && icon.shard);
    assert.equal(isCategory(icon.category), true, icon.category);
  }
});

test("every icon has local svg markup and no exact duplicate artwork", () => {
  const seen = new Map();
  for (const icon of catalog) {
    const markup = shard(icon.shard)[icon.id];
    assert.equal(typeof markup, "string", icon.id);
    assert.ok(markup.includes("<"), icon.id);
    const hash = createHash("sha1").update(markup.replace(/\s+/g, "")).digest("hex");
    assert.equal(seen.has(hash), false, `${icon.id} duplicates ${seen.get(hash)}`);
    seen.set(hash, icon.id);
  }
});

test("search and filters hit the local index", () => {
  const indexed = catalog.map((icon) => attachSearch({ ...icon }, (id) => id));
  assert.ok(queryIcons(indexed, { q: "github" }).length > 0);
  assert.ok(queryIcons(indexed, { q: "database" }).length > 0);
  assert.ok(queryIcons(indexed, { category: "brands" }).every((icon) => icon.category === "brands"));
  assert.ok(queryIcons(indexed, { pack: "lucide", style: "outline" }).every((icon) => icon.pack === "lucide" && icon.style === "outline"));
  const started = performance.now();
  for (let i = 0; i < 20; i += 1) queryIcons(indexed, { q: "cloud" });
  const elapsed = performance.now() - started;
  assert.ok(elapsed < 1500, `search took ${elapsed}ms`);
});

test("detail record can build a copyable svg", () => {
  const icon = catalog.find((item) => item.id === "lucide-home");
  assert.ok(icon);
  const markup = shard(icon.shard)[icon.id];
  const svg = buildSvg({ ...icon, markup });
  assert.match(svg, /^<svg/);
  assert.match(svg, /<\/svg>$/);
  assert.match(svg, /viewBox="/);
});

test("shard files are present", () => {
  const names = readdirSync("src/icon-data/shards").filter((name) => name.endsWith(".json"));
  assert.ok(names.length > 10);
});
