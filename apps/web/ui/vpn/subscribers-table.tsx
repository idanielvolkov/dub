"use client";

import { RemnawaveUser } from "@/lib/remnawave/client";
import { TableRowMenu } from "@/ui/shared/table-row-menu";
import { FormCombobox } from "@/ui/vpn/form-combobox";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import {
  Button,
  CopyButton,
  CopyText,
  EmptyState,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StatusBadge,
  Table,
  useCopyToClipboard,
  useTable,
} from "@dub/ui";
import { Copy, Link4, Pen2, ShieldUser } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  changeSubscriberState,
  createSubscriber,
  extendAllSubscribers,
  removeSubscriber,
  resetAllSubscriberTraffic,
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
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RemnawaveUser | null>(null);
  const [, copyToClipboard] = useCopyToClipboard();
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
                icon: Pen2,
                onClick: () => setSelectedUser(row.original),
              },
              {
                label: "Copy subscription link",
                icon: Copy,
                onClick: () =>
                  toast.promise(copyToClipboard(row.original.subscriptionUrl), {
                    success: "Subscription link copied",
                  }),
              },
              {
                label: "Open subscription link",
                icon: Link4,
                onClick: () =>
                  window.open(
                    row.original.subscriptionUrl,
                    "_blank",
                    "noopener,noreferrer",
                  ),
              },
            ]}
          />
        ),
      },
    ],
    [copyToClipboard],
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
            variant="secondary"
            text="Bulk actions"
            onClick={() => setShowBulkModal(true)}
          />
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

      <Modal showModal={showBulkModal} setShowModal={setShowBulkModal}>
        <ModalHeader
          title="Bulk subscriber actions"
          description="Apply operational changes to every Remnawave subscriber."
        />
        <ModalBody className="bg-bg-muted space-y-4">
          <form
            action={extendAllSubscribers}
            className="border-border-subtle rounded-xl border bg-white p-4"
          >
            <input type="hidden" name="slug" value={slug} />
            <div className="flex items-end gap-3">
              <div className="grid flex-1 gap-1.5">
                <Label htmlFor="extend-all-days">Extend subscriptions</Label>
                <Input
                  id="extend-all-days"
                  name="extendDays"
                  type="number"
                  min={1}
                  max={9999}
                  defaultValue={30}
                  required
                />
              </div>
              <OperationSubmit
                confirmMessage={`Extend all ${users.length} subscribers by the selected number of days?`}
              >
                Extend all
              </OperationSubmit>
            </div>
          </form>
          <form
            action={resetAllSubscriberTraffic}
            className="border-border-subtle flex items-center justify-between gap-4 rounded-xl border bg-white p-4"
          >
            <input type="hidden" name="slug" value={slug} />
            <div>
              <p className="text-content-emphasis text-sm font-medium">
                Reset all traffic
              </p>
              <p className="text-content-subtle mt-1 text-xs">
                Clear usage counters for every subscriber.
              </p>
            </div>
            <OperationSubmit
              confirmMessage={`Reset traffic for all ${users.length} subscribers?`}
            >
              Reset all
            </OperationSubmit>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            className="w-fit"
            variant="secondary"
            text="Close"
            onClick={() => setShowBulkModal(false)}
          />
        </ModalFooter>
      </Modal>

      <Modal
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        className="max-w-xl"
      >
        <ModalHeader
          title="Add subscriber"
          description="Create VPN access directly in Remnawave."
        />
        <ModalBody asChild className="bg-bg-muted">
          <form action={createSubscriber} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="slug" value={slug} />
            <div className="grid gap-1.5">
              <Label htmlFor="subscriber-username">Subscriber name</Label>
              <Input
                id="subscriber-username"
                name="username"
                minLength={3}
                maxLength={36}
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
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="new-subscriber-email">Email</Label>
              <Input
                id="new-subscriber-email"
                name="email"
                type="email"
                maxLength={128}
                placeholder="customer@example.com"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-subscriber-traffic">Traffic, GB</Label>
              <Input
                id="new-subscriber-traffic"
                name="trafficGb"
                type="number"
                min={0}
                max={1000000}
                defaultValue={0}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-subscriber-reset-cycle">Reset cycle</Label>
              <FormCombobox
                id="new-subscriber-reset-cycle"
                name="trafficLimitStrategy"
                defaultValue="NO_RESET"
                options={[
                  { value: "NO_RESET", label: "Never" },
                  { value: "DAY", label: "Daily" },
                  { value: "WEEK", label: "Weekly" },
                  { value: "MONTH", label: "Monthly" },
                ]}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-subscriber-device-limit">Device limit</Label>
              <Input
                id="new-subscriber-device-limit"
                name="deviceLimit"
                type="number"
                min={0}
                max={999}
                defaultValue={0}
              />
              <p className="text-content-subtle text-xs">
                Use 0 for unlimited devices.
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-subscriber-description">Internal note</Label>
              <Input
                id="new-subscriber-description"
                name="description"
                maxLength={500}
              />
            </div>
            <ModalFooter className="-mx-6 -mb-5 sm:col-span-2">
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
            <ModalBody className="bg-bg-muted">
              <div className="border-border-subtle mb-4 flex items-center gap-3 rounded-xl border bg-white p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-content-subtle text-xs">
                    Subscription link
                  </p>
                  <CopyText
                    value={selectedUser.subscriptionUrl}
                    successMessage="Subscription link copied"
                    className="text-content-emphasis mt-1 block max-w-full truncate font-mono text-xs"
                  >
                    {selectedUser.subscriptionUrl}
                  </CopyText>
                </div>
                <CopyButton
                  value={selectedUser.subscriptionUrl}
                  successMessage="Subscription link copied"
                  className="shrink-0"
                />
                <Button
                  className="w-fit shrink-0"
                  variant="secondary"
                  icon={<Link4 className="size-4" />}
                  text="Open"
                  onClick={() =>
                    window.open(
                      selectedUser.subscriptionUrl,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                />
              </div>
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
            </ModalBody>
            <ModalFooter className="flex-wrap justify-start">
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
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  );
}
