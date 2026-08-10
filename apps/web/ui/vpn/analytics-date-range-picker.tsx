"use client";

import { DateRangePicker, useRouterStuff } from "@dub/ui";
import { endOfDay, startOfDay, subDays } from "date-fns";

const presets = [
  { id: "24h", label: "Last 24 hours", days: 1, shortcut: "1" },
  { id: "7d", label: "Last 7 days", days: 7, shortcut: "7" },
  { id: "30d", label: "Last 30 days", days: 30, shortcut: "3" },
  { id: "90d", label: "Last 3 months", days: 90, shortcut: "9" },
];

export function AnalyticsDateRangePicker({
  defaultInterval = "30d",
}: {
  defaultInterval?: string;
}) {
  const { queryParams, searchParamsObj } = useRouterStuff();
  const { start, end, interval } = searchParamsObj as {
    start?: string;
    end?: string;
    interval?: string;
  };
  const now = new Date();

  return (
    <DateRangePicker
      align="end"
      className="w-fit"
      value={
        start && end ? { from: new Date(start), to: new Date(end) } : undefined
      }
      presetId={!start || !end ? interval ?? defaultInterval : undefined}
      onChange={(range, preset) => {
        if (preset) {
          queryParams({
            del: ["start", "end"],
            set: { interval: preset.id },
          });
          return;
        }

        if (!range?.from || !range.to) return;
        queryParams({
          del: "interval",
          set: {
            start: range.from.toISOString(),
            end: range.to.toISOString(),
          },
        });
      }}
      presets={presets.map(({ id, label, days, shortcut }) => ({
        id,
        label,
        shortcut,
        dateRange: {
          from: startOfDay(subDays(now, days - 1)),
          to: endOfDay(now),
        },
      }))}
    />
  );
}
