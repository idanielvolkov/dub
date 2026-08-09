import {
  getRemnawaveConfigProfiles,
  getRemnawaveHealth,
  getRemnawaveHosts,
  getRemnawaveNodes,
  getRemnawaveSquads,
  getRemnawaveSubscriptionTemplates,
  getRemnawaveUsers,
} from "@/lib/remnawave/client";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnMetricCard, VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";
import { StatusBadge } from "@dub/ui";
import Link from "next/link";

export default async function OperationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [health, users, nodes, hosts, profiles, squads, templates] =
    await Promise.all([
      getRemnawaveHealth(),
      getRemnawaveUsers(),
      getRemnawaveNodes(),
      getRemnawaveHosts(),
      getRemnawaveConfigProfiles(),
      getRemnawaveSquads(),
      getRemnawaveSubscriptionTemplates(),
    ]);

  const resources = [
    ["Users", users.total, `/${slug}/operations/users`],
    ["Nodes", nodes.length, `/${slug}/operations/nodes`],
    ["Hosts", hosts.length, `/${slug}/operations/hosts`],
    [
      "Profiles & squads",
      profiles.total + squads.total,
      `/${slug}/operations/configurations`,
    ],
    [
      "Subscription templates",
      templates.total,
      `/${slug}/operations/subscriptions`,
    ],
  ] as const;

  return (
    <PageContent
      title="Remnawave Operations"
      titleInfo={{
        title: "Technical control plane backed by the Remnawave API.",
      }}
      controls={
        <a
          href="https://panel.detz.fun"
          target="_blank"
          rel="noreferrer"
          className="border-border-subtle hover:bg-bg-muted rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
        >
          Open native panel ↗
        </a>
      }
    >
      <PageWidthWrapper className="pb-10">
        <div className="grid gap-4 md:grid-cols-3">
          <VpnMetricCard
            label="API status"
            value={health.connected ? "Operational" : "Unavailable"}
            detail={health.status}
            indicator={
              <StatusBadge variant={health.connected ? "success" : "warning"}>
                {health.connected ? "Connected" : "Attention"}
              </StatusBadge>
            }
          />
          <VpnMetricCard
            label="Connected nodes"
            value={`${nodes.filter((node) => node.isConnected).length}/${nodes.length}`}
            detail="Live node connections"
          />
          <VpnMetricCard
            label="Managed objects"
            value={users.total + nodes.length + hosts.length}
            detail="Users, nodes, and hosts"
          />
        </div>

        <VpnPanel className="mt-4">
          <VpnPanelHeader
            title="Control plane"
            description="Every section reads directly from your Remnawave installation"
          />
          <div className="divide-border-subtle divide-y">
            {resources.map(([name, count, href]) => (
              <Link
                key={name}
                href={href}
                className="hover:bg-bg-muted flex min-h-14 items-center justify-between px-5 text-sm transition-colors"
              >
                <span className="text-content-emphasis font-medium">
                  {name}
                </span>
                <span className="text-content-subtle">{count} →</span>
              </Link>
            ))}
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
