// @ts-nocheck
// Index-backed icon registry. catalog.json is a build-time source; at runtime
// we load the compact search index and fetch metadata/SVG lazily.
import { categoryLabel } from "@/data/categories";
import { packById } from "@/data/packs";

const shardLoaders = import.meta.glob("../icon-data/shards/*.json");
const searchLoaders = import.meta.glob("../icon-data/search/*.json");
const metaLoaders = import.meta.glob("../icon-data/meta/*.json");

let directory = null;
let vocab = null;
let filtersData = null;
const postingCache = new Map();
let idToIdx = null;
const metaCache = new Map();
let pending = null;
const markupCache = new Map();
const shardPromises = new Map();
const metaPromises = new Map();

export const PAGE_SIZE = 48;
export const META_SIZE = 3000;

export function isCatalogReady() {
  return Boolean(directory);
}

function loadJson(loaders, key) {
  const loader = loaders[key];
  if (!loader) return Promise.resolve(null);
  return loader().then((mod) => mod.default || mod);
}

export function initCatalog() {
  if (directory) return Promise.resolve(directory);
  if (!pending) {
    pending = Promise.all([
      loadJson(searchLoaders, "../icon-data/search/directory.json"),
      loadJson(searchLoaders, "../icon-data/search/vocab.json"),
      loadJson(searchLoaders, "../icon-data/search/filters.json"),
    ]).then(([dir, voc, filt]) => {
      directory = dir;
      vocab = voc || [];
      filtersData = filt || { category: {}, style: {}, pack: {} };
      idToIdx = new Map(dir.ids.map((id, i) => [id, i]));
      return directory;
    }).catch((error) => {
      pending = null;
      throw error;
    });
  }
  return pending;
}

function shardOfTerm(term) {
  let h = 0;
  for (let i = 0; i < term.length; i++) h = (h * 31 + term.charCodeAt(i)) >>> 0;
  return `../icon-data/search/postings-${String(h % 16).padStart(2, "0")}.json`;
}

function loadPostings(term) {
  if (!postingCache.has(term)) {
    postingCache.set(term, loadJson(searchLoaders, shardOfTerm(term)).then((data) => (data && data[term]) || null));
  }
  return postingCache.get(term);
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

const vocabSet = () => new Set(vocab);
let vocabSetCache = null;
function vocabMatches(term) {
  if (!vocabSetCache) vocabSetCache = vocabSet();
  if (vocabSetCache.has(term)) return [term];
  const len = term.length;
  const out = [];
  for (const candidate of vocab) {
    if (Math.abs(candidate.length - len) > 1) continue;
    if (candidate.startsWith(term) || term.startsWith(candidate) || editDistance(term, candidate, 1) <= 1) out.push(candidate);
  }
  return out;
}

function mergeUnion(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
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
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { out.push(a[i]); i++; j++; }
    else if (a[i] < b[j]) i++;
    else j++;
  }
  return out;
}

function metaShardKey(idx) {
  return `../icon-data/meta/meta-${String(Math.floor(idx / META_SIZE)).padStart(3, "0")}.json`;
}

function ensureMetaShard(key) {
  if (!metaPromises.has(key)) {
    metaPromises.set(key, loadJson(metaLoaders, key).then((records) => {
      if (records) {
        const base = Number(key.match(/meta-(\d+)\.json/)[1]) * META_SIZE;
        records.forEach((record, i) => metaCache.set(base + i, record));
      }
      return records;
    }));
  }
  return metaPromises.get(key);
}

function loadMetaIdxs(idxs) {
  const needed = [...new Set(idxs)].filter((i) => i != null && !metaCache.has(i));
  const keys = new Set(needed.map(metaShardKey));
  return Promise.all([...keys].map(ensureMetaShard));
}

function stub(idx) {
  const d = directory;
  return {
    id: d.ids[idx],
    idx,
    name: d.names[idx],
    slug: d.ids[idx].slice(d.pack[d.packId[idx]].length + 1),
    category: d.category[d.cat[idx]],
    style: d.style[d.sty[idx]],
    pack: d.pack[d.packId[idx]],
  };
}

const SYNONYMS = {
  house: ["home"], home: ["house"],
  pic: ["image", "photo"], picture: ["image", "photo"], photo: ["image"], image: ["photo"],
  logo: ["brand"], brands: ["logo"],
  truck: ["delivery", "shipping"], delivery: ["truck", "shipping"], shipping: ["delivery", "truck"],
  cart: ["shopping", "bag"], shopping: ["cart", "bag"], bag: ["shopping", "cart"],
  cellphone: ["mobile", "phone"], mobile: ["phone", "smartphone"], phone: ["mobile", "call"],
  laptop: ["computer", "desktop"], computer: ["laptop", "desktop", "pc"],
  kids: ["child", "baby"], child: ["kids", "baby"], baby: ["child"],
  people: ["user", "users", "group"], group: ["users", "people"], team: ["users", "group"],
  money: ["dollar", "cash", "wallet"], cash: ["money", "dollar"], wallet: ["money"],
  mail: ["email", "message"], email: ["mail", "message"], message: ["mail", "chat"],
  chat: ["message", "comment"], comment: ["chat", "message"],
  gear: ["settings", "cog"], cog: ["settings", "gear"], preferences: ["settings"],
  doc: ["document", "file"], document: ["doc", "file"], file: ["document", "doc"],
  folder: ["directory"], directory: ["folder"],
  pic2: ["image"],
  astro: ["star"], star: ["astro", "favorite"],
  heart: ["favorite", "like"], like: ["heart", "thumbsup"],
  download: ["save", "export"], upload: ["import", "share"], save: ["download"],
  copy: ["duplicate", "clipboard"], clipboard: ["copy"],
  trash: ["delete", "bin"], delete: ["trash"], bin: ["trash"],
  edit: ["pencil", "write"], pencil: ["edit"], write: ["edit", "pencil"],
  view: ["eye", "show"], eye: ["view", "show"], show: ["view"],
  hide: ["eyeoff"],
  add: ["plus"], plus: ["add", "new"], remove: ["minus"], minus: ["remove"],
  close: ["x", "cross"], x: ["close"], cross: ["close"],
  check: ["tick", "done"], tick: ["check"], done: ["check"],
  warning: ["alert", "caution"], alert: ["warning"], caution: ["warning"],
  info: ["information"], information: ["info"],
  help: ["question", "support"], question: ["help"],
  calendar: ["date", "schedule"], date: ["calendar"], schedule: ["calendar"],
  clock: ["time", "timer"], time: ["clock"], timer: ["clock"],
  map: ["location", "pin"], location: ["map", "pin"], pin: ["map", "location"],
  navigation: ["navigate", "compass", "route"], navigate: ["navigation", "compass"],
  compass: ["navigation"], route: ["navigation", "map"],
  music: ["audio", "note"], audio: ["music", "sound"], sound: ["audio"],
  video: ["movie", "play"], movie: ["video"], play: ["video", "media"],
  camera: ["photo", "image"], mic: ["microphone"], microphone: ["mic"],
  lock: ["security", "private"], unlock: ["lock", "open"], private: ["lock"],
  security: ["shield", "lock"], shield: ["security", "protection"], protection: ["shield"],
  database: ["server", "storage"], server: ["database", "cloud"], storage: ["database"],
  cloud: ["server"], network: ["wifi", "globe"], wifi: ["network", "wireless"],
  globe: ["world", "internet"], world: ["globe"], internet: ["globe", "network"],
  browser: ["web", "chrome"], web: ["browser", "internet"], chrome: ["browser"],
  code: ["code2", "developer", "programming"], programming: ["code", "developer"],
  terminal: ["console", "command"], console: ["terminal"], command: ["terminal"],
  bug: ["debug", "error"], debug: ["bug"], error: ["bug", "alert"],
  rocket: ["launch", "startup"], launch: ["rocket"],
  trophy: ["award", "winner"], award: ["trophy", "badge"], badge: ["award"],
  gift: ["present"], present: ["gift"],
  flag: ["marker"], marker: ["flag", "pin"],
  bookmark: ["save", "favorite"],
  tag: ["label", "hashtag"], label: ["tag"], hashtag: ["tag"],
  percent: ["discount"], discount: ["percent", "sale"], sale: ["discount", "percent"],
  dollar: ["money", "usd", "cash"], usd: ["dollar", "money"], euro: ["money"],
  bitcoin: ["crypto", "btc"], crypto: ["bitcoin"], btc: ["bitcoin"],
  chart: ["graph", "analytics", "stats"], graph: ["chart"], analytics: ["chart", "stats"],
  stats: ["chart", "analytics"], dashboard: ["chart", "layout"],
  brain: ["ai", "intelligence", "neural"], ai: ["brain", "intelligence"],
  robot: ["bot", "ai"], bot: ["robot", "ai"],
  game: ["gaming", "controller"], gaming: ["game"], controller: ["game"],
  dice: ["game"], joystick: ["game", "controller"],
  stethoscope: ["medical", "doctor", "health"], medical: ["health", "doctor"],
  doctor: ["medical", "health"], health: ["medical", "heart"], pill: ["medical", "health"],
  hospital: ["medical", "health"], ambulance: ["medical", "health"],
  dumbbell: ["fitness", "gym", "exercise"], fitness: ["gym", "exercise"], gym: ["fitness"],
  car: ["vehicle", "auto"], vehicle: ["car"], auto: ["car"],
  plane: ["flight", "airplane"], flight: ["plane"], airplane: ["plane"],
  train: ["rail"], bus: ["vehicle"], bike: ["bicycle", "cycle"], bicycle: ["bike"],
  ship: ["boat"], boat: ["ship"],
  house2: ["home"], building: ["office", "home"], office: ["building", "work"],
  briefcase: ["work", "business"], work: ["briefcase", "office"], business: ["briefcase"],
  handshake: ["deal", "agreement"], deal: ["handshake", "sale"],
  crown: ["premium", "vip"], premium: ["crown", "star"], vip: ["crown", "premium"],
  sparkle: ["sparkles", "magic", "star"], magic: ["sparkle", "wand"],
  wand: ["magic", "sparkle"],
  camera2: ["camera"],
  mic2: ["mic"],
};

function expandToken(token) {
  const terms = vocabMatches(token);
  const extra = SYNONYMS[token] || [];
  for (const syn of extra) {
    if (vocabSetCache ? vocabSetCache.has(syn) : vocab.includes(syn)) {
      if (!terms.includes(syn)) terms.push(syn);
    }
  }
  return terms;
}

export async function filterIcons(options = {}) {
  if (!directory) return [];
  const { q = "", category = "all", style = "all", pack = "all", sort = "name" } = options;
  const d = directory;
  const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);

  let idxs = null;
  for (const token of tokens) {
    const terms = expandToken(token);
    if (!terms.length) return [];
    let union = [];
    for (const term of terms) {
      const list = await loadPostings(term);
      if (list && list.length) union = union.length ? mergeUnion(union, list) : list.slice();
    }
    idxs = idxs === null ? union : intersect(idxs, union);
    if (!idxs.length) return [];
  }
  if (idxs === null) idxs = Array.from({ length: d.count }, (_, i) => i);

  const applyList = (map, key) => {
    if (key === "all") return idxs;
    const list = map[key];
    return list ? intersect(idxs, list) : [];
  };
  idxs = applyList(filtersData.category, category);
  idxs = applyList(filtersData.style, style);
  idxs = applyList(filtersData.pack, pack);

  const out = idxs.map(stub);
  out.sort((a, b) => {
    if (sort === "category") return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
    if (sort === "recent") return b.id.localeCompare(a.id) || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
  });
  return out;
}

export async function suggestIcons(query, limit = 6) {
  if (!directory || !query.trim()) return [];
  const list = await filterIcons({ q: query, sort: "name" });
  return list.slice(0, limit);
}

export function randomIconId(excludeId, category) {
  if (!directory || !filtersData) return null;
  let pool = null;
  if (category && category !== "all") pool = filtersData.category[category];
  if (!pool || !pool.length) pool = Array.from({ length: directory.count }, (_, i) => i);
  for (let tries = 0; tries < 8; tries++) {
    const idx = pool[Math.floor(Math.random() * pool.length)];
    const id = directory.ids[idx];
    if (id !== excludeId) return id;
  }
  return null;
}

export function allIcons() {
  return [];
}

export function markupFor(id) {
  return markupCache.get(id) || "";
}

function hydrateRecord(record) {
  if (!record) return null;
  const pack = packById(record.pack);
  return {
    ...record,
    markup: markupCache.get(record.id) || "",
    license: pack?.license || "",
    licenseName: pack?.licenseName || "",
    licenseUrl: pack?.licenseUrl || "",
    source: pack?.source || "",
    website: pack?.website || "",
    attribution: pack?.attribution || "",
    attributionRequired: Boolean(pack?.attributionRequired),
    description: `${record.name} from the ${pack?.name || record.pack} pack.`,
    searchableText: record.search || "",
  };
}

export function getIcon(id) {
  if (!directory) return null;
  const idx = idToIdx.get(id);
  if (idx == null) return null;
  const record = metaCache.get(idx);
  if (record) return hydrateRecord(record);
  return hydrateRecord({ ...stub(idx), viewBox: "0 0 24 24", render: "fill", tags: [], shard: "" });
}

export function iconsByIds(ids) {
  return ids.map((id) => getIcon(id)).filter(Boolean);
}

export function hydrate(icon) {
  return icon;
}

export function countByCategory() {
  const counts = {};
  if (!filtersData) return counts;
  for (const [name, list] of Object.entries(filtersData.category)) counts[name] = list.length;
  return counts;
}

export function loadMarkup(ids) {
  if (!directory) return Promise.resolve();
  const idxs = ids.map((id) => idToIdx.get(id)).filter((i) => i != null);
  return loadMetaIdxs(idxs).then(() => {
    const needed = new Set();
    for (const id of ids) {
      if (!id || markupCache.has(id)) continue;
      const idx = idToIdx.get(id);
      const shard = idx != null ? metaCache.get(idx)?.shard : null;
      if (shard) needed.add(shard);
    }
    return Promise.all([...needed].map((shard) => {
      if (!shardPromises.has(shard)) {
        const key = `../icon-data/shards/${shard}.json`;
        const loader = shardLoaders[key];
        shardPromises.set(
          shard,
          loader
            ? loader().then((mod) => {
                const data = mod.default || mod;
                for (const [id, markup] of Object.entries(data)) markupCache.set(id, markup);
              })
            : Promise.resolve(),
        );
      }
      return shardPromises.get(shard);
    }));
  });
}
