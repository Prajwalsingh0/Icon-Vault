// @ts-nocheck
import * as Tabs from "@radix-ui/react-tabs";
import { CopyButton } from "@/components/icons/CopyButton";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "svg", label: "SVG" },
  { id: "html", label: "HTML" },
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
  { id: "css", label: "CSS" },
];

export function CodePreview({ snippets }) {
  return (
    <Tabs.Root defaultValue="svg" className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs.List aria-label="Integration snippets" className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "h-10 shrink-0 rounded-md px-3 text-sm text-muted-foreground data-[state=active]:bg-foreground data-[state=active]:text-background",
              )}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </div>
      {tabs.map((tab) => (
        <Tabs.Content key={tab.id} value={tab.id} className="relative">
          <div className="absolute top-3 right-3">
            <CopyButton text={snippets[tab.id]} label={`Copy ${tab.label}`} variant="secondary" />
          </div>
          <pre className="max-h-80 overflow-auto p-4 pr-28 font-mono text-xs leading-relaxed text-foreground">
            <code>{snippets[tab.id]}</code>
          </pre>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
