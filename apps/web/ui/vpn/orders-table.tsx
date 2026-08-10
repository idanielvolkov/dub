"use client";

import { VpnPlan } from "@/lib/remnawave/plans";
import { VpnOrder } from "@/lib/vpn/orders";
import { OperationSubmit } from "@/ui/shared/operation-submit";
import {
  Button,
  EmptyState,
  FormCombobox,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StatusBadge,
  Table,
  TableRowMenu,
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

export function CreateOrderButton({
  slug,
  plans,
}: {
  slug: string;
  plans: VpnPlan[];
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        className="w-fit"
        text="Create order"
        onClick={() => setShowModal(true)}
      />
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <ModalHeader
          title="Create order"
          description="Add a sale before payment or fulfillment."
        />
        <ModalBody asChild className="bg-bg-muted">
          <form action={createVpnOrder} className="space-y-4">
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
              <Label htmlFor="order-plan">Plan</Label>
              <FormCombobox
                id="order-plan"
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
            <ModalFooter className="-mx-6 -mb-5">
              <Button
                className="w-fit"
                variant="secondary"
                text="Cancel"
                onClick={() => setShowModal(false)}
              />
              <OperationSubmit>Create order</OperationSubmit>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}

export function OrdersTable({
  slug,
  orders,
  plans,
  canEdit,
  canProvision,
}: {
  slug: string;
  orders: VpnOrder[];
  plans: VpnPlan[];
  canEdit: boolean;
  canProvision: boolean;
}) {
  const [selectedOrder, setSelectedOrder] = useState<VpnOrder | null>(null);
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
          <TableRowMenu
            actions={[
              {
                label: canEdit ? "Manage order" : "View order",
                onClick: () => setSelectedOrder(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [canEdit],
  );
  const table = useTable({ data: orders, columns });

  return (
    <>
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

      <Modal
        showModal={Boolean(selectedOrder)}
        setShowModal={(open) => !open && setSelectedOrder(null)}
        className="max-w-xl"
      >
        {selectedOrder && (
          <>
            <ModalHeader
              title={
                <div className="flex items-center gap-2">
                  <span>
                    {selectedOrder.customerName || selectedOrder.customerEmail}
                  </span>
                  <StatusBadge
                    icon={null}
                    variant={
                      selectedOrder.paymentStatus === "paid"
                        ? "success"
                        : "pending"
                    }
                  >
                    {selectedOrder.paymentStatus}
                  </StatusBadge>
                </div>
              }
              description={`${selectedOrder.planName} · $${selectedOrder.amount}`}
            />
            <ModalBody className="bg-bg-muted space-y-5">
              {canEdit && (
                <form action={updateVpnOrder} className="space-y-4">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="id" value={selectedOrder.id} />
                  <div className="grid gap-1.5">
                    <Label htmlFor="order-payment-status">Payment status</Label>
                    <FormCombobox
                      id="order-payment-status"
                      name="paymentStatus"
                      defaultValue={selectedOrder.paymentStatus}
                      options={[
                        { value: "pending", label: "Pending" },
                        { value: "paid", label: "Paid" },
                        { value: "refunded", label: "Refunded" },
                        { value: "canceled", label: "Canceled" },
                      ]}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="order-manage-note">Internal note</Label>
                    <Input
                      id="order-manage-note"
                      name="note"
                      defaultValue={selectedOrder.note}
                    />
                  </div>
                  <div className="flex justify-end">
                    <OperationSubmit>Save changes</OperationSubmit>
                  </div>
                </form>
              )}
              {canProvision &&
                selectedOrder.fulfillmentStatus === "pending" && (
                  <form
                    action={fulfillVpnOrder}
                    className="border-border-subtle space-y-4 border-t pt-5"
                  >
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="id" value={selectedOrder.id} />
                    <div className="grid gap-1.5">
                      <Label htmlFor="order-subscriber-name">Username</Label>
                      <Input
                        id="order-subscriber-name"
                        name="subscriberUsername"
                        placeholder="customer-name"
                        minLength={3}
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <OperationSubmit confirmMessage="Create this user in Remnawave using the purchased plan limits?">
                        Provision access
                      </OperationSubmit>
                    </div>
                  </form>
                )}
              {selectedOrder.fulfillmentStatus === "fulfilled" && (
                <div className="border-border-subtle border-t pt-5">
                  <p className="text-content-subtle text-xs">User</p>
                  <p className="text-content-emphasis mt-1 font-medium">
                    {selectedOrder.subscriberUsername}
                  </p>
                </div>
              )}
            </ModalBody>
          </>
        )}
      </Modal>
    </>
  );
}
