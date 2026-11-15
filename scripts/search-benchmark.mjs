// Benchmark for the generated search index (no Vite/browser needed).
// Simulates the runtime query path: token -> vocab match -> posting shards ->
// filter intersections, over the real 173k-icon index.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SEARCH = "src/icon-data/search";
const directory = JSON.parse(readFileSync(join(SEARCH, "directory.json"), "utf8"));
const vocab = JSON.parse(readFileSync(join(SEARCH, "vocab.json"), "utf8"));
const filtersData = JSON.parse(readFileSync(join(SEARCH, "filters.json"), "utf8"));
const vocabSet = new Set(vocab);
const postings = {};
for (const name of readdirSync(SEARCH)) {
  if (!name.startsWith("postings-")) continue;
  Object.assign(postings, JSON.parse(readFileSync(join(SEARCH, name), "utf8")));
}

function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

function vocabMatches(term) {
  if (vocabSet.has(term)) return [term];
  const len = term.length;
  const out = [];
  for (const c of vocab) {
    if (Math.abs(c.length - len) > 1) continue;
    if (c.startsWith(term) || term.startsWith(c) || editDistance(term, c, 1) <= 1) out.push(c);
  }
  return out;
}

function mergeUnion(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { out.push(a[i]); i++; j++; }
    else if (a[i] < b[j]) { out.push(a[i]); i++; }
    else { out.push(b[j]); j++; }
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}

function intersect(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { out.push(a[i]); i++; j++; }
    else if (a[i] < b[j]) i++; else j++;
  }
  return out;
}

function query(q, { category = "all", style = "all", pack = "all" } = {}) {
  const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let idxs = null;
  for (const token of tokens) {
    const terms = vocabMatches(token);
    let union = [];
    for (const t of terms) {
      const list = postings[t];
      if (list && list.length) union = union.length ? mergeUnion(union, list) : list.slice();
    }
    idxs = idxs === null ? union : intersect(idxs, union);
    if (!idxs.length) return [];
  }
  if (idxs === null) idxs = Array.from({ length: directory.count }, (_, i) => i);
  const apply = (map, key) => (key === "all" ? idxs : (map[key] ? intersect(idxs, map[key]) : []));
  idxs = apply(filtersData.category, category);
  idxs = apply(filtersData.style, style);
  idxs = apply(filtersData.pack, pack);
  return idxs;
}

const CASES = [
  ["home", {}], ["hom", {}], ["arrow", {}], ["arrw", {}], ["github", {}],
  ["database", {}], ["cloud server", {}], ["shopping cart", {}],
  ["zzz-no-match", {}], ["user profile settings", {}],
  ["", { category: "emoji" }], ["", { pack: "mdi" }], ["icon", { style: "outline", category: "arrows" }],
];

const RUNS = Number(process.argv[2] || 10);
const all = [];
for (const [q, opts] of CASES) {
  const times = [];
  let count = 0;
  for (let r = 0; r < RUNS; r++) {
    const t0 = performance.now();
    count = query(q, opts).length;
    times.push(performance.now() - t0);
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const worst = Math.max(...times);
  all.push({ q: q || JSON.stringify(opts), avg, worst, count });
}
console.log(`index: ${directory.count} icons, ${vocab.length} terms, ${Object.keys(postings).length} posting terms`);
for (const row of all) console.log(`${row.q.padEnd(28)} avg ${row.avg.toFixed(1)}ms  worst ${row.worst.toFixed(1)}ms  hits ${row.count}`);
const avgAll = all.reduce((a, r) => a + r.avg, 0) / all.length;
const worstAll = Math.max(...all.map((r) => r.worst));
console.log(`OVERALL avg ${avgAll.toFixed(1)}ms  worst ${worstAll.toFixed(1)}ms`);
