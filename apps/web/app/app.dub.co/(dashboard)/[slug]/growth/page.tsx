import { getGrowthWorkspace } from "@/lib/growth/get-growth-workspace";
import { DubCard, DubCardList } from "@/ui/vpn/server-card-list";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { ButtonLink } from "@/ui/placeholders/button-link";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { EmptyState } from "@dub/ui";
import { Megaphone } from "@dub/ui/icons";

export default async function GrowthPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { totals, campaigns } = await getGrowthWorkspace(slug);
  const revenue = Number(totals._sum.saleAmount || 0) / 100;

  return (
    <PageContent
      title="Growth Workspace"
      titleInfo={{
        title: "A dedicated workspace for your marketing and growth team.",
      }}
      controls={
        <ButtonLink
          href={`/${slug}/growth/campaigns`}
          variant="primary"
          className="h-9 px-3 text-sm"
        >
          View campaigns
        </ButtonLink>
      }
    >
      <PageWidthWrapper className="pb-10">
        <VpnStats
          items={[
            {
              label: "Campaigns",
              value: totals._count.id,
              detail: "Active acquisition links",
            },
            {
              label: "Clicks",
              value: totals._sum.clicks || 0,
              detail: "Campaign visits",
            },
            {
              label: "Leads",
              value: totals._sum.leads || 0,
              detail: "Attributed prospects",
            },
            {
              label: "Revenue",
              value: `$${revenue.toLocaleString()}`,
              detail: `${totals._sum.sales || 0} attributed sales`,
            },
          ]}
        />
        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Recent campaigns
            </h2>
            <p className="text-content-subtle text-sm">
              Latest activity across marketing channels
            </p>
          </div>
          <DubCardList variant="compact">
            {campaigns.slice(0, 6).map((campaign) => (
              <DubCard key={campaign.id} hoverStateEnabled={false}>
                <div className="grid gap-3 sm:grid-cols-[1fr_repeat(3,100px)] sm:items-center">
                  <div className="min-w-0">
                    <p className="text-content-emphasis truncate text-sm font-medium">
                      {campaign.title ||
                        campaign.utm_campaign ||
                        campaign.shortLink}
                    </p>
                    <p className="text-content-subtle mt-0.5 truncate text-xs">
                      {campaign.shortLink}
                    </p>
                  </div>
                  <span className="text-sm">{campaign.clicks} clicks</span>
                  <span className="text-sm">{campaign.leads} leads</span>
                  <span className="text-sm">{campaign.sales} sales</span>
                </div>
              </DubCard>
            ))}
          </DubCardList>
          {!campaigns.length && (
            <div className="py-12">
              <EmptyState
                icon={Megaphone}
                title="No campaign data"
                description="Campaign activity will appear here."
              />
            </div>
          )}
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
