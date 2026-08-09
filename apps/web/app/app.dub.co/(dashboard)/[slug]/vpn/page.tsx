import {
  getRemnawaveHealth,
  getRemnawaveNodes,
  getRemnawaveUsers,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { CardList, EmptyState } from "@dub/ui";
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
        <VpnStats
          items={cards.map(({ label, value, hint, online }) => ({
            label,
            value,
            detail: hint,
            indicator:
              online === undefined ? undefined : (
                <VpnStatusBadge online={online}>
                  {online ? "Online" : "Connecting"}
                </VpnStatusBadge>
              ),
          }))}
        />

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
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${Math.min(trafficGb, 100)}%` }}
                      />
                    </div>
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
                  <VpnStatusBadge online={health.connected}>
                    {health.connected ? "Ready" : "Connecting"}
                  </VpnStatusBadge>
                </div>
              </CardList.Card>
              {nodes.map((node) => (
                <CardList.Card key={node.uuid} hoverStateEnabled={false}>
                  <div className="flex min-h-9 items-center justify-between gap-3 text-sm">
                    <span className="text-content-emphasis font-medium">
                      {node.name}
                    </span>
                    <VpnStatusBadge online={node.isConnected}>
                      {node.isConnected ? "Ready" : "Connecting"}
                    </VpnStatusBadge>
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

function VpnStatusBadge({
  online,
  children,
}: {
  online: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={
        online
          ? "bg-bg-success text-content-success max-w-fit rounded-md px-2 py-1 text-xs font-medium"
          : "bg-bg-attention text-content-attention max-w-fit rounded-md px-2 py-1 text-xs font-medium"
      }
    >
      {children}
    </span>
  );
}
