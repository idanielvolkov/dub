"use client";

import { RemnawaveNode } from "@/lib/remnawave/client";
import { EmptyState, ProgressBar, StatusBadge, Table, useTable } from "@dub/ui";
import { Nodes4 } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

const formatTraffic = (bytes: number) => {
  const gigabytes = bytes / 1024 ** 3;
  return gigabytes >= 1000
    ? `${(gigabytes / 1000).toFixed(1)} TB`
    : `${gigabytes.toFixed(1)} GB`;
};

export function NetworkActivityTable({ nodes }: { nodes: RemnawaveNode[] }) {
  const maxTraffic = Math.max(
    ...nodes.map((node) => node.trafficUsedBytes || 0),
    1,
  );
  const columns = useMemo<ColumnDef<RemnawaveNode>[]>(
    () => [
      {
        id: "node",
        header: "Node",
        cell: ({ row }) => (
          <div>
            <p className="text-content-emphasis font-medium">
              {row.original.name}
            </p>
            <p className="text-content-subtle font-mono text-xs">
              {row.original.address}:{row.original.port}
            </p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            variant={row.original.isConnected ? "success" : "pending"}
          >
            {row.original.isConnected ? "Connected" : "Connecting"}
          </StatusBadge>
        ),
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => row.original.countryCode || "—",
      },
      {
        id: "online",
        header: "Users online",
        cell: ({ row }) => row.original.usersOnline,
      },
      {
        id: "traffic",
        header: "Traffic",
        meta: { disableTruncate: true },
        cell: ({ row }) => (
          <div className="min-w-40">
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="text-content-emphasis font-medium">
                {formatTraffic(row.original.trafficUsedBytes || 0)}
              </span>
              <span className="text-content-subtle">
                {Math.round(
                  ((row.original.trafficUsedBytes || 0) / maxTraffic) * 100,
                )}
                %
              </span>
            </div>
            <ProgressBar
              className="h-1.5"
              value={row.original.trafficUsedBytes || 0}
              max={maxTraffic}
            />
          </div>
        ),
      },
    ],
    [maxTraffic],
  );
  const table = useTable({ data: nodes, columns });

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-content-emphasis text-sm font-semibold">
            Network activity
          </h2>
          <p className="text-content-subtle text-sm">
            Live availability, subscribers and traffic reported by Remnawave
          </p>
        </div>
        <StatusBadge
          variant={
            nodes.some((node) => node.isConnected) ? "success" : "pending"
          }
        >
          {nodes.filter((node) => node.isConnected).length} online
        </StatusBadge>
      </div>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "nodes" : "node")}
        emptyState={
          <EmptyState
            icon={Nodes4}
            title="No VPN nodes"
            description="Nodes will appear here after they connect to Remnawave."
          />
        }
      />
    </section>
  );
}
