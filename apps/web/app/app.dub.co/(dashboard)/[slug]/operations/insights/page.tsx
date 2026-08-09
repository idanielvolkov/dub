import {
  getRemnawaveDeviceStats,
  getRemnawaveExternalSquads,
  getRemnawaveInfraProviders,
  getRemnawaveRequestStats,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { ExternalSquadsManagement } from "@/ui/vpn/external-squads-management";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { Badge, CardList, CardListCard, EmptyState } from "@dub/ui";
import { ChartActivity2 } from "@dub/ui/icons";

export default async function OperationsInsightsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [devices, requests, externalSquads, infra] = await Promise.all([
    getRemnawaveDeviceStats(),
    getRemnawaveRequestStats(),
    getRemnawaveExternalSquads(),
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
        title: "Monitor client activity and infrastructure costs.",
      }}
    >
      <PageWidthWrapper className="space-y-8 pb-10">
        <VpnStats
          items={[
            {
              label: "Unique devices",
              value: devices?.stats.totalUniqueDevices ?? 0,
              detail: `${devices?.stats.totalHwidDevices ?? 0} HWID records`,
            },
            {
              label: "Subscription requests",
              value: requestTotal,
              detail: "Current API statistics window",
            },
            {
              label: "External squads",
              value: externalSquads.total,
              detail: "Subscription override groups",
            },
            {
              label: "Infrastructure providers",
              value: infra.total,
              detail: "Tracked hosting vendors",
            },
          ]}
        />

        <section>
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Client platforms
            </h2>
            <p className="text-content-subtle text-sm">
              Devices reported by compatible VPN applications
            </p>
          </div>
          <CardList variant="compact">
            {(devices?.byPlatform ?? []).map((platform) => (
              <CardListCard key={platform.platform} hoverStateEnabled={false}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-content-emphasis text-sm font-medium">
                      {platform.platform || "Unknown platform"}
                    </p>
                    <p className="text-content-subtle mt-1 text-xs">
                      {platform.byApp
                        .slice(0, 4)
                        .map((app) => `${app.app}: ${app.count}`)
                        .join(" · ") || "No application details"}
                    </p>
                  </div>
                  <Badge variant="gray">{platform.count} devices</Badge>
                </div>
              </CardListCard>
            ))}
          </CardList>
          {!devices?.byPlatform.length && (
            <EmptyState
              icon={ChartActivity2}
              title="No device telemetry yet"
              description="HWID-compatible clients will appear here after connecting."
            />
          )}
        </section>

        <section>
          <ExternalSquadsManagement
            slug={slug}
            squads={externalSquads.externalSquads}
          />
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Infrastructure billing
            </h2>
            <p className="text-content-subtle text-sm">
              Providers, attached nodes and recorded costs
            </p>
          </div>
          <CardList variant="compact">
            {infra.providers.map((provider) => (
              <CardListCard key={provider.uuid} hoverStateEnabled={false}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-content-emphasis text-sm font-medium">
                      {provider.name}
                    </p>
                    <p className="text-content-subtle mt-1 text-xs">
                      {provider.billingNodes.length} nodes ·{" "}
                      {provider.billingHistory.totalBills} bills
                    </p>
                  </div>
                  <Badge variant="gray">
                    $
                    {provider.billingHistory.totalAmount.toLocaleString(
                      "en-US",
                    )}
                  </Badge>
                </div>
              </CardListCard>
            ))}
          </CardList>
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
