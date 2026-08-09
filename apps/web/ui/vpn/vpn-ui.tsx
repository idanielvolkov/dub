import { cn } from "@dub/utils";
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
    <div className="border-border-subtle bg-bg-default rounded-xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-content-default text-sm font-medium">{label}</p>
        {indicator}
      </div>
      <p className="text-content-emphasis mt-2 text-2xl font-semibold tracking-tight">
        {value}
      </p>
      <p className="text-content-subtle mt-1 text-xs">{detail}</p>
    </div>
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
    <div
      className={cn(
        "border-border-subtle bg-bg-default overflow-hidden rounded-xl border",
        className,
      )}
    >
      {children}
    </div>
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
  return (
    <div className="bg-bg-muted h-1.5 overflow-hidden rounded-full">
      <div
        className="bg-bg-inverted h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
