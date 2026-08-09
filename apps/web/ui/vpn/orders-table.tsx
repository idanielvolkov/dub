"use client";

import { VpnPlan } from "@/lib/remnawave/plans";
import { VpnOrder } from "@/lib/vpn/orders";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import {
  Button,
  EmptyState,
  Input,
  Label,
  Modal,
  StatusBadge,
  Table,
  useTable,
} from "@dub/ui";
import { InvoiceDollar } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  createVpnOrder,
  fulfillVpnOrder,
  updateVpnOrder,
} from "../../app/app.dub.co/(dashboard)/[slug]/vpn/orders/actions";

export function OrdersTable({
  slug,
  orders,
  plans,
  canEdit,
  isOwner,
}: {
  slug: string;
  orders: VpnOrder[];
  plans: VpnPlan[];
  canEdit: boolean;
  isOwner: boolean;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const columns = useMemo<ColumnDef<VpnOrder>[]>(
    () => [
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <p className="text-content-emphasis font-medium">
              {row.original.customerName || row.original.customerEmail}
            </p>
            <p className="text-content-subtle text-xs">
              {row.original.customerEmail}
            </p>
          </div>
        ),
      },
      {
        id: "plan",
        header: "Plan",
        cell: ({ row }) => row.original.planName,
      },
      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => `$${row.original.amount}`,
      },
      {
        id: "payment",
        header: "Payment",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={
              row.original.paymentStatus === "paid"
                ? "success"
                : row.original.paymentStatus === "pending"
                  ? "pending"
                  : row.original.paymentStatus === "refunded"
                    ? "warning"
                    : "neutral"
            }
          >
            {row.original.paymentStatus}
          </StatusBadge>
        ),
      },
      {
        id: "fulfillment",
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
        id: "actions",
        header: "Actions",
        meta: { disableTruncate: true },
        cell: ({ row }) => (
          <div className="flex min-w-64 flex-col gap-2 py-1">
            {canEdit && (
              <form action={updateVpnOrder} className="flex gap-2">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={row.original.id} />
                <input type="hidden" name="note" value={row.original.note} />
                <FormCombobox
                  name="paymentStatus"
                  defaultValue={row.original.paymentStatus}
                  className="h-9 min-w-32 text-xs"
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "paid", label: "Paid" },
                    { value: "refunded", label: "Refunded" },
                    { value: "canceled", label: "Canceled" },
                  ]}
                />
                <OperationSubmit>Save</OperationSubmit>
              </form>
            )}
            {isOwner && row.original.fulfillmentStatus === "pending" && (
              <form action={fulfillVpnOrder} className="flex gap-2">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={row.original.id} />
                <Input
                  className="h-9 min-w-36 px-2"
                  name="subscriberUsername"
                  placeholder="Subscriber name"
                  minLength={3}
                  required
                />
                <OperationSubmit confirmMessage="Create this subscriber in Remnawave using the purchased plan limits?">
                  Provision
                </OperationSubmit>
              </form>
            )}
            {row.original.fulfillmentStatus === "fulfilled" && (
              <span className="text-content-subtle text-xs">
                {row.original.subscriberUsername}
              </span>
            )}
          </div>
        ),
      },
    ],
    [canEdit, isOwner, slug],
  );
  const table = useTable({ data: orders, columns });

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-content-emphasis text-sm font-semibold">
            Order ledger
          </h2>
          <p className="text-content-subtle text-sm">
            {orders.length} orders in this workspace
          </p>
        </div>
        {canEdit && (
          <Button
            className="w-fit"
            text="Create order"
            onClick={() => setShowCreateModal(true)}
          />
        )}
      </div>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "orders" : "order")}
        emptyState={
          <EmptyState
            icon={InvoiceDollar}
            title="No orders yet"
            description="Create an order to start tracking VPN sales."
          />
        }
      />

      <Modal showModal={showCreateModal} setShowModal={setShowCreateModal}>
        <div className="border-border-subtle border-b px-6 py-4">
          <h3 className="text-content-emphasis text-lg font-medium">
            Create order
          </h3>
          <p className="text-content-subtle mt-1 text-sm">
            Record a VPN sale before payment or provisioning.
          </p>
        </div>
        <form action={createVpnOrder} className="bg-bg-muted space-y-4 p-6">
          <input type="hidden" name="slug" value={slug} />
          <div className="grid gap-1.5">
            <Label htmlFor="order-customer-name">Customer name</Label>
            <Input
              id="order-customer-name"
              name="customerName"
              placeholder="Alex Smith"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="order-customer-email">Email</Label>
            <Input
              id="order-customer-email"
              type="email"
              name="customerEmail"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Plan</Label>
            <FormCombobox
              name="planId"
              options={plans.map((plan) => ({
                value: plan.id,
                label: `${plan.name} · $${plan.price}`,
              }))}
              placeholder="Select a plan"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="order-note">Note</Label>
            <Input
              id="order-note"
              name="note"
              placeholder="Payment reference"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              className="w-fit"
              variant="secondary"
              text="Cancel"
              onClick={() => setShowCreateModal(false)}
            />
            <OperationSubmit>Create order</OperationSubmit>
          </div>
        </form>
      </Modal>
    </>
  );
}
