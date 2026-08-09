import {
  getRemnawaveDeviceStats,
  getRemnawaveHwidDevices,
  getRemnawaveRequestStats,
  getRemnawaveSubscriptionRequestHistory,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { OperationSubmit } from "@/ui/vpn/operation-submit";
import { DubCard, DubCardList } from "@/ui/vpn/server-card-list";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { Badge, EmptyState } from "@dub/ui";
import { MobilePhone, ShieldKeyhole } from "@dub/ui/icons";
import { removeHwidDevice } from "../actions";

const dateTime = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const shortHwid = (value: string) =>
  value.length > 24 ? `${value.slice(0, 12)}…${value.slice(-8)}` : value;

export default async function OperationsDevicesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [deviceList, requestList, deviceStats, requestStats] =
    await Promise.all([
      getRemnawaveHwidDevices(),
      getRemnawaveSubscriptionRequestHistory(),
      getRemnawaveDeviceStats(),
      getRemnawaveRequestStats(),
    ]);
  const requestCount =
    requestStats?.hourlyRequestStats.reduce(
      (total, item) => total + item.requestCount,
      0,
    ) ?? requestList.total;

  return (
    <PageContent
      title="Devices & requests"
      titleInfo={{
        title:
          "Inspect connected client devices and recent subscription requests from Remnawave.",
      }}
    >
      <PageWidthWrapper className="space-y-8 pb-10">
        <VpnStats
          items={[
            {
              label: "Registered devices",
              value: deviceList.total,
              detail: `${deviceStats?.stats.totalUniqueDevices ?? 0} unique clients`,
            },
            {
              label: "Average per user",
              value: deviceStats?.stats.averageHwidDevicesPerUser ?? 0,
              detail: "HWID-enabled subscribers",
            },
            {
              label: "Recent requests",
              value: requestCount,
              detail: "Current statistics window",
            },
          ]}
        />

        <section>
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              HWID devices
            </h2>
            <p className="text-content-subtle text-sm">
              Client hardware registered against subscriber accounts
            </p>
          </div>
          {deviceList.devices.length ? (
            <DubCardList variant="compact">
              {deviceList.devices.map((device) => (
                <DubCard
                  key={`${device.userId}-${device.hwid}`}
                  hoverStateEnabled={false}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-content-emphasis truncate text-sm font-medium">
                          {device.deviceModel ||
                            device.platform ||
                            "Unknown device"}
                        </p>
                        <Badge variant="gray">
                          {device.platform || "Unknown platform"}
                        </Badge>
                      </div>
                      <p className="text-content-subtle mt-1 truncate font-mono text-xs">
                        {shortHwid(device.hwid)} · User {device.userId}
                      </p>
                      <p className="text-content-subtle mt-1 text-xs">
                        {device.osVersion || "Unknown OS"} ·{" "}
                        {device.requestIp || "No IP"} · Updated{" "}
                        {dateTime(device.updatedAt)}
                      </p>
                    </div>
                    <form action={removeHwidDevice}>
                      <input type="hidden" name="slug" value={slug} />
                      <input
                        type="hidden"
                        name="userId"
                        value={device.userId}
                      />
                      <input type="hidden" name="hwid" value={device.hwid} />
                      <OperationSubmit
                        destructive
                        confirmMessage="Remove this device from the subscriber? The client may register again on its next connection."
                      >
                        Remove device
                      </OperationSubmit>
                    </form>
                  </div>
                </DubCard>
              ))}
            </DubCardList>
          ) : (
            <EmptyState
              icon={MobilePhone}
              title="No HWID devices"
              description="Compatible VPN clients will appear here after registering a device."
            />
          )}
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Subscription request history
            </h2>
            <p className="text-content-subtle text-sm">
              Latest client requests, routing results and access rules
            </p>
          </div>
          {requestList.records.length ? (
            <DubCardList variant="compact">
              {requestList.records.map((record) => (
                <DubCard key={record.id} hoverStateEnabled={false}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-content-emphasis text-sm font-medium">
                          User {record.userId}
                        </p>
                        <Badge variant="gray">{record.srrResponseType}</Badge>
                      </div>
                      <p className="text-content-subtle mt-1 truncate text-xs">
                        {record.srrRuleName || "Default subscription response"}{" "}
                        · {record.requestIp || "No IP"}
                      </p>
                      <p className="text-content-subtle mt-1 truncate text-xs">
                        {record.userAgent || "Unknown client"}
                      </p>
                    </div>
                    <span className="text-content-subtle shrink-0 text-xs">
                      {dateTime(record.requestAt)}
                    </span>
                  </div>
                </DubCard>
              ))}
            </DubCardList>
          ) : (
            <EmptyState
              icon={ShieldKeyhole}
              title="No subscription requests"
              description="New client subscription requests will be recorded here."
            />
          )}
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
