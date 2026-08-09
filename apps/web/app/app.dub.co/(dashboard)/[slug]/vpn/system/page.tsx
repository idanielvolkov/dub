import { getRemnawaveHealth, getRemnawaveNodes } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { ButtonLink } from "@/ui/placeholders/button-link";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { CardList, EmptyState, StatusBadge } from "@dub/ui";
import { WindowSettings } from "@dub/ui/icons";

const formatMemory = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;
const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
};

export default async function SystemPage() {
  const [health, nodes] = await Promise.all([
    getRemnawaveHealth(),
    getRemnawaveNodes(),
  ]);
  const metrics = health.metrics || [];
  const connected = nodes.filter((node) => node.isConnected).length;

  return (
    <PageContent
      title="System"
      titleInfo={{ title: "Remnawave health and runtime telemetry." }}
    >
      <PageWidthWrapper className="pb-10">
        <VpnStats
          items={[
            {
              label: "Remnawave API",
              value: health.connected ? "Operational" : "Unavailable",
              detail: health.error || health.status,
              indicator: (
                <StatusBadge variant={health.connected ? "success" : "warning"}>
                  {health.connected ? "Online" : "Attention"}
                </StatusBadge>
              ),
            },
            {
              label: "VPN nodes",
              value: `${connected}/${nodes.length}`,
              detail: "Connected to the management panel",
            },
            {
              label: "Panel processes",
              value: metrics.length,
              detail: "API, scheduler, and processor runtime",
            },
          ]}
        />

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-content-emphasis text-sm font-semibold">
                Runtime processes
              </h2>
              <p className="text-content-subtle text-sm">
                Live resource data from the Remnawave panel
              </p>
            </div>
            <ButtonLink
              href="https://panel.detz.fun"
              target="_blank"
              rel="noreferrer"
              variant="secondary"
              className="h-9 px-3 text-sm"
            >
              Open technical panel ↗
            </ButtonLink>
          </div>
          {metrics.length ? (
            <CardList variant="compact">
              {metrics.map((metric) => (
                <CardList.Card
                  key={`${metric.instanceType}-${metric.uptime}`}
                  hoverStateEnabled={false}
                >
                  <div className="grid gap-3 sm:grid-cols-[1fr_repeat(4,120px)] sm:items-center">
                    <div>
                      <p className="text-content-emphasis text-sm font-medium capitalize">
                        {metric.instanceType}
                      </p>
                      <p className="text-content-subtle text-xs">
                        Uptime {formatUptime(metric.uptime)}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-content-subtle text-xs sm:hidden">
                        Memory
                      </p>
                      {formatMemory(metric.rss)}
                    </div>
                    <div className="text-sm">
                      <p className="text-content-subtle text-xs sm:hidden">
                        Heap
                      </p>
                      {formatMemory(metric.heapUsed)} /{" "}
                      {formatMemory(metric.heapTotal)}
                    </div>
                    <div className="text-sm">
                      <p className="text-content-subtle text-xs sm:hidden">
                        Event loop
                      </p>
                      {metric.eventLoopDelayMs.toFixed(2)} ms
                    </div>
                    <div className="text-sm">
                      <p className="text-content-subtle text-xs sm:hidden">
                        Handles
                      </p>
                      {metric.activeHandles}
                    </div>
                  </div>
                </CardList.Card>
              ))}
            </CardList>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={WindowSettings}
                title="Runtime metrics unavailable"
                description="Remnawave did not return process telemetry."
              />
            </div>
          )}
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
