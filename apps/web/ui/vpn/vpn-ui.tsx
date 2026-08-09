import { CardList, ProgressBar } from "@dub/ui";
import { ReactNode } from "react";

export function VpnMetricCard({
  label,
  value,
  detail,
  indicator,
}: {
  label: string;
  value: ReactNode;
  detail: ReactNode;
  indicator?: ReactNode;
}) {
  return (
    <CardList>
      <CardList.Card innerClassName="p-5" hoverStateEnabled={false}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-content-default text-sm font-medium">{label}</p>
          {indicator}
        </div>
        <p className="text-content-emphasis mt-2 text-2xl font-semibold tracking-tight">
          {value}
        </p>
        <p className="text-content-subtle mt-1 text-xs">{detail}</p>
      </CardList.Card>
    </CardList>
  );
}

export function VpnPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <CardList className={className}>
      <CardList.Card
        outerClassName="overflow-hidden"
        innerClassName="p-0"
        hoverStateEnabled={false}
      >
        {children}
      </CardList.Card>
    </CardList>
  );
}

export function VpnPanelHeader({
  title,
  description,
  controls,
}: {
  title: string;
  description?: string;
  controls?: ReactNode;
}) {
  return (
    <div className="border-border-subtle flex min-h-16 items-center justify-between gap-4 border-b px-5 py-3.5">
      <div className="min-w-0">
        <p className="text-content-emphasis text-sm font-semibold">{title}</p>
        {description && (
          <p className="text-content-subtle mt-0.5 text-sm">{description}</p>
        )}
      </div>
      {controls}
    </div>
  );
}

export function VpnProgress({ value }: { value: number }) {
  return <ProgressBar value={Math.min(100, Math.max(0, value))} />;
}
