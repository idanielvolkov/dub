"use client";

import { RemnawaveUser } from "@/lib/remnawave/client";
import { TableRowMenu } from "@/ui/shared/table-row-menu";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import {
  Button,
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
import { ShieldUser } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  changeSubscriberState,
  createSubscriber,
  removeSubscriber,
  resetSubscriberTraffic,
  revokeSubscriber,
  saveSubscriber,
} from "../../app/app.dub.co/(dashboard)/[slug]/vpn/subscribers/actions";

function formatBytes(bytes: number | null) {
  if (!bytes) return "0 GB";
  const gb = bytes / 1024 ** 3;
  return gb >= 1000 ? `${(gb / 1000).toFixed(1)} TB` : `${Math.round(gb)} GB`;
}

export function SubscribersTable({
  slug,
  users,
}: {
  slug: string;
  users: RemnawaveUser[];
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RemnawaveUser | null>(null);
  const columns = useMemo<ColumnDef<RemnawaveUser>[]>(
    () => [
      {
        id: "subscriber",
        header: "Subscriber",
        cell: ({ row }) => (
          <div>
            <p className="text-content-emphasis font-medium">
              {row.original.username}
            </p>
            <p className="text-content-subtle max-w-48 truncate text-xs">
              {row.original.email || row.original.uuid}
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
            variant={row.original.status === "ACTIVE" ? "success" : "neutral"}
          >
            {row.original.status.toLowerCase()}
          </StatusBadge>
        ),
      },
      {
        id: "traffic",
        header: "Traffic",
        cell: ({ row }) => (
          <span>
            {formatBytes(row.original.usedTrafficBytes)} /{" "}
            {formatBytes(row.original.trafficLimitBytes)}
          </span>
        ),
      },
      {
        id: "expires",
        header: "Expires",
        cell: ({ row }) =>
          new Date(row.original.expireAt).toLocaleDateString("en-US"),
      },
      {
        id: "devices",
        header: "Devices",
        cell: ({ row }) => row.original.hwidDeviceLimit || "Unlimited",
      },
      {
        id: "actions",
        header: "Actions",
        meta: { disableTruncate: true },
        cell: ({ row }) => (
          <TableRowMenu
            actions={[
              {
                label: "Edit subscriber",
                onClick: () => setSelectedUser(row.original),
              },
              {
                label: "Open subscription link",
                onClick: () =>
                  window.open(row.original.subscriptionUrl, "_blank"),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );
  const table = useTable({ data: users, columns });

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-content-emphasis text-sm font-semibold">
            VPN subscribers
          </h2>
          <p className="text-content-subtle text-sm">
            {users.length} subscribers in Remnawave
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge variant="success">Live data</StatusBadge>
          <Button
            className="w-fit"
            text="Add subscriber"
            onClick={() => setShowCreateModal(true)}
          />
        </div>
      </div>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "subscribers" : "subscriber")}
        emptyState={
          <EmptyState
            icon={ShieldUser}
            title="No subscribers yet"
            description="Add a subscriber to create VPN access in Remnawave."
          />
        }
      />

      <Modal showModal={showCreateModal} setShowModal={setShowCreateModal}>
        <ModalHeader
          title="Add subscriber"
          description="Create VPN access directly in Remnawave."
        />
        <ModalBody asChild className="bg-bg-muted">
          <form action={createSubscriber} className="space-y-4">
            <input type="hidden" name="slug" value={slug} />
            <div className="grid gap-1.5">
              <Label htmlFor="subscriber-username">Subscriber name</Label>
              <Input
                id="subscriber-username"
                name="username"
                minLength={3}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="subscriber-duration">Duration</Label>
              <FormCombobox
                id="subscriber-duration"
                name="durationDays"
                defaultValue="30"
                options={[
                  { value: "7", label: "7 days" },
                  { value: "30", label: "30 days" },
                  { value: "90", label: "90 days" },
                  { value: "365", label: "1 year" },
                ]}
              />
            </div>
            <ModalFooter className="-mx-6 -mb-5">
              <Button
                className="w-fit"
                variant="secondary"
                text="Cancel"
                onClick={() => setShowCreateModal(false)}
              />
              <OperationSubmit>Add subscriber</OperationSubmit>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      <Modal
        showModal={Boolean(selectedUser)}
        setShowModal={(open) => !open && setSelectedUser(null)}
        className="max-w-xl"
      >
        {selectedUser && (
          <>
            <ModalHeader>
              <div className="flex items-center gap-2">
                <h3 className="text-content-emphasis text-lg font-medium">
                  {selectedUser.username}
                </h3>
                <StatusBadge
                  icon={null}
                  variant={
                    selectedUser.status === "ACTIVE" ? "success" : "neutral"
                  }
                >
                  {selectedUser.status.toLowerCase()}
                </StatusBadge>
              </div>
              <p className="text-content-subtle mt-1 truncate text-xs">
                {selectedUser.uuid}
              </p>
            </ModalHeader>
            <div className="bg-bg-muted p-6">
              <form
                action={saveSubscriber}
                className="grid gap-4 sm:grid-cols-2"
              >
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="uuid" value={selectedUser.uuid} />
                <div className="grid gap-1.5">
                  <Label htmlFor="subscriber-expire-at">Expires</Label>
                  <Input
                    id="subscriber-expire-at"
                    type="date"
                    name="expireAt"
                    defaultValue={selectedUser.expireAt.slice(0, 10)}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="subscriber-traffic">Traffic, GB</Label>
                  <Input
                    id="subscriber-traffic"
                    type="number"
                    name="trafficGb"
                    min={0}
                    defaultValue={Math.round(
                      selectedUser.trafficLimitBytes / 1024 ** 3,
                    )}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="subscriber-reset-cycle">Reset cycle</Label>
                  <FormCombobox
                    id="subscriber-reset-cycle"
                    name="trafficLimitStrategy"
                    defaultValue={selectedUser.trafficLimitStrategy}
                    options={[
                      { value: "NO_RESET", label: "Never" },
                      { value: "DAY", label: "Daily" },
                      { value: "WEEK", label: "Weekly" },
                      { value: "MONTH", label: "Monthly" },
                    ]}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="subscriber-device-limit">Device limit</Label>
                  <Input
                    id="subscriber-device-limit"
                    type="number"
                    name="deviceLimit"
                    min={0}
                    defaultValue={selectedUser.hwidDeviceLimit || 0}
                  />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor="subscriber-email">Email</Label>
                  <Input
                    id="subscriber-email"
                    type="email"
                    name="email"
                    defaultValue={selectedUser.email || ""}
                  />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor="subscriber-description">Internal note</Label>
                  <Input
                    id="subscriber-description"
                    name="description"
                    defaultValue={selectedUser.description || ""}
                  />
                </div>
                <div className="flex justify-end sm:col-span-2">
                  <OperationSubmit>Save changes</OperationSubmit>
                </div>
              </form>
              <div className="border-border-subtle mt-5 flex flex-wrap gap-2 border-t pt-5">
                <form action={changeSubscriberState}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={selectedUser.uuid} />
                  <input
                    type="hidden"
                    name="enabled"
                    value={String(selectedUser.status !== "ACTIVE")}
                  />
                  <OperationSubmit>
                    {selectedUser.status === "ACTIVE" ? "Disable" : "Enable"}
                  </OperationSubmit>
                </form>
                <form action={resetSubscriberTraffic}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={selectedUser.uuid} />
                  <OperationSubmit
                    confirmMessage={`Reset traffic for ${selectedUser.username}?`}
                  >
                    Reset traffic
                  </OperationSubmit>
                </form>
                <form action={revokeSubscriber}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={selectedUser.uuid} />
                  <OperationSubmit
                    confirmMessage={`Generate a new subscription link for ${selectedUser.username}?`}
                  >
                    Revoke link
                  </OperationSubmit>
                </form>
                <form action={removeSubscriber} className="ml-auto">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="uuid" value={selectedUser.uuid} />
                  <OperationSubmit
                    destructive
                    confirmMessage={`Delete ${selectedUser.username}? VPN access will stop immediately.`}
                  >
                    Delete
                  </OperationSubmit>
                </form>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
