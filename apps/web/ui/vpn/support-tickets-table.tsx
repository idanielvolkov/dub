"use client";

import { SupportTicket } from "@/lib/vpn/support";
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
import { LifeRing } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  createSupportTicket,
  updateSupportTicket,
} from "../../app/app.dub.co/(dashboard)/[slug]/vpn/support/actions";

const statusLabel: Record<SupportTicket["status"], string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

const priorityLabel: Record<SupportTicket["priority"], string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export function CreateSupportTicketButton({ slug }: { slug: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button text="Create ticket" onClick={() => setShowModal(true)} />
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <ModalHeader
          title="Create ticket"
          description="Add a customer request to the support queue."
        />
        <ModalBody asChild className="bg-bg-muted">
          <form action={createSupportTicket} className="space-y-4">
            <input type="hidden" name="slug" value={slug} />
            <div className="grid gap-1.5">
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input
                id="ticket-subject"
                name="subject"
                placeholder="What does the customer need help with?"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="ticket-customer-name">Customer name</Label>
                <Input id="ticket-customer-name" name="customerName" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ticket-customer-email">Email</Label>
                <Input
                  id="ticket-customer-email"
                  name="customerEmail"
                  type="email"
                  required
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ticket-priority">Priority</Label>
              <FormCombobox
                id="ticket-priority"
                name="priority"
                defaultValue="normal"
                options={Object.entries(priorityLabel).map(
                  ([value, label]) => ({
                    value,
                    label,
                  }),
                )}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ticket-note">Internal note</Label>
              <Input id="ticket-note" name="note" />
            </div>
            <ModalFooter className="-mx-6 -mb-5">
              <Button
                variant="secondary"
                text="Cancel"
                onClick={() => setShowModal(false)}
              />
              <OperationSubmit>Create ticket</OperationSubmit>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}

export function SupportTicketsTable({
  slug,
  tickets,
  canManage,
}: {
  slug: string;
  tickets: SupportTicket[];
  canManage: boolean;
}) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
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
            <p className="text-content-subtle text-xs">
              {row.original.customerName || row.original.customerEmail}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "customerEmail",
        header: "Customer",
      },
      {
        id: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={
              row.original.priority === "urgent"
                ? "error"
                : row.original.priority === "high"
                  ? "warning"
                  : "neutral"
            }
          >
            {priorityLabel[row.original.priority]}
          </StatusBadge>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={
              row.original.status === "resolved"
                ? "success"
                : row.original.status === "in_progress"
                  ? "pending"
                  : "neutral"
            }
          >
            {statusLabel[row.original.status]}
          </StatusBadge>
        ),
      },
      {
        id: "updated",
        header: "Updated",
        cell: ({ row }) =>
          new Intl.DateTimeFormat("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(row.original.updatedAt)),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { disableTruncate: true },
        cell: ({ row }) => (
          <TableRowMenu
            actions={[
              {
                label: canManage ? "Manage ticket" : "View ticket",
                onClick: () => setSelectedTicket(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [canManage],
  );
  const table = useTable({ data: tickets, columns });

  return (
    <>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "tickets" : "ticket")}
        emptyState={
          <EmptyState
            icon={LifeRing}
            title="No support tickets"
            description="Create a ticket when a customer needs help."
          />
        }
      />
      <Modal
        showModal={Boolean(selectedTicket)}
        setShowModal={(open) => !open && setSelectedTicket(null)}
      >
        {selectedTicket && (
          <>
            <ModalHeader
              title={selectedTicket.subject}
              description={selectedTicket.customerEmail}
            />
            <ModalBody className="bg-bg-muted space-y-4">
              {selectedTicket.note && (
                <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
                  {selectedTicket.note}
                </div>
              )}
              {canManage && (
                <form action={updateSupportTicket} className="space-y-4">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="id" value={selectedTicket.id} />
                  <div className="grid gap-1.5">
                    <Label htmlFor="ticket-status">Status</Label>
                    <FormCombobox
                      id="ticket-status"
                      name="status"
                      defaultValue={selectedTicket.status}
                      options={Object.entries(statusLabel).map(
                        ([value, label]) => ({ value, label }),
                      )}
                    />
                  </div>
                  <div className="flex justify-end">
                    <OperationSubmit>Save changes</OperationSubmit>
                  </div>
                </form>
              )}
            </ModalBody>
          </>
        )}
      </Modal>
    </>
  );
}
