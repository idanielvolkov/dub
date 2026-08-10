"use client";

import { GrowthLeadMeta } from "@/lib/growth/leads";
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
import { Crosshairs3 } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { updateGrowthLead } from "../../app/app.dub.co/(dashboard)/[slug]/growth/leads/actions";

export type GrowthLeadRow = {
  id: string;
  name: string | null;
  email: string | null;
  country: string | null;
  sales: number;
  revenue: number;
  source: string;
  createdAt: string;
  meta: GrowthLeadMeta;
};

export function LeadsTable({
  slug,
  leads,
}: {
  slug: string;
  leads: GrowthLeadRow[];
}) {
  const [selected, setSelected] = useState<GrowthLeadRow | null>(null);
  const columns = useMemo<ColumnDef<GrowthLeadRow>[]>(
    () => [
      {
        id: "lead",
        header: "Lead",
        cell: ({ row }) => (
          <div>
            <p className="text-content-emphasis font-medium">
              {row.original.name || row.original.email || "Anonymous lead"}
            </p>
            <p className="text-content-subtle text-xs">
              {row.original.email || "No email"}
            </p>
          </div>
        ),
      },
      {
        id: "stage",
        header: "Stage",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={row.original.meta.status === "won" ? "success" : "neutral"}
          >
            {row.original.meta.status}
          </StatusBadge>
        ),
      },
      { accessorKey: "source", header: "Source" },
      {
        id: "owner",
        header: "Owner",
        cell: ({ row }) => row.original.meta.owner || "—",
      },
      { accessorKey: "sales", header: "Sales" },
      {
        id: "revenue",
        header: "Revenue",
        cell: ({ row }) => `$${row.original.revenue.toLocaleString()}`,
      },
      {
        id: "actions",
        header: "Actions",
        meta: { disableTruncate: true },
        cell: ({ row }) => (
          <TableRowMenu
            actions={[
              {
                label: "Manage lead",
                onClick: () => setSelected(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );
  const table = useTable({ data: leads, columns });

  return (
    <>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "leads" : "lead")}
        emptyState={
          <EmptyState
            icon={Crosshairs3}
            title="No leads yet"
            description="Add a lead or start an attributed campaign."
          />
        }
      />
      <Modal
        showModal={Boolean(selected)}
        setShowModal={(open) => !open && setSelected(null)}
      >
        {selected && (
          <>
            <ModalHeader
              title={selected.name || selected.email || "Lead"}
              description={selected.email || selected.source}
            />
            <ModalBody asChild className="bg-bg-muted">
              <form action={updateGrowthLead} className="space-y-4">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={selected.id} />
                <div className="grid gap-1.5">
                  <Label htmlFor="lead-stage">Stage</Label>
                  <FormCombobox
                    id="lead-stage"
                    name="status"
                    defaultValue={selected.meta.status}
                    options={[
                      { value: "new", label: "New" },
                      { value: "contacted", label: "Contacted" },
                      { value: "qualified", label: "Qualified" },
                      { value: "won", label: "Won" },
                      { value: "lost", label: "Lost" },
                    ]}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="lead-owner">Owner</Label>
                  <Input
                    id="lead-owner"
                    name="owner"
                    defaultValue={selected.meta.owner}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="lead-note">Internal note</Label>
                  <Input
                    id="lead-note"
                    name="note"
                    defaultValue={selected.meta.note}
                  />
                </div>
                <ModalFooter className="-mx-6 -mb-5">
                  <Button
                    variant="secondary"
                    text="Cancel"
                    onClick={() => setSelected(null)}
                  />
                  <OperationSubmit>Save changes</OperationSubmit>
                </ModalFooter>
              </form>
            </ModalBody>
          </>
        )}
      </Modal>
    </>
  );
}
