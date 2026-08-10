"use client";

import { EmptyState, StatusBadge, Table, useTable } from "@dub/ui";
import { Megaphone } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

export type CampaignSummary = {
  id: string;
  title: string | null;
  shortLink: string;
  campaign: string | null;
  status: "draft" | "active" | "paused" | "completed";
  clicks: number;
  leads: number;
  sales: number;
  createdAt: string;
};

export function CampaignSummaryTable({
  campaigns,
}: {
  campaigns: CampaignSummary[];
}) {
  const columns = useMemo<ColumnDef<CampaignSummary>[]>(
    () => [
      {
        id: "campaign",
        header: "Campaign",
        cell: ({ row }) => (
          <div>
            <p className="text-content-emphasis font-medium">
              {row.original.title ||
                row.original.campaign ||
                row.original.shortLink}
            </p>
            <p className="text-content-subtle text-xs">
              {row.original.shortLink}
            </p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={row.original.status === "active" ? "success" : "neutral"}
          >
            {row.original.status}
          </StatusBadge>
        ),
      },
      { accessorKey: "clicks", header: "Clicks" },
      { accessorKey: "leads", header: "Leads" },
      { accessorKey: "sales", header: "Sales" },
      {
        id: "created",
        header: "Created",
        cell: ({ row }) =>
          new Intl.DateTimeFormat("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(row.original.createdAt)),
      },
    ],
    [],
  );
  const table = useTable({ data: campaigns, columns });

  return (
    <Table
      {...table}
      resourceName={(plural) => (plural ? "campaigns" : "campaign")}
      emptyState={
        <EmptyState
          icon={Megaphone}
          title="No campaign data"
          description="Campaign activity will appear here."
        />
      }
    />
  );
}
