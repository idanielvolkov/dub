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
import { ButtonLink } from "@/ui/placeholders/button-link";
import { VpnMetricCard } from "@/ui/vpn/vpn-ui";
import { CardList, StatusBadge } from "@dub/ui";
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
        <ButtonLink
          href="https://panel.detz.fun"
          target="_blank"
          rel="noreferrer"
          variant="secondary"
          className="h-9 px-3 text-sm"
        >
          Open native panel ↗
        </ButtonLink>
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

        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Control plane
            </h2>
            <p className="text-content-subtle text-sm">
              Every section reads directly from your Remnawave installation
            </p>
          </div>
          <CardList variant="compact">
            {resources.map(([name, count, href]) => (
              <CardList.Card key={name}>
                <Link
                  href={href}
                  className="flex min-h-9 items-center justify-between text-sm"
                >
                  <span className="text-content-emphasis font-medium">
                    {name}
                  </span>
                  <span className="text-content-subtle">{count} →</span>
                </Link>
              </CardList.Card>
            ))}
          </CardList>
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
