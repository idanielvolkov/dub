import { getGrowthWorkspace } from "@/lib/growth/get-growth-workspace";
import { PageContent } from "@/ui/layout/page-content";
import { PageWidthWrapper } from "@/ui/layout/page-width-wrapper";
import { VpnStats } from "@/ui/vpn/vpn-ui";
import { CardList, CardListCard, EmptyState } from "@dub/ui";
import { ChartLine } from "@dub/ui/icons";

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
      title="Analytics"
      titleInfo={{ title: "Marketing funnel and campaign performance." }}
    >
      <PageWidthWrapper className="pb-10">
        <VpnStats
          className="mb-6"
          items={[
            {
              label: "Visit → lead",
              value: `${clicks ? ((leads / clicks) * 100).toFixed(1) : "0.0"}%`,
              detail: `${clicks} visits`,
            },
            {
              label: "Lead → sale",
              value: `${leads ? ((sales / leads) * 100).toFixed(1) : "0.0"}%`,
              detail: `${leads} leads`,
            },
            {
              label: "Revenue",
              value: `$${(Number(totals._sum.saleAmount || 0) / 100).toLocaleString()}`,
              detail: `${sales} sales`,
            },
          ]}
        />
        <section>
          <div className="mb-3">
            <h2 className="text-content-emphasis text-sm font-semibold">
              Campaign performance
            </h2>
            <p className="text-content-subtle text-sm">
              Clicks, leads, and sales by campaign
            </p>
          </div>
          <CardList variant="compact">
            {[...campaigns]
              .sort((a, b) => b.clicks - a.clicks)
              .map((campaign) => (
                <CardListCard key={campaign.id} hoverStateEnabled={false}>
                  <div className="grid gap-3 sm:grid-cols-[1fr_repeat(3,100px)] sm:items-center">
                    <span className="text-content-emphasis truncate text-sm font-medium">
                      {campaign.title ||
                        campaign.utm_campaign ||
                        campaign.shortLink}
                    </span>
                    <span className="text-sm">{campaign.clicks} clicks</span>
                    <span className="text-sm">{campaign.leads} leads</span>
                    <span className="text-sm">{campaign.sales} sales</span>
                  </div>
                </CardListCard>
              ))}
          </CardList>
          {!campaigns.length && (
            <div className="py-12">
              <EmptyState
                icon={ChartLine}
                title="No campaign analytics"
                description="Performance data will appear after a campaign receives traffic."
              />
            </div>
          )}
        </section>
      </PageWidthWrapper>
    </PageContent>
  );
}
