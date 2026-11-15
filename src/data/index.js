// @ts-nocheck
import { categories, categoryLabel } from "./categories";
import { collections } from "./collections";
import { packById, packs, styleLabel, styles, iconCount } from "./packs";
import { categoryCounts } from "./stats";
import { countByCategory, filterIcons, getIcon, iconsByIds, PAGE_SIZE } from "@/lib/icon-registry";

export { categories, categoryCounts, categoryLabel, collections, countByCategory, filterIcons, getIcon, iconCount, iconsByIds, packById, packs, PAGE_SIZE, styleLabel, styles };

export function getCollection(slug) {
  return collections.find((collection) => collection.slug === slug) ?? null;
}

export function collectionIcons(collection) {
  return iconsByIds(collection?.iconIds ?? []);
}

export function toPublicIcon(item, { includeMarkup = false } = {}) {
  const payload = {
    id: item.id,
    name: item.name,
    slug: item.slug,
    category: item.category,
    tags: item.tags || [],
    style: item.style,
    pack: item.pack,
    license: item.license || packById(item.pack)?.license || "",
    source: item.source || packById(item.pack)?.source || "",
    variants: item.variants || [],
    description: item.description || `${item.name} from the ${packById(item.pack)?.name || item.pack} pack.`,
    searchableText: item.searchableText || item.search || "",
  };
  if (includeMarkup) payload.svg = item.markup;
  return payload;
}
