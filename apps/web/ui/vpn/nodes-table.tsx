"use client";

import { RemnawaveNode } from "@/lib/remnawave/client";
import { TableRowMenu } from "@/ui/shared/table-row-menu";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import {
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
  useTable,
} from "@dub/ui";
import { Nodes4 } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  changeNodeState,
  removeNode,
  resetNodeTraffic,
  restartAllNodes,
  restartNode,
  saveNode,
} from "../../app/app.dub.co/(dashboard)/[slug]/operations/actions";

function formatBytes(bytes: number) {
  if (!bytes) return "0 GB";
  const gb = bytes / 1024 ** 3;
  return gb >= 1000 ? `${(gb / 1000).toFixed(1)} TB` : `${Math.round(gb)} GB`;
}

export function NodesTable({
  slug,
  nodes,
  canManage,
}: {
  slug: string;
  nodes: RemnawaveNode[];
  canManage: boolean;
}) {
  const [selectedNode, setSelectedNode] = useState<RemnawaveNode | null>(null);
  const columns = useMemo<ColumnDef<RemnawaveNode>[]>(
    () => [
      {
        id: "node",
        header: "Node",
        cell: ({ row }) => (
          <div>
            <p className="text-content-emphasis font-medium">
              {row.original.name}
            </p>
            <p className="text-content-subtle font-mono text-xs">
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
            variant={row.original.isConnected ? "success" : "pending"}
          >
            {row.original.isConnected ? "Online" : "Offline"}
          </StatusBadge>
        ),
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => row.original.countryCode || "—",
      },
      {
        id: "endpoint",
        header: "Endpoint",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.address}:{row.original.port}
          </span>
        ),
      },
      {
        id: "online",
        header: "Users online",
        cell: ({ row }) => row.original.usersOnline,
      },
      {
        id: "traffic",
        header: "Traffic",
        cell: ({ row }) => formatBytes(row.original.trafficUsedBytes),
      },
      {
        id: "availability",
        header: "Availability",
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
        id: "actions",
        header: "Actions",
        meta: { disableTruncate: true },
        cell: ({ row }) => (
          <TableRowMenu
            actions={[
              {
                label: canManage ? "Manage node" : "View node",
                onClick: () => setSelectedNode(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [canManage],
  );
  const table = useTable({ data: nodes, columns });

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-content-emphasis text-sm font-semibold">
            Network nodes
          </h2>
          <p className="text-content-subtle text-sm">
            {nodes.length} nodes connected to Remnawave
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge variant="success">Live data</StatusBadge>
          {canManage && (
            <form action={restartAllNodes}>
              <input type="hidden" name="slug" value={slug} />
              <OperationSubmit confirmMessage="Restart every connected Remnawave node? Active VPN sessions may reconnect briefly.">
                Restart all
              </OperationSubmit>
            </form>
          )}
        </div>
      </div>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "nodes" : "node")}
        emptyState={
          <EmptyState
            icon={Nodes4}
            title="No nodes found"
            description="Add a node in Remnawave to manage it here."
          />
        }
      />

      <Modal
        showModal={Boolean(selectedNode)}
        setShowModal={(open) => !open && setSelectedNode(null)}
        className="max-w-xl"
      >
        {selectedNode && (
          <>
            <ModalHeader>
              <div className="flex items-center gap-2">
                <h3 className="text-content-emphasis text-lg font-medium">
                  {selectedNode.name}
                </h3>
                <StatusBadge
                  icon={null}
                  variant={selectedNode.isConnected ? "success" : "pending"}
                >
                  {selectedNode.isConnected ? "Online" : "Offline"}
                </StatusBadge>
              </div>
              <p className="text-content-subtle mt-1 font-mono text-xs">
                {selectedNode.address}:{selectedNode.port}
              </p>
            </ModalHeader>
            <ModalBody className="bg-bg-muted">
              <form
                action={canManage ? saveNode : undefined}
                className={`grid gap-4 sm:grid-cols-2 ${canManage ? "" : "pointer-events-none"}`}
              >
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="uuid" value={selectedNode.uuid} />
                <div className="grid gap-1.5">
                  <Label htmlFor="node-name">Node name</Label>
                  <Input
                    id="node-name"
                    name="name"
                    defaultValue={selectedNode.name}
                    maxLength={30}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="node-traffic-limit">Traffic limit, GB</Label>
                  <Input
                    id="node-traffic-limit"
                    name="trafficLimitGb"
                    type="number"
                    min={0}
                    defaultValue={Math.round(
                      selectedNode.trafficLimitBytes / 1024 ** 3,
                    )}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="node-notify-percent">Notify at, %</Label>
                  <Input
                    id="node-notify-percent"
                    name="notifyPercent"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={selectedNode.notifyPercent}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="node-reset-day">Reset day</Label>
                  <Input
                    id="node-reset-day"
                    name="trafficResetDay"
                    type="number"
                    min={1}
                    max={31}
                    defaultValue={selectedNode.trafficResetDay || 1}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="node-multiplier">Traffic multiplier</Label>
                  <Input
                    id="node-multiplier"
                    name="consumptionMultiplier"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    defaultValue={selectedNode.consumptionMultiplier}
                  />
                </div>
                <Label
                  htmlFor="node-track-traffic"
                  className="flex cursor-pointer items-center gap-2 font-normal sm:col-span-2"
                >
                  <Checkbox
                    id="node-track-traffic"
                    name="isTrafficTrackingActive"
                    className="size-4"
                    defaultChecked={selectedNode.isTrafficTrackingActive}
                  />
                  Track traffic for this node
                </Label>
                <div className="grid gap-1.5">
                  <Label htmlFor="node-country">Country</Label>
                  <Input
                    id="node-country"
                    name="countryCode"
                    defaultValue={selectedNode.countryCode}
                    maxLength={2}
                  />
                </div>
                {canManage && (
                  <div className="flex justify-end sm:col-span-2">
                    <OperationSubmit>Save changes</OperationSubmit>
                  </div>
                )}
              </form>
              <dl className="border-border-subtle mt-5 grid gap-3 border-t pt-5 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-content-subtle">Users online</dt>
                  <dd className="text-content-emphasis mt-1 font-medium">
                    {selectedNode.usersOnline}
                  </dd>
                </div>
                <div>
                  <dt className="text-content-subtle">Traffic</dt>
                  <dd className="text-content-emphasis mt-1 font-medium">
                    {formatBytes(selectedNode.trafficUsedBytes)}
                  </dd>
                </div>
                <div>
                  <dt className="text-content-subtle">Multiplier</dt>
                  <dd className="text-content-emphasis mt-1 font-medium">
                    {selectedNode.consumptionMultiplier}×
                  </dd>
                </div>
              </dl>
            </ModalBody>
            {canManage && (
              <ModalFooter className="justify-start">
                <form action={changeNodeState}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={selectedNode.uuid} />
                  <input
                    type="hidden"
                    name="enabled"
                    value={String(selectedNode.isDisabled)}
                  />
                  <OperationSubmit>
                    {selectedNode.isDisabled ? "Enable node" : "Disable node"}
                  </OperationSubmit>
                </form>
                <form action={restartNode}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={selectedNode.uuid} />
                  <OperationSubmit
                    confirmMessage={`Restart ${selectedNode.name}?`}
                  >
                    Restart node
                  </OperationSubmit>
                </form>
                <form action={resetNodeTraffic}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={selectedNode.uuid} />
                  <OperationSubmit
                    confirmMessage={`Reset traffic for ${selectedNode.name}?`}
                  >
                    Reset traffic
                  </OperationSubmit>
                </form>
                <form action={removeNode} className="ml-auto">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={selectedNode.uuid} />
                  <OperationSubmit
                    destructive
                    confirmMessage={`Delete ${selectedNode.name}? The node must be detached from active configuration first.`}
                  >
                    Delete node
                  </OperationSubmit>
                </form>
              </ModalFooter>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
