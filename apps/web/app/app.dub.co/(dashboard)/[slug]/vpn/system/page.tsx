import { getRemnawaveHealth, getRemnawaveNodes } from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";

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
    <PageContent title="System">
      <PageWidthWrapper className="py-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">Remnawave API</p>
              <span
                className={`size-2 rounded-full ${health.connected ? "bg-green-500" : "bg-amber-400"}`}
              />
            </div>
            <p className="mt-2 text-2xl font-semibold">
              {health.connected ? "Operational" : "Unavailable"}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {health.error || health.status}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">VPN nodes</p>
            <p className="mt-2 text-2xl font-semibold">
              {connected}/{nodes.length}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Connected to the management panel
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">Panel processes</p>
            <p className="mt-2 text-2xl font-semibold">{metrics.length}</p>
            <p className="mt-1 text-xs text-neutral-500">
              API, scheduler, and processor runtime
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <p className="font-medium text-neutral-950">Runtime processes</p>
              <p className="mt-0.5 text-sm text-neutral-500">
                Live resource data from the Remnawave panel
              </p>
            </div>
            <a
              href="https://panel.detz.fun"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium transition hover:bg-neutral-50"
            >
              Open technical panel ↗
            </a>
          </div>
          {metrics.length ? (
            <div className="divide-y divide-neutral-100">
              {metrics.map((metric) => (
                <div
                  key={`${metric.instanceType}-${metric.uptime}`}
                  className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_repeat(4,120px)] sm:items-center"
                >
                  <div>
                    <p className="text-sm font-medium capitalize text-neutral-950">
                      {metric.instanceType}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Uptime {formatUptime(metric.uptime)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-neutral-500">Memory</p>
                    {formatMemory(metric.rss)}
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-neutral-500">Heap</p>
                    {formatMemory(metric.heapUsed)} /{" "}
                    {formatMemory(metric.heapTotal)}
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-neutral-500">Event loop</p>
                    {metric.eventLoopDelayMs.toFixed(2)} ms
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-neutral-500">Handles</p>
                    {metric.activeHandles}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-neutral-500">
              Runtime metrics are temporarily unavailable.
            </div>
          )}
        </div>
      </PageWidthWrapper>
    </PageContent>
  );
}
