// @ts-nocheck
export const defaultLibrarySearch = {
  q: "",
  category: "all",
  style: "all",
  pack: "all",
  sort: "name",
  view: "grid",
  page: 1,
};

const sorts = new Set(["name", "recent", "category"]);

export function parseLibrarySearch(search) {
  const source = search && typeof search === "object" ? search : {};
  const pageNum = Number(source.page);
  return {
    q: typeof source.q === "string" ? source.q : "",
    category: typeof source.category === "string" ? source.category : "all",
    style: typeof source.style === "string" ? source.style : "all",
    pack: typeof source.pack === "string" ? source.pack : "all",
    sort: sorts.has(source.sort) ? source.sort : "name",
    view: source.view === "list" ? "list" : "grid",
    page: Number.isFinite(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1,
  };
}

export function librarySearch(partial) {
  return { ...defaultLibrarySearch, ...partial };
}
