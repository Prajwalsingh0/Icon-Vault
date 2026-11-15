// @ts-nocheck

export function attachSearch(icon, labelFor) {
  const label = labelFor ? labelFor(icon.category) : icon.category;
  icon.search = `${icon.name} ${icon.slug} ${(icon.tags || []).join(" ")} ${icon.category} ${label} ${icon.pack} ${icon.style}`.toLowerCase();
  return icon;
}

export function queryIcons(icons, { q = "", category = "all", style = "all", pack = "all", sort = "name" } = {}) {
  const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const list = icons.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (style !== "all" && item.style !== style) return false;
    if (pack !== "all" && item.pack !== pack) return false;
    if (!tokens.length) return true;
    return tokens.every((token) => item.search.includes(token));
  });
  list.sort((a, b) => {
    if (sort === "category") return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
    if (sort === "recent") return b.slug.localeCompare(a.slug) || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name) || a.pack.localeCompare(b.pack);
  });
  return list;
}
