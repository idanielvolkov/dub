import {
  getRemnawaveDeviceStats,
  getRemnawaveInfraProviders,
  getRemnawaveRequestStats,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { DubAnalyticsDashboard } from "@/ui/vpn/dub-analytics-dashboard";

export default async function OperationsInsightsPage() {
  const [devices, requests, infra] = await Promise.all([
    getRemnawaveDeviceStats(),
    getRemnawaveRequestStats(),
    getRemnawaveInfraProviders(),
  ]);

  const requestTotal =
    requests?.hourlyRequestStats.reduce(
      (total, item) => total + item.requestCount,
      0,
    ) ?? 0;

  return (
    <PageContent
      title="Insights"
      titleInfo={{
        title: "VPN usage, devices, requests, and infrastructure analytics.",
      }}
    >
      <PageWidthWrapper>
        <DubAnalyticsDashboard
          points={(requests?.hourlyRequestStats ?? []).map((point, index) => ({
            date: point.dateTime,
            requests: point.requestCount,
            devices:
              index === (requests?.hourlyRequestStats.length ?? 0) - 1
                ? devices?.stats.totalUniqueDevices ?? 0
                : 0,
            cost: 0,
          }))}
          totals={{
            requests: requestTotal,
            devices: devices?.stats.totalUniqueDevices ?? 0,
            cost: infra.providers.reduce(
              (sum, provider) => sum + provider.billingHistory.totalAmount,
              0,
            ),
          }}
          platforms={(devices?.byPlatform ?? []).map((platform) => ({
            label: platform.platform || "Unknown",
            value: platform.count,
            detail: `${platform.byApp.length} apps`,
          }))}
          applications={(requests?.byParsedApp ?? []).map((app) => ({
            label: app.app || "Unknown",
            value: app.count,
          }))}
          providers={infra.providers.map((provider) => ({
            label: provider.name,
            value: provider.billingHistory.totalAmount,
            detail: `${provider.billingNodes.length} nodes · ${provider.billingHistory.totalBills} bills`,
          }))}
        />
      </PageWidthWrapper>
    </PageContent>
  );
}
