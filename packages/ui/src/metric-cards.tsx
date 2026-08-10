import { cn } from "@dub/utils";
import { ReactNode } from "react";
import { CardList, CardListCard } from "./card-list";

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
      <CardList
        variant="loose"
        className={cn(
          "grid grid-cols-1 gap-3",
          items.length === 2 && "@xs/metrics:grid-cols-2",
          items.length === 3 && "@xs/metrics:grid-cols-3",
          items.length >= 4 && "@xs/metrics:grid-cols-4",
        )}
      >
        {items.map(({ label, value, detail, indicator }) => (
          <CardListCard
            key={label}
            hoverStateEnabled={false}
            innerClassName="relative flex h-full flex-col p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-content-subtle text-xs">{label}</span>
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
          </CardListCard>
        ))}
      </CardList>
    </div>
  );
}
