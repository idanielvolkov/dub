import {
  getRemnawaveHealth,
  getRemnawaveNodes,
  getRemnawaveUsers,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { NetworkActivityTable } from "@/ui/vpn/network-activity-table";
import { VpnStats } from "@/ui/vpn/vpn-ui";
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
        <VpnStats
          items={cards.map(({ label, value, hint, online }) => ({
            label,
            value,
            detail: hint,
            indicator:
              online === undefined ? undefined : (
                <StatusBadge variant={online ? "success" : "pending"}>
                  {online ? "Online" : "Connecting"}
                </StatusBadge>
              ),
          }))}
        />
        <NetworkActivityTable nodes={nodes} />
      </PageWidthWrapper>
    </PageContent>
  );
}
