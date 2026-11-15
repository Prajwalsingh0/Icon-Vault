// @ts-nocheck
import { usesStroke } from "@/lib/snippets";

const sizes = [16, 20, 24, 32, 48];
const backgrounds = [
  { id: "transparent", label: "None" },
  { id: "canvas", label: "Canvas" },
  { id: "muted", label: "Muted" },
  { id: "inverse", label: "Inverse" },
  { id: "custom", label: "Custom" },
];

export function IconCustomizer({ icon, value, onChange }) {
  const stroke = usesStroke(icon);
  return (
    <div className="flex flex-col gap-5">
      <Control label="Size" value={`${value.size}px`}>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              aria-pressed={value.size === size}
              onClick={() => onChange({ size })}
              className={`h-10 min-w-10 rounded-md border px-2 text-sm tabular-nums ${value.size === size ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}
            >
              {size}
            </button>
          ))}
        </div>
        <Range min={12} max={128} step={1} value={value.size} ariaLabel="Icon size" onChange={(size) => onChange({ size })} />
      </Control>

      <Control label="Color" value={value.color === "currentColor" ? "Theme" : value.color}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={value.color === "currentColor"}
            onClick={() => onChange({ color: "currentColor" })}
            className={`h-11 rounded-md border px-3 text-sm ${value.color === "currentColor" ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}
          >
            Theme
          </button>
          <label className="flex h-11 items-center gap-2 rounded-md border border-border bg-card px-2 text-sm">
            <span className="sr-only">Custom color</span>
            <input
              type="color"
              value={value.color === "currentColor" ? "#141416" : value.color}
              onChange={(event) => onChange({ color: event.target.value })}
              className="size-8 cursor-pointer border-0 bg-transparent p-0"
            />
            <input
              aria-label="Hex color"
              value={value.color === "currentColor" ? "" : value.color}
              placeholder="#141416"
              onChange={(event) => {
                const next = event.target.value;
                if (next === "") onChange({ color: "currentColor" });
                else onChange({ color: next });
              }}
              className="w-24 bg-transparent font-mono text-sm outline-none"
            />
          </label>
        </div>
      </Control>

      <Control label="Stroke" value={stroke ? strokeWidthLabel(value.strokeWidth) : "Not used"}>
        <Range
          min={1}
          max={2.75}
          step={0.25}
          value={value.strokeWidth}
          disabled={!stroke}
          ariaLabel="Stroke width"
          onChange={(strokeWidth) => onChange({ strokeWidth })}
        />
        {!stroke ? <p className="mt-1 text-xs text-muted-foreground">Stroke width applies to outline icons.</p> : null}
      </Control>

      <Control label="Rotate" value={`${value.rotate}°`}>
        <Range min={0} max={360} step={15} value={value.rotate} ariaLabel="Rotation" onChange={(rotate) => onChange({ rotate })} />
      </Control>

      <Control label="Background">
        <div className="flex flex-wrap gap-1.5">
          {backgrounds.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={value.background === item.id}
              onClick={() => onChange({ background: item.id })}
              className={`h-10 rounded-md border px-3 text-sm ${value.background === item.id ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {value.background === "custom" ? (
          <label className="mt-2 flex h-11 items-center gap-2 rounded-md border border-border bg-card px-2 text-sm">
            <span className="sr-only">Background color</span>
            <input
              type="color"
              value={value.backgroundColor}
              onChange={(event) => onChange({ backgroundColor: event.target.value })}
              className="size-8 cursor-pointer border-0 bg-transparent p-0"
            />
            <span className="font-mono text-sm">{value.backgroundColor}</span>
          </label>
        ) : null}
      </Control>

      <Control label="Opacity" value={`${Math.round(value.opacity * 100)}%`}>
        <Range min={0.15} max={1} step={0.05} value={value.opacity} ariaLabel="Opacity" onChange={(opacity) => onChange({ opacity })} />
      </Control>

      <Control label="Preview scale" value={`${value.scale.toFixed(1)}×`}>
        <Range min={1} max={2.5} step={0.1} value={value.scale} ariaLabel="Preview scale" onChange={(scale) => onChange({ scale })} />
      </Control>
    </div>
  );
}

function strokeWidthLabel(value) {
  return Number(value).toFixed(2).replace(/0$/, "").replace(/\.$/, "");
}

function Control({ label, value, children }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 flex w-full items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        {value ? <span className="font-mono text-xs text-muted-foreground tabular-nums">{value}</span> : null}
      </legend>
      {children}
    </fieldset>
  );
}

function Range({ min, max, step, value, onChange, disabled, ariaLabel }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-10 w-full accent-foreground disabled:opacity-40"
    />
  );
}
