"use client";

import { UserAvatar } from "@/ui/users/user-avatar";
import { EmptyState, StatusBadge, Table, useTable } from "@dub/ui";
import { BookOpen } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

export type WorkspaceActivityRow = {
  id: string;
  action: string;
  description: string;
  resourceType: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
};

export function ActivityTable({
  activity,
}: {
  activity: WorkspaceActivityRow[];
}) {
  const columns = useMemo<ColumnDef<WorkspaceActivityRow>[]>(
    () => [
      {
        id: "activity",
        header: "Activity",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <UserAvatar
              user={
                row.original.user || {
                  id: "system",
                  name: "System",
                  email: null,
                  image: null,
                }
              }
              className="size-8 border-none"
            />
            <div>
              <p className="text-content-emphasis font-medium">
                {row.original.description || row.original.action}
              </p>
              <p className="text-content-subtle text-xs">
                {row.original.user?.name ||
                  row.original.user?.email ||
                  "System"}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "resource",
        header: "Resource",
        cell: ({ row }) => (
          <StatusBadge icon={null} variant="neutral">
            {row.original.resourceType.replaceAll("_", " ")}
          </StatusBadge>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <span className="capitalize">{row.original.action}</span>
        ),
      },
      {
        id: "date",
        header: "Date",
        cell: ({ row }) =>
          new Intl.DateTimeFormat("en", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(row.original.createdAt)),
      },
    ],
    [],
  );
  const table = useTable({ data: activity, columns });

  return (
    <Table
      {...table}
      resourceName={(plural) => (plural ? "events" : "event")}
      emptyState={
        <EmptyState
          icon={BookOpen}
          title="No activity yet"
          description="Workspace changes will appear here."
        />
      }
    />
  );
}
