import { getRemnawaveHealth, getRemnawaveNodes } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnMetricCard, VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { StatusBadge } from "@dub/ui";

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
        <div className="grid gap-4 md:grid-cols-3">
          <VpnMetricCard
            label="Remnawave API"
            value={health.connected ? "Operational" : "Unavailable"}
            detail={health.error || health.status}
            indicator={
              <StatusBadge variant={health.connected ? "success" : "warning"}>
                {health.connected ? "Online" : "Attention"}
              </StatusBadge>
            }
          />
          <VpnMetricCard
            label="VPN nodes"
            value={`${connected}/${nodes.length}`}
            detail="Connected to the management panel"
          />
          <VpnMetricCard
            label="Panel processes"
            value={metrics.length}
            detail="API, scheduler, and processor runtime"
          />
        </div>

        <VpnPanel className="mt-4">
          <VpnPanelHeader
            title="Runtime processes"
            description="Live resource data from the Remnawave panel"
            controls={
              <a
                href="https://panel.detz.fun"
                target="_blank"
                rel="noreferrer"
                className="border-border-subtle bg-bg-default text-content-emphasis hover:bg-bg-muted rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
              >
                Open technical panel ↗
              </a>
            }
          />
          {metrics.length ? (
            <div>
              <div className="border-border-subtle text-content-emphasis hidden grid-cols-[1fr_repeat(4,120px)] border-b bg-neutral-50/60 px-5 py-3 text-xs font-medium sm:grid">
                <span>Process</span>
                <span>Memory</span>
                <span>Heap</span>
                <span>Event loop</span>
                <span>Handles</span>
              </div>
              <div className="divide-border-subtle divide-y">
                {metrics.map((metric) => (
                  <div
                    key={`${metric.instanceType}-${metric.uptime}`}
                    className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_repeat(4,120px)] sm:items-center"
                  >
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
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-neutral-500">
              Runtime metrics are temporarily unavailable.
            </div>
          )}
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
