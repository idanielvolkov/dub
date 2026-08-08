import {
  getRemnawaveHealth,
  getRemnawaveNodes,
  getRemnawaveUsers,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";

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
    <PageContent title="VPN overview">
      <PageWidthWrapper className="py-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, hint, online }) => (
            <div
              key={label}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-600">{label}</p>
                {online !== undefined && (
                  <span
                    className={`size-2 rounded-full ${online ? "bg-green-500" : "bg-amber-400"}`}
                  />
                )}
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
                {value}
              </p>
              <p className="mt-1 text-xs text-neutral-500">{hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="min-h-72 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-neutral-950">
              Network activity
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Traffic and active connection history will appear here.
            </p>
            <div className="mt-8 flex h-40 items-end gap-2">
              {[26, 42, 34, 61, 48, 76, 58, 88, 69, 94, 73, 84].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-md bg-neutral-900 transition-opacity hover:opacity-70"
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-950 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold">Infrastructure</p>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              One management panel and four isolated VPN nodes. API access is
              routed through the Detz backend.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Management panel",
                "Node 01",
                "Node 02",
                "Node 03",
                "Node 04",
              ].map((name, index) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-lg border border-neutral-800 px-3 py-2 text-sm"
                >
                  <span>{name}</span>
                  <span
                    className={
                      index === 0 && !health.connected
                        ? "text-amber-300"
                        : "text-green-400"
                    }
                  >
                    {index === 0 && !health.connected ? "Connecting" : "Ready"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageWidthWrapper>
    </PageContent>
  );
}
