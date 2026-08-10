"use client";

import { VpnOrder } from "@/lib/vpn/orders";
import { SupportTicket } from "@/lib/vpn/support";
import { EmptyState, StatusBadge, Table, useTable } from "@dub/ui";
import { LifeRing, Receipt2 } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

const money = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export function CustomerOrdersTable({ orders }: { orders: VpnOrder[] }) {
  const columns = useMemo<ColumnDef<VpnOrder>[]>(
    () => [
      {
        id: "plan",
        header: "Plan",
        cell: ({ row }) => (
          <div>
            <p className="text-content-emphasis font-medium">
              {row.original.planName}
            </p>
            <p className="text-content-subtle text-xs">
              {row.original.subscriberUsername || "Awaiting subscriber"}
            </p>
          </div>
        ),
      },
      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => money(row.original.amount),
      },
      {
        id: "payment",
        header: "Payment",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={
              row.original.paymentStatus === "paid" ? "success" : "neutral"
            }
          >
            {row.original.paymentStatus}
          </StatusBadge>
        ),
      },
      {
        id: "access",
        header: "Access",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={
              row.original.fulfillmentStatus === "fulfilled"
                ? "success"
                : "pending"
            }
          >
            {row.original.fulfillmentStatus}
          </StatusBadge>
        ),
      },
      {
        id: "date",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    [],
  );
  const table = useTable({ data: orders, columns });
  return (
    <Table
      {...table}
      resourceName={(plural) => (plural ? "orders" : "order")}
      emptyState={
        <EmptyState
          icon={Receipt2}
          title="No orders"
          description="This customer does not have an order yet."
        />
      }
    />
  );
}

export function CustomerSupportTable({
  tickets,
}: {
  tickets: SupportTicket[];
}) {
  const columns = useMemo<ColumnDef<SupportTicket>[]>(
    () => [
      {
        id: "ticket",
        header: "Ticket",
        cell: ({ row }) => (
          <div>
            <p className="text-content-emphasis font-medium">
              {row.original.subject}
            </p>
            <p className="text-content-subtle max-w-72 truncate text-xs">
              {row.original.note || "No internal note"}
            </p>
          </div>
        ),
      },
      {
        id: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={
              row.original.priority === "urgent" ||
              row.original.priority === "high"
                ? "error"
                : "neutral"
            }
          >
            {row.original.priority}
          </StatusBadge>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={row.original.status === "resolved" ? "success" : "pending"}
          >
            {row.original.status.replace("_", " ")}
          </StatusBadge>
        ),
      },
      {
        id: "updated",
        header: "Updated",
        cell: ({ row }) => formatDate(row.original.updatedAt),
      },
    ],
    [],
  );
  const table = useTable({ data: tickets, columns });
  return (
    <Table
      {...table}
      resourceName={(plural) => (plural ? "tickets" : "ticket")}
      emptyState={
        <EmptyState
          icon={LifeRing}
          title="No support history"
          description="This customer has not contacted support."
        />
      }
    />
  );
}
