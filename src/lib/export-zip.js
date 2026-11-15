// @ts-nocheck
import { buildSvg } from "@/lib/snippets";
import { zipStore } from "@/lib/zip";

export function downloadIconsZip(filename, icons, meta) {
  const folder = filename.replace(/\.zip$/i, "");
  const files = icons.map((icon) => ({
    name: `${folder}/${icon.id}.svg`,
    text: buildSvg(icon),
  }));
  files.push({
    name: `${folder}/manifest.json`,
    text: JSON.stringify(
      {
        name: meta.name,
        description: meta.description ?? "",
        count: icons.length,
        icons: icons.map((icon) => ({
          id: icon.id,
          name: icon.name,
          category: icon.category,
          style: icon.style,
          pack: icon.pack,
          file: `${icon.id}.svg`,
        })),
      },
      null,
      2,
    ),
  });
  const bytes = zipStore(files);
  const blob = new Blob([bytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
