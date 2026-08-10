"use client";

import { GrowthCampaignMeta } from "@/lib/growth/get-growth-workspace";
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
import { Megaphone } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  archiveGrowthCampaign,
  updateGrowthCampaign,
} from "../../app/app.dub.co/(dashboard)/[slug]/growth/campaigns/actions";

export type GrowthCampaignRow = {
  id: string;
  title: string | null;
  url: string;
  shortLink: string;
  clicks: number;
  leads: number;
  sales: number;
  campaign: string | null;
  createdAt: string;
  meta: GrowthCampaignMeta;
};

export function CampaignsTable({
  slug,
  campaigns,
}: {
  slug: string;
  campaigns: GrowthCampaignRow[];
}) {
  const [selected, setSelected] = useState<GrowthCampaignRow | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<GrowthCampaignRow | null>(
    null,
  );
  const columns = useMemo<ColumnDef<GrowthCampaignRow>[]>(
    () => [
      {
        id: "campaign",
        header: "Campaign",
        cell: ({ row }) => (
          <div>
            <a
              href={`https://${row.original.shortLink}`}
              target="_blank"
              rel="noreferrer"
              className="text-content-emphasis font-medium hover:underline"
            >
              {row.original.title ||
                row.original.campaign ||
                row.original.shortLink}
            </a>
            <p className="text-content-subtle max-w-64 truncate text-xs">
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
            variant={
              row.original.meta.status === "active" ? "success" : "neutral"
            }
          >
            {row.original.meta.status}
          </StatusBadge>
        ),
      },
      { accessorKey: "clicks", header: "Clicks" },
      { accessorKey: "leads", header: "Leads" },
      { accessorKey: "sales", header: "Sales" },
      {
        id: "owner",
        header: "Owner",
        cell: ({ row }) => row.original.meta.owner || "—",
      },
      {
        id: "actions",
        header: "Actions",
        meta: { disableTruncate: true },
        cell: ({ row }) => (
          <TableRowMenu
            actions={[
              {
                label: "Edit campaign",
                onClick: () => setSelected(row.original),
              },
              {
                label: "Archive campaign",
                variant: "danger",
                onClick: () => setArchiveTarget(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );
  const table = useTable({ data: campaigns, columns });

  return (
    <>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "campaigns" : "campaign")}
        emptyState={
          <EmptyState
            icon={Megaphone}
            title="No campaigns yet"
            description="Create a campaign to start tracking acquisition."
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
              title="Edit campaign"
              description={selected.shortLink}
            />
            <ModalBody asChild className="bg-bg-muted">
              <form action={updateGrowthCampaign} className="space-y-4">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={selected.id} />
                <div className="grid gap-1.5">
                  <Label htmlFor="campaign-name">Name</Label>
                  <Input
                    id="campaign-name"
                    name="title"
                    defaultValue={selected.title || ""}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="campaign-utm">UTM campaign</Label>
                    <Input
                      id="campaign-utm"
                      name="campaign"
                      defaultValue={selected.campaign || ""}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="campaign-owner">Owner</Label>
                    <Input
                      id="campaign-owner"
                      name="owner"
                      defaultValue={selected.meta.owner}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="campaign-budget">Budget</Label>
                    <Input
                      id="campaign-budget"
                      type="number"
                      name="budget"
                      min={0}
                      defaultValue={selected.meta.budget}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="campaign-status">Status</Label>
                    <FormCombobox
                      id="campaign-status"
                      name="status"
                      defaultValue={selected.meta.status}
                      options={[
                        { value: "draft", label: "Draft" },
                        { value: "active", label: "Active" },
                        { value: "paused", label: "Paused" },
                        { value: "completed", label: "Completed" },
                      ]}
                    />
                  </div>
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
      <Modal
        showModal={Boolean(archiveTarget)}
        setShowModal={(open) => !open && setArchiveTarget(null)}
      >
        {archiveTarget && (
          <>
            <ModalHeader
              title="Archive campaign"
              description={`Archive ${archiveTarget.title || archiveTarget.shortLink}?`}
            />
            <ModalFooter>
              <Button
                variant="secondary"
                text="Cancel"
                onClick={() => setArchiveTarget(null)}
              />
              <form action={archiveGrowthCampaign}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={archiveTarget.id} />
                <OperationSubmit destructive>Archive</OperationSubmit>
              </form>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  );
}
