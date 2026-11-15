// @ts-nocheck
import { IconGlyph } from "@/components/icons/IconGlyph";
import { cn } from "@/lib/utils";

const backgrounds = {
  transparent: "iv-checker",
  canvas: "bg-background",
  inverse: "bg-foreground",
  muted: "bg-muted",
  custom: "",
};

export function IconPreview({ icon, size, color, strokeWidth, rotate, opacity = 1, background, backgroundColor, scale, svgRef }) {
  const tone = color === "currentColor" && background === "inverse" ? "var(--background)" : color;
  return (
    <div
      className={cn(
        "flex min-h-72 items-center justify-center overflow-hidden rounded-xl border border-border",
        backgrounds[background] || "bg-background",
      )}
      style={background === "custom" ? { background: backgroundColor } : undefined}
    >
      <div style={{ transform: `scale(${scale})` }} className="transition-transform duration-150 ease-out">
        <IconGlyph ref={svgRef} icon={icon} size={size} color={tone} strokeWidth={strokeWidth} rotate={rotate} opacity={opacity} title={icon.name} />
      </div>
    </div>
  );
}
