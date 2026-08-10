"use client";

import { UserAvatar } from "@/ui/users/user-avatar";
import {
  EmptyState,
  StatusBadge,
  Table,
  TableRowMenu,
  useTable,
} from "@dub/ui";
import { User } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export type VpnCustomer = {
  email: string;
  name: string;
  orders: number;
  revenue: number;
  hasAccess: boolean;
  openTickets: number;
  updatedAt: string;
};

const money = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export function CustomersTable({
  slug,
  customers,
}: {
  slug: string;
  customers: VpnCustomer[];
}) {
  const router = useRouter();
  const columns = useMemo<ColumnDef<VpnCustomer>[]>(
    () => [
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <UserAvatar
              user={{
                id: row.original.email,
                name: row.original.name,
                email: row.original.email,
                image: null,
                role: row.original.hasAccess ? "member" : "viewer",
              }}
              className="size-8 border-none"
            />
            <div>
              <p className="text-content-emphasis font-medium">
                {row.original.name || row.original.email}
              </p>
              <p className="text-content-subtle text-xs">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "orders",
        header: "Orders",
      },
      {
        id: "revenue",
        header: "Revenue",
        cell: ({ row }) => money(row.original.revenue),
      },
      {
        id: "access",
        header: "Access",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={row.original.hasAccess ? "success" : "neutral"}
          >
            {row.original.hasAccess ? "Active" : "No access"}
          </StatusBadge>
        ),
      },
      {
        id: "support",
        header: "Support",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={row.original.openTickets ? "warning" : "neutral"}
          >
            {row.original.openTickets
              ? `${row.original.openTickets} open`
              : "No open tickets"}
          </StatusBadge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { disableTruncate: true },
        cell: ({ row }) => (
          <TableRowMenu
            actions={[
              {
                label: "View customer",
                onClick: () =>
                  router.push(
                    `/${slug}/vpn/customers/${encodeURIComponent(row.original.email)}`,
                  ),
              },
            ]}
          />
        ),
      },
    ],
    [router, slug],
  );
  const table = useTable({ data: customers, columns });

  return (
    <Table
      {...table}
      resourceName={(plural) => (plural ? "customers" : "customer")}
      emptyState={
        <EmptyState
          icon={User}
          title="No customers yet"
          description="Customers appear after their first order or support request."
        />
      }
    />
  );
}
