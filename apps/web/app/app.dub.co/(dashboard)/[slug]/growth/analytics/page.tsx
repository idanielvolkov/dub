import { getGrowthWorkspace } from "@/lib/growth/get-growth-workspace";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { DubAnalyticsDashboard } from "@/ui/vpn/dub-analytics-dashboard";

export default async function GrowthAnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { totals, campaigns } = await getGrowthWorkspace(slug);
  const campaignName = (campaign: (typeof campaigns)[number]) =>
    campaign.title || campaign.utm_campaign || campaign.shortLink;

  return (
    <PageContent
      title="Analytics"
      titleInfo={{ title: "Marketing funnel and campaign performance." }}
    >
      <PageWidthWrapper>
        <DubAnalyticsDashboard
          points={[...campaigns].reverse().map((campaign) => ({
            date: campaign.createdAt.toISOString(),
            requests: campaign.clicks,
            devices: campaign.leads,
            cost: Number(campaign.saleAmount) / 100,
          }))}
          totals={{
            requests: totals._sum.clicks ?? 0,
            devices: totals._sum.leads ?? 0,
            cost: Number(totals._sum.saleAmount ?? 0) / 100,
          }}
          metricLabels={{
            requests: "Clicks",
            devices: "Leads",
            cost: "Revenue",
          }}
          breakdownLabels={{
            platforms: "Campaigns",
            applications: "Leads",
            providers: "Sales",
          }}
          secondaryTitle="Campaign revenue"
          platforms={[...campaigns]
            .sort((a, b) => b.clicks - a.clicks)
            .map((campaign) => ({
              label: campaignName(campaign),
              value: campaign.clicks,
              detail: `${campaign.leads} leads`,
            }))}
          applications={[...campaigns]
            .sort((a, b) => b.leads - a.leads)
            .map((campaign) => ({
              label: campaignName(campaign),
              value: campaign.leads,
              detail: `${campaign.sales} sales`,
            }))}
          providers={[...campaigns]
            .sort((a, b) => Number(b.saleAmount - a.saleAmount))
            .map((campaign) => ({
              label: campaignName(campaign),
              value: Number(campaign.saleAmount) / 100,
              detail: `${campaign.sales} sales`,
            }))}
        />
      </PageWidthWrapper>
    </PageContent>
  );
}
