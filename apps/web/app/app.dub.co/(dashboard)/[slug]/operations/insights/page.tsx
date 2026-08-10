import {
  getRemnawaveHosts,
  getRemnawaveNodes,
  getRemnawaveUsers,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { DubAnalyticsDashboard } from "@/ui/vpn/dub-analytics-dashboard";

export default async function OperationsInsightsPage() {
  const [usersResponse, nodes, hosts] = await Promise.all([
    getRemnawaveUsers(),
    getRemnawaveNodes(),
    getRemnawaveHosts(),
  ]);
  const users = usersResponse.users;
  const totalTraffic = users.reduce(
    (total, user) => total + (user.usedTrafficBytes ?? 0),
    0,
  );
  const trafficGb = Math.round(totalTraffic / 1024 / 1024 / 1024);
  const onlineNodes = nodes.filter((node) => node.isConnected).length;

  return (
    <PageContent
      title="Insights"
      titleInfo={{
        title: "VPN traffic, users, nodes, and host analytics.",
      }}
    >
      <PageWidthWrapper>
        <DubAnalyticsDashboard
          points={[
            {
              date: new Date().toISOString(),
              requests: trafficGb,
              devices: users.length,
              cost: onlineNodes,
            },
          ]}
          totals={{
            requests: trafficGb,
            devices: users.length,
            cost: onlineNodes,
          }}
          metricLabels={{
            requests: "Traffic, GB",
            devices: "Users",
            cost: "Online nodes",
          }}
          breakdownLabels={{
            platforms: "Nodes",
            applications: "Users",
            providers: "Hosts",
          }}
          secondaryTitle="Network hosts"
          platforms={nodes.map((node) => ({
            label: node.name,
            value: Math.round(node.trafficUsedBytes / 1024 / 1024),
            detail: `${node.usersOnline} online`,
          }))}
          applications={users.map((user) => ({
            label: user.username,
            value: Math.round((user.usedTrafficBytes ?? 0) / 1024 / 1024),
            detail: user.status,
          }))}
          providers={hosts.map((host) => ({
            label: host.remark,
            value: host.nodes.length,
            detail: `${host.address}${host.port ? `:${host.port}` : ""}`,
          }))}
        />
      </PageWidthWrapper>
    </PageContent>
  );
}
