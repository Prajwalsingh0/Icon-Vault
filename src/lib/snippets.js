// @ts-nocheck

export function usesStroke(icon) {
  return icon.render === "stroke";
}

export function componentName(icon) {
  const parts = icon.id.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1));
  return `Icon${parts.join("")}`;
}

function viewBoxOf(icon) {
  return icon.viewBox || "0 0 24 24";
}

function rotateAttr(rotate, viewBox) {
  if (!rotate) return "";
  const [x, y, width, height] = viewBox.split(/[\s,]+/).map(Number);
  const cx = (x || 0) + (width || 24) / 2;
  const cy = (y || 0) + (height || 24) / 2;
  return ` transform="rotate(${rotate} ${cx} ${cy})"`;
}

export function buildSvg(icon, { size = 24, color = "currentColor", strokeWidth = 1.75, rotate = 0, opacity = 1 } = {}) {
  const viewBox = viewBoxOf(icon);
  const spin = rotateAttr(rotate, viewBox);
  const op = opacity < 1 ? ` opacity="${opacity}"` : "";
  if (icon.render === "fill") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}" fill="${color}"${spin}${op}>${icon.markup}</svg>`;
  }
  if (icon.render === "mixed") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}" fill="none" color="${color}"${spin}${op}>${icon.markup}</svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${spin}${op}>${icon.markup}</svg>`;
}

export function buildHtml(icon, options, background) {
  const svg = buildSvg(icon, options);
  if (!background || background === "transparent") return svg;
  return `<div style="display:inline-flex;background:${background};padding:12px;border-radius:12px;line-height:0">${svg}</div>`;
}

export function buildReact(icon, { size = 24, color = "currentColor", strokeWidth = 1.75, rotate = 0 } = {}) {
  const name = componentName(icon);
  const viewBox = viewBoxOf(icon);
  const transform = rotateAttr(rotate, viewBox);
  if (icon.render === "stroke") {
    return `export function ${name}({ size = ${size}, color = "${color}", strokeWidth = ${strokeWidth}, title = "${icon.name}" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="${viewBox}" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={title}${transform}>
      ${icon.markup}
    </svg>
  );
}`;
  }
  if (icon.render === "fill") {
    return `export function ${name}({ size = ${size}, color = "${color}", title = "${icon.name}" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="${viewBox}" fill={color} role="img" aria-label={title}${transform}>
      ${icon.markup}
    </svg>
  );
}`;
  }
  return `export function ${name}({ size = ${size}, color = "${color}", title = "${icon.name}" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="${viewBox}" fill="none" color={color} role="img" aria-label={title}${transform}>
      ${icon.markup}
    </svg>
  );
}`;
}

export function buildVue(icon, { size = 24, color = "currentColor", strokeWidth = 1.75, rotate = 0 } = {}) {
  const viewBox = viewBoxOf(icon);
  const svg = buildSvg(icon, { size, color, strokeWidth, rotate });
  return `<template>
  ${svg.replace(`viewBox="${viewBox}"`, `viewBox="${viewBox}" role="img" aria-label="${icon.name}"`)}
</template>`;
}

export function buildCss(icon, { size = 24, color = "currentColor" } = {}) {
  const svg = buildSvg(icon, { size: 24, color: "#000", strokeWidth: 1.75, rotate: 0 });
  const encoded = encodeURIComponent(svg).replace(/'/g, "%27");
  return `.icon-${icon.id} {
  width: ${size}px;
  height: ${size}px;
  background: ${color};
  -webkit-mask: url("data:image/svg+xml,${encoded}") center / contain no-repeat;
  mask: url("data:image/svg+xml,${encoded}") center / contain no-repeat;
}`;
}

export function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

export function downloadPng(svgElement, filename, background) {
  const clone = svgElement.cloneNode(true);
  const box = svgElement.getBoundingClientRect();
  const color = getComputedStyle(svgElement).color || "#141416";
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (clone.getAttribute("stroke") === "currentColor") clone.setAttribute("stroke", color);
  if (clone.getAttribute("fill") === "currentColor") clone.setAttribute("fill", color);
  clone.querySelectorAll("*").forEach((node) => {
    ["fill", "stroke", "color"].forEach((attr) => {
      if (node.getAttribute(attr) === "currentColor") node.setAttribute(attr, color);
    });
  });
  const size = Math.max(32, Math.round(Number(svgElement.getAttribute("width")) || box.width || 24));
  const scale = 4;
  const svgText = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = size * scale;
    canvas.height = size * scale;
    const context = canvas.getContext("2d");
    if (background && background !== "transparent") {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((png) => {
      if (!png) return;
      const pngUrl = URL.createObjectURL(png);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(pngUrl);
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  image.onerror = () => URL.revokeObjectURL(url);
  image.src = url;
}
