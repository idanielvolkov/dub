import {
  getRemnawaveHealth,
  getRemnawaveNodes,
  getRemnawaveUsers,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnMetricCard } from "@/ui/vpn/vpn-ui";
import { CardList, EmptyState, ProgressBar, StatusBadge } from "@dub/ui";
import { ChartActivity2, Nodes4 } from "@dub/ui/icons";

export default async function VpnOverviewPage() {
  const [health, nodes, users] = await Promise.all([
    getRemnawaveHealth(),
    getRemnawaveNodes(),
    getRemnawaveUsers(),
  ]);

  const cards = [
    {
      label: "Active subscribers",
      value: String(users.total),
      hint: "Live API data",
    },
    {
      label: "Online servers",
      value: `${nodes.filter((node) => node.isConnected).length}/${nodes.length || 4}`,
      hint: "VPN locations",
    },
    {
      label: "Traffic used",
      value: `${(
        users.users.reduce(
          (sum, user) => sum + (user.usedTrafficBytes || 0),
          0,
        ) /
        1024 ** 3
      ).toFixed(1)} GB`,
      hint: "Subscriber telemetry",
    },
    {
      label: "Remnawave",
      value: health.connected ? "Online" : "Connecting",
      hint: health.database ? `Database: ${health.database}` : health.status,
      online: health.connected,
    },
  ];

  return (
    <PageContent
      title="VPN overview"
      titleInfo={{ title: "Live subscriber and infrastructure overview." }}
    >
      <PageWidthWrapper className="pb-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, hint, online }) => (
            <VpnMetricCard
              key={label}
              label={label}
              value={value}
              detail={hint}
              indicator={
                online === undefined ? undefined : (
                  <StatusBadge variant={online ? "success" : "pending"}>
                    {online ? "Online" : "Connecting"}
                  </StatusBadge>
                )
              }
            />
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <div className="mb-3">
              <h2 className="text-content-emphasis text-sm font-semibold">
                Network activity
              </h2>
              <p className="text-content-subtle text-sm">
                Live traffic reported by each Remnawave node
              </p>
            </div>
            <CardList variant="compact">
              {nodes.map((node) => {
                const trafficGb = (node.trafficUsedBytes || 0) / 1024 ** 3;
                return (
                  <CardList.Card key={node.uuid} hoverStateEnabled={false}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-content-emphasis font-medium">
                        {node.name}
                      </span>
                      <span className="text-content-subtle">
                        {trafficGb.toFixed(1)} GB
                      </span>
                    </div>
                    <ProgressBar
                      value={Math.min(trafficGb, 100)}
                      className="mt-2 h-1.5"
                    />
                  </CardList.Card>
                );
              })}
            </CardList>
            {!nodes.length && (
              <div className="py-10">
                <EmptyState
                  icon={ChartActivity2}
                  title="No network activity"
                  description="Traffic appears after a node connects."
                />
              </div>
            )}
          </section>
          <section>
            <div className="mb-3">
              <h2 className="text-content-emphasis text-sm font-semibold">
                Infrastructure
              </h2>
              <p className="text-content-subtle text-sm">
                Remnawave panel and VPN nodes
              </p>
            </div>
            <CardList variant="compact">
              <CardList.Card hoverStateEnabled={false}>
                <div className="flex min-h-9 items-center justify-between gap-3 text-sm">
                  <span className="text-content-emphasis font-medium">
                    Management panel
                  </span>
                  <StatusBadge
                    variant={health.connected ? "success" : "pending"}
                  >
                    {health.connected ? "Ready" : "Connecting"}
                  </StatusBadge>
                </div>
              </CardList.Card>
              {nodes.map((node) => (
                <CardList.Card key={node.uuid} hoverStateEnabled={false}>
                  <div className="flex min-h-9 items-center justify-between gap-3 text-sm">
                    <span className="text-content-emphasis font-medium">
                      {node.name}
                    </span>
                    <StatusBadge
                      variant={node.isConnected ? "success" : "pending"}
                    >
                      {node.isConnected ? "Ready" : "Connecting"}
                    </StatusBadge>
                  </div>
                </CardList.Card>
              ))}
            </CardList>
            {!nodes.length && (
              <div className="py-8">
                <EmptyState icon={Nodes4} title="No VPN nodes" />
              </div>
            )}
          </section>
        </div>
      </PageWidthWrapper>
    </PageContent>
  );
}
