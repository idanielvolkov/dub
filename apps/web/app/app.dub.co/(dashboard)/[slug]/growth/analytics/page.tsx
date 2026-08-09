import { getGrowthWorkspace } from "@/lib/growth/get-growth-workspace";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnMetricCard, VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";

export default async function GrowthAnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { totals, campaigns } = await getGrowthWorkspace(slug);
  const clicks = totals._sum.clicks || 0;
  const leads = totals._sum.leads || 0;
  const sales = totals._sum.sales || 0;
  return (
    <PageContent
      title="Growth analytics"
      titleInfo={{ title: "Marketing funnel and campaign performance." }}
    >
      <PageWidthWrapper className="pb-10">
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <VpnMetricCard
            label="Visit → lead"
            value={`${clicks ? ((leads / clicks) * 100).toFixed(1) : "0.0"}%`}
            detail={`${clicks} visits`}
          />
          <VpnMetricCard
            label="Lead → sale"
            value={`${leads ? ((sales / leads) * 100).toFixed(1) : "0.0"}%`}
            detail={`${leads} leads`}
          />
          <VpnMetricCard
            label="Revenue"
            value={`$${(Number(totals._sum.saleAmount || 0) / 100).toLocaleString()}`}
            detail={`${sales} sales`}
          />
        </div>
        <VpnPanel>
          <VpnPanelHeader
            title="Campaign performance"
            description="Clicks, leads, and sales by campaign"
          />
          <div className="divide-border-subtle divide-y">
            {[...campaigns]
              .sort((a, b) => b.clicks - a.clicks)
              .map((campaign) => (
                <div
                  key={campaign.id}
                  className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_repeat(3,100px)] sm:items-center"
                >
                  <span className="text-content-emphasis truncate text-sm font-medium">
                    {campaign.title ||
                      campaign.utm_campaign ||
                      campaign.shortLink}
                  </span>
                  <span className="text-sm">{campaign.clicks} clicks</span>
                  <span className="text-sm">{campaign.leads} leads</span>
                  <span className="text-sm">{campaign.sales} sales</span>
                </div>
              ))}
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
