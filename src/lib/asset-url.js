// @ts-nocheck
import { previewPathPrefix } from "@/lib/preview-path-prefix";

export function assetUrl(path) {
  if (typeof window === "undefined") return path;
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname) || "";
  return `${prefix}${path}`;
}
