import { getGrowthWorkspace } from "@/lib/growth/get-growth-workspace";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnMetricCard, VpnPanel, VpnPanelHeader } from "@/ui/vpn/vpn-ui";

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { totals, campaigns } = await getGrowthWorkspace(slug);
  const leads = totals._sum.leads || 0;
  const sales = totals._sum.sales || 0;
  return (
    <PageContent
      title="Leads"
      titleInfo={{ title: "Attributed prospects and conversions by campaign." }}
    >
      <PageWidthWrapper className="pb-10">
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <VpnMetricCard
            label="Leads"
            value={leads}
            detail="Total attributed prospects"
          />
          <VpnMetricCard
            label="Converted"
            value={sales}
            detail="Attributed sales"
          />
          <VpnMetricCard
            label="Conversion"
            value={`${leads ? ((sales / leads) * 100).toFixed(1) : "0.0"}%`}
            detail="Lead-to-sale rate"
          />
        </div>
        <VpnPanel>
          <VpnPanelHeader
            title="Lead sources"
            description="Campaigns ranked by generated leads"
          />
          <div className="divide-border-subtle divide-y">
            {[...campaigns]
              .sort((a, b) => b.leads - a.leads)
              .map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex min-h-14 items-center justify-between gap-4 px-5"
                >
                  <span className="text-content-emphasis truncate text-sm font-medium">
                    {campaign.title ||
                      campaign.utm_campaign ||
                      campaign.shortLink}
                  </span>
                  <span className="text-content-subtle text-sm">
                    {campaign.leads} leads · {campaign.sales} sales
                  </span>
                </div>
              ))}
          </div>
        </VpnPanel>
      </PageWidthWrapper>
    </PageContent>
  );
}
