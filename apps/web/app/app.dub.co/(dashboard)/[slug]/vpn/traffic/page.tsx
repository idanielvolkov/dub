import { getRemnawaveNodes, getRemnawaveUsers } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { DubAnalyticsDashboard } from "@/ui/vpn/dub-analytics-dashboard";

const inGb = (bytes: number) => bytes / 1024 / 1024 / 1024;

export default async function TrafficPage() {
  const [{ users }, nodes] = await Promise.all([
    getRemnawaveUsers(),
    getRemnawaveNodes(),
  ]);
  const used = users.reduce(
    (sum, user) => sum + (user.usedTrafficBytes ?? 0),
    0,
  );
  const online = nodes.reduce((sum, node) => sum + node.usersOnline, 0);

  return (
    <PageContent
      title="Traffic"
      titleInfo={{ title: "Monitor VPN usage across users and nodes." }}
    >
      <PageWidthWrapper>
        <DubAnalyticsDashboard
          points={nodes.map((node, index) => ({
            date: new Date(
              Date.now() - (nodes.length - index - 1) * 60 * 60 * 1000,
            ).toISOString(),
            requests: inGb(node.trafficUsedBytes ?? 0),
            devices: node.usersOnline,
            cost: node.isConnected ? 1 : 0,
          }))}
          totals={{
            requests: inGb(used),
            devices: online,
            cost: nodes.filter((node) => node.isConnected).length,
          }}
          metricLabels={{
            requests: "Traffic, GB",
            devices: "Online users",
            cost: "Online nodes",
          }}
          breakdownLabels={{
            platforms: "Users",
            applications: "Nodes",
            providers: "Capacity",
          }}
          secondaryTitle="Node capacity"
          platforms={[...users]
            .sort(
              (a, b) => (b.usedTrafficBytes ?? 0) - (a.usedTrafficBytes ?? 0),
            )
            .map((user) => ({
              label: user.username,
              value: inGb(user.usedTrafficBytes ?? 0),
              detail: user.trafficLimitBytes
                ? `${inGb(user.trafficLimitBytes).toFixed(1)} GB limit`
                : "Unlimited",
            }))}
          applications={nodes.map((node) => ({
            label: node.name,
            value: inGb(node.trafficUsedBytes ?? 0),
            detail: `${node.usersOnline} online`,
          }))}
          providers={nodes.map((node) => ({
            label: node.name,
            value: node.usersOnline,
            detail: node.isConnected ? "Connected" : "Offline",
          }))}
        />
      </PageWidthWrapper>
    </PageContent>
  );
}
