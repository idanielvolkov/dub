import {
  getRemnawaveDeviceStats,
  getRemnawaveHwidDevices,
  getRemnawaveRequestStats,
  getRemnawaveSubscriptionRequestHistory,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import {
  HwidDevicesTable,
  SubscriptionRequestsTable,
} from "@/ui/vpn/devices-requests-tables";
import { MetricCards } from "@dub/ui";

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
      title="Devices"
      titleInfo={{
        title: "Review registered devices and subscription requests.",
      }}
    >
      <PageWidthWrapper className="space-y-8 pb-10">
        <MetricCards
          items={[
            {
              label: "Registered devices",
              value: deviceList.total,
              detail: `${deviceStats?.stats.totalUniqueDevices ?? 0} unique clients`,
            },
            {
              label: "Average per user",
              value: deviceStats?.stats.averageHwidDevicesPerUser ?? 0,
              detail: "HWID-enabled users",
            },
            {
              label: "Recent requests",
              value: requestCount,
              detail: "Current statistics window",
            },
          ]}
        />
        <HwidDevicesTable
          slug={slug}
          devices={deviceList.devices}
          total={deviceList.total}
        />
        <SubscriptionRequestsTable
          records={requestList.records}
          total={requestList.total}
        />
      </PageWidthWrapper>
    </PageContent>
  );
}
