import { getGrowthWorkspace } from "@/lib/growth/get-growth-workspace";
import { CampaignSummaryTable } from "@/ui/growth/campaign-summary-table";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { ButtonLink, MetricCards } from "@dub/ui";

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
      title="Overview"
      titleInfo={{
        title: "Track campaigns, leads, and attributed revenue.",
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
        <MetricCards
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
          <CampaignSummaryTable
            campaigns={campaigns.slice(0, 6).map((campaign) => ({
              id: campaign.id,
              title: campaign.title,
              shortLink: campaign.shortLink,
              campaign: campaign.utm_campaign,
              status: campaign.meta.status,
              clicks: campaign.clicks,
              leads: campaign.leads,
              sales: campaign.sales,
              createdAt: campaign.createdAt.toISOString(),
            }))}
          />
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
