"use client";

import {
  RemnawaveHwidDevice,
  RemnawaveSubscriptionRequestRecord,
} from "@/lib/remnawave/client";
import { OperationSubmit } from "@/ui/shared/operation-submit";
import {
  Button,
  EmptyState,
  Modal,
  ModalFooter,
  ModalHeader,
  StatusBadge,
  Table,
  TableRowMenu,
  TimestampTooltip,
  useTable,
} from "@dub/ui";
import { MobilePhone, ShieldKeyhole } from "@dub/ui/icons";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { removeHwidDevice } from "../../app/app.dub.co/(dashboard)/[slug]/operations/actions";

const dateTime = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const shortHwid = (value: string) =>
  value.length > 24 ? `${value.slice(0, 12)}…${value.slice(-8)}` : value;

function responseVariant(responseType: string) {
  const value = responseType.toLowerCase();
  if (value.includes("success") || value.includes("found")) return "success";
  if (value.includes("block") || value.includes("error")) return "error";
  if (value.includes("fallback") || value.includes("limited")) return "warning";
  return "neutral";
}

export function HwidDevicesTable({
  slug,
  devices,
  total,
}: {
  slug: string;
  devices: RemnawaveHwidDevice[];
  total: number;
}) {
  const [removeTarget, setRemoveTarget] = useState<RemnawaveHwidDevice | null>(
    null,
  );
  const columns = useMemo<ColumnDef<RemnawaveHwidDevice>[]>(
    () => [
      {
        id: "device",
        header: "Device",
        cell: ({ row }) => (
          <div className="min-w-44">
            <p className="text-content-emphasis truncate font-medium">
              {row.original.deviceModel ||
                row.original.platform ||
                "Unknown device"}
            </p>
            <p
              className="text-content-subtle truncate font-mono text-xs"
              title={row.original.hwid}
            >
              {shortHwid(row.original.hwid)}
            </p>
          </div>
        ),
      },
      {
        id: "platform",
        header: "Platform",
        cell: ({ row }) => (
          <div>
            <StatusBadge icon={null} variant="neutral">
              {row.original.platform || "Unknown"}
            </StatusBadge>
            <p className="text-content-subtle mt-1 text-xs">
              {row.original.osVersion || "OS not reported"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "userId",
        header: "User",
        cell: ({ row }) => `#${row.original.userId}`,
      },
      {
        id: "endpoint",
        header: "Last endpoint",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.requestIp || "—"}
          </span>
        ),
      },
      {
        id: "updatedAt",
        header: "Last seen",
        cell: ({ row }) => (
          <TimestampTooltip
            timestamp={new Date(row.original.updatedAt)}
            rows={["local", "utc", "unix"]}
          >
            <span className="text-content-subtle whitespace-nowrap text-sm">
              {dateTime(row.original.updatedAt)}
            </span>
          </TimestampTooltip>
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
                label: "Remove device",
                variant: "danger",
                onClick: () => setRemoveTarget(row.original),
              },
            ]}
          />
        ),
      },
    ],
    [slug],
  );
  const table = useTable({ data: devices, columns });

  return (
    <>
      <section>
        <div className="mb-3">
          <h2 className="text-content-emphasis text-sm font-semibold">
            HWID devices
          </h2>
          <p className="text-content-subtle text-sm">
            {total} client hardware records registered in Remnawave
          </p>
        </div>
        <Table
          {...table}
          resourceName={(plural) => (plural ? "devices" : "device")}
          emptyState={
            <EmptyState
              icon={MobilePhone}
              title="No HWID devices"
              description="Compatible VPN clients will appear here after registering a device."
            />
          }
        />
      </section>
      <Modal
        showModal={Boolean(removeTarget)}
        setShowModal={(open) => !open && setRemoveTarget(null)}
      >
        {removeTarget && (
          <>
            <ModalHeader
              title="Remove device"
              description="The client may register again on its next connection."
            />
            <ModalFooter>
              <Button
                variant="secondary"
                text="Cancel"
                onClick={() => setRemoveTarget(null)}
              />
              <form action={removeHwidDevice}>
                <input type="hidden" name="slug" value={slug} />
                <input
                  type="hidden"
                  name="userId"
                  value={String(removeTarget.userId)}
                />
                <input type="hidden" name="hwid" value={removeTarget.hwid} />
                <OperationSubmit destructive>Remove device</OperationSubmit>
              </form>
            </ModalFooter>
          </>
        )}
      </Modal>
    </>
  );
}

export function SubscriptionRequestsTable({
  records,
  total,
}: {
  records: RemnawaveSubscriptionRequestRecord[];
  total: number;
}) {
  const columns = useMemo<ColumnDef<RemnawaveSubscriptionRequestRecord>[]>(
    () => [
      {
        accessorKey: "userId",
        header: "User",
        cell: ({ row }) => (
          <span className="text-content-emphasis font-medium">
            #{row.original.userId}
          </span>
        ),
      },
      {
        id: "response",
        header: "Response",
        cell: ({ row }) => (
          <StatusBadge
            icon={null}
            variant={responseVariant(row.original.srrResponseType)}
          >
            {row.original.srrResponseType}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "srrRuleName",
        header: "Rule",
        cell: ({ row }) =>
          row.original.srrRuleName || "Default subscription response",
      },
      {
        accessorKey: "requestIp",
        header: "IP address",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.requestIp || "—"}
          </span>
        ),
      },
      {
        accessorKey: "userAgent",
        header: "Client",
        cell: ({ row }) => (
          <span
            className="block max-w-64 truncate text-sm"
            title={row.original.userAgent || undefined}
          >
            {row.original.userAgent || "Unknown client"}
          </span>
        ),
      },
      {
        id: "requestAt",
        header: "Time",
        cell: ({ row }) => (
          <TimestampTooltip
            timestamp={new Date(row.original.requestAt)}
            rows={["local", "utc", "unix"]}
          >
            <span className="text-content-subtle whitespace-nowrap text-sm">
              {dateTime(row.original.requestAt)}
            </span>
          </TimestampTooltip>
        ),
      },
    ],
    [],
  );
  const table = useTable({ data: records, columns });

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-content-emphasis text-sm font-semibold">
          Subscription request history
        </h2>
        <p className="text-content-subtle text-sm">
          {total} recorded client requests and routing results
        </p>
      </div>
      <Table
        {...table}
        resourceName={(plural) => (plural ? "requests" : "request")}
        emptyState={
          <EmptyState
            icon={ShieldKeyhole}
            title="No subscription requests"
            description="New client subscription requests will be recorded here."
          />
        }
      />
    </section>
  );
}
