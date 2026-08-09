"use client";

import { RemnawaveUser } from "@/lib/remnawave/client";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import {
  Button,
  EmptyState,
  Input,
  Modal,
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

const selectClass =
  "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-neutral-500";

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
          <div className="flex gap-2">
            <Button
              className="h-9 w-fit"
              variant="secondary"
              text="Edit"
              onClick={() => setSelectedUser(row.original)}
            />
            <Button
              className="h-9 w-fit"
              variant="secondary"
              text="Open link"
              onClick={() =>
                window.open(row.original.subscriptionUrl, "_blank")
              }
            />
          </div>
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
        <div className="border-border-subtle border-b p-6">
          <h3 className="text-content-emphasis text-lg font-medium">
            Add subscriber
          </h3>
          <p className="text-content-subtle mt-1 text-sm">
            Create VPN access directly in Remnawave.
          </p>
        </div>
        <form action={createSubscriber} className="bg-bg-muted space-y-4 p-6">
          <input type="hidden" name="slug" value={slug} />
          <label className="text-content-default grid gap-1.5 text-sm font-medium">
            Subscriber name
            <Input name="username" minLength={3} required />
          </label>
          <label className="text-content-default grid gap-1.5 text-sm font-medium">
            Duration
            <select
              name="durationDays"
              defaultValue="30"
              className={selectClass}
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              className="w-fit"
              variant="secondary"
              text="Cancel"
              onClick={() => setShowCreateModal(false)}
            />
            <OperationSubmit>Add subscriber</OperationSubmit>
          </div>
        </form>
      </Modal>

      <Modal
        showModal={Boolean(selectedUser)}
        setShowModal={(open) => !open && setSelectedUser(null)}
        className="max-w-xl"
      >
        {selectedUser && (
          <>
            <div className="border-border-subtle border-b p-6">
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
            </div>
            <div className="bg-bg-muted p-6">
              <form
                action={saveSubscriber}
                className="grid gap-4 sm:grid-cols-2"
              >
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="uuid" value={selectedUser.uuid} />
                <label className="text-content-default grid gap-1.5 text-sm font-medium">
                  Expires
                  <Input
                    type="date"
                    name="expireAt"
                    defaultValue={selectedUser.expireAt.slice(0, 10)}
                    required
                  />
                </label>
                <label className="text-content-default grid gap-1.5 text-sm font-medium">
                  Traffic, GB
                  <Input
                    type="number"
                    name="trafficGb"
                    min={0}
                    defaultValue={Math.round(
                      selectedUser.trafficLimitBytes / 1024 ** 3,
                    )}
                  />
                </label>
                <label className="text-content-default grid gap-1.5 text-sm font-medium">
                  Reset cycle
                  <select
                    className={selectClass}
                    name="trafficLimitStrategy"
                    defaultValue={selectedUser.trafficLimitStrategy}
                  >
                    <option value="NO_RESET">Never</option>
                    <option value="DAY">Daily</option>
                    <option value="WEEK">Weekly</option>
                    <option value="MONTH">Monthly</option>
                  </select>
                </label>
                <label className="text-content-default grid gap-1.5 text-sm font-medium">
                  Device limit
                  <Input
                    type="number"
                    name="deviceLimit"
                    min={0}
                    defaultValue={selectedUser.hwidDeviceLimit || 0}
                  />
                </label>
                <label className="text-content-default grid gap-1.5 text-sm font-medium sm:col-span-2">
                  Email
                  <Input
                    type="email"
                    name="email"
                    defaultValue={selectedUser.email || ""}
                  />
                </label>
                <label className="text-content-default grid gap-1.5 text-sm font-medium sm:col-span-2">
                  Internal note
                  <Input
                    name="description"
                    defaultValue={selectedUser.description || ""}
                  />
                </label>
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
