import { cn } from "@dub/utils";
import { CSSProperties, ReactNode } from "react";

export function MetricCards({
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
    <div className={cn("@container/metrics", className)}>
      <div
        className={cn(
          "grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 ring-4 ring-black/5",
          "@xs/metrics:grid-cols-[repeat(var(--cols),1fr)]",
        )}
        style={{ "--cols": items.length } as CSSProperties}
      >
        {items.map(({ label, value, detail, indicator }) => (
          <div
            key={label}
            className="relative flex min-h-[78px] flex-col bg-white p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-neutral-500">{label}</span>
              {indicator}
            </div>
            <span className="text-content-emphasis mt-0.5 text-base font-medium">
              {value}
            </span>
            {detail && (
              <span className="mt-0.5 text-xs text-neutral-500">{detail}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
