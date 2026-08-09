import {
  getRemnawaveHealth,
  getRemnawaveNodes,
  getRemnawaveUsers,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnMetricCard, VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { StatusBadge } from "@dub/ui";

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

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <VpnPanel className="min-h-72">
            <VpnPanelHeader
              title="Network activity"
              description="Traffic and active connection history"
            />
            <div className="flex h-52 items-end gap-2 px-5 pb-5 pt-8">
              {[26, 42, 34, 61, 48, 76, 58, 88, 69, 94, 73, 84].map(
                (height, index) => (
                  <div
                    key={index}
                    className="bg-bg-inverted/90 hover:bg-bg-inverted flex-1 rounded-t transition-colors"
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
          </VpnPanel>
          <VpnPanel>
            <VpnPanelHeader
              title="Infrastructure"
              description="Remnawave panel and isolated VPN nodes"
            />
            <div className="divide-border-subtle divide-y px-5">
              {[
                "Management panel",
                "Node 01",
                "Node 02",
                "Node 03",
                "Node 04",
              ].map((name, index) => (
                <div
                  key={name}
                  className="flex min-h-12 items-center justify-between gap-3 text-sm"
                >
                  <span className="text-content-emphasis font-medium">
                    {name}
                  </span>
                  <StatusBadge
                    variant={
                      index === 0 && !health.connected ? "pending" : "success"
                    }
                  >
                    {index === 0 && !health.connected ? "Connecting" : "Ready"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </VpnPanel>
        </div>
      </PageWidthWrapper>
    </PageContent>
  );
}
