// @ts-nocheck
import { forwardRef } from "react";

export const IconGlyph = forwardRef(function IconGlyph(
  { icon, size = 24, color = "currentColor", strokeWidth = 1.75, rotate = 0, opacity = 1, className = "", title },
  ref,
) {
  const stroke = icon.render === "stroke";
  const fill = icon.render === "fill";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{
        color,
        width: size,
        height: size,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        opacity,
      }}
    >
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={icon.viewBox || "0 0 24 24"}
        fill={fill ? "currentColor" : "none"}
        stroke={stroke ? "currentColor" : "none"}
        strokeWidth={stroke ? strokeWidth : 0}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={icon.motion ? `iv-motion-${icon.motion}` : undefined}
        role={title ? "img" : "presentation"}
        aria-label={title || undefined}
        aria-hidden={title ? undefined : true}
        dangerouslySetInnerHTML={{ __html: icon.markup }}
      />
    </span>
  );
});
