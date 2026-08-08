import { getRemnawaveNodes, getRemnawaveUsers } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";

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
    <PageContent title="Traffic">
      <PageWidthWrapper className="py-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
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
          ].map(([label, value, hint]) => (
            <div
              key={label}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-neutral-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                {value}
              </p>
              <p className="mt-1 text-xs text-neutral-500">{hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-5 py-4">
              <p className="font-medium text-neutral-950">
                Subscriber consumption
              </p>
              <p className="mt-0.5 text-sm text-neutral-500">
                Live totals reported by Remnawave
              </p>
            </div>
            {topUsers.length ? (
              <div className="divide-y divide-neutral-100">
                {topUsers.map((user) => {
                  const consumed = user.usedTrafficBytes || 0;
                  const percent = user.trafficLimitBytes
                    ? Math.min(100, (consumed / user.trafficLimitBytes) * 100)
                    : 0;
                  return (
                    <div key={user.uuid} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-neutral-900">
                          {user.username}
                        </span>
                        <span className="text-neutral-500">
                          {formatBytes(consumed)}
                          {user.trafficLimitBytes
                            ? ` / ${formatBytes(user.trafficLimitBytes)}`
                            : " / Unlimited"}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-neutral-950 transition-all"
                          style={{
                            width: `${user.trafficLimitBytes ? Math.max(1, percent) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-neutral-500">
                Traffic appears after subscribers start using the VPN.
              </div>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="font-medium text-neutral-950">Server distribution</p>
            <div className="mt-4 space-y-3">
              {nodes.map((node) => (
                <div key={node.uuid} className="rounded-lg bg-neutral-50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-900">
                      {node.name}
                    </span>
                    <span
                      className={
                        node.isConnected ? "text-green-700" : "text-amber-700"
                      }
                    >
                      {node.isConnected ? "Online" : "Offline"}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-neutral-500">
                    <span>{node.usersOnline} connected</span>
                    <span>{formatBytes(node.trafficUsedBytes || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageWidthWrapper>
    </PageContent>
  );
}
