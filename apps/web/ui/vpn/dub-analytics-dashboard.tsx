"use client";

import { Areas, TimeSeriesChart, XAxis, YAxis } from "@dub/ui/charts";
import { Cube, Globe, MobilePhone } from "@dub/ui/icons";
import { cn, nFormatter } from "@dub/utils";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

type Metric = "requests" | "devices" | "cost";
type ChartValues = Record<Metric, number>;

type AnalyticsPoint = {
  date: string;
  requests: number;
  devices: number;
  cost: number;
};

type Breakdown = {
  label: string;
  value: number;
  detail?: string;
};

const metricTabs: {
  id: Metric;
  label: string;
  colorClassName: string;
}[] = [
  { id: "requests", label: "Requests", colorClassName: "text-blue-500/50" },
  { id: "devices", label: "Devices", colorClassName: "text-violet-600/50" },
  { id: "cost", label: "Infrastructure", colorClassName: "text-teal-400/50" },
];

export function DubAnalyticsDashboard({
  points,
  totals,
  platforms,
  applications,
  providers,
  metricLabels,
  breakdownLabels,
  secondaryTitle = "Infrastructure overview",
}: {
  points: AnalyticsPoint[];
  totals: Record<Metric, number>;
  platforms: Breakdown[];
  applications: Breakdown[];
  providers: Breakdown[];
  metricLabels?: Partial<Record<Metric, string>>;
  breakdownLabels?: Partial<
    Record<"platforms" | "applications" | "providers", string>
  >;
  secondaryTitle?: string;
}) {
  const [metric, setMetric] = useState<Metric>("requests");
  const [breakdown, setBreakdown] = useState<
    "platforms" | "applications" | "providers"
  >("platforms");

  const chartData = useMemo<{ date: Date; values: ChartValues }[]>(
    () =>
      points.map((point) => ({
        date: new Date(point.date),
        values: {
          requests: point.requests,
          devices: point.devices,
          cost: point.cost,
        },
      })),
    [points],
  );

  const breakdownData =
    breakdown === "platforms"
      ? platforms
      : breakdown === "applications"
        ? applications
        : providers;
  const maxBreakdown = Math.max(...breakdownData.map(({ value }) => value), 1);
  const totalBreakdown = Math.max(
    breakdownData.reduce((total, { value }) => total + value, 0),
    1,
  );
  const selected = metricTabs.find(({ id }) => id === metric)!;
  const getMetricLabel = (id: Metric, fallback: string) =>
    metricLabels?.[id] ?? fallback;

  return (
    <div className="space-y-6 pb-10">
      <section className="w-full overflow-hidden bg-white">
        <div className="overflow-x-auto rounded-t-xl border border-neutral-200">
          <div className="grid min-w-[660px] grid-cols-3 divide-x divide-neutral-200 overflow-hidden">
            <NumberFlowGroup>
              {metricTabs.map(({ id, label, colorClassName }, index) => (
                <div key={id} className="relative z-0">
                  {index > 0 && (
                    <div className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-200 bg-white p-1.5">
                      <ChevronRight
                        className="size-3 text-neutral-400"
                        strokeWidth={2.5}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setMetric(id)}
                    className="relative block h-full w-full px-8 py-6 text-left ring-inset ring-neutral-500 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-1 active:bg-neutral-100"
                  >
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 h-0.5 w-full bg-black transition-transform duration-100",
                        metric !== id && "translate-y-[3px]",
                      )}
                    />
                    <div className="flex items-center gap-2.5 text-sm text-neutral-600">
                      <div
                        className={cn(
                          "size-2 rounded-sm bg-current shadow-[inset_0_0_0_1px_#00000019]",
                          colorClassName,
                        )}
                      />
                      <span>{getMetricLabel(id, label)}</span>
                    </div>
                    <div className="mt-1 flex h-12 items-center">
                      <NumberFlow
                        value={totals[id]}
                        className="text-3xl font-medium"
                        format={
                          id === "cost"
                            ? { style: "currency", currency: "USD" }
                            : {
                                notation:
                                  totals[id] > 999999 ? "compact" : "standard",
                              }
                        }
                      />
                    </div>
                  </button>
                </div>
              ))}
            </NumberFlowGroup>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-b-xl border-x border-b border-neutral-200">
          <div className="h-[420px] p-5 pt-10 sm:p-10">
            {chartData.length ? (
              <TimeSeriesChart
                data={chartData}
                series={metricTabs.map(({ id, colorClassName }) => ({
                  id,
                  valueAccessor: (datum: { date: Date; values: ChartValues }) =>
                    datum.values[id],
                  isActive: metric === id,
                  colorClassName,
                }))}
                tooltipClassName="p-0"
                tooltipContent={(datum) => (
                  <>
                    <p className="border-b border-neutral-200 px-4 py-3 text-sm text-neutral-900">
                      {datum.date.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                      })}
                    </p>
                    <div className="flex min-w-44 items-center justify-between gap-8 px-4 py-3 text-sm">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <span
                          className={cn(
                            "size-2 rounded-sm bg-current",
                            selected.colorClassName,
                          )}
                        />
                        {getMetricLabel(selected.id, selected.label)}
                      </div>
                      <span className="font-medium text-neutral-900">
                        {metric === "cost"
                          ? `$${datum.values.cost.toLocaleString()}`
                          : nFormatter(datum.values[metric], { full: true })}
                      </span>
                    </div>
                  </>
                )}
              >
                <Areas />
                <XAxis showGridLines />
                <YAxis
                  showGridLines
                  tickFormat={(value) =>
                    metric === "cost"
                      ? `$${nFormatter(value)}`
                      : nFormatter(value)
                  }
                />
              </TimeSeriesChart>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                No analytics available for this period
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="group relative h-[400px] overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center border-b border-neutral-200 px-4">
            {[
              {
                id: "platforms" as const,
                label: breakdownLabels?.platforms ?? "Platforms",
                icon: MobilePhone,
              },
              {
                id: "applications" as const,
                label: breakdownLabels?.applications ?? "Applications",
                icon: Cube,
              },
              {
                id: "providers" as const,
                label: breakdownLabels?.providers ?? "Providers",
                icon: Globe,
              },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setBreakdown(id)}
                className={cn(
                  "relative flex items-center gap-2 p-4 text-sm transition-colors",
                  breakdown === id
                    ? "text-neutral-950"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                <Icon className="size-4" />
                {label}
                {breakdown === id && (
                  <span className="absolute bottom-0 left-1.5 right-1.5 h-0.5 rounded-t-full bg-black" />
                )}
              </button>
            ))}
          </div>
          <div className="py-4">
            {breakdownData.length ? (
              breakdownData.slice(0, 8).map((item) => {
                const Icon =
                  breakdown === "platforms"
                    ? MobilePhone
                    : breakdown === "applications"
                      ? Cube
                      : Globe;
                const percentage =
                  Math.round((item.value / totalBreakdown) * 1000) / 10;

                return (
                  <div
                    key={item.label}
                    className="group block min-w-0 border-l-2 border-transparent px-4 py-1 transition-all hover:border-green-500 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent"
                  >
                    <div className="relative flex items-center justify-between">
                      <motion.div
                        className="absolute inset-0 -z-10 h-full origin-left rounded-md bg-green-100"
                        style={{
                          width: `${Math.max((item.value / maxBreakdown) * 100, 2)}%`,
                        }}
                        transition={{ ease: "easeOut", duration: 0.3 }}
                        initial={{ transform: "scaleX(0)" }}
                        animate={{ transform: "scaleX(1)" }}
                      />
                      <div className="relative z-10 flex h-8 w-full min-w-0 max-w-[calc(100%-2rem)] items-center transition-[max-width] duration-300 ease-in-out group-hover:max-w-[calc(100%-5rem)]">
                        <div className="z-10 flex min-w-0 items-center space-x-4 overflow-hidden px-3">
                          <div className="flex size-6 shrink-0 items-center justify-center">
                            <Icon className="size-4 text-neutral-500" />
                          </div>
                          <div className="min-w-0 truncate text-sm text-neutral-800">
                            {item.label}
                            {item.detail && (
                              <span className="ml-2 text-xs text-neutral-400">
                                {item.detail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="z-10 flex items-center">
                        <NumberFlow
                          value={item.value}
                          className="z-10 px-2 text-sm text-neutral-600 transition-transform duration-300 group-hover:-translate-x-14"
                          format={{
                            notation:
                              item.value > 999999 ? "compact" : "standard",
                          }}
                        />
                        <div className="invisible absolute right-0 translate-x-14 px-3 text-sm text-neutral-600/70 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-x-0 group-hover:opacity-100">
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-neutral-500">
                No data available
              </div>
            )}
          </div>
        </section>

        <section className="h-[400px] overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-5 py-[17px]">
            <h2 className="text-sm font-medium text-neutral-900">
              {secondaryTitle}
            </h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {providers.slice(0, 7).map((provider) => (
              <div
                key={provider.label}
                className="flex h-[49px] items-center justify-between px-5 text-sm transition-colors hover:bg-neutral-50"
              >
                <div>
                  <p className="font-medium text-neutral-800">
                    {provider.label}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {provider.detail || "Infrastructure provider"}
                  </p>
                </div>
                <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600">
                  ${provider.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
