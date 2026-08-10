"use client";

import { RemnawaveUser } from "@/lib/remnawave/client";
import { OperationSubmit } from "@/ui/shared/operation-submit";
import {
  Button,
  CardList,
  CardListCard,
  CopyButton,
  CopyText,
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

export function AddSubscriberButton({ slug }: { slug: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        className="w-fit"
        text="Add user"
        onClick={() => setShowModal(true)}
      />
      <Modal showModal={showModal} setShowModal={setShowModal} className="max-w-xl">
        <ModalHeader
          title="Add user"
          description="Create a user in Remnawave."
        />
        <ModalBody asChild className="bg-bg-muted">
          <form action={createSubscriber} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="slug" value={slug} />
            <div className="grid gap-1.5">
              <Label htmlFor="subscriber-username">Username</Label>
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
                onClick={() => setShowModal(false)}
              />
              <OperationSubmit>Add user</OperationSubmit>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}

export function SubscribersTable({
  slug,
  users,
  canManage,
}: {
  slug: string;
  users: RemnawaveUser[];
  canManage: boolean;
}) {
  const [selectedUser, setSelectedUser] = useState<RemnawaveUser | null>(null);
  const [, copyToClipboard] = useCopyToClipboard();
  const columns = useMemo<ColumnDef<RemnawaveUser>[]>(
    () => [
      {
        id: "subscriber",
        header: "User",
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
                label: canManage ? "Edit user" : "View user",
                icon: Pen2,
                onClick: () => setSelectedUser(row.original),
              },
              {
                label: "Copy access link",
                icon: Copy,
                onClick: () =>
                  toast.promise(copyToClipboard(row.original.subscriptionUrl), {
                    success: "Access link copied",
                  }),
              },
              {
                label: "Open access link",
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
    [canManage, copyToClipboard],
  );
  const table = useTable({ data: users, columns });

  return (
    <>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "users" : "user")}
        emptyState={
          <EmptyState
            icon={ShieldUser}
            title="No users yet"
            description="Add a user to create VPN access."
          />
        }
      />

      <Modal
        showModal={Boolean(selectedUser)}
        setShowModal={(open) => !open && setSelectedUser(null)}
        className="max-w-xl"
      >
        {selectedUser && (
          <>
            <ModalHeader
              title={
                <div className="flex items-center gap-2">
                  <span>{selectedUser.username}</span>
                  <StatusBadge
                    icon={null}
                    variant={
                      selectedUser.status === "ACTIVE" ? "success" : "neutral"
                    }
                  >
                    {selectedUser.status.toLowerCase()}
                  </StatusBadge>
                </div>
              }
              description={
                <span className="font-mono text-xs">{selectedUser.uuid}</span>
              }
            />
            <ModalBody className="bg-bg-muted">
              <CardList className="mb-4">
                <CardListCard
                  hoverStateEnabled={false}
                  innerClassName="flex items-center gap-3 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-content-subtle text-xs">Access link</p>
                    <CopyText
                      value={selectedUser.subscriptionUrl}
                      successMessage="Access link copied"
                      className="text-content-emphasis mt-1 block max-w-full truncate font-mono text-xs"
                    >
                      {selectedUser.subscriptionUrl}
                    </CopyText>
                  </div>
                  <CopyButton
                    value={selectedUser.subscriptionUrl}
                    successMessage="Access link copied"
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
                </CardListCard>
              </CardList>
              <form
                action={canManage ? saveSubscriber : undefined}
                className={`grid gap-4 sm:grid-cols-2 ${canManage ? "" : "pointer-events-none"}`}
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
                {canManage && (
                  <div className="flex justify-end sm:col-span-2">
                    <OperationSubmit>Save changes</OperationSubmit>
                  </div>
                )}
              </form>
            </ModalBody>
            {canManage && (
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
                    confirmMessage={`Generate a new access link for ${selectedUser.username}?`}
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
            )}
          </>
        )}
      </Modal>
    </>
  );
}
