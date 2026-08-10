"use client";

import { RemnawaveHost } from "@/lib/remnawave/client";
import { OperationSubmit } from "@/ui/shared/operation-submit";
import {
  CardList,
  CardListCard,
  Checkbox,
  EmptyState,
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
import { GlobePointer } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  removeHost,
  saveHost,
} from "../../app/app.dub.co/(dashboard)/[slug]/operations/actions";

export function HostsTable({
  slug,
  hosts,
}: {
  slug: string;
  hosts: RemnawaveHost[];
}) {
  const [selectedHost, setSelectedHost] = useState<RemnawaveHost | null>(null);
  const columns = useMemo<ColumnDef<RemnawaveHost>[]>(
    () => [
      {
        id: "host",
        header: "Host",
        cell: ({ row }) => (
          <div>
            <p className="text-content-emphasis font-medium">
              {row.original.remark}
            </p>
            <p className="text-content-subtle max-w-48 truncate font-mono text-xs">
              {row.original.uuid}
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
            variant={row.original.isDisabled ? "neutral" : "success"}
          >
            {row.original.isDisabled ? "Disabled" : "Enabled"}
          </StatusBadge>
        ),
      },
      {
        id: "address",
        header: "Address",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.address}:{row.original.port || 443}
          </span>
        ),
      },
      {
        id: "security",
        header: "Security",
        cell: ({ row }) => row.original.securityLayer || "Default",
      },
      {
        id: "nodes",
        header: "Nodes",
        cell: ({ row }) =>
          row.original.nodes.length
            ? row.original.nodes.map((node) => node.name).join(", ")
            : "All nodes",
      },
      {
        id: "visibility",
        header: "Visibility",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={row.original.isHidden ? "neutral" : "new"}
          >
            {row.original.isHidden ? "Hidden" : "Visible"}
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
                label: "Manage host",
                onClick: () => setSelectedHost(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );
  const table = useTable({ data: hosts, columns });

  return (
    <>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "hosts" : "host")}
        emptyState={
          <EmptyState
            icon={GlobePointer}
            title="No hosts found"
            description="Configure a subscription host in Remnawave to see it here."
          />
        }
      />

      <Modal
        showModal={Boolean(selectedHost)}
        setShowModal={(open) => !open && setSelectedHost(null)}
        className="max-w-xl"
      >
        {selectedHost && (
          <>
            <ModalHeader
              title={
                <div className="flex items-center gap-2">
                  <span>{selectedHost.remark}</span>
                  <StatusBadge
                    icon={null}
                    variant={selectedHost.isDisabled ? "neutral" : "success"}
                  >
                    {selectedHost.isDisabled ? "Disabled" : "Enabled"}
                  </StatusBadge>
                </div>
              }
              description={
                <span className="font-mono text-xs">{selectedHost.uuid}</span>
              }
            />
            <ModalBody className="bg-bg-muted">
              <form action={saveHost} className="grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="uuid" value={selectedHost.uuid} />
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor="host-remark">Remark</Label>
                  <Input
                    id="host-remark"
                    name="remark"
                    defaultValue={selectedHost.remark}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="host-address">Address</Label>
                  <Input
                    id="host-address"
                    name="address"
                    defaultValue={selectedHost.address}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="host-port">Port</Label>
                  <Input
                    id="host-port"
                    name="port"
                    type="number"
                    min={1}
                    max={65535}
                    defaultValue={selectedHost.port || 443}
                  />
                </div>
                <CardList className="sm:col-span-2">
                  <CardListCard
                    hoverStateEnabled={false}
                    innerClassName="space-y-3 p-4"
                  >
                    <Label
                      htmlFor="host-disabled"
                      className="text-content-default flex cursor-pointer items-center gap-3 font-normal"
                    >
                      <Checkbox
                        id="host-disabled"
                        name="isDisabled"
                        defaultChecked={selectedHost.isDisabled}
                      />
                      Disable this host
                    </Label>
                    <Label
                      htmlFor="host-hidden"
                      className="text-content-default flex cursor-pointer items-center gap-3 font-normal"
                    >
                      <Checkbox
                        id="host-hidden"
                        name="isHidden"
                        defaultChecked={selectedHost.isHidden}
                      />
                      Hide this host from subscriptions
                    </Label>
                  </CardListCard>
                </CardList>
                <div className="flex justify-end sm:col-span-2">
                  <OperationSubmit>Save changes</OperationSubmit>
                </div>
              </form>
            </ModalBody>
            <ModalFooter className="justify-between">
              <p className="text-content-subtle text-xs">
                Deleting a host cannot be undone.
              </p>
              <form action={removeHost}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="uuid" value={selectedHost.uuid} />
                <OperationSubmit
                  destructive
                  confirmMessage={`Delete ${selectedHost.remark}? This cannot be undone.`}
                >
                  Delete host
                </OperationSubmit>
              </form>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  );
}
