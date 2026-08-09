import { getRemnawaveNodes, getRemnawaveUsers } from "@/lib/remnawave/client";
import { DubCard, DubCardList } from "@/ui/vpn/server-card-list";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { EmptyState, ProgressBar, StatusBadge } from "@dub/ui";
import { ChartActivity2 } from "@dub/ui/icons";

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 4);
  return `${(bytes / 1024 ** index).toFixed(index > 2 ? 1 : 0)} ${units[index]}`;
};

export default async function TrafficPage() {
  const [{ users }, nodes] = await Promise.all([
    getRemnawaveUsers(),
    getRemnawaveNodes(),
  ]);
  const used = users.reduce(
    (sum, user) => sum + (user.usedTrafficBytes || 0),
    0,
  );
  const allowance = users.reduce(
    (sum, user) => sum + (user.trafficLimitBytes || 0),
    0,
  );
  const nodeTraffic = nodes.reduce(
    (sum, node) => sum + (node.trafficUsedBytes || 0),
    0,
  );
  const topUsers = [...users]
    .sort((a, b) => (b.usedTrafficBytes || 0) - (a.usedTrafficBytes || 0))
    .slice(0, 8);

  return (
    <PageContent
      title="Traffic"
      titleInfo={{ title: "Live usage totals reported by Remnawave." }}
    >
      <PageWidthWrapper className="pb-10">
        <VpnStats
          items={[
            ["Subscriber usage", formatBytes(used), `${users.length} accounts`],
            [
              "Plan allowance",
              formatBytes(allowance),
              allowance
                ? `${Math.min(100, (used / allowance) * 100).toFixed(1)}% consumed`
                : "Unlimited accounts excluded",
            ],
            [
              "Node traffic",
              formatBytes(nodeTraffic),
              `${nodes.length} VPN nodes`,
            ],
            [
              "Online now",
              String(nodes.reduce((sum, node) => sum + node.usersOnline, 0)),
              "Live connections",
            ],
          ].map(([label, value, hint]) => ({
            label,
            value,
            detail: hint,
          }))}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <section>
            <div className="mb-3">
              <h2 className="text-content-emphasis text-sm font-semibold">
                Subscriber consumption
              </h2>
              <p className="text-content-subtle text-sm">
                Usage against the assigned plan allowance
              </p>
            </div>
            {topUsers.length ? (
              <DubCardList variant="compact">
                {topUsers.map((user) => {
                  const consumed = user.usedTrafficBytes || 0;
                  const percent = user.trafficLimitBytes
                    ? Math.min(100, (consumed / user.trafficLimitBytes) * 100)
                    : 0;
                  return (
                    <DubCard key={user.uuid} hoverStateEnabled={false}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-content-emphasis font-medium">
                          {user.username}
                        </span>
                        <span className="text-content-subtle">
                          {formatBytes(consumed)}
                          {user.trafficLimitBytes
                            ? ` / ${formatBytes(user.trafficLimitBytes)}`
                            : " / Unlimited"}
                        </span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar
                          value={
                            user.trafficLimitBytes ? Math.max(1, percent) : 0
                          }
                          className="h-1.5"
                        />
                      </div>
                    </DubCard>
                  );
                })}
              </DubCardList>
            ) : (
              <div className="p-8">
                <EmptyState
                  icon={ChartActivity2}
                  title="No traffic yet"
                  description="Usage appears after subscribers start using the VPN."
                />
              </div>
            )}
          </section>

          <section>
            <div className="mb-3">
              <h2 className="text-content-emphasis text-sm font-semibold">
                Server distribution
              </h2>
              <p className="text-content-subtle text-sm">
                Current load across VPN nodes
              </p>
            </div>
            <DubCardList variant="compact">
              {nodes.map((node) => (
                <DubCard key={node.uuid} hoverStateEnabled={false}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-content-emphasis font-medium">
                      {node.name}
                    </span>
                    <StatusBadge
                      variant={node.isConnected ? "success" : "warning"}
                    >
                      {node.isConnected ? "Online" : "Offline"}
                    </StatusBadge>
                  </div>
                  <div className="text-content-subtle mt-2 flex justify-between text-xs">
                    <span>{node.usersOnline} connected</span>
                    <span>{formatBytes(node.trafficUsedBytes || 0)}</span>
                  </div>
                </DubCard>
              ))}
            </DubCardList>
            {!nodes.length && (
              <div className="p-8">
                <EmptyState
                  icon={ChartActivity2}
                  title="No server traffic"
                  description="Connect a Remnawave node to display its load."
                />
              </div>
            )}
          </section>
        </div>
      </PageWidthWrapper>
    </PageContent>
  );
}
