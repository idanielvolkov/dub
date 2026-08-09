import { cn } from "@dub/utils";
import { CSSProperties, ReactNode } from "react";

export function VpnStats({
  items,
  className,
}: {
  items: {
    label: string;
    value: ReactNode;
    detail?: ReactNode;
    indicator?: ReactNode;
  }[];
  className?: string;
}) {
  return (
    <div className={cn("@container/stats", className)}>
      <div
        className={cn(
          "@xs/stats:grid-cols-[repeat(var(--cols),1fr)] grid grid-cols-1 ring-4 ring-black/5",
          "gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200",
        )}
        style={{ "--cols": items.length } as CSSProperties}
      >
        {items.map(({ label, value, detail, indicator }) => (
          <div key={label} className="relative flex flex-col bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-neutral-500">{label}</span>
              {indicator}
            </div>
            <span className="text-content-emphasis text-base font-medium">
              {value}
            </span>
            {detail && (
              <span className="text-content-subtle mt-0.5 text-xs">
                {detail}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
