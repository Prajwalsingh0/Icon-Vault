// @ts-nocheck
export function Mark({ className = "size-7" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-foreground" />
      <rect x="7" y="7" width="7" height="7" rx="1.5" className="fill-background" />
      <rect x="18" y="7" width="7" height="7" rx="1.5" className="fill-background opacity-50" />
      <rect x="7" y="18" width="7" height="7" rx="1.5" className="fill-background opacity-50" />
      <rect x="18" y="18" width="7" height="7" rx="1.5" className="fill-background" />
    </svg>
  );
}
